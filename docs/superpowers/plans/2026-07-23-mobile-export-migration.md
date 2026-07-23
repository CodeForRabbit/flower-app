# Mobile Export Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the static guild flower site into `/Users/kankaliu/Desktop/1`, add missing-image visibility, add a mobile-first PNG export, and keep the page mobile-friendly.

**Architecture:** Keep the existing dependency-free static site. The generator continues to emit `window.GUILD_FLOWER_DATA`; `index.html` renders missing images with a local placeholder and generates an export PNG using browser Canvas.

**Tech Stack:** Plain HTML, CSS, JavaScript, Node.js built-in modules, Node test runner.

## Global Constraints

- Keep `.txt` as the editable data source.
- Preserve `/Users/kankaliu/Desktop/1/.git`.
- Do not add backend services or package dependencies.
- Missing-image flowers must remain visible in `index.html`.
- Export must produce one image containing all members and their owned flowers.
- Mobile browsing is the primary layout target.

---

### Task 1: Missing Image Data and HTML Contract

**Files:**
- Modify: `tests/generate-data.test.mjs`
- Modify: `tests/site.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Consumes: `flower.image: string | null`
- Produces: missing-image placeholder tiles and cards instead of hidden/broken images.

- [ ] Add tests that require missing-image flowers to be preserved and require the HTML to include placeholder/export controls.
- [ ] Run `node --test tests/*.test.mjs` and verify the new test fails.
- [ ] Update `index.html` so missing image flowers render with a visible placeholder.
- [ ] Run `node --test tests/*.test.mjs` and verify tests pass.

### Task 2: Mobile Export PNG

**Files:**
- Modify: `index.html`
- Modify: `tests/site.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Produces: `exportImage()` browser function that downloads `公会鲜花清单.png`.

- [ ] Add static tests for export button and canvas export function.
- [ ] Run tests and verify failure before implementation.
- [ ] Implement mobile-first export using Canvas with text and flower thumbnails.
- [ ] Update README with export and mobile notes.
- [ ] Run tests and data generation.

### Task 3: Migration

**Files:**
- Copy into `/Users/kankaliu/Desktop/1`: `index.html`, `assets/`, `scripts/`, `tests/`, `docs/`, `README.md`, `空白文本.txt`, `鲜花图册/`

**Interfaces:**
- Produces: target git repository containing the complete static site.

- [ ] Copy files without touching `/Users/kankaliu/Desktop/1/.git`.
- [ ] Run tests from `/Users/kankaliu/Desktop/1`.
- [ ] Run data generation from `/Users/kankaliu/Desktop/1`.
- [ ] Check target git status.
