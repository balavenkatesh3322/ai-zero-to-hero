import type { Lesson } from '../../lesson/types';

const REF = 'Anthropic Claude API reference (Messages API, TypeScript SDK)';

const BAD = `// app.js — runs in the visitor's browser  ✗ DON'T
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "x-api-key": "sk-ant-…your key…" },
  body: JSON.stringify({ /* … */ }),
});`;

const GOOD = `// server.ts — runs on YOUR server
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the server's environment

const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  messages: [{ role: "user", content: "How long do I have to return shoes?" }],
});

for (const block of response.content) {
  if (block.type === "text") console.log(block.text);
}
console.log(response.usage.input_tokens, response.usage.output_tokens);`;

export const firstApiCall: Lesson = {
  slug: 'your-first-api-call',
  phase: 'SH',
  index: 3,
  title: 'Your First API Call',
  summary: 'Browser → your server → the model API → back. What goes in a request, what comes back, and where the key must live.',
  minutes: 12,
  level: 'Beginner',
  youWillLearn: [
    'Why the API key never goes in the browser',
    'The three fields every request needs',
    'What a response contains (content, stop_reason, usage)',
    'Which errors to retry',
    'How to read token usage for cost',
  ],
  nodes: [
    { id: 'you', kind: 'browser', label: 'your app', x: 100, y: 244 },
    { id: 'srv', kind: 'server', label: 'Your server', sub: 'holds the key', x: 240, y: 158 },
    { id: 'api', kind: 'gateway', label: 'Claude API', sub: '/v1/messages', x: 380, y: 244 },
    { id: 'llm', kind: 'llm', label: 'Claude', sub: 'claude-opus-5-5', x: 520, y: 158 },
    { id: 'use', kind: 'trace', label: 'usage', sub: 'tokens in / out', x: 660, y: 244 },
    { id: 'anyone', kind: 'user', label: 'anyone', sub: 'anyone who opens dev tools', x: 520, y: 76, appearsAt: 0, hideAfter: 0 },
  ],
  links: [
    { id: 'leak', from: 'you', to: 'anyone', tone: 'request', curve: [260, 40] },
    { id: 'l1', from: 'you', to: 'srv' },
    { id: 'l2', from: 'srv', to: 'api' },
    { id: 'l3', from: 'api', to: 'llm' },
    { id: 'l4', from: 'llm', to: 'use', tone: 'grounded' },
    { id: 'back', from: 'api', to: 'you', tone: 'grounded', curve: [230, 340] },
  ],
  metrics: [
    { label: 'KEY LIVES IN', values: ['browser ✗', 'server ✓', 'server ✓', 'server ✓', 'server ✓', 'server ✓', 'you choose', 'server ✓'] },
    { label: 'ENDPOINT', values: ['POST /v1/messages', 'POST /v1/messages', 'POST /v1/messages', 'POST /v1/messages', 'POST /v1/messages', 'POST /v1/messages', 'POST /v1/messages', 'POST /v1/messages'] },
  ],
  legend: [
    { label: 'request', swatch: 'request' },
    { label: 'response', swatch: 'grounded' },
    { label: 'already explained', swatch: 'done' },
    { label: 'this step', swatch: 'focus' },
  ],
  steps: [
    {
      label: 'Key leak', tag: 'PROBLEM', title: 'The API key shipped inside the website',
      body: 'A demo calls the model API straight from browser JavaScript, with the API key in the code. Everything sent to a browser can be read by whoever opens the page — so anyone can copy the key and run requests billed to you.',
      keyIdea: 'Anything in front-end code is public. API keys belong on a server you control.',
      focus: ['anyone'], draw: ['leak'],
      widget: { type: 'code', title: 'app.js (anti-pattern)', code: BAD, bad: true, note: 'Shown only as the mistake to avoid. Rotate a key immediately if it was ever exposed.' },
    },
    {
      label: 'Server', tag: 'CONCEPT', title: 'Your server makes the call',
      body: 'The browser talks to your server; your server talks to the model API. The key stays in an environment variable on the server, and you can add login, rate limits and logging in between.',
      keyIdea: 'The official SDK reads ANTHROPIC_API_KEY from the environment — no key in code at all.',
      focus: ['srv'], draw: ['l1', 'l2'],
      widget: { type: 'code', title: 'server.ts', code: GOOD },
      source: REF,
    },
    {
      label: 'Request', tag: 'CONCEPT', title: 'A request has three required fields',
      body: 'Every call to POST /v1/messages names the model, caps how many tokens the reply may use, and passes the conversation as a list of messages. The first message must come from the user.',
      keyIdea: 'max_tokens is a hard cap on the reply. Too low and the answer is cut off mid-sentence (stop_reason "max_tokens").',
      focus: ['api'], draw: ['l3'],
      widget: { type: 'table', head: ['Field', 'What it is'], rows: [
        ['model', 'Which model answers, e.g. "claude-opus-5-5"'],
        ['max_tokens', 'Upper limit on tokens in the reply'],
        ['messages', 'The conversation: [{ role: "user", content: "…" }, …]'],
        ['system (optional)', 'Instructions that apply to the whole conversation'],
      ] },
      source: REF,
    },
    {
      label: 'Response', tag: 'CONCEPT', title: 'What comes back',
      body: 'The response is a message from the assistant. Its content is a list of blocks — read the text blocks. It also tells you why the model stopped and how many tokens were used.',
      keyIdea: 'Always check stop_reason before using the text, and log usage — it is your bill.',
      focus: ['llm', 'use'], draw: ['l4', 'back'],
      widget: { type: 'table', head: ['Field', 'What it means'], rows: [
        ['content', 'List of blocks; type "text" holds the answer'],
        ['stop_reason', 'Why it stopped (see next step)'],
        ['usage.input_tokens', 'Tokens you sent (billed at the input rate)'],
        ['usage.output_tokens', 'Tokens generated (billed at the output rate)'],
        ['usage.cache_read_input_tokens', 'Prompt tokens served from cache (cheaper)'],
      ] },
      source: REF,
    },
    {
      label: 'Stop reasons', tag: 'CONCEPT', title: 'Why did the model stop?',
      body: 'stop_reason tells you whether the answer is complete. "end_turn" is the normal case; the others need your code to do something.',
      keyIdea: 'Treat stop_reason like an HTTP status: branch on it, never assume end_turn.',
      focus: ['llm'],
      widget: { type: 'table', head: ['stop_reason', 'Meaning'], rows: [
        ['end_turn', 'Finished naturally'],
        ['max_tokens', 'Hit your max_tokens cap — answer is cut off'],
        ['stop_sequence', 'Hit a stop sequence you set'],
        ['tool_use', 'The model wants to call a tool (Phase 13)'],
        ['pause_turn', 'Paused in a long agentic turn; resume it'],
        ['refusal', 'Declined for safety reasons — see stop_details'],
      ] },
      source: REF,
    },
    {
      label: 'Errors', tag: 'CASE', title: 'Case: launch day brings 429s',
      body: 'Traffic spikes and some calls fail with 429 (rate limited). The SDK retries 408, 409, 429 and 5xx errors twice by default, with backoff. Errors like 400 (bad request) or 401 (bad key) will never succeed on retry — fix the request instead.',
      keyIdea: 'Retry what is temporary (429, 5xx), fix what is permanent (400, 401). Catch the SDK’s typed error classes, never match on message text.',
      focus: ['api'], packets: ['l2'],
      widget: { type: 'table', head: ['Status', 'SDK error class', 'Retry?'], rows: [
        ['400', 'BadRequestError', 'No — fix the request'],
        ['401', 'AuthenticationError', 'No — check the key'],
        ['429', 'RateLimitError', 'Yes — back off (SDK does 2 retries)'],
        ['5xx', 'APIError (status ≥ 500)', 'Yes — back off'],
      ], caption: 'SDK defaults: 2 retries, 10-minute timeout.' },
      source: REF,
    },
    {
      label: 'Key check', tag: 'TRY IT', title: 'Where should the key live?',
      body: 'Pick a place for the API key and see what happens.',
      keyIdea: 'Server environment variables (or a secrets manager) are the only safe home for a key.',
      focus: ['srv'],
      widget: { type: 'picker', title: 'PUT THE API KEY IN…', options: [
        { label: 'Browser JavaScript', detail: 'Shipped to every visitor', result: 'Anyone can read it in dev tools and spend your money. ✗', tone: 'bad' },
        { label: 'Mobile app bundle', detail: 'Installed on every phone', result: 'App bundles can be unpacked and the key extracted. ✗', tone: 'bad' },
        { label: 'Git repository', detail: 'Committed with the code', result: 'Leaks to everyone with repo access — and stays in history. ✗', tone: 'bad' },
        { label: 'Server env variable', detail: 'ANTHROPIC_API_KEY on your server', result: 'Never sent to users; the SDK reads it automatically. ✓', tone: 'good' },
      ] },
    },
    {
      label: 'Recap', tag: 'RECAP', title: 'One request, end to end',
      focus: [],
      widget: { type: 'flow', chips: ['browser', '→ your server (key)', '→ POST /v1/messages', '→ model', '→ content + stop_reason + usage', '→ back to the browser'] },
      recap: [
        ['Where does the key live?', 'Server environment', 'Front-end code is public'],
        ['What must a request have?', 'model, max_tokens, messages', 'First message is from the user'],
        ['What do I read back?', 'text blocks', 'content is a list of blocks'],
        ['Is the answer complete?', 'Check stop_reason', 'max_tokens means cut off'],
        ['What do I retry?', '429 and 5xx', 'Never 400 / 401'],
      ],
      comingUp: 'Messages, roles & system prompts: why the model forgets your name — and how to fix it.',
    },
  ],
};
