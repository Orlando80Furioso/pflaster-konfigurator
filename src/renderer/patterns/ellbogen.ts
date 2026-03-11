import type { Surface } from "../../data/surfaces";
import { GRID } from "../../data/geometry";
import { drawStone } from "../drawStone";

// Ellbogenverband Nr. 3015 – 40/20 + 20/20 pattern
// Alternating rows with sequences: [1.0, 1.0, 0.5] and [0.5, 1.0, 1.0]
export function renderEllbogen(
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

  const seqA = [sWpx, sWpx, sWpx * 0.5];
  const seqB = [sWpx * 0.5, sWpx, sWpx];

  let yi  = y;
  let row = rowOffset;

  while (yi < y + h) {
    const seq = row % 2 === 0 ? seqA : seqB;
    let xi = x - (row % 3) * sWpx * 0.33;
    let si = 0;
    while (xi < x + w + sWpx) {
      const sw = seq[si % seq.length]!;
      drawStone(ctx, xi, yi, sw, sHpx, surf, rr, xi * 0.03 + row * 5.1 + si);
      ctx.fillStyle = surf.colFugeS;
      ctx.fillRect(xi + sw, yi, fSpx, sHpx);
      xi += sw + fSpx;
      si++;
    }
    ctx.fillStyle = surf.colFugeL;
    ctx.fillRect(x, yi + sHpx, w, fLpx);
    yi  += sHpx + fLpx;
    row++;
  }
}
