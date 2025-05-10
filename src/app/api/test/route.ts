// app/api/test-action/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { aiResponse } from '@/lib/actions';
import { ModelProvider } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import OpenAI from 'openai';

// export async function POST(request: Request) {
//   // Parse the JSON body from the request
//   const body = await request.json();
//   const userInput = body.prompt;

//   // Validate the prompt
//   if (!userInput || typeof userInput !== 'string') {
//     return NextResponse.json(
//       { error: 'Prompt must be a non-empty string' },
//       { status: 400 }
//     );
//   }

//   // Call the aiResponse function
//   const response = await aiResponse(userInput, 'gemini-1.5-flash');

//   // Check if aiResponse returned a valid Response object
//   if (!(response instanceof Response)) {
//     return NextResponse.json(
//       { error: 'Failed to generate AI response' },
//       { status: 500 }
//     );
//   }

//   // console.log(response);
//   // Return the streamed Response directly
//   return response;
// }

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
    // NextResponse.json(
    //   { error: 'unauthenticated!!!' },)
  }
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
  const body = await request.json();
  const { prompt, selectedModel } = body;
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
