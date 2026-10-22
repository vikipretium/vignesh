"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { Grid, Environment } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import { SceneConfig } from "./types";

interface SceneContentProps {
  config: SceneConfig;
  targetPos: THREE.Vector3;
  mouseScreenPos: { x: number; y: number };
}

export default function SceneContent({
  config,
  targetPos,
  mouseScreenPos,
}: SceneContentProps) {
  const { camera, size } = useThree();

  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      mouseScreenPos.x = (e.clientX / size.width) * 2 - 1;
      mouseScreenPos.y = -(e.clientY / size.height) * 2 + 1;
    };
    window.addEventListener("mousemove", trackMouse);
    return () => window.removeEventListener("mousemove", trackMouse);
  }, [size, mouseScreenPos]);

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

    if (
      camera instanceof THREE.PerspectiveCamera &&
      camera.fov !== config.fov
    ) {
      camera.fov = config.fov;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <Environment preset="studio" blur={0.8} />
      <color attach="background" args={["#ffffff"]} />

      <Grid
        args={[100, 100]}
        cellSize={config.unitSystem === "metric" ? 1 : 0.9144}
        cellColor="#cbd5e1"
        sectionSize={config.gridSize}
        sectionColor="#94a3b8"
        fadeStrength={0.75}
        fadeDistance={100}
        infiniteGrid
      />

      <ambientLight intensity={config.lightIntensity} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={config.lightIntensity * 1.5}
      />

      <mesh position={targetPos}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ef4444" depthTest={false} />
      </mesh>
    </>
  );
}
