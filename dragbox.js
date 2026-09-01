(function () {
  if (window.__grabatonce_initialized) {
    chrome.storage.local.get({ gao: false }, ({ gao }) => {
      if (typeof window.__grabatonce_setEnabled === "function") {
        window.__grabatonce_setEnabled(Boolean(gao));
      }
    });
    return;
  }

  window.__grabatonce_initialized = true;

  const DOWNLOADABLE_EXTENSIONS = [
    ".gif", ".pdf", ".ppt", ".pptx", ".jpg", ".jpeg",
    ".png", ".zip", ".mp4", ".mp3", ".svg", ".webp",
  ];

  let enabled = false;
  let startX = 0;
  let startY = 0;
  let currentSelectionDiv = null;

  function clearActiveSelection() {
    if (currentSelectionDiv && currentSelectionDiv.parentNode) {
      currentSelectionDiv.parentNode.removeChild(currentSelectionDiv);
    }
    currentSelectionDiv = null;
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("mouseup", onMouseUp, true);
  }

  function onMouseDown(event) {
    if (!enabled || event.button !== 0) {
      return;
    }

    clearActiveSelection();

    startX = event.pageX;
    startY = event.pageY;

    const selectionDiv = document.createElement("div");
    selectionDiv.className = "tempDiv";
    selectionDiv.style.cssText =
      "border: 1px dashed blue; background: #80ff00; position: absolute; width: 0; height: 0; opacity: 0.1; pointer-events: none; z-index: 2147483647;";
    selectionDiv.style.left = `${startX}px`;
    selectionDiv.style.top = `${startY}px`;
    document.body.appendChild(selectionDiv);
    currentSelectionDiv = selectionDiv;

    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("mouseup", onMouseUp, true);
  }

  function onMouseMove(event) {
    if (!currentSelectionDiv) {
      return;
    }

    currentSelectionDiv.style.left = `${Math.min(event.pageX, startX)}px`;
    currentSelectionDiv.style.top = `${Math.min(event.pageY, startY)}px`;
    currentSelectionDiv.style.width = `${Math.abs(startX - event.pageX)}px`;
    currentSelectionDiv.style.height = `${Math.abs(startY - event.pageY)}px`;
  }

  function onMouseUp(event) {
    const endX = event.pageX;
    const endY = event.pageY;

    clearActiveSelection();

    // top = min Y（靠近頁面頂端），bottom = max Y（靠近頁面底部）
    const dragbox = {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      right: Math.max(startX, endX),
      bottom: Math.max(startY, endY),
    };

    const selected = filter(getDownloadableElements(), dragbox);
    highlightElements(selected);
    downloadBatch(selected);
  }

  function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      right: rect.right + window.scrollX,
      bottom: rect.bottom + window.scrollY,
    };
  }

  function getDownloadableElements() {
    const links = document.querySelectorAll("a[href]");
    return Array.from(links).filter((el) => {
      try {
        const pathname = new URL(el.href).pathname.toLowerCase();
        return DOWNLOADABLE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
      } catch {
        return false;
      }
    });
  }

  // AABB overlap：兩矩形在 x 與 y 軸上皆重疊則判定為命中
  function checkInside(elRect, dragbox) {
    const xOverlap = elRect.left < dragbox.right && elRect.right > dragbox.left;
    const yOverlap = elRect.top < dragbox.bottom && elRect.bottom > dragbox.top;
    return xOverlap && yOverlap;
  }

  function filter(downloadableElements, dragbox) {
    const selectedElements = [];
    for (const element of downloadableElements) {
      if (checkInside(getOffset(element), dragbox)) {
        selectedElements.push(element);
      }
    }
    return selectedElements;
  }

  function highlightElements(elements) {
    for (const el of elements) {
      const originalOutline = el.style.outline;
      const originalBackground = el.style.backgroundColor;
      el.style.outline = "2px solid #0ea5e9";
      el.style.backgroundColor = "rgba(14, 165, 233, 0.2)";
      setTimeout(() => {
        el.style.outline = originalOutline;
        el.style.backgroundColor = originalBackground;
      }, 1500);
    }
  }

  function downloadBatch(selectedElements) {
    for (const element of selectedElements) {
      try {
        downloadURI(element.href);
      } catch (err) {
        console.error("[GrabAtOnce] Failed to download:", element.href, err);
      }
    }
  }

  function downloadURI(uri) {
    const link = document.createElement("a");
    try {
      link.download = new URL(uri).pathname.split("/").pop() || "";
    } catch {
      link.download = uri.split("/").pop() || "";
    }
    link.href = uri;
    link.rel = "noopener";
    link.click();
  }

  function setEnabled(nextEnabled) {
    if (enabled === nextEnabled) {
      return;
    }

    enabled = nextEnabled;

    if (enabled) {
      document.addEventListener("mousedown", onMouseDown, true);
      // 若滑鼠在視窗外放開，確保選框能被清除
      window.addEventListener("blur", clearActiveSelection);
      return;
    }

    clearActiveSelection();
    document.removeEventListener("mousedown", onMouseDown, true);
    window.removeEventListener("blur", clearActiveSelection);
  }

  window.__grabatonce_setEnabled = setEnabled;

  chrome.storage.local.get({ gao: false }, ({ gao }) => {
    setEnabled(Boolean(gao));
  });
})();
