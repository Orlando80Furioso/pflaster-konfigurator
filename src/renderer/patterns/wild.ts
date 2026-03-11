import type { Surface } from "../../data/surfaces";
import { GRID } from "../../data/geometry";
import { drawStone } from "../drawStone";

// Wilder Verband Nr. 2006 – random-looking but deterministic offsets
export function renderWild(
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

  const offTable = [0, 0.17, 0.33, 0.5, 0.67, 0.83, 0.25, 0.42, 0.58, 0.75];

  let yi  = y;
  let row = rowOffset;

  while (yi < y + h) {
    const off = (offTable[(row + Math.floor(rr(row * 91 + 7) * 5)) % offTable.length] ?? 0) * sWpx;
    let xi = x - off;
    while (xi < x + w + sWpx) {
      drawStone(ctx, xi, yi, sWpx, sHpx, surf, rr, xi * 0.03 + row * 11.7);
      ctx.fillStyle = surf.colFugeS;
      ctx.fillRect(xi + sWpx, yi, fSpx, sHpx);
      xi += sWpx + fSpx;
    }
    ctx.fillStyle = surf.colFugeL;
    ctx.fillRect(x, yi + sHpx, w, fLpx);
    yi  += sHpx + fLpx;
    row++;
  }
}
