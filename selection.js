(function (root) {
  const DOWNLOADABLE_EXTENSIONS = [
    ".gif",
    ".pdf",
    ".ppt",
    ".pptx",
    ".jpg",
    ".jpeg",
    ".png",
    ".zip",
    ".mp4",
    ".mp3",
    ".svg",
    ".webp",
  ];

  function selectionRect(startX, startY, endX, endY) {
    return {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      right: Math.max(startX, endX),
      bottom: Math.max(startY, endY),
    };
  }

  function rectanglesOverlap(first, second) {
    return (
      first.left < second.right &&
      first.right > second.left &&
      first.top < second.bottom &&
      first.bottom > second.top
    );
  }

  function isDownloadableUrl(href) {
    try {
      const pathname = new URL(href).pathname.toLowerCase();
      return DOWNLOADABLE_EXTENSIONS.some((extension) =>
        pathname.endsWith(extension),
      );
    } catch {
      return false;
    }
  }

  function filterDownloadableLinks(links, selection) {
    return links.filter(
      (link) =>
        isDownloadableUrl(link.href) && rectanglesOverlap(link.rect, selection),
    );
  }

  const api = {
    DOWNLOADABLE_EXTENSIONS,
    filterDownloadableLinks,
    isDownloadableUrl,
    rectanglesOverlap,
    selectionRect,
  };

  root.GrabAtOnceSelection = api;

  if (typeof module !== "undefined") {
    module.exports = api;
  }
})(globalThis);
