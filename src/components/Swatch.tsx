import { useRef, useEffect } from "react";
import { SURF } from "../data/surfaces";
import { seededRand } from "../data/geometry";
import { renderReihen } from "../renderer/patterns/reihen";
import { renderEllbogen } from "../renderer/patterns/ellbogen";
import { renderMehrstein } from "../renderer/patterns/mehrstein";
import { renderGrossformat } from "../renderer/patterns/grossformat";
import { renderWild } from "../renderer/patterns/wild";
import type { Surface } from "../data/surfaces";

type PatternFn = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  surf: Surface,
  rr: (n: number) => number,
  rowOffset: number,
) => void;

const FMAP: Record<string, PatternFn> = {
  reihen:      renderReihen,
  kreuz:       renderReihen,
  ellbogen:    renderEllbogen,
  mehrstein:   renderMehrstein,
  grossformat: renderGrossformat,
  wild:        renderWild,
};

interface SwatchProps {
  s: string
  p: string
  size?: number
}

export function Swatch({ s, p, size = 28 }: SwatchProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);

    if (s === "none") {
      ctx.fillStyle = "#c0bcb4";
      ctx.fillRect(0, 0, size, size);
      return;
    }

    const surf = SURF[s];
    if (!surf) return;

    const rr     = seededRand(42);
    const render = FMAP[p] ?? renderReihen;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.clip();
    render(ctx, 0, 0, size, size, surf, rr, 0);
    ctx.restore();
  }, [s, p, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{
        borderRadius: 2,
        display: "block",
        flexShrink: 0,
        border: "1px solid #2a2a2a",
      }}
    />
  );
}
