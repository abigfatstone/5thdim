# 5thdim.ai Deployment Guide

## Step 1: Deploy Agent Backend (Cloudflare Worker)

```bash
cd agent/worker
npm install
wrangler secret put ANTHROPIC_API_KEY   # paste your Anthropic API key
npm run dev                              # local test at http://localhost:8787
npm run deploy                           # deploy to Cloudflare
```

After deploy, note your worker URL: `https://5thdim-agent.YOUR_SUBDOMAIN.workers.dev`

Test it:
```bash
curl -X POST https://5thdim-agent.YOUR_SUBDOMAIN.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the Moonlight Box?", "history": [], "language": "auto"}'
```

## Step 2: Remix Framer Template

1. Open in browser: `https://framer.com/remix/pNS8HCjeuuu2BhSQwPuW`
2. Log into your Framer account
3. It creates a copy of the blog template in your workspace

## Step 3: Configure Framer Site

### 3.1 Pages to create/rename

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Provocation: "When 80 becomes the new zero..." |
| Blog | `/blog` | Articles (Eastern Lens, The Lexicon, Letters) |
| About | `/about` | Author profile narrative |
| Letter | `/letter` | English letter page |
| Letter ZH | `/letter/zh` | Chinese original letter |
| Book | `/book` | Synopsis + purchase links |
| Explore | `/explore` | Reading paths by audience |
| Press | `/press` | Media kit |

### 3.2 Set up CMS Collections

In Framer, go to CMS and create these collections:

**Collection: Blog Posts**
| Field | Type | Required |
|-------|------|----------|
| Title | Text | yes |
| Title ZH | Text | no |
| Slug | Slug | yes |
| Body | Rich Text | yes |
| Date | Date | yes |
| Language | Enum (en, zh, both) | yes |
| Series | Enum (eastern-lens, the-lexicon, letters, null) | no |
| Tags | Multi-select | no |
| OG Description | Text | no |

**Collection: Reading Paths**
| Field | Type | Required |
|-------|------|----------|
| Title | Text | yes |
| Title ZH | Text | no |
| Slug | Slug | yes |
| Body | Rich Text | yes |
| Audience | Enum (students, parents, engineers, media) | yes |

**Collection: Media Kit**
| Field | Type | Required |
|-------|------|----------|
| Title | Text | yes |
| Slug | Slug | yes |
| Body | Rich Text | yes |

### 3.3 Custom domain

1. In Framer: Settings → Custom Domain → add `5thdim.ai`
2. In your DNS provider: add CNAME record pointing to Framer's domain
3. Wait for SSL certificate provisioning

## Step 4: Embed Chat Widget

1. In Framer, add a **Code** component to your site layout (so it appears on all pages)
2. Open `agent/widget/chat-widget.html`
3. Update `AGENT_URL` at the top of the script to your Cloudflare Worker URL
4. Paste the entire contents into the Code component
5. Publish and test

## Step 5: Connect GitHub Actions

1. In Framer: Settings → API → generate an API token
2. Note your Framer Site ID (in the URL when editing: `https://framer.com/projects/{SITE_ID}`)
3. In GitHub repo settings → Secrets → add:
   - `FRAMER_API_TOKEN` — the token from step 1
   - `FRAMER_SITE_ID` — the ID from step 2
4. Update `.github/workflows/publish.yml`: uncomment the actual API call and replace the TODO

## Step 6: Initial Content Load

Manually populate Framer CMS with launch content:

1. **Letter pages**: Copy from `published/letter/letter-en.md` and `letter-zh.md`
2. **Blog posts**: Copy from `published/blog/*.md` (3 posts)
3. **Reading paths**: Copy from `published/paths/*.md` (4 paths)
4. **Media kit**: Copy from `published/media-kit/*.md` (4 files)

After the GitHub Actions pipeline is connected, new pushes to `published/` will auto-sync.

## Step 7: Update Cloudflare Worker CORS

After setting up the custom domain, update `ALLOWED_ORIGINS` in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://5thdim.ai,https://www.5thdim.ai"
```

Then redeploy: `cd agent/worker && npm run deploy`

## Quick Reference

| Component | Location |
|-----------|----------|
| Agent backend code | `agent/worker/` |
| Chat widget embed | `agent/widget/chat-widget.html` |
| System prompts | `agent/system-prompt.md`, `agent/system-prompt-zh.md` |
| Wiki content | `wiki/` |
| Published content | `published/` |
| Publish pipeline | `.github/workflows/publish.yml` |
| Wiki maintenance guide | `schema/CLAUDE.md` |
