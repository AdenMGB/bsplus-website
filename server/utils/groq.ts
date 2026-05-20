import type { H3Event } from 'h3';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | GroqContentPart[];
}

export type GroqContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

interface GroqChatOptions {
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
}

export function getGroqConfig(event: H3Event) {
  const config = useRuntimeConfig(event);
  const apiKey = (config.groqApiKey as string)?.trim() || '';
  const model = (config.groqModel as string)?.trim() || 'meta-llama/llama-4-scout-17b-16e-instruct';
  const maxImages = Math.min(
    5,
    Math.max(1, parseInt(String(config.groqTotmMaxImages || '5'), 10) || 5)
  );
  return { apiKey, model, maxImages };
}

export function requireGroqApiKey(event: H3Event): string {
  const { apiKey } = getGroqConfig(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      message: 'AI generation is not configured. Set NUXT_GROQ_API_KEY on the server.'
    });
  }
  return apiKey;
}

export async function callGroqChat(
  messages: GroqMessage[],
  options: GroqChatOptions
): Promise<string> {
  const body: Record<string, unknown> = {
    model: options.model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 512
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  let response: Response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error('[Groq] Request failed:', e);
    throw createError({ statusCode: 502, message: 'Failed to reach Groq API' });
  }

  const data = (await response.json()) as GroqChatResponse;

  if (!response.ok) {
    const msg = data.error?.message || `Groq API error (${response.status})`;
    console.error('[Groq] API error:', msg);
    throw createError({ statusCode: 502, message: 'AI generation failed. Please try again.' });
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw createError({ statusCode: 502, message: 'AI returned an empty response' });
  }

  return content;
}

export function parseGroqJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw createError({ statusCode: 502, message: 'AI returned invalid JSON' });
  }
}
