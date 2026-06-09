import { GoogleGenAI } from '@google/genai';

let client = null;

const getClient = () => {
  if (client) return client;

  const key = process.env.GEMINI_API_KEY;

  if (!key) return null;

  client = new GoogleGenAI({
    apiKey: key,
  });

  return client;
};

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const isAIEnabled = () => !!process.env.GEMINI_API_KEY;

export const parseJSON = text => {
  let cleaned = (text || '').trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
  }

  return JSON.parse(cleaned.trim());
};

export const chatCompletion = async ({ system, user, temperature = 0.7 }) => {
  const c = getClient();

  if (!c) {
    return {
      ok: false,
      content:
        'AI features are disabled. Set GEMINI_API_KEY in the backend .env file to enable AI responses.',
    };
  }

  try {
    const res = await c.models.generateContent({
      model: MODEL,
      contents: user,
      config: {
        systemInstruction: system,
        temperature,
      },
    });

    return {
      ok: true,
      content: (res.text || '').trim(),
    };
  } catch (err) {
    console.error('AI error:', err.message);

    return {
      ok: false,
      content: 'AI request failed. Please try again later.',
    };
  }
};

export const SYSTEM_PROMPTS = {
  weekly: `
You are a warm, encouraging habit coach.

Analyse the user's last 7 days of habit data and write a short weekly review.

Include:
- What went well
- Patterns you notice
- One area to improve
- One encouraging takeaway

Keep the response under 200 words.
`,

  suggestion: `
You are a helpful habit coach.

Based on the user's goals, productive times, completion history, and past struggles, suggest 3 practical habit improvements.

Requirements:
- Be specific
- Be actionable
- Focus on consistency
- Avoid generic advice

Keep the response concise.
`,

  recovery: `
You are a compassionate habit recovery coach.

The user broke a streak.

Write a simple 3-day recovery plan that helps them rebuild momentum without guilt.

Include:
- Day 1 focus
- Day 2 focus
- Day 3 focus

Use an encouraging tone.
`,

  chat: `
You are a helpful habit analysis assistant.

Answer the user's question using ONLY the provided habit data.

If the answer cannot be determined from the data, clearly say so.

Do not invent information.
`,

  morning: `
You are a warm and motivating friend.

Write a short morning message (30-60 words).

Use:
- User goals
- Current streaks
- Recent progress

The message should feel personal, encouraging, and optimistic.
`,
};

export { getClient, MODEL };
