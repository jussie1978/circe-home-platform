import * as THREE from 'three/webgpu';
import {
  Fn,
  If,
  color,
  cos,
  float,
  hash,
  instanceIndex,
  instancedArray,
  mix,
  sin,
  uint,
  uniform,
  uv,
  vec3,
  vec4,
} from 'three/tsl';
import './style.css';

type PresenceState = 'idle' | 'listening';

const PARTICLE_COUNT = 32_768;
const NETWORK_NODE_COUNT = 128;
const FIXED_STEP = 1 / 60;
const MAX_SUBSTEPS = 4;
const REDUCED_STEP_INTERVAL = 1 / 24;

const sceneHost = requireElement<HTMLDivElement>('scene');
const backendElement = requireElement<HTMLElement>('backend');
const fpsElement = requireElement<HTMLElement>('fps');
const frameTimeElement = requireElement<HTMLElement>('frame-time');
const networkElement = requireElement<HTMLElement>('network');
const stateElement = requireElement<HTMLElement>('state-label');
const errorElement = requireElement<HTMLDivElement>('error');
const fullscreenButton = requireElement<HTMLButtonElement>('fullscreen');
const stateButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-state]')];

let presenceState: PresenceState = 'idle';
let stateBlendTarget = 0;
let pointerEnergy = 0;
let disposed = false;

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = reducedMotionQuery.matches;

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);
camera.position.set(0, 0.18, 8.7);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#030608');
scene.fog = new THREE.FogExp2('#030608', 0.052);

