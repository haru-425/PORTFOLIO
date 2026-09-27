document.addEventListener('DOMContentLoaded', () => {
  // すでに同意済みなら処理しない（HTMLの生成自体を行わない）
  if (localStorage.getItem('cookie_banner_accepted') === 'true') {
    return;
  }

  // バナーのHTML構造を作成
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="banner-inner">
      <p class="banner-text">
        当サイトでは、アクセス解析とサービス向上のために Google アナリティクス（Cookie）を使用しています。
      </p>
      <button type="button" id="cookie-accept-btn" class="banner-btn">了解して閉じる</button>
    </div>
  `;

  // body の末尾に追加
  document.body.appendChild(banner);

  // 閉じるボタンのイベント設定
  const acceptBtn = document.getElementById('cookie-accept-btn');
  acceptBtn.addEventListener('click', () => {
    banner.classList.add('is-hidden');
    localStorage.setItem('cookie_banner_accepted', 'true');
  });
});