"use client";

import { SceneConfig, TargetCoordinates } from "./types";

interface HUDPanelProps {
  config: SceneConfig;
  targetDisplay: TargetCoordinates;
  updateConfig: (key: keyof SceneConfig, value: any) => void;
  resetTarget: () => void;
}

export default function HUDPanel({
  config,
  targetDisplay,
  updateConfig,
  resetTarget,
}: HUDPanelProps) {
  const formatLength = (meters: number) => {
    if (config.unitSystem === "metric") {
      return `${meters.toFixed(2)} m`;
    }
    const feet = meters * 3.28084;
    return `${feet.toFixed(2)} ft`;
  };

  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 p-5 rounded-xl w-80 space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200 shadow-xl z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Viewport Settings
        </h2>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => updateConfig("unitSystem", "metric")}
            className={`px-2.5 py-1 rounded-md font-medium transition ${config.unitSystem === "metric" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
          >
            Metric
          </button>
          <button
            onClick={() => updateConfig("unitSystem", "imperial")}
            className={`px-2.5 py-1 rounded-md font-medium transition ${config.unitSystem === "imperial" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
          >
            Imperial
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
        🖱️ <strong>Orbit:</strong> Middle Mouse Drag <br />✋{" "}
        <strong>True XYZ Pan:</strong> Shift + Middle Drag (Inverted)
        <br />
        🔍 <strong>Cursor Zoom:</strong> Scroll Wheel Frame <br />
        ⌨️ Press <strong>H</strong> to hide metrics panel
      </p>

      <div className="space-y-3 pt-1">
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-1.5 font-mono text-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-sans font-semibold">
            Anchor Coordinates
          </span>
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">X</span>
              <span className="text-slate-900 font-bold">
                {formatLength(targetDisplay.x).split(" ")[0]}
              </span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Y</span>
              <span className="text-slate-900 font-bold">
                {formatLength(targetDisplay.y).split(" ")[0]}
              </span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Z</span>
              <span className="text-slate-900 font-bold">
                {formatLength(targetDisplay.z).split(" ")[0]}
              </span>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-1 font-sans">
            Units: {config.unitSystem === "metric" ? "meters (m)" : "feet (ft)"}
          </div>
          <button
            onClick={resetTarget}
            className="w-full mt-2 py-1 bg-slate-200 hover:bg-slate-300 text-[11px] font-sans rounded transition font-medium text-slate-700"
          >
            Reset Focus to Center
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Orbit Distance</span>
            <span className="text-slate-600 font-mono">
              {formatLength(config.distance)}
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            step="0.5"
            value={config.distance}
            onChange={(e) =>
              updateConfig("distance", parseFloat(e.target.value))
            }
            className="w-full accent-slate-800 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Field of View</span>
            <span className="text-slate-600 font-mono">{config.fov}°</span>
          </div>
          <input
            type="range"
            min="15"
            max="110"
            value={config.fov}
            onChange={(e) => updateConfig("fov", parseInt(e.target.value))}
            className="w-full accent-slate-800 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Grid Major Interval</span>
            <span className="text-slate-600 font-mono">
              {config.gridSize} {config.unitSystem === "metric" ? "m" : "yd"}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            value={config.gridSize}
            onChange={(e) => updateConfig("gridSize", parseInt(e.target.value))}
            className="w-full accent-slate-800 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
