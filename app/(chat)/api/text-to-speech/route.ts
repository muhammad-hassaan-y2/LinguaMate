import { NextResponse } from 'next/server';
import { convertTextToSpeech } from '@/lib/speechService';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const audioBuffer = await convertTextToSpeech(text);
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mp3',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error processing text to speech:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}