(() => {
  const viewer = document.querySelector('[data-slide-viewer]');
  if (!viewer) return;

  const titles = [
    'C++で自作リフレクション', '自己紹介', '目次', 'リフレクションってなに？',
    'なぜ作ろうと思ったか', '実装のアプローチ', 'ビルドパイプラインフロー',
    'パーサーの内部データ構造', '詰まったところ', '実機', 'おまけ',
    'ご清聴ありがとうございました'
  ];
  const image = viewer.querySelector('.slide-image');
  const previous = viewer.querySelector('[data-slide-prev]');
  const next = viewer.querySelector('[data-slide-next]');
  const select = viewer.querySelector('[data-slide-select]');
  const fullscreen = viewer.querySelector('[data-slide-fullscreen]');
  const status = viewer.querySelector('.slide-status');
  let current = 0;
  let loadVersion = 0;
  let touchStart = null;
  const source = index => `resources/slides/reflection/slide-${String(index + 1).padStart(2, '0')}.webp`;

  titles.forEach((title, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1} / ${titles.length} — ${title}`;
    select.append(option);
  });

  function render() {
    select.value = String(current);
    previous.disabled = current === 0;
    next.disabled = current === titles.length - 1;
    status.textContent = `${current + 1} / ${titles.length}　${titles[current]}`;
    if (current + 1 < titles.length) {
      const preload = new Image();
      preload.src = source(current + 1);
    }
  }

  async function show(index) {
    if (index < 0 || index >= titles.length || index === current) return;
    const version = ++loadVersion;
    viewer.setAttribute('aria-busy', 'true');
    status.textContent = `${index + 1}枚目を読み込み中…`;
    const pending = new Image();
    pending.src = source(index);
    try {
      await pending.decode();
      if (version !== loadVersion) return;
      image.src = pending.src;
      image.alt = `${index + 1}枚目：${titles[index]}`;
      current = index;
      render();
    } catch {
      if (version !== loadVersion) return;
      select.value = String(current);
      status.textContent = '画像を読み込めませんでした。もう一度ページを選択してください。';
    } finally {
      if (version === loadVersion) viewer.removeAttribute('aria-busy');
    }
  }

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  select.addEventListener('change', () => show(Number(select.value)));
  viewer.addEventListener('keydown', event => {
    if (event.target.closest('select, input, textarea')) return;
    const destination = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: titles.length - 1 }[event.key];
    if (destination !== undefined) {
      event.preventDefault();
      show(destination);
    }
  });

  // Only horizontal, single-finger gestures change slides; vertical scrolling and pinch zoom remain native.
  viewer.querySelector('.slide-stage').addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  viewer.querySelector('.slide-stage').addEventListener('touchend', event => {
    if (!touchStart || event.touches.length) { touchStart = null; return; }
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  viewer.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

  function isExpanded() {
    return document.fullscreenElement === viewer || viewer.classList.contains('is-expanded');
  }

  function syncFullscreen() {
    const expanded = isExpanded();
    fullscreen.textContent = expanded ? '全画面を閉じる' : '全画面表示';
    fullscreen.setAttribute('aria-pressed', String(expanded));
  }

  function closeFallback() {
    viewer.classList.remove('is-expanded');
    document.body.classList.remove('slide-viewer-open');
    syncFullscreen();
    fullscreen.focus();
  }

  fullscreen.addEventListener('click', async () => {
    if (viewer.classList.contains('is-expanded')) { closeFallback(); return; }
    if (document.fullscreenElement === viewer) {
      await document.exitFullscreen();
      return;
    }
    try {
      if (!viewer.requestFullscreen) throw new Error('Fullscreen unavailable');
      await viewer.requestFullscreen();
    } catch {
      viewer.classList.add('is-expanded');
      document.body.classList.add('slide-viewer-open');
      viewer.focus();
    }
    syncFullscreen();
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('keydown', event => {
    if (!viewer.classList.contains('is-expanded')) return;
    if (event.key === 'Escape') closeFallback();
    // Keep keyboard focus in the overlay on browsers without the Fullscreen API.
    if (event.key === 'Tab') {
      const controls = [viewer, ...viewer.querySelectorAll('button:not(:disabled), select')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  viewer.querySelector('.slide-controls').hidden = false;
  document.querySelector('.slide-hint').hidden = false;
  render();
})();
