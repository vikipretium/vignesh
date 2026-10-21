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
  panX: number;
  panZ: number;
}

function SceneContent({ config }: { config: SceneConfig }) {
  const { camera } = useThree();

  useEffect(() => {
    // Spherical to Cartesian coordinates relative to target
    const offsetX =
      config.distance * Math.sin(config.polar) * Math.cos(config.azimuth);
    const offsetY = config.distance * Math.cos(config.polar);
    const offsetZ =
      config.distance * Math.sin(config.polar) * Math.sin(config.azimuth);

    // Position camera with the current XZ pan offsets applied
    camera.position.set(config.panX + offsetX, offsetY, config.panZ + offsetZ);

    // Look at the panned center point on the XZ floor plane
    camera.lookAt(config.panX, 0, config.panZ);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.fov;
      camera.updateProjectionMatrix();
    }
  }, [
    config.distance,
    config.azimuth,
    config.polar,
    config.fov,
    config.panX,
    config.panZ,
    camera,
  ]);

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
    panX: 0,
    panZ: 0,
  });

  const [showHUD, setShowHUD] = useState(true);

  const isMiddleMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const updateConfig = (key: keyof SceneConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Middle-click orbit, pan, and zoom
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

      if (e.ctrlKey) {
        // ZOOM mode (Ctrl + middle click drag)
        const zoomSpeed = 0.3;
        setConfig((prev) => ({
          ...prev,
          distance: Math.max(
            5,
            Math.min(50, prev.distance - deltaY * zoomSpeed),
          ),
        }));
      } else if (e.shiftKey) {
        // PAN mode (Shift + middle click drag) restricted to XZ Plane
        // Scale factor matches world dimensions closer based on viewport camera distance
        const panSpeed = (prev) => prev.distance * 0.0015;

        setConfig((prev) => {
          const speed = panSpeed(prev);

          // Calculate camera forward/right vector projections onto the flat XZ plane
          const sinA = Math.sin(prev.azimuth);
          const cosA = Math.cos(prev.azimuth);

          // Screen horizontal delta moves camera relative along local camera Right vector
          // Screen vertical delta moves camera relative along local camera Forward projection vector
          const moveX = (deltaX * sinA - deltaY * cosA) * speed;
          const moveZ = (-deltaX * cosA - deltaY * sinA) * speed;

          return {
            ...prev,
            panX: prev.panX + moveX,
            panZ: prev.panZ + moveZ,
          };
        });
      } else {
        // ORBIT mode (default)
        setConfig((prev) => ({
          ...prev,
          azimuth: prev.azimuth + deltaX * 0.01,
          polar: Math.max(
            0.1,
            Math.min(Math.PI / 2 - 0.05, prev.polar - deltaY * 0.01),
          ),
        }));
      }

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

  // Keyboard toggle HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") {
        setShowHUD((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll wheel zoom toward cursor
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // Skip if ctrl is held

      e.preventDefault();

      const zoomSpeed = 0.5;
      const deltaY = e.deltaY > 0 ? 1 : -1;

      setConfig((prev) => ({
        ...prev,
        distance: Math.max(5, Math.min(50, prev.distance + deltaY * zoomSpeed)),
      }));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="relative w-full h-screen select-none">
      <Canvas style={{ width: "100%", height: "100vh" }}>
        <SceneContent config={config} />
      </Canvas>

      {/* HUD Overlay */}
      {showHUD && (
        <div className="absolute top-4 left-4 bg-black/70 text-white p-6 rounded-lg w-80 space-y-4 max-h-[90vh] overflow-y-auto z-10">
          <h2 className="text-xl font-bold">Camera Controls</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            🖱️ <strong>Orbit:</strong> Middle Drag <br />
            🔍 <strong>Zoom:</strong> Scroll (or Ctrl + Middle Drag) <br />✋{" "}
            <strong>Floor Pan:</strong> Shift + Middle Drag <br />
            ⌨️ Press <strong>H</strong> to toggle panel visibility
          </p>

          <hr className="border-gray-600" />

          <div>
            <label className="block text-sm font-semibold mb-1">
              Target Coordinates (XZ)
            </label>
            <div className="text-xs text-gray-300 bg-black/40 p-2 rounded monospace">
              X: {config.panX.toFixed(2)} | Z: {config.panZ.toFixed(2)}
            </div>
            <button
              onClick={() =>
                setConfig((prev) => ({ ...prev, panX: 0, panZ: 0 }))
              }
              className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded w-full transition"
            >
              Reset Pan to Center
            </button>
          </div>

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

          <div>
            <label className="block text-sm font-semibold mb-2">
              Sky Preset
            </label>
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

      {/* Toggle Button */}
      <button
        onClick={() => setShowHUD(!showHUD)}
        className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded cursor-pointer z-10"
      >
        {showHUD ? "🙈 Hide HUD" : "👁️ Show HUD"}
      </button>
    </div>
  );
}
