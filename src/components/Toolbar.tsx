import { SURF, SURF_ORDER } from "../data/surfaces";
import { PAT, PAT_ORDER } from "../data/patterns";
import { Swatch } from "./Swatch";

const BG  = "#141414";
const PNL = "#0f0f0f";
const BD  = "#1e1e1e";

type Tab = "surf" | "pat" | "angle";

interface ToolbarProps {
  surf:    string;  setSurf:  (v: string) => void;
  pat:     string;  setPat:   (v: string) => void;
  angle:   number;  setAngle: (v: number) => void;
  brush:   number;  setBrush: (v: number) => void;
  tab:     Tab;     setTab:   (v: Tab)    => void;
}

export function Toolbar({
  surf, setSurf, pat, setPat,
  angle, setAngle, brush, setBrush,
  tab, setTab,
}: ToolbarProps) {
  const tabStyle = (t: Tab) => ({
    flex: 1, padding: "6px 0", fontSize: 8.5, fontWeight: 700,
    background: tab === t ? "#1a2814" : PNL,
    color:      tab === t ? "#8bc34a" : "#444",
    border: "none", borderRight: `1px solid ${BD}`,
    cursor: "pointer", letterSpacing: "0.04em",
  } as React.CSSProperties);

  const toolStyle = (active: boolean) => ({
    background: active ? "#182014" : "#161616",
    border: active ? "1.5px solid #3d7a18" : `1px solid ${BD}`,
    borderRadius: 5, padding: "6px 7px",
    cursor: "pointer", textAlign: "left" as const, width: "100%",
  });

  const surfForSwatch = surf === "none" ? "t3" : surf;

  return (
    <div style={{
      width: 200, background: PNL,
      borderRight: `1px solid ${BD}`,
      display: "flex", flexDirection: "column",
      flexShrink: 0, overflow: "hidden",
    }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BD}` }}>
        <button onClick={() => setTab("surf")}  style={tabStyle("surf")}>Fläche</button>
        <button onClick={() => setTab("pat")}   style={tabStyle("pat")}>Muster</button>
        <button onClick={() => setTab("angle")} style={{ ...tabStyle("angle"), borderRight: "none" }}>Winkel</button>
      </div>

      {/* Tab content */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "8px 7px",
        display: "flex", flexDirection: "column", gap: 5,
      }}>

        {/* ── Tab: Fläche (surface type) ── */}
        {tab === "surf" && <>
          <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", color: "#444", marginBottom: 2 }}>
            PFLASTERTYP
          </div>
          {SURF_ORDER.map(id => {
            const t = SURF[id]!;
            const active = surf === id;
            return (
              <button key={id} onClick={() => setSurf(id)} style={toolStyle(active)}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <Swatch s={id} p={pat} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: active ? "#e8e4dc" : "#777" }}>
                      {t.label}
                    </div>
                    {t.lkw && (
                      <div style={{ fontSize: 7, color: "#5a8a2a", lineHeight: 1.2 }}>LKW ✓</div>
                    )}
                    {id !== "none" && (
                      <div style={{
                        fontSize: 7.5, marginTop: 1, fontWeight: 600,
                        color: t.psi <= 0.15 ? "#66bb6a" : t.psi <= 0.28 ? "#9ccc65" : "#ffa726",
                      }}>
                        ψ={t.psi} · {t.vers}% Vers.
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 7.5, color: active ? "#666" : "#2e2e2e", lineHeight: 1.3 }}>
                  {t.sub}
                </div>
              </button>
            );
          })}
        </>}

        {/* ── Tab: Muster (pattern) ── */}
        {tab === "pat" && <>
          <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", color: "#444", marginBottom: 2 }}>
            GODELMANN MUSTER
          </div>
          {PAT_ORDER.map(id => {
            const p      = PAT[id]!;
            const active = pat === id;
            return (
              <button key={id} onClick={() => setPat(id)} style={toolStyle(active)}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <Swatch s={surfForSwatch} p={id} size={40} />
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: active ? "#e8e4dc" : "#777" }}>
                      {p.label}
                    </div>
                    {p.nr !== "—" && (
                      <div style={{ fontSize: 7, color: "#3d7a18", lineHeight: 1.3 }}>Nr. {p.nr}</div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 7.5, color: active ? "#666" : "#2a2a2a", lineHeight: 1.3 }}>
                  {p.info}
                </div>
              </button>
            );
          })}
        </>}

        {/* ── Tab: Winkel (angle) ── */}
        {tab === "angle" && <>
          <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1em", color: "#444", marginBottom: 4 }}>
            VERLEGEWINKEL
          </div>
          <div style={{
            background: "#161616", borderRadius: 4,
            padding: "10px", border: `1px solid ${BD}`,
            textAlign: "center", marginBottom: 4,
          }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{angle}°</div>
            <div style={{ fontSize: 7.5, color: "#555", marginTop: 1 }}>aktiver Winkel</div>
          </div>
          <input
            type="range" min={0} max={180} step={1} value={angle}
            onChange={e => setAngle(+e.target.value)}
            style={{ marginBottom: 6 }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <input
              type="number" min={0} max={180} value={angle}
              onChange={e => setAngle(Math.max(0, Math.min(180, +e.target.value || 0)))}
              style={{ width: 54, background: "#161616", color: "#e8e4dc", border: `1px solid ${BD}`, borderRadius: 3, padding: "3px 5px", fontSize: 11 }}
            />
            <span style={{ fontSize: 8.5, color: "#555" }}>Grad (0–180)</span>
          </div>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: "#444", marginBottom: 5 }}>SCHNELLAUSWAHL</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, marginBottom: 10 }}>
            {[0, 30, 45, 60, 90, 135].map(a => (
              <button
                key={a}
                onClick={() => setAngle(a)}
                style={{
                  padding: "5px 0", fontSize: 9, fontWeight: 700,
                  background: angle === a ? "#1a2e12" : "#161616",
                  color:      angle === a ? "#8bc34a" : "#555",
                  border:     angle === a ? "1px solid #3d7a18" : `1px solid ${BD}`,
                  borderRadius: 3,
                }}
              >{a}°</button>
            ))}
          </div>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: "#444", marginBottom: 6 }}>VORSCHAU</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <Swatch s={surfForSwatch} p={pat} size={80} />
          </div>
          <div style={{ fontSize: 7.5, color: "#444", lineHeight: 1.6, background: BG }}>
            0° = quer zur Fahrtrichtung<br />
            45° = Diagonalverband<br />
            90° = längs zur Fahrtrichtung
          </div>
        </>}
      </div>

      {/* Brush selector */}
      <div style={{ padding: "7px", borderTop: `1px solid ${BD}`, background: PNL }}>
        <div style={{ fontSize: 7.5, fontWeight: 700, color: "#444", marginBottom: 4 }}>
          PINSEL · {brush}×{brush} = {(brush * 300 / 1000).toFixed(2)}m
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[1, 2, 3, 5].map(s => (
            <button
              key={s}
              onClick={() => setBrush(s)}
              style={{
                flex: 1, height: 26, borderRadius: 3, fontSize: 9, fontWeight: 700,
                background: brush === s ? "#1a2e12" : "#161616",
                color:      brush === s ? "#8bc34a" : "#444",
                border:     brush === s ? "1px solid #3d7a18" : `1px solid ${BD}`,
              }}
            >{s}×{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
