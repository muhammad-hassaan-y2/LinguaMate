import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { Chatbot } from '@/components/chatbot/chatbot';
import ChatInterface from '../chatbot/page';

export default async function Page() {
  
  return (
    <ChatInterface />
  );
}
