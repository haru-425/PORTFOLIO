(() => {
  if (typeof HTMLDialogElement === 'undefined') return;
  const links = [...document.querySelectorAll('a[href]')].filter(link =>
    link.querySelector('img') && /\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(link.getAttribute('href'))
  );
  if (!links.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', '画像の拡大表示');
  dialog.setAttribute('aria-describedby', 'image-viewer-hint');
  dialog.innerHTML = `
    <button class="image-viewer-close" type="button" aria-label="拡大画像を閉じる" autofocus>×</button>
    <div class="image-viewer-image"><img alt=""></div>
    <p id="image-viewer-hint" class="image-viewer-hint" aria-live="polite">クリックで閉じる</p>`;
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const hint = dialog.querySelector('.image-viewer-hint');
  let opener;
  let previousOverflow;

  links.forEach(link => {
    link.removeAttribute('target');
    link.classList.add('image-viewer-trigger');
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      hint.textContent = 'クリックで閉じる';
      image.alt = link.querySelector('img').alt;
      image.src = link.href;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });

  // A single click anywhere, including the image, returns to the article.
  dialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
  });
  image.addEventListener('error', () => {
    hint.textContent = '画像を読み込めませんでした。クリックで閉じる';
  });
})();
