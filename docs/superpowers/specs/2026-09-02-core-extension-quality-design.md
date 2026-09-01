# Core Extension Quality Design

## Scope

Implement the three selected medium-priority improvements from `docs/plan.md`:

1. Automated tests for link selection in every drag direction and at rectangle boundaries.
2. A focused split of `dragbox.js` into reusable selection and download-link helpers plus a browser-only event/UI layer.
3. A least-privilege review of the extension injection strategy and manifest permissions.

The work does not introduce a build system, package dependency, content-script auto-injection, archive cleanup, or lint/CI tooling.

## Architecture

Create `selection.js` as a browser- and Node-compatible utility module. It owns rectangle normalization, overlap checks, supported-extension matching, and filtering links by their supplied page offsets. `dragbox.js` remains the content-script entry point: it creates and clears the visual selection box, collects DOM link positions, calls `selection.js`, highlights matches, and starts downloads.

`selection.js` exposes its functions through `globalThis.GrabAtOnceSelection` for the content script and `module.exports` for Node's built-in test runner. `manifest.json` loads `selection.js` before `dragbox.js` whenever the toolbar action injects code.

## Behaviour

- A selection rectangle is normalized to `{ left, top, right, bottom }` regardless of drag direction.
- A link matches when its visible rectangle overlaps the selection rectangle. Edges that only touch do not count as an overlap.
- Downloadable links are identified by their URL pathname, case-insensitively, so query parameters do not affect extension matching.
- The existing supported extensions remain unchanged.
- Clicking the toolbar icon injects `selection.js` and then `dragbox.js` only into the active tab. The singleton guard prevents repeat injection from registering duplicate listeners.
- `host_permissions` is removed. `activeTab` supplies the temporary host access granted by the toolbar click, and `scripting` performs the injection.

## Error handling

- Malformed link URLs are ignored during filtering.
- A missing `GrabAtOnceSelection` global causes `dragbox.js` to exit without registering listeners, rather than throwing during page interaction.
- Existing per-download error reporting remains in place.

## Testing

Use the Node built-in test runner (`node --test`) with no dependencies. Unit tests import `selection.js` and cover:

- all four diagonal drag directions;
- overlap, no overlap, and boundary-touch behaviour;
- case-insensitive extension detection;
- URL query parameters and malformed URLs;
- filtering a list of positioned link objects.

Manual Chrome verification remains necessary for toolbar injection, badge updates, and actual browser downloads.

## Acceptance criteria

- `node --test` passes all selection tests.
- `manifest.json` is valid JSON and has no `host_permissions` entry.
- `dragbox.js` delegates selection rules to `selection.js` and retains current selection/download behaviour.
- The three selected plan items are marked complete in `docs/plan.md`.
