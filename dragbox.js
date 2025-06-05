// window.onload = function () {
(function () {
  // alert("Grab at Once!");

  chrome.storage.local.get("gao", function (result) {
    if (result["gao"]) {
      alert("Grab them at once! (v0.1.2)");
      document.onmousedown = dragBoxToDownload;
    } else {
      alert("off");
      document.onmousedown = null;
    }
  });

  function dragBoxToDownload(evtD) {
    let startx = evtD.pageX;
    let starty = evtD.pageY;
    let div = document.createElement("div");
    div.className = "tempDiv";
    div.style.cssText =
      "border: 1px dashed blue; background: #80ff00; position: absolute; width: 0; height: 0; opacity: 0.1; pointer-events: none;";
    div.style.left = startx + "px";
    div.style.top = starty + "px";
    document.body.appendChild(div);

    function cleanup() {
      if (div && div.parentNode) {
        div.parentNode.removeChild(div);
      }
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(evtM) {
      div.style.left = Math.min(evtM.pageX, startx) + "px";
      div.style.top = Math.min(evtM.pageY, starty) + "px";
      div.style.width = Math.abs(startx - evtM.pageX) + "px";
      div.style.height = Math.abs(starty - evtM.pageY) + "px";
    }

    function onMouseUp(evtU) {
      let endx = evtU.pageX;
      let endy = evtU.pageY;

      let dragbox = {
        left: Math.min(startx, endx),
        top: Math.max(starty, endy),
        right: Math.max(startx, endx),
        bottom: Math.min(starty, endy),
      };
      console.log(dragbox);
      cleanup();
      downloadBatch(filter(getDownloadableElements(), dragbox));
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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
    var downloadableElements = document.querySelectorAll(
      'a[href$=".gif"], a[href$=".pdf"], a[href$=".ppt"], a[href$=".jpg"]'
    );
    console.log("downloadable elements >>>", downloadableElements);
    return downloadableElements;
  }

  function checkInside(offset1, offset2) {
    return (
      ((offset1.left > offset2.left && offset1.left < offset2.right) ||
        (offset1.right > offset2.left && offset1.right < offset2.right)) &&
      ((offset1.top > offset2.bottom && offset1.top < offset2.top) ||
        (offset1.bottom > offset2.bottom && offset1.bottom < offset2.top))
    );
  }

  function filter(downloadableElements, dragbox) {
    return Array.from(downloadableElements).filter((e) => {
      const pos = getOffset(e);
      const inside = checkInside(pos, dragbox);
      if (inside) console.log(pos);
      return inside;
    });
  }

  function downloadBatch(selectedElements) {
    for (const e of selectedElements) {
      console.log("download..." + e);
      downloadURI(e.href);
    }
  }

  function downloadURI(uri) {
    let link = document.createElement("a");
    link.download = uri.split("/").pop();
    link.href = uri;
    link.click();
  }
})();
