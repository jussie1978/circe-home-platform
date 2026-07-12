import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { create } from 'zustand';

// Store global Zustand para sincronizar o estado com o Dashboard e o WebSocket
interface IrisStore {
  temperature: number;
  irisState: 'idle' | 'listening' | 'speaking' | 'critical';
  setTemperature: (temp: number) => void;
  setIrisState: (state: 'idle' | 'listening' | 'speaking' | 'critical') => void;
  
  // Customização Visual R2.1 e R2.2
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string; // Terceira cor
  customThemeActive: boolean;
  rotationSpeed: number;
  physicsMode: 'gel' | 'mechanical' | 'liquid';
  repulsionStrength: number;
  starSpeed: number;
  glowIntensity: number;
  saturation: number;
  ringColorCustom: string; // Cor customizada do anel R2.2
  ringSpeed: number; // Velocidade de rotação do anel R2.2
  quaternaryColor: string; // Quarta cor manual R2.2
  quinaryColor: string; // Quinta cor manual R2.2
  senaryColor: string; // Sexta cor manual R2.2
  pulseSpeed: number; // Velocidade de pulsação das linhas de fuga R2.2
  activePanel: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null; // Sincronização Spatial UI
  setActivePanel: (panel: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null) => void;
  setFXConfig: (config: Partial<Omit<IrisStore, 'temperature' | 'irisState' | 'setTemperature' | 'setIrisState' | 'setFXConfig' | 'setActivePanel'>>) => void;
}

export const useIrisStore = create<IrisStore>((set) => ({
  temperature: 42,
  irisState: 'idle',
  setTemperature: (temp) => set({ temperature: temp }),
  setIrisState: (state) => set({ irisState: state }),
  
  // Defaults R2.2
  primaryColor: '#00f3ff', // ciano
  secondaryColor: '#00aaff', // azul claro
  tertiaryColor: '#d946ef', // rosa/magenta
  quaternaryColor: '#ff007f', // pink
  quinaryColor: '#ff5500', // laranja
  senaryColor: '#aaff00', // limão
  customThemeActive: false,
  rotationSpeed: 1.0,
  physicsMode: 'gel',
  repulsionStrength: 1.0,
  starSpeed: 1.0,
  glowIntensity: 1.2,
  saturation: 1.0,
  ringColorCustom: '#00f3ff', // ciano
  ringSpeed: 1.0,
  pulseSpeed: 1.0,
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  setFXConfig: (config) => set((state) => ({ ...state, ...config })),
}));

interface OrbCanvasProps {
  rotSpeed?: number;
}

// Lógica de cálculo de cores baseada no ADR-006 (Arco-íris dinâmico e estados IRIS)
function getZoneColor(
  angle: number, 
  mode: string, 
  temp: number, 
  customActive: boolean, 
  color1: THREE.Color, 
  color2: THREE.Color, 
  color3: THREE.Color, 
  color4: THREE.Color,
  color5: THREE.Color,
  color6: THREE.Color,
  saturation: number
): THREE.Color {
  let norm = (angle / (Math.PI * 2)) % 1;
  if (norm < 0) norm += 1; // Garante normalização positiva de 0 a 1 em JS (R2.2 corrigido)
  const color = new THREE.Color();

  if (customActive) {
    // Interpolar de forma fluida e cíclica entre as seis cores customizadas (arco-íris manual) e fechar de volta na primeira cor (miscigenação R2.2)
    if (norm < 0.166) {
      color.lerpColors(color1, color2, norm / 0.166);
    } else if (norm < 0.333) {
      color.lerpColors(color2, color3, (norm - 0.166) / 0.167);
    } else if (norm < 0.5) {
      color.lerpColors(color3, color4, (norm - 0.333) / 0.167);
    } else if (norm < 0.666) {
      color.lerpColors(color4, color5, (norm - 0.5) / 0.166);
    } else if (norm < 0.833) {
      color.lerpColors(color5, color6, (norm - 0.666) / 0.167);
    } else {
      color.lerpColors(color6, color1, (norm - 0.833) / 0.167);
    }
  } else if (mode === 'listening') {
    // Roxo profundo
    const h = 260 + norm * 40;
    color.setHSL(h / 360, 0.95, 0.45 + norm * 0.1);
  } else if (mode === 'speaking') {
    // Branco iridescente/ciano suave
    const h = 180 + norm * 60;
    color.setHSL(h / 360, 0.25, 0.85);
  } else if (mode === 'critical' || temp > 75) {
    // Vermelho crítico vibrante
    color.setHSL(0 / 360, 1.0, 0.5);
  } else {
    // IDLE padrão com as 7 cores do arco-íris em transição suave e miscigenada (R2.2 corrigido)
    // O norm varia de 0 a 1 em 360 graus, percorrendo o espectro HSL completo (Vermelho->Laranja->Amarelo->Verde->Azul->Violeta->Vermelho)
    const sat = 0.95;
    const lit = 0.52;
    color.setHSL(norm, sat, lit);
  }

  // Aplicar saturação customizada
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  color.setHSL(hsl.h, hsl.s * saturation, hsl.l);

  return color;
}

