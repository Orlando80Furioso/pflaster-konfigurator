import { useState, useRef, useCallback } from "react";
import { POLY, GRID_W, GRID_H, pip } from "../data/geometry";
import { BND } from "../data/geometry";
import type { PresetFn } from "../data/presets";

export interface CellState {
  s: string  // surfId
  p: string  // patId
  a: number  // angleDeg
}

export type Grid = Record<string, CellState>;

function buildInitialGrid(): Grid {
  const g: Grid = {};
  // Rows: height = GRID_H = 206.5mm = 1 stone row (sH + fL)
  // Cols: width  = GRID_W = 300mm   = 1 stone width
  for (let r = 0; r < Math.ceil(BND.y / GRID_H); r++) {
    for (let c = 0; c < Math.ceil(BND.x / GRID_W); c++) {
      if (pip(c * GRID_W + GRID_W / 2, r * GRID_H + GRID_H / 2, POLY)) {
        g[`${c}_${r}`] = { s: "t3", p: "reihen", a: 0 };
      }
    }
  }
  return g;
}

export function useGrid() {
  const [grid, setGrid] = useState<Grid>(buildInitialGrid);
  const gridRef = useRef<Grid>(grid);
  gridRef.current = grid;

  // History stored in a ref to avoid stale closure issues
  const histRef  = useRef<string[]>([]);
  const [histLen, setHistLen] = useState(0);

  const saveHistory = useCallback(() => {
    histRef.current = [...histRef.current.slice(-29), JSON.stringify(gridRef.current)];
    setHistLen(histRef.current.length);
  }, []);

  const paint = useCallback((keys: string[], cell: CellState) => {
    saveHistory();
    setGrid(prev => {
      const n = { ...prev };
      for (const k of keys) {
        if (k in n) n[k] = cell;
      }
      return n;
    });
  }, [saveHistory]);

  const undo = useCallback(() => {
    if (!histRef.current.length) return;
    const prev = histRef.current[histRef.current.length - 1]!;
    histRef.current = histRef.current.slice(0, -1);
    setHistLen(histRef.current.length);
    setGrid(JSON.parse(prev) as Grid);
  }, []);

  const reset = useCallback(() => {
    saveHistory();
    setGrid(buildInitialGrid());
  }, [saveHistory]);

  const applyPreset = useCallback((fn: PresetFn) => {
    saveHistory();
    setGrid(prev => {
      const n = { ...prev };
      for (const k of Object.keys(n)) {
        const [co, ro] = k.split("_").map(Number) as [number, number];
        n[k] = fn(co, ro);
      }
      return n;
    });
  }, [saveHistory]);

  return { grid, gridRef, histLen, paint, undo, reset, applyPreset };
}
