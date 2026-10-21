"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Grid, Environment } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

interface SceneConfig {
  distance: number;
  azimuth: number;
  polar: number;
  fov: number;
  gridSize: number;
  skyPreset: string;
  lightIntensity: number;
}

function SceneContent({ config }: { config: SceneConfig }) {
  const { camera } = useThree();

  useEffect(() => {
    const x =
      config.distance * Math.sin(config.polar) * Math.cos(config.azimuth);
    const y = config.distance * Math.cos(config.polar);
    const z =
      config.distance * Math.sin(config.polar) * Math.sin(config.azimuth);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.fov;
      camera.updateProjectionMatrix();
    }
  }, [config.distance, config.azimuth, config.polar, config.fov, camera]);

  return (
    <>
      <Environment preset={config.skyPreset as any} />
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellColor="#6f7280"
        sectionSize={config.gridSize}
        sectionColor="#d1d5db"
        fadeStrength={1}
        fadeDistance={100}
        infiniteGrid
      />
      <ambientLight intensity={config.lightIntensity} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={config.lightIntensity * 2}
      />
    </>
  );
}

export default function Scene() {
  const [config, setConfig] = useState<SceneConfig>({
    distance: 15,
    azimuth: 0,
    polar: Math.PI / 4,
    fov: 75,
    gridSize: 10,
    skyPreset: "sunset",
    lightIntensity: 0.5,
  });

  const [showHUD, setShowHUD] = useState(true); // ADD THIS

  const isMiddleMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const updateConfig = (key: keyof SceneConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Mouse events for middle-click orbit
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        isMiddleMouseDown.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMiddleMouseDown.current) return;

      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;

      setConfig((prev) => ({
        ...prev,
        azimuth: prev.azimuth + deltaX * 0.01,
        polar: Math.max(
          0.1,
          Math.min(Math.PI - 0.1, prev.polar - deltaY * 0.01),
        ),
      }));

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        isMiddleMouseDown.current = false;
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ADD THIS EFFECT FOR H KEY TOGGLE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") {
        setShowHUD((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Canvas */}
      <Canvas style={{ width: "100%", height: "100vh" }}>
        <SceneContent config={config} />
      </Canvas>

      {/* HUD Overlay - Top Left - WRAPPED WITH CONDITIONAL */}
      {showHUD && (
        <div className="absolute top-4 left-4 bg-black/70 text-white p-6 rounded-lg w-80 space-y-4 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-bold">Camera Controls</h2>
          <p className="text-xs text-gray-400">
            🖱️ Middle-click + drag to orbit | Press H to hide
          </p>

          {/* Distance */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Distance: {config.distance.toFixed(1)}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={config.distance}
              onChange={(e) =>
                updateConfig("distance", parseFloat(e.target.value))
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* FOV */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              FOV (Zoom): {config.fov}
            </label>
            <input
              type="range"
              min="20"
              max="120"
              step="1"
              value={config.fov}
              onChange={(e) => updateConfig("fov", parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Grid Size */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Grid Section: {config.gridSize}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={config.gridSize}
              onChange={(e) =>
                updateConfig("gridSize", parseInt(e.target.value))
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Light Intensity */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Light: {config.lightIntensity.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.lightIntensity}
              onChange={(e) =>
                updateConfig("lightIntensity", parseFloat(e.target.value))
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Sky Preset */}
          <div>
            <label className="block text-sm font-semibold mb-2">Sky</label>
            <select
              value={config.skyPreset}
              onChange={(e) => updateConfig("skyPreset", e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded cursor-pointer"
            >
              <option>sunset</option>
              <option>dawn</option>
              <option>night</option>
              <option>warehouse</option>
              <option>forest</option>
              <option>apartment</option>
              <option>studio</option>
              <option>city</option>
            </select>
          </div>
        </div>
      )}

      {/* Toggle Button - Bottom Right - ADD THIS */}
      <button
        onClick={() => setShowHUD(!showHUD)}
        className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded cursor-pointer"
      >
        {showHUD ? "🙈 Hide HUD" : "👁️ Show HUD"}
      </button>
    </div>
  );
}
