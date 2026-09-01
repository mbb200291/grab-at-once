const ENABLED_ICON_PATH = {
  16: "/images/grab_16.png",
  32: "/images/grab_32.png",
  64: "/images/grab_64.png",
  128: "/images/grab_128.png",
  256: "/images/grab_256.png",
  512: "/images/grab_512.png",
};

const DISABLED_ICON_PATH = {
  16: "/images/grab_wb_16.png",
  32: "/images/grab_wb_32.png",
  64: "/images/grab_wb_64.png",
  128: "/images/grab_wb_128.png",
  256: "/images/grab_wb_256.png",
  512: "/images/grab_wb_512.png",
};

async function syncActionUi(enabled) {
  await chrome.action.setIcon({
    path: enabled ? ENABLED_ICON_PATH : DISABLED_ICON_PATH,
  });
  await chrome.action.setBadgeBackgroundColor({ color: "#0ea5e9" });
  await chrome.action.setBadgeText({ text: enabled ? "ON" : "" });
  await chrome.action.setTitle({
    title: enabled ? "Grab at Once! (Enabled)" : "Grab at Once! (Disabled)",
  });
}

async function getEnabledState() {
  const { gao = false } = await chrome.storage.local.get({ gao: false });
  return Boolean(gao);
}

async function setEnabledState(enabled) {
  await chrome.storage.local.set({ gao: enabled });
  await syncActionUi(enabled);
}

async function initializeState() {
  const enabled = await getEnabledState();
  await syncActionUi(enabled);
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Grab at Once installed");
  const { gao } = await chrome.storage.local.get("gao");
  if (typeof gao === "undefined") {
    await chrome.storage.local.set({ gao: false });
  }
  await initializeState();
});

chrome.runtime.onStartup.addListener(async () => {
  await initializeState();
});

chrome.action.onClicked.addListener(async (tab) => {
  const current = await getEnabledState();
  const next = !current;
  await setEnabledState(next);

  if (!tab?.id) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["dragbox.js"],
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (enabled) => {
      if (typeof window.__grabatonce_setEnabled === "function") {
        window.__grabatonce_setEnabled(enabled);
      }
    },
    args: [next],
  });
});
