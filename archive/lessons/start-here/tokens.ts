import type { Lesson } from '../../lesson/types';
import D from '../data/start-here.json';
import { CONTEXT_WINDOWS, MODELS, PRICING_SOURCE } from '../data/pricing';

const SRC = `Token counts measured with the ${D.provenance.model} tokenizer · ${D.provenance.measuredAt} · ${D.provenance.script}`;
const L = Object.fromEntries(D.languages.map((l) => [l.lang, l]));
const ratio = (L.Hindi.tokens / L.English.tokens).toFixed(1);
const WIN = D.chatTemplate.contextWindow;
const number = D.samples.find((s) => s.name === 'A number')!;

export const tokensLesson: Lesson = {
  slug: 'tokens-and-context-windows',
  phase: 'SH',
  index: 2,
  title: 'Tokens & Context Windows',
  summary: 'Why the same question takes 4.6× more tokens in Hindi — and what happens when a conversation outgrows the window.',
  minutes: 11,
  level: 'Beginner',
  youWillLearn: [
    'How text is cut into tokens (real tokenizer output)',
    'Why languages, numbers and code tokenize differently',
    'What a context window is, with real sizes',
    'What happens when the conversation is too long',
    'Why tokens are the unit of cost',
  ],
  nodes: [
    { id: 'you', kind: 'browser', label: 'you', x: 100, y: 244 },
    { id: 'tok', kind: 'tokens', label: 'Tokenizer', sub: 'text → IDs', x: 240, y: 158 },
    { id: 'win', kind: 'memory', label: 'context window', x: 380, y: 244 },
    { id: 'llm', kind: 'llm', label: 'Model', sub: 'reads the window', x: 520, y: 158 },
    { id: 'bill', kind: 'trace', label: 'Usage', sub: 'billed per token', x: 660, y: 244 },
    { id: 'old', kind: 'doc', label: 'oldest messages', x: 240, y: 76, appearsAt: 5 },
  ],
  links: [
    { id: 'l1', from: 'you', to: 'tok' },
    { id: 'l2', from: 'tok', to: 'win' },
    { id: 'l3', from: 'win', to: 'llm' },
    { id: 'l4', from: 'llm', to: 'bill' },
    { id: 'drop', from: 'win', to: 'old', tone: 'grounded' },
  ],
  metrics: [
    { label: 'ENGLISH', values: [`${L.English.tokens} tok`, `${L.English.tokens} tok`, `${L.English.tokens} tok`, `${L.English.tokens} tok`, `${L.English.tokens} tok`, `${L.English.tokens} tok`, `${L.English.tokens} tok`, `${L.English.tokens} tok`] },
    { label: 'HINDI', values: [`${L.Hindi.tokens} tok`, `${L.Hindi.tokens} tok`, `${L.Hindi.tokens} tok`, `${L.Hindi.tokens} tok`, `${L.Hindi.tokens} tok`, `${L.Hindi.tokens} tok`, `${L.Hindi.tokens} tok`, `${L.Hindi.tokens} tok`] },
    { label: 'VOCABULARY', values: ['—', D.chatTemplate.vocabSize.toLocaleString('en-US'), D.chatTemplate.vocabSize.toLocaleString('en-US'), D.chatTemplate.vocabSize.toLocaleString('en-US'), D.chatTemplate.vocabSize.toLocaleString('en-US'), D.chatTemplate.vocabSize.toLocaleString('en-US'), D.chatTemplate.vocabSize.toLocaleString('en-US'), D.chatTemplate.vocabSize.toLocaleString('en-US')] },
    { label: 'WINDOW', values: ['—', '—', '—', '—', WIN.toLocaleString('en-US'), WIN.toLocaleString('en-US'), WIN.toLocaleString('en-US'), WIN.toLocaleString('en-US')] },
  ],
  legend: [
    { label: 'text flow', swatch: 'request' },
    { label: 'dropped / compacted', swatch: 'grounded' },
    { label: 'already explained', swatch: 'done' },
    { label: 'this step', swatch: 'focus' },
  ],
  steps: [
    {
      label: 'Same question', tag: 'PROBLEM', title: `The same question costs ${ratio}× more in Hindi`,
      body: `Your support bot launches in India. The English question is ${L.English.tokens} tokens; the same question in Hindi is ${L.Hindi.tokens} tokens — with this tokenizer. You pay per token, and the window fills per token, so every Hindi conversation is ${ratio}× as expensive and fills up ${ratio}× as fast.`,
      keyIdea: 'Models don’t count words or characters. They count tokens — and different text costs different numbers of tokens.',
      focus: ['you'],
      widget: { type: 'bars', rows: () => D.languages.map((l) => ({ label: l.lang, value: l.tokens, display: `${l.tokens} tokens`, tone: l.lang === 'Hindi' ? 'bad' : l.lang === 'English' ? 'good' : 'plain' })), caption: D.languages.map((l) => `${l.lang}: “${l.text}”`).join('  ·  ') },
      source: SRC,
    },
    {
      label: 'Tokens', tag: 'CONCEPT', title: 'A tokenizer cuts text into known pieces',
      body: `The tokenizer has a fixed vocabulary of ${D.chatTemplate.vocabSize.toLocaleString('en-US')} pieces, learned from training text. Common English words are a single piece. Text that was rarer in training gets cut into smaller pieces — down to raw bytes.`,
      keyIdea: 'A token is a frequent chunk of text: often a word with its leading space, sometimes part of a word, sometimes a single byte.',
      focus: ['tok'], draw: ['l1'],
      callout: { text: `${L.English.tokens} tokens`, at: 'tok', tone: 'violet' },
      widget: { type: 'tokens', tokens: D.tokens },
      source: SRC,
    },
    {
      label: 'Explore', tag: 'TRY IT', title: 'See how different text tokenizes',
      body: 'Pick a sample. Watch the Hindi letters break into "·byte·" pieces (parts of one UTF-8 character), numbers split into single digits, and code keep its indentation as tokens.',
      keyIdea: `This tokenizer splits numbers digit by digit — “${number.text}” is ${number.tokens.length} tokens. That is one reason models can stumble on arithmetic.`,
      focus: ['tok'],
      widget: { type: 'samples', samples: D.samples },
      source: SRC,
    },
    {
      label: 'Vocabulary', tag: 'CONCEPT', title: 'Why some languages need more tokens',
      body: 'The vocabulary is built from the training text. Languages and scripts that appear more often get longer, whole-word tokens. Others are covered by smaller pieces, so the same meaning needs more tokens.',
      keyIdea: 'Token counts depend on the tokenizer. Measure your real traffic with your model’s own tokenizer (for Claude: the count_tokens endpoint).',
      focus: ['tok'],
      widget: { type: 'table', head: ['Language', 'Characters', 'Tokens', 'Tokens per character'], rows: D.languages.map((l) => [l.lang, String(l.chars), String(l.tokens), (l.tokens / l.chars).toFixed(2)]) },
      source: SRC,
    },
    {
      label: 'Window', tag: 'CONCEPT', title: 'The context window: everything the model can see',
      body: `A model reads one sequence of tokens at a time — system prompt, conversation history, documents and its own answer so far. That sequence has a maximum length: the context window. This open model’s window is ${WIN.toLocaleString('en-US')} tokens; current Claude models list 1M.`,
      keyIdea: 'If it isn’t in the window, the model can’t use it. The window is the model’s whole working memory for one request.',
      focus: ['win'], draw: ['l2', 'l3'],
      callout: { text: `${WIN.toLocaleString('en-US')} tokens`, at: 'win', tone: 'violet' },
      widget: { type: 'table', head: ['Model', 'Context window'], rows: [[D.provenance.model, `${WIN.toLocaleString('en-US')} tokens (model config)`], ...CONTEXT_WINDOWS.map(([a, b]) => [a, b])] },
      source: `${SRC} · Claude windows: ${PRICING_SOURCE}`,
    },
    {
      label: 'Overflow', tag: 'CASE', title: 'Case: the bot forgot how the chat started',
      body: 'Each turn, your app resends the whole conversation. Long chats eventually exceed the window, and something has to give: drop the oldest messages, summarise them, or move facts into a store you can search. Claude’s API offers server-side compaction (beta), which summarises earlier context when it approaches a trigger — 150K tokens by default.',
      keyIdea: 'Plan for the window from day one: what to keep word-for-word, what to summarise, what to look up when needed.',
      focus: ['old'], draw: ['drop'],
      widget: { type: 'compare', cards: [
        { title: 'Drop oldest', tone: 'orange', lines: ['Simple', 'Loses early facts (like the user’s name)'] },
        { title: 'Summarise', tone: 'green', lines: ['Keeps the gist', 'Costs an extra call; details can blur'] },
        { title: 'Store & retrieve', tone: 'violet', lines: ['Keeps everything searchable', 'Needs retrieval (RAG, Phase 11)'] },
      ] },
    },
    {
      label: 'Cost', tag: 'CONCEPT', title: 'Tokens are also the unit of price',
      body: 'API providers charge per million input tokens and per million output tokens — output costs more. So tokens decide both what fits and what you pay. Prices below are Claude’s published rates; the napkin-math lesson turns them into a monthly bill.',
      keyIdea: 'Every extra token in the prompt is paid for on every request. Shorter prompts are cheaper, faster prompts.',
      focus: ['bill'], draw: ['l4'],
      widget: { type: 'table', head: ['Model', 'Input / 1M tokens', 'Output / 1M tokens'], rows: MODELS.map((m) => [m.name, `$${m.input}`, `$${m.output}`]), caption: PRICING_SOURCE },
    },
    {
      label: 'Recap', tag: 'RECAP', title: 'Tokens decide what fits and what it costs',
      focus: [],
      widget: { type: 'flow', chips: ['text', '→ tokens (tokenizer-specific)', '→ context window', '→ model', '→ billed per token'] },
      recap: [
        ['What is a token?', 'A frequent text chunk', 'Word, sub-word or byte'],
        ['Why does Hindi cost more?', `${L.Hindi.tokens} vs ${L.English.tokens} tokens here`, 'Fewer whole-word tokens'],
        ['What is the window?', 'Max tokens per request', 'The model’s working memory'],
        ['When it overflows?', 'Drop, summarise or retrieve', 'Plan it up front'],
        ['How is it billed?', 'Per 1M in / out tokens', 'Output costs more'],
      ],
      comingUp: 'Your first API call: what a request and a response actually contain.',
    },
  ],
};
