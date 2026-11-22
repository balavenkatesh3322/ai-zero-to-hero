import { AppView } from '../apps/AppView';
import { useState } from 'react';
import type { LessonCtx, Widget } from './types';
import { MODELS, cost, money } from '../lessons/data/pricing';
import { LineChart, Pixels, Scatter } from './Charts';

const TEMPS = ['0.0', '0.7', '1.5'];

/** Tokens that are partial UTF-8 bytes decode to U+FFFD on their own — show them as a byte marker. */
const tokenText = (t: string) => (t.includes('�') ? '·byte·' : t === '\n' ? '↵' : t);

function Samples({ samples }: Extract<Widget, { type: 'samples' }>) {
  const [i, setI] = useState(0);
  const s = samples[i];
  return (
    <div className="w-col w-wide">
      <div className="seg" role="tablist" aria-label="Sample text">
        {samples.map((x, j) => (
          <button key={x.name} type="button" role="tab" aria-selected={i === j} className={i === j ? 'seg__opt pop' : 'seg__opt ghost'} onClick={() => setI(j)}>{x.name}</button>
        ))}
      </div>
      <div className="w-row">
        {s.tokens.map((t, j) => (
          <div key={`${i}-${j}`} className="token" style={{ animationDelay: `${j * 25}ms` }}>
            <div className="token__t">{tokenText(t.text)}</div>
            <div className="token__id">#{t.id}</div>
          </div>
        ))}
      </div>
      <span className="w-cap"><b>{s.chars}</b> characters → <b>{s.tokens.length}</b> tokens · “{s.text.replace(/\n/g, '↵')}”</span>
    </div>
  );
}

function Quiz({ items }: Extract<Widget, { type: 'quiz' }>) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  return (
    <div className="quiz">
      {items.map((q, qi) => {
        const p = picked[qi];
        return (
          <div key={qi} className="w-panel quiz__item">
            <div className="quiz__prompt">{q.prompt}</div>
            <div className="quiz__choices">
              {q.choices.map((c, ci) => {
                const state = p === undefined ? '' : ci === p ? (c.correct ? ' is-right' : ' is-wrong') : c.correct ? ' is-answer' : '';
                return <button key={ci} type="button" className={`quiz__choice${state}`} onClick={() => setPicked({ ...picked, [qi]: ci })} aria-pressed={p === ci}>{c.text}</button>;
              })}
            </div>
            {p !== undefined && <p className="quiz__why">{q.choices[p].correct ? '✓ ' : '✗ '}{q.choices[p].why}</p>}
          </div>
        );
      })}
    </div>
  );
}

function Picker({ title, options }: Extract<Widget, { type: 'picker' }>) {
  const [i, setI] = useState(0);
  const o = options[i];
  return (
    <div className="w-col w-wide">
      <span className="w-cap">{title}</span>
      <div className="seg">
        {options.map((x, j) => <button key={x.label} type="button" aria-pressed={i === j} className={i === j ? 'seg__opt pop' : 'seg__opt ghost'} onClick={() => setI(j)}>{x.label}</button>)}
      </div>
      <div className="w-panel picker__out">
        <div className="w-cap">{o.detail}</div>
        <p className={`picker__result${o.tone ? ' picker__result--' + o.tone : ''}`}>{o.result}</p>
      </div>
    </div>
  );
}

