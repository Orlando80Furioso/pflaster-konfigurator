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
    /* Full viewport height, no footer – panels use every pixel */
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>

      {/* ── Header (compact) ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "4px 10px",
        background: PNL, borderBottom: `1px solid ${BD}`,
        flexShrink: 0, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em" }}>
            PFLASTER-KONFIGURATOR
          </div>
          <div style={{ fontSize: 7.5, color: "#444" }}>
            Godelmann · Einfahrt Korschenbroich · Nr. 3015 · 0034 · 1032 · 1040 · 2006
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
          {PRESET_ORDER.map(name => (
            <button
              key={name}
              onClick={() => applyPreset(PRESETS[name]!)}
              style={{
                padding: "2px 7px", fontSize: 8.5, fontWeight: 600,
                background: "#1a1a1a", color: "#888",
                border: `1px solid ${BD}`, borderRadius: 3,
              }}
            >{name}</button>
          ))}
          <button
            onClick={undo}
            disabled={!histLen}
            style={{
              padding: "2px 7px", fontSize: 8.5, fontWeight: 600,
              background: "#1a1a1a",
              color:  histLen ? "#e8e4dc" : "#333",
              border: `1px solid ${BD}`, borderRadius: 3,
            }}
          >↺ Undo</button>
          <button
            onClick={reset}
            style={{
              padding: "2px 7px", fontSize: 8.5, fontWeight: 600,
              background: "#1a1a1a", color: "#e8731a",
              border: `1px solid ${BD}`, borderRadius: 3,
            }}
          >Reset</button>
        </div>
      </div>

      {/* ── Main layout: panels fill everything below header ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

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
    </div>
  );
}
