import { requireAdmin } from '../../../utils/auth';
import {
  callGroqChat,
  getGroqConfig,
  parseGroqJson,
  requireGroqApiKey,
  type GroqContentPart,
  type GroqMessage
} from '../../../utils/groq';
import { buildTotmGenerateContext } from '../../../utils/totmGenerateContext';

const SYSTEM_PROMPT = `You write marketing copy for BetterSEQTA+ "Theme of the Month" — a featured browser extension theme shown in the extension popup.

Rules:
- Return JSON only: { "title": "...", "description": "..." }
- title: short, catchy, max 60 characters, no markdown
- description: 1-2 sentences for students, max 300 characters, enthusiastic but accurate, no markdown
- Base copy on the theme metadata, theme.json summary, and attached screenshots
- Do not invent features not supported by the visuals or metadata
- Mention it is a BetterSEQTA+ browser theme for SEQTA Learn when natural
- Australian English is fine`;

interface GenerateBody {
  prompt?: string;
  theme_id?: string;
  cover_image?: string;
  current_title?: string;
  current_description?: string;
}

interface GenerateResult {
  title: string;
  description: string;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const apiKey = requireGroqApiKey(event);
  const { model } = getGroqConfig(event);

  const body = await readBody<GenerateBody>(event);
  const prompt = body?.prompt?.trim() || '';
  const themeId = body?.theme_id?.trim() || '';

  if (!themeId) {
    throw createError({ statusCode: 400, message: 'theme_id is required' });
  }
  if (prompt.length < 10) {
    throw createError({
      statusCode: 400,
      message: 'Please describe how the copy should sound (at least 10 characters)'
    });
  }

  const { metadata, themeJsonSummary, imageParts } = await buildTotmGenerateContext(
    event,
    themeId,
    body?.cover_image
  );

  const textParts: string[] = [
    `Style / tone direction from admin:\n${prompt}`,
    `\nTheme store metadata:\n${JSON.stringify(metadata, null, 2)}`
  ];

  if (themeJsonSummary) {
    textParts.push(`\nTheme.json summary (CustomCSS omitted):\n${JSON.stringify(themeJsonSummary, null, 2)}`);
  }

  const currentTitle = body?.current_title?.trim();
  const currentDescription = body?.current_description?.trim();
  if (currentTitle || currentDescription) {
    textParts.push(
      '\nExisting draft to refine (improve, do not copy verbatim unless still best):',
      JSON.stringify({ title: currentTitle || '', description: currentDescription || '' }, null, 2)
    );
  }

  if (imageParts.length > 0) {
    textParts.push(`\n${imageParts.length} screenshot(s) attached below.`);
  } else {
    textParts.push('\nNo preview images were available; rely on metadata only.');
  }

  const userContent: GroqContentPart[] = [
    { type: 'text', text: textParts.join('\n') },
    ...imageParts
  ];

  const messages: GroqMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent }
  ];

  const started = Date.now();
  const raw = await callGroqChat(messages, {
    model,
    apiKey,
    jsonMode: true,
    maxTokens: 512,
    temperature: 0.75
  });
  console.log(`[TOTM AI] Groq completed in ${Date.now() - started}ms`);

  const parsed = parseGroqJson<GenerateResult>(raw);
  const title = parsed.title?.trim().slice(0, 60);
  const description = parsed.description?.trim().slice(0, 300);

  if (!title || !description) {
    throw createError({ statusCode: 502, message: 'AI response missing title or description' });
  }

  return { title, description };
});
