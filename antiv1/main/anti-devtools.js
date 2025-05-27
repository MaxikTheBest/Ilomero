(function () {
  let isDevtoolsOpen = false;
  let overlay = null;
  let freezeActive = false;

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

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      e.stopPropagation();
      alert('Copying from console is disabled.');
    }
  });

  function hardFreeze() {
    if (freezeActive) return;
    freezeActive = true;
    function freeze() {
      if (!isDevtoolsOpen) return;
      try {
        debugger;
        setTimeout(freeze, 50);
      } catch (e) {
        while (true) {}
      }
    }
    freeze();
  }

  function detectDevTools() {
    const devtools = /./;
    devtools.toString = function () {
      isDevtoolsOpen = true;
      triggerDefense();
      return 'Protected by AntiV1';
    };
    console.log('%c', devtools);
  }

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

  function triggerDefense() {
    if (isDevtoolsOpen) {
      createOverlay();
      lockConsole();
      hardFreeze();
    }
  }

  function restoreState() {
    removeOverlay();
    freezeActive = false;
  }

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

  setInterval(() => {
    detectDevTools();
    checkSize();
  }, 1000);
})();
