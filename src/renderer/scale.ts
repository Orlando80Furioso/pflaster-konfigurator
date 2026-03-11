import { BND } from "../data/geometry";

// Global scale: max 0.055 px/mm to prevent oversized display on small screens
export function calcScale(canvasW: number, canvasH: number): number {
  return Math.min(canvasW / BND.x, canvasH / BND.y, 0.055);
}
