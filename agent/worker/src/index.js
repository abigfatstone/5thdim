import { SYSTEM_PROMPT, SYSTEM_PROMPT_ZH, WIKI_CONTEXT } from './context.js';

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Language detection: if message contains CJK characters, treat as Chinese
function detectLanguage(message, requestedLang) {
  if (requestedLang && requestedLang !== 'auto') {
    return requestedLang;
  }
  // CJK Unified Ideographs range
  const cjkPattern = /[\u4e00-\u9fff\u3400-\u4dbf]/;
  return cjkPattern.test(message) ? 'zh' : 'en';
}

function buildSystemPrompt(language) {
  let prompt = SYSTEM_PROMPT + '\n\n' + WIKI_CONTEXT;

  if (language === 'zh') {
    prompt += '\n\n' + SYSTEM_PROMPT_ZH;
  }

  return prompt;
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());

  if (allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }

  return {};
}

function jsonError(message, status, corsHeaders = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Main chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env, corsHeaders);
    }

    return jsonError('Not found', 404, corsHeaders);
  },
};

async function handleChat(request, env, corsHeaders) {
  // Rate limiting
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  cleanupRateLimits();

  if (!checkRateLimit(ip)) {
    return jsonError('Rate limit exceeded. Please wait a moment before trying again.', 429, corsHeaders);
  }

  // Validate API key
  if (!env.ANTHROPIC_API_KEY) {
    return jsonError('Server configuration error: missing API key', 500, corsHeaders);
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON in request body', 400, corsHeaders);
  }

  const { message, history = [], language = 'auto' } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return jsonError('Message is required', 400, corsHeaders);
  }

  if (message.length > 4000) {
    return jsonError('Message too long (max 4000 characters)', 400, corsHeaders);
  }

  // Detect language and build system prompt
  const detectedLang = detectLanguage(message, language);
  const systemPrompt = buildSystemPrompt(detectedLang);

  // Build messages array: last MAX_TURNS turns from history + current message
  const maxTurns = parseInt(env.MAX_TURNS, 10) || 6;
  const maxHistoryMessages = maxTurns * 2; // each turn = 1 user + 1 assistant

  const trimmedHistory = history
    .filter(m => m && m.role && m.content)
    .slice(-maxHistoryMessages);

  const messages = [
    ...trimmedHistory,
    { role: 'user', content: message.trim() },
  ];

  // Call Claude API with streaming
  let apiResponse;
  try {
    apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        stream: true,
        system: systemPrompt,
        messages,
      }),
    });
  } catch (err) {
    return jsonError('Failed to connect to Claude API', 502, corsHeaders);
  }

  if (!apiResponse.ok) {
    let errorDetail = `Claude API error: ${apiResponse.status}`;
    try {
      const errBody = await apiResponse.text();
      errorDetail += ` - ${errBody}`;
    } catch {}
    console.error(errorDetail);
    return jsonError('AI service temporarily unavailable', 502, corsHeaders);
  }

  // Stream the response as SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Process the streaming response in the background
  const streamProcessor = async () => {
    const reader = apiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          if (data === '[DONE]') continue;
          if (!data) continue;

          try {
            const event = JSON.parse(data);

            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              await writer.write(encoder.encode(chunk));
            }

            if (event.type === 'message_stop') {
              await writer.write(encoder.encode('data: [DONE]\n\n'));
            }

            if (event.type === 'error') {
              console.error('Stream error from Claude:', event.error);
              const errChunk = `data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`;
              await writer.write(encoder.encode(errChunk));
              await writer.write(encoder.encode('data: [DONE]\n\n'));
              break;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      // Ensure we always send DONE
      try {
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch {
        // Writer may already be closed
      }
    } catch (err) {
      console.error('Stream processing error:', err);
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch {
        // Writer may already be closed
      }
    } finally {
      try {
        await writer.close();
      } catch {
        // Already closed
      }
    }
  };

  // Kick off stream processing without awaiting (runs in background)
  streamProcessor();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders,
    },
  });
}
