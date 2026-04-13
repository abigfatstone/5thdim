# Design: 5thdim.ai Wiki + Agent

## Wiki page format

Every wiki page uses this frontmatter:

```yaml
---
title: Page Title
type: concept | philosophy | bridge | entity | comparison | east-west
book_chapter: 032_moonlight_box  # optional, links to book section
sources: [raw/references/file.md, raw/book/chapter.tex]
related: [concepts/other-page, bridges/other-bridge]
confidence: high | medium | low
created: YYYY-MM-DD
updated: YYYY-MM-DD
publish_ready: false  # true when curated enough for Layer C to reference
lang: en | zh | both
---
```

## Bridge page structure

Bridges are the core differentiator. Each bridge maps one Eastern concept to one Western AI concept:

```markdown
---
title: The Moonlight Box Is Autoregression
type: bridge
book_chapter: 032_moonlight_box
sources: [raw/book/032_moonlight_box_en.tex]
related: [concepts/autoregressive-prediction, philosophy/arrow-of-time]
confidence: high
created: 2026-04-14
updated: 2026-04-14
publish_ready: true
lang: both
---

## The Mapping

| Eastern | Western |
|---------|---------|
| 月光宝盒 (Moonlight Box) | Autoregressive language model |
| Stephen Chow's time-travel artifact | Next-token prediction |

## The Connection

In "A Chinese Odyssey," the Moonlight Box reverses time — you look backward to move forward. Large language models do exactly this: they predict the next word by looking at all previous words. The arrow of time points one way; prediction rides that arrow.

## Why This Reframe Matters

[Why the Eastern metaphor reveals something the Western technical term doesn't]

## Key Quotes (from the book)

> "We walk backward into the future, with nothing before our eyes but the past."

> 我们倒退着走向未来，眼前只有过去。
```

## Published content frontmatter

```yaml
---
title: "When 80 Becomes the New Zero"
title_zh: "当80分变成新的零分"
slug: when-80-becomes-zero
date: 2026-04-15
tags: [intelligence-inflation, karpathy, scarcity]
language: en  # en | zh | both
series: eastern-lens  # optional: eastern-lens | the-lexicon | letters
wiki_sources:
  - concepts/intelligence-inflation
  - bridges/sinew-classic-is-skill-retraining
status: draft  # draft | review | published
og_description: "..."  # for social media cards
---
```

## Agent context assembly

### Tier 0: Always loaded (~8K tokens)
- `agent/system-prompt.md` (~1.5K)
- `agent/system-prompt-zh.md` (~0.5K, loaded for Chinese users)
- `wiki/index.md` (~2K)
- `wiki/overview.md` (~2K)
- All `wiki/bridges/*` (~2.5K, 7 files)

### Tier 1: Query-selected (~15K tokens, max 5 pages)
- Scan `index.md` for keywords matching user query
- Load top 5 relevant pages from `concepts/`, `philosophy/`, `east-west/`, `entities/`

### Tier 2: Language-specific (~5K tokens)
- Chinese users: `published/letter/letter-zh.md`
- English users: `published/media-kit/pull-quotes.md`

### Tier 3: Conversation history (~2K tokens)
- Last 3 turns of dialogue

Total budget: ~30K tokens per request (Sonnet-friendly)

## Agent persona rules

### Core behavior
- Think in the book's framework: every AI concept has an Eastern parallel
- Auto-detect language, respond in kind
- Reference bridges/ as primary answer material
- Warm, opinionated, not preachy
- Admits when questions go beyond scope

### Chinese mode
- Use original metaphor names: 月光宝盒、隐龙、易筋经、吸星大法
- Quote daughter's words as resonance points
- Tone: short sentences, powerful, literary — like the father's letter
- On gaokao/major-selection questions: don't advise specifics, use book's framework
- "不用赢，别投降" > "在AI时代我们需要保持韧性"

### English mode
- Lead with English concept name, then introduce metaphor as reframe
- More structured, crisper answers
- Provide cultural context where needed (e.g., explain gaokao)

### Boundaries
- Never reproduce full book chapters (under contract)
- Never pretend to be the author
- Never answer questions outside AI/tech/philosophy/education
- Max 1 soft CTA per conversation ("The book explores this further in...")

## GitHub Actions publish pipeline

```
Trigger: push to main, paths: published/**

Steps:
1. Detect changed .md files in published/
2. Parse frontmatter (title, slug, date, tags, language, status)
3. Filter: only status=published
4. Convert markdown body → HTML
5. POST to Framer CMS API for each changed file
   - Create or update by slug
   - Set language field for bilingual routing
```

## Letter page design

### /letter (English, default)
- Context box: "Gaokao is China's national college entrance exam..."
- Daughter's comments (Chapter 1, 2, 7)
- Father's reply: "One Leaf Higher"
- Footer link: "Read the original in Chinese → /letter/zh"
- Agent entry point at bottom

### /letter/zh (Chinese)
- Header: "这是原稿。English translation → /letter"
- Full Chinese original, unedited
- Gen Z slang preserved as-is (no annotations)
- Agent entry point: "这本书里还有更多概念。有问题？问问第五维度的AI向导。"

## Framer site pages

| Route | Purpose | Primary audience |
|-------|---------|-----------------|
| `/` | Provocation, not book pitch. "When 80 becomes the new zero..." | Everyone |
| `/blog` | Articles: Eastern Lens, The Lexicon, Letters series | Engaged readers |
| `/about` | Profile narrative, not resume. Chen Tianqiao endorsement. | Media, new visitors |
| `/letter` | English letter + context | English readers |
| `/letter/zh` | Chinese original | Chinese readers |
| `/book` | Synopsis + purchase links + metaphor map | Buyers |
| `/explore` | "I am a..." → reading paths by identity | Return visitors |
| `/press` | Media kit online version | Journalists |
