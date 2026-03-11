import { SURF, SURF_ORDER } from "../data/surfaces";
import { PAT, PAT_ORDER } from "../data/patterns";
import { GRID_W, GRID_H } from "../data/geometry";
import type { Grid } from "../hooks/useGrid";

const PNL = "#0f0f0f";
const BD  = "#1e1e1e";
// Cell area in m² – rectangular: 300mm × 206.5mm
const CELL_M2 = (GRID_W / 1000) * (GRID_H / 1000);

function stoneCount(surfId: string, cellCount: number): number {
  const t = SURF[surfId]!;
  return Math.round(cellCount * CELL_M2 * 1e6 / ((t.sW + t.fS) * (t.sH + t.fL)));
}

interface StatsProps {
  grid:  Grid;
  hover: string | null;
}

export function Stats({ grid, hover }: StatsProps) {
  const cells = Object.values(grid);
  const total = cells.length;
  const cm2   = CELL_M2;

  // Count cells per surface and pattern
  const sc: Record<string, number> = {};
  const pc: Record<string, number> = {};
  for (const cell of cells) {
    sc[cell.s] = (sc[cell.s] ?? 0) + 1;
    pc[cell.p] = (pc[cell.p] ?? 0) + 1;
  }

  const acts    = SURF_ORDER.filter(id => id !== "none" && sc[id]);
  const wPsi    = acts.reduce((s, id) => s + SURF[id]!.psi  * (sc[id] ?? 0) / total, 0);
  const wGr     = acts.reduce((s, id) => s + SURF[id]!.vers * (sc[id] ?? 0) / total, 0);
  const psiOk   = wPsi <= 0.30;
  const psiCol  = wPsi <= 0.15 ? "#66bb6a" : wPsi <= 0.28 ? "#9ccc65" : "#ffa726";

  const hoverCell = hover ? grid[hover] : null;

  return (
    <div style={{
      width: 188, background: PNL,
      borderLeft: `1px solid ${BD}`,
      padding: "10px",
      display: "flex", flexDirection: "column", gap: 7,
      overflowY: "auto", flexShrink: 0,
    }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", color: "#444" }}>FLÄCHEN</div>

      {/* Total area */}
      <div style={{ background: "#161616", borderRadius: 4, padding: "7px 9px", border: `1px solid ${BD}` }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{(total * cm2).toFixed(1)} m²</div>
        <div style={{ fontSize: 7.5, color: "#555" }}>Gesamt · {total} Zellen</div>
      </div>

      {/* Per-type breakdown */}
      {acts.map(id => {
        const t   = SURF[id]!;
        const cnt = sc[id] ?? 0;
        const pct = ((cnt / total) * 100).toFixed(1);
        const m2  = (cnt * cm2).toFixed(1);
        const st  = stoneCount(id, cnt);
        const barCol = t.vers >= 30 ? "#4a7a1e" : t.vers >= 10 ? "#7a9a2a" : "#a8a49c";
        return (
          <div key={id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "#bbb" }}>{t.label}</span>
              <span style={{ fontSize: 8, color: "#555" }}>{m2} m²</span>
            </div>
            <div style={{ height: 5, background: "#1e1e1e", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: barCol, borderRadius: 2, transition: "width .2s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 7, color: "#444" }}>{pct}%</span>
              <span style={{ fontSize: 7, color: "#444" }}>~{st.toLocaleString()} Stk</span>
            </div>
          </div>
        );
      })}

      {/* ψ-value (DWA-A 138) */}
      <div style={{
        background: "#161616", borderRadius: 4,
        padding: "7px 9px",
        border: `1px solid ${psiOk ? "#1a3018" : "#301818"}`,
      }}>
        <div style={{ fontSize: 7.5, color: "#555", marginBottom: 2 }}>Abflussbeiwert ψ (DWA-A 138)</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: psiCol }}>{wPsi.toFixed(2)}</div>
        <div style={{ fontSize: 7.5, color: psiOk ? "#66bb6a" : "#ef5350" }}>
          {psiOk ? "✓ ≤ 0,30 eingehalten" : "✗ Grenzwert überschritten!"}
        </div>
      </div>

      {/* Infiltration share */}
      <div style={{ background: "#161616", borderRadius: 4, padding: "7px 9px", border: "1px solid #182410" }}>
        <div style={{ fontSize: 7.5, color: "#555", marginBottom: 2 }}>Versickerungsanteil</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#5a9a2a" }}>{wGr.toFixed(1)}%</div>
        <div style={{ height: 3, background: "#1e1e1e", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
          <div style={{
            height: "100%", width: `${Math.min(100, wGr)}%`,
            background: "linear-gradient(90deg,#2a5010,#5a9a25)",
            transition: "width .2s",
          }} />
        </div>
      </div>

      {/* Pattern distribution */}
      <div style={{ fontSize: 7.5, fontWeight: 700, color: "#444", marginTop: 2 }}>MUSTERVERTEILUNG</div>
      {PAT_ORDER.filter(id => pc[id]).map(id => {
        const p   = PAT[id]!;
        const cnt = pc[id] ?? 0;
        const pct = ((cnt / total) * 100).toFixed(0);
        return (
          <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 7.5 }}>
            <span style={{ color: "#666" }}>{p.kurz}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div style={{ width: 28, height: 3, background: "#1e1e1e", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "#3d7a18", borderRadius: 2 }} />
              </div>
              <span style={{ color: "#444", minWidth: 32, textAlign: "right" }}>{(cnt * cm2).toFixed(1)}m²</span>
            </div>
          </div>
        );
      })}

      {/* Quantity list */}
      <div style={{ fontSize: 7.5, fontWeight: 700, color: "#444", marginTop: 2 }}>MENGENLISTE</div>
      {acts.map(id => {
        const t   = SURF[id]!;
        const cnt = sc[id] ?? 0;
        const m2  = (cnt * cm2).toFixed(2);
        const st  = stoneCount(id, cnt);
        return (
          <div key={id} style={{
            background: "#161616", borderRadius: 3,
            padding: "5px 8px", border: `1px solid ${BD}`, fontSize: 7.5,
          }}>
            <div style={{ fontWeight: 700, color: "#aaa", marginBottom: 2 }}>{t.name}</div>
            <div style={{ color: "#666" }}>{m2} m² · ~{st.toLocaleString()} Stk</div>
            <div style={{ color: "#444" }}>ψ={t.psi} · {t.vers}% Versickerung</div>
            <div style={{ color: "#333" }}>Stoßf. {t.fS}mm · Lagerf. {t.fL}mm</div>
          </div>
        );
      })}

      {/* Hover info */}
      {hover && hoverCell && (() => {
        const [co, ro] = hover.split("_").map(Number) as [number, number];
        const t = SURF[hoverCell.s];
        return (
          <div style={{
            background: "#161616", borderRadius: 3,
            padding: "4px 8px", border: `1px solid ${BD}`, fontSize: 7.5, marginTop: 2,
          }}>
            <div style={{ color: "#444", marginBottom: 1 }}>
              x={(co * GRID_W / 1000).toFixed(2)}m · y={(ro * GRID_H / 1000).toFixed(2)}m
            </div>
            <div style={{ fontWeight: 700, color: "#bbb" }}>{t?.name ?? "—"}</div>
            <div style={{ color: "#3d7a18" }}>{PAT[hoverCell.p]?.label ?? "—"} · {hoverCell.a}°</div>
          </div>
        );
      })()}
    </div>
  );
}
