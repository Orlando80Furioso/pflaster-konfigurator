import { useRef, useEffect, useCallback, type RefObject } from "react";
import type { Grid, CellState } from "../hooks/useGrid";
import { BND, GRID_W, GRID_H } from "../data/geometry";
import { SURF } from "../data/surfaces";
import { PAT } from "../data/patterns";
import { drawCanvas, OX, OY } from "../renderer/drawCanvas";

const BD = "#1e1e1e";

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

function getEventPos(e: React.MouseEvent | React.TouchEvent, el: HTMLElement): [number, number] {
  const rect = el.getBoundingClientRect();
  const src  = "touches" in e ? e.touches[0]! : e;
  return [src.clientX - rect.left, src.clientY - rect.top];
}

export function Canvas({
  wrapRef, grid, scale, showGrid, setShowGrid,
  hover, setHover, surf, pat, angle, brush, onPaint,
}: CanvasProps) {
  const cvsRef    = useRef<HTMLCanvasElement>(null);
  const gridRef   = useRef(grid);
  gridRef.current = grid;
  const painting  = useRef(false);

  // Draw whenever anything changes
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

  // Convert canvas pixel position to grid cell key
  const cellFromPos = useCallback((ex: number, ey: number): string | null => {
    const xmm = (ex - OX) / scale;
    const ymm = BND.y - (ey - OY) / scale;
    // Rectangular cells: GRID_W wide, GRID_H tall
    const k   = `${Math.floor(xmm / GRID_W)}_${Math.floor(ymm / GRID_H)}`;
    return k in gridRef.current ? k : null;
  }, [scale]);

  // Collect all keys for brush radius
  const keysForBrush = useCallback((key: string): string[] => {
    const [co, ro] = key.split("_").map(Number) as [number, number];
    const r        = Math.floor(brush / 2);
    const keys: string[] = [];
    for (let dr = -r; dr <= r; dr++) {
      for (let dc = -r; dc <= r; dc++) {
        const k = `${co + dc}_${ro + dr}`;
        if (k in gridRef.current) keys.push(k);
      }
    }
    return keys;
  }, [brush]);

  const handleDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    painting.current = true;
    const c = cvsRef.current;
    if (!c) return;
    const [ex, ey] = getEventPos(e, c);
    const key = cellFromPos(ex, ey);
    if (key) onPaint(keysForBrush(key), { s: surf, p: pat, a: angle });
  }, [cellFromPos, keysForBrush, surf, pat, angle, onPaint]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const c = cvsRef.current;
    if (!c) return;
    const [ex, ey] = getEventPos(e, c);
    const key = cellFromPos(ex, ey);
    setHover(key);
    if (painting.current && key) {
      onPaint(keysForBrush(key), { s: surf, p: pat, a: angle });
    }
  }, [cellFromPos, keysForBrush, setHover, surf, pat, angle, onPaint]);

  const handleUp = useCallback(() => { painting.current = false; }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 8, overflow: "hidden", background: "#141414", position: "relative",
      }}
    >
      <canvas
        ref={cvsRef}
        style={{ cursor: "crosshair", display: "block", maxWidth: "100%", maxHeight: "100%" }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
      />

      {/* Grid toggle */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        style={{
          position: "absolute", top: 14, left: 14,
          padding: "4px 10px", fontSize: 8.5, fontWeight: 700,
          background:   showGrid ? "#1a2e12" : "rgba(10,10,10,0.85)",
          color:        showGrid ? "#8bc34a" : "#555",
          border:       showGrid ? "1px solid #3d7a18" : `1px solid ${BD}`,
          borderRadius: 3, cursor: "pointer", letterSpacing: "0.05em",
        }}
      >
        ⊞ Raster 20,65cm {showGrid ? "AN" : "AUS"}
      </button>

      {/* North indicator */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        width: 22, height: 22, borderRadius: "50%",
        background: "#0f0f0f", border: `1px solid ${BD}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700, color: "#5a8a2a",
      }}>N</div>

      {/* Status bar */}
      <div style={{
        position: "absolute", bottom: 18, right: 14,
        background: "rgba(10,10,10,0.92)", border: `1px solid ${BD}`,
        borderRadius: 4, padding: "4px 9px", fontSize: 8.5, color: "#777",
        display: "flex", gap: 6,
      }}>
        <span style={{ color: "#e8e4dc", fontWeight: 700 }}>{SURF[surf]?.label}</span>
        <span style={{ color: "#5a9a2a" }}>{PAT[pat]?.kurz}</span>
        <span style={{ color: "#4a7a1e" }}>{angle}°</span>
      </div>
    </div>
  );
}
