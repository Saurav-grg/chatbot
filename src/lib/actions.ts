'use server';
import { Message, Conversation, ServerActionResponse } from '@/types';
// import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function googleAiResponse(prompt: string, selectedModel: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.error('unauthenticated!!!');
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    // Use the chat.completions.create method to generate a response
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [{ role: 'user', content: prompt }],
    });
    console.log(completion);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
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
