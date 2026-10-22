"use client";

import { Canvas } from "@react-three/fiber";
import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

import { SceneConfig } from "./components/types";
import SceneContent from "./components/SceneContent";
import ViewportOverlay from "./components/ViewportOverlay";

const VIEWS = {
  TOP: { polar: 0.01, azimuth: 0, name: "Top" },
  FRONT: { polar: Math.PI / 2, azimuth: 0, name: "Front" },
  RIGHT: { polar: Math.PI / 2, azimuth: Math.PI / 2, name: "Right" },
  LEFT: { polar: Math.PI / 2, azimuth: -Math.PI / 2, name: "Left" },
};

export default function ScenePage() {
  const [config, setConfig] = useState<SceneConfig>({
    distance: 20,
    azimuth: Math.PI / 4,
    polar: Math.PI / 3,
    fov: 50,
    gridSize: 10,
    lightIntensity: 0.8,
    unitSystem: "metric",
  });

  const [showHUD, setShowHUD] = useState(true);
  const [isOrtho, setIsOrtho] = useState(false);
  const [viewMode, setViewMode] = useState("Camera");

  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const isMiddleMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Mouse controls
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
      const current = configRef.current;

      if (e.shiftKey) {
        // Pan
        const panSpeed = current.distance * 0.0008;
        const sinA = Math.sin(current.azimuth);
        const cosA = Math.cos(current.azimuth);
        const sinP = Math.sin(current.polar);
        const cosP = Math.cos(current.polar);

        targetPos.x += (deltaX * -sinA - deltaY * cosP * cosA) * panSpeed;
        targetPos.y += deltaY * sinP * panSpeed;
        targetPos.z += (deltaX * cosA - deltaY * cosP * sinA) * panSpeed;
      } else {
        // Orbit
        setConfig((p) => ({
          ...p,
          azimuth: p.azimuth + deltaX * 0.008,
          polar: Math.max(
            0.01,
            Math.min(Math.PI - 0.01, p.polar - deltaY * 0.008),
          ),
        }));
        setViewMode("Camera");
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

  // Scroll zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = e.deltaY > 0 ? 1.1 : 0.9;
      setConfig((p) => ({
        ...p,
        distance: Math.max(1, Math.min(100, p.distance * zoomSpeed)),
      }));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") {
        setShowHUD((p) => !p);
        return;
      }

      switch (e.key) {
        case "7":
          setConfig((p) => ({ ...p, ...VIEWS.TOP, distance: 20 }));
          setViewMode("Top");
          break;
        case "1":
          setConfig((p) => ({ ...p, ...VIEWS.FRONT, distance: 20 }));
          setViewMode("Front");
          break;
        case "3":
          setConfig((p) => ({ ...p, ...VIEWS.RIGHT, distance: 20 }));
          setViewMode("Right");
          break;
        case "9":
          setConfig((p) => ({ ...p, ...VIEWS.LEFT, distance: 20 }));
          setViewMode("Left");
          break;
        case "5":
          setIsOrtho((p) => !p);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [20, 20, 20], fov: 50 }}
      >
        <SceneContent config={config} targetPos={targetPos} />
      </Canvas>

      <ViewportOverlay
        showHUD={showHUD}
        viewMode={viewMode}
        isOrtho={isOrtho}
      />
    </div>
  );
}
