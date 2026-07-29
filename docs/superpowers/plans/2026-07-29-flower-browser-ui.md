# Flower Browser UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the flower-first mobile view attractive, prevent owner-tag overflow, and provide persistent card and compact display modes.

**Architecture:** Keep the existing single-file static site. Add a small presentation-mode field to page state, a two-button display-mode selector, and a class on the flower grid. CSS owns each mode's layout and protects flexible content with wrapping and `min-width: 0`.

**Tech Stack:** HTML, CSS, browser JavaScript, Node.js built-in test runner.

## Global Constraints

- Initial browse view is `flowers`.
- Display modes are `card` and `compact`; the selection is stored in browser local storage.
- Owner chips wrap inside their visual container on mobile and desktop.
- Existing text-file loading, missing-image notices, member browse view, search, and image export remain unchanged.
- No external libraries or remote assets.

---

### Task 1: Lock in Browse and Display-Mode Behavior

**Files:**
- Modify: `tests/site.test.mjs:43-50`
- Modify: `index.html:391-435`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: static markup and inline JavaScript from `index.html`.
- Produces: regression coverage that expects `state.view` to start as `flowers`, an accessible display-mode selector, `state.displayMode`, and storage-backed `setDisplayMode(mode)`.

- [ ] **Step 1: Write the failing test**

```js
test('index.html starts with flowers and provides persistent card and compact modes', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /view: 'flowers'/);
  assert.match(html, /id="display-mode"/);
  assert.match(html, /data-display-mode="card"/);
  assert.match(html, /data-display-mode="compact"/);
  assert.match(html, /displayMode:/);
  assert.match(html, /function setDisplayMode\(mode\)/);
  assert.match(html, /localStorage\.getItem\(DISPLAY_MODE_STORAGE_KEY\)/);
  assert.match(html, /localStorage\.setItem\(DISPLAY_MODE_STORAGE_KEY, mode\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/site.test.mjs`

Expected: FAIL because the current state starts at `members` and no display-mode selector or storage functions exist.

- [ ] **Step 3: Write minimal implementation**

In `index.html`, switch the selected tab and active view markup to flowers. Add a `#display-mode` `role="group"` with `data-display-mode="card"` and `data-display-mode="compact"` buttons. Add `DISPLAY_MODE_STORAGE_KEY`, initialize `state.displayMode` from local storage with `card` as fallback, and define `setDisplayMode(mode)` to accept only the two supported values, update button state and the flower-grid class, then persist the selection.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/site.test.mjs`

Expected: PASS, including the new display-mode test.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/site.test.mjs
git commit -m "feat: add flower display modes"
```

### Task 2: Make Owner Tags and Both Flower Modes Responsive

**Files:**
- Modify: `tests/site.test.mjs:43-50`
- Modify: `index.html:193-317`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `setDisplayMode(mode)` and the `#flowers-grid` class set by Task 1.
- Produces: `.flower-grid--card` and `.flower-grid--compact` CSS layouts plus overflow-safe `.owners` and `.owner` styles.

- [ ] **Step 1: Write the failing test**

```js
test('flower layouts wrap owner tags without overflowing their cards', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /\.flower-grid--card/);
  assert.match(html, /\.flower-grid--compact/);
  assert.match(html, /\.owners\s*\{[\s\S]*flex-wrap: wrap/);
  assert.match(html, /\.owner\s*\{[\s\S]*overflow-wrap: anywhere/);
  assert.match(html, /\.flower-body\s*\{[\s\S]*min-width: 0/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/site.test.mjs`

Expected: FAIL because neither flower-grid mode class exists and owner chips do not explicitly wrap long names.

- [ ] **Step 3: Write minimal implementation**

Update the flower grid markup to start with `flower-grid--card`. Make card mode image-led, retaining the current thumbnail scale and calm spacing. Make compact mode a one-column list with a smaller fixed thumbnail and reduced padding. Add `min-width: 0`, `max-width: 100%`, and `overflow-wrap: anywhere` where needed so owner chips wrap within the card without expanding it. Keep card radii at 8px or lower and preserve the existing colors.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/site.test.mjs`

Expected: PASS, including the overflow-guard test.

- [ ] **Step 5: Run the complete verification suite**

Run: `node --test tests/*.test.mjs`

Expected: PASS with no failures.

- [ ] **Step 6: Commit**

```bash
git add index.html tests/site.test.mjs
git commit -m "style: refine mobile flower browsing"
```

