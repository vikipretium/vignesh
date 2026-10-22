"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { Grid, Environment } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { SceneConfig } from "./types";
import Gnomon from "./Gnomon";

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

  // Track opacity for side-profile vertical helper grids
  const [profileGridOpacity, setProfileGridOpacity] = useState(0);

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

    // Dynamic Visibility Logic: Calculate if the camera is parallel to the ground (pitch = ~90° or polar = ~PI/2)
    // When polar gets very close to PI/2 (within ~2 degrees), cross-fade the vertical grids into view
    const isProfileView = Math.abs(config.polar - Math.PI / 2) < 0.15; // Increased tolerance significantly
    setProfileGridOpacity(isProfileView ? 1 : 0);

    // Live Telemetry updates
    const unitScale = config.unitSystem === "metric" ? 1 : 3.28084;
    const unitLabel = config.unitSystem === "metric" ? "m" : "ft";

    const livePosX = document.getElementById("cam-pos-x");
    const livePosY = document.getElementById("cam-pos-y");
    const livePosZ = document.getElementById("cam-pos-z");
    const liveRotX = document.getElementById("cam-rot-x");
    const liveRotY = document.getElementById("cam-rot-y");
    const liveRotZ = document.getElementById("cam-rot-z");

    if (livePosX)
      livePosX.innerText = `${(camera.position.x * unitScale).toFixed(2)} ${unitLabel}`;
    if (livePosY)
      livePosY.innerText = `${(camera.position.y * unitScale).toFixed(2)} ${unitLabel}`;
    if (livePosZ)
      livePosZ.innerText = `${(camera.position.z * unitScale).toFixed(2)} ${unitLabel}`;

    if (liveRotX)
      liveRotX.innerText = `${Math.round(camera.rotation.x * (180 / Math.PI))}°`;
    if (liveRotY)
      liveRotY.innerText = `${Math.round(camera.rotation.y * (180 / Math.PI))}°`;
    if (liveRotZ)
      liveRotZ.innerText = `${Math.round(camera.rotation.z * (180 / Math.PI))}°`;
  });

  return (
    <>
      <Gnomon />

      <Environment preset="studio" blur={0.8} />
      <color attach="background" args={["#ffffff"]} />

      {/* 1. PRIMARY HORIZONTAL FLOOR GRID (Visible during Top/Perspective views) */}
      <Grid
        args={[100, 100]}
        position={[0, 0.001, 0]}
        cellSize={config.unitSystem === "metric" ? 1 : 0.9144}
        cellColor="#cbd5e1"
        sectionSize={config.gridSize}
        sectionColor="#94a3b8"
        fadeStrength={0.75}
        fadeDistance={100}
        infiniteGrid
        depthWrite={false}
      />

      {/* 2. VERTICAL XY PROFILE GRID */}
      {profileGridOpacity > 0 && (
        <Grid
          args={[100, 100]}
          position={[0, 0, targetPos.z]}
          rotation={[Math.PI / 2, 0, 0]}
          cellSize={config.unitSystem === "metric" ? 1 : 0.9144}
          cellColor="#e2e8f0"
          sectionSize={config.gridSize}
          sectionColor="#cbd5e1"
          fadeStrength={0.75}
          fadeDistance={100}
          infiniteGrid
        />
      )}

      {/* 3. VERTICAL ZY PROFILE GRID (Rotated for Left / Right Views) */}
      {profileGridOpacity > 0 && (
        <Grid
          args={[100, 100]}
          position={[targetPos.x, 0, 0]} // Locked to the active target width plane
          rotation={[0, 0, Math.PI / 2]}
          cellSize={config.unitSystem === "metric" ? 1 : 0.9144}
          cellColor="#e2e8f0"
          sectionSize={config.gridSize}
          sectionColor="#cbd5e1"
          fadeStrength={0.75}
          fadeDistance={100}
          infiniteGrid
          depthWrite={false}
        />
      )}

      <ambientLight intensity={config.lightIntensity} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={config.lightIntensity * 1.5}
      />
    </>
  );
}
