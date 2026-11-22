import type { Lesson } from '../../lesson/types';
import { MODELS, PRICING_SOURCE, cost, money } from '../data/pricing';

/** A worked example. These are stated assumptions, not measurements — the lesson asks you to swap in your own. */
const EX = { manual: 20_000, question: 300, out: 300, perDay: 5_000 };
const opus = MODELS[0];
const inTok = EX.manual + EX.question;
const dayIn = cost(inTok * EX.perDay, opus.input);
const dayOut = cost(EX.out * EX.perDay, opus.output);
const day = dayIn + dayOut;
const cachedIn = cost(EX.manual * EX.perDay, opus.cacheRead!) + cost(EX.question * EX.perDay, opus.input);
const dayCached = cachedIn + dayOut;
const perModel = MODELS.map((m) => ({ m, d: cost(inTok * EX.perDay, m.input) + cost(EX.out * EX.perDay, m.output) }));
const ASSUME = `Worked example (assumptions you should replace): ${EX.manual.toLocaleString('en-US')}-token manual + ${EX.question}-token question in, ${EX.out} tokens out, ${EX.perDay.toLocaleString('en-US')} requests/day. Prices: ${PRICING_SOURCE}.`;

export const napkinMath: Lesson = {
  slug: 'napkin-math-cost-and-latency',
  phase: 'SH',
  index: 5,
  title: 'Napkin Math: Cost & Latency',
  summary: 'Turn tokens into dollars and seconds before launch, with real published prices and a calculator for your own numbers.',
  minutes: 10,
  level: 'Beginner',
  youWillLearn: [
    'The cost formula: input × price + output × price',
    'Why output tokens cost 5× more here',
    'How model choice changes the bill',
    'Case: caching a repeated prompt',
    'What makes a response slow',
  ],
  nodes: [
    { id: 'users', kind: 'user', label: 'users', sub: `${EX.perDay.toLocaleString('en-US')} requests / day`, x: 100, y: 244 },
    { id: 'app', kind: 'server', label: 'Your app', sub: 'builds the prompt', x: 240, y: 158 },
    { id: 'manual', kind: 'doc', label: 'manual', sub: `${EX.manual.toLocaleString('en-US')} tokens`, x: 380, y: 76 },
    { id: 'llm', kind: 'llm', label: 'Model', sub: 'priced per token', x: 520, y: 158 },
    { id: 'bill', kind: 'trace', label: 'Bill', sub: 'in + out', x: 660, y: 244 },
    { id: 'cache', kind: 'cache', label: 'Prompt cache', sub: 'repeated prefix', x: 380, y: 244, appearsAt: 5 },
  ],
  links: [
    { id: 'l1', from: 'users', to: 'app' },
    { id: 'm', from: 'manual', to: 'app', tone: 'grounded' },
    { id: 'l2', from: 'app', to: 'llm' },
    { id: 'l3', from: 'llm', to: 'bill' },
    { id: 'c', from: 'cache', to: 'llm', tone: 'grounded' },
  ],
  metrics: [
    { label: 'MODEL', values: [opus.name, opus.name, opus.name, 'yours', 'compare', opus.name, '—', '—'] },
    { label: 'INPUT / DAY', values: [money(dayIn), money(dayIn), money(dayIn), '—', '—', money(cachedIn), '—', '—'] },
    { label: 'OUTPUT / DAY', values: [money(dayOut), money(dayOut), money(dayOut), '—', '—', money(dayOut), '—', '—'] },
    { label: 'TOTAL / DAY', values: [money(day), money(day), money(day), '—', '—', money(dayCached), '—', '—'] },
  ],
  legend: [
    { label: 'request', swatch: 'request' },
    { label: 'repeated context', swatch: 'grounded' },
    { label: 'already explained', swatch: 'done' },
    { label: 'this step', swatch: 'focus' },
  ],
  steps: [
    {
      label: 'The bill', tag: 'PROBLEM', title: 'The demo was cheap. Launch wasn’t.',
      body: `In the demo, one person asked a few questions. In production, every request sends the whole ${EX.manual.toLocaleString('en-US')}-token product manual plus the question. At ${EX.perDay.toLocaleString('en-US')} requests a day on ${opus.name}, that is ${money(day)} a day — ${money(day * 30)} every 30 days.`,
      keyIdea: 'Cost scales with tokens × requests. A big prompt that is cheap once becomes expensive at volume.',
      focus: ['users', 'manual'], draw: ['l1', 'm'],
      widget: { type: 'table', head: ['', 'Tokens / day', 'Price / 1M', 'Cost / day'], rows: [
        ['Input', (inTok * EX.perDay).toLocaleString('en-US'), `$${opus.input}`, money(dayIn)],
        ['Output', (EX.out * EX.perDay).toLocaleString('en-US'), `$${opus.output}`, money(dayOut)],
        ['Total', '', '', money(day)],
      ], caption: ASSUME },
    },
    {
      label: 'Formula', tag: 'CONCEPT', title: 'The whole formula fits on a napkin',
      body: 'cost per request = input tokens × input price + output tokens × output price (prices are per 1,000,000 tokens). Multiply by requests per day. That is the entire model of an LLM bill, before discounts.',
      keyIdea: 'Measure real token counts from response.usage — don’t guess from word counts.',
      focus: ['app'], draw: ['l2'],
      widget: { type: 'code', title: 'napkin.ts', code: `const perRequest =\n  (inputTokens  / 1_000_000) * inputPrice +\n  (outputTokens / 1_000_000) * outputPrice;\n\nconst perDay = perRequest * requestsPerDay;` },
    },
    {
      label: 'Output', tag: 'CONCEPT', title: 'Output tokens cost 5× more',
      body: `For all three current Claude models, the output price is exactly 5× the input price. Generating a token is more work than reading one, and long answers add up fast.`,
      keyIdea: 'Ask for short answers when you can. Set max_tokens as a ceiling, not a target.',
      focus: ['llm', 'bill'], draw: ['l3'],
      widget: { type: 'table', head: ['Model', 'Input / 1M', 'Output / 1M', 'Output ÷ input'], rows: MODELS.map((m) => [m.name, `$${m.input}`, `$${m.output}`, `${(m.output / m.input).toFixed(0)}×`]), caption: PRICING_SOURCE },
    },
    {
      label: 'Your numbers', tag: 'TRY IT', title: 'Price your own feature',
      body: 'Change the model, the tokens per request and the traffic. Use real token counts from response.usage once you have them.',
      keyIdea: 'Do this before launch, and again after a week of real traffic.',
      focus: ['bill'],
      widget: { type: 'calc' },
      source: PRICING_SOURCE,
    },
    {
      label: 'Model choice', tag: 'CONCEPT', title: 'Same workload, three models',
      body: 'The worked example on each model. The cheapest model is not automatically the right one — it has to be good enough for the task. Measure quality first, then pick the cheapest model that passes.',
      keyIdea: 'Choose the model with evals, then the bill with napkin math — not the other way round.',
      focus: ['llm'],
      widget: { type: 'bars', rows: () => perModel.map(({ m, d }) => ({ label: m.name.replace('Claude ', ''), value: d, display: `${money(d)}/day`, tone: 'plain' })), caption: ASSUME },
    },
    {
      label: 'Cache it', tag: 'CASE', title: 'Case: stop paying full price for the manual',
      body: `The manual is identical in every request. With prompt caching, repeated prefix tokens are read from cache — $${opus.cacheRead} per 1M on ${opus.name} instead of $${opus.input}. Input cost drops from ${money(dayIn)} to about ${money(cachedIn)} a day.`,
      keyIdea: 'Put stable content (system prompt, documents) first and cache it. Cache writes cost a little more than normal input; reads cost far less.',
      focus: ['cache'], draw: ['c'],
      widget: { type: 'bars', rows: () => [
        { label: 'No cache', value: day, display: `${money(day)}/day`, tone: 'bad' },
        { label: 'Cached manual', value: dayCached, display: `${money(dayCached)}/day`, tone: 'good' },
      ], caption: 'Approximate steady state: ignores the occasional cache write. Batch processing (not real-time) is another 50% discount.' },
    },
    {
      label: 'Latency', tag: 'CONCEPT', title: 'Where the seconds go',
      body: 'A response takes roughly: time to first token (reading your prompt and starting) + output tokens ÷ generation speed. Both depend on the model, the prompt length and the load — so measure them on your own requests rather than trusting a number from someone else.',
      keyIdea: 'Shorter prompts start faster; shorter answers finish faster; streaming shows the first words while the rest is generated.',
      focus: ['llm'], packets: ['l2', 'l3'],
      widget: { type: 'code', title: 'latency.ts', code: 'totalSeconds ≈ timeToFirstToken + outputTokens / tokensPerSecond\n\n// Measure both on your real traffic:\n//  - timeToFirstToken: when the first streamed token arrives\n//  - tokensPerSecond:  output_tokens / generation time' },
    },
    {
      label: 'Recap', tag: 'RECAP', title: 'Tokens → dollars → decisions',
      focus: [],
      widget: { type: 'flow', chips: ['tokens in × price', '+ tokens out × price', '× requests/day', '− caching', '= your bill'] },
      recap: [
        ['What drives cost?', 'Tokens × requests', 'Both in and out'],
        ['Which tokens cost more?', 'Output (5× here)', 'Keep answers short'],
        ['How to pick a model?', 'Cheapest that passes evals', 'Quality first'],
        ['Biggest easy saving?', 'Cache repeated context', 'Stable content first'],
        ['What makes it slow?', 'First token + output length', 'Measure, then stream'],
      ],
      comingUp: 'What an AI engineer actually does: the whole system around the model.',
    },
  ],
};
