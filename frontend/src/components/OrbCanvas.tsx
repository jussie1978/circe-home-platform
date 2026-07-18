import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useIrisStore } from '../store/irisStore';

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
  color7: THREE.Color,
  color8: THREE.Color,
  saturation: number
): THREE.Color {
  let norm = (angle / (Math.PI * 2)) % 1;
  if (norm < 0) norm += 1; // Garante normalização positiva de 0 a 1 em JS (R2.2 corrigido)
  const color = new THREE.Color();

  if (customActive) {
    // Interpolar de forma fluida e cíclica entre as oito cores customizadas (arco-íris de 8 zonas)
    if (norm < 0.125) {
      color.lerpColors(color1, color2, norm / 0.125);
    } else if (norm < 0.25) {
      color.lerpColors(color2, color3, (norm - 0.125) / 0.125);
    } else if (norm < 0.375) {
      color.lerpColors(color3, color4, (norm - 0.25) / 0.125);
    } else if (norm < 0.5) {
      color.lerpColors(color4, color5, (norm - 0.375) / 0.125);
    } else if (norm < 0.625) {
      color.lerpColors(color5, color6, (norm - 0.5) / 0.125);
    } else if (norm < 0.75) {
      color.lerpColors(color6, color7, (norm - 0.625) / 0.125);
    } else if (norm < 0.875) {
      color.lerpColors(color7, color8, (norm - 0.75) / 0.125);
    } else {
      color.lerpColors(color8, color1, (norm - 0.875) / 0.125);
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
    const lit = 0.40;
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
  const septenaryColor = useIrisStore((s) => s.septenaryColor);
  const octonaryColor = useIrisStore((s) => s.octonaryColor);
  const customThemeActive = useIrisStore((s) => s.customThemeActive);
  const colorZonesEnabled = useIrisStore((s) => s.colorZonesEnabled);
  const rotationSpeed = useIrisStore((s) => s.rotationSpeed);
  const physicsMode = useIrisStore((s) => s.physicsMode);
  const repulsionStrength = useIrisStore((s) => s.repulsionStrength);
  const starSpeed = useIrisStore((s) => s.starSpeed);
  const saturation = useIrisStore((s) => s.saturation);
  const ringColorCustom = useIrisStore((s) => s.ringColorCustom);
  const ringSpeed = useIrisStore((s) => s.ringSpeed);
  const pulseSpeed = useIrisStore((s) => s.pulseSpeed);
  const glowIntensityBars = useIrisStore((s) => s.glowIntensityBars);
  const glowIntensityLines = useIrisStore((s) => s.glowIntensityLines);
  const barPulseSpeed = useIrisStore((s) => s.barPulseSpeed);
  const barGlowPulseSpeed = useIrisStore((s) => s.barGlowPulseSpeed);



  // Referências para o Satélite Gravitacional/Repulsão Interativo (Lua)
  const satelliteCoords = useIrisStore((s) => s.satelliteCoords);
  const satellitePosRef = useRef(new THREE.Vector3(3.2, 0.0, 0.0)); // Posição XY convertida para 3D
  const satellite2Coords = useIrisStore((s) => s.satellite2Coords);
  const satellite2PosRef = useRef(new THREE.Vector3(-3.2, 0.0, 0.0)); // Segundo satélite

  // Referências de velocidade física para simulação gravitacional
  const sat1VelRef = useRef(new THREE.Vector2(0, 0));
  const sat2VelRef = useRef(new THREE.Vector2(0, 0));
  const prevSat1Mode = useRef<'manual' | 'gravitational' | 'orbital'>('manual');
  const prevSat2Mode = useRef<'manual' | 'gravitational' | 'orbital'>('manual');
  const prevSat1Pos = useRef({ x: 180, y: 0 });
  const prevSat2Pos = useRef({ x: -180, y: 0 });
  const prevDraggingSat1 = useRef(false);
  const prevDraggingSat2 = useRef(false);

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

  // Fases acumuladas para evitar saltos bruscos (flicker de fase) ao alterar as velocidades
  const pulsePhaseRef = useRef(0);
  const barGlowPulsePhaseRef = useRef(0);
  const ringRotationPhaseRef = useRef(0);
  const colorRotationPhaseRef = useRef(0);
  const starRotationPhaseRef = useRef(0);

  // Inclinação 3D acumulada do arrasto central (spring-return)
  const currentDragRotation = useRef({ x: 0, y: 0 });

  const RING_R = 1.8;

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
  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const safeDelta = Math.min(0.03, delta); // usar delta nativo do scheduler do Fiber para evitar clock.getDelta() = 0

    // Interpolação suave (lerp) para o efeito de arrastar em 3D
    const targetDrag = useIrisStore.getState().dragOffset || { x: 0, y: 0 };
    const dragLerpFactor = targetDrag.x === 0 && targetDrag.y === 0 ? 0.08 : 0.45; // retorno suave, tracking ultra responsivo
    currentDragRotation.current.x = THREE.MathUtils.lerp(currentDragRotation.current.x, targetDrag.x, dragLerpFactor);
    currentDragRotation.current.y = THREE.MathUtils.lerp(currentDragRotation.current.y, targetDrag.y, dragLerpFactor);

    // Acumular fases baseadas no tempo delta para transições 100% lineares e sem solavancos
    pulsePhaseRef.current += safeDelta * 1.6 * pulseSpeed;
    barGlowPulsePhaseRef.current += safeDelta * 1.6 * barGlowPulseSpeed;
    ringRotationPhaseRef.current += safeDelta * 0.22 * ringSpeed;
    colorRotationPhaseRef.current += safeDelta * 0.42 * rotationSpeed;
    starRotationPhaseRef.current += safeDelta * 0.65 * starSpeed;

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
      const cActive = colorZonesEnabled || [true, true, true, true, true, true, true, true];
      const color1 = new THREE.Color(cActive[0] ? (primaryColor || '#00f3ff') : '#000000');
      const color2 = new THREE.Color(cActive[1] ? (secondaryColor || '#00aaff') : '#000000');
      const color3 = new THREE.Color(cActive[2] ? (tertiaryColor || '#d946ef') : '#000000');
      const color4 = new THREE.Color(cActive[3] ? (quaternaryColor || '#ff007f') : '#000000');
      const color5 = new THREE.Color(cActive[4] ? (quinaryColor || '#ff5500') : '#000000');
      const color6 = new THREE.Color(cActive[5] ? (senaryColor || '#aaff00') : '#000000');
      const color7 = new THREE.Color(cActive[6] ? (septenaryColor || '#ffff00') : '#000000');
      const color8 = new THREE.Color(cActive[7] ? (octonaryColor || '#00ff55') : '#000000');

      // Parâmetros de Glow dinâmicos e pulsação suave
      const glowEnabled = useIrisStore.getState().glowBarsEnabled;
      const pulseVal = !glowEnabled || barGlowPulseSpeed === 0 ? 1.0 : Math.pow(Math.sin(barGlowPulsePhaseRef.current) * 0.5 + 0.5, 1.5);
      const maxGlowMultiplier = glowEnabled ? glowIntensityBars * 4.5 : 1.0;
      const glowMultiplier = 1.0 + (maxGlowMultiplier - 1.0) * pulseVal;

      for (let i = 0; i < data.length; i++) {
        // Mistura de cores 3D aumentada (ripple baseada em rBase e zOff) para suavizar a transição angular
        const colorShift = Math.sin(data[i].rBase * 4.5) * 0.35 + Math.cos(data[i].zOff * 1.5) * 0.2;
        const rotatedAngle = data[i].angle - colorRotationPhaseRef.current + colorShift;

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
          color7,
          color8,
          saturation
        );
        // Aplicar o boost de glow na cor final (HDR)
        color.multiplyScalar(glowMultiplier);

        // Efeito visual dos jatos cósmicos - Plasma superaquecido e boost de brilho nos pólos
        const cosmicJetsEnabled = useIrisStore.getState().cosmicJetsEnabled;
        const jetIntensity = useIrisStore.getState().jetIntensity;
        if (cosmicJetsEnabled && Math.abs(Math.sin(data[i].angle)) > 0.93) {
          const jetFactor = (Math.abs(Math.sin(data[i].angle)) - 0.93) / 0.07;
          color.lerp(new THREE.Color('#ffffff'), jetFactor * 0.95);
          color.multiplyScalar(1.0 + jetIntensity * 2.0 * jetFactor);
        }
        
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
      orbGroupRef.current.rotation.z -= currentSpeed * safeDelta; // Gira no sentido horário ( -= )
      orbGroupRef.current.rotation.y = Math.sin(elapsed * 0.15) * 0.12 + currentDragRotation.current.y;
      orbGroupRef.current.rotation.x = Math.cos(elapsed * 0.1) * 0.08 + currentDragRotation.current.x;
    }

    if (rayGroupRef.current && orbGroupRef.current) {
      // Rotação em sentido contrário (contra-rotação) com velocidade sutil para criar paralaxe viva tridimensional
      rayGroupRef.current.rotation.z = orbGroupRef.current.rotation.z * -0.55;
      rayGroupRef.current.rotation.y = Math.cos(elapsed * 0.12) * 0.08 + currentDragRotation.current.y; // Alinhado com o ângulo de rotação/inclinação do Orbe
      rayGroupRef.current.rotation.x = Math.sin(elapsed * 0.08) * 0.05 + currentDragRotation.current.x; // Alinhado com o ângulo de rotação/inclinação do Orbe
      
      // Aplicar opacidade de glow das barras
      if (material) {
        material.opacity = 0.85;
      }

      // Pulsação contínua da opacidade das linhas de fuga
      if (rayLinesMaterial) {
        const linesGlowEnabled = useIrisStore.getState().glowLinesEnabled;
        if (linesGlowEnabled) {
          const baseOpacity = pulseSpeed === 0 ? 0.45 : 0.22 + 0.23 * Math.sin(pulsePhaseRef.current);
          (rayLinesMaterial as THREE.LineBasicMaterial).opacity = Math.max(0.0, baseOpacity) * (glowIntensityLines / 1.2);
        } else {
          (rayLinesMaterial as THREE.LineBasicMaterial).opacity = 0.0; // Desliga totalmente o glow e as linhas
        }
      }
    }

    const dummy = new THREE.Object3D();

    // Função de animação física + mola para cada grupo de InstancedMesh
    const animateInstancedBars = (instMesh: THREE.InstancedMesh, data: any[], type: 'tall' | 'med' | 'short') => {
      const cursor = mouse3D.current;

      // Parâmetros de física dinâmicos conforme Zustand (Gel, Mecânico ou Líquido)
      const rInfluence = type === 'tall' ? 2.0 : 1.35;
      const fMax = (type === 'tall' ? 0.08 : 0.05) * repulsionStrength;
      const maxVel = 0.35; // Limite fixo de velocidade linear para reatividade física máxima e estabilidade (independente de repulsionStrength)
      
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
        b.phase += b.phaseSpd * barPulseSpeed;

        // 1. Oscilação base / pulso natural
        const amp = type === 'tall' ? 0.12 : type === 'med' ? 0.06 : 0.03;
        let targetScaleY = b.baseHeight * (1.0 - amp + amp * Math.abs(Math.sin(b.phase)));

        // 2. Interação física com mouse 3D (raycast)
        const absolutePos = b.currentPos.clone();
        if (orbGroupRef.current) {
          absolutePos.applyMatrix4(orbGroupRef.current.matrixWorld);
        }

        const dist = absolutePos.distanceTo(cursor);
        const isDraggingAnySat = useIrisStore.getState().isDraggingSat1 || useIrisStore.getState().isDraggingSat2;
        
        if (dist < rInfluence && !isDraggingAnySat) {
          // Vetor de repulsão no plano 3D
          const forceDir = new THREE.Vector3().subVectors(absolutePos, cursor);
          forceDir.z = 0; // focado na repulsão plana XY
          
          const factor = 1.0 - dist / rInfluence;
          const smoothFactor = factor * factor; // Suavização quadrática progressiva (muito mais linear visualmente)
          const forceMag = smoothFactor * fMax * 0.45; // Coeficiente ajustado para suavidade máxima
          b.velocity.addScaledVector(forceDir.normalize(), forceMag);
          
          // Esticar barra sob influência do toque de forma amortecida e suave
          targetScaleY = b.baseHeight * (1.0 + smoothFactor * (type === 'tall' ? 1.1 : 0.5) * repulsionStrength);
        }

        // 3. Interação física com o Satélite Gravitacional (Ciano) - Sem cutoff rígido (gravidade contínua)
        const satPos = satellitePosRef.current;
        const distSat = absolutePos.distanceTo(satPos);
        const sat1Force = useIrisStore.getState().sat1Force;
        
        const forceDirSat = new THREE.Vector3().subVectors(absolutePos, satPos);
        forceDirSat.z = 0; // focado no plano XY
        
        // baseForce reduzida em ~3.5x para linearidade total dos controles (evita saturação precoce da velocidade)
        const baseForce = type === 'tall' ? 0.022 : 0.014;
        
        // Ondulação vibratória de energia viva no tempo e espaço (ripple)
        const waveForce1 = sat1Force * (1.0 + 0.22 * Math.sin(elapsed * 6.0 + i * 0.1));
        
        // Decaimento linear mais localizado (0.35 + 0.75) para concentrar o efeito de maré
        const forceMagSat = (baseForce * waveForce1) / (distSat * 0.35 + 0.75);
        
        // Aplicar forças Radiais (Atração/Repulsão) e Tangenciais (Swirl/Vórtice de Acreção)
        const direction = forceDirSat.normalize();
        const tangent = new THREE.Vector3(-direction.y, direction.x, 0);
        
        const radialForce = forceMagSat;
        const tangentialForce = forceMagSat * 0.55; // Intensidade da torção espiral (Efeito de Acreção Cósmica)
        
        b.velocity.addScaledVector(direction, radialForce);
        b.velocity.addScaledVector(tangent, tangentialForce);
        
        // Esticar as barras de forma contínua conforme proximidade (Deformação de Maré)
        const satScaleFactor = (0.75 * Math.abs(waveForce1)) / (distSat * 0.35 + 0.85);
        targetScaleY = Math.max(targetScaleY, b.baseHeight * (1.0 + satScaleFactor * (type === 'tall' ? 1.4 : 0.7)));

        // 3.5 Interação física com o Segundo Satélite Gravitacional (Fúcsia) - Sem cutoff rígido
        const sat2Pos = satellite2PosRef.current;
        const distSat2 = absolutePos.distanceTo(sat2Pos);
        const sat2Force = useIrisStore.getState().sat2Force;
        
        const forceDirSat2 = new THREE.Vector3().subVectors(absolutePos, sat2Pos);
        forceDirSat2.z = 0;
        
        // baseForce2 reduzida para linearidade
        const baseForce2 = type === 'tall' ? 0.022 : 0.014;
        
        // Ondulação senoidal defasada
        const waveForce2 = sat2Force * (1.0 + 0.22 * Math.cos(elapsed * 7.5 + i * 0.1));
        
        // Decaimento linear localizado
        const forceMagSat2 = (baseForce2 * waveForce2 * 0.9) / (distSat2 * 0.35 + 0.75);
        
        const direction2 = forceDirSat2.normalize();
        const tangent2 = new THREE.Vector3(-direction2.y, direction2.x, 0);
        
        const radialForce2 = forceMagSat2;
        const tangentialForce2 = forceMagSat2 * 0.55; // Torção espiral fúcsia (Vórtice)
        
        b.velocity.addScaledVector(direction2, radialForce2);
        b.velocity.addScaledVector(tangent2, tangentialForce2);
        
        const sat2ScaleFactor = (0.75 * Math.abs(waveForce2) * 0.9) / (distSat2 * 0.35 + 0.85);
        targetScaleY = Math.max(targetScaleY, b.baseHeight * (1.0 + sat2ScaleFactor * (type === 'tall' ? 1.4 : 0.7)));
        
        // 3.8 Efeito de Jatos Cósmicos Relativísticos (Pólos Y)
        const cosmicJetsEnabled = useIrisStore.getState().cosmicJetsEnabled;
        const jetIntensity = useIrisStore.getState().jetIntensity;
        
        if (cosmicJetsEnabled && Math.abs(Math.sin(b.angle)) > 0.93) {
          const jetFactor = (Math.abs(Math.sin(b.angle)) - 0.93) / 0.07;
          const jetOsc = Math.sin(elapsed * 15.0 + i * 0.4) * 0.5 + 0.5;
          
          const jetStretch = jetFactor * jetIntensity * (6.0 + 4.0 * jetOsc);
          targetScaleY = targetScaleY * (1.0 + jetStretch);
          
          const pushForce = Math.sign(Math.sin(b.angle)) * jetFactor * jetIntensity * 0.15 * jetOsc;
          b.velocity.y += pushForce;
        }

        // 4. Interpolação linear (Lerp) para suavização total da escala (evita transição seca/brusca)
        if (b.currentScaleY === undefined) b.currentScaleY = targetScaleY;
        b.currentScaleY = THREE.MathUtils.lerp(b.currentScaleY, targetScaleY, lerpSpeed);

        // 4. Integração de mola: puxar de volta ao anchor original
        const springForce = new THREE.Vector3().subVectors(b.anchorPos, b.currentPos).multiplyScalar(kSpring);
        b.velocity.add(springForce);
        b.velocity.multiplyScalar(damping);

        // Limitar velocidade física de forma linear
        b.velocity.clampLength(0, maxVel);

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
      
      // HDR booster para as partículas do anel brilharem
      ringColor.multiplyScalar(3.0);
      
      (ringRef.current.material as THREE.PointsMaterial).color.copy(ringColor);
      (ringRef.current.material as THREE.PointsMaterial).opacity = 0.85 * pulseVal;
      
      // Rotação orbital simulando cinto orbital de plasma no sentido horário via fase acumulada
      ringRef.current.rotation.z = -ringRotationPhaseRef.current;
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
        
        // Ângulo contínuo baseado na fase acumulada com velocidade regulável
        const currentAngle = p.initialAngle + p.speed * starRotationPhaseRef.current;
        
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

    // Física gravitacional real em tempo real
    const sat1Mode = useIrisStore.getState().sat1Mode;
    const sat2Mode = useIrisStore.getState().sat2Mode;
    const isDraggingSat1 = useIrisStore.getState().isDraggingSat1;
    const isDraggingSat2 = useIrisStore.getState().isDraggingSat2;
    const sat1Speed = useIrisStore.getState().sat1Speed;
    const sat2Speed = useIrisStore.getState().sat2Speed;

    // Satélite 1
    let x1 = satelliteCoords.x;
    let y1 = satelliteCoords.y;
    let vx1 = sat1VelRef.current.x;
    let vy1 = sat1VelRef.current.y;

    // Satélite 2
    let x2 = satellite2Coords.x;
    let y2 = satellite2Coords.y;
    let vx2 = sat2VelRef.current.x;
    let vy2 = sat2VelRef.current.y;

    const G_center = 180000;
    const G_mutual = 80000;

     // Inicializar velocidade orbital estável se acabou de trocar para gravitacional ou acabou de soltar
    if (sat1Mode === 'gravitational') {
      if ((prevSat1Mode.current === 'manual' || prevSat1Mode.current === 'orbital') || (prevDraggingSat1.current && !isDraggingSat1)) {
        const dist = Math.sqrt(x1 * x1 + y1 * y1) + 0.1;
        const speed = Math.sqrt(G_center / dist) * 0.95;
        sat1VelRef.current.x = (-y1 / dist) * speed;
        sat1VelRef.current.y = (x1 / dist) * speed;
        vx1 = sat1VelRef.current.x;
        vy1 = sat1VelRef.current.y;
      }
    }
    prevSat1Mode.current = sat1Mode;
    prevDraggingSat1.current = isDraggingSat1;

    if (sat2Mode === 'gravitational') {
      if ((prevSat2Mode.current === 'manual' || prevSat2Mode.current === 'orbital') || (prevDraggingSat2.current && !isDraggingSat2)) {
        const dist = Math.sqrt(x2 * x2 + y2 * y2) + 0.1;
        const speed = Math.sqrt(G_center / dist) * 0.95;
        sat2VelRef.current.x = (-y2 / dist) * speed;
        sat2VelRef.current.y = (x2 / dist) * speed;
        vx2 = sat2VelRef.current.x;
        vy2 = sat2VelRef.current.y;
      }
    }
    prevSat2Mode.current = sat2Mode;
    prevDraggingSat2.current = isDraggingSat2;

    // Atualizar órbita circular diagonal 3D (modelo planetário coplanar: Ciano no limite máximo, Fúcsia a 20% do limite)
    const R1_max = Math.max(500, (window.innerWidth / 2) - 40); // limite máximo do canvas
    const tiltRadCommon = 74 * Math.PI / 180; // inclinação comum de 74 graus
    const rotRadCommon = 15 * Math.PI / 180; // rotação comum de 15 graus (mesma trajetória)

    if (sat1Mode === 'orbital' && !isDraggingSat1) {
      const ringSpeed = useIrisStore.getState().ringSpeed;
      const angle = elapsed * 0.75 * ringSpeed * sat1Speed; // Multiplicador de velocidade individual
      
      const x_flat = R1_max * Math.cos(angle);
      const y_flat = R1_max * Math.sin(angle);
      
      x1 = x_flat * Math.cos(rotRadCommon) - (y_flat * Math.cos(tiltRadCommon)) * Math.sin(rotRadCommon);
      y1 = x_flat * Math.sin(rotRadCommon) + (y_flat * Math.cos(tiltRadCommon)) * Math.cos(rotRadCommon);
      const z1 = y_flat * Math.sin(tiltRadCommon);
      
      useIrisStore.setState({ satelliteCoords: { x: x1, y: y1, z: z1 } });
    } else if ((sat1Mode === 'manual' || isDraggingSat1) && satelliteCoords.z !== 0) {
      // Garante z = 0 se manual ou arrastado
      useIrisStore.setState({ satelliteCoords: { x: satelliteCoords.x, y: satelliteCoords.y, z: 0 } });
    }

    if (sat2Mode === 'orbital' && !isDraggingSat2) {
      const ringSpeed = useIrisStore.getState().ringSpeed;
      // Orbita na mesma direção, mas com velocidade angular de Kepler escalada por sat2Speed
      const angle = elapsed * 1.25 * ringSpeed * sat2Speed + Math.PI; 
      const R2 = R1_max * 0.8; // Recuo de 20% em relação ao limite máximo da borda do canvas!
      
      const x_flat = R2 * Math.cos(angle);
      const y_flat = R2 * Math.sin(angle);
      
      x2 = x_flat * Math.cos(rotRadCommon) - (y_flat * Math.cos(tiltRadCommon)) * Math.sin(rotRadCommon);
      y2 = x_flat * Math.sin(rotRadCommon) + (y_flat * Math.cos(tiltRadCommon)) * Math.cos(rotRadCommon);
      const z2 = y_flat * Math.sin(tiltRadCommon);
      
      useIrisStore.setState({ satellite2Coords: { x: x2, y: y2, z: z2 } });
    } else if ((sat2Mode === 'manual' || isDraggingSat2) && satellite2Coords.z !== 0) {
      // Garante z = 0 se manual ou arrastado
      useIrisStore.setState({ satellite2Coords: { x: satellite2Coords.x, y: satellite2Coords.y, z: 0 } });
    }

    // Se estiver arrastando, calcula velocidade do arrasto para poder arremessar
    if (isDraggingSat1) {
      vx1 = (x1 - prevSat1Pos.current.x) / safeDelta;
      vy1 = (y1 - prevSat1Pos.current.y) / safeDelta;
      sat1VelRef.current.set(vx1, vy1).clampLength(0, 600);
    }
    if (isDraggingSat2) {
      vx2 = (x2 - prevSat2Pos.current.x) / safeDelta;
      vy2 = (y2 - prevSat2Pos.current.y) / safeDelta;
      sat2VelRef.current.set(vx2, vy2).clampLength(0, 600);
    }

    const dist1Sq = x1*x1 + y1*y1;
    const dist2Sq = x2*x2 + y2*y2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const distMutualSq = dx*dx + dy*dy;

    // Força gravitacional mútua (atração)
    const forceMutual = G_mutual / (distMutualSq + 4000);
    const ax_m = dx * forceMutual;
    const ay_m = dy * forceMutual;

    // Aplicar física no Satélite 1
    if (sat1Mode === 'gravitational' && !isDraggingSat1) {
      const forceC1 = G_center / (dist1Sq + 3000);
      let ax = -x1 * forceC1 + ax_m;
      let ay = -y1 * forceC1 + ay_m;

      const dt1 = safeDelta * sat1Speed;
      vx1 = (vx1 + ax * dt1) * Math.pow(0.994, sat1Speed);
      vy1 = (vy1 + ay * dt1) * Math.pow(0.994, sat1Speed);
      x1 += vx1 * dt1;
      y1 += vy1 * dt1;

      const limitX = (window.innerWidth / 2) - 28;
      const limitY = (window.innerHeight / 2) - 28;
      x1 = Math.max(-limitX, Math.min(limitX, x1));
      y1 = Math.max(-limitY, Math.min(limitY, y1));

      useIrisStore.setState({ satelliteCoords: { x: x1, y: y1, z: 0 } });
      sat1VelRef.current.set(vx1, vy1);
    }

    // Aplicar física no Satélite 2
    if (sat2Mode === 'gravitational' && !isDraggingSat2) {
      const forceC2 = G_center / (dist2Sq + 3000);
      let ax = -x2 * forceC2 - ax_m;
      let ay = -y2 * forceC2 - ay_m;

      const dt2 = safeDelta * sat2Speed;
      vx2 = (vx2 + ax * dt2) * Math.pow(0.994, sat2Speed);
      vy2 = (vy2 + ay * dt2) * Math.pow(0.994, sat2Speed);
      x2 += vx2 * dt2;
      y2 += vy2 * dt2;

      const limitX = (window.innerWidth / 2) - 25;
      const limitY = (window.innerHeight / 2) - 25;
      x2 = Math.max(-limitX, Math.min(limitX, x2));
      y2 = Math.max(-limitY, Math.min(limitY, y2));

      useIrisStore.setState({ satellite2Coords: { x: x2, y: y2, z: 0 } });
      sat2VelRef.current.set(vx2, vy2);
    }

    prevSat1Pos.current = { x: x1, y: y1 };
    prevSat2Pos.current = { x: x2, y: y2 };

    // Mapeamento linear direto: 160px (raio do orbe no DOM) = 1.8 unidades no Three.js (RING_R)
    // Fator de escala: 1.8 / 160 = 0.01125
    const satPos3DX = (satelliteCoords?.x ?? 180) * 0.01125;
    const satPos3DY = -(satelliteCoords?.y ?? 0) * 0.01125; // inverter Y
    const satPos3DZ = (satelliteCoords?.z ?? 0) * 0.01125; // Profundidade mapeada para 3D!
    satellitePosRef.current.set(satPos3DX, satPos3DY, satPos3DZ);

    const sat2Pos3DX = (satellite2Coords?.x ?? -180) * 0.01125;
    const sat2Pos3DY = -(satellite2Coords?.y ?? 0) * 0.01125; // inverter Y
    const sat2Pos3DZ = (satellite2Coords?.z ?? 0) * 0.01125; // Profundidade mapeada para 3D!
    satellite2PosRef.current.set(sat2Pos3DX, sat2Pos3DY, sat2Pos3DZ);
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
          <circleGeometry args={[1.55, 96]} />
          <meshBasicMaterial color={0x02020a} side={THREE.DoubleSide} />
        </mesh>
      </group>


      {/* Linhas de fuga tridimensionais (1 draw call) */}
      <group ref={rayGroupRef}>
        <lineSegments geometry={rayLinesGeometry} material={rayLinesMaterial} />
      </group>

      {/* Partículas flutuantes de fundo (estrelas) */}
      <points ref={bgPtsRef} geometry={bgParticlesGeometry}>
        <pointsMaterial color={0xdfe9ff} size={0.007} transparent opacity={0.3} sizeAttenuation />
      </points>

    </>
  );
}

// Wrapper principal do Canvas com Composer de Pós-Processamento de Bloom
const OrbCanvas: React.FC<OrbCanvasProps> = ({ rotSpeed = 0.45 }) => {
  const glowIntensityBars = useIrisStore((s) => s.glowIntensityBars);

  return (
    <div 
      className="absolute inset-0 overflow-hidden z-0"
      style={{
        background: 'radial-gradient(circle at center, #070414 0%, #030207 55%, #000000 100%)'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 55 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbScene rotSpeed={rotSpeed} />
        
        {/* Filtro de Bloom refinado e vinheta para alto contraste sem perder definição */}
        <EffectComposer multisampling={8}>
          <Bloom
            intensity={glowIntensityBars * 1.5}
            luminanceThreshold={1.0}
            luminanceSmoothing={0.5}
            height={480}
            mipmapBlur
          />
          <Vignette
            eskil={false}
            offset={0.4}
            darkness={0.6}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default OrbCanvas;
