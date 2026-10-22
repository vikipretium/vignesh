"use client";

interface ViewportOverlayProps {
  showHUD: boolean;
  viewMode: string;
  isOrtho: boolean;
}

export default function ViewportOverlay({
  showHUD,
  viewMode,
  isOrtho,
}: ViewportOverlayProps) {
  if (!showHUD) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 text-white font-mono text-xs z-5">
      {/* Top Left - View Info */}
      <div className="bg-slate-900/60 backdrop-blur px-3 py-2 rounded border border-slate-700 w-fit">
        <div className="text-blue-400 font-bold">{viewMode}</div>
        <div className="text-slate-400">{isOrtho ? "Ortho" : "Persp"}</div>
      </div>
    </div>
  );
}
