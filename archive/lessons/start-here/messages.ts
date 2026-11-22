import type { Lesson } from '../../lesson/types';
import D from '../data/start-here.json';

const SRC = `Answers measured on ${D.provenance.model} (greedy decoding) · ${D.provenance.measuredAt} · ${D.provenance.script}`;
const REF = 'Anthropic Claude API reference (Messages API)';
const M = D.memory;
const Q = 'What is a token in a language model?';

export const messagesLesson: Lesson = {
  slug: 'messages-roles-and-system-prompts',
  phase: 'SH',
  index: 4,
  title: 'Messages, Roles & System Prompts',
  summary: 'The model has no memory between calls. Roles, history and the system prompt are how you give it context.',
  minutes: 11,
  level: 'Beginner',
  youWillLearn: [
    'Why the model forgets between requests',
    'The user and assistant roles',
    'What a system prompt is for',
    'How roles become one token stream (chat template)',
    'Case: test that your instructions are followed',
  ],
  nodes: [
    { id: 'you', kind: 'browser', label: 'you', x: 100, y: 244 },
    { id: 'msgs', kind: 'queue', label: 'messages', sub: 'user / assistant', x: 240, y: 158 },
    { id: 'tmpl', kind: 'tokens', label: 'Chat template', sub: 'roles → tokens', x: 380, y: 244 },
    { id: 'llm', kind: 'llm', label: 'Model', sub: 'no memory', x: 520, y: 158 },
    { id: 'sys', kind: 'doc', label: 'system prompt', x: 380, y: 76, appearsAt: 2 },
    { id: 'reply', kind: 'judge', label: 'Reply', sub: 'check it', x: 660, y: 244 },
  ],
  links: [
    { id: 'l1', from: 'you', to: 'msgs' },
    { id: 'l2', from: 'msgs', to: 'tmpl' },
    { id: 'l3', from: 'tmpl', to: 'llm' },
    { id: 'sys', from: 'sys', to: 'tmpl', tone: 'grounded' },
    { id: 'l4', from: 'llm', to: 'reply', tone: 'grounded' },
  ],
  metrics: [
    { label: 'MEMORY BETWEEN CALLS', values: ['none', 'none', 'none', 'none', 'none', 'you resend it', 'none', 'you resend it'] },
    { label: 'ROLES', values: ['user', 'user · assistant', 'system · user · assistant', 'system · user · assistant', 'system · user · assistant', 'user · assistant', 'system · user', 'all three'] },
  ],
  legend: [
    { label: 'request', swatch: 'request' },
    { label: 'instructions', swatch: 'grounded' },
    { label: 'already explained', swatch: 'done' },
    { label: 'this step', swatch: 'focus' },
  ],
  steps: [
    {
      label: 'Forgot me', tag: 'PROBLEM', title: 'The bot forgot my name',
      body: `A user says “${M.firstTurn.user}”. In the next request they ask “${M.secondTurnUser}” — and the model has no idea. These are its real replies: the second request was sent without the first exchange.`,
      keyIdea: 'Each API call is independent. The model only knows what is inside the request you send right now.',
      focus: ['you'],
      widget: { type: 'transcript', title: 'TWO SEPARATE REQUESTS', messages: [
        { role: 'note', text: 'Request 1' }, { role: 'user', text: M.firstTurn.user }, { role: 'assistant', text: M.firstTurn.assistant },
        { role: 'note', text: 'Request 2 (history not sent)' }, { role: 'user', text: M.secondTurnUser }, { role: 'assistant', text: M.withoutHistory, tone: 'bad' },
      ] },
      source: SRC,
    },
    {
      label: 'Roles', tag: 'CONCEPT', title: 'A conversation is a list of messages',
      body: 'Each message has a role. "user" is what people send; "assistant" is what the model said before. To continue a conversation you send the whole list again — the API keeps nothing between calls. The first message must be from the user.',
      keyIdea: 'Your app owns the conversation history. Store it, and send it with every request.',
      focus: ['msgs'], draw: ['l1', 'l2'],
      widget: { type: 'code', title: 'messages', code: `[\n  { role: "user",      content: "${M.firstTurn.user}" },\n  { role: "assistant", content: "${M.firstTurn.assistant}" },\n  { role: "user",      content: "${M.secondTurnUser}" }\n]` },
      source: REF,
    },
    {
      label: 'System', tag: 'CONCEPT', title: 'The system prompt sets the rules',
      body: 'The system prompt is set by you, the developer — not the end user. It describes the role, the rules and the format for the whole conversation, and it is sent with every request.',
      keyIdea: 'Put stable instructions in the system prompt; put the user’s words in user messages. Keep the two apart.',
      focus: ['sys'], draw: ['sys'],
      widget: { type: 'transcript', title: `${D.provenance.model}`, messages: [{ role: 'system', text: 'Answer in one short sentence.' }, { role: 'user', text: Q }, { role: 'assistant', text: D.answers.systemOneSentence, tone: 'good' }] },
      source: SRC,
    },
    {
      label: 'Template', tag: 'CONCEPT', title: 'Roles become one stream of tokens',
      body: 'The model still only sees tokens. A chat template wraps each message with special marker tokens, then everything is joined into one sequence. Here is the real template this model uses.',
      keyIdea: 'Roles are a formatting convention the model was trained on — not a security boundary. Treat user input as untrusted.',
      focus: ['tmpl'], draw: ['l3'],
      widget: { type: 'code', title: `chat template · ${D.provenance.model}`, code: D.chatTemplate.rendered, note: 'The assistant turn is left open — the model continues from there.' },
      source: SRC,
    },
    {
      label: 'Try prompts', tag: 'TRY IT', title: 'Do system prompts always work?',
      body: `Same question, four system prompts, real answers from a small ${D.provenance.model.split('/')[1]} model. Watch which instructions it follows — and which it ignores.`,
      keyIdea: 'Never assume an instruction is followed. Small models often ignore them; even large models need testing on real examples.',
      focus: ['llm', 'reply'], draw: ['l4'],
      widget: { type: 'picker', title: `SYSTEM PROMPT → REAL ANSWER TO “${Q}”`, options: [
        { label: 'One sentence', detail: 'system: "Answer in one short sentence."', result: D.answers.systemOneSentence, tone: 'good' },
        { label: 'French', detail: 'system: "Always answer in French, in one sentence."', result: D.answers.systemFrench, tone: 'bad' },
        { label: 'Pirate', detail: 'system: "You are a pirate. Always answer like a pirate."', result: D.answers.systemPirate, tone: 'bad' },
        { label: 'Plain', detail: 'system: "You are a helpful assistant."', result: D.answers.systemNone },
      ] },
      source: SRC,
    },
    {
      label: 'Send history', tag: 'CASE', title: 'Case: send the history and it remembers',
      body: 'Same model, same question — this time the request includes the earlier exchange. Nothing about the model changed; only what you sent.',
      keyIdea: '“Memory” in a chat app is just your app resending history (or a summary of it) on every call.',
      focus: ['msgs'], packets: ['l2'],
      widget: { type: 'transcript', title: 'ONE REQUEST WITH HISTORY', messages: [
        { role: 'user', text: M.firstTurn.user }, { role: 'assistant', text: M.firstTurn.assistant }, { role: 'user', text: M.secondTurnUser }, { role: 'assistant', text: M.withHistory, tone: 'good' },
      ] },
      source: SRC,
    },
    {
      label: 'Rules', tag: 'CONCEPT', title: 'A few API rules worth knowing',
      body: 'These come from the Claude Messages API. Other providers follow similar conventions.',
      keyIdea: 'The API is stateless by design: you control exactly what the model sees on every call.',
      focus: ['tmpl'],
      widget: { type: 'table', head: ['Rule', 'Why it matters'], rows: [
        ['First message must be from the user', 'Requests that start with assistant are rejected'],
        ['Consecutive same-role messages are combined', 'Two user messages in a row become one turn'],
        ['system is a top-level field', 'Not a message in the list'],
        ['No assistant prefill on current models', 'Use instructions or structured outputs for format'],
      ] },
      source: REF,
    },
    {
      label: 'Recap', tag: 'RECAP', title: 'You control what the model sees',
      focus: [],
      widget: { type: 'flow', chips: ['system prompt', '+ message history', '+ new user message', '→ chat template', '→ one token stream', '→ reply'] },
      recap: [
        ['Does the model remember?', 'No — every call is fresh', 'Your app resends history'],
        ['What are roles?', 'user / assistant', 'Who said each message'],
        ['What is the system prompt?', 'Your rules for the chat', 'Set by the developer'],
        ['What does the model see?', 'One token stream', 'Built by a chat template'],
        ['Are instructions obeyed?', 'Not always', 'Test on real examples'],
      ],
      comingUp: 'Napkin math: turn tokens into dollars and seconds before you launch.',
    },
  ],
};
