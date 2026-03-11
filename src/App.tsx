import { useState, useRef, useCallback } from "react";
import { useGrid } from "./hooks/useGrid";
import { useScale } from "./hooks/useScale";
import { Toolbar } from "./components/Toolbar";
import { Canvas } from "./components/Canvas";
import { Stats } from "./components/Stats";
import { PRESETS, PRESET_ORDER } from "./data/presets";
import type { CellState } from "./hooks/useGrid";

const PNL = "#0f0f0f";
const BD  = "#1e1e1e";

type Tab = "surf" | "pat" | "angle";

export default function App() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scale   = useScale(wrapRef);

  const { grid, histLen, paint, undo, reset, applyPreset } = useGrid();

  // Active brush state
  const [surf,     setSurf]     = useState("t3");
  const [pat,      setPat]      = useState("reihen");
  const [angle,    setAngle]    = useState(0);
  const [brush,    setBrush]    = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [hover,    setHover]    = useState<string | null>(null);
  const [tab,      setTab]      = useState<Tab>("surf");

  const handlePaint = useCallback((keys: string[], cell: CellState) => {
    paint(keys, cell);
  }, [paint]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 12px",
        background: PNL, borderBottom: `1px solid ${BD}`,
        flexShrink: 0, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em" }}>
            PFLASTER-KONFIGURATOR
          </div>
          <div style={{ fontSize: 8, color: "#555" }}>
            Godelmann Verlegemuster · Maßstabsgerechte Darstellung · Einfahrt Korschenbroich
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {PRESET_ORDER.map(name => (
            <button
              key={name}
              onClick={() => applyPreset(PRESETS[name]!)}
              style={{
                padding: "3px 8px", fontSize: 9, fontWeight: 600,
                background: "#1a1a1a", color: "#888",
                border: `1px solid ${BD}`, borderRadius: 3,
              }}
            >{name}</button>
          ))}
          <button
            onClick={undo}
            disabled={!histLen}
            style={{
              padding: "3px 8px", fontSize: 9, fontWeight: 600,
              background: "#1a1a1a",
              color:  histLen ? "#e8e4dc" : "#3a3a3a",
              border: `1px solid ${BD}`, borderRadius: 3,
            }}
          >↺ Undo</button>
          <button
            onClick={reset}
            style={{
              padding: "3px 8px", fontSize: 9, fontWeight: 600,
              background: "#1a1a1a", color: "#e8731a",
              border: `1px solid ${BD}`, borderRadius: 3,
            }}
          >Reset</button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        <Toolbar
          surf={surf}   setSurf={setSurf}
          pat={pat}     setPat={setPat}
          angle={angle} setAngle={setAngle}
          brush={brush} setBrush={setBrush}
          tab={tab}     setTab={setTab}
        />

        <Canvas
          wrapRef={wrapRef}
          grid={grid}
          scale={scale}
          showGrid={showGrid} setShowGrid={setShowGrid}
          hover={hover}       setHover={setHover}
          surf={surf} pat={pat} angle={angle} brush={brush}
          onPaint={handlePaint}
        />

        <Stats grid={grid} hover={hover} />
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: "3px 12px",
        background: "#0a0a0a", borderTop: `1px solid ${BD}`,
        fontSize: 7.5, color: "#333",
        display: "flex", gap: 12, flexShrink: 0,
      }}>
        <span>FreeCAD Einfahrt.FCStd · Zellraster 300×300mm · Maßstabsgerechte Steindarstellung</span>
        <span>Godelmann Nr. 3015 · 0034 · 1032 · 1040 · 2006</span>
        <span style={{ color: "#3d7a18" }}>← Klicken/Ziehen · Tabs: Fläche / Muster / Winkel</span>
      </div>
    </div>
  );
}
