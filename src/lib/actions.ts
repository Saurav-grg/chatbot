'use server';
import { Message, Conversation, ServerActionResponse } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';

const session = await getServerSession();

export async function googleAiResponse(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY; // No NEXT_PUBLIC_ prefix needed for server actions

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    // console.log('reponse: ', result.response.text());
    return result.response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function createConversation(
  title: string
): ServerActionResponse<Conversation> {
  try {
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