const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('#030608', 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
sceneHost.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight('#80aab2', 0.62);
const keyLight = new THREE.PointLight('#fff0ce', 9, 12, 1.6);
keyLight.position.set(-1.7, 1.5, 3.2);
const coolLight = new THREE.PointLight('#2b9cb0', 4, 10, 1.8);
coolLight.position.set(2.4, -1.1, 1.5);
scene.add(ambient, keyLight, coolLight);

const nucleus = createNucleus();
scene.add(nucleus.group);

const network = createSparseNetwork();
scene.add(network.group);
networkElement.textContent = `${NETWORK_NODE_COUNT} / ${network.connectionCount}`;

const simulationTime = uniform(0);
const simulationDelta = uniform(FIXED_STEP);
const stateBlend = uniform(0);
const pointerPosition = uniform(new THREE.Vector3(1.5, 0.4, 0));
const pointerStrength = uniform(0);
const reducedMotionUniform = uniform(reducedMotion ? 1 : 0);

const positionBuffer = instancedArray(PARTICLE_COUNT, 'vec3');
const velocityBuffer = instancedArray(PARTICLE_COUNT, 'vec3');

const initializeParticles = Fn(() => {
  const position = positionBuffer.element(instanceIndex);
  const velocity = velocityBuffer.element(instanceIndex);
  const seedA = hash(instanceIndex.add(uint(0x19a35f)));
  const seedB = hash(instanceIndex.add(uint(0x73bc91)));
  const seedC = hash(instanceIndex.add(uint(0xc4512d)));
  const cohort = hash(instanceIndex.add(uint(0x41f273)));
  const phi = seedA.mul(Math.PI * 2);
  const z = seedB.mul(2).sub(1);
  const radial = seedC.pow(0.48);
  const planar = float(1).sub(z.mul(z)).max(0).sqrt();
  const direction = vec3(planar.mul(cos(phi)), z, planar.mul(sin(phi)));
  const radius = float(1.35).toVar();

  If(cohort.greaterThanEqual(0.7), () => {
    radius.assign(mix(1.7, 3.15, seedC));
  });
  If(cohort.greaterThanEqual(0.9), () => {
    radius.assign(mix(3.4, 5.4, seedC));
  });

  const asymmetry = vec3(
    float(1.08).add(seedB.mul(0.22)),
    float(0.72).add(seedA.mul(0.24)),
    float(0.82).add(seedC.mul(0.34)),
  );
  const lobe = vec3(
    sin(phi.mul(2.3)).mul(0.28),
    sin(phi.mul(1.4).add(z.mul(2))).mul(0.2),
    cos(phi.mul(1.7)).mul(0.18),
  );
  position.assign(direction.mul(radius.mul(radial)).mul(asymmetry).add(lobe).add(vec3(-0.16, 0.08, 0)));
  velocity.assign(direction.cross(vec3(0.23, 1, 0.14)).mul(mix(0.03, 0.12, seedA)).add(lobe.mul(0.025)));
});

const updateParticles = Fn(() => {
  const position = positionBuffer.element(instanceIndex);
  const velocity = velocityBuffer.element(instanceIndex);
  const seed = hash(instanceIndex.add(uint(0x91e2d7)));
  const cohort = hash(instanceIndex.add(uint(0x41f273)));
  const radius = position.length().max(0.001);
  const directionToCore = position.negate().div(radius);
  const t = simulationTime;

  const flow = vec3(
    sin(position.y.mul(1.21).add(t.mul(0.31))).sub(cos(position.z.mul(0.83).sub(t.mul(0.23)))),
    sin(position.z.mul(1.33).add(t.mul(0.27))).sub(cos(position.x.mul(1.07).add(t.mul(0.19)))),
    sin(position.x.mul(0.93).sub(t.mul(0.21))).sub(cos(position.y.mul(1.17).add(t.mul(0.25)))),
  );

  const force = flow.mul(mix(0.16, 0.29, seed)).toVar();
  const corePull = float(0.34).mul(mix(1, 0.44, cohort.smoothstep(0.68, 0.96)));
  force.addAssign(directionToCore.mul(corePull).mul(float(0.7).add(stateBlend.mul(0.36))));

  const softBoundary = radius.sub(mix(2.1, 4.5, cohort.smoothstep(0.66, 0.96))).max(0);
  force.addAssign(directionToCore.mul(softBoundary.mul(0.42)));

  const attentionDirection = pointerPosition.normalize();
  const forwardness = position.normalize().dot(attentionDirection).mul(0.5).add(0.5);
  const listeningFlow = attentionDirection.mul(forwardness.mul(0.3).add(0.08));
  const listeningCurl = attentionDirection.cross(position).normalize().mul(0.08);
  force.addAssign(listeningFlow.add(listeningCurl).mul(stateBlend).mul(mix(0.45, 1, seed)));

  const toPointer = pointerPosition.sub(position);
  const pointerDistance = toPointer.length().max(0.05);
  const localInfluence = float(1).sub(pointerDistance.div(1.55)).max(0).pow(2).mul(pointerStrength);
  const localDirection = toPointer.div(pointerDistance);
  const localSwirl = localDirection.cross(vec3(0.1, 0.25, 1)).normalize();
  const localResponse = mix(localSwirl, localDirection, stateBlend.mul(0.62).add(0.18));
  force.addAssign(localResponse.mul(localInfluence).mul(mix(0.12, 0.7, seed)));

  const calmFactor = float(1).sub(reducedMotionUniform.mul(0.64));
  velocity.addAssign(force.mul(simulationDelta).mul(calmFactor));
  velocity.mulAssign(float(0.987).sub(stateBlend.mul(0.002)));

  const maxSpeed = mix(0.46, 0.68, stateBlend).mul(calmFactor).add(0.08);
  If(velocity.length().greaterThan(maxSpeed), () => {
    velocity.assign(velocity.normalize().mul(maxSpeed));
  });
  position.addAssign(velocity.mul(simulationDelta));
});

const initCompute = initializeParticles().compute(PARTICLE_COUNT).setName('Initialize cognitive field');
const updateCompute = updateParticles().compute(PARTICLE_COUNT).setName('Update cognitive field');

const particleMaterial = new THREE.SpriteNodeMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
particleMaterial.positionNode = positionBuffer.toAttribute();
particleMaterial.scaleNode = mix(0.009, 0.022, hash(instanceIndex.add(uint(0x8b153d))));
particleMaterial.colorNode = Fn(() => {
  const speed = velocityBuffer.toAttribute().length();
  const depth = positionBuffer.toAttribute().z.mul(0.11).add(0.5).max(0).min(1);
  const cyan = color('#178b9a');
  const petrol = color('#0b4d5c');
  const violet = color('#70548f');
  const baseColor = mix(petrol, cyan, depth);
  const finalColor = mix(baseColor, violet, speed.smoothstep(0.22, 0.62).mul(0.58));
  const disc = float(1).sub(uv().sub(0.5).length().mul(2)).max(0).smoothstep(0, 0.72);
  return vec4(finalColor, disc.mul(0.46));
})();

const particleGeometry = new THREE.PlaneGeometry(1, 1);
const particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, PARTICLE_COUNT);
particleMesh.frustumCulled = false;
scene.add(particleMesh);

