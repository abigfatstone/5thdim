# Published Content — 5thdim.ai

This directory contains all content that gets published to the Framer frontend at 5thdim.ai.

## Directory structure

```
published/
├── blog/           ← Articles (Eastern Lens, The Lexicon, Letters series)
├── letter/         ← Bilingual father-daughter letter exchange
├── paths/          ← Reading paths by audience (students, parents, engineers, media)
├── deep-dives/     ← Extended explorations of specific topics
├── current/        ← AI news analyzed through the book's lens
└── media-kit/      ← Press materials (profile, story angles, quotes, endorsements)
```

## Frontmatter spec

Every `.md` file must include YAML frontmatter:

```yaml
---
title: "Article Title"              # required
title_zh: "中文标题"                 # optional, for bilingual content
slug: article-slug                   # required, URL path
date: 2026-04-15                     # required, publication date
tags: [tag1, tag2]                   # optional
language: en                         # required: en | zh | both
series: eastern-lens                 # optional: eastern-lens | the-lexicon | letters
wiki_sources:                        # optional, traceability to wiki pages
  - concepts/page-name
  - bridges/page-name
status: draft                        # required: draft | review | published
og_description: "..."                # optional, for social media cards
---
```

## Publishing workflow

1. Create/edit `.md` file in the appropriate subdirectory
2. Set `status: draft` while working
3. When ready, set `status: published`
4. Push to `main` branch
5. GitHub Actions (`.github/workflows/publish.yml`) auto-syncs to Framer CMS

Only files with `status: published` are synced. Draft and review files are ignored.

## Secrets required

Set these in GitHub repo settings → Secrets:
- `FRAMER_API_TOKEN` — Framer CMS API token
- `FRAMER_SITE_ID` — Your Framer site ID
