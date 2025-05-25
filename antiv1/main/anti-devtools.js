(function () {
  let isDevtoolsOpen = false;
  let pausedOverlay = null;

  // Utility: Create overlay
  function createOverlay() {
    if (!pausedOverlay) {
      pausedOverlay = document.createElement('div');
      pausedOverlay.style.position = 'fixed';
      pausedOverlay.style.top = 0;
      pausedOverlay.style.left = 0;
      pausedOverlay.style.width = '100vw';
      pausedOverlay.style.height = '100vh';
      pausedOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
      pausedOverlay.style.zIndex = 999999;
      pausedOverlay.style.pointerEvents = 'all';
      pausedOverlay.style.color = '#fff';
      pausedOverlay.style.display = 'flex';
      pausedOverlay.style.alignItems = 'center';
      pausedOverlay.style.justifyContent = 'center';
      pausedOverlay.style.fontSize = '2rem';
      pausedOverlay.style.fontFamily = 'monospace';
      pausedOverlay.innerText = '⚠ Site Paused: DevTools Detected';
      document.body.appendChild(pausedOverlay);
    }
  }

  function removeOverlay() {
    if (pausedOverlay) {
      pausedOverlay.remove();
      pausedOverlay = null;
    }
  }

  // Method 1: Console detection
  const devtoolsWarning = 'Protected by AntiV1, please don’t run scripts!';
  console.warn(devtoolsWarning);

  // Hide future console logs
  console.log = function () {};
  console.warn = function () {};
  console.info = function () {};

  // Method 2: Detect by checking console open via devtools
  let threshold = 160;
  const detectDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    if (widthThreshold || heightThreshold) {
      if (!isDevtoolsOpen) {
        isDevtoolsOpen = true;
        createOverlay();
      }
    } else {
      if (isDevtoolsOpen) {
        isDevtoolsOpen = false;
        removeOverlay();
      }
    }
  };
  setInterval(detectDevTools, 500);

  // Method 3: Using console trick (somewhat hacky)
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function () {
      isDevtoolsOpen = true;
      createOverlay();
    }
  });
  console.log(element);

  // Method 4: Key prevention
  document.addEventListener('keydown', function (e) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      e.stopPropagation();
      alert('DevTools shortcut is blocked!');
    }
  });

  // Method 5: Right-click prevention
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    alert('Right-click is disabled on this page.');
  });

  // Method 6: Drag & paste prevention (script injection)
  window.addEventListener('dragover', function (e) {
    e.preventDefault();
  }, false);
  window.addEventListener('drop', function (e) {
    e.preventDefault();
  }, false);
  window.addEventListener('paste', function (e) {
    const clipboard = (e.clipboardData || window.clipboardData).getData('text');
    if (/script|<|>|\(|\)|=|javascript:/gi.test(clipboard)) {
      alert('Script paste is blocked!');
      e.preventDefault();
    }
  });

  // Method 7: Mutation observer (watch for injection attempts)
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        m.addedNodes.forEach(node => {
          if (
            node.tagName &&
            (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME')
          ) {
            node.remove();
            alert('Injection attempt blocked!');
          }
        });
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

})();
