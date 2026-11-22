import { useMemo } from 'react';
import type { ObjectKind } from './types';
import { ART } from './art';
import { INK, OX, OY } from './iso';

export interface SceneObjectProps {
  kind: ObjectKind;
  label: string;
  sub?: string;
  state: 'idle' | 'done' | 'on';
}

/** One realistic isometric object (140 × 120) with a name pill. Anchor: ground centre at (70, 72) of the box. */
export function SceneObject({ kind, label, sub, state }: SceneObjectProps) {
  const shapes = useMemo(() => ART[kind](), [kind]);
  return (
    <div className={`obj obj--${state}`} role="img" aria-label={label + (sub ? `, ${sub}` : '')}>
      <svg width="140" height="120" viewBox="0 0 140 120" overflow="visible" aria-hidden="true">
        <ellipse className="obj__pad" cx={OX} cy={OY} rx="60" ry="30" />
        <ellipse cx={OX} cy={OY + 2} rx="46" ry="19" fill="#6b5236" opacity=".16" />
        <g strokeLinejoin="round" strokeLinecap="round" transform={`translate(${OX} ${OY}) scale(1.18) translate(${-OX} ${-OY})`}>
          {shapes.map((s, i) => (
            <path key={i} d={s.d} fill={s.fill} stroke={s.stroke === 'none' ? undefined : s.stroke ?? INK} strokeWidth={s.stroke === 'none' ? 0 : s.sw ?? 1.4} opacity={s.op} />
          ))}
        </g>
      </svg>
      <span className="obj__pill">{label}{sub && <em className="obj__sub">{sub}</em>}</span>
      {state === 'on' && <span className="sr-only">(this step)</span>}
    </div>
  );
}
