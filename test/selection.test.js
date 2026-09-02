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
    [[10, 20], [30, 40]],
    [[30, 20], [10, 40]],
    [[10, 40], [30, 20]],
    [[30, 40], [10, 20]],
  ]) {
    assert.deepEqual(selectionRect(...start, ...end), expected);
  }
});

test("rectanglesOverlap excludes rectangles that only touch", () => {
  const selection = { left: 10, top: 10, right: 20, bottom: 20 };
  assert.equal(
    rectanglesOverlap({ left: 15, top: 15, right: 25, bottom: 25 }, selection),
    true,
  );
  assert.equal(
    rectanglesOverlap({ left: 20, top: 10, right: 30, bottom: 20 }, selection),
    false,
  );
});

test("isDownloadableUrl is case-insensitive and ignores query parameters", () => {
  assert.equal(isDownloadableUrl("https://example.test/file.PDF?download=1"), true);
  assert.equal(isDownloadableUrl("https://example.test/file.txt"), false);
  assert.equal(isDownloadableUrl("not a URL"), false);
});

test("filterDownloadableLinks keeps only overlapping downloadable links", () => {
  const selection = { left: 0, top: 0, right: 20, bottom: 20 };
  const links = [
    {
      href: "https://example.test/a.pdf",
      rect: { left: 5, top: 5, right: 10, bottom: 10 },
    },
    {
      href: "https://example.test/b.zip",
      rect: { left: 20, top: 5, right: 30, bottom: 10 },
    },
    {
      href: "https://example.test/c.txt",
      rect: { left: 5, top: 5, right: 10, bottom: 10 },
    },
  ];
  assert.deepEqual(filterDownloadableLinks(links, selection), [links[0]]);
});
