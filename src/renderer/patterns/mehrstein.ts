import type { Surface } from "../../data/surfaces";
import { GRID } from "../../data/geometry";
import { drawStone } from "../drawStone";

// Mehrstein AU/AW Nr. 1032 – 30/20 + 20/20 + 20/10 pattern
// Full rows alternate with half-height rows
export function renderMehrstein(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  surf: Surface,
  rr: (n: number) => number,
  rowOffset: number,
): void {
  const sc   = w / GRID;
  const sWpx = surf.sW * sc;
  const sHpx = surf.sH * sc;
  const fSpx = Math.max(1.0, surf.fS * sc);
  const fLpx = Math.max(1.0, surf.fL * sc);

  const seqFull = [sWpx, sWpx * 0.667, sWpx * 0.667];
  const seqHalf = [sWpx * 0.667, sWpx * 0.667, sWpx * 0.667];
  const offsets = [0, sWpx * 0.33, sWpx * 0.67, 0];

  let yi  = y;
  let row = rowOffset;

  while (yi < y + h) {
    const isHalf = row % 2 !== 0;
    const rH     = isHalf ? sHpx * 0.5 : sHpx;
    const seq    = isHalf ? seqHalf : seqFull;
    let xi = x - (offsets[row % offsets.length] ?? 0);
    let si = 0;
    while (xi < x + w + sWpx) {
      const sw = seq[si % seq.length]!;
      drawStone(ctx, xi, yi, sw, rH, surf, rr, xi * 0.03 + row * 7.3 + si);
      ctx.fillStyle = surf.colFugeS;
      ctx.fillRect(xi + sw, yi, fSpx, rH);
      xi += sw + fSpx;
      si++;
    }
    ctx.fillStyle = surf.colFugeL;
    ctx.fillRect(x, yi + rH, w, fLpx);
    yi  += rH + fLpx;
    row++;
  }
}
