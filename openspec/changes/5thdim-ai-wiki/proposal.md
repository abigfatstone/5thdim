# 5thdim.ai — LLM Wiki + Bilingual Website + AI Agent

## Problem

The Fifth Dimension is positioned for the English-speaking world not as "another AI book" but as "the first AI book from a Chinese practitioner that uses Eastern philosophy to reframe the conversation." Currently there is no web presence, no content platform, and no way for readers (English or Chinese) to engage with the book's ideas beyond reading the physical book.

The book's content is under publishing contract and cannot be shared online — except for the father-daughter letter exchange, which has standalone viral potential, especially for Chinese readers.

## Proposal

Build a three-layer system on the `abigfatstone/5thdim` repo:

1. **LLM Wiki (Layer A+B)** — A Karpathy-style knowledge base where raw sources are compiled into a structured, cross-linked wiki. The wiki's unique asset is `bridges/` — mappings between Eastern philosophy concepts and Western AI concepts (e.g., "Moonlight Box = Autoregressive Prediction").

2. **Published Content (Layer C)** — Curated articles, reading paths, and a media kit, auto-synced to a Framer frontend at 5thdim.ai via GitHub Actions.

3. **Bilingual AI Agent** — An LLM-powered conversational guide embedded on the website that answers questions using the wiki's knowledge, responds in the user's language (EN/CN), and uses the book's metaphor system.

The father-daughter letter (Chinese original + English translation) is the free content engine that drives traffic from both language communities.

## Scope

### In scope
- Directory structure: `raw/`, `wiki/`, `published/`, `agent/`, `schema/`
- Wiki skeleton: `index.md`, `overview.md`, 7 bridge pages
- Letter extraction: 4 files (daughter-zh, father-zh, daughter-en, father-en) into `raw/letters/` and `published/letter/`
- Agent system prompt (EN + CN modes)
- Schema file (`CLAUDE.md`) defining ingest/query/lint workflows
- GitHub Actions workflow stub for Framer CMS sync
- Published content: 3 launch blog posts + media kit

### Out of scope
- Book chapter content (under contract)
- Framer frontend design/remix (separate task, uses Framer template)
- Agent deployment (Cloudflare Worker — after system prompt is finalized)
- Vector search for wiki retrieval (not needed until wiki exceeds ~50 pages)

## Architecture

```
5thdim/
├── sections_en/              ← book .tex (unchanged)
├── sections/                 ← book .tex Chinese (unchanged)
├── raw/                      ← Layer A: immutable sources
│   ├── letters/              ← father-daughter letters (zh + en)
│   ├── references/           ← cited papers & articles
│   ├── philosophy/           ← Eastern philosophy source texts
│   ├── author/               ← interviews, talks, bio
│   └── industry/             ← ongoing AI news
├── wiki/                     ← Layer B: LLM-maintained knowledge
│   ├── index.md
│   ├── log.md
│   ├── overview.md
│   ├── concepts/             ← AI concepts
│   ├── philosophy/           ← Eastern philosophy concepts
│   ├── bridges/              ← East↔West mappings (core asset)
│   ├── east-west/            ← cultural comparison analysis
│   ├── entities/
│   ├── sources/
│   └── comparisons/
├── published/                ← Layer C: curated for Framer
│   ├── blog/
│   ├── letter/               ← bilingual letter pages
│   ├── paths/                ← reading paths by audience
│   ├── deep-dives/
│   ├── current/
│   └── media-kit/
├── agent/                    ← LLM Agent config
│   ├── system-prompt.md
│   └── system-prompt-zh.md
├── schema/
│   └── CLAUDE.md             ← wiki maintenance instructions
└── .github/workflows/
    └── publish.yml           ← auto-sync to Framer CMS
```

## Data flow

```
Human curates → raw/ → LLM compiles → wiki/ → curate → published/ → Framer → reader
                                                                         ↓
                                                              agent (grounded in wiki/)
                                                                         ↓
                                                              reader asks questions
```

## Key design decisions

1. **Framer sync**: automated via GitHub Actions (markdown → Framer CMS API)
2. **Language**: wiki content is bilingual; bridges/ pages include both Chinese original terms and English translations; agent auto-detects user language
3. **Repo structure**: wiki lives alongside book source in same repo (`abigfatstone/5thdim`)
4. **Chinese letter is the original**: English is the translation, not the other way around — this is communicated on the website
5. **Agent model**: Claude Sonnet (cost-effective), with static context loading (all bridges/ + overview + index always loaded, query-selected concept pages added per question)
6. **Start lightweight**: no vector DB, no embedding search — plain markdown + index.md navigation until wiki exceeds ~50 pages

## Media strategy (context, not implementation)

The website is a cultural commentary platform, not a book landing page. The book is the anchor, not the hero. Five story angles for media pitches:
1. Father's letter to daughter on eve of Gaokao — about AI
2. Eastern philosophy meets AI: Zhuangzi, wuxia, martial arts
3. Inside view: what Chinese AI practitioners see that SV doesn't
4. "80 is the new zero" — scarcity redefined
5. Martial arts philosophy as AI survival framework

Target media: Wired, MIT Tech Review, Rest of World, Noema, The Atlantic, Lex Fridman podcast

Chen Tianqiao endorsement is the credibility anchor.
