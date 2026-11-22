import type { Lesson } from '../../lesson/types';
import D from '../data/start-here.json';

const SRC = `LLM answers measured on ${D.provenance.model} (greedy decoding) · ${D.provenance.measuredAt} · ${D.provenance.script}`;
const [spamEmail, realEmail] = D.spam;
const RULE = /free|prize|click here|winner/i;
const runRule = (email: string) => (RULE.test(email) ? 'SPAM' : 'NOT SPAM');

export const whatIsAi: Lesson = {
  slug: 'what-is-ai-ml-and-genai',
  phase: 'SH',
  index: 0,
  title: 'What Is AI, ML & GenAI?',
  summary: 'One job — sorting a support inbox — done three ways: hand-written rules, machine learning, and a generative model.',
  minutes: 10,
  level: 'Beginner',
  youWillLearn: [
    'Rules: logic a person writes',
    'Machine learning: logic learned from labelled examples',
    'Deep learning: many layers of learned features',
    'Generative AI: models that produce new content',
    'Case: a real LLM mislabels a real email',
  ],
  nodes: [
    { id: 'inbox', kind: 'queue', label: 'Inbox', sub: 'support emails', x: 100, y: 244 },
    { id: 'rules', kind: 'server', label: 'Rules', sub: 'if / else', x: 240, y: 158 },
    { id: 'data', kind: 'db', label: 'labelled examples', x: 380, y: 76, appearsAt: 2 },
    { id: 'ml', kind: 'pipeline', label: 'ML model', sub: 'learned', x: 380, y: 244, appearsAt: 2 },
    { id: 'llm', kind: 'llm', label: 'LLM', sub: 'generates text', x: 520, y: 158, appearsAt: 4 },
    { id: 'label', kind: 'judge', label: 'Label', sub: 'spam / not', x: 660, y: 244 },
  ],
  links: [
    { id: 'in-rules', from: 'inbox', to: 'rules' },
    { id: 'rules-out', from: 'rules', to: 'label' },
    { id: 'train', from: 'data', to: 'ml', tone: 'grounded' },
    { id: 'in-ml', from: 'inbox', to: 'ml' },
    { id: 'ml-out', from: 'ml', to: 'label' },
    { id: 'in-llm', from: 'inbox', to: 'llm', curve: [300, 60] },
    { id: 'llm-out', from: 'llm', to: 'label' },
  ],
  metrics: [
    { label: 'APPROACH', values: ['—', 'Rules', 'Machine learning', 'Deep learning', 'Generative AI', 'Generative AI', 'You choose', 'All three'] },
    { label: 'WHO WRITES THE LOGIC', values: ['—', 'a person', 'learned from data', 'learned from data', 'learned from text', 'learned from text', '—', '—'] },
  ],
  legend: [
    { label: 'email flow', swatch: 'request' },
    { label: 'training data', swatch: 'grounded' },
    { label: 'already explained', swatch: 'done' },
    { label: 'this step', swatch: 'focus' },
  ],
  steps: [
    {
      label: 'The inbox', tag: 'PROBLEM', title: 'Sort the support inbox automatically',
      body: 'Your team gets support emails and spam in the same inbox. You want each email labelled SPAM or NOT SPAM before a person reads it. There are three very different ways to build that — and they are the three things people mean by "AI".',
      keyIdea: '"AI" is an umbrella. Rules, machine learning and generative AI solve problems in different ways, with different costs and failure modes.',
      focus: ['inbox'],
      widget: { type: 'transcript', title: 'TWO EMAILS IN THE INBOX', messages: [{ role: 'user', text: spamEmail.email }, { role: 'user', text: realEmail.email }] },
    },
    {
      label: 'Rules', tag: 'CONCEPT', title: 'Rules: a person writes the logic',
      body: 'The oldest approach: write the logic by hand. It is fast, cheap, predictable and easy to explain — until spammers change their wording, or a real customer writes "free". The rule below runs live in your browser.',
      keyIdea: 'Rules are perfect when you can state the logic exactly. They break when the world is fuzzier than your rules.',
      focus: ['rules'], draw: ['in-rules', 'rules-out'],
      widget: {
        type: 'code', title: 'rule.ts', code: 'const SPAM = /free|prize|click here|winner/i;\n\nfunction label(email: string) {\n  return SPAM.test(email) ? "SPAM" : "NOT SPAM";\n}',
        run: { label: 'RUNNING NOW IN YOUR BROWSER', inputs: [spamEmail.email, realEmail.email, 'Is the free shipping offer still valid?'], fn: runRule },
      },
    },
    {
      label: 'Machine learning', tag: 'CONCEPT', title: 'Machine learning: the computer learns the logic',
      body: 'Instead of writing rules, you collect examples that people have already labelled (this email: spam; that one: not) and let an algorithm find the patterns. New emails are labelled by what the model learned.',
      keyIdea: 'In machine learning the data writes the logic. The quality of the labels sets the ceiling on the quality of the model.',
      focus: ['data', 'ml'], draw: ['train', 'in-ml', 'ml-out'],
      widget: {
        type: 'compare', cards: [
          { title: 'Rules', tone: 'blue', lines: ['You write the logic', 'Exact and explainable', 'Breaks on cases you didn’t foresee'] },
          { title: 'Machine learning', tone: 'orange', lines: ['Logic learned from labelled examples', 'Handles fuzzy patterns', 'Needs good, representative labels'] },
        ],
      },
    },
    {
      label: 'Deep learning', tag: 'CONCEPT', title: 'Deep learning: many layers of learned features',
      body: 'Classic ML often relies on features a person designs (word counts, sender domain). Deep learning uses neural networks with many layers that learn their own features from raw input — text, pixels, audio. It needs more data and compute, and it powers modern vision, speech and language models.',
      keyIdea: 'Deep learning is a kind of machine learning; large language models are a kind of deep learning.',
      focus: ['ml'],
      widget: {
        type: 'compare', cards: [
          { title: 'Classic ML', tone: 'orange', lines: ['Features designed by people', 'Works well on small, tabular data', 'Phase 02 of this course'] },
          { title: 'Deep learning', tone: 'violet', lines: ['Features learned in layers', 'Text, images, audio', 'Phases 03–07 of this course'] },
        ],
      },
    },
    {
      label: 'Generative AI', tag: 'CONCEPT', title: 'Generative AI: a model that writes the answer',
      body: 'A large language model was trained on huge amounts of text to predict the next token. You don’t train it for spam at all — you describe the task in plain words and it writes back a label and a reason. Here are its real answers.',
      keyIdea: 'Generative models are general: one model can label, summarise, translate or draft replies — guided only by instructions.',
      focus: ['llm'], draw: ['in-llm', 'llm-out'],
      widget: { type: 'transcript', title: `LLM · ${D.provenance.model}`, messages: [{ role: 'user', text: spamEmail.email }, { role: 'assistant', text: spamEmail.llm, tone: 'good' }] },
      source: SRC,
    },
    {
      label: 'Mislabel', tag: 'CASE', title: 'Case: the LLM called a real customer “spam”',
      body: 'The same model labelled a genuine request for an invoice as SPAM, with a confident-sounding reason. Nothing in the answer tells you it is wrong. The rule from step 2 got this one right.',
      keyIdea: 'Generative AI is flexible, not infallible. You measure it on real examples before trusting it — that is evaluation (Phase 11).',
      focus: ['label'],
      widget: { type: 'transcript', title: `LLM · ${D.provenance.model}`, messages: [{ role: 'user', text: realEmail.email }, { role: 'assistant', text: realEmail.llm, tone: 'bad' }, { role: 'note', text: `The rule from step 2 says: ${runRule(realEmail.email)}` }] },
      source: SRC,
    },
    {
      label: 'Pick one', tag: 'TRY IT', title: 'Which approach fits?',
      body: 'For each job, pick the approach you would start with. There is a reason under each answer.',
      keyIdea: 'Start with the simplest thing that works. Reach for ML or GenAI when the logic is too fuzzy to write down.',
      focus: [],
      widget: {
        type: 'quiz', items: [
          { prompt: 'Block every email from one known spam address.', choices: [
            { text: 'Rules', correct: true, why: 'The logic is exact: one address. A one-line rule is cheaper and never wrong here.' },
            { text: 'Machine learning', correct: false, why: 'Learning a pattern you can already state exactly adds cost and error for no gain.' },
            { text: 'Generative AI', correct: false, why: 'An LLM call per email to check one address is slow, costly and can still be wrong.' },
          ] },
          { prompt: 'Predict which customers will cancel, from years of labelled account history.', choices: [
            { text: 'Rules', correct: false, why: 'The signals are fuzzy and interact; hand-written rules miss most of them.' },
            { text: 'Machine learning', correct: true, why: 'Lots of labelled, structured examples is exactly what classic ML is good at.' },
            { text: 'Generative AI', correct: false, why: 'Possible, but a trained classifier on your own labelled data is usually cheaper and easier to measure.' },
          ] },
          { prompt: 'Draft a polite, personal reply to each customer email.', choices: [
            { text: 'Rules', correct: false, why: 'Templates can’t adapt to what each customer actually wrote.' },
            { text: 'Machine learning', correct: false, why: 'A classifier picks labels; it doesn’t write new text.' },
            { text: 'Generative AI', correct: true, why: 'Writing new text from instructions and context is what generative models do — review before sending.' },
          ] },
        ],
      },
    },
    {
      label: 'Recap', tag: 'RECAP', title: 'Three ways to build "AI"',
      focus: [],
      widget: { type: 'flow', chips: ['Rules: you write logic', 'ML: data writes logic', 'Deep learning: layered features', 'GenAI: instructions → new text', 'Always: measure it'] },
      recap: [
        ['Who writes the logic?', 'Rules: a person', 'Exact, cheap, brittle'],
        ['Learned from what?', 'ML: labelled examples', 'Labels set the ceiling'],
        ['What is deep learning?', 'Many-layer neural nets', 'Learns its own features'],
        ['What is GenAI?', 'Models that write output', 'General, but can be wrong'],
        ['How do you trust it?', 'Evaluate on real examples', 'Before it reaches customers'],
      ],
      comingUp: 'How an LLM picks the next word: follow one question through a real model.',
    },
  ],
};
