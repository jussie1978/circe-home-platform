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
  smoothstep,
  uint,
  uniform,
  vec3,
  vec4,
  uv,
} from 'three/tsl';

export const PARTICLE_COUNT = 32_768;
const FIXED_STEP_SECONDS = 1 / 60;
const MAX_SUBSTEPS = 4;
const MAX_ACCUMULATED_SECONDS = FIXED_STEP_SECONDS * MAX_SUBSTEPS;

// Técnica orientada pelo exemplo oficial Three.js r184:
// https://github.com/mrdoob/three.js/blob/r184/examples/webgpu_tsl_compute_attractors_particles.html
export class ParticleField {
  readonly mesh: THREE.InstancedMesh;
  readonly stateMix = uniform(0);
  readonly motionScale = uniform(1);

  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.SpriteNodeMaterial;
  private readonly basePositionBuffer = instancedArray(PARTICLE_COUNT, 'vec3');
  private readonly positionBuffer = instancedArray(PARTICLE_COUNT, 'vec3');
  private readonly velocityBuffer = instancedArray(PARTICLE_COUNT, 'vec3');
  private readonly proceduralTime = uniform(0);
  private readonly initCompute: THREE.ComputeNode;
  private readonly updateCompute: THREE.ComputeNode;
  private accumulatedSeconds = 0;
  private proceduralSeconds = 0;

