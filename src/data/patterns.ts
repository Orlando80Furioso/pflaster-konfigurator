export interface Pattern {
  id: string
  nr: string
  label: string
  kurz: string
  info: string
}

export const PAT: Record<string, Pattern> = {
  reihen:      { id: "reihen",      nr: "—",    label: "Reihenverband",          kurz: "Reihe",     info: "Standard · Versatz 50%" },
  kreuz:       { id: "kreuz",       nr: "0034", label: "Kreuzverband",            kurz: "Kreuz",     info: "Nr. 0034 · 19,53 Stk/m²" },
  ellbogen:    { id: "ellbogen",    nr: "3015", label: "Ellbogenverband",         kurz: "Ellbogen",  info: "Nr. 3015 · 40/20+20/20" },
  mehrstein:   { id: "mehrstein",   nr: "1032", label: "Mehrstein AU/AW",         kurz: "Mehrstein", info: "Nr. 1032 · 30/20+20/20+20/10" },
  grossformat: { id: "grossformat", nr: "1040", label: "Großformat-Reihenverband", kurz: "Großfmt.", info: "Nr. 1040 · 60/40+40/20+40/40" },
  wild:        { id: "wild",        nr: "2006", label: "Wilder Verband",          kurz: "Wild",      info: "Nr. 2006 · beliebig" },
};

export const PAT_ORDER = ["reihen", "kreuz", "ellbogen", "mehrstein", "grossformat", "wild"] as const;