let rendererInitialized = false;
let simulationSeconds = 0;
let accumulator = 0;
let lastFrameTime = performance.now() / 1000;
let metricStart = performance.now();
let metricFrames = 0;
let lastReducedRender = 0;

async function start(): Promise<void> {
  try {
    await renderer.init();
    rendererInitialized = true;
    backendElement.textContent = getBackendLabel(renderer);
    await renderer.computeAsync(initCompute);
    renderer.setAnimationLoop(animate);
  } catch (error) {
    showError(error);
    dispose();
  }
}

function animate(milliseconds: number): void {
  if (disposed) return;

  const now = milliseconds / 1000;
  const realDelta = Math.min(Math.max(now - lastFrameTime, 0), FIXED_STEP * MAX_SUBSTEPS);
  lastFrameTime = now;
  accumulator = Math.min(accumulator + realDelta, FIXED_STEP * MAX_SUBSTEPS);

  stateBlend.value = THREE.MathUtils.damp(stateBlend.value, stateBlendTarget, 4.2, realDelta);
  pointerEnergy = THREE.MathUtils.damp(pointerEnergy, 0, 1.8, realDelta);
  pointerStrength.value = pointerEnergy;

  let substeps = 0;
  while (accumulator >= FIXED_STEP && substeps < MAX_SUBSTEPS) {
    simulationSeconds += FIXED_STEP;
    simulationTime.value = simulationSeconds;
    simulationDelta.value = FIXED_STEP;
    renderer.compute(updateCompute);
    accumulator -= FIXED_STEP;
    substeps += 1;
  }

  if (!reducedMotion || now - lastReducedRender >= REDUCED_STEP_INTERVAL) {
    updateNucleus(nucleus, now, stateBlend.value, reducedMotion);
    updateNetwork(network, now, realDelta, stateBlend.value, pointerPosition.value, reducedMotion);
    renderer.render(scene, camera);
    lastReducedRender = now;
    updateMetrics(milliseconds);
  }
}

