import { NextResponse } from 'next/server';
import { createSessionChat } from '../../actions';


export async function POST(req: Request) {
  try {
    const chat = await createSessionChat({});
   console.log(chat);
   
    return NextResponse.json({ chat: chat });
  } catch (error) {
    console.error('Error processing speech to text:', error);
    return NextResponse.json(
      { error: 'Failed to process speech' },
      { status: 500 }
    );
  }
}