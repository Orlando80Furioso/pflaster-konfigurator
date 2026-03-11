import type { Surface } from "../../data/surfaces";
import { GRID } from "../../data/geometry";
import { drawStone } from "../drawStone";

// Großformat-Reihenverband Nr. 1040 – 60/40 + 40/20 + 40/40
// Repeating 4-row cycle with varying heights and widths
export function renderGrossformat(
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

  const rowDefs = [
    { rH: sHpx * 2.0, seqW: [sWpx * 2.0,  sWpx * 1.33, sWpx * 1.33] },
    { rH: sHpx * 1.0, seqW: [sWpx * 1.33,  sWpx * 1.33, sWpx * 1.33] },
    { rH: sHpx * 2.0, seqW: [sWpx * 2.0,   sWpx * 2.0,  sWpx * 1.33] },
    { rH: sHpx * 1.0, seqW: [sWpx * 1.0,   sWpx * 1.33, sWpx * 0.33] },
  ];

  let yi  = y;
  let row = rowOffset;

  while (yi < y + h) {
    const rd = rowDefs[row % rowDefs.length]!;
    let xi = x - (row % 2 ? sWpx : 0);
    let si = 0;
    while (xi < x + w + sWpx * 2) {
      const sw        = rd.seqW[si % rd.seqW.length]!;
      const colorSeed = Math.round(xi / step) * 7.1 + row * 9.1;
      drawStone(ctx, xi, yi, sw, rd.rH, surf, colorSeed);
      ctx.fillStyle = surf.colFugeS;
      ctx.fillRect(xi + sw, yi, fSpx, rd.rH);
      xi += sw + fSpx;
      si++;
    }
    ctx.fillStyle = surf.colFugeL;
    ctx.fillRect(x, yi + rd.rH, w, fLpx);
    yi  += rd.rH + fLpx;
    row++;
  }
}
