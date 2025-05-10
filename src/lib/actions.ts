'use server';
import {
  Message,
  Conversation,
  ServerActionResponse,
  ModelProvider,
} from '@/types';
import { OpenAI } from 'openai';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Model config map
const MODEL_CONFIGS: Record<string, { provider: ModelProvider }> = {
  'gemini-1.5-flash': { provider: 'google' },
  'gemini-1.5-pro': { provider: 'google' },
  'open-codestral-mamba': { provider: 'mistral' },
  'mistral-small-latest': { provider: 'mistral' },
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
  // openai: {
  //   baseURL: 'https://api.openai.com/v1/',
  //   envKey: 'OPENAI_API_KEY'
  // }
};
export async function aiResponse(prompt: string, selectedModel: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: 'unauthenticated!!!' };
  }
  const modelConfig = MODEL_CONFIGS[selectedModel];
  if (!modelConfig) {
    return { error: `Unknown model: ${selectedModel}` };
    // console.error(`Unknown model: ${selectedModel}`);
    // return;
  }
  const providerConfig = PROVIDER_CONFIGS[modelConfig.provider];
  const apiKey = providerConfig.envKey;
  if (!apiKey) {
    return { error: `${providerConfig.envKey} is not defined` };
  }
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: providerConfig.baseURL,
    });
    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages: [{ role: 'user', content: prompt }],
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

export async function createConversation(
  title: string
): ServerActionResponse<Conversation> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: 'unauthenticated!!!' };
    }
    const conversation = (await prisma.conversation.create({
      data: {
        title,
        userId: session?.user?.id ?? '',
      },
      include: {
        messages: true,
      },
    })) as Conversation;

    return { data: conversation };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { error: 'Failed to create conversation' };
  }
}
export async function addMessageToConversation(
  conversationId: string,
  text: string,
  sender: 'user' | 'bot'
): ServerActionResponse<Message> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: 'unauthenticated!!!' };
    }
    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session?.user?.id,
      },
    });

    if (!conversation) {
      return { error: 'Conversation not found' };
    }

    const message = await prisma.message.create({
      data: {
        text,
        sender,
        conversationId,
      },
    });

    return { data: message };
  } catch (error) {
    console.error('Error adding message:', error);
    return { error: 'Failed to add message' };
  }
}

export async function fetchUserConversations(): ServerActionResponse<
  Conversation[]
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: 'unauthenticated!!!' };
    }
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session?.user?.id,
      },
      include: {
        messages: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return { data: conversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { error: 'Failed to fetch conversations' };
  }
}

export async function fetchConversationMessages(
  conversationId: string
): ServerActionResponse<Message[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: 'unauthenticated!!!' };
    }
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          userId: session?.user?.id,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return { data: messages };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { error: 'Failed to fetch messages' };
  }
}
export async function deleteConversation(conversationId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: 'unauthenticated!!!' };
    }
    const conversationExists = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
    });
    if (!conversationExists) {
      return { error: 'Conversation not found or unauthorized' };
    }
    const deletedConversation = await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });
    return { data: deletedConversation };
  } catch (error) {
    console.error('Error deleting conversations:', error);
    return { error: 'Failed to delete conversations' };
  }
}
