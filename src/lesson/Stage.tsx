import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SceneObject } from './SceneObject';
import type { Callout, Lesson, LessonCtx, SceneLink, SceneNode } from './types';

export const STAGE_W = 760;
export const STAGE_H = 330;
const DRAW_MS = 900;

type Pt = [number, number];
interface Geo { d: string; tip: Pt; angle: number }

/** Each object's outline is approximated by an ellipse around its visual centre (anchor y − 8). */
const NARROW = new Set(['person', 'phone', 'server', 'memory', 'bin', 'db', 'tree', 'antenna']);
const radiiFor = (kind: SceneNode['kind']): [number, number] => (NARROW.has(kind) ? [38, 50] : [56, 46]);

/** Point where a ray from the object's centre toward `toward` leaves its outline, plus a small gap. */
function edge(n: SceneNode, toward: Pt, gap: number): Pt {
  const c: Pt = [n.x, n.y - 12];
  const vx = toward[0] - c[0], vy = toward[1] - c[1], len = Math.hypot(vx, vy) || 1;
  const ux = vx / len, uy = vy / len;
  const [rx, ry] = radiiFor(n.kind);
  const k = 1 / Math.sqrt((ux / rx) ** 2 + (uy / ry) ** 2);
  return [c[0] + ux * (k + gap), c[1] + uy * (k + gap)];
}

/** Path between two objects, trimmed at their outlines so the arrowhead is always visible. */
function geometry(a: SceneNode, b: SceneNode, curve?: Pt): Geo {
  if (curve) {
    const s = edge(a, curve, 4), e = edge(b, curve, 6);
    const angle = (Math.atan2(e[1] - curve[1], e[0] - curve[0]) * 180) / Math.PI;
    return { d: `M${s[0].toFixed(1)} ${s[1].toFixed(1)} Q${curve[0]} ${curve[1]} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`, tip: e, angle };
  }
  const s = edge(a, [b.x, b.y - 12], 4), e = edge(b, [a.x, a.y - 12], 6);
  const angle = (Math.atan2(e[1] - s[1], e[0] - s[0]) * 180) / Math.PI;
  return { d: `M${s[0].toFixed(1)} ${s[1].toFixed(1)} L${e[0].toFixed(1)} ${e[1].toFixed(1)}`, tip: e, angle };
}

