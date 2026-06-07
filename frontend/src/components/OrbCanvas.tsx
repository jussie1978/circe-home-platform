import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbCanvasProps {
  rotSpeed?: number;  // velocidade de rotação — default: 0.028
}

// Mock de estado para visualização standalone
const MOCK_STATE = {
  temperature: 42,
  irisState: 'idle' as 'idle' | 'listening' | 'speaking',
};

function OrbScene({ rotSpeed = 0.028 }: { rotSpeed: number }) {
  const { camera, scene } = useThree();

  // Mouse interaction refs
  const mouseRef = useRef(new THREE.Vector3(0, 0, 0));
  const mInfluenceRef = useRef(0);

  // Configuração da câmera e fundo
  useEffect(() => {
    camera.position.z = 6.2;
    camera.fov = 55;
    camera.updateProjectionMatrix();
    scene.background = new THREE.Color(0x02020a);
  }, [camera, scene]);

  // Mouse handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.set(
        (e.clientX / window.innerWidth * 2 - 1) * 3.8,
        -(e.clientY / window.innerHeight * 2 - 1) * 2.6,
        0
      );
      mInfluenceRef.current = 1;
    };

    const handleMouseLeave = () => { mInfluenceRef.current = 0; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Criação de todas as geometrias e grupos (executado uma única vez)
  const { barData, rayLines, ringMesh, ringMesh2, halo, particles, orbGroup, rayGroup } = useMemo(() => {
    const orbGroup = new THREE.Group();
    const rayGroup = new THREE.Group();

    const barDataLocal: any[] = [];
    const rayLinesLocal: any[] = [];

    const RING_R = 2.0;
    const temp = MOCK_STATE.temperature;
    const irisMode = MOCK_STATE.irisState;

    // Função zoneColor (fiel ao protótipo)
    function zoneColor(angle: number, mode: string, t: number): THREE.Color {
      const norm = ((angle / (Math.PI * 2)) + 1) % 1;
      if (mode === 'listening') {
        const h = 260 + norm * 40;
        return hslToRgb(h / 360, 0.85, 0.55 + norm * 0.15);
      }
      if (mode === 'speaking') {
        const h = 180 + norm * 60;
        return hslToRgb(h / 360, 0.3, 0.88);
      }
      const heatShift = Math.max(0, (t - 50) / 35);
      const baseHue = norm * 360;
      const warmHue = (norm * 200 + 280) % 360;
      const hue = (baseHue * (1 - heatShift) + warmHue * heatShift) % 360;
      const sat = 0.9 + heatShift * 0.1;
      const lit = 0.52 + 0.12 * Math.sin(norm * Math.PI * 3);
      return hslToRgb(hue / 360, sat, lit);
    }

    function hslToRgb(h: number, s: number, l: number): THREE.Color {
      let r: number, g: number, b: number;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number): number => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return new THREE.Color(r, g, b);
    }

    function createBar(angle: number, rBase: number, height: number, width: number, depth: number, color: THREE.Color, zOffset: number): THREE.Mesh {
      const geo = new THREE.BoxGeometry(width, height, depth);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.65,
      });
      const mesh = new THREE.Mesh(geo, mat);

      const bx = Math.cos(angle) * rBase;
      const by = Math.sin(angle) * rBase;
      const bz = zOffset;

      mesh.position.set(bx, by, bz);
      mesh.lookAt(new THREE.Vector3(bx * 2, by * 2, bz));
      mesh.rotateX(Math.PI / 2);
      mesh.translateY(height / 2 + 0.01);

      orbGroup.add(mesh);
      return mesh;
    }

    // BARRAS ALTAS (700)
    for (let i = 0; i < 700; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rBase = RING_R + (Math.random() - 0.5) * 0.15;
      const height = 0.8 + Math.pow(Math.random(), 0.7) * 3.2;
      const width = 0.025 + Math.random() * 0.055;
      const zOff = (Math.random() - 0.5) * 1.2;
      const color = zoneColor(angle, irisMode, temp);
      const mesh = createBar(angle, rBase, height, width, width, color, zOff);
      const baseOp = 0.65 + Math.random() * 0.35;
      mesh.material.opacity = baseOp;

      barDataLocal.push({
        mesh, angle, rBase, height, zOff, baseOp,
        phase: Math.random() * Math.PI * 2,
        phaseSpd: 0.012 + Math.random() * 0.025,
        velX: 0, velY: 0,
        anchorX: mesh.position.x,
        anchorY: mesh.position.y,
        anchorZ: mesh.position.z,
        type: 'tall',
      });
    }

    // BARRAS MÉDIAS (600)
    for (let i = 0; i < 600; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rBase = RING_R + (Math.random() - 0.5) * 0.25;
      const height = 0.15 + Math.random() * 0.9;
      const width = 0.018 + Math.random() * 0.038;
      const zOff = (Math.random() - 0.5) * 1.6;
      const color = zoneColor(angle, irisMode, temp);
      const mesh = createBar(angle, rBase, height, width, width, color, zOff);
      const baseOp = 0.45 + Math.random() * 0.45;
      mesh.material.opacity = baseOp;

      barDataLocal.push({
        mesh, angle, rBase, height, zOff, baseOp,
        phase: Math.random() * Math.PI * 2,
        phaseSpd: 0.008 + Math.random() * 0.02,
        velX: 0, velY: 0,
        anchorX: mesh.position.x,
        anchorY: mesh.position.y,
        anchorZ: mesh.position.z,
        type: 'med',
      });
    }

    // BARRAS CURTAS (800)
    for (let i = 0; i < 800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rBase = RING_R + (Math.random() - 0.3) * 0.6;
      const height = 0.02 + Math.random() * 0.18;
      const width = 0.01 + Math.random() * 0.03;
      const zOff = (Math.random() - 0.5) * 2.0;
      const color = zoneColor(angle, irisMode, temp);
      const mesh = createBar(angle, rBase, height, width, width, color, zOff);
      const baseOp = 0.25 + Math.random() * 0.5;
      mesh.material.opacity = baseOp;

      barDataLocal.push({
        mesh, angle, rBase, height, zOff, baseOp,
        phase: Math.random() * Math.PI * 2,
        phaseSpd: 0.005 + Math.random() * 0.03,
        velX: 0, velY: 0,
        anchorX: mesh.position.x,
        anchorY: mesh.position.y,
        anchorZ: mesh.position.z,
        type: 'short',
      });
    }

    // LINHAS DE FUGA (1800)
    for (let i = 0; i < 1800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const zOff = (Math.random() - 0.5) * 1.8;
      const startR = RING_R * (0.95 + Math.random() * 0.1);
      const endR = RING_R * (1.4 + Math.pow(Math.random(), 0.6) * 2.8);

      const sx = Math.cos(angle) * startR;
      const sy = Math.sin(angle) * startR;
      const ex = Math.cos(angle) * endR;
      const ey = Math.sin(angle) * endR;

      const points = [
        new THREE.Vector3(sx, sy, zOff),
        new THREE.Vector3(ex, ey, zOff + (Math.random() - 0.5) * 0.3),
      ];

      const color = zoneColor(angle, irisMode, temp);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.08 + Math.random() * 0.32,
      });
      const line = new THREE.Line(geo, mat);
      rayGroup.add(line);

      rayLinesLocal.push({
        line, angle, zOff,
        baseOp: mat.opacity,
        phase: Math.random() * Math.PI * 2,
        phaseSpd: 0.003 + Math.random() * 0.012,
      });
    }

    // Anel principal
    const ringGeo = new THREE.TorusGeometry(RING_R, 0.018, 12, 180);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.7 });
    const rMesh = new THREE.Mesh(ringGeo, ringMat);
    orbGroup.add(rMesh);

    // Anel glow
    const ringGeo2 = new THREE.TorusGeometry(RING_R, 0.055, 12, 180);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.18 });
    const rMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbGroup.add(rMesh2);

    // Halo central
    const haloGeo = new THREE.CircleGeometry(1.81 * 0.98, 128);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x02020a, side: THREE.DoubleSide });
    const hMesh = new THREE.Mesh(haloGeo, haloMat);
    hMesh.position.z = 0.01;
    orbGroup.add(hMesh);

    // Partículas de fundo
    const pN = 600;
    const pPos = new Float32Array(pN * 3);
    for (let i = 0; i < pN; i++) {
      const r = 3.5 + Math.random() * 4;
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - 0.5) * Math.PI;
      pPos[i * 3] = r * Math.cos(b) * Math.cos(a);
      pPos[i * 3 + 1] = r * Math.sin(b);
      pPos[i * 3 + 2] = r * Math.cos(b) * Math.sin(a);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x4488BB, size: 0.012, transparent: true, opacity: 0.35 });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    // Adiciona os grupos principais à cena (uma única vez)
    scene.add(orbGroup);
    scene.add(rayGroup);

    return {
      barData: barDataLocal,
      rayLines: rayLinesLocal,
      ringMesh: rMesh,
      ringMesh2: rMesh2,
      halo: hMesh,
      particles: pts,
      orbGroup,
      rayGroup,
    };
  }, []);

  // Animação principal (usa os grupos diretamente do useMemo)
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const delta = state.clock.getDelta();

    // Rotação e balanço do orbe (agora usa o objeto real)
    if (orbGroup) {
      orbGroup.rotation.z += (rotSpeed || 0.028) * delta;
      orbGroup.rotation.y = Math.sin(elapsed * 0.11) * 0.14;
    }

    // Parallax nos raios
    if (rayGroup && orbGroup) {
      rayGroup.rotation.z = orbGroup.rotation.z * 0.3;
      rayGroup.rotation.y = orbGroup.rotation.y * 0.5;
    }

    // Animação das barras (pulso + spring + mouse)
    barData.forEach((b: any) => {
      b.phase += b.phaseSpd;

      const amp = b.type === 'tall' ? 0.2 : b.type === 'med' ? 0.1 : 0.05;
      const pulse = 1 - amp + amp * Math.abs(Math.sin(b.phase));
      b.mesh.scale.y = pulse;

      const op = b.baseOp * (0.65 + 0.35 * Math.abs(Math.sin(b.phase * 1.2)));
      b.mesh.material.opacity = op;

      // Interação com mouse (repulsão + spring)
      if (mInfluenceRef.current > 0.01) {
        const wp = new THREE.Vector3();
        b.mesh.getWorldPosition(wp);
        const dx = wp.x - mouseRef.current.x;
        const dy = wp.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rad = b.type === 'tall' ? 2.2 : 1.5;
        if (dist < rad) {
          const force = (1 - dist / rad) * (b.type === 'tall' ? 0.12 : 0.07);
          const len = dist || 1;
          b.velX += (dx / len) * force;
          b.velY += (dy / len) * force;
          b.mesh.scale.y = pulse * (1 + (1 - dist / rad) * (b.type === 'tall' ? 1.5 : 0.6));
          b.mesh.material.opacity = Math.min(0.98, op * 1.8);
        }
      }

      // Física spring
      b.velX *= 0.84;
      b.velY *= 0.84;
      b.velX = Math.max(-0.08, Math.min(0.08, b.velX));
      b.velY = Math.max(-0.08, Math.min(0.08, b.velY));
      b.mesh.position.x += b.velX;
      b.mesh.position.y += b.velY;
      b.mesh.position.x += (b.anchorX - b.mesh.position.x) * 0.05;
      b.mesh.position.y += (b.anchorY - b.mesh.position.y) * 0.05;
      b.mesh.position.z += (b.anchorZ - b.mesh.position.z) * 0.05;
    });

    // Animação das linhas de fuga
    rayLines.forEach((r: any) => {
      r.phase += r.phaseSpd;
      r.line.material.opacity = r.baseOp * (0.4 + 0.6 * Math.abs(Math.sin(r.phase)));
    });

    // Pulso dos anéis
    if (ringMesh && ringMesh2) {
      const rp = 0.88 + 0.12 * Math.sin(elapsed * 2.8);
      (ringMesh.material as THREE.MeshBasicMaterial).opacity = 0.68 * rp;
      (ringMesh2.material as THREE.MeshBasicMaterial).opacity = 0.18 * rp;
    }
  });

  // Retorna vazio — os grupos já foram adicionados à cena no useMemo
  return <></>;
}

const OrbCanvas: React.FC<OrbCanvasProps> = ({ rotSpeed = 0.028 }) => {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: '#02020a', 
      overflow: 'hidden',
      zIndex: 1 
    }}>
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 55 }}
        gl={{ 
          antialias: true, 
          alpha: false 
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbScene rotSpeed={rotSpeed} />
      </Canvas>
    </div>
  );
};

export default OrbCanvas;
