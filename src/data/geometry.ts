// All coordinates in mm, origin lower-left (FreeCAD convention)
// toC() converts mm → canvas pixels (Y-axis flipped)

export const POLY: [number, number][] = [
  [0, 200], [0, 7320], [1450, 7320], [1450, 7970],
  [6450, 7970], [6450, 7320], [8110, 7320], [8110, 14040],
  [8770, 14040], [8770, 14220], [10720, 14220], [10720, 4740],
  [8120, 4740], [8120, 0],
];

export const BND = { x: 10720, y: 14220 };  // bounding box mm

export const GARAGE_L: [number, number][] = [[0, 7320], [1450, 7320], [1450, 7970], [0, 7970]];
export const GARAGE_R: [number, number][] = [[6450, 7320], [8110, 7320], [8110, 7970], [6450, 7970]];
export const HAUS_WALL: [number, number][] = [[8770, 14040], [10720, 14040], [10720, 14220], [8770, 14220]];

// Cell grid resolution in mm
export const GRID   = 300;    // column width (also used by pattern renderers for horizontal scaling)
export const GRID_W = 300;    // cell width  mm
export const GRID_H = 206.5;  // cell height mm = sH(200) + fL(6.5) = 1 stone row

// Convert mm coordinates to canvas pixels
// x, y: mm in FreeCAD space (Y up)
// sc: global scale px/mm
// ox, oy: canvas offset
export function toC(x: number, y: number, sc: number, ox: number, oy: number): [number, number] {
  return [ox + x * sc, oy + (BND.y - y) * sc];
}

// Point-in-polygon test (ray casting)
export function pip(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
    const [xi, yi] = poly[a]!;
    const [xj, yj] = poly[b]!;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Seeded random: returns deterministic function n→[0,1)
export function seededRand(seed: number): (n: number) => number {
  return (n: number) => ((Math.sin(seed * 9301 + n * 49297) + 1) / 2);
}
