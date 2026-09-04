// Same noise-drawing technique as script.js's showStatic(), just
// looping forever instead of a brief channel-change burst.
// Externalised (was inline) so the strict CSP script-src 'self' allows it.
(() => {
  const canvas = document.getElementById('tv-static');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 225;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const drawFrame = () => {
    const imgData = ctx.createImageData(400, 225);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.random() * 255;
      imgData.data[i] = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  };

  if (reduceMotion) {
    drawFrame();
  } else {
    const loop = () => { drawFrame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  const backBtn = document.querySelector('.error-screen__back');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/';
    });
  }
})();
