"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type SpecimenLens = "field" | "science" | "geology" | "provenance";

function Model({ lens }: { lens: SpecimenLens }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("public/images/Matrixtwin_opal.glb");

  const prepared = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const clonedMaterials = materials.map((material) => (material as THREE.Material).clone());
      mesh.material = Array.isArray(mesh.material) ? clonedMaterials : clonedMaterials[0];
      clonedMaterials.forEach((material) => {
        const mat = material as THREE.MeshStandardMaterial;
        if (!mat.color) return;
        mat.emissive = new THREE.Color(
          lens === "science" ? "#4c858c" : lens === "geology" ? "#80663f" : lens === "provenance" ? "#8b7044" : "#51432f"
        );
        mat.emissiveIntensity = lens === "science" ? 0.22 : lens === "provenance" ? 0.14 : 0.07;
      });
    });

    const bounds = new THREE.Box3().setFromObject(copy);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.35 / maxDimension;
    copy.scale.setScalar(scale);
    copy.position.sub(center.multiplyScalar(scale));
    return copy;
  }, [scene, lens]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.13;
    group.current.rotation.x = Math.sin(Date.now() * 0.00025) * 0.035;
  });

  return <group ref={group} rotation={[0.12, -0.45, 0.08]}><primitive object={prepared} /></group>;
}

export function SpecimenScene({ compact = false, lens = "field" as SpecimenLens }: { compact?: boolean; lens?: SpecimenLens }) {
  return (
    <div className={compact ? "scene sceneCompact" : "scene"}>
      <Canvas camera={{ position: [0, 0, 6.6], fov: 32 }} dpr={[1, 1.8]}>
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 4, 6]} intensity={2.6} />
        <directionalLight position={[-4, 0, -3]} intensity={1.15} color="#8e795d" />
        <pointLight position={[2, 2, 2]} intensity={8} distance={8} color={lens === "science" ? "#87c9d2" : "#c9a86f"} />
        <Model lens={lens} />
        <OrbitControls enablePan={false} minDistance={4.5} maxDistance={8.5} enableZoom={!compact} enableDamping dampingFactor={0.05} />
        <Environment preset="warehouse" />
      </Canvas>
      <div className="sceneGridOverlay" aria-hidden="true" />
      <div className="sceneLabel"><span>AND-MX-00017</span><span>{lens.toUpperCase()} VIEW · DRAG TO EXAMINE</span></div>
    </div>
  );
}

useGLTF.preload("/images/Matrixtwin_opal.glb");
