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
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 p-5 rounded-xl w-80 space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200 shadow-xl z-10 select-none">
      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs w-full justify-between">
        <button
          onClick={() => updateConfig("unitSystem", "metric")}
          className={`flex-1 py-1 rounded-md font-medium transition ${config.unitSystem === "metric" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
        >
          Metric
        </button>
        <button
          onClick={() => updateConfig("unitSystem", "imperial")}
          className={`flex-1 py-1 rounded-md font-medium transition ${config.unitSystem === "imperial" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
        >
          Imperial
        </button>
      </div>

      {/* Camera Live Location Parameters View */}
      <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-2 font-mono text-xs shadow-inner">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-sans font-semibold">
          Camera Coordinates
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[9px]">POS X</span>
            <span id="cam-pos-x" className="text-slate-900 font-bold">
              0.00 m
            </span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[9px]">POS Y</span>
            <span id="cam-pos-y" className="text-slate-900 font-bold">
              0.00 m
            </span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[9px]">POS Z</span>
            <span id="cam-pos-z" className="text-slate-900 font-bold">
              0.00 m
            </span>
          </div>
        </div>

        {/* Camera Live Rotation Parameters View */}
        <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[9px]">PITCH (X)</span>
            <span id="cam-rot-x" className="text-slate-700 font-bold">
              0°
            </span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[9px]">YAW (Y)</span>
            <span id="cam-rot-y" className="text-slate-700 font-bold">
              0°
            </span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[9px]">ROLL (Z)</span>
            <span id="cam-rot-z" className="text-slate-700 font-bold">
              0°
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-1.5 font-mono text-xs shadow-inner">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-sans font-semibold">
          Anchor Coordinates
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">X</span>
            <span className="text-slate-900 font-bold">
              {formatLength(targetDisplay.x).split(" ")}
            </span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Y</span>
            <span className="text-slate-900 font-bold">
              {formatLength(targetDisplay.y).split(" ")}
            </span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Z</span>
            <span className="text-slate-900 font-bold">
              {formatLength(targetDisplay.z).split(" ")}
            </span>
          </div>
        </div>
        <button
          onClick={resetTarget}
          className="w-full mt-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-[11px] font-sans rounded transition font-medium text-slate-700 active:scale-[0.98]"
        >
          Reset Target to Center
        </button>
      </div>
    </div>
  );
}