  constructor() {
    const maxSpeed = mix(float(0.38), float(0.78), this.stateMix);

    const initialize = Fn(() => {
      const basePosition = this.basePositionBuffer.element(instanceIndex);
      const position = this.positionBuffer.element(instanceIndex);
      const velocity = this.velocityBuffer.element(instanceIndex);

      const randomDirection = vec3(
        hash(instanceIndex.add(uint(11))),
        hash(instanceIndex.add(uint(29))),
        hash(instanceIndex.add(uint(47))),
      ).sub(0.5).normalize();

      const radius = hash(instanceIndex.add(uint(71))).mul(1.75).add(0.35);
      const initialPosition = randomDirection.mul(radius);
      basePosition.assign(initialPosition);
      position.assign(initialPosition);

      const tangent = vec3(
        randomDirection.y.negate(),
        randomDirection.x,
        hash(instanceIndex.add(uint(97))).sub(0.5).mul(0.35),
      ).normalize();

      const initialSpeed = hash(instanceIndex.add(uint(131))).mul(0.08).add(0.025);
      velocity.assign(tangent.mul(initialSpeed));
    });

    this.initCompute = initialize().compute(PARTICLE_COUNT).setName('Initialize CIRCE particles');

    const update = Fn(() => {
      const basePosition = this.basePositionBuffer.element(instanceIndex);
      const position = this.positionBuffer.element(instanceIndex);
      const velocity = this.velocityBuffer.element(instanceIndex);
      const delta = float(FIXED_STEP_SECONDS).mul(this.motionScale);

      const shapeSeed = hash(instanceIndex.add(uint(211)));
      const depthSeed = hash(instanceIndex.add(uint(239)));
      const driftSeed = hash(instanceIndex.add(uint(271)));

      const phase = shapeSeed.mul(Math.PI * 2);
      const proceduralOffset = vec3(
        sin(this.proceduralTime.mul(0.55).add(phase)),
        cos(this.proceduralTime.mul(0.47).add(depthSeed.mul(Math.PI * 2))),
        sin(this.proceduralTime.mul(0.39).add(driftSeed.mul(Math.PI * 2))),
      ).mul(shapeSeed.mul(0.012).add(0.012));
      const idleTarget = basePosition.add(proceduralOffset);

      const apertureX = basePosition.x.sub(0.07);
      const apertureY = basePosition.y.add(0.035);
      const apertureRadius = vec3(apertureX.mul(1.08), apertureY.mul(0.91), 0).length();
      const centralInfluence = smoothstep(float(0.12), float(1.05), apertureRadius).oneMinus();
      const frontInfluence = smoothstep(
        float(-0.12),
        float(1.35),
        basePosition.z.add(shapeSeed.sub(0.5).mul(0.18)),
      );
      const deformationWeight = centralInfluence
        .mul(frontInfluence)
        .mul(shapeSeed.mul(0.55).add(0.25));
      const apertureDirection = vec3(
        apertureX.add(shapeSeed.sub(0.5).mul(0.035)),
        apertureY.add(driftSeed.sub(0.5).mul(0.035)),
        0,
      ).normalize();
      const lateralDeformation = apertureDirection.mul(
        deformationWeight.mul(shapeSeed.mul(0.1).add(0.12)),
      );
      const depthDeformation = vec3(
        0,
        0,
        deformationWeight.mul(depthSeed.mul(0.24).add(0.28)).negate(),
      );
      const asymmetricDeformation = vec3(
        shapeSeed.sub(0.5).mul(0.035),
        driftSeed.sub(0.5).mul(0.025),
        0,
      ).mul(centralInfluence.mul(frontInfluence));
      const listeningTarget = basePosition
        .add(proceduralOffset)
        .add(lateralDeformation)
        .add(depthDeformation)
        .add(asymmetricDeformation);
      const target = mix(idleTarget, listeningTarget, this.stateMix);
      const springStrength = mix(float(7), float(8.5), this.stateMix);

      // A mola usa sempre o alvo derivado da âncora imutável, eliminando deriva histórica.
      velocity.addAssign(target.sub(position).mul(springStrength).mul(delta));
      velocity.mulAssign(mix(float(0.94), float(0.95), this.stateMix));

      const speed = velocity.length();
      If(speed.greaterThan(maxSpeed), () => {
        velocity.assign(velocity.normalize().mul(maxSpeed));
      });

      position.addAssign(velocity.mul(delta));
    });

    this.updateCompute = update().compute(PARTICLE_COUNT).setName('Update CIRCE particles');

    this.material = new THREE.SpriteNodeMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    this.material.positionNode = this.positionBuffer.toAttribute();
    this.material.colorNode = Fn(() => {
      const velocity = this.velocityBuffer.toAttribute();
      const energy = velocity.length().div(maxSpeed).clamp(0, 1);
      const idleColor = color('#68b9d2');
      const listeningColor = color('#9a8cc8');
      const finalColor = mix(idleColor, listeningColor, this.stateMix)
        .mul(energy.mul(0.42).add(0.38));
      const opacity = energy.mul(0.18).add(0.1);
      return vec4(finalColor, opacity);
    })();

    const spriteRadius = uv().sub(0.5).mul(2).length();
    this.material.opacityNode = smoothstep(float(0.16), float(1), spriteRadius).oneMinus().pow(1.35);
    this.material.alphaTest = 0.012;

    const randomScale = hash(instanceIndex.add(uint(173))).mul(0.75).add(0.55);
    this.material.scaleNode = mix(float(0.018), float(0.027), this.stateMix).mul(randomScale);

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, PARTICLE_COUNT);
    this.mesh.frustumCulled = false;
    this.mesh.name = 'CIRCE particle presence';
  }

  initialize(renderer: THREE.WebGPURenderer): void {
    this.accumulatedSeconds = 0;
    this.proceduralSeconds = 0;
    this.proceduralTime.value = 0;
    renderer.compute(this.initCompute);
  }

  advance(renderer: THREE.WebGPURenderer, elapsedSeconds: number): void {
    const safeElapsed = Number.isFinite(elapsedSeconds)
      ? THREE.MathUtils.clamp(elapsedSeconds, 0, MAX_ACCUMULATED_SECONDS)
      : 0;

    this.proceduralSeconds += safeElapsed * this.motionScale.value;
    this.proceduralTime.value = this.proceduralSeconds;

    // O acumulador desacopla a física da taxa de render e descarta pausas longas.
    this.accumulatedSeconds = Math.min(
      this.accumulatedSeconds + safeElapsed,
      MAX_ACCUMULATED_SECONDS,
    );

    let substeps = 0;
    while (this.accumulatedSeconds >= FIXED_STEP_SECONDS && substeps < MAX_SUBSTEPS) {
      renderer.compute(this.updateCompute);
      this.accumulatedSeconds -= FIXED_STEP_SECONDS;
      substeps += 1;
    }

    // Nunca carrega backlog suficiente para provocar spiral of death no frame seguinte.
    if (substeps === MAX_SUBSTEPS && this.accumulatedSeconds >= FIXED_STEP_SECONDS) {
      this.accumulatedSeconds %= FIXED_STEP_SECONDS;
    }
  }

  dispose(): void {
    this.accumulatedSeconds = 0;
    this.proceduralSeconds = 0;
    this.mesh.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
    this.initCompute.dispose();
    this.updateCompute.dispose();
    this.basePositionBuffer.dispose();
    this.positionBuffer.dispose();
    this.velocityBuffer.dispose();
    this.proceduralTime.dispose();
    this.stateMix.dispose();
    this.motionScale.dispose();
  }
}
