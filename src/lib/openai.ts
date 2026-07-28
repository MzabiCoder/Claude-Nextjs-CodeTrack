import OpenAI from 'openai';

export const AI_MODEL = 'gpt-5-nano';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
