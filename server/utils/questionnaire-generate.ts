const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

const JSON_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          options: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 4
          }
        },
        required: ['question', 'options']
      }
    }
  },
  required: ['questions']
};

export interface GeneratedQuestion {
  question: string;
  options: string[];
}

interface QuestionRow {
  question: string;
  option1: string;
  option2: string | null;
  option3: string | null;
  option4: string | null;
}

function formatPreviousQuestions(rows: QuestionRow[]): string {
  if (rows.length === 0) {
    return 'No previous questions yet.';
  }

  return rows
    .map((row, index) => {
      const options = [row.option1, row.option2, row.option3, row.option4].filter(Boolean);
      return `${index + 1}. "${row.question}" — Options: ${options.join(', ')}`;
    })
    .join('\n');
}

function buildPrompt(count: number, previousQuestions: QuestionRow[], topic?: string): string {
  const topicLine = topic?.trim()
    ? `Focus on this theme or direction: ${topic.trim()}`
    : 'Choose varied, engaging topics relevant to students and school life.';

  return `Generate ${count} new daily poll questions for BetterSEQTA Plus, a community site used by Australian high school students who use SEQTA Learn.

Each question must be a fun, lighthearted multiple-choice poll with 2 to 4 short answer options. Questions should feel conversational, be easy to answer quickly, and avoid being offensive or overly personal.

${topicLine}

Do NOT repeat or closely rephrase any of these previous questions:
${formatPreviousQuestions(previousQuestions)}

Return exactly ${count} unique questions. Keep each question under 120 characters and each option under 40 characters.`;
}

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return JSON.parse(fenceMatch[1].trim());
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return JSON.parse(objectMatch[0]);
  }

  throw new Error('Could not parse AI response as JSON');
}

function extractQuestionsPayload(response: unknown): unknown {
  if (!response) {
    throw new Error('Empty AI response');
  }

  if (typeof response === 'string') {
    return parseJsonFromText(response);
  }

  if (typeof response !== 'object') {
    throw new Error('Invalid AI response format');
  }

  const root = response as Record<string, unknown>;

  if (Array.isArray(root.questions)) {
    return root;
  }

  if (root.response !== undefined) {
    if (typeof root.response === 'object' && root.response !== null) {
      const nested = root.response as Record<string, unknown>;
      if (Array.isArray(nested.questions)) {
        return nested;
      }
    }

    if (typeof root.response === 'string') {
      return parseJsonFromText(root.response);
    }
  }

  throw new Error('AI response missing questions array');
}

function normalizeQuestions(raw: unknown, count: number): GeneratedQuestion[] {
  const payload = extractQuestionsPayload(raw);
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid AI response format');
  }

  const questions = (payload as { questions?: unknown }).questions;
  if (!Array.isArray(questions)) {
    throw new Error('AI response missing questions array');
  }

  const normalized = questions
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const question = String((item as { question?: unknown }).question ?? '').trim();
      const optionsRaw = (item as { options?: unknown }).options;
      if (!question || !Array.isArray(optionsRaw)) return null;

      const options = optionsRaw
        .map((option) => String(option ?? '').trim())
        .filter(Boolean)
        .slice(0, 4);

      if (options.length < 2) return null;

      return { question, options };
    })
    .filter((item): item is GeneratedQuestion => item !== null);

  if (normalized.length === 0) {
    throw new Error('AI did not return any valid questions');
  }

  return normalized.slice(0, count);
}

export async function generateQuestionnaireQuestions(
  ai: Ai,
  previousQuestions: QuestionRow[],
  count: number,
  topic?: string
): Promise<GeneratedQuestion[]> {
  const response = await ai.run(MODEL, {
    messages: [
      {
        role: 'system',
        content: 'You create engaging multiple-choice poll questions for students.'
      },
      {
        role: 'user',
        content: buildPrompt(count, previousQuestions, topic)
      }
    ],
    max_tokens: 1024,
    response_format: {
      type: 'json_schema',
      json_schema: JSON_SCHEMA
    }
  });

  return normalizeQuestions(response, count);
}
