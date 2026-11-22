/** Tiny isometric 3D drawing kit: real boxes, cylinders and circles projected to SVG paths. */

export type V3 = [number, number, number];
export interface Shape { d: string; fill: string; stroke?: string | 'none'; sw?: number; op?: number }

/** Ground origin of every object on its 140 × 120 canvas. */
export const OX = 70, OY = 88;
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;

/** Project a 3D point (x → right-down, y → left-down, z → up) to screen coordinates. */
export const P = ([x, y, z]: V3): [number, number] => [OX + (x - y) * C30, OY + (x + y) * S30 - z];
const pt = (v: V3) => { const [a, b] = P(v); return `${a.toFixed(1)} ${b.toFixed(1)}`; };
export const poly = (pts: V3[]) => `M${pts.map(pt).join(' L')} Z`;
export const line = (pts: V3[]) => `M${pts.map(pt).join(' L')}`;

/* ---------- colour helpers ---------- */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
/** Lit top, front-left (+y) and front-right (+x) face colours from one base colour. */
export const shade = (base: string) => ({ top: mix(base, '#ffffff', 0.32), left: base, right: mix(base, '#3a2a14', 0.16) });

export const INK = '#211e1b';

/** Axis-aligned box. Returns the three visible faces (back faces are hidden by construction). */
export function box(x0: number, y0: number, z0: number, w: number, d: number, h: number, base: string): Shape[] {
  const x1 = x0 + w, y1 = y0 + d, z1 = z0 + h, c = shade(base);
  return [
    { d: poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]), fill: c.right },
    { d: poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]), fill: c.left },
    { d: poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]), fill: c.top },
  ];
}

/** Points of a circle in 3D (centre c, unit axes u and v, radius r). */
export function ring(c: V3, u: V3, v: V3, r: number, n = 28): V3[] {
  const out: V3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, cu = Math.cos(a) * r, sv = Math.sin(a) * r;
    out.push([c[0] + u[0] * cu + v[0] * sv, c[1] + u[1] * cu + v[1] * sv, c[2] + u[2] * cu + v[2] * sv]);
  }
  return out;
}
const X: V3 = [1, 0, 0], Y: V3 = [0, 1, 0], Z: V3 = [0, 0, 1];
export const AX = { X, Y, Z };

/** Upright cylinder centred at (cx, cy) on the ground plane z0..z0+h. */
export function cylinder(cx: number, cy: number, z0: number, r: number, h: number, base: string): Shape[] {
  const c = shade(base);
  const rx = r * Math.SQRT2 * C30, ry = r * Math.SQRT2 * S30;
  const [bx, by] = P([cx, cy, z0]), [tx, ty] = P([cx, cy, z0 + h]);
  const side = `M${(bx - rx).toFixed(1)} ${by.toFixed(1)} L${(tx - rx).toFixed(1)} ${ty.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(tx + rx).toFixed(1)} ${ty.toFixed(1)} L${(bx + rx).toFixed(1)} ${by.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(bx - rx).toFixed(1)} ${by.toFixed(1)} Z`;
  const top = `M${(tx - rx).toFixed(1)} ${ty.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(tx + rx).toFixed(1)} ${ty.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(tx - rx).toFixed(1)} ${ty.toFixed(1)} Z`;
  return [{ d: side, fill: c.left }, { d: `M${bx.toFixed(1)} ${(by + ry).toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(bx + rx).toFixed(1)} ${by.toFixed(1)} L${(tx + rx).toFixed(1)} ${ty.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${tx.toFixed(1)} ${(ty + ry).toFixed(1)} Z`, fill: c.right, stroke: 'none' }, { d: top, fill: c.top }];
}

/** Flat disc (e.g. a wheel or a dial) lying in the plane spanned by u, v. */
export const disc = (c: V3, u: V3, v: V3, r: number, fill: string, n = 28): Shape => ({ d: poly(ring(c, u, v, r, n)), fill });

/** Quad on the front-left face (y = const) from (x0, z0) to (x1, z1). */
export const onLeft = (y: number, x0: number, z0: number, x1: number, z1: number, fill: string, extra: Partial<Shape> = {}): Shape =>
  ({ d: poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]), fill, ...extra });
/** Quad on the front-right face (x = const) from (y0, z0) to (y1, z1). */
export const onRight = (x: number, y0: number, z0: number, y1: number, z1: number, fill: string, extra: Partial<Shape> = {}): Shape =>
  ({ d: poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]), fill, ...extra });
/** Quad on a top face (z = const). */
export const onTop = (z: number, x0: number, y0: number, x1: number, y1: number, fill: string, extra: Partial<Shape> = {}): Shape =>
  ({ d: poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]), fill, ...extra });