function createNucleus(): { group: THREE.Group; heart: THREE.Mesh; mantle: THREE.Mesh; halo: THREE.Mesh } {
  const group = new THREE.Group();
  group.position.set(-0.12, 0.06, 0.16);

  const heart = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.24, 5),
    new THREE.MeshPhysicalMaterial({ color: '#f2e8d5', roughness: 0.24, metalness: 0.04, emissive: '#7a4219', emissiveIntensity: 0.3 }),
  );
  const mantle = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.34, 4),
    new THREE.MeshPhysicalMaterial({ color: '#d9e4df', roughness: 0.34, transmission: 0.22, transparent: true, opacity: 0.36, depthWrite: false }),
  );
  const halo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.49, 3),
    new THREE.MeshBasicMaterial({ color: '#b87945', transparent: true, opacity: 0.035, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  group.add(halo, mantle, heart);
  return { group, heart, mantle, halo };
}

function updateNucleus(core: ReturnType<typeof createNucleus>, time: number, listening: number, reduced: boolean): void {
  const motionScale = reduced ? 0.3 : 1;
  const breath = 1 + Math.sin(time * 0.82) * 0.025 * motionScale + listening * 0.035;
  core.heart.scale.setScalar(breath);
  core.mantle.scale.setScalar(1 + Math.sin(time * 0.67 + 1.2) * 0.035 * motionScale + listening * 0.06);
  core.halo.scale.setScalar(1 + Math.sin(time * 0.44 + 2.1) * 0.07 * motionScale + listening * 0.1);
  core.group.rotation.y = Math.sin(time * 0.19) * 0.11 * motionScale;
  core.group.rotation.x = Math.cos(time * 0.16) * 0.07 * motionScale;
}

function createSparseNetwork(): {
  group: THREE.Group;
  nodes: THREE.Points;
  lines: THREE.LineSegments;
  basePositions: Float32Array;
  nodePositions: Float32Array;
  connectionPairs: Uint16Array;
  connectionCount: number;
} {
  const group = new THREE.Group();
  const basePositions = new Float32Array(NETWORK_NODE_COUNT * 3);
  const nodePositions = new Float32Array(NETWORK_NODE_COUNT * 3);

  for (let index = 0; index < NETWORK_NODE_COUNT; index += 1) {
    const band = index / NETWORK_NODE_COUNT;
    const angle = index * 2.399963 + Math.sin(index * 12.71) * 0.38;
    const radius = band < 0.7 ? 1.1 + seeded(index, 1) * 1.25 : band < 0.9 ? 2.2 + seeded(index, 2) * 1.25 : 3.4 + seeded(index, 3) * 1.5;
    const offset = index * 3;
    basePositions[offset] = Math.cos(angle) * radius * (0.72 + seeded(index, 4) * 0.5) - 0.15;
    basePositions[offset + 1] = (seeded(index, 5) - 0.5) * radius * 1.08 + Math.sin(angle * 1.7) * 0.28;
    basePositions[offset + 2] = Math.sin(angle) * radius * 0.72 + (seeded(index, 6) - 0.5) * 0.8;
  }
  nodePositions.set(basePositions);

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  const nodeMaterial = new THREE.PointsMaterial({ color: '#64aeb7', size: 0.023, transparent: true, opacity: 0.46, depthWrite: false, blending: THREE.AdditiveBlending });
  const nodes = new THREE.Points(nodeGeometry, nodeMaterial);

  const connectionPairs = buildConnectionPairs(basePositions);
  const linePositions = new Float32Array(connectionPairs.length * 3);
  const lineColors = new Float32Array(connectionPairs.length * 3);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.19, depthWrite: false, blending: THREE.AdditiveBlending });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lines, nodes);

  return { group, nodes, lines, basePositions, nodePositions, connectionPairs, connectionCount: connectionPairs.length / 2 };
}

function buildConnectionPairs(positions: Float32Array): Uint16Array {
  const pairs: number[] = [];
  const cells = new Map<string, number[]>();
  const cellSize = 1.2;

  for (let index = 0; index < NETWORK_NODE_COUNT; index += 1) {
    const offset = index * 3;
    const key = `${Math.floor((positions[offset] ?? 0) / cellSize)},${Math.floor((positions[offset + 1] ?? 0) / cellSize)},${Math.floor((positions[offset + 2] ?? 0) / cellSize)}`;
    const bucket = cells.get(key) ?? [];
    bucket.push(index);
    cells.set(key, bucket);
  }

  for (const bucket of cells.values()) {
    for (let index = 1; index < bucket.length && pairs.length < 210; index += 1) {
      if (seeded(bucket[index] ?? 0, index) > 0.34) pairs.push(bucket[index - 1] ?? 0, bucket[index] ?? 0);
    }
  }

  for (let index = 0; pairs.length < 176 && index < NETWORK_NODE_COUNT; index += 1) {
    const target = (index + 7 + Math.floor(seeded(index, 11) * 17)) % NETWORK_NODE_COUNT;
    if (seeded(index, 12) > 0.48) pairs.push(index, target);
  }
  return new Uint16Array(pairs);
}

