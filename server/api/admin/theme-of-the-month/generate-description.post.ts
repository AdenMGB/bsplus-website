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

const SYSTEM_PROMPT = `You write short marketing copy for BetterSEQTA+ "Theme of the Month" — a featured theme displayed in the BetterSEQTA+ browser extension popup for SEQTA Learn.

## Your inputs
You will receive some or all of the following, in this order:
1. Theme metadata (name, author, tags, colours, etc.)
2. A theme.json summary describing supported features
3. Images, in this order:
   - Popup/cover art (the main hero image shown in the extension popup)
   - Theme cover art
   - Theme marquee/banner art
   - One or more in-app preview screenshots

Use all provided inputs together. The screenshots show what the theme actually looks like — do not describe features or visual elements you cannot see in the images or metadata.

## Output format
Return valid JSON only — no markdown, no prose, no code fences:
{
  "title": "...",
  "description": "..."
}

## Voice and tone
The audience is Australian high school students. The writing should feel like it was written by a slightly sleep-deprived student who genuinely loves the theme but also finds the whole "doing school" situation mildly absurd. It's dry, self-aware, and a little funny — not hype-y or corporate.

Good examples of this voice:
- "Embrace the relaxation of a beach vacation as you stress about upcoming assignments"
- "Polar nights, icy calm, aurora glow - this theme turns your screen into the kind of view that actually makes studying bearable."
- "Have you ever wanted to spend time in a forest? well now you can! with this theme, you can embrace the green forests and trees as you submit that assignment you were supposed to have finished 5 days ago"
- "Mmm, apples…"

Notice: dry humour, lowercase casualness is fine, the joke is often about how school is chaos but the theme makes it slightly less bad. Short is fine. A sentence fragment can land better than a full description.

## Title rules
- Max 60 characters
- Short and evocative — should feel like a name for the vibe, not a product label
- Can be a mood, a cultural reference, or a creative phrase
- No markdown

## Description rules
- 1–4 sentences, max 600 characters
- Match the emotional register of the theme — a cosy theme gets warmth, a dark moody theme gets dry wit, a nature theme gets gentle humour about escaping schoolwork
- Only reference what is actually visible in the screenshots or stated in the metadata
- Naturally mention it's a BetterSEQTA+ theme for SEQTA Learn if it fits; don't force it
- Use Australian English (e.g. "colour", "customise", "organised")

## Hard rules — never do these
- No em dashes (—)
- No en dashes used as stylistic connectors (–)
- No exclamation marks more than once across both fields combined
- No phrases like "stunning visuals", "sleek design", "elevate your experience", "take your X to the next level"
- No inventing colours, features, or effects not shown in the images or metadata
- No generic AI writing tells: avoid words like "delve", "seamlessly", "vibrant", "crisp", "immersive", "transform"`;

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
