(function () {
  const redirect = () => {
    window.location.replace("https://ilomero.com");
  };

  // Trap console open using debugger + timing
  const devtoolsTrap = () => {
    const threshold = 160; // ms
    const start = performance.now();
    debugger;
    const time = performance.now() - start;
    if (time > threshold) {
      redirect();
    }
  };

  // Detect object inspection
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: () => {
      redirect();
    }
  });

  const spamConsole = () => {
    console.log('%c', element);
  };

  // Detect window resize (common in docked DevTools)
  window.addEventListener('resize', () => {
    if (
      window.outerHeight - window.innerHeight > 160 ||
      window.outerWidth - window.innerWidth > 160
    ) {
      redirect();
    }
  });

  // Block DevTools hotkeys
  document.addEventListener('keydown', e => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      redirect();
    }
  });

  // Block right-click → Inspect
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Constant detection loop
  const detectLoop = () => {
    spamConsole();
    devtoolsTrap();
  };

  setInterval(detectLoop, 500);
})();
