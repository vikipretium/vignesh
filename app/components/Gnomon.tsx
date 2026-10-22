"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Gnomon() {
  const gizmoRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (gizmoRef.current) {
      // Copy camera rotation to gizmo
      gizmoRef.current.rotation.setFromQuaternion(camera.quaternion);
    }
  });

  return (
    <group ref={gizmoRef} position={[7, 7, 0]}>
      <axesHelper args={[1]} />
    </group>
  );
}
