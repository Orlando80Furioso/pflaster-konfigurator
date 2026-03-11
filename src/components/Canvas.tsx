import { useRef, useEffect, useCallback, useState, type RefObject } from "react";
import type { Grid, CellState } from "../hooks/useGrid";
import { BND, GRID_W, GRID_H } from "../data/geometry";
import { SURF } from "../data/surfaces";
import { PAT } from "../data/patterns";
import { drawCanvas, OX, OY } from "../renderer/drawCanvas";

const BD = "#1e1e1e";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get mouse/touch position in canvas pixel space, correcting for any CSS
 * transform (zoom/pan) applied to the canvas element.
 * Uses getBoundingClientRect() which already accounts for CSS transform,
 * then scales by canvas.width/rect.width to get the true pixel coordinate.
 */
function canvasPos(
  e: React.MouseEvent | React.TouchEvent,
  canvas: HTMLCanvasElement,
): [number, number] {
  const rect = canvas.getBoundingClientRect();
  const src  = "touches" in e ? e.touches[0]! : e;
  return [
    (src.clientX - rect.left)  * (canvas.width  / rect.width),
    (src.clientY - rect.top)   * (canvas.height / rect.height),
  ];
}

// ── Types ────────────────────────────────────────────────────────────────────

interface CanvasProps {
  wrapRef:     RefObject<HTMLDivElement>;
  grid:        Grid;
  scale:       number;
  showGrid:    boolean;
  setShowGrid: (v: boolean) => void;
  hover:       string | null;
  setHover:    (v: string | null) => void;
  surf:        string;
  pat:         string;
  angle:       number;
  brush:       number;
  onPaint:     (keys: string[], cell: CellState) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function Canvas({
  wrapRef, grid, scale, showGrid, setShowGrid,
  hover, setHover, surf, pat, angle, brush, onPaint,
}: CanvasProps) {
  const cvsRef    = useRef<HTMLCanvasElement>(null);
  const gridRef   = useRef(grid);
  gridRef.current = grid;
  const painting  = useRef(false);

  // ── Zoom & Pan state ───────────────────────────────────────────────────────
  const [zoom, setZoom]       = useState(1);
  const [pan,  setPan]        = useState({ x: 0, y: 0 });
  const [isPanning, setIsPan] = useState(false);
  // Store pan start in a ref so move-handler never captures stale state
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  // Ref mirror of pan for stable access in callbacks
  const panRef = useRef(pan);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // ── Canvas draw ────────────────────────────────────────────────────────────
  useEffect(() => {
    const c = cvsRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W   = BND.x * scale + OX * 2;
    const H   = BND.y * scale + OY * 2;
    c.width  = W;
    c.height = H;
    drawCanvas(ctx, W, H, grid, scale, showGrid, hover);
  }, [grid, scale, showGrid, hover]);

  // ── Wheel zoom (centered on cursor) ───────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect   = el.getBoundingClientRect();
      const cx     = e.clientX - rect.left - rect.width  / 2;
      const cy     = e.clientY - rect.top  - rect.height / 2;
      const factor = e.deltaY < 0 ? 1.13 : 1 / 1.13;
      setZoom(z => {
        const nz    = Math.max(0.4, Math.min(12, z * factor));
        const ratio = nz / z;
        setPan(p => ({
          x: cx - ratio * (cx - p.x),
          y: cy - ratio * (cy - p.y),
        }));
        return nz;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wrapRef]);

  // ── Window-level pan tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      const s = panStart.current;
      if (!s) return;
      setPan({ x: s.px + e.clientX - s.mx, y: s.py + e.clientY - s.my });
    };
    const onUp = () => {
      panStart.current = null;
      setIsPan(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [isPanning]);

  // ── Grid cell hit-testing ──────────────────────────────────────────────────
  const cellFromPos = useCallback((ex: number, ey: number): string | null => {
    const xmm = (ex - OX) / scale;
    const ymm = BND.y - (ey - OY) / scale;
    const k   = `${Math.floor(xmm / GRID_W)}_${Math.floor(ymm / GRID_H)}`;
    return k in gridRef.current ? k : null;
  }, [scale]);

  const keysForBrush = useCallback((key: string): string[] => {
    const [co, ro] = key.split("_").map(Number) as [number, number];
    const r        = Math.floor(brush / 2);
    const keys: string[] = [];
    for (let dr = -r; dr <= r; dr++)
      for (let dc = -r; dc <= r; dc++) {
        const k = `${co + dc}_${ro + dr}`;
        if (k in gridRef.current) keys.push(k);
      }
    return keys;
  }, [brush]);

  // ── Mouse / Touch handlers ─────────────────────────────────────────────────
  const handleDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Middle button (button=1) → start panning
    if ("button" in e && (e as React.MouseEvent).button === 1) {
      (e as React.MouseEvent).preventDefault();
      const me = e as React.MouseEvent;
      panStart.current = { mx: me.clientX, my: me.clientY, px: panRef.current.x, py: panRef.current.y };
      setIsPan(true);
      return;
    }
    // Only paint on primary button
    if ("button" in e && (e as React.MouseEvent).button !== 0) return;
    e.preventDefault();
    const cvs = cvsRef.current;
    if (!cvs) return;
    painting.current = true;
    const [ex, ey] = canvasPos(e, cvs);
    const key = cellFromPos(ex, ey);
    if (key) onPaint(keysForBrush(key), { s: surf, p: pat, a: angle });
  }, [cellFromPos, keysForBrush, surf, pat, angle, onPaint]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) return;          // pan handled by window listener
    const cvs = cvsRef.current;
    if (!cvs) return;
    const [ex, ey] = canvasPos(e, cvs);
    const key = cellFromPos(ex, ey);
    setHover(key);
    if (painting.current && key)
      onPaint(keysForBrush(key), { s: surf, p: pat, a: angle });
  }, [isPanning, cellFromPos, keysForBrush, setHover, surf, pat, angle, onPaint]);

  const handleUp = useCallback(() => { painting.current = false; }, []);

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const zoomBy    = (f: number) =>
    setZoom(z => Math.max(0.4, Math.min(12, z * f)));
  const resetView  = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);
  const centerView = useCallback(() => setPan({ x: 0, y: 0 }), []);

  const isOffCenter = pan.x !== 0 || pan.y !== 0;

  const btnBase: React.CSSProperties = {
    padding: "2px 7px", fontSize: 9, fontWeight: 700,
    background: "rgba(10,10,10,0.88)",
    color: "#888",
    border: `1px solid ${BD}`, borderRadius: 3,
    cursor: "pointer", lineHeight: 1.6,
  };

  // ── CSS transform applied to the canvas ───────────────────────────────────
  const transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
  const cursor    = isPanning ? "grabbing" : zoom > 1.01 ? "grab" : "crosshair";

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", background: "#141414", position: "relative",
        minHeight: 0,
      }}
    >
      {/* ── Canvas with zoom/pan transform ── */}
      <div style={{ transform, transformOrigin: "center center", willChange: "transform", lineHeight: 0 }}>
        <canvas
          ref={cvsRef}
          style={{ cursor, display: "block" }}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}
          onContextMenu={e => e.preventDefault()}
        />
      </div>

      {/* ── Grid toggle ── */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        style={{
          ...btnBase,
          position: "absolute", top: 10, left: 10,
          padding: "3px 9px",
          background:   showGrid ? "#1a2e12" : "rgba(10,10,10,0.88)",
          color:        showGrid ? "#8bc34a" : "#555",
          border:       showGrid ? "1px solid #3d7a18" : `1px solid ${BD}`,
          letterSpacing: "0.05em",
        }}
      >
        ⊞ Raster 20,65cm {showGrid ? "AN" : "AUS"}
      </button>

      {/* ── Zoom controls (bottom-left) ── */}
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        display: "flex", gap: 3, alignItems: "center",
      }}>
        <button onClick={() => zoomBy(1.3)}  style={btnBase} title="Hineinzoomen">＋</button>
        <button
          onClick={resetView}
          style={{ ...btnBase, minWidth: 44, textAlign: "center" as const, color: zoom !== 1 ? "#c4c0b8" : "#555" }}
          title="Zoom zurücksetzen"
        >
          {(zoom * 100).toFixed(0)}%
        </button>
        <button onClick={() => zoomBy(1 / 1.3)} style={btnBase} title="Herauszoomen">－</button>
        <button
          onClick={centerView}
          title="Ansicht zentrieren"
          style={{
            ...btnBase,
            marginLeft: 4,
            background: isOffCenter ? "rgba(30,46,20,0.92)" : "rgba(10,10,10,0.88)",
            color:      isOffCenter ? "#8bc34a"             : "#444",
            border:     isOffCenter ? "1px solid #3d7a18"   : `1px solid ${BD}`,
          }}
        >⊕ Zentrieren</button>
        <span style={{ fontSize: 7.5, color: "#333", marginLeft: 2 }}>
          Rad · Mitteltaste pan
        </span>
      </div>

      {/* ── North indicator (top-right) ── */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        width: 22, height: 22, borderRadius: "50%",
        background: "#0f0f0f", border: `1px solid ${BD}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700, color: "#5a8a2a",
        pointerEvents: "none",
      }}>N</div>

      {/* ── Status bar (bottom-right) ── */}
      <div style={{
        position: "absolute", bottom: 10, right: 10,
        background: "rgba(10,10,10,0.92)", border: `1px solid ${BD}`,
        borderRadius: 4, padding: "3px 8px", fontSize: 8.5, color: "#777",
        display: "flex", gap: 6, pointerEvents: "none",
      }}>
        <span style={{ color: "#e8e4dc", fontWeight: 700 }}>{SURF[surf]?.label}</span>
        <span style={{ color: "#5a9a2a" }}>{PAT[pat]?.kurz}</span>
        <span style={{ color: "#4a7a1e" }}>{angle}°</span>
      </div>
    </div>
  );
}
