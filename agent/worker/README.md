# 5thdim-agent — Cloudflare Worker

AI chat backend for 5thdim.ai, powered by Claude.

## Setup

```bash
cd agent/worker
npm install
```

## Configure

Set your Anthropic API key as a Cloudflare secret:

```bash
wrangler secret put ANTHROPIC_API_KEY
```

## Development

```bash
npm run dev
```

Local server runs at `http://localhost:8787`. Test with:

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the Moonlight Box?", "history": [], "language": "auto"}'
```

## Deploy

```bash
npm run deploy
```

## API

### POST /api/chat

Request:
```json
{
  "message": "user's question",
  "history": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}],
  "language": "auto"
}
```

Response: Server-Sent Events stream.
- Each chunk: `data: {"text": "partial response"}\n\n`
- Final: `data: [DONE]\n\n`

### GET /health

Returns `{"status": "ok"}`.