function Code({ title, code, note, bad, run }: Extract<Widget, { type: 'code' }>) {
  return (
    <div className="w-row w-wide" style={{ alignItems: 'stretch' }}>
      <div className={`code${bad ? ' code--bad' : ''}`}>
        <div className="code__title">{title}</div>
        <pre><code>{code}</code></pre>
        {note && <div className="code__note">{note}</div>}
      </div>
      {run && (
        <div className="w-panel run">
          <div className="w-cap">{run.label}</div>
          {run.inputs.map((inp) => (
            <div key={inp} className="run__row"><span className="run__in">“{inp}”</span><span className="run__out">→ {run.fn(inp)}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

function Calc() {
  const [m, setM] = useState(0);
  const [inTok, setIn] = useState(2000);
  const [outTok, setOut] = useState(300);
  const [reqs, setReqs] = useState(1000);
  const model = MODELS[m];
  const day = cost(inTok * reqs, model.input) + cost(outTok * reqs, model.output);
  const num = (v: string, set: (n: number) => void) => set(Math.max(0, Math.min(10_000_000, Math.round(Number(v) || 0))));
  return (
    <div className="calc w-panel">
      <div className="calc__inputs">
        <label>Model
          <select value={m} onChange={(e) => setM(Number(e.target.value))}>{MODELS.map((x, i) => <option key={x.id} value={i}>{x.name}</option>)}</select>
        </label>
        <label>Input tokens / request<input type="number" min={0} value={inTok} onChange={(e) => num(e.target.value, setIn)} /></label>
        <label>Output tokens / request<input type="number" min={0} value={outTok} onChange={(e) => num(e.target.value, setOut)} /></label>
        <label>Requests / day<input type="number" min={0} value={reqs} onChange={(e) => num(e.target.value, setReqs)} /></label>
      </div>
      <div className="calc__out">
        <div><span className="w-cap">per request</span><b>{money(reqs ? day / reqs : 0)}</b></div>
        <div><span className="w-cap">per day</span><b>{money(day)}</b></div>
        <div><span className="w-cap">per 30 days</span><b>{money(day * 30)}</b></div>
      </div>
      <span className="w-cap">{model.name}: ${model.input} in · ${model.output} out per 1M tokens{model.note ? ` (${model.note})` : ''}. Your numbers — change them.</span>
    </div>
  );
}

export function WidgetView({ widget, ctx, setCtx }: { widget?: Widget; ctx: LessonCtx; setCtx: (c: LessonCtx) => void }) {
  if (!widget) return null;
  switch (widget.type) {
    case 'app':
      return <AppView app={widget.app} />;
    case 'transcript':
      return (
        <div className="w-chat">
          <div className="w-panel w-chat__log">
            {widget.title && <span className="w-cap">{widget.title}</span>}
            {widget.messages.map((m, i) => (
              m.role === 'note'
                ? <span key={i} className="w-cap chat-note">{m.text}</span>
                : <span key={i} className={`bubble bubble--${m.role}${m.tone ? ' bubble--' + m.tone : ''}`} style={{ animationDelay: `${i * 0.25}s` }}><span className="bubble__role">{m.role}</span>{m.text}</span>
            ))}
          </div>
          {widget.aside && (() => {
            const { title, text, highlight } = widget.aside;
            const [a, b] = highlight ? text.split(highlight) : [text, ''];
            return (
              <div className="w-panel w-panel--dashed w-chat__aside">
                <span className="w-cap">{title}</span>
                <p className="w-truth">{a}{highlight && <mark>{highlight}</mark>}{b}</p>
              </div>
            );
          })()}
        </div>
      );
    case 'tokens':
      return (
        <div className="w-row">
          {widget.tokens.map((t, i) => (
            <div key={i} className="token" style={{ animationDelay: `${i * 45}ms` }}>
              <div className="token__t">{tokenText(t.text)}</div>
              <div className="token__id">#{t.id}</div>
            </div>
          ))}
        </div>
      );
    case 'samples':
      return <Samples {...widget} />;
    case 'vectors': {
      const max = Math.max(...widget.words.flatMap((w) => w.values.map(Math.abs)));
      return (
        <div className="w-col w-wide">
          <div className="w-row">
            {widget.words.map((w, wi) => (
              <div key={w.word} className="w-panel vec">
                <div className="vec__t">“{w.word.trim()}”</div>
                <svg className="vec__chart" viewBox="0 0 144 56" width="144" height="56" role="img" aria-label={`First 12 embedding values for ${w.word.trim()}`}>
                  <line x1="0" x2="144" y1="28" y2="28" className="vec__axis" />
                  {w.values.map((v, i) => {
                    const h = Math.max(1.5, (Math.abs(v) / max) * 26);
                    return (
                      <rect key={i} x={i * 12 + 2} width="8" y={v >= 0 ? 28 - h : 28} height={h} rx="1.5"
                        className={`vec__rect vec__rect--${v >= 0 ? (wi === 2 ? 'orange' : 'violet') : 'neg'}`} style={{ animationDelay: `${i * 30}ms`, transformOrigin: `${i * 12 + 6}px 28px` }}>
                        <title>{v.toFixed(4)}</title>
                      </rect>
                    );
                  })}
                </svg>
                <div className="w-cap">first 12 values</div>
              </div>
            ))}
          </div>
          <div className="w-row">
            {widget.pairs.map((p) => <span key={p.a + p.b} className="pairchip">cos(“{p.a.trim()}”, “{p.b.trim()}”) = <b>{p.cos.toFixed(3)}</b></span>)}
          </div>
        </div>
      );
    }
    case 'attention': {
      const max = Math.max(...widget.tokens.map((t) => t.weight));
      return (
        <div className="w-col">
          <div className="w-row">
            {widget.tokens.map((t, i) => (
              <span key={i} className="attn" style={{ background: `color-mix(in srgb, var(--green-2) ${Math.round((t.weight / max) * 100)}%, var(--sheet))`, borderColor: t.weight === max ? 'var(--ink)' : undefined }}>
                {t.text}<small>{(t.weight * 100).toFixed(0)}%</small>
              </span>
            ))}
          </div>
          <span className="w-cap">{widget.caption}</span>
        </div>
      );
    }
    case 'bars': {
      const rows = widget.rows(ctx);
      const max = widget.max ?? Math.max(...rows.map((r) => r.value), 1e-9);
      return (
        <div className="w-probs">
          {rows.map((r) => (
            <div key={r.label} className="prob">
              <span className="prob__t">{r.label}</span>
              <span className="prob__track"><span className={`prob__fill${r.tone === 'good' ? ' prob__fill--good' : r.tone === 'bad' ? ' prob__fill--bad' : ''}`} style={{ width: `${Math.max(0.5, (r.value / max) * 100)}%` }} /></span>
              <span className="prob__p">{r.display ?? r.value.toFixed(3)}</span>
            </div>
          ))}
          {widget.dial && (
            <div className="dial" role="radiogroup" aria-label="Temperature">
              <span className="w-cap">TEMPERATURE</span>
              {TEMPS.map((label, i) => (
                <button key={label} type="button" role="radio" aria-checked={ctx.temp === i} className={ctx.temp === i ? 'dial__opt pop' : 'dial__opt ghost'} onClick={() => setCtx({ ...ctx, temp: i })}>{label}</button>
              ))}
            </div>
          )}
          {widget.caption && <span className="w-cap">{widget.caption}</span>}
        </div>
      );
    }
    case 'flow':
      return <div className="w-row">{widget.chips.map((c, i) => <span key={i} className="flowchip" style={{ animationDelay: `${i * 90}ms` }}>{c}</span>)}</div>;
    case 'compare':
      return (
        <div className="compare">
          {widget.cards.map((c, i) => (
            <div key={c.title} className={`w-panel compare__card compare__card--${c.tone}`} style={{ animationDelay: `${i * 90}ms` }}>
              <div className="compare__title">{c.title}</div>
              <ul>{c.lines.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
          ))}
        </div>
      );
    case 'code':
      return <Code {...widget} />;
    case 'table':
      return (
        <div className="w-col w-wide">
          <div className="tablewrap">
            <table className="dtable">
              <thead><tr>{widget.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{widget.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
          {widget.caption && <span className="w-cap">{widget.caption}</span>}
        </div>
      );
    case 'quiz':
      return <Quiz {...widget} />;
    case 'picker':
      return <Picker {...widget} />;
    case 'calc':
      return <Calc />;
    case 'line':
      return <LineChart {...widget} />;
    case 'scatter':
      return <Scatter {...widget} />;
    case 'pixels':
      return <Pixels {...widget} />;
  }
}
