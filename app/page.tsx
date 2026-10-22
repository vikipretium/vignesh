"use client";

import { Canvas } from "@react-three/fiber";
import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

import { SceneConfig, TargetCoordinates } from "./components/types";
import SceneContent from "./components/SceneContent";
import HUDPanel from "./components/HUDPanel";
import ToggleButton from "./components/ToggleButton";

export default function ScenePage() {
  const [config, setConfig] = useState<SceneConfig>({
    distance: 15,
    azimuth: Math.PI / 2,
    polar: (4 * Math.PI) / 9, // Set default viewing pitch explicitly to 10 degrees from horizontal plane
    fov: 60,
    gridSize: 10,
    skyPreset: "sunset",
    lightIntensity: 0.8,
    unitSystem: "metric",
  });

  const [showHUD, setShowHUD] = useState(true);
  const [targetDisplay, setTargetDisplay] = useState<TargetCoordinates>({
    x: 0,
    y: 0,
    z: 0,
  });

  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const mouseScreenPos = useMemo(() => ({ x: 0, y: 0 }), []);

  const isMiddleMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const updateConfig = (key: keyof SceneConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const resetTarget = () => {
    targetPos.set(0, 0, 0);
    setTargetDisplay({ x: 0, y: 0, z: 0 });
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        isMiddleMouseDown.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMiddleMouseDown.current) return;

      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;

      const currentConfig = configRef.current;

      if (e.ctrlKey) {
        const zoomFactor = 0.02;
        setConfig((prev) => ({
          ...prev,
          distance: Math.max(1, prev.distance * (1 - deltaY * zoomFactor)),
        }));
      } else if (e.shiftKey) {
        const panScaling = currentConfig.distance * 0.0012;

        const sinA = Math.sin(currentConfig.azimuth);
        const cosA = Math.cos(currentConfig.azimuth);
        const sinP = Math.sin(currentConfig.polar);
        const cosP = Math.cos(currentConfig.polar);

        const rightX = -sinA;
        const rightZ = cosA;

        const upX = cosP * cosA;
        const upY = -sinP;
        const upZ = cosP * sinA;

        targetPos.x += deltaX * rightX * panScaling - deltaY * upX * panScaling;
        targetPos.y += -(deltaY * upY * panScaling);
        targetPos.z += deltaX * rightZ * panScaling - deltaY * upZ * panScaling;

        setTargetDisplay({ x: targetPos.x, y: targetPos.y, z: targetPos.z });
      } else {
        setConfig((prev) => ({
          ...prev,
          azimuth: prev.azimuth + deltaX * 0.007,
          polar: Math.max(
            0.01,
            Math.min(Math.PI - 0.01, prev.polar - deltaY * 0.007),
          ),
        }));
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) isMiddleMouseDown.current = false;
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [targetPos]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleDelta = e.deltaY > 0 ? 1.08 : 0.92;

      setConfig((prev) => {
        const nextDistance = Math.max(1, prev.distance * scaleDelta);
        const changeMagnitude = prev.distance - nextDistance;

        const sinA = Math.sin(prev.azimuth);
        const cosA = Math.cos(prev.azimuth);

        const projX = mouseScreenPos.x * sinA * changeMagnitude * 0.15;
        const projZ = -mouseScreenPos.x * cosA * changeMagnitude * 0.15;

        targetPos.x += projX;
        targetPos.z += projZ;

        setTargetDisplay({ x: targetPos.x, y: targetPos.y, z: targetPos.z });

        return { ...prev, distance: nextDistance };
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [targetPos, mouseScreenPos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const isCtrl = e.ctrlKey;

      if (e.key.toLowerCase() === "h") {
        setShowHUD((p) => !p);
        return;
      }

      switch (key) {
        case "7":
          setConfig((prev) => ({
            ...prev,
            azimuth: -Math.PI / 2,
            polar: isCtrl ? Math.PI - 0.0001 : 0.0001, // Flat ortho top/bottom thresholds
          }));
          break;
        case "1":
          setConfig((prev) => ({
            ...prev,
            azimuth: isCtrl ? -Math.PI / 2 : Math.PI / 2,
            polar: Math.PI / 2,
          }));
          break;
        case "3":
          setConfig((prev) => ({
            ...prev,
            azimuth: isCtrl ? Math.PI : 0,
            polar: Math.PI / 2,
          }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      <Canvas style={{ width: "100%", height: "100vh" }}>
        <SceneContent
          config={config}
          targetPos={targetPos}
          mouseScreenPos={mouseScreenPos}
        />
      </Canvas>

      {showHUD && (
        <>
          <HUDPanel
            config={config}
            targetDisplay={targetDisplay}
            updateConfig={updateConfig}
            resetTarget={resetTarget}
          />
          <ToggleButton
            showHUD={showHUD}
            onClick={() => setShowHUD(!showHUD)}
          />
        </>
      )}
    </div>
  );
}
