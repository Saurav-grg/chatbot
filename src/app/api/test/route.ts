// app/api/test-action/route.ts
import { NextResponse } from 'next/server';
import { aiResponse } from '@/lib/actions';

export async function POST(request: Request) {
  // Parse the JSON body from the request
  const body = await request.json();
  const userInput = body.prompt;

  // Validate the prompt
  if (!userInput || typeof userInput !== 'string') {
    return NextResponse.json(
      { error: 'Prompt must be a non-empty string' },
      { status: 400 }
    );
  }

  // Call the aiResponse function
  const response = await aiResponse(userInput, 'gemini-1.5-flash');

  // Check if aiResponse returned a valid Response object
  if (!(response instanceof Response)) {
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }

  // console.log(response);
  // Return the streamed Response directly
  return response;
}
