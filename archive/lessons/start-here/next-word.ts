import type { Bar, Lesson, LessonCtx } from '../../lesson/types';
import D from '../data/start-here.json';

const SRC = `Measured on ${D.provenance.model} (${D.provenance.dtype}, ${D.provenance.device}) · ${D.provenance.measuredAt} · ${D.provenance.script}`;
const TEMPS = ['0', '0.7', '1.5'] as const;
type Cand = { answer: string; p: number };
const cands = (set: 'withoutPolicy' | 'withPolicy', t: number): Cand[] => (D.candidates[set] as Record<string, Cand[]>)[TEMPS[t]];
const pOf = (set: 'withoutPolicy' | 'withPolicy', t: number, answer: string) => cands(set, t).find((c) => c.answer === answer)!.p;
const fmt = (p: number) => (p >= 0.995 && p < 1 ? p.toFixed(4) : p.toFixed(3));
const bars = (set: 'withoutPolicy' | 'withPolicy', t: number): Bar[] =>
  cands(set, t).map((c) => ({ label: c.answer, value: c.p, display: fmt(c.p), tone: c.answer === '14 days' ? 'good' : c.answer === '30 days' ? 'bad' : 'plain' }));

const tokenWeights = D.attention.tokens;
const top3 = [...tokenWeights].sort((a, b) => b.weight - a.weight).slice(0, 3).map((t) => `"${t.text.trim()}"`).join(', ');
const cos = D.embeddings.cosine;
const Q = String(D.tokens.length);

