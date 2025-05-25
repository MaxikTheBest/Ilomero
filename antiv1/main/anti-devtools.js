(function () {
  let isDevtoolsOpen = false;
  let overlay = null;
  let freezeInterval = null;

  // Display overlay to "pause" the UI
  function createOverlay() {
    if (!overlay) {
      overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: '#0f0',
        fontSize: '1.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        zIndex: 999999,
        pointerEvents: 'all'
      });
      overlay.textContent = '⚠ Protected by AntiV1 — DevTools detected. Console frozen.';
      document.body.appendChild(overlay);
    }
  }

  function removeOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  // Disable console methods
  function lockConsole() {
    const block = () => {
      console.clear();
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
      Object.defineProperty(window, 'console', {
        get() {
          throw new Error('Console access is disabled.');
        },
        configurable: false
      });
    };
    try {
      block();
    } catch (_) {}
  }

  // Stop Ctrl+C in DevTools
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      e.stopPropagation();
      alert('Copying from console is disabled.');
    }
  });

  // DevTools detection using debugger trap
  function detectDevTools() {
    const devtools = /./;
    devtools.toString = function () {
      isDevtoolsOpen = true;
      triggerDefense();
      return 'Protected by AntiV1';
    };
    console.log('%c', devtools);
  }

  // Secondary detection: window dimensions
  function checkSize() {
    const threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      isDevtoolsOpen = true;
      triggerDefense();
    } else {
      isDevtoolsOpen = false;
      restoreState();
    }
  }

  // Freeze execution using an infinite debugger loop (hardcore)
  function hardFreeze() {
    function blockLoop() {
      if (isDevtoolsOpen) {
        debugger; // This will annoyingly trap most users in DevTools
        setTimeout(blockLoop, 100);
      }
    }
    blockLoop();
  }

  // Activate all defenses
  function triggerDefense() {
    if (isDevtoolsOpen) {
      createOverlay();
      lockConsole();
      if (!freezeInterval) {
        freezeInterval = setInterval(() => {
          console.clear();
        }, 200);
      }
      hardFreeze();
    }
  }

  function restoreState() {
    removeOverlay();
    if (freezeInterval) {
      clearInterval(freezeInterval);
      freezeInterval = null;
    }
  }

  // Context menu and key shortcut blocking
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Monitor mutations for injected scripts
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.tagName && ['SCRIPT', 'IFRAME'].includes(node.tagName)) {
          node.remove();
          alert('⚠ Script injection attempt blocked.');
        }
      });
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Activate all checks
  setInterval(() => {
    detectDevTools();
    checkSize();
  }, 1000);
})();
