# Tasks: 5thdim.ai Wiki + Agent

## Phase 1: Foundation (P0)

- [x] 1.1 Create directory structure (`raw/`, `wiki/`, `published/`, `agent/`, `schema/`, `.github/workflows/`)
- [x] 1.2 Write `schema/CLAUDE.md` — wiki maintenance instructions (ingest/query/lint)
- [x] 1.3 Write `wiki/overview.md` — high-level synthesis of the book's framework
- [x] 1.4 Write `wiki/index.md` — page directory with one-line summaries
- [x] 1.5 Write 7 bridge pages in `wiki/bridges/`:
  - [x] 1.5.1 `moonlight-box-is-autoregression.md`
  - [x] 1.5.2 `invisible-dragon-is-loss-function.md`
  - [x] 1.5.3 `shadow-clone-is-data-replication.md`
  - [x] 1.5.4 `teleportation-is-latency.md`
  - [x] 1.5.5 `star-absorbing-is-transfer-learning.md`
  - [x] 1.5.6 `sinew-classic-is-skill-retraining.md`
  - [x] 1.5.7 `simplicity-defeats-complexity-is-dao.md`
- [x] 1.6 Extract letters into `raw/letters/`:
  - [x] 1.6.1 `daughter-zh.md` (from `sections/061_第一位读者来信.tex`)
  - [x] 1.6.2 `father-zh.md` (from same file, "高一片叶子" section)
  - [x] 1.6.3 `daughter-en.md` (from `sections_en/061_first_reader_letter_en.tex`)
  - [x] 1.6.4 `father-en.md` (from same file, "One Leaf Higher" section)
- [x] 1.7 Create `published/letter/letter-en.md` and `published/letter/letter-zh.md`

## Phase 2: Agent (P1)

- [x] 2.1 Write `agent/system-prompt.md` — core persona, behavior rules, context loading strategy
- [x] 2.2 Write `agent/system-prompt-zh.md` — Chinese-mode addendum
- [x] 2.3 Write `wiki/log.md` — initial log entry

## Phase 3: Launch Content (P2)

- [x] 3.1 Write first blog post: `published/blog/why-a-chinese-ai-ceo-reads-zhuangzi.md`
- [x] 3.2 Write second blog post: `published/blog/the-invisible-dragon-what-sagan-teaches-ai.md`
- [x] 3.3 Write third blog post: `published/blog/when-80-becomes-zero.md`
- [x] 3.4 Write `published/media-kit/author-profile.md`
- [x] 3.5 Write `published/media-kit/story-angles.md`
- [x] 3.6 Write `published/media-kit/pull-quotes.md`
- [x] 3.7 Write `published/media-kit/endorsements.md`
- [x] 3.8 Write reading paths: `published/paths/for-students.md`, `for-parents.md`, `for-engineers.md`, `for-media.md`

## Phase 4: Pipeline (P2)

- [x] 4.1 Write `.github/workflows/publish.yml` — GitHub Actions stub for Framer CMS sync
- [x] 4.2 Write `published/README.md` — frontmatter spec and publishing workflow docs

## Phase 5: Framer + Agent Deployment (P3, separate)

- [ ] 5.1 Remix Framer template from provided URL
- [ ] 5.2 Set up Framer CMS collections (blog, letter, paths)
- [ ] 5.3 Deploy agent backend (Cloudflare Worker + Claude API)
- [ ] 5.4 Embed agent chat widget on Framer site
- [ ] 5.5 Connect GitHub Actions to Framer CMS API
