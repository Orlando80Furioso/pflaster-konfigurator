export interface LinerStrip {
  yFrom: number   // mm from stone bottom (0 = bottom, sH = top)
  height: number  // strip height in mm
  color: string   // CSS colour
}

export interface Surface {
  id: string
  label: string
  name: string
  sub: string
  sW: number          // stone width mm
  sH: number          // stone height mm
  fS: number          // Stoßfuge (side joint) mm
  fL: number          // Lagerfuge (bed joint) mm
  colStone: string[]  // stone body colours (2–4 tones for variation)
  colFugeS: string    // Stoßfuge colour
  colFugeL: string    // Lagerfuge colour
  liner: LinerStrip[] // green strips inside stone body
  vers: number        // infiltration share %
  psi: number         // runoff coefficient ψ
  lkw: boolean        // truck-rated
}

export const SURF: Record<string, Surface> = {
  t1: {
    id: "t1", label: "40/20", name: "Mehrsteinsystem BJ 40/20",
    sub: "400×200mm · Fuge 6,5mm allseitig",
    sW: 400, sH: 200, fS: 6.5, fL: 6.5,
    colStone: ["#dedad2", "#d8d4cc", "#e0dcd4", "#d4d0c8"],
    colFugeS: "#b0aca4", colFugeL: "#b0aca4",
    liner: [], vers: 5.3, psi: 0.30, lkw: true,
  },
  t2: {
    id: "t2", label: "20/20", name: "Mehrsteinsystem BJ 20/20",
    sub: "200×200mm · Fuge 6,5mm allseitig",
    sW: 200, sH: 200, fS: 6.5, fL: 6.5,
    colStone: ["#d8d4cc", "#d4d0c8", "#dedad4", "#d0ccc4"],
    colFugeS: "#b0aca4", colFugeL: "#b0aca4",
    liner: [], vers: 5.3, psi: 0.30, lkw: true,
  },
  t3: {
    id: "t3", label: "30/20", name: "Mehrsteinsystem BJ 30/20",
    sub: "300×200mm · Fuge 6,5mm allseitig",
    sW: 300, sH: 200, fS: 6.5, fL: 6.5,
    colStone: ["#d6d2ca", "#d2cec6", "#dcd8d0", "#cecac2"],
    colFugeS: "#b0aca4", colFugeL: "#b0aca4",
    liner: [], vers: 5.3, psi: 0.30, lkw: true,
  },
  t4: {
    id: "t4", label: "30/20 gap", name: "Tetrago gap 30/20",
    sub: "300×200mm · Fuge 8,5mm · Grünfuge",
    sW: 300, sH: 200, fS: 8.5, fL: 8.5,
    colStone: ["#cac6be", "#c6c2ba", "#cecabe", "#c2beb6"],
    colFugeS: "#5a8a2a", colFugeL: "#5a8a2a",
    liner: [], vers: 7.0, psi: 0.28, lkw: true,
  },
  t5: {
    id: "t5", label: "30/20 L1", name: "Tetrago liner 1-1 30/20",
    sub: "300×200mm · 1 Liner-Streifen 30mm · Fuge 6,5mm",
    sW: 300, sH: 200, fS: 6.5, fL: 6.5,
    colStone: ["#d4d0c8", "#d0ccc4", "#d8d4cc", "#ccc8c0"],
    colFugeS: "#b0aca4", colFugeL: "#b0aca4",
    // 1 green strip at Y=170mm from bottom, 30mm high (top 15% of stone)
    liner: [{ yFrom: 170, height: 30, color: "#4a8a1e" }],
    vers: 15.0, psi: 0.30, lkw: false,
  },
  t6: {
    id: "t6", label: "30/20 L3", name: "Tetrago liner 3-3 30/20",
    sub: "300×200mm · 3 Liner-Streifen 30mm · Fugen 6,5mm grün",
    sW: 300, sH: 200, fS: 6.5, fL: 6.5,
    colStone: ["#cac6bc", "#c6c2b8", "#cecac0", "#c2beb4"],
    colFugeS: "#4a8a1e", colFugeL: "#4a8a1e",
    // 3 equally spaced green strips inside stone
    liner: [
      { yFrom: 30.75,  height: 30, color: "#4a8a1e" },
      { yFrom: 85.0,   height: 30, color: "#4a8a1e" },
      { yFrom: 139.25, height: 30, color: "#4a8a1e" },
    ],
    vers: 45.0, psi: 0.15, lkw: true,
  },
  none: {
    id: "none", label: "—", name: "Nicht belegen", sub: "",
    sW: 300, sH: 200, fS: 6.5, fL: 6.5,
    colStone: ["#c0bcb4"], colFugeS: "transparent", colFugeL: "transparent",
    liner: [], vers: 0, psi: 1.0, lkw: false,
  },
};

export const SURF_ORDER = ["t1", "t2", "t3", "t4", "t5", "t6", "none"] as const;
