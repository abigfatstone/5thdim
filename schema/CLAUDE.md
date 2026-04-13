# Wiki Maintenance Instructions

You are maintaining the LLM Wiki for *The Fifth Dimension* (第五维度) by Xun Jiang — a Karpathy-style structured knowledge base powering the 5thdim.ai site.

---

## 1. Directory Structure

```
raw/            Immutable source materials. Never edit files here.
  author/       Author notes, essays, talks
  industry/     AI industry news, reports, press coverage
  letters/      Father-daughter letters (en + zh)
  philosophy/   Eastern philosophy source texts, excerpts
  references/   Academic papers, external references

wiki/           LLM-maintained structured knowledge. This is your workspace.
  bridges/      East↔West concept mappings (the core differentiator)
  concepts/     Technical and strategic ideas from the book
  philosophy/   Eastern philosophical frameworks applied to AI
  entities/     Key figures referenced in the book
  comparisons/  Side-by-side analyses of competing paradigms
  east-west/    Comparative cultural perspectives on AI
  sources/      Summaries of raw/ materials (one summary per source file)
  overview.md   High-level synthesis of the book
  index.md      Navigation map — every wiki page must appear here
  log.md        Append-only changelog of wiki edits

published/      Curated content for the Framer frontend at 5thdim.ai
  blog/         Blog posts
  current/      Topical commentary tied to industry news
  deep-dives/   Long-form explorations of a single bridge or concept
  letter/       Published versions of letters
  media-kit/    Press and promotional materials
  paths/        Guided reading paths through the wiki
```

---

## 2. Page Format

Every wiki page uses YAML frontmatter followed by Markdown body.

```yaml
---
title: "Human-Readable Title"
type: bridge | concept | philosophy | entity | comparison | east-west | overview | index
book_chapter: 032_moonlight_box          # snake_case chapter ID, omit if not chapter-specific
sources:
  - 032_moonlight_box_en.tex             # files in raw/ or sections_en/ that inform this page
  - some-industry-article.md
related:
  - bridges/moonlight-box-is-autoregression.md
  - concepts/autoregressive-prediction.md
confidence: high | medium | low          # how well-supported by sources
created: 2026-04-14
updated: 2026-04-14
publish_ready: true | false
lang: en | zh | both                     # primary language(s) of this page
---
```

Required fields: `title`, `type`, `created`, `updated`, `lang`.
Other fields: include when applicable, omit when not.

---

## 3. Page Types

| Type | Directory | Purpose |
|------|-----------|---------|
| `bridge` | bridges/ | Maps an Eastern metaphor to a Western technical concept. The core product. |
| `concept` | concepts/ | A technical or strategic idea (entropy, verification asymmetry, etc.) |
| `philosophy` | philosophy/ | An Eastern philosophical framework and how it applies to AI |
| `entity` | entities/ | A person (Shannon, Zhuangzi, Karpathy) and their role in the book's argument |
| `comparison` | comparisons/ | Side-by-side analysis of two paradigms or approaches |
| `east-west` | east-west/ | Cultural or epistemological comparison between Chinese and Western AI perspectives |
| `overview` | wiki root | High-level synthesis of the book |
| `index` | wiki root | Master navigation page |

---

## 4. Ingest Workflow

When new source material is added to `raw/`:

1. **Read** the source file completely.
2. **Create or update** a source summary in `wiki/sources/` (one file per source, named to match the source).
3. **Update existing pages** — check every page whose `sources` or `related` fields overlap with the new material. Add new information, update confidence levels.
4. **Check for new bridges** — can the new material create a new East↔West mapping? If yes, create a bridge page. Every book chapter should have at least one bridge.
5. **Maintain cross-references** — add the new page to `related` fields of connected pages, and add those pages to the new page's `related` field.
6. **Append to `wiki/log.md`** — one line per action: `YYYY-MM-DD | action | page | brief reason`.
7. **Update `wiki/index.md`** — add any new pages to the correct section. Remove nothing.

---

## 5. Query Workflow

When answering questions about the wiki:

1. **Start from `wiki/index.md`** to locate relevant pages.
2. **Prioritize bridges/** — they are the book's unique contribution and the site's core differentiator.
3. **Synthesize** an answer using wiki-internal references (link to page paths, not raw sources).
4. **Optionally archive** — if the answer reveals a valuable new synthesis, create a new wiki page for it and run the ingest steps (cross-references, log, index).

---

## 6. Lint Workflow

Run periodically to maintain wiki health:

| Check | How |
|-------|-----|
| **Orphan pages** | Find pages with zero incoming links (not in any other page's `related` field). Every page should be reachable. |
| **Missing pages** | Find filenames referenced in `related` fields that do not exist. Either create them or remove the reference. |
| **Bridge completeness** | Every book chapter should have at least one bridge page. List chapters without one. |
| **Contradictions** | Flag pages that make conflicting claims about the same concept. |
| **Stale industry summaries** | Flag `wiki/sources/` summaries of `raw/industry/` files older than 90 days. |
| **Index sync** | Verify every file in `wiki/` subdirectories appears in `wiki/index.md`, and every entry in `index.md` points to an existing file. |

Output a lint report as a list of findings with severity (error / warning / info).

---

## 7. Naming Conventions

- **Filenames**: kebab-case, ASCII only, `.md` extension. Example: `moonlight-box-is-autoregression.md`
- **Bridge naming pattern**: `{eastern-concept}-is-{western-concept}.md`
- **No special characters**: no spaces, parentheses, CJK characters, or accents in filenames.
- **Chapter IDs**: snake_case matching the tex file stems (e.g., `032_moonlight_box`).

---

## 8. Language Rules

- **bridges/**: Always bilingual (`lang: both`). Include Chinese terms with English explanations. Key quotes appear in both languages.
- **concepts/**: Default to English (`lang: en`). Preserve Chinese terms in parentheses on first use — e.g., "entropy (熵)".
- **philosophy/**: English with Chinese terms preserved. Original Chinese quotes included alongside translations.
- **entities/**: English.
- **sources/**: Match the language of the source material.

---

## 9. Content Rules

The book is under a publishing contract. Strict limits on verbatim reproduction.

- **Never reproduce more than 1–2 sentences verbatim** from any book chapter.
- **Paraphrase and cite**: describe the idea in your own words, then cite the chapter.
- **Quotes in Key Quotes sections**: limited to short, illustrative excerpts (1–2 lines each) presented in both languages.
- **raw/ files are reference material**, not content to be copied wholesale into wiki pages.
- When in doubt, paraphrase more aggressively. The wiki's job is to explain and connect, not to reproduce.
