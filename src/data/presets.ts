import type { CellState } from "../hooks/useGrid";
import { GRID_W, GRID_H } from "./geometry";

export type PresetFn = (col: number, row: number) => CellState;

export const PRESETS: Record<string, PresetFn> = {
  "Plan V2": (c, r) => {
    const x = c * GRID_W + GRID_W / 2;
    const y = r * GRID_H + GRID_H / 2;
    if (
      (x < 2600 && y > 1000 && y < 2900) ||
      (x > 4200 && x < 7400 && y < 2800) ||
      (x > 9500 && y > 4900 && y < 6600)
    ) return { s: "t6", p: "reihen", a: 0 };
    if (y < 4740 || x >= 8120) return { s: "t1", p: "reihen", a: 0 };
    return { s: "t5", p: "reihen", a: 0 };
  },
  "Alles t1":  () => ({ s: "t1", p: "reihen", a: 0 }),
  "Max. Grün": () => ({ s: "t6", p: "reihen", a: 0 }),
  "Wild":      () => ({ s: "t3", p: "wild",   a: 0 }),
  "Großfmt.":  () => ({ s: "t1", p: "grossformat", a: 0 }),
};

export const PRESET_ORDER = ["Plan V2", "Alles t1", "Max. Grün", "Wild", "Großfmt."] as const;
