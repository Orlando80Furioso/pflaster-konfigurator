import type { Surface } from "../data/surfaces";

/**
 * Draw a single stone at (x, y) with width sWpx, height sHpx.
 * Includes liner strips drawn inside the stone body.
 *
 * Coordinate system:
 *   Stone top    = canvas y
 *   Stone bottom = canvas y + sHpx
 *   Liner yFrom is mm from stone bottom (0=bottom, sH=top)
 */
export function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  sWpx: number, sHpx: number,
  surf: Surface,
  rr: (n: number) => number,
  colorSeed: number,
): void {
  // Stone body
  const colorIdx = Math.floor(rr(colorSeed) * surf.colStone.length);
  ctx.fillStyle = surf.colStone[colorIdx]!;
  ctx.fillRect(x, y, sWpx, sHpx);

  // Liner strips (painted inside stone body)
  if (surf.liner.length > 0) {
    const mmToPx = sHpx / surf.sH;  // px per mm
    for (const strip of surf.liner) {
      // yFrom=0 is stone bottom (canvas y + sHpx)
      // yFrom=sH is stone top (canvas y)
      const stripTop = y + sHpx - (strip.yFrom + strip.height) * mmToPx;
      const stripH   = strip.height * mmToPx;
      ctx.fillStyle = strip.color;
      ctx.fillRect(x, stripTop, sWpx, stripH);
    }
  }
}
