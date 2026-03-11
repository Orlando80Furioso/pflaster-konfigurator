import type { Grid } from "../hooks/useGrid";
import { SURF } from "../data/surfaces";
import { POLY, BND, GARAGE_L, GARAGE_R, HAUS_WALL, GRID, toC } from "../data/geometry";
import { renderCell, calcRowOffset } from "./renderCell";

const OX = 8;
const OY = 8;

export function drawCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: Grid,
  scale: number,
  showGrid: boolean,
  hover: string | null,
): void {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);

  const ps = POLY.map(([x, y]) => toC(x, y, scale, OX, OY));

  // ── Clip to polygon, draw all cells ────────────────────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...ps[0]!);
  for (let i = 1; i < ps.length; i++) ctx.lineTo(...ps[i]!);
  ctx.closePath();
  ctx.clip();

  for (const k of Object.keys(grid)) {
    const [co, ro] = k.split("_").map(Number) as [number, number];
    const [cx, cy] = toC(co * GRID, (ro + 1) * GRID, scale, OX, OY);
    const cell     = grid[k]!;
    const surf     = SURF[cell.s];
    const ro2      = calcRowOffset(ro, surf ?? SURF["t3"]!);
    renderCell(
      ctx, cx, cy,
      GRID * scale, GRID * scale,
      cell.s, cell.p, cell.a,
      co * 131 + ro * 17,
      ro2,
    );
  }
  ctx.restore();

  // ── Outer mask (fills area outside polygon with dark background) ───────────
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.moveTo(...ps[0]!);
  for (let i = 1; i < ps.length; i++) ctx.lineTo(...ps[i]!);
  ctx.closePath();
  ctx.fillStyle = "#141414";
  ctx.fill("evenodd");
  ctx.restore();

  // ── Polygon outline ─────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(...ps[0]!);
  for (let i = 1; i < ps.length; i++) ctx.lineTo(...ps[i]!);
  ctx.closePath();
  ctx.strokeStyle = "#e8e4dc";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Special zones (garage, house wall) ─────────────────────────────────────
  const quad = (pts: [number, number][], fill: string) => {
    const pp = pts.map(([x, y]) => toC(x, y, scale, OX, OY));
    ctx.beginPath();
    ctx.moveTo(...pp[0]!);
    for (let i = 1; i < pp.length; i++) ctx.lineTo(...pp[i]!);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 0.7;
    ctx.stroke();
  };
  quad(GARAGE_L, "#a0a09a");
  quad(GARAGE_R, "#a0a09a");
  quad(HAUS_WALL, "#555");

  // Labels
  const fs  = Math.max(8, scale * 260);
  const fs2 = Math.max(7, scale * 200);
  const fs3 = Math.max(7, scale * 155);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${fs}px system-ui`;
  const [glx, gly] = toC(3950, 7645, scale, OX, OY);
  ctx.fillText("Garagentor 5,00m", glx, gly + 3);
  ctx.font = `${fs2}px system-ui`;
  const [hlx, hly] = toC(9745, 14100, scale, OX, OY);
  ctx.fillText("Haus", hlx, hly + 3);

  // Street dashed line
  ctx.setLineDash([scale * 280, scale * 180]);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 0.8;
  const [s1x, s1y] = toC(0, 80, scale, OX, OY);
  const [s2x]      = toC(8120, 80, scale, OX, OY);
  ctx.beginPath();
  ctx.moveTo(s1x, s1y);
  ctx.lineTo(s2x, s1y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `${fs3}px system-ui`;
  ctx.fillStyle = "#555";
  ctx.fillText("Straße", (s1x + s2x) / 2, s1y + 14);

  // ── Hover highlight ─────────────────────────────────────────────────────────
  if (hover) {
    const [hco, hro] = hover.split("_").map(Number) as [number, number];
    const [hx, hy]   = toC(hco * GRID, (hro + 1) * GRID, scale, OX, OY);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1.8;
    ctx.setLineDash([]);
    ctx.strokeRect(hx, hy, GRID * scale, GRID * scale);
  }

  // ── Raster grid lines ───────────────────────────────────────────────────────
  if (showGrid) {
    // Grid line every sH+fL mm = 206.5mm (one full stone row)
    const RASTER_MM = 206.5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(...ps[0]!);
    for (let i = 1; i < ps.length; i++) ctx.lineTo(...ps[i]!);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(65,105,225,0.75)";
    ctx.lineWidth   = 0.7;
    ctx.setLineDash([3, 3]);

    const [x0] = toC(0, 0, scale, OX, OY);
    const [x1] = toC(BND.x, 0, scale, OX, OY);

    for (let ymm = 0; ymm <= BND.y + RASTER_MM; ymm += RASTER_MM) {
      const [, yPx] = toC(0, ymm, scale, OX, OY);
      ctx.beginPath();
      ctx.moveTo(x0, yPx);
      ctx.lineTo(x1, yPx);
      ctx.stroke();

      if (ymm > 0) {
        ctx.setLineDash([]);
        ctx.fillStyle  = "rgba(100,149,237,0.8)";
        ctx.font       = `${Math.max(7, scale * 130)}px system-ui`;
        ctx.textAlign  = "left";
        ctx.fillText(`${(ymm / 1000).toFixed(3)}m`, x0 + 3, yPx - 2);
        ctx.setLineDash([3, 3]);
      }
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── Scale bar ───────────────────────────────────────────────────────────────
  const bw = scale * 1000;
  ctx.fillStyle = "#e8e4dc";
  ctx.fillRect(OX, height - OY - 10, bw / 2, 4);
  ctx.fillStyle = "#555";
  ctx.fillRect(OX + bw / 2, height - OY - 10, bw / 2, 4);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(OX, height - OY - 10, bw, 4);
  ctx.font = "9px system-ui";
  ctx.fillStyle = "#777";
  ctx.textAlign = "left";
  ctx.fillText("1m", OX + bw + 4, height - OY - 7);
}

export { OX, OY };
