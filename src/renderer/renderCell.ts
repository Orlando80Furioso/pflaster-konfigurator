import { SURF } from "../data/surfaces";
import { GRID, seededRand } from "../data/geometry";
import { renderReihen }      from "./patterns/reihen";
import { renderEllbogen }    from "./patterns/ellbogen";
import { renderMehrstein }   from "./patterns/mehrstein";
import { renderGrossformat } from "./patterns/grossformat";
import { renderWild }        from "./patterns/wild";
import type { Surface } from "../data/surfaces";

type PatternFn = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  surf: Surface,
  rr: (n: number) => number,
  rowOffset: number,
) => void;

const PATTERN_FNS: Record<string, PatternFn> = {
  reihen:      renderReihen,
  kreuz:       renderReihen,   // same visual as reihen
  ellbogen:    renderEllbogen,
  mehrstein:   renderMehrstein,
  grossformat: renderGrossformat,
  wild:        renderWild,
};

/**
 * Render one grid cell at canvas position (cx, cy) with size (cw × ch).
 *
 * rowOffset: Math.round(ro * GRID / (surf.sH + surf.fL))
 *   ensures stone rows align across cell boundaries.
 */
export function renderCell(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, cw: number, ch: number,
  surfId: string,
  patId: string,
  angleDeg: number,
  seed: number,
  rowOffset: number,
): void {
  const surf = SURF[surfId];
  if (!surf || surfId === "none") {
    ctx.fillStyle = "#c0bcb4";
    ctx.fillRect(cx, cy, cw, ch);
    return;
  }

  const rr     = seededRand(seed);
  const render = PATTERN_FNS[patId] ?? renderReihen;

  if (angleDeg === 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch);
    ctx.clip();
    render(ctx, cx, cy, cw, ch, surf, rr, rowOffset);
    ctx.restore();
  } else {
    // Render to offscreen canvas, then rotate onto main canvas
    const rad  = angleDeg * Math.PI / 180;
    const diag = Math.ceil(Math.sqrt(cw * cw + ch * ch)) + 4;
    const oc   = document.createElement("canvas");
    oc.width   = diag;
    oc.height  = diag;
    const oc2  = oc.getContext("2d")!;
    render(oc2, 0, 0, diag, diag, surf, rr, 0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch);
    ctx.clip();
    ctx.translate(cx + cw / 2, cy + ch / 2);
    ctx.rotate(rad);
    ctx.drawImage(oc, -diag / 2, -diag / 2);
    ctx.restore();
  }
}

/**
 * Calculate rowOffset for a cell at grid row `ro`.
 * Aligns stone rows across cell boundaries.
 */
export function calcRowOffset(ro: number, surf: Surface): number {
  return Math.round((ro * GRID) / (surf.sH + surf.fL));
}
