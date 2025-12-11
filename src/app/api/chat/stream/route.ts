import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

type MessageArr = { role: 'user' | 'assistant'; content: string };

function formatMessageForAi(messages: MessageArr[]): MessageArr[] {
  const formattedMessages: MessageArr[] = [];

  if (messages.length === 0) {
    return [];
  }

  if (messages[0].role !== 'user') {
    formattedMessages.push({ role: 'user', content: 'Conversation started' });
    formattedMessages.push({
      role: 'assistant',
      content: 'Hello! How can I assist you?',
    });
  }

  for (let i = 0; i < messages.length; i++) {
    const currentMessage = messages[i];
    formattedMessages.push(currentMessage);
    if (
      currentMessage.role === 'user' &&
      i < messages.length - 1 &&
      messages[i + 1]?.role !== 'assistant'
    ) {
      formattedMessages.push({ role: 'assistant', content: 'no response' });
    }
  }
  return formattedMessages;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { selectedModel, conversationId } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const MODEL_CONFIGS: Record<string, { provider: 'google' | 'mistral' | 'groq' }> = {
      'gemini-2.0-flash': { provider: 'google' },
      'gemini-1.5-pro': { provider: 'google' },
      'open-codestral-mamba': { provider: 'mistral' },
      'mistral-small-latest': { provider: 'mistral' },
      'groq/compound': { provider: 'groq' },
      'llama-3.1-8b-instant': { provider: 'groq' },
      'openai/gpt-oss-120b': { provider: 'groq' },
      'qwen/qwen3-32b': { provider: 'groq' },
      'whisper-large-v3': { provider: 'groq' },
    };

    const PROVIDER_CONFIGS: Record<
      'google' | 'mistral' | 'groq',
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
    };

    const modelConfig = MODEL_CONFIGS[selectedModel];
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unknown model: ${selectedModel}` },
        { status: 400 }
      );
    }

    const providerConfig = PROVIDER_CONFIGS[modelConfig.provider];
    const apiKey = providerConfig.envKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured for ${modelConfig.provider}` },
        { status: 500 }
      );
    }

    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const messagesForAI: MessageArr[] = formatMessageForAi(
      recentMessages
        .reverse()
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }))
    );

    if (messagesForAI.length === 0) {
      return NextResponse.json(
        { error: 'No messages found in conversation' },
        { status: 400 }
      );
    }

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

    return new NextResponse(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
