/**
 * Realistic isometric illustrations for every scene object — a server looks like a rack, a person like a person,
 * a database like stacked disks. Each drawing is a list of filled, ink-outlined paths built from real 3D geometry
 * (see iso.ts), so lighting and perspective stay consistent across the whole course.
 */
import type { ObjectKind } from './types';
import { AX, INK, P, box, cylinder, disc, line, mix, onLeft, onRight, onTop, poly, shade, type Shape, type V3 } from './iso';

export const C = {
  blue: '#a9c5e8', blueD: '#6f8fc4', amber: '#f6cd82', amberD: '#d9a54a', purple: '#cbbae6', purpleD: '#9d86c9', lilac: '#e2d8ee',
  green: '#b3d79f', greenD: '#6fa75f', orange: '#f3b47f', orangeD: '#d9874a', teal: '#9dd3c7', tealD: '#5fae9f', rose: '#eba6b2',
  roseD: '#d06a7e', indigo: '#b2baea', indigoD: '#7d87cf', dark: '#3b3842', screen: '#2f3a4f', paper: '#fbf6ee', skin: '#f2c6a0',
  hair: '#4a3426', grey: '#ddd5ca', greyD: '#a79e92', led: '#7ee07a', ledA: '#ffb648', wood: '#a5714c', red: '#e0705f', gold: '#e8c25a',
};

const circ = (cx: number, cy: number, r: number) => `M${(cx - r).toFixed(1)} ${cy.toFixed(1)} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
const dot = (v: V3, r: number, fill: string, stroke: string | 'none' = INK): Shape => { const [x, y] = P(v); return { d: circ(x, y, r), fill, stroke, sw: 1.1 }; };
const stroke = (d: string, sw = 1.4, color = INK): Shape => ({ d, fill: 'none', stroke: color, sw });
const flat = (s: Shape): Shape => ({ ...s, stroke: 'none' });

/* ---------------------------------------------------------------- people */
export function person(x: number, y: number, shirt: string, s = 1, hair = C.hair): Shape[] {
  const k = (v: number) => v * s;
  const [hx, hy] = P([x, y, k(41)]);
  return [
    ...cylinder(x, y, 0, k(5), k(15), '#4f5670'),
    ...cylinder(x - k(8.6), y + k(1.5), k(14), k(2.4), k(15), shirt),
    ...cylinder(x, y, k(15), k(7), k(17), shirt),
    ...cylinder(x + k(8.6), y - k(1.5), k(14), k(2.4), k(15), shirt),
    { d: circ(hx, hy, k(7.5)), fill: C.skin },
    { d: `M${(hx - k(7.5)).toFixed(1)} ${(hy - k(0.5)).toFixed(1)} a${k(7.5)} ${k(7.5)} 0 0 1 ${k(15)} 0 q${k(-4)} ${k(-3.4)} ${k(-8.4)} ${k(-2.2)} q${k(-4)} ${k(1.2)} ${k(-6.6)} ${k(2.2)} Z`, fill: hair },
  ];
}
const CROWD: [number, number, string][] = [[-13, -12, C.purple], [11, -13, C.orange], [-1, -1, C.blue], [-15, 11, C.green], [12, 10, C.amber]];

/* ---------------------------------------------------------------- devices */
function phone(): Shape[] {
  return [
    ...box(-11, -3, 0, 22, 6, 46, C.dark),
    onLeft(3, -9, 3, 9, 43, '#e8eef8'),
    onLeft(3, -7, 34, 7, 40, C.paper, { sw: 1 }), flat(onLeft(3.01, -6, 36, -3, 38, C.green)),
    onLeft(3, -7, 25, 7, 31, C.paper, { sw: 1 }), flat(onLeft(3.01, -6, 27, -3, 29, C.orange)),
    onLeft(3, -7, 16, 7, 22, C.paper, { sw: 1 }), flat(onLeft(3.01, -6, 18, -3, 20, C.rose)),
    flat(onLeft(3.01, -3, 5.5, 3, 7, '#9aa3b5')),
  ];
}
function laptop(): Shape[] {
  const keys: Shape[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) keys.push(flat(onTop(3.02, -17 + c * 4.9, -9 + r * 4.2, -14 + c * 4.9, -6.4 + r * 4.2, '#8f877c')));
  return [
    ...box(-22, -16, 3, 44, 2.5, 30, C.dark),
    onLeft(-13.5, -20, 6, 20, 31, '#d9e6f7'),
    flat(onLeft(-13.49, -17, 24, 3, 28, C.blue)), flat(onLeft(-13.49, -17, 17, 14, 20, C.paper)), flat(onLeft(-13.49, -17, 11, 9, 14, C.paper)),
    ...box(-22, -14, 0, 44, 30, 3, C.grey),
    ...keys,
    onTop(3.02, -7, 6, 7, 13, '#c9c0b4', { sw: 1 }),
  ];
}
function tv(): Shape[] {
  const tiles = [C.rose, C.amber, C.teal, C.purple].map((c, i) => flat(onLeft(2.02, -21 + i * 11, 15, -13 + i * 11, 21, c)));
  const [px, py] = P([0, 2, 31]);
  return [
    ...box(-13, -9, 0, 26, 16, 2, C.dark), ...box(-3, -2, 2, 6, 4, 10, C.dark),
    ...box(-27, -2, 10, 54, 4, 34, C.dark),
    onLeft(2, -25, 12, 25, 42, C.screen),
    ...tiles,
    { d: `M${px - 4} ${py - 6} L${px + 6} ${py} L${px - 4} ${py + 6} Z`, fill: C.red, stroke: C.paper, sw: 1.2 },
  ];
}
function terminal(): Shape[] {
  const keys: Shape[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) keys.push(onTop(9.02, -8 + c * 6, -1 + r * 3.6, -4 + c * 6, 1.6 + r * 3.6, r === 3 && c === 2 ? C.green : C.grey, { sw: 0.9 }));
  return [
    ...box(-8, -15, 21, 16, 1.4, 14, C.orange), flat(onLeft(-13.59, -8, 30, 8, 32.5, C.orangeD)), flat(onLeft(-13.59, -6, 24, 0, 27, C.gold)),
    ...box(-12, -18, 9, 24, 8, 13, C.dark), onLeft(-10, -9.5, 12, 9.5, 20, '#c7e6b8'),
    ...box(-12, -18, 0, 24, 33, 9, C.dark),
    ...keys,
  ];
}

/* ---------------------------------------------------------------- infrastructure */
function server(): Shape[] {
  const out: Shape[] = [...box(-15, -13, 0, 30, 26, 58, C.blue)];
  for (let i = 0; i < 6; i++) {
    const z = 5 + i * 8.6;
    out.push(onLeft(13, -12.5, z, 12.5, z + 6.6, C.blueD, { sw: 1.1 }));
    for (let b = 0; b < 4; b++) out.push(flat(onLeft(13.01, -10.5 + b * 4.2, z + 1.4, -7.6 + b * 4.2, z + 5.2, '#5a76a8')));
    out.push(flat(onLeft(13.02, 7, z + 2.4, 9, z + 4.2, i === 2 ? C.ledA : C.led)), flat(onLeft(13.02, 10, z + 2.4, 11.6, z + 4.2, C.led)));
  }
  for (let i = 0; i < 5; i++) out.push(stroke(line([[15, -9 + i * 4.5, 10], [15, -9 + i * 4.5, 50]]), 1, '#6f8fc4'));
  return out;
}
function gateway(): Shape[] {
  const unit = (z: number): Shape[] => {
    const o = [...box(-26, -14, z, 52, 28, 13, C.blue)];
    for (let p = 0; p < 7; p++) { o.push(onLeft(14, -22 + p * 6, z + 3, -18 + p * 6, z + 8, C.dark, { sw: 1 })); o.push(flat(onLeft(14.01, -21.5 + p * 6, z + 9, -19 + p * 6, z + 10.6, p % 3 === 1 ? C.ledA : C.led))); }
    return o;
  };
  return [...unit(0), ...unit(14), stroke(line([[-14, -4, 27.1], [0, -4, 27.1], [6, -9, 27.1]]), 1.8), stroke(line([[0, -4, 27.1], [6, 2, 27.1]]), 1.8), stroke(line([[0, -4, 27.1], [10, -4, 27.1]]), 1.8)];
}
function database(color = C.purple): Shape[] {
  const out: Shape[] = [];
  for (let i = 0; i < 3; i++) out.push(...cylinder(0, 0, i * 15, 22, 13, color));
  out.push(flat(dot([0, 0, 43], 0, C.paper)));
  const lights = [0, 15, 30].map((z) => flat(onLeft(15.6, 8, z + 5, 11, z + 8, C.led)));
  return [...out, ...lights];
}
function chip(spark = false): Shape[] {
  const pins: Shape[] = [];
  for (let i = 0; i < 6; i++) {
    const t = -11 + i * 4.4;
    pins.push(onTop(6.02, t, -19, t + 2, -15, C.gold, { sw: 0.8 }), onTop(6.02, t, 15, t + 2, 19, C.gold, { sw: 0.8 }));
    pins.push(onTop(6.02, -19, t, -15, t + 2, C.gold, { sw: 0.8 }), onTop(6.02, 15, t, 19, t + 2, C.gold, { sw: 0.8 }));
  }
  const n: V3[] = [[-6, -5, 14.1], [-6, 5, 14.1], [5, -6, 14.1], [5, 6, 14.1], [0, 0, 14.1]];
  const glyph: Shape[] = [
    stroke(line([n[0], n[4], n[3]]), 1.2), stroke(line([n[1], n[4], n[2]]), 1.2), stroke(line([n[0], n[2]]), 1.2), stroke(line([n[1], n[3]]), 1.2),
    ...n.map((p) => dot(p, 2.1, C.paper, INK)),
  ];
  const sparkle: Shape[] = spark ? (() => { const [x, y] = P([0, 0, 30]); return [{ d: `M${x} ${y - 9} Q${x + 1.5} ${y - 1.5} ${x + 9} ${y} Q${x + 1.5} ${y + 1.5} ${x} ${y + 9} Q${x - 1.5} ${y + 1.5} ${x - 9} ${y} Q${x - 1.5} ${y - 1.5} ${x} ${y - 9} Z`, fill: C.amber, sw: 1.3 }]; })() : [];
  return [...box(-25, -25, 0, 50, 50, 6, C.amber), stroke(line([[-25, 10, 6.02], [-19, 10, 6.02], [-19, 22, 6.02]]), 1, C.amberD), ...pins, ...box(-14, -14, 6, 28, 28, 8, C.dark), onTop(14.02, -9, -9, 9, 9, '#4d4858', { sw: 1 }), ...glyph, ...sparkle];
}
function cabinet(): Shape[] {
  const o = [...box(-14, -12, 0, 28, 24, 48, C.lilac)];
  for (let i = 0; i < 3; i++) { const z = 3 + i * 15; o.push(onLeft(12, -11.5, z, 11.5, z + 13, mix(C.lilac, '#ffffff', 0.25), { sw: 1.1 }), onLeft(12, -4, z + 8, 4, z + 10, C.purpleD, { sw: 1 })); }
  return o;
}
function ram(): Shape[] {
  const stick = (y: number): Shape[] => {
    const o = [...box(-26, y, 0, 52, 3, 20, C.green), flat(onLeft(y + 3.01, -24, 0, 24, 3, C.gold))];
    for (let i = 0; i < 4; i++) o.push(onLeft(y + 3, -22 + i * 11.5, 6, -14 + i * 11.5, 16, '#2f3a2f', { sw: 1 }));
    return o;
  };
  return [...stick(-8), ...stick(4)];
}

/* ---------------------------------------------------------------- flows & processing */
function conveyor(len = 60): Shape[] {
  const h = len / 2;
  const o: Shape[] = [...box(-h, -9, 0, len, 18, 9, C.orange), onTop(9.02, -h + 1.5, -7.5, h - 1.5, 7.5, '#5a4b40', { sw: 1 })];
  for (let x = -h + 6; x < h - 2; x += 8) o.push(stroke(line([[x, -7.5, 9.04], [x, 7.5, 9.04]]), 0.8, '#8a7867'));
  return o;
}
function envelope(x: number, y: number, z: number, w = 9, d = 11): Shape[] {
  return [...box(x, y, z, w, d, 3, C.paper), stroke(line([[x, y, z + 3.02], [x + w / 2, y + d / 2, z + 3.02], [x + w, y, z + 3.02]]), 1)];
}
function queue(): Shape[] {
  return [...conveyor(64), ...envelope(-25, -5.5, 9), ...envelope(-8, -5.5, 9), ...envelope(9, -5.5, 9)];
}
function pipeline(): Shape[] {
  const [a, b] = P([-24, 0, 12]), [c, d] = P([-15, -2, 12]);
  return [
    ...conveyor(64),
    { d: circ(a, b - 3, 4), fill: C.rose }, { d: circ(c, d - 3, 3.4), fill: C.teal },
    ...box(-6, -12, 9, 12, 3, 20, C.orangeD), ...box(-6, -12, 29, 12, 24, 6, C.orange), ...box(-6, 9, 9, 12, 3, 20, C.orangeD),
    flat(onLeft(12.01, -3, 30.5, 3, 33.5, C.led)),
    ...box(14, -4, 9, 7, 7, 7, C.amber), ...box(23, -4, 9, 7, 7, 7, C.amber),
  ];
}
function tokens(): Shape[] {
  const o: Shape[] = [];
  [-24, -6, 12].forEach((x, i) => { o.push(...box(x, -7, 0, 14, 14, 6, [C.orange, C.amber, C.rose][i])); o.push(stroke(line([[x + 3, -3, 6.02], [x + 11, -3, 6.02]]), 1.2), stroke(line([[x + 3, 1, 6.02], [x + 8, 1, 6.02]]), 1.2)); });
  return o;
}
function inbox(): Shape[] {
  return [
    ...box(-20, -16, 0, 40, 32, 10, C.blue), onTop(10.01, -17, -13, 17, 13, C.blueD, { sw: 1 }),
    ...envelope(-14, -10, 4, 26, 18), ...envelope(-13, -9, 8, 26, 18), ...envelope(-12, -8, 12, 26, 18),
  ];
}
function bin(): Shape[] {
  const ribs: Shape[] = [-8, 0, 8].map((dx) => { const [x1, y1] = P([dx * 0.7, 16 - Math.abs(dx) * 0.4, 4]); const [, y2] = P([dx * 0.7, 16 - Math.abs(dx) * 0.4, 28]); return stroke(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x1.toFixed(1)} ${y2.toFixed(1)}`, 1.1, C.roseD); });
  return [...cylinder(0, 0, 0, 15, 32, C.rose), ...ribs, ...cylinder(0, 0, 32, 17, 3.5, C.roseD), ...box(-5, -2, 35.5, 10, 4, 3, C.roseD), ...envelope(-6, -8, 36.5, 10, 12)];
}
function doc(): Shape[] {
  const o: Shape[] = [];
  [[-3, 0], [0, -2], [2, -4]].forEach(([dx, z0], i) => o.push(...box(-14 + dx, -18, 0 + i * 2.5 + z0 * 0, 28, 36, 2.5, C.paper)));
  for (let i = 0; i < 5; i++) o.push(stroke(line([[-9, -12 + i * 6, 7.52], [i === 4 ? 4 : 11, -12 + i * 6, 7.52]]), 1.2, C.greyD));
  return o;
}
function books(): Shape[] {
  return [
    ...box(-18, -13, 0, 36, 26, 8, C.teal), onRight(18, -11, 1.5, 11, 6.5, C.paper, { sw: 0.9 }),
    ...box(-15, -11, 8, 30, 22, 7, C.orange), onRight(15, -9, 9.5, 9, 13.5, C.paper, { sw: 0.9 }),
    ...box(-12, -9, 15, 24, 18, 6, C.purple), onRight(12, -7, 16.3, 7, 19.7, C.paper, { sw: 0.9 }),
  ];
}
function toolbox(): Shape[] {
  return [
    ...box(-20, -11, 0, 40, 22, 17, C.teal), stroke(line([[-20, 11, 12], [20, 11, 12], [20, -11, 12]]), 1.2),
    flat(onLeft(11.01, -3, 8, 3, 11, C.gold)),
    stroke(line([[-8, 0, 17], [-8, 0, 23], [8, 0, 23], [8, 0, 17]]), 3, INK),
  ];
}
function magnifier(): Shape[] {
  const [cx, cy] = P([0, 0, 26]);
  return [
    ...box(-16, -16, 0, 32, 32, 3, C.grey),
    { d: `M${cx + 9} ${cy + 9} L${cx + 22} ${cy + 26}`, fill: 'none', stroke: INK, sw: 7 },
    { d: `M${cx + 9} ${cy + 9} L${cx + 22} ${cy + 26}`, fill: 'none', stroke: C.wood, sw: 4.2 },
    { d: circ(cx, cy, 15), fill: C.blue, sw: 5 }, { d: circ(cx, cy, 15), fill: mix(C.blue, '#ffffff', 0.45), stroke: C.blueD, sw: 2.2 },
    stroke(`M${cx - 8} ${cy - 3} a9 9 0 0 1 6 -6`, 2, '#ffffff'),
  ];
}
function monitor(kind: 'bars' | 'pulse' | 'check'): Shape[] {
  const o: Shape[] = [...box(-11, -8, 0, 22, 14, 2, C.dark), ...box(-2, -2, 2, 4, 4, 10, C.dark), ...box(-25, -2, 12, 50, 4, 32, C.dark), onLeft(2, -23, 14, 23, 42, '#eef0fc')];
  if (kind === 'pulse') o.push(stroke(line([[-21, 2.02, 27], [-10, 2.02, 27], [-6, 2.02, 37], [-1, 2.02, 18], [4, 2.02, 31], [8, 2.02, 27], [21, 2.02, 27]]), 1.8, C.roseD));
  else {
    [10, 16, 12, 21].forEach((h, i) => o.push(onLeft(2.02, -20 + i * 7, 17, -15.5 + i * 7, 17 + h, i === 3 ? C.indigoD : C.indigo, { sw: 1 })));
    if (kind === 'check') o.push(stroke(line([[9, 2.03, 28], [13, 2.03, 23], [21, 2.03, 35]]), 2.4, C.greenD));
    else o.push(stroke(line([[8, 2.03, 20], [12, 2.03, 28], [16, 2.03, 25], [21, 2.03, 36]]), 1.8, C.orangeD));
  }
  return o;
}

