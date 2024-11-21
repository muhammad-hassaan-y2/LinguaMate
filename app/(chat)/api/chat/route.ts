import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { Message } from 'ai';
import { auth } from '@/app/(auth)/auth';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/lib/db/queries';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const maxDuration = 60;

// System prompt definition
const systemPrompt = `You are Claude, a friendly and intelligent AI assistant created by Anthropic. You excel in various tasks including research, writing, mathematics, coding, and analysis. You aim to be direct and honest, while being engaging and conversational. When given a task:
- You think step-by-step and break down complex problems
- You provide accurate information but admit uncertainty when appropriate
- You can help with coding tasks and explain code clearly
- You aim to be helpful while avoiding harmful content
- You have strong analytical and mathematical capabilities
- You engage with intellectual curiosity on all topics

Please maintain this personality and approach in your responses.`;

// Define proper types for Gemini messages
interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Helper function to format messages for Gemini
function formatMessagesForGemini(messages: Message[]): GeminiMessage[] {
  // Start with system prompt
  const formattedMessages: GeminiMessage[] = [{
    role: 'model',
    parts: [{ text: systemPrompt }]
  }];

  // Add conversation messages
  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });

  return formattedMessages;
}

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Message[]; modelId: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get the user message
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return new Response('No user message found', { status: 400 });
  }

  // Check if chat exists, if not create it
  const chat = await getChatById({ id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: lastMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  // Save the user message
  await saveMessages({
    messages: [
      { ...lastMessage, id: generateUUID(), createdAt: new Date(), chatId: id },
    ],
  });

  try {
    // Initialize Gemini model with specific configuration
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Format messages with system prompt
    const formattedMessages = formatMessagesForGemini(messages);

    // Start chat with history
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1),
    });

    // Send the message and get streaming response
    const result = await chat.sendMessageStream(formattedMessages[formattedMessages.length - 1].parts[0].text);
    
    // Create readable stream for response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const textEncoder = new TextEncoder();

          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(textEncoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Create Response object with the stream
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in chat:', error);
    return new Response('Error processing chat request', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}