export const nextWord: Lesson = {
  slug: 'how-an-llm-picks-the-next-word',
  phase: 'SH',
  index: 1,
  title: 'How an LLM Picks the Next Word',
  summary: 'Follow one question through a real model — and find out where the confident wrong answer came from.',
  minutes: 12,
  level: 'Beginner',
  youWillLearn: [
    'What a token is, with real token IDs',
    'What an embedding looks like, with real numbers',
    'Where attention goes, measured',
    'How temperature reshapes the odds',
    'Case: grounding turns a guess into the right answer',
  ],
  nodes: [
    { id: 'you', kind: 'browser', label: 'you', x: 100, y: 244 },
    { id: 'tok', kind: 'tokens', label: 'Tokenizer', sub: 'text → IDs', x: 240, y: 158 },
    { id: 'emb', kind: 'vector', label: 'Embeddings', x: 380, y: 244 },
    { id: 'llm', kind: 'llm', label: 'Transformer', sub: 'attention', x: 520, y: 158 },
    { id: 'smp', kind: 'dice', label: 'Sampler', sub: 'temperature', x: 660, y: 244 },
    { id: 'doc', kind: 'doc', label: 'policy.md', x: 380, y: 76, appearsAt: 6 },
  ],
  links: [
    { id: 'l1', from: 'you', to: 'tok' },
    { id: 'l2', from: 'tok', to: 'emb' },
    { id: 'l3', from: 'emb', to: 'llm' },
    { id: 'l4', from: 'llm', to: 'smp' },
    { id: 'ctx', from: 'doc', to: 'llm', tone: 'grounded' },
    { id: 'ans', from: 'smp', to: 'you', tone: 'grounded', curve: [380, 372] },
  ],
  metrics: [
    { label: 'QUESTION TOKENS', values: ['—', Q, Q, Q, Q, Q, Q, Q] },
    { label: 'PROMPT TOKENS', values: ['—', '—', '—', '—', String(D.nextToken.promptTokens), String(D.nextToken.promptTokens), String(D.nextToken.groundedPromptTokens), String(D.nextToken.groundedPromptTokens)] },
    { label: 'P("30 days")', values: ['—', '—', '—', '—', fmt(pOf('withoutPolicy', 1, '30 days')), (c: LessonCtx) => fmt(pOf('withoutPolicy', c.temp, '30 days')), fmt(pOf('withPolicy', 1, '30 days')), fmt(pOf('withPolicy', 1, '30 days'))] },
    { label: 'TEMPERATURE', values: ['0.7', '0.7', '0.7', '0.7', '0.7', (c: LessonCtx) => TEMPS[c.temp], '0.7', '0.7'] },
    { label: 'ANSWER', values: ['30 days ✗', '…', '…', '…', '…', '…', '14 days ✓', '14 days ✓'] },
  ],
  legend: [
    { label: 'request', swatch: 'request' },
    { label: 'grounded answer', swatch: 'grounded' },
    { label: 'already explained', swatch: 'done' },
    { label: 'this step', swatch: 'focus' },
  ],
  steps: [
    {
      label: 'Wrong answer', tag: 'PROBLEM', title: 'The support bot gave a confident wrong answer',
      body: 'A customer asks how long they have to return shoes. The bot answers "30 days". This store’s policy is 14 days — and nobody told the model that. This is a real answer from a real open model. Let’s follow the question through it.',
      keyIdea: 'An LLM doesn’t look anything up. It predicts the next token, one at a time, from patterns it learned in training.',
      focus: ['you'],
      callout: { text: '“How long…?”', at: 'you', tone: 'sheet' },
      widget: { type: 'transcript', title: `SUPPORT BOT · ${D.provenance.model}`, messages: [{ role: 'user', text: D.nextToken.prompt.user }, { role: 'assistant', text: D.answers.withoutPolicy, tone: 'bad' }], aside: { title: 'policy.md — this store’s rule', text: D.nextToken.policy, highlight: '14 days' } },
      source: SRC,
    },
    {
      label: 'Tokenize', tag: 'CONCEPT', title: 'Text becomes tokens',
      body: `The model can’t read letters. Its tokenizer cuts the question into ${Q} pieces — words, often with their leading space — and swaps each for an integer ID from a vocabulary of ${D.chatTemplate.vocabSize.toLocaleString('en-US')} tokens.`,
      keyIdea: 'You pay per token, and the context window is counted in tokens. Every model family has its own tokenizer, so counts differ between models.',
      focus: ['tok'], draw: ['l1'],
      callout: { text: `${Q} tokens`, at: 'tok', tone: 'violet' },
      widget: { type: 'tokens', tokens: D.tokens },
      source: SRC,
    },
    {
      label: 'Embed', tag: 'CONCEPT', title: 'Each token becomes a vector',
      body: `Each token ID picks a row of ${D.embeddings.dims} numbers from the model’s embedding table. Below: the first 12 of those numbers for three words, and the cosine similarity between them (1 = same direction, 0 = unrelated).`,
      keyIdea: `In this model “return” is closer to “refund” (${cos[0].cos.toFixed(3)}) than to “shoes” (${cos[1].cos.toFixed(3)}). Input embeddings carry only a first hint of meaning — the layers above refine it.`,
      focus: ['emb'], draw: ['l2'],
      callout: { text: `${D.embeddings.dims} numbers per token`, at: 'emb', tone: 'violet' },
      widget: { type: 'vectors', words: D.embeddings.words.map((w) => ({ word: w.word, values: w.first12 })), pairs: cos },
      source: SRC,
    },
    {
      label: 'Attention', tag: 'CONCEPT', title: 'Tokens look at each other',
      body: `Inside the transformer, every position looks back at earlier tokens and decides how much each one matters. In the last layer, the position that starts the answer puts most of its attention on ${top3}.`,
      keyIdea: 'Attention is how context flows into a prediction. If the policy isn’t in the context, there is nothing true to attend to.',
      focus: ['llm'], draw: ['l3'],
      callout: { text: 'last layer · mean of heads', at: 'llm', tone: 'violet' },
      widget: { type: 'attention', tokens: tokenWeights, caption: 'Share of attention from the answer position to each question token (last layer, averaged over heads).' },
      source: SRC,
    },
    {
      label: 'Odds', tag: 'CONCEPT', title: 'Every possible answer gets a probability',
      body: `The model turns its final scores into probabilities over all ${D.chatTemplate.vocabSize.toLocaleString('en-US')} tokens. We measured how likely each full answer is after “${D.nextToken.prompt.assistantPrefix.trim()} …”. "30 days" — the most common return window on the web — dominates.`,
      keyIdea: 'The model outputs a probability distribution, not a fact. "Most likely" is not the same as "true for your store".',
      focus: ['smp'], draw: ['l4'],
      callout: { text: `"30 days" ${fmt(pOf('withoutPolicy', 1, '30 days'))}`, at: 'smp', tone: 'orange' },
      widget: { type: 'bars', rows: () => bars('withoutPolicy', 1), max: 1, caption: 'P(answer) = product of each of its tokens’ probabilities, at temperature 0.7.' },
      source: SRC,
    },
    {
      label: 'Temperature', tag: 'TRY IT', title: 'Turn the temperature dial',
      body: 'Temperature divides the scores before they become probabilities. At 0 the model always takes its top choice. At 1.5 the distribution flattens and less likely answers get picked more often — some wrong, some (by luck) right.',
      keyIdea: 'Temperature changes how you sample, not what the model knows. Low for facts and code, higher for brainstorming.',
      focus: ['smp'], packets: ['l4'],
      callout: (c) => ({ text: `temperature ${TEMPS[c.temp]}`, at: 'smp', tone: 'orange' }),
      widget: { type: 'bars', rows: (c) => bars('withoutPolicy', c.temp), max: 1, dial: true },
      source: SRC,
    },
    {
      label: 'Add context', tag: 'CASE', title: 'Case: put the policy in the prompt',
      body: `Same model, same question — but now the store policy is in the system prompt. "14 days" goes from ${fmt(pOf('withoutPolicy', 1, '14 days'))} to ${fmt(pOf('withPolicy', 1, '14 days'))}, and the model’s actual answer becomes: “${D.answers.withPolicy}”`,
      keyIdea: 'Hallucination is a plausible guess with no grounding. Putting your facts into the context is the core idea behind RAG.',
      focus: ['doc'], draw: ['ctx'],
      widget: { type: 'bars', rows: () => bars('withPolicy', 1), max: 1, caption: 'Same four answers, temperature 0.7, with the policy in context.' },
      source: SRC,
    },
    {
      label: 'Recap', tag: 'RECAP', title: 'The whole path, end to end',
      focus: [], draw: ['ans'],
      callout: { text: '“…within 14 days.”', at: 'you', tone: 'green' },
      widget: { type: 'flow', chips: ['question', `→ ${Q} tokens`, `→ ${D.embeddings.dims}-number vectors`, '→ attention (+ policy.md)', '→ odds', '→ "14 days" ✓'] },
      recap: [
        ['How does text get in?', 'Tokenizer → IDs', 'Models read numbers, not letters'],
        ['Where is meaning?', 'Embeddings', 'Each token becomes a vector'],
        ['What uses context?', 'Attention', 'Weighs earlier tokens'],
        ['How is an answer chosen?', 'Sample the odds', 'Temperature sets the risk'],
        ['How to stop the guess?', 'Put policy.md in context', 'Ground it — that’s RAG'],
      ],
      comingUp: 'Tokens & context windows: why the same question takes 4.6× more tokens in Hindi, and how much text fits.',
    },
  ],
};
