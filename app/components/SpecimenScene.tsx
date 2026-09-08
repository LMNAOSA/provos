"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Specimen() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.18;
    ref.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.05;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <mesh ref={ref} scale={[2.3, 1.45, 1.15]} rotation={[0.12, -0.45, 0.08]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial color="#34302b" roughness={0.68} metalness={0.08} emissive="#6b5636" emissiveIntensity={0.14} />
      </mesh>
    </Float>
  );
}

export function SpecimenScene({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "scene sceneCompact" : "scene"}>
      <Canvas camera={{ position: [0, 0, 6.5], fov: 35 }} dpr={[1, 1.7]}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 4, 5]} intensity={2.4} />
        <pointLight position={[-3, 1, -2]} intensity={9} distance={8} color="#c9a86f" />
        <Specimen />
        <OrbitControls enablePan={false} minDistance={4.8} maxDistance={8} enableZoom={!compact} />
        <Environment preset="city" />
      </Canvas>
      <div className="sceneLabel">DEMONSTRATION FORM · AND-MX-00017</div>
    </div>
  );
}
