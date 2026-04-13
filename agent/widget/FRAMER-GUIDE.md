# Framer Setup Guide — 5thdim.ai

All content comes from `api.5thdim.ai`. Framer is purely for layout and design.

## Pages to Create

| Page | Route | Embed Component | Notes |
|------|-------|-----------------|-------|
| Home | `/` | none (static) | Design in Framer. Hero text, provocation. |
| Blog List | `/blog` | `blog-list.html` | Auto-fetches posts from API |
| Blog Post | `/blog/:slug` | `blog-post.html` | Reads slug from URL, fetches content |
| Letter EN | `/letter` | `letter-page.html` | Auto-detects English |
| Letter ZH | `/letter/zh` | `letter-page.html` | Auto-detects Chinese from URL |
| About | `/about` | none (static) | Author profile, design in Framer |
| Book | `/book` | none (static) | Synopsis + buy links |
| Press | `/press` | none or static | Link to media-kit API |
| Chat Widget | (all pages) | `chat-widget.html` | Global, fixed bottom-right |

## How to Embed Components

### Step 1: Add HTML Embed
1. Select the page in Framer
2. Click **"+"** → search **"Embed"** or **"HTML"**
3. Drag the HTML Embed component onto the page
4. Double-click it → paste the component code

### Step 2: Configure Each Component

**Blog List** (`/blog` page):
- Paste `blog-list.html` contents
- Set the embed to fill the content area width
- The component renders a card list with click-to-navigate

**Blog Post** (`/blog/:slug` page):
- In Framer, create a page at route `/blog/slug` (use a wildcard/dynamic route if supported, or create individual pages)
- Paste `blog-post.html` contents
- The component reads the slug from the URL and fetches the post

**Letter** (`/letter` and `/letter/zh`):
- Same component for both pages: `letter-page.html`
- It auto-detects language from the URL path
- Create two pages: `/letter` and `/letter/zh`

**Chat Widget** (all pages):
- Add to the site-wide **layout** (not individual pages)
- Paste `chat-widget.html`
- It renders as a floating bubble, doesn't affect layout

### Step 3: Static Pages

These pages are designed directly in Framer (no API):

**Home** (`/`):
- Hero: "When AI lifts everyone to 80 out of 100, 80 becomes the new zero."
- Subtitle: "A different lens on AI — through Eastern philosophy."
- CTA buttons: "Read the Blog" → /blog, "The Letter" → /letter

**About** (`/about`):
- Narrative profile (adapt from `published/media-kit/author-profile.md`)
- Chen Tianqiao endorsement quote
- Photo if available

**Book** (`/book`):
- Title, subtitle, cover image
- Chapter overview / metaphor map
- Purchase links

## Custom Domain

1. Framer: Settings → Custom Domain → `5thdim.ai`
2. Framer will show you a CNAME value (e.g., `proxy-ssl.webflow.com` or similar)
3. In Cloudflare DNS, add:
   - Type: `CNAME`
   - Name: `@` or `5thdim.ai`
   - Target: the value Framer gives you
   - Proxy: **OFF** (grey cloud) — Framer needs direct SSL

**Note**: The `api` subdomain (api.5thdim.ai) stays on Cloudflare Workers. Only the main domain points to Framer.

## Adding New Content

1. Write markdown in `published/` with proper frontmatter
2. Run: `CONTENT_API_KEY=your-key node agent/worker/sync.js`
3. Content appears on the site automatically (API-driven, no Framer rebuild needed)

## API Endpoints Reference

```
GET  api.5thdim.ai/api/content              → all collections
GET  api.5thdim.ai/api/content/blog          → blog post list
GET  api.5thdim.ai/api/content/blog/:slug    → single blog post
GET  api.5thdim.ai/api/content/letter        → letter pages
GET  api.5thdim.ai/api/content/paths         → reading paths
GET  api.5thdim.ai/api/content/media-kit     → press materials
POST api.5thdim.ai/api/chat                  → AI agent chat
GET  api.5thdim.ai/health                    → health check
```
