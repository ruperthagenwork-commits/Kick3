// Vercel serverless function (also works on Netlify with minor renaming).
// Receives { systemPrompt, userMessage } from the client and calls Anthropic
// server-side, so the API key is never exposed in the browser.

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured. See README for setup.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { systemPrompt, userMessage } = body;
  if (!systemPrompt || !userMessage) {
    return new Response(
      JSON.stringify({ error: 'Missing systemPrompt or userMessage' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Basic length check to avoid abuse
  if (userMessage.length > 5000) {
    return new Response(
      JSON.stringify({ error: 'User message too long' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errText);
      return new Response(
        JSON.stringify({ error: 'Pete is having a moment. Try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await anthropicResponse.json();
    const text = data.content.map(b => b.text || '').join('').trim();

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Server error:', err);
    return new Response(
      JSON.stringify({ error: 'Pete lost his train of thought.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
