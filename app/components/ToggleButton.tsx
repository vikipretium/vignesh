"use client";

interface ToggleButtonProps {
  showHUD: boolean;
  onClick: () => void;
}

export default function ToggleButton({ showHUD, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer font-medium tracking-wide transition z-10 select-none"
    >
      {showHUD ? "🙈 Hide HUD" : "👁️ Show HUD"}
    </button>
  );
}
