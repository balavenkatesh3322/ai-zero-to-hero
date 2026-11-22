/**
 * Claude API prices and context windows used in the Start Here lessons.
 * Source: Anthropic's Claude API reference model table (cached 2026-11-03). Prices change — always check
 * https://platform.claude.com/docs before relying on them. USD per 1M tokens.
 */
export const PRICING_SOURCE = 'Anthropic Claude API model table (cached 2026-11-03) · USD per 1M tokens';

export interface ModelPrice {
  id: string;
  name: string;
  input: number;
  output: number;
  cacheRead?: number;
  context: string;
  note?: string;
}

export const MODELS: ModelPrice[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', input: 4, output: 20, cacheRead: 0.2, context: '1M tokens' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', input: 2, output: 10, cacheRead: 0.1, context: '1M tokens' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', input: 0.1, output: 0.5, context: '1M tokens', note: 'for prompts up to 100K tokens ($0.50 / $2.50 beyond)' },
];

/** Context windows of other models mentioned in the lessons (same source). */
export const CONTEXT_WINDOWS: [string, string][] = [
  ['Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5', '1M tokens'],
  ['Claude Haiku 4.5', '200K tokens'],
];

/** Cost in dollars of `tokens` at `perMillion` dollars per 1M tokens. */
export const cost = (tokens: number, perMillion: number) => (tokens / 1_000_000) * perMillion;
export const money = (d: number) => (d >= 100 ? `$${Math.round(d).toLocaleString('en-US')}` : d >= 1 ? `$${d.toFixed(2)}` : `$${d.toFixed(4)}`);
