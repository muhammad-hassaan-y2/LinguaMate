import { NextResponse } from 'next/server';
import { convertSpeechToText } from '@/lib/speechService';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const transcription = await convertSpeechToText(buffer);

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error('Error processing speech to text:', error);
    return NextResponse.json(
      { error: 'Failed to process speech' },
      { status: 500 }
    );
  }
}