/* ---------------------------------------------------------------- places & real-world things */
function house(): Shape[] {
  const wall = '#f6dfc2', roof = '#e28a6a', s = shade(wall);
  return [
    { d: poly([[-21, -17, 22], [21, -17, 22], [21, 0, 37], [-21, 0, 37]]), fill: mix(roof, '#3a2a14', 0.2) },
    ...box(6, -10, 26, 5, 5, 14, '#b9705a'),
    { d: poly([[18, -14, 0], [18, 14, 0], [18, 14, 22], [18, 0, 35], [18, -14, 22]]), fill: s.right },
    { d: poly([[-18, 14, 0], [18, 14, 0], [18, 14, 22], [-18, 14, 22]]), fill: s.left },
    onLeft(14, -4, 0, 4, 13, C.wood), flat(dot([2.6, 14.02, 6.5], 0.8, C.gold)),
    onLeft(14, -14, 8, -8, 15, '#cfe0f5', { sw: 1.1 }), onLeft(14, 8, 8, 14, 15, '#cfe0f5', { sw: 1.1 }),
    onRight(18, -7, 9, 1, 16, '#cfe0f5', { sw: 1.1 }), onRight(18, -4, 25, -1, 29, '#cfe0f5', { sw: 1 }),
    { d: poly([[-21, 0, 37], [21, 0, 37], [21, 17, 22], [-21, 17, 22]]), fill: roof },
    stroke(line([[-21, 8.5, 29.5], [21, 8.5, 29.5]]), 0.9, mix(roof, '#3a2a14', 0.3)),
  ];
}
function bank(): Shape[] {
  const stone = '#efe7da';
  const cols: Shape[] = [];
  [-17, -6, 5, 16].forEach((x) => cols.push(...cylinder(x, 12.5, 7, 3, 22, '#f7f2ea')));
  return [
    ...box(-27, -19, 0, 54, 38, 4, '#e3dacb'), ...box(-24, -16, 4, 48, 32, 3, stone),
    ...box(-21, -14, 7, 42, 22, 22, '#e6dccb'), onLeft(8, -4, 7, 4, 19, C.wood),
    ...cols,
    ...box(-26, -18, 29, 52, 36, 4, stone),
    { d: poly([[0, -18, 44], [0, 18, 44], [26, 18, 33], [26, -18, 33]]), fill: mix(stone, '#3a2a14', 0.12) },
    { d: poly([[-26, 18, 33], [26, 18, 33], [0, 18, 44]]), fill: stone },
    disc([0, 18.02, 37.5], AX.X, AX.Z, 3.6, C.gold),
  ];
}
function machine(): Shape[] {
  const body = '#a9cfc6';
  const needle = line([[-6, 14.03, 17], [-2, 14.03, 21]]);
  return [
    ...cylinder(11, -5, 26, 4.5, 14, C.greyD), ...cylinder(11, -5, 40, 6, 2, C.dark),
    ...box(-22, -14, 0, 44, 28, 26, body),
    onLeft(14, -22, 0, 22, 4, C.amber, { sw: 1 }),
    ...[-18, -10, -2, 6, 14].map((x) => flat(onLeft(14.01, x, 0.3, x + 3.5, 3.7, C.dark))),
    disc([-6, 14.02, 17], AX.X, AX.Z, 7.5, C.paper), stroke(needle, 1.8, C.red), flat(dot([-6, 14.03, 17], 1.4, INK)),
    onLeft(14, 6, 9, 18, 21, '#2f3a4f', { sw: 1.1 }), flat(onLeft(14.02, 8, 15, 12, 18, C.led)), flat(onLeft(14.02, 13, 11, 16.5, 13, C.ledA)),
    onRight(22, -8, 6, -3, 23, C.paper, { sw: 1.1 }), flat(onRight(22.02, -6.8, 7, -4.2, 16, C.red)),
  ];
}
function antenna(): Shape[] {
  const [tx, ty] = P([6, -3, 42]);
  return [
    ...box(-13, -10, 0, 26, 20, 14, C.orange), flat(onLeft(10.01, -9, 5, -6, 8, C.led)), flat(onLeft(10.01, -4, 5, -1, 8, C.led)), flat(onLeft(10.01, 1, 5, 4, 8, C.ledA)),
    ...cylinder(6, -3, 14, 1.6, 28, C.dark), { d: circ(tx, ty, 3), fill: C.red },
    stroke(`M${tx - 8} ${ty - 6} a10 10 0 0 0 0 12 M${tx + 8} ${ty - 6} a10 10 0 0 1 0 12`, 1.6),
    stroke(`M${tx - 13} ${ty - 10} a16 16 0 0 0 0 20 M${tx + 13} ${ty - 10} a16 16 0 0 1 0 20`, 1.4),
  ];
}
function shield(): Shape[] {
  const out: V3[] = [[-16, 0, 46], [16, 0, 46], [16, 0, 26], [9, 0, 10], [0, 0, 2], [-9, 0, 10], [-16, 0, 26]];
  const at = (y: number) => out.map(([x, , z]) => [x, y, z] as V3);
  return [
    ...box(-14, -8, 0, 28, 16, 3, C.grey),
    { d: poly(at(-3)), fill: C.roseD }, { d: poly(at(3)), fill: C.rose },
    stroke(line([[-7, 3.02, 25], [-1, 3.02, 19], [9, 3.02, 33]]), 2.8, C.paper),
  ];
}
function clapper(): Shape[] {
  const o: Shape[] = [...box(-19, -3, 0, 38, 6, 25, C.dark)];
  for (let i = 0; i < 3; i++) o.push(stroke(line([[-15, 3.02, 6 + i * 5], [i === 2 ? 2 : 13, 3.02, 6 + i * 5]]), 1.4, C.paper));
  const arm: V3[] = [[-19, 3, 26], [19, 3, 32], [19, 3, 39], [-19, 3, 33]];
  o.push({ d: poly(arm), fill: C.paper });
  for (let i = 0; i < 4; i++) { const x = -15 + i * 9.5; o.push(flat({ d: poly([[x, 3.02, 26.6 + (x + 19) * 0.158], [x + 4.5, 3.02, 27.3 + (x + 23.5) * 0.158], [x + 4.5, 3.02, 33.3 + (x + 23.5) * 0.158], [x, 3.02, 32.6 + (x + 19) * 0.158]]), fill: C.dark })); }
  o.push(...box(-19, -3, 25, 38, 6, 2, C.greyD));
  return o;
}
function tree(x: number, y: number, s = 1, leaf = C.green): Shape[] {
  const [cx, cy] = P([x, y, 30 * s]);
  return [
    ...cylinder(x, y, 0, 3.2 * s, 20 * s, C.wood),
    { d: circ(cx - 6 * s, cy + 3 * s, 10 * s), fill: mix(leaf, '#3a5a2a', 0.18) },
    { d: circ(cx + 6 * s, cy + 2 * s, 10.5 * s), fill: mix(leaf, '#3a5a2a', 0.08) },
    { d: circ(cx, cy - 6 * s, 11.5 * s), fill: leaf },
    { d: circ(cx - 3 * s, cy - 10 * s, 3 * s), fill: mix(leaf, '#ffffff', 0.35), stroke: 'none' },
  ];
}
function robot(): Shape[] {
  const [ax, ay] = P([0, 0, 48]);
  return [
    ...box(-15, -4, 6, 4, 8, 14, C.blueD),
    ...box(-11, -9, 0, 22, 18, 22, C.blue), onLeft(9, -6, 6, 6, 16, mix(C.blue, '#ffffff', 0.35), { sw: 1 }),
    ...box(-9, -8, 22, 18, 16, 15, '#d4e2f5'),
    onLeft(8, -6, 27, -1, 32, C.screen, { sw: 1 }), onLeft(8, 2, 27, 7, 32, C.screen, { sw: 1 }),
    flat(onLeft(8.02, -4.4, 28.5, -2.6, 30.5, C.led)), flat(onLeft(8.02, 3.6, 28.5, 5.4, 30.5, C.led)),
    ...cylinder(0, 0, 37, 1, 9, C.dark), { d: circ(ax, ay, 2.8), fill: C.red },
    ...box(11, -4, 6, 4, 8, 14, C.blueD),
  ];
}
function plug(): Shape[] {
  const [bx, by] = P([0, 8, 2]);
  return [
    stroke(`M${bx} ${by} C${bx - 10} ${by + 14} ${bx + 26} ${by + 12} ${bx + 34} ${by + 2}`, 3.4),
    ...box(-3.5, -5, 22, 2.2, 3, 11, C.gold), ...box(2.5, -5, 22, 2.2, 3, 11, C.gold),
    ...box(-9, -8, 0, 18, 16, 22, C.teal), onLeft(8, -6, 8, 6, 12, mix(C.teal, '#ffffff', 0.3), { sw: 1 }),
    ...box(-3.5, 1, 22, 2.2, 3, 11, C.gold), ...box(2.5, 1, 22, 2.2, 3, 11, C.gold),
  ];
}
function dice(): Shape[] {
  const o: Shape[] = [...box(-13, -13, 0, 26, 26, 26, C.paper)];
  const top: [number, number][] = [[-7, -7], [7, 7], [0, 0], [-7, 7], [7, -7]];
  top.forEach(([x, y]) => o.push(flat(disc([x, y, 26.02], AX.X, AX.Y, 2.4, C.dark))));
  [[-7, 20], [0, 13], [7, 6]].forEach(([x, z]) => o.push(flat(disc([x, 13.02, z], AX.X, AX.Z, 2.4, C.red))));
  [[-6, 19], [6, 7]].forEach(([y, z]) => o.push(flat(disc([13.02, y, z], AX.Y, AX.Z, 2.4, C.dark))));
  return o;
}
function scatter3d(): Shape[] {
  const pts: [V3, string][] = [[[-12, -6, 18], C.purpleD], [[-6, -12, 26], C.purpleD], [[-14, -14, 12], C.purpleD], [[8, 10, 30], C.orangeD], [[12, 4, 22], C.orangeD], [[4, 14, 16], C.orangeD], [[10, -12, 8], C.tealD], [[16, -6, 14], C.tealD]];
  const o: Shape[] = [...box(-22, -22, 0, 44, 44, 2, C.lilac)];
  for (let i = -1; i <= 1; i++) { o.push(stroke(line([[i * 11, -22, 2.02], [i * 11, 22, 2.02]]), 0.8, C.purpleD), stroke(line([[-22, i * 11, 2.02], [22, i * 11, 2.02]]), 0.8, C.purpleD)); }
  o.push(stroke(line([[-22, -22, 2], [-22, -22, 40]]), 1.6), stroke(line([[-22, -22, 2], [24, -22, 2]]), 1.6), stroke(line([[-22, -22, 2], [-22, 24, 2]]), 1.6));
  pts.sort((a, b) => a[0][0] + a[0][1] - (b[0][0] + b[0][1])).forEach(([p, c]) => { o.push(stroke(line([p, [p[0], p[1], 2]]), 0.7, C.greyD), dot(p, 3.4, c)); });
  return o;
}

/** Every object kind → its illustration. */
export const ART: Record<ObjectKind, () => Shape[]> = {
  user: () => CROWD.slice().sort((a, b) => a[0] + a[1] - (b[0] + b[1])).flatMap(([x, y, c]) => person(x, y, c, 0.82)),
  person: () => person(0, 0, C.blue),
  browser: laptop, laptop, phone, tv, terminal,
  server, gateway, search: magnifier, agent: robot,
  llm: () => chip(true), model: () => chip(false), dice,
  db: () => database(), vector: scatter3d, memory: cabinet, doc,
  cache: ram,
  tokens, queue, pipeline,
  tool: toolbox, plug, skill: books,
  shield,
  judge: () => monitor('check'), trace: () => monitor('pulse'), dashboard: () => monitor('bars'),
  inbox, bin, house, bank, machine, antenna, film: clapper,
  tree: () => tree(0, 0, 1.15), forest: () => [[-13, -8, 0.85, C.green], [12, -10, 0.95, mix(C.green, '#5f8f4f', 0.25)], [0, 9, 0.9, mix(C.green, '#ffffff', 0.12)]].flatMap(([x, y, s, c]) => tree(x as number, y as number, s as number, c as string)),
};
