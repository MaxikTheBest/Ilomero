(function () {
  const REDIRECT_URL = "https://ilomero.com";
  const lastRefreshKey = "antiRefreshTimestamp";
  const refreshCooldown = 3000;

  const redirect = () => window.location.replace(REDIRECT_URL);

  // Store known globals and native functions
  const knownGlobals = Object.keys(window);
  const knownFunctions = {
    fetch: window.fetch,
    consoleLog: console.log,
    setInterval: window.setInterval,
    setTimeout: window.setTimeout,
  };

  // 1. Anti-DevTools Trap
  const devtoolsTrap = () => {
    const threshold = 160;
    const start = performance.now();
    debugger;
    const time = performance.now() - start;
    if (time > threshold) redirect();
  };

  // 2. Image console trap
  const element = new Image();
  Object.defineProperty(element, "id", {
    get: () => redirect(),
  });

  const spamConsole = () => {
    console.log("%c", element);
  };

  // 3. Anti Right-Click, Copy, Keyboard Shortcuts
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("copy", e => {
    e.preventDefault();
    alert("Copying is disabled.");
  });
  document.addEventListener("keydown", e => {
    const key = e.key.toUpperCase();
    if (
      key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) ||
      (e.ctrlKey && ["U", "C"].includes(key))
    ) {
      e.preventDefault();
      redirect();
    }
  });

  // 4. Anti-Refresh Spam
  const now = Date.now();
  const last = localStorage.getItem(lastRefreshKey);
  if (last && now - last < refreshCooldown) redirect();
  localStorage.setItem(lastRefreshKey, now);

  // 5. Anti-Fake Click Injection
  document.addEventListener("click", e => {
    if (!e.isTrusted) redirect();
  });

  // 6. Detect Tab Switching
  window.addEventListener("blur", () => {
    console.warn("Window lost focus – possible tab switch.");
    // redirect(); // Optional
  });

  // 7. Iframe Prevention
  if (window.top !== window.self) window.top.location = window.self.location;

  // 8. Script Integrity Check
  const knownScripts = ["anti-total.js"];
  const loadedScripts = Array.from(document.scripts).map(s => s.src);
  knownScripts.forEach(name => {
    if (!loadedScripts.some(src => src.includes(name))) redirect();
  });

  // 9. Suspicious API Request Detection
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      /\/api\/(hack|admin|exploit)/i.test(args[0])
    ) {
      console.warn("Suspicious API call detected:", args[0]);
      redirect();
    }
    return originalFetch.apply(this, args);
  };

  // 10. Detect Injected Globals
  setInterval(() => {
    const currentGlobals = Object.keys(window);
    const newGlobals = currentGlobals.filter(k => !knownGlobals.includes(k));
    if (newGlobals.length > 3) {
      console.warn("Injected globals detected:", newGlobals);
      redirect();
    }
  }, 2000);

  // 11. Detect Overwritten Native Functions
  setInterval(() => {
    if (
      window.fetch !== knownFunctions.fetch ||
      console.log !== knownFunctions.consoleLog ||
      setInterval !== knownFunctions.setInterval ||
      setTimeout !== knownFunctions.setTimeout
    ) {
      console.warn("Core JS functions have been tampered with.");
      redirect();
    }
  }, 2000);

  // 12. Detect Inline/Injected Scripts
  new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (
          node.tagName === "SCRIPT" &&
          (!node.src || node.textContent.length > 0)
        ) {
          console.warn("Injected or inline script detected.");
          redirect();
        }
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  // 13. Disable Drag and Drop
  document.addEventListener("dragstart", e => e.preventDefault());
  document.addEventListener("drop", e => e.preventDefault());

  // 14. DevTools Resize Detection
  window.addEventListener("resize", () => {
    if (
      window.outerHeight - window.innerHeight > 160 ||
      window.outerWidth - window.innerWidth > 160
    ) redirect();
  });

  // 15. Disable eval and new Function
  window.eval = () => redirect();
  window.Function = function () {
    redirect();
  };

  // 16. DOM Script Tag Injection Detection
  new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (
        mutation.type === "childList" &&
        [...mutation.addedNodes].some(
          node => node.nodeType === 1 && node.tagName === "SCRIPT"
        )
      ) {
        console.warn("Script tag added via DOM.");
        redirect();
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Final Detection Loop
  setInterval(() => {
    spamConsole();
    devtoolsTrap();
  }, 500);
})();
