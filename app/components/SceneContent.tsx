"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { SceneConfig } from "./types";

interface SceneContentProps {
  config: SceneConfig;
  targetPos: THREE.Vector3;
}

export default function SceneContent({ config, targetPos }: SceneContentProps) {
  const { camera } = useThree();

  useFrame(() => {
    const offsetX =
      config.distance * Math.sin(config.polar) * Math.cos(config.azimuth);
    const offsetY = config.distance * Math.cos(config.polar);
    const offsetZ =
      config.distance * Math.sin(config.polar) * Math.sin(config.azimuth);

    camera.position.set(
      targetPos.x + offsetX,
      targetPos.y + offsetY,
      targetPos.z + offsetZ,
    );
    camera.lookAt(targetPos);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.fov;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <color attach="background" args={["#1f1f1f"]} />
      <Environment preset="studio" blur={0} />

      {/* Grid */}
      <Grid
        args={[200, 200]}
        cellSize={1}
        cellColor="#3a3a3a"
        sectionSize={config.gridSize}
        sectionColor="#454545"
        fadeStrength={0.5}
        fadeDistance={200}
        infiniteGrid
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={config.lightIntensity}
      />
    </>
  );
}