// Componente da Cena 3D principal (contém a renderização otimizada)
function OrbScene({ rotSpeed = 0.45 }: { rotSpeed: number }) {
  const { camera, raycaster, size } = useThree();
  const temperature = useIrisStore((state) => state.temperature);
  const irisState = useIrisStore((state) => state.irisState);
  
  // Customização Visual R2.2
  const primaryColor = useIrisStore((s) => s.primaryColor);
  const secondaryColor = useIrisStore((s) => s.secondaryColor);
  const tertiaryColor = useIrisStore((s) => s.tertiaryColor);
  const quaternaryColor = useIrisStore((s) => s.quaternaryColor);
  const quinaryColor = useIrisStore((s) => s.quinaryColor);
  const senaryColor = useIrisStore((s) => s.senaryColor);
  const customThemeActive = useIrisStore((s) => s.customThemeActive);
  const rotationSpeed = useIrisStore((s) => s.rotationSpeed);
  const physicsMode = useIrisStore((s) => s.physicsMode);
  const repulsionStrength = useIrisStore((s) => s.repulsionStrength);
  const starSpeed = useIrisStore((s) => s.starSpeed);
  const saturation = useIrisStore((s) => s.saturation);
  const ringColorCustom = useIrisStore((s) => s.ringColorCustom);
  const ringSpeed = useIrisStore((s) => s.ringSpeed);
  const pulseSpeed = useIrisStore((s) => s.pulseSpeed);
  const glowIntensity = useIrisStore((s) => s.glowIntensity);



  // Referências para os grupos de rotação
  const orbGroupRef = useRef<THREE.Group>(null);
  const rayGroupRef = useRef<THREE.Group>(null);

  // Instanced Meshes para os 3 tipos de barras (700 altas, 600 médias, 800 curtas)
  const tallInstRef = useRef<THREE.InstancedMesh>(null);
  const medInstRef = useRef<THREE.InstancedMesh>(null);
  const shortInstRef = useRef<THREE.InstancedMesh>(null);

  // Anel principal e Glow
  const ringRef = useRef<THREE.Points>(null);
  const centralVoidRef = useRef<THREE.Mesh>(null);
  const bgPtsRef = useRef<THREE.Points>(null);

  // Controle de interação com o mouse
  const mouse3D = useRef(new THREE.Vector3(999, 999, 0)); // inicia longe
  const isPointerInCanvas = useRef(false);

  const RING_R = 2.0;

  // Configuração inicial da câmera e renderizador
  useEffect(() => {
    const pCamera = camera as THREE.PerspectiveCamera;
    pCamera.position.z = 6.2;
    pCamera.fov = 55;
    pCamera.updateProjectionMatrix();
  }, [camera]);

  // Escutar eventos de ponteiro para rastrear o mouse em coordenadas 3D
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Normalizar coordenadas do ponteiro (-1 a +1)
      const x = (e.clientX / size.width) * 2 - 1;
      const y = -(e.clientY / size.height) * 2 + 1;
      
      // Projetar mouse no plano Z = 0
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const targetPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(targetPlane, intersectPoint);
      
      mouse3D.current.copy(intersectPoint);
      isPointerInCanvas.current = true;
    };

    const handlePointerLeave = () => {
      isPointerInCanvas.current = false;
      mouse3D.current.set(999, 999, 0); // afasta o cursor para desativar a física
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [camera, raycaster, size]);

  // 1. Criação das Geometrias com Gradientes de Vértice (Base Escura -> Topo Brilhante)
  const geometries = useMemo(() => {
    const createGradBoxGeo = (w: number, h: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      
      // Transladar a geometria para que o ponto pivô (ancoragem) seja a base da barra, não o centro
      geo.translate(0, h / 2, 0);

      const pos = geo.attributes.position as THREE.BufferAttribute;
      const colors = [];
      
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        // y varia de 0 (base transladada) até h (topo)
        const intensity = Math.max(0.1, Math.min(1.0, y / h)); // 0.1 na base, 1.0 no topo
        colors.push(intensity, intensity, intensity);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      return geo;
    };

    return {
      tall: createGradBoxGeo(0.045, 1.0, 0.045), // altura base 1.0 (escalaremos dinamicamente)
      med: createGradBoxGeo(0.03, 1.0, 0.03),
      short: createGradBoxGeo(0.02, 1.0, 0.02),
    };
  }, []);

  // 2. Materiais compartilhados habilitando cores de vértice e Blending Aditivo para efeito Glow
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.85,
    });
  }, []);

  // 3. Inicialização e posicionamento inicial das barras (geradas uma única vez)
  const bars = useMemo(() => {
    const generateBarData = (count: number, type: 'tall' | 'med' | 'short', rMin: number, rMax: number, zMax: number) => {
      const data = [];
      const dummy = new THREE.Object3D();

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rBase = rMin + Math.random() * (rMax - rMin);
        const zOff = (Math.random() - 0.5) * zMax;
        
        // Altura padrão baseada no tipo (reduzida em mais 10% adicionais R2.2 final)
        let baseHeight = 0.55;
        if (type === 'tall') baseHeight = 0.24 + Math.pow(Math.random(), 0.7) * 0.74;
        else if (type === 'med') baseHeight = 0.056 + Math.random() * 0.28;
        else baseHeight = 0.012 + Math.random() * 0.056;

        // Posição no anel
        const x = Math.cos(angle) * rBase;
        const y = Math.sin(angle) * rBase;

        dummy.position.set(x, y, zOff);
        
        // Fazer a barra apontar radialmente para fora
        dummy.lookAt(new THREE.Vector3(x * 2, y * 2, zOff));
        dummy.rotateX(Math.PI / 2); // Alinha o eixo Y da caixa na direção de saída

        dummy.updateMatrix();

        data.push({
          angle,
          rBase,
          baseHeight,
          zOff,
          anchorPos: new THREE.Vector3(x, y, zOff),
          currentPos: new THREE.Vector3(x, y, zOff),
          velocity: new THREE.Vector3(0, 0, 0),
          matrix: dummy.matrix.clone(),
          phase: Math.random() * Math.PI * 2,
          phaseSpd: 0.004 + Math.random() * 0.008, // Velocidade de pulso reduzida para maior maciez
          currentScaleY: 1.0, // Escala interpolada inicial
        });
      }
      return data;
    };

    return {
      tall: generateBarData(700, 'tall', RING_R - 0.08, RING_R + 0.08, 1.2),
      med: generateBarData(600, 'med', RING_R - 0.12, RING_R + 0.12, 1.6),
      short: generateBarData(800, 'short', RING_R - 0.25, RING_R + 0.35, 2.0),
    };
  }, []);

  // Geometria para o anel de partículas brilhantes (substituindo o Torus estático duro)
  const ringParticlesGeometry = useMemo(() => {
    const count = 550;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      // Leve ruído de espalhamento para um efeito cintilante e orgânico (não uma linha cortada com faca)
      const spreadR = RING_R + (Math.random() - 0.5) * 0.045;
      const spreadZ = (Math.random() - 0.5) * 0.08;
      positions[i * 3] = Math.cos(angle) * spreadR;
      positions[i * 3 + 1] = Math.sin(angle) * spreadR;
      positions[i * 3 + 2] = spreadZ;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // 4. Otimização de Linhas de Fuga (Agrupadas em 1 único LineSegments para renderização em 1 draw call)
  const rayLinesGeometry = useMemo(() => {
    const count = 1800;
    const positions: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const zOff = (Math.random() - 0.5) * 1.8;
      const startR = RING_R * (0.95 + Math.random() * 0.1);
      const endR = RING_R * (1.0 + Math.pow(Math.random(), 0.6) * 0.55); // Alcance reduzido em mais 10% adicionais R2.2 final

      const sx = Math.cos(angle) * startR;
      const sy = Math.sin(angle) * startR;
      const ex = Math.cos(angle) * endR;
      const ey = Math.sin(angle) * endR;
      const ez = zOff + (Math.random() - 0.5) * 0.3;

      // Vértice inicial (perto do anel)
      positions.push(sx, sy, zOff);
      // Vértice final (ponta)
      positions.push(ex, ey, ez);

      // Gradiente de cor nas linhas (Brilhante na base -> Escuro/Fade nas pontas)
      colors.push(1.0, 1.0, 1.0); // cor inicial
      colors.push(0.0, 0.0, 0.0); // cor final (fade-out na ponta)
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  const rayLinesMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.35,
    });
  }, []);

  // 5. Partículas de Fundo (Vórtice Espiral Cósmico)
  const { bgParticlesGeometry, particlesData } = useMemo(() => {
    const count = 880; // Aumentado em 10% (de 800 para 880 R2.2)
    const pPos = new Float32Array(count * 3);
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const initialAngle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.pow(Math.random(), 1.5) * 5.5; // Concentrado entre 2.0 e 7.5
      // Velocidade orbital bem suave baseada em tempo absoluto
      const speed = (0.012 + (1.0 / radius) * 0.028) * (Math.random() * 0.4 + 0.8);
      const initialZ = (Math.random() - 0.5) * 5.0;
      const zSpeed = (Math.random() - 0.5) * 0.04;
      const phase = Math.random() * Math.PI * 2;
      
      data.push({ initialAngle, radius, speed, initialZ, zSpeed, phase });
      
      pPos[i * 3] = Math.cos(initialAngle) * radius;
      pPos[i * 3 + 1] = Math.sin(initialAngle) * radius;
      pPos[i * 3 + 2] = initialZ;
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    return { bgParticlesGeometry: geo, particlesData: data };
  }, []);



  // 7. Loop de Animação em tempo real de altíssima performance (useFrame executando na GPU)
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const delta = Math.min(0.03, state.clock.getDelta()); // cap delta para evitar grandes saltos

    // Rotação dos grupos
    let currentSpeed = rotSpeed * rotationSpeed;
    if (irisState === 'critical') currentSpeed = rotSpeed * 3.5 * rotationSpeed;
    else if (irisState === 'listening') currentSpeed = rotSpeed * 0.3 * rotationSpeed;
    else if (irisState === 'speaking') currentSpeed = rotSpeed * 1.5 * rotationSpeed;
    else {
      // Ajuste de velocidade baseado na temperatura
      const speedShift = Math.max(0, (temperature - 50) / 25); // 0 a 1
      currentSpeed = rotSpeed * (1.0 + speedShift * 2.0) * rotationSpeed;
    }

    // Atualizar cores das barras a cada frame de acordo com a rotação de tempo e velocidade do slider (R2.2 corrigido)
    const updateColorsInFrame = (instMesh: THREE.InstancedMesh, data: any[]) => {
      // Instanciar objetos de cores uma única vez por frame no escopo do update (com fallbacks à prova de falhas)
      const color1 = new THREE.Color(primaryColor || '#00f3ff');
      const color2 = new THREE.Color(secondaryColor || '#00aaff');
      const color3 = new THREE.Color(tertiaryColor || '#d946ef');
      const color4 = new THREE.Color(quaternaryColor || '#ff007f');
      const color5 = new THREE.Color(quinaryColor || '#ff5500');
      const color6 = new THREE.Color(senaryColor || '#aaff00');

      for (let i = 0; i < data.length; i++) {
        // Rotacionar o ângulo da cor no sentido horário proporcional ao tempo acumulado e velocidade do slider
        const rotatedAngle = data[i].angle - elapsed * 0.42 * rotationSpeed;
        const color = getZoneColor(
          rotatedAngle, 
          irisState, 
          temperature, 
          customThemeActive, 
          color1, 
          color2, 
          color3, 
          color4, 
          color5, 
          color6, 
          saturation
        );
        instMesh.setColorAt(i, color);
      }
      if (instMesh.instanceColor) {
        instMesh.instanceColor.needsUpdate = true;
      }
    };

    if (tallInstRef.current) updateColorsInFrame(tallInstRef.current, bars.tall);
    if (medInstRef.current) updateColorsInFrame(medInstRef.current, bars.med);
    if (shortInstRef.current) updateColorsInFrame(shortInstRef.current, bars.short);

    if (orbGroupRef.current) {
      orbGroupRef.current.rotation.z -= currentSpeed * delta; // Gira no sentido horário ( -= )
      orbGroupRef.current.rotation.y = Math.sin(elapsed * 0.15) * 0.12;
      orbGroupRef.current.rotation.x = Math.cos(elapsed * 0.1) * 0.08;
    }

    if (rayGroupRef.current && orbGroupRef.current) {
      // Rotação em sentido contrário (contra-rotação) com velocidade sutil para criar paralaxe viva tridimensional
      rayGroupRef.current.rotation.z = orbGroupRef.current.rotation.z * -0.55;
      rayGroupRef.current.rotation.y = Math.cos(elapsed * 0.12) * 0.08;
      rayGroupRef.current.rotation.x = Math.sin(elapsed * 0.08) * 0.05;
      
      // Pulsação contínua da opacidade das linhas de fuga (acende/apaga 100% com base no pulseSpeed R2.2)
      if (rayLinesMaterial) {
        const baseOpacity = 0.22 + 0.23 * Math.sin(elapsed * 1.6 * pulseSpeed);
        (rayLinesMaterial as THREE.LineBasicMaterial).opacity = Math.max(0.0, baseOpacity) * (glowIntensity / 1.2);
      }
    }

    const dummy = new THREE.Object3D();

    // Função de animação física + mola para cada grupo de InstancedMesh
    const animateInstancedBars = (instMesh: THREE.InstancedMesh, data: any[], type: 'tall' | 'med' | 'short') => {
      const cursor = mouse3D.current;

      // Parâmetros de física dinâmicos conforme Zustand (Gel, Mecânico ou Líquido)
      const rInfluence = type === 'tall' ? 2.2 : 1.5;
      const fMax = (type === 'tall' ? 0.08 : 0.05) * repulsionStrength;
      
      let damping = 0.92;
      let kSpring = 0.02;
      let lerpSpeed = 0.12; // velocidade do lerp da escala
      
      if (physicsMode === 'mechanical') {
        damping = 0.76; // amortecimento muito mais ríspido/seco
        kSpring = 0.14; // mola extremamente rígida
        lerpSpeed = 0.38; // deforma quase instantaneamente para reatividade mecânica
      } else if (physicsMode === 'liquid') {
        damping = 0.96; // viscosidade líquida alta
        kSpring = 0.005; // mola super mole e lenta
        lerpSpeed = 0.05; // estica de forma muito suave e viscosa, com atraso líquido
      }

      for (let i = 0; i < data.length; i++) {
        const b = data[i];
        b.phase += b.phaseSpd;

        // 1. Oscilação base / pulso natural
        const amp = type === 'tall' ? 0.12 : type === 'med' ? 0.06 : 0.03;
        let targetScaleY = b.baseHeight * (1.0 - amp + amp * Math.abs(Math.sin(b.phase)));

        // 2. Interação física com mouse 3D (raycast)
        const absolutePos = b.currentPos.clone();
        if (orbGroupRef.current) {
          absolutePos.applyMatrix4(orbGroupRef.current.matrixWorld);
        }

        const dist = absolutePos.distanceTo(cursor);
        
        if (dist < rInfluence) {
          // Vetor de repulsão no plano 3D
          const forceDir = new THREE.Vector3().subVectors(absolutePos, cursor);
          forceDir.z = 0; // focado na repulsão plana XY
          
          const forceMag = (1.0 - dist / rInfluence) * fMax;
          b.velocity.addScaledVector(forceDir.normalize(), forceMag);
          
          // Esticar barra sob influência do toque de forma amortecida
          targetScaleY = b.baseHeight * (1.0 + (1.0 - dist / rInfluence) * (type === 'tall' ? 1.1 : 0.5));
        }

        // 3. Interpolação linear (Lerp) para suavização total da escala (evita transição seca/brusca)
        if (b.currentScaleY === undefined) b.currentScaleY = targetScaleY;
        b.currentScaleY = THREE.MathUtils.lerp(b.currentScaleY, targetScaleY, lerpSpeed);

        // 4. Integração de mola: puxar de volta ao anchor original
        const springForce = new THREE.Vector3().subVectors(b.anchorPos, b.currentPos).multiplyScalar(kSpring);
        b.velocity.add(springForce);
        b.velocity.multiplyScalar(damping);

        // Limitar velocidade física para estabilidade fluida
        b.velocity.clampLength(0, 0.08);

        // Atualizar posições locais das barras
        b.currentPos.add(b.velocity);

        // 5. Aplicar transformações na matriz da instância
        dummy.position.copy(b.currentPos);
        dummy.lookAt(new THREE.Vector3(b.currentPos.x * 2, b.currentPos.y * 2, b.zOff));
        dummy.rotateX(Math.PI / 2);
        dummy.scale.set(1.0, b.currentScaleY, 1.0); // O eixo Y representa a altura interpolada do BoxGeometry
        dummy.updateMatrix();

        instMesh.setMatrixAt(i, dummy.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
    };

    if (tallInstRef.current) animateInstancedBars(tallInstRef.current, bars.tall, 'tall');
    if (medInstRef.current) animateInstancedBars(medInstRef.current, bars.med, 'med');
    if (shortInstRef.current) animateInstancedBars(shortInstRef.current, bars.short, 'short');

    // Pulsação e rotação rápidas das partículas do anel principal (no sentido horário)
    if (ringRef.current) {
      const pulseRate = irisState === 'listening' ? 4.5 : irisState === 'critical' ? 6.0 : 2.2;
      const pulseVal = 0.82 + 0.18 * Math.sin(elapsed * pulseRate);
      
      const ringColor = customThemeActive
        ? new THREE.Color(ringColorCustom)
        : new THREE.Color(irisState === 'listening' ? 0x9333EA : irisState === 'critical' || temperature > 75 ? 0xEF4444 : 0x06B6D4);
      
      // Aplicar saturação nas cores do anel
      const tempHSL = { h: 0, s: 0, l: 0 };
      ringColor.getHSL(tempHSL);
      ringColor.setHSL(tempHSL.h, tempHSL.s * saturation, tempHSL.l);
      
      (ringRef.current.material as THREE.PointsMaterial).color.copy(ringColor);
      (ringRef.current.material as THREE.PointsMaterial).opacity = 0.85 * pulseVal;
      
      // Rotação orbital simulando cinto orbital de plasma no sentido horário
      ringRef.current.rotation.z = -elapsed * 0.22 * ringSpeed;
    }


    // Pulsação orgânica da pupila/buraco negro central (respiração do organismo)
    if (centralVoidRef.current) {
      const voidPulseRate = irisState === 'listening' ? 3.0 : irisState === 'speaking' ? 2.2 : 1.2;
      const voidScale = 0.96 + 0.04 * Math.sin(elapsed * voidPulseRate);
      centralVoidRef.current.scale.set(voidScale, voidScale, 1.0);
    }

    // Vórtice Espiral Cósmico (Física baseada em tempo absoluto, 100% contínua e sem jitters/brusquidão)
    if (bgPtsRef.current) {
      const posAttr = bgPtsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particlesData.length; i++) {
        const p = particlesData[i];
        
        // Ângulo contínuo baseado no tempo absoluto com velocidade regulável
        const currentAngle = p.initialAngle + p.speed * elapsed * 0.65 * starSpeed;
        
        // Movimento em Z flutuante contínuo baseado em ondas trigonométricas
        const currentZ = p.initialZ + Math.sin(elapsed * 0.12 + p.phase) * 0.6;
        
        // Pulsação e oscilação radial contínua sem engasgos
        const currentRadius = p.radius + 0.15 * Math.sin(elapsed * 0.25 + p.phase);
        
        const x = Math.cos(currentAngle) * currentRadius;
        const y = Math.sin(currentAngle) * currentRadius;
        
        posAttr.setXYZ(i, x, y, currentZ);
      }
      posAttr.needsUpdate = true;
      
      // Balanço de câmera/paralaxe global ultra lento
      bgPtsRef.current.rotation.z = elapsed * 0.0015;
    }
  });

  return (
    <>
      {/* Grupo do Orbe central */}
      <group ref={orbGroupRef}>
        <instancedMesh ref={tallInstRef} args={[geometries.tall, material, 700]} />
        <instancedMesh ref={medInstRef} args={[geometries.med, material, 600]} />
        <instancedMesh ref={shortInstRef} args={[geometries.short, material, 800]} />

        {/* Anel de partículas brilhantes substituindo o Torus sólido rígido */}
        <points ref={ringRef} geometry={ringParticlesGeometry}>
          <pointsMaterial 
            color={0x06B6D4} 
            size={0.022} 
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
          />
        </points>

        {/* Buraco negro central (Garante contraste e buraco limpo) */}
        <mesh ref={centralVoidRef} position={[0, 0, 0.005]}>
          <circleGeometry args={[1.72, 96]} />
          <meshBasicMaterial color={0x02020a} side={THREE.DoubleSide} />
        </mesh>
      </group>


      {/* Linhas de fuga tridimensionais (1 draw call) */}
      <group ref={rayGroupRef}>
        <lineSegments geometry={rayLinesGeometry} material={rayLinesMaterial} />
      </group>

      {/* Partículas flutuantes de fundo (estrelas) */}
      <points ref={bgPtsRef} geometry={bgParticlesGeometry}>
        <pointsMaterial color={0xdfe9ff} size={0.008} transparent opacity={0.35} sizeAttenuation />
      </points>
    </>
  );
}

// Wrapper principal do Canvas com Composer de Pós-Processamento de Bloom
const OrbCanvas: React.FC<OrbCanvasProps> = ({ rotSpeed = 0.45 }) => {
  const glowIntensity = useIrisStore((s) => s.glowIntensity);

  return (
    <div 
      className="absolute inset-0 overflow-hidden z-0"
      style={{
        background: 'radial-gradient(circle at center, #070414 0%, #030207 55%, #000000 100%)'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 55 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbScene rotSpeed={rotSpeed} />
        
        {/* Filtro de Bloom (Glow Neon Sci-fi) */}
        <EffectComposer>
          <Bloom
            intensity={glowIntensity}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.8}
            height={300}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default OrbCanvas;
