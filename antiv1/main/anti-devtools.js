(function() {
  const BLOCKED_SHORTCUTS = [
    { key: 'F12' },
    { ctrlKey: true, shiftKey: true, key: 'I' },
    { ctrlKey: true, shiftKey: true, key: 'J' },
    { ctrlKey: true, key: 'U' },
    { ctrlKey: true, key: 'S' },
    { ctrlKey: true, key: 'C' }
  ];

  function showWarningOverlay() {
    if (document.getElementById('anti-debug-overlay')) return;
    const div = document.createElement('div');
    div.id = 'anti-debug-overlay';
    div.innerText = '⚠️ AntiV1: Detected Debugger. Please disable inspect element!';
    Object.assign(div.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      backgroundColor: '#00ff00',
      color: '#000',
      fontSize: '18px',
      fontWeight: 'bold',
      padding: '10px',
      zIndex: '999999',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(div);
  }

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

  function detectDebuggerLoop() {
    const interval = setInterval(() => {
      const start = performance.now();
      debugger;
      const duration = performance.now() - start;
      if (duration > 100) {
        showWarningOverlay();
        debugger;
        clearInterval(interval);
        pauseExecution();
      }
    }, 1000);
  }

  function pauseExecution() {
    setInterval(() => {}, 1e7);
  }

  function preventScriptInjection() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'SCRIPT') {
            console.warn('AntiV1: Script injection attempt blocked!');
            node.type = 'javascript/blocked';
            node.parentNode && node.parentNode.removeChild(node);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function blockContextMenu(e) {
    e.preventDefault();
  }

  window.addEventListener('keydown', blockShortcuts);
  window.addEventListener('contextmenu', blockContextMenu);
  preventScriptInjection();
  detectDebuggerLoop();
})();
