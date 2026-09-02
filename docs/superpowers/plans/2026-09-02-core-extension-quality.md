# Core Extension Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make link selection testable, keep the content script focused on browser interaction, and remove unnecessary all-sites host access.

**Architecture:** `selection.js` provides pure rectangle and link-matching helpers for both the content script and Node tests. `dragbox.js` consumes those helpers for DOM-specific behaviour. The toolbar action injects the helper before the content script under the existing user-gesture `activeTab` permission.

**Tech Stack:** Manifest V3, plain JavaScript, Node built-in test runner (`node --test`).

---

### Task 1: Add selection helper tests

**Files:**
- Create: `test/selection.test.js`

- [x] **Step 1: Write the failing test**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  filterDownloadableLinks,
  isDownloadableUrl,
  rectanglesOverlap,
  selectionRect,
} = require("../selection.js");

test("selectionRect normalizes every diagonal drag direction", () => {
  const expected = { left: 10, top: 20, right: 30, bottom: 40 };
  for (const [start, end] of [
    [[10, 20], [30, 40]], [[30, 20], [10, 40]],
    [[10, 40], [30, 20]], [[30, 40], [10, 20]],
  ]) assert.deepEqual(selectionRect(...start, ...end), expected);
});

test("rectanglesOverlap excludes rectangles that only touch", () => {
  const selection = { left: 10, top: 10, right: 20, bottom: 20 };
  assert.equal(rectanglesOverlap({ left: 15, top: 15, right: 25, bottom: 25 }, selection), true);
  assert.equal(rectanglesOverlap({ left: 20, top: 10, right: 30, bottom: 20 }, selection), false);
});

test("isDownloadableUrl is case-insensitive and ignores query parameters", () => {
  assert.equal(isDownloadableUrl("https://example.test/file.PDF?download=1"), true);
  assert.equal(isDownloadableUrl("https://example.test/file.txt"), false);
  assert.equal(isDownloadableUrl("not a URL"), false);
});

test("filterDownloadableLinks keeps only overlapping downloadable links", () => {
  const selection = { left: 0, top: 0, right: 20, bottom: 20 };
  const links = [
    { href: "https://example.test/a.pdf", rect: { left: 5, top: 5, right: 10, bottom: 10 } },
    { href: "https://example.test/b.zip", rect: { left: 20, top: 5, right: 30, bottom: 10 } },
    { href: "https://example.test/c.txt", rect: { left: 5, top: 5, right: 10, bottom: 10 } },
  ];
  assert.deepEqual(filterDownloadableLinks(links, selection), [links[0]]);
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `node --test test/selection.test.js`

Expected: failure because `selection.js` does not exist.

- [x] **Step 3: Commit the failing test**

Run: `git add test/selection.test.js && git commit -m "test: cover selection matching"`

### Task 2: Implement the pure selection helpers

**Files:**
- Create: `selection.js`
- Test: `test/selection.test.js`

- [x] **Step 1: Add the minimal helper module**

```js
(function (root) {
  const DOWNLOADABLE_EXTENSIONS = [".gif", ".pdf", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".zip", ".mp4", ".mp3", ".svg", ".webp"];
  const selectionRect = (startX, startY, endX, endY) => ({ left: Math.min(startX, endX), top: Math.min(startY, endY), right: Math.max(startX, endX), bottom: Math.max(startY, endY) });
  const rectanglesOverlap = (first, second) => first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
  const isDownloadableUrl = (href) => { try { const pathname = new URL(href).pathname.toLowerCase(); return DOWNLOADABLE_EXTENSIONS.some((extension) => pathname.endsWith(extension)); } catch { return false; } };
  const filterDownloadableLinks = (links, selection) => links.filter((link) => isDownloadableUrl(link.href) && rectanglesOverlap(link.rect, selection));
  const api = { DOWNLOADABLE_EXTENSIONS, filterDownloadableLinks, isDownloadableUrl, rectanglesOverlap, selectionRect };
  root.GrabAtOnceSelection = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
```

- [x] **Step 2: Run the test to verify it passes**

Run: `node --test test/selection.test.js`

Expected: 4 passing tests.

- [x] **Step 3: Commit the helper module**

Run: `git add selection.js test/selection.test.js && git commit -m "feat: extract selection matching helpers"`

### Task 3: Delegate browser selection to the helper module

**Files:**
- Modify: `dragbox.js`
- Modify: `background.js`
- Test: `test/selection.test.js`

- [x] **Step 1: Replace local selection rules in `dragbox.js`**

Use `globalThis.GrabAtOnceSelection` as the source for `selectionRect` and `filterDownloadableLinks`. Convert each anchor into `{ href, element, rect }`, filter it, then map matches back to `element` before highlight and download. Exit the IIFE if the helper API is unavailable.

- [x] **Step 2: Inject both scripts in order**

Change the `files` passed to `chrome.scripting.executeScript` in `background.js` to `["selection.js", "dragbox.js"]`.

- [x] **Step 3: Run tests and syntax checks**

Run: `node --test test/selection.test.js`

Run: `node --check selection.js && node --check dragbox.js && node --check background.js`

- [x] **Step 4: Commit the browser integration**

Run: `git add background.js dragbox.js selection.js test/selection.test.js && git commit -m "refactor: separate selection logic from DOM handling"`

### Task 4: Remove unnecessary broad host permission

**Files:**
- Modify: `manifest.json`
- Modify: `privacy.html`
- Modify: `docs/plan.md`

- [x] **Step 1: Remove `host_permissions` from `manifest.json`**

Delete the `"host_permissions": ["<all_urls>"],` entry. Retain `activeTab` and `scripting` because a toolbar click grants temporary access to the active tab and initiates script injection.

- [x] **Step 2: Update documentation**

Change `privacy.html` to describe `activeTab / scripting` as temporary access granted by a click, and remove the `<all_urls>` permission entry. Mark the selected three medium-priority items complete in `docs/plan.md`.

- [x] **Step 3: Verify manifest and all tests**

Run: `node --test`

Run: `node -e 'JSON.parse(require("fs").readFileSync("manifest.json", "utf8")); console.log("manifest.json: valid JSON")'`

Run: `git diff --check`

- [x] **Step 4: Commit the permission review**

Run: `git add manifest.json privacy.html docs/plan.md && git commit -m "chore: limit extension host access"`
