'use server';
import {
  Message,
  Conversation,
  ModelProvider,
  ServerActionResponse,
} from '@/types';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// Model config map
export async function createConversation(
  title: string
): ServerActionResponse<Conversation> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('unauthenticated!! login first');
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
    // console.error('Error creating conversation:', error);
    throw error;
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
      throw new Error('unauthenticated!! login first');
    }
    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session?.user?.id,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
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
    // console.error('Error adding message:', error);
    throw error;
  }
}

export async function fetchUserConversations(): ServerActionResponse<
  Conversation[]
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('unauthenticated!!! to fetch conversation');
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
    // console.error('Error fetching conversations:', error);
    throw error;
  }
}

// export async function fetchConversationMessages(
//   conversationId: string
// ): ServerActionResponse<Message[]> {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       throw new Error('unauthenticated login first!!' );
//     }
//     const messages = await prisma.message.findMany({
//       where: {
//         conversationId,
//         conversation: {
//           userId: session?.user?.id,
//         },
//       },
//       orderBy: {
//         createdAt: 'asc',
//       },
//     });
//     return { data: messages };
//   } catch (error) {
// console.error('Error fetching messages:', error);
//     return { error: 'Failed to fetch messages' };
//   }
// }
export async function fetchConversationMessages(
  conversationId: string,
  limit?: number
): ServerActionResponse<Message[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('unauthenticated!! login first');
    }
    const queryOptions = {
      where: {
        conversationId,
        conversation: {
          userId: session?.user?.id,
        },
      },
      orderBy: {
        createdAt: 'asc' as const,
      },
    };
    if (limit) {
      // console.log('limit:' + limit);
      // Fetch the last 'limit' messages by ordering descending, then reverse for chronological order
      const recentMessages = await prisma.message.findMany({
        ...queryOptions,
        orderBy: { createdAt: 'desc' as const },
        take: limit,
      });
      const chronologicalMessages = recentMessages.reverse();
      return { data: chronologicalMessages };
    } else {
      const messages = await prisma.message.findMany(queryOptions);
      // console.log('no limit' + messages.map((msg) => msg.text));
      return { data: messages };
    }
  } catch (error) {
    // console.error('Error fetching messages:', error);
    throw error;
  }
}
export async function deleteConversation(
  conversationId: string
): ServerActionResponse<Conversation['id']> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('unauthenticated!! login first');
    }
    const conversationExists = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
    });
    if (!conversationExists) {
      throw new Error('Conversation not found or unauthorized');
    }
    const deletedConversation = await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });
    return { data: deletedConversation.id };
  } catch (error) {
    // console.error('Error deleting conversations:', error);
    throw error;
  }
}
