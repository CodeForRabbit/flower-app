# Guild Flower Static Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free static webpage for browsing guild members and their owned flowers, with image thumbnails and reverse lookup by flower.

**Architecture:** A Node.js generator parses `公会成员.txt` and scans `鲜花图册` for PNG images, then writes `assets/guild-flower-data.js`. `index.html` loads that data directly and renders searchable member and flower views in the browser.

**Tech Stack:** Plain HTML, CSS, JavaScript, Node.js built-in modules, Node's built-in test runner.

## Global Constraints

- Keep `公会成员.txt` as the editable source of truth.
- Do not require a backend, external packages, or a build service.
- The generated site must work on GitHub Pages.
- The page must support searching members and flowers, member-to-flower browsing, and flower-to-member reverse lookup.
- Surface data quality issues for duplicate entries and missing images.

---

### Task 1: Data Generator

**Files:**
- Create: `scripts/generate-data.mjs`
- Create: `tests/generate-data.test.mjs`
- Create: `assets/guild-flower-data.js`

**Interfaces:**
- Produces: `parseMemberText(text: string): Member[]`
- Produces: `buildFlowerImageMap(imagePaths: string[]): Record<string, string>`
- Produces: `buildGuildFlowerData(memberText: string, imagePaths: string[]): GuildFlowerData`
- Produces: `writeDataFile(data: GuildFlowerData, outputPath: string): void`

- [ ] Write failing tests for parsing mixed separators, preserving members, deduplicating flower lists, recording duplicate entries, and matching image paths by file basename.
- [ ] Run `node --test tests/generate-data.test.mjs` and verify it fails because `scripts/generate-data.mjs` does not exist.
- [ ] Implement `scripts/generate-data.mjs` with exported pure functions and CLI behavior.
- [ ] Run `node --test tests/generate-data.test.mjs` and verify it passes.
- [ ] Run `node scripts/generate-data.mjs` and verify it writes `assets/guild-flower-data.js`.

### Task 2: Static Webpage

**Files:**
- Create: `index.html`
- Modify: `assets/guild-flower-data.js`

**Interfaces:**
- Consumes: `window.GUILD_FLOWER_DATA`
- Produces: browser UI with member cards, flower cards, search, view switching, and data issue summaries.

- [ ] Create `index.html` that loads `assets/guild-flower-data.js`.
- [ ] Render stats, search input, member view, flower view, and issue summary.
- [ ] Implement browser-side filtering for member name and flower name.
- [ ] Use responsive CSS so desktop and mobile both show useful thumbnails without text overlap.
- [ ] Open the page through a local static server and verify it renders.

### Task 3: Documentation and Verification

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: simple user instructions for editing data, regenerating, local viewing, and GitHub Pages publishing.

- [ ] Write `README.md` with update and publish instructions.
- [ ] Run `node --test tests/generate-data.test.mjs`.
- [ ] Run `node scripts/generate-data.mjs`.
- [ ] Verify `index.html` references only local files.
