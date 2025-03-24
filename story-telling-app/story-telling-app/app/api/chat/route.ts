import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const llmResponse = await fetch('http://127.0.0.1:5000/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: messages.map(message => message.content).join(' '),
      max_tokens: 200,
      temperature: 1,
      top_p: 0.9
    })
  });

  if (!llmResponse.ok) {
    console.error("LLM API request failed:", llmResponse.statusText);
    return new Response('Internal Server Error', { status: 500 });
  }

  const data = await llmResponse.json();
  const assistantMessage = data.choices.map(choice => choice.text).join('\n');

  return NextResponse.json({ assistantMessage });
}