/** A packet travelling along a path, driven by requestAnimationFrame so Pause really pauses it. */
function Packet({ d, color, delay, paused }: { d: string; color: string; delay: number; paused: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const t = useRef(-delay);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = now - last; last = now;
      if (!pausedRef.current && !reduce) t.current += dt;
      const path = pathRef.current, dot = dotRef.current;
      if (path && dot) {
        const len = path.getTotalLength();
        const u = t.current < 0 ? -1 : (t.current % 1500) / 1500;
        if (u < 0) dot.style.opacity = '0';
        else {
          const p = path.getPointAtLength(u * len);
          dot.setAttribute('cx', p.x.toFixed(1)); dot.setAttribute('cy', p.y.toFixed(1));
          dot.style.opacity = u > 0.92 ? String((1 - u) / 0.08) : '1';
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <g>
      <path ref={pathRef} d={d} fill="none" stroke="none" />
      <circle ref={dotRef} r="5.5" fill={color} stroke="var(--ink)" strokeWidth="1.5" style={{ opacity: 0 }} />
    </g>
  );
}

const CALLOUT_TONE: Record<Callout['tone'], string> = {
  sheet: 'callout', violet: 'callout callout--violet', orange: 'callout callout--orange', green: 'callout callout--green',
};

interface Props { lesson: Lesson; step: number; ctx: LessonCtx; paused: boolean; replayKey: number }

export function Stage({ lesson: base, step, ctx, paused, replayKey }: Props) {
  // Steps marked scene: 'system' show the real production system; other steps show the concept diagram.
  const lesson = useMemo(() => {
    const sys = base.steps[step]?.scene === 'system' && base.system;
    if (!sys) return base;
    return { ...base, nodes: sys.nodes, links: sys.links, steps: base.steps.map((s) => (s.scene === 'system' ? s : { ...s, focus: [], draw: [], packets: [], callout: undefined })) };
  }, [base, step]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setScale(Math.max(0.45, Math.min(width / STAGE_W, height / STAGE_H, 1.3)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cur = lesson.steps[step];
  const isRecap = cur.tag === 'RECAP';
  const byId = useMemo(() => Object.fromEntries(lesson.nodes.map((n) => [n.id, n])), [lesson]);
  const firstFocus = useMemo(() => {
    const m: Record<string, number> = {};
    lesson.steps.forEach((s, i) => s.focus.forEach((id) => { if (m[id] === undefined) m[id] = i; }));
    return m;
  }, [lesson]);
  const drawnAt = useMemo(() => {
    const m: Record<string, number> = {};
    lesson.steps.forEach((s, i) => (s.draw || []).forEach((id) => { if (m[id] === undefined) m[id] = i; }));
    return m;
  }, [lesson]);

  const visible = (id: string) => (byId[id]?.appearsAt ?? 0) <= step && step <= (byId[id]?.hideAfter ?? Infinity);
  const geo = (l: SceneLink) => geometry(byId[l.from], byId[l.to], l.curve);
  const colour = (l: SceneLink) => (l.tone === 'grounded' ? 'var(--green-fg)' : 'var(--ink)');

  const links = lesson.links.filter((l) => visible(l.from) && visible(l.to));
  const walked = links.filter((l) => drawnAt[l.id] !== undefined && drawnAt[l.id] < step);
  const drawing = links.filter((l) => drawnAt[l.id] === step);
  const preview = links.filter((l) => !l.curve && (drawnAt[l.id] === undefined || drawnAt[l.id] > step));
  const packetIds = cur.packets ?? cur.draw ?? [];
  const callout = typeof cur.callout === 'function' ? cur.callout(ctx) : cur.callout;

  return (
    <div className={`stage${paused ? ' is-paused' : ''}`} ref={wrapRef}>
      <div className="stage__canvas" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <svg className="stage__links" width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
          {preview.map((l) => <path key={'p' + l.id} d={geo(l).d} className="link link--off" />)}
          {walked.map((l) => {
            const g = geo(l);
            return (
              <g key={'w' + l.id}>
                <path d={g.d} className="link" style={{ stroke: colour(l) }} />
                <path d="M1 0 L-10 -5.5 L-7 0 L-10 5.5 Z" transform={`translate(${g.tip[0].toFixed(1)} ${g.tip[1].toFixed(1)}) rotate(${g.angle.toFixed(1)})`} style={{ fill: colour(l), stroke: colour(l) }} className="head" />
              </g>
            );
          })}
          {drawing.map((l) => {
            const g = geo(l);
            return (
              <g key={`d${l.id}-${step}-${replayKey}`}>
                <path d={g.d} pathLength={1} className="link link--draw" style={{ stroke: colour(l) }} />
                <g transform={`translate(${g.tip[0].toFixed(1)} ${g.tip[1].toFixed(1)}) rotate(${g.angle.toFixed(1)})`}>
                  <path d="M1 0 L-10 -5.5 L-7 0 L-10 5.5 Z" className="head head--pop" style={{ fill: colour(l), stroke: colour(l) }} />
                </g>
              </g>
            );
          })}
          {links.filter((l) => packetIds.includes(l.id)).map((l) => (
            <Packet key={`k${l.id}-${step}-${replayKey}`} d={geo(l).d} color={l.tone === 'grounded' ? '#9fd28f' : '#f3b47f'} delay={drawnAt[l.id] === step ? DRAW_MS : 0} paused={paused} />
          ))}
        </svg>

        {lesson.nodes.filter((n) => visible(n.id)).map((n, ni) => {
          const state = cur.focus.includes(n.id) ? 'on' : !isRecap && (firstFocus[n.id] ?? 0) > step ? 'idle' : 'done';
          return (
            <div key={n.id} className="stage__node" style={{ left: n.x - 70, top: n.y - 72, ['--i' as string]: ni }}>
              <SceneObject kind={n.kind} label={n.label} sub={n.sub} state={state} />
            </div>
          );
        })}

        {callout && byId[callout.at] && (
          <div
            key={`c${step}-${replayKey}`}
            className={CALLOUT_TONE[callout.tone]}
            style={{
              left: byId[callout.at].x,
              top: byId[callout.at].y + (callout.place === 'below' ? 78 : -104),
              ['--shift' as string]: byId[callout.at].x < 70 ? '-22%' : byId[callout.at].x > STAGE_W - 70 ? '-78%' : '-50%',
            }}
          >
            {callout.text}
          </div>
        )}
      </div>
    </div>
  );
}
