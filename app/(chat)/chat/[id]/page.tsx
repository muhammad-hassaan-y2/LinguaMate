
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Chat as PreviewChat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import ChatInterface from '@/app/chatbot/page';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  return (
    <ChatInterface />
  );
}
