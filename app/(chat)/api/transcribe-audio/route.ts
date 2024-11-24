import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const language = formData.get('language') as string;

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language === 'auto' ? undefined : language,
    });

    return NextResponse.json({ text: transcriptionResponse.text });
  } catch (error) {
    console.error('Audio API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
}