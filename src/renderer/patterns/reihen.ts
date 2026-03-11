import type { Surface } from "../../data/surfaces";
import { GRID } from "../../data/geometry";
import { drawStone } from "../drawStone";

// Reihenverband (row bond) – also used for Kreuzverband (same visual structure)
// 50% offset on alternating rows
export function renderReihen(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  surf: Surface,
  _rr: (n: number) => number,
  rowOffset: number,
): void {
  const sc   = w / GRID;
  const sWpx = surf.sW * sc;
  const sHpx = surf.sH * sc;
  const fSpx = Math.max(1.0, surf.fS * sc);
  const fLpx = Math.max(1.0, surf.fL * sc);
  const step = sWpx + fSpx;

  let yi  = y;
  let row = rowOffset;

  while (yi < y + h) {
    const off = (row % 2 === 1) ? -(sWpx * 0.5) : 0;
    let xi = x + off;
    while (xi < x + w + sWpx) {
      // Integer stone-column index → same colour from any adjacent cell, no seam
      const colorSeed = Math.round(xi / step) * 7.1 + row * 3.7;
      drawStone(ctx, xi, yi, sWpx, sHpx, surf, colorSeed);
      ctx.fillStyle = surf.colFugeS;
      ctx.fillRect(xi + sWpx, yi, fSpx, sHpx);
      xi += step;
    }
    ctx.fillStyle = surf.colFugeL;
    ctx.fillRect(x, yi + sHpx, w, fLpx);
    yi  += sHpx + fLpx;
    row++;
  }
}
