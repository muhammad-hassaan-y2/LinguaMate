import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Server-side environment variable
});

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();

    // Translation request
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Translate the following text to ${targetLanguage}. Also identify and explain any slang terms.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    // Slang analysis request
    const slangResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Identify and explain any slang terms or colloquial expressions in the following text."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return NextResponse.json({
      translation: translationResponse.choices[0].message.content,
      slangAnalysis: slangResponse.choices[0].message.content
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}