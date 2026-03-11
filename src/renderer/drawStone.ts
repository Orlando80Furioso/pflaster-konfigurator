import type { Surface } from "../data/surfaces";

/**
 * Draw a single stone at (x, y) with width sWpx, height sHpx.
 *
 * colorSeed MUST be a position-based integer (stone column × factor + row × factor)
 * and must NOT depend on which grid cell is rendering.  If it did, the same stone
 * split across a cell boundary would receive two different colours → visible 300mm seam.
 *
 * Liner coordinate system:
 *   yFrom = 0  → stone bottom (canvas y + sHpx)
 *   yFrom = sH → stone top    (canvas y)
 */
export function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  sWpx: number, sHpx: number,
  surf: Surface,
  colorSeed: number,
): void {
  // Pure position-based colour – cell-independent, no boundary seam
  const v        = (Math.sin(colorSeed * 9301 + 49297) + 1) / 2;
  const colorIdx = Math.floor(v * surf.colStone.length);
  ctx.fillStyle  = surf.colStone[colorIdx % surf.colStone.length]!;
  ctx.fillRect(x, y, sWpx, sHpx);

  // Liner strips (painted inside stone body)
  if (surf.liner.length > 0) {
    const mmToPx = sHpx / surf.sH;
    for (const strip of surf.liner) {
      const stripTop = y + sHpx - (strip.yFrom + strip.height) * mmToPx;
      const stripH   = Math.max(1.5, strip.height * mmToPx);  // always visible
      ctx.fillStyle  = strip.color;
      ctx.fillRect(x, stripTop, sWpx, stripH);
    }
  }
}
