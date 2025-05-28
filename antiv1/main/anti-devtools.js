(function () {
  const BLOCKED_SHORTCUTS = [
    { key: 'F12' },
    { ctrlKey: true, shiftKey: true, key: 'I' },
    { ctrlKey: true, shiftKey: true, key: 'J' },
    { ctrlKey: true, shiftKey: true, key: 'C' },
    { ctrlKey: true, key: 'U' },
    { ctrlKey: true, key: 'S' }
  ];

  function blockShortcuts(e) {
    for (const combo of BLOCKED_SHORTCUTS) {
      let match = true;
      for (const prop in combo) {
        if (e[prop] !== combo[prop]) {
          match = false;
          break;
        }
      }
      if (match) {
        e.preventDefault();
        return false;
      }
    }
  }

  function blockContextMenu(e) {
    e.preventDefault();
  }

  function preventScriptInjection() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'SCRIPT') {
            console.warn('[AntiV1] Script injection attempt blocked!');
            node.type = 'javascript/blocked';
            node.remove();
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function blockConsoleTampering() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalDir = console.dir;

    Object.defineProperty(console, 'log', {
      get: () => function () {
        showConsoleWarning();
        return originalLog.apply(console, arguments);
      }
    });

    Object.defineProperty(console, 'warn', {
      get: () => function () {
        showConsoleWarning();
        return originalWarn.apply(console, arguments);
      }
    });

    Object.defineProperty(console, 'dir', {
      get: () => function () {
        showConsoleWarning();
        return originalDir.apply(console, arguments);
      }
    });
  }

  function showFullScreenWarning() {
    if (document.getElementById('anti-debug-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'anti-debug-overlay';
    overlay.innerText = '⚠️ AntiV1: Detected Debugger. Please disable inspect element!';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#00ff00',
      color: '#000',
      fontSize: '24px',
      fontWeight: 'bold',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '999999',
      textAlign: 'center'
    });
    document.body.appendChild(overlay);

    // Make page unclickable
    document.body.style.pointerEvents = 'none';
  }

  function showConsoleWarning() {
    console.clear();
    console.log('%c⚠️ AntiV1 Warning:', 'color: green; font-size: 20px; font-weight: bold;');
    console.log('%cDebugger detected! Please disable inspect element!', 'color: green; font-size: 16px;');
  }

  function loopDebuggerIfOpen() {
    let isDetected = false;
    const checkDevTools = () => {
      const start = performance.now();
      debugger;
      const time = performance.now() - start;

      if (time > 100) {
        if (!isDetected) {
          isDetected = true;
          showFullScreenWarning();
          showConsoleWarning();
        }
        // Freeze the browser
        loopDebugger();
      } else {
        isDetected = false;
      }
    };
    setInterval(checkDevTools, 1000);
  }

  function loopDebugger() {
    const hang = () => {
      setTimeout(() => {
        debugger;
        hang();
      }, 100);
    };
    hang();
  }

  function blockDragAndDrop() {
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => {
      e.preventDefault();
      console.warn('[AntiV1] Drag & Drop attempt blocked.');
    });
  }

  // Initialize protections
  window.addEventListener('keydown', blockShortcuts);
  window.addEventListener('contextmenu', blockContextMenu);
  preventScriptInjection();
  blockDragAndDrop();
  blockConsoleTampering();
  loopDebuggerIfOpen();
})();
