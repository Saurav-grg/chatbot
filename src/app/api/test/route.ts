// app/api/test-action/route.ts
import { NextRequest } from 'next/server';
import { ModelProvider } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { fetchConversationMessages } from '@/lib/actions';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  const MODEL_CONFIGS: Record<string, { provider: ModelProvider }> = {
    'gemini-1.5-flash': { provider: 'google' },
    'gemini-1.5-pro': { provider: 'google' },
    'open-codestral-mamba': { provider: 'mistral' },
    'mistral-small-latest': { provider: 'mistral' },
    'gemma2-9b-it': { provider: 'groq' },
    // 'gpt-4o': { provider: 'openai' }
  };

  // Provider config map
  const PROVIDER_CONFIGS: Record<
    ModelProvider,
    { baseURL: string; envKey: string }
  > = {
    google: {
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      envKey: process.env.GEMINI_API_KEY || '',
    },
    mistral: {
      baseURL: 'https://api.mistral.ai/v1/',
      envKey: process.env.MISTRAL_API_KEY || '',
    },
    groq: {
      baseURL: 'https://api.groq.com/openai/v1/',
      envKey: process.env.GROQ_API_KEY || '',
    },
    // openai: {
    //   baseURL: 'https://api.openai.com/v1/',
    //   envKey: 'OPENAI_API_KEY'
    // }
  };
  const body = await request.json();
  const { prompt, selectedModel, conversationId } = body;
  if (!conversationId) {
    return new Response('conversationId is required', { status: 400 });
  }
  const modelConfig = MODEL_CONFIGS[selectedModel];
  if (!modelConfig) {
    // return { error: `Unknown model: ${selectedModel}` };
    return new Response(`Unknown model: ${selectedModel}`, { status: 400 });
  }
  const providerConfig = PROVIDER_CONFIGS[modelConfig.provider];
  const apiKey = providerConfig.envKey;
  if (!apiKey) {
    // return { error: `${providerConfig.envKey} is not defined` };
    return new Response(`${providerConfig.envKey} is not defined`, {
      status: 500,
    });
  }
  try {
    const messagesResponse = await fetchConversationMessages(
      conversationId,
      20
    );
    if ('error' in messagesResponse) {
      return new Response(messagesResponse.error, { status: 500 });
    }
    const recentMessages = messagesResponse.data!;
    type MessageArr = {
      role: 'user' | 'assistant';
      content: string;
    };
    const messagesForAI: MessageArr[] = formatMessageForAi(
      recentMessages.map((msg) => {
        const role = msg.sender === 'user' ? 'user' : 'assistant';
        return { role, content: msg.text };
      })
    );

    messagesForAI.push({ role: 'user', content: prompt });
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: providerConfig.baseURL,
    });
    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages: messagesForAI,
      stream: true,
    });
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return new Response('Failed to generate AI response', { status: 500 });
  }
}
//function
type MessageArr = { role: 'user' | 'assistant'; content: string };

function formatMessageForAi(messages: MessageArr[]): MessageArr[] {
  const formattedMessages: MessageArr[] = [];

  // If the input array is empty, return an empty array or initialize with a default user message
  if (messages.length === 0) {
    return [];
  }

  // Ensure the first message is from a user
  if (messages[0].role !== 'user') {
    formattedMessages.push({ role: 'user', content: 'Conversation started' });
    formattedMessages.push({
      role: 'assistant',
      content: 'Hello! How can I assist you?',
    });
  }

  // Process each message
  for (let i = 0; i < messages.length; i++) {
    const currentMessage = messages[i];

    // Add the current message to the formatted array
    formattedMessages.push(currentMessage);

    // If the current message is from a user
    if (currentMessage.role === 'user') {
      // Check if there's a next message and if it's not an assistant
      if (i === messages.length - 1 || messages[i + 1]?.role !== 'assistant') {
        // Insert a default assistant message
        formattedMessages.push({ role: 'assistant', content: 'no response' });
      }
    }
  }

  return formattedMessages;
}