function updateNetwork(
  net: ReturnType<typeof createSparseNetwork>,
  time: number,
  delta: number,
  listening: number,
  attention: THREE.Vector3,
  reduced: boolean,
): void {
  const motion = reduced ? 0.25 : 1;
  const attentionDirection = attention.clone().normalize();
  for (let index = 0; index < NETWORK_NODE_COUNT; index += 1) {
    const offset = index * 3;
    const bx = net.basePositions[offset] ?? 0;
    const by = net.basePositions[offset + 1] ?? 0;
    const bz = net.basePositions[offset + 2] ?? 0;
    const phase = index * 0.731;
    const listenWeight = listening * (0.16 + seeded(index, 19) * 0.3);
    const concentration = 1 - listening * (0.035 + seeded(index, 23) * 0.075);
    net.nodePositions[offset] = bx * concentration + Math.sin(time * 0.21 + phase) * 0.14 * motion + attentionDirection.x * listenWeight;
    net.nodePositions[offset + 1] = by * concentration + Math.cos(time * 0.17 + phase * 1.3) * 0.11 * motion + attentionDirection.y * listenWeight;
    net.nodePositions[offset + 2] = bz * concentration + Math.sin(time * 0.19 + phase * 0.7) * 0.13 * motion + attentionDirection.z * listenWeight;
  }
  (net.nodes.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

  const lineAttribute = net.lines.geometry.getAttribute('position') as THREE.BufferAttribute;
  const colorAttribute = net.lines.geometry.getAttribute('color') as THREE.BufferAttribute;
  const lineArray = lineAttribute.array as Float32Array;
  const colorArray = colorAttribute.array as Float32Array;
  for (let pair = 0; pair < net.connectionPairs.length; pair += 2) {
    const a = (net.connectionPairs[pair] ?? 0) * 3;
    const b = (net.connectionPairs[pair + 1] ?? 0) * 3;
    const output = pair * 3;
    lineArray[output] = net.nodePositions[a] ?? 0;
    lineArray[output + 1] = net.nodePositions[a + 1] ?? 0;
    lineArray[output + 2] = net.nodePositions[a + 2] ?? 0;
    lineArray[output + 3] = net.nodePositions[b] ?? 0;
    lineArray[output + 4] = net.nodePositions[b + 1] ?? 0;
    lineArray[output + 5] = net.nodePositions[b + 2] ?? 0;
    const connectionIndex = pair / 2;
    const visibility = THREE.MathUtils.smoothstep(
      Math.sin(time * (0.11 + seeded(connectionIndex, 28) * 0.09) + seeded(connectionIndex, 29) * Math.PI * 2),
      -0.35,
      0.72,
    );
    const cyan = 0.24 + listening * 0.12;
    const brightness = visibility * (0.34 + listening * 0.22);
    colorArray[output] = cyan * brightness;
    colorArray[output + 1] = 0.68 * brightness;
    colorArray[output + 2] = 0.74 * brightness;
    colorArray[output + 3] = colorArray[output] ?? 0;
    colorArray[output + 4] = colorArray[output + 1] ?? 0;
    colorArray[output + 5] = colorArray[output + 2] ?? 0;
  }
  lineAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
  const material = net.lines.material as THREE.LineBasicMaterial;
  const targetOpacity = 0.08 + listening * 0.1 + Math.sin(time * 0.27) * 0.015;
  material.opacity = THREE.MathUtils.damp(material.opacity, targetOpacity, 1.2, delta);
}

function setState(nextState: PresenceState): void {
  presenceState = nextState;
  stateBlendTarget = nextState === 'listening' ? 1 : 0;
  stateElement.textContent = nextState.toUpperCase();
  for (const button of stateButtons) button.setAttribute('aria-pressed', String(button.dataset.state === nextState));
}

function handlePointer(event: PointerEvent): void {
  const rect = renderer.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
  const target = new THREE.Vector3(ndc.x, ndc.y, 0.35).unproject(camera);
  const direction = target.sub(camera.position).normalize();
  const distance = -camera.position.z / direction.z;
  pointerPosition.value.copy(camera.position).add(direction.multiplyScalar(distance));
  pointerPosition.value.z = 0;
  pointerEnergy = presenceState === 'listening' ? 1 : 0.62;
}

function handleKey(event: KeyboardEvent): void {
  if (event.repeat) return;
  if (event.key === '1') setState('idle');
  if (event.key === '2') setState('listening');
  if (event.key.toLowerCase() === 'f') void toggleFullscreen();
}

async function toggleFullscreen(): Promise<void> {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
}

function handleResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleReducedMotion(event: MediaQueryListEvent): void {
  reducedMotion = event.matches;
  reducedMotionUniform.value = reducedMotion ? 1 : 0;
}

function updateMetrics(milliseconds: number): void {
  metricFrames += 1;
  const elapsed = milliseconds - metricStart;
  if (elapsed < 500) return;
  const fps = (metricFrames * 1000) / elapsed;
  fpsElement.textContent = fps.toFixed(0);
  frameTimeElement.textContent = `${(elapsed / metricFrames).toFixed(2)} ms`;
  metricFrames = 0;
  metricStart = milliseconds;
}

function getBackendLabel(webgpuRenderer: THREE.WebGPURenderer): string {
  const backend = (webgpuRenderer as unknown as { backend?: { constructor?: { name?: string }; isWebGPUBackend?: boolean } }).backend;
  if (backend?.isWebGPUBackend) return 'WEBGPU';
  return backend?.constructor?.name?.replace('Backend', '').toUpperCase() ?? 'DESCONHECIDO';
}

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento obrigatório ausente: #${id}`);
  return element as T;
}

function showError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  errorElement.textContent = `Não foi possível iniciar o renderer WebGPU: ${message}. Use um navegador com WebGPU habilitado.`;
  errorElement.hidden = false;
  backendElement.textContent = 'INDISPONÍVEL';
}

function dispose(): void {
  if (disposed) return;
  disposed = true;
  if (rendererInitialized) renderer.setAnimationLoop(null);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKey);
  renderer.domElement.removeEventListener('pointermove', handlePointer);
  renderer.domElement.removeEventListener('pointerdown', handlePointer);
  reducedMotionQuery.removeEventListener('change', handleReducedMotion);
  fullscreenButton.removeEventListener('click', toggleFullscreen);
  for (const button of stateButtons) button.removeEventListener('click', handleStateButton);

  particleGeometry.dispose();
  particleMaterial.dispose();
  positionBuffer.dispose();
  velocityBuffer.dispose();
  nucleus.heart.geometry.dispose();
  nucleus.mantle.geometry.dispose();
  nucleus.halo.geometry.dispose();
  (nucleus.heart.material as THREE.Material).dispose();
  (nucleus.mantle.material as THREE.Material).dispose();
  (nucleus.halo.material as THREE.Material).dispose();
  network.nodes.geometry.dispose();
  (network.nodes.material as THREE.Material).dispose();
  network.lines.geometry.dispose();
  (network.lines.material as THREE.Material).dispose();
  if (rendererInitialized) renderer.dispose();
}

function handleStateButton(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const nextState = button.dataset.state;
  if (nextState === 'idle' || nextState === 'listening') setState(nextState);
}

window.addEventListener('resize', handleResize);
window.addEventListener('keydown', handleKey);
window.addEventListener('pagehide', dispose, { once: true });
renderer.domElement.addEventListener('pointermove', handlePointer, { passive: true });
renderer.domElement.addEventListener('pointerdown', handlePointer, { passive: true });
reducedMotionQuery.addEventListener('change', handleReducedMotion);
fullscreenButton.addEventListener('click', toggleFullscreen);
for (const button of stateButtons) button.addEventListener('click', handleStateButton);

void start();
