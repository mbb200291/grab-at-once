# Development Plan

This document tracks completed work and planned improvements for Grab at Once!.

## Completed features and fixes

- [x] Toggle the extension from its toolbar icon.
- [x] Highlight selected elements.
- [x] Suppress the webpage's original mouse behavior while selecting.
- [x] Keep the selection box aligned while scrolling.
- [x] Remove the selection box after a drag finishes.

## Improvement plan

Last reviewed: 2026-03-17

### High priority

- [x] Use `addEventListener` and `removeEventListener` instead of replacing `document.onmousedown`, `document.onmousemove`, and `document.onmouseup`.
- [x] Replace undeclared variables and accidental globals with `const` or `let`.
- [x] Use `chrome.storage.local` as the source of truth for the enabled state so service worker restarts do not reset it.
- [x] Add a singleton guard to prevent duplicate content-script initialization.
- [x] Replace blocking alerts with non-blocking badge, highlight, or console feedback.

### Medium priority

- [x] Normalize selection-box coordinates and simplify rectangle collision detection.
- [ ] Add tests for selection matching, including every drag direction and boundary cases.
- [x] Expand the supported file extensions and handle URLs containing query parameters.
- [x] Add guards and error handling for DOM access, downloads, and storage operations.
- [ ] Split `dragbox.js` into focused state, selection, DOM, and download modules.
- [ ] Review the `host_permissions` and content-script strategy based on the intended product scope.

### Low priority

- [x] Expand the README with installation, supported formats, limitations, and development instructions.
- [x] Correct the extension description typo (`draging` to `dragging`).
- [ ] Remove unnecessary experiments from `archived/` and standardize the remaining filenames.
- [ ] Add basic project tooling such as ESLint, Prettier, EditorConfig, and CI linting.
- [x] Confirm that `button.css` is unused and remove it.
