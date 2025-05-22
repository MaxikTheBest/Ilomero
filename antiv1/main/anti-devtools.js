(function () {
  const REDIRECT_URL = "https://ilomero.com";
  const lastRefreshKey = "antiRefreshTimestamp";
  const refreshCooldown = 3000;

  // Redirect helper
  const redirect = () => window.location.replace(REDIRECT_URL);

  // 1. Anti-DevTools (debugger + console trap)
  const devtoolsTrap = () => {
    const threshold = 160;
    const start = performance.now();
    debugger;
    const time = performance.now() - start;
    if (time > threshold) redirect();
  };

  const element = new Image();
  Object.defineProperty(element, "id", {
    get: () => redirect(),
  });

  const spamConsole = () => {
    console.log("%c", element);
  };

  // 2. Anti-Right Click & Copy
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("copy", e => {
    e.preventDefault();
    alert("Copying is disabled.");
  });
  document.addEventListener("keydown", e => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key.toUpperCase() === "U") ||
      (e.ctrlKey && e.key.toUpperCase() === "C")
    ) {
      e.preventDefault();
      redirect();
    }
  });

  // 3. Anti-Refresh Spam
  const now = Date.now();
  const last = localStorage.getItem(lastRefreshKey);
  if (last && now - last < refreshCooldown) redirect();
  localStorage.setItem(lastRefreshKey, now);

  // 4. Anti-Fake Click Injection
  document.addEventListener("click", (e) => {
    if (!(e.isTrusted)) redirect();
  });

  // 5. Detect Tab Switching / Focus Loss
  window.addEventListener("blur", () => {
    console.warn("Window lost focus – possible tab switch.");
    // redirect(); // Optional
  });

  // 6. Iframe Prevention
  if (window.top !== window.self) window.top.location = window.self.location;

  // 7. Script Integrity Check (basic)
  const knownScripts = ["anti-total.js"];
  const loadedScripts = Array.from(document.scripts).map(s => s.src);
  knownScripts.forEach(name => {
    if (!loadedScripts.some(src => src.includes(name))) redirect();
  });

  // 8. Suspicious API/Network Call Logger (basic pattern matcher)
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    if (args[0] && typeof args[0] === "string" && /\/api\/(hack|admin|exploit)/i.test(args[0])) {
      console.warn("Suspicious API call detected:", args[0]);
      redirect();
    }
    return originalFetch.apply(this, args);
  };

  // 9. Extension Injection / Unexpected Globals
const suspiciousGlobals = ['_injectedTestFlag', 'injectedTestFunction'];
setInterval(() => {
  const currentGlobals = Object.keys(window);
  const newGlobals = currentGlobals.filter(k => !knownGlobals.includes(k));

  if (newGlobals.length >= 1) {
    console.warn("Injected globals detected:", newGlobals);
    redirect();
  }

  for (const g of suspiciousGlobals) {
    if (window.hasOwnProperty(g)) {
      console.warn(`Suspicious global detected: ${g}`);
      redirect();
    }
  }
}, 500);

  // 10. Disable Drag/Drop
  document.addEventListener("dragstart", e => e.preventDefault());
  document.addEventListener("drop", e => e.preventDefault());

  // DevTools Resize Detection
  window.addEventListener("resize", () => {
    if (
      window.outerHeight - window.innerHeight > 160 ||
      window.outerWidth - window.innerWidth > 160
    ) redirect();
  });

  // Detection Loop
  setInterval(() => {
    spamConsole();
    devtoolsTrap();
  }, 500);
})();
