// src/lib/hanzo.ts — Pre-wired Hanzo Cloud Stack (Zen AI + Analytics & Insights + IAM)
// Provision or rotate API keys at: https://console.hanzo.ai/keys

export const HANZO_CONFIG = {
  project: "atlas-globe",
  template: "dotted-globe",
  aiBaseUrl: 'https://api.hanzo.ai/v1',
  defaultModel: "zen4",
  analyticsEndpoint: 'https://analytics.hanzo.ai/v1/track',
  analyticsId: "hz_ins_dotted-globe",
  iamIssuer: 'https://hanzo.id',
  iamOrg: "hanzo",
} as const;

export interface HanzoChatOptions {
  model?: string;
  system?: string;
  apiKey?: string;
}

/** Track product events, funnel conversions, and AI usage in Hanzo Insights */
export async function trackInsight(event: string, properties: Record<string, unknown> = {}): Promise<void> {
  try {
    await fetch(HANZO_CONFIG.analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analyticsId: HANZO_CONFIG.analyticsId,
        project: HANZO_CONFIG.project,
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    // Non-blocking telemetry
  }
}

/** Call Zen AI models via Hanzo Gateway with automatic latency & token insights */
export async function askHanzoAi(prompt: string, opts: HanzoChatOptions = {}): Promise<string> {
  const started = Date.now();
  const model = opts.model || HANZO_CONFIG.defaultModel;
  const apiKey = opts.apiKey || (typeof process !== 'undefined' ? process.env.HANZO_API_KEY : undefined) || '';
  const res = await fetch(`${HANZO_CONFIG.aiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
        { role: 'user', content: prompt },
      ],
    }),
  });
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  void trackInsight('ai.completion', {
    model,
    latencyMs: Date.now() - started,
    tokens: data?.usage?.total_tokens ?? 0,
    status: res.status,
  });
  return content;
}
