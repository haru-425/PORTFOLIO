document.addEventListener('DOMContentLoaded', () => {
    // 1. スクロール監視（ふわっと演出）
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    initCanvas();
    loadTechLogs();
});

function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
        particles.forEach((p, i) => {
            p.update();
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
            ctx.fill();
            for (let j = i + 1; j < particles.length; j++) {
                const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 242, 255, ${1 - dist / 150})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function loadTechLogs() {
    const logs = [
        { date: "2026/02/06", title: "GitHub Pages公開", content: "ポートフォリオサイトの基盤を構築。Canvas背景を実装。" },
        { date: "2026/01/20", title: "DirectX11学習", content: "レンダリングパイプラインと定数バッファの仕組みを理解。" }
    ];
    const container = document.querySelector('.log-container');
    if (!container) return;
    container.innerHTML = logs.map(l => `
        <div class="log-item" style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
            <small style="color:var(--accent); font-weight:bold;">${l.date}</small>
            <h4 style="margin:5px 0; color:#fff;">${l.title}</h4>
            <p style="margin:0; font-size:0.85rem; color:#bbb;">${l.content}</p>
        </div>
    `).join('');
}