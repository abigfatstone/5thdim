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
      return new Response(JSON.stringify({ status: 'ok', provider: 'openrouter' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Main chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env, corsHeaders);
    }

    // Content API endpoints
    if (url.pathname.startsWith('/api/content')) {
      return handleContent(url, request, env, corsHeaders);
    }

    return jsonError('Not found', 404, corsHeaders);
  },
};

// ============================================================
// Content API — serves published content from D1
// ============================================================

async function handleContent(url, request, env, corsHeaders) {
  if (!env.DB) {
    return jsonError('Database not configured', 500, corsHeaders);
  }

  const jsonHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300', ...corsHeaders };
  const path = url.pathname.replace('/api/content', '') || '/';

  // POST /api/content — upsert content (requires auth) — check FIRST before GET
  if ((path === '/' || path === '') && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization') || '';
    if (authHeader !== `Bearer ${env.CONTENT_API_KEY}`) {
      return jsonError('Unauthorized', 401, corsHeaders);
    }

    let items;
    try {
      const body = await request.json();
      items = Array.isArray(body) ? body : [body];
    } catch {
      return jsonError('Invalid JSON', 400, corsHeaders);
    }

    let upserted = 0;
    for (const item of items) {
      if (!item.slug || !item.title || !item.body || !item.collection) continue;

      await env.DB.prepare(`
        INSERT INTO content (slug, title, title_zh, body, language, collection, series, tags, date, og_description, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(slug) DO UPDATE SET
          title = excluded.title, title_zh = excluded.title_zh, body = excluded.body,
          language = excluded.language, collection = excluded.collection, series = excluded.series,
          tags = excluded.tags, date = excluded.date, og_description = excluded.og_description,
          updated_at = datetime('now')
      `).bind(
        item.slug, item.title, item.title_zh || null, item.body,
        item.language || 'en', item.collection, item.series || null,
        item.tags ? JSON.stringify(item.tags) : null, item.date || null, item.og_description || null,
      ).run();
      upserted++;
    }

    return new Response(JSON.stringify({ upserted }), { headers: jsonHeaders });
  }

  // GET /api/content — list all collections
  if ((path === '/' || path === '') && request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT collection, COUNT(*) as count FROM content GROUP BY collection'
    ).all();
    return new Response(JSON.stringify({ collections: result.results }), { headers: jsonHeaders });
  }

  // GET /api/content/:collection — list items in a collection
  const collectionMatch = path.match(/^\/([a-z-]+)$/);
  if (collectionMatch && request.method === 'GET') {
    const collection = collectionMatch[1];
    const lang = url.searchParams.get('lang');

    let query = 'SELECT slug, title, title_zh, language, series, tags, date, og_description FROM content WHERE collection = ?';
    const params = [collection];

    if (lang) {
      query += ' AND (language = ? OR language = ?)';
      params.push(lang, 'both');
    }

    query += ' ORDER BY date DESC';
    const result = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ items: result.results.map(r => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [] })) }), { headers: jsonHeaders });
  }

  // GET /api/content/:collection/:slug — get single item
  const itemMatch = path.match(/^\/([a-z-]+)\/([a-z0-9-]+)$/);
  if (itemMatch && request.method === 'GET') {
    const [, collection, slug] = itemMatch;
    const result = await env.DB.prepare(
      'SELECT * FROM content WHERE collection = ? AND slug = ?'
    ).bind(collection, slug).first();

    if (!result) {
      return jsonError('Not found', 404, corsHeaders);
    }

    result.tags = result.tags ? JSON.parse(result.tags) : [];
    return new Response(JSON.stringify(result), { headers: jsonHeaders });
  }

  return jsonError('Not found', 404, corsHeaders);
}

async function handleChat(request, env, corsHeaders) {
  // Rate limiting
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  cleanupRateLimits();

  if (!checkRateLimit(ip)) {
    return jsonError('Rate limit exceeded. Please wait a moment before trying again.', 429, corsHeaders);
  }

  // Validate API key
  if (!env.OPENROUTER_API_KEY) {
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
  const maxHistoryMessages = maxTurns * 2;

  const trimmedHistory = history
    .filter(m => m && m.role && m.content)
    .slice(-maxHistoryMessages);

  // OpenRouter uses OpenAI-compatible format: system message in messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...trimmedHistory,
    { role: 'user', content: message.trim() },
  ];

  const model = env.LLM_MODEL || 'anthropic/claude-sonnet-4';

  // Call OpenRouter API with streaming
  let apiResponse;
  try {
    apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://5thdim.ai',
        'X-Title': '5thdim.ai - The Fifth Dimension Guide',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        stream: true,
        messages,
      }),
    });
  } catch (err) {
    return jsonError('Failed to connect to OpenRouter API', 502, corsHeaders);
  }

  if (!apiResponse.ok) {
    let errorDetail = `OpenRouter API error: ${apiResponse.status}`;
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

          if (data === '[DONE]') {
            await writer.write(encoder.encode('data: [DONE]\n\n'));
            continue;
          }
          if (!data) continue;

          try {
            const event = JSON.parse(data);

            // OpenRouter uses OpenAI-compatible streaming format
            const delta = event.choices?.[0]?.delta;
            if (delta?.content) {
              const chunk = `data: ${JSON.stringify({ text: delta.content })}\n\n`;
              await writer.write(encoder.encode(chunk));
            }

            // Check for finish
            const finishReason = event.choices?.[0]?.finish_reason;
            if (finishReason && finishReason !== 'null') {
              await writer.write(encoder.encode('data: [DONE]\n\n'));
            }

            // Handle errors in stream
            if (event.error) {
              console.error('Stream error from OpenRouter:', event.error);
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
