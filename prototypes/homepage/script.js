/* ============================================================
   NAVBAR — scroll opacity
   ============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ============================================================
   MOBILE MENU
   ============================================================ */
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('nav-mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

/* ============================================================
   CHAOS ICONS — physics animation
   ============================================================ */
const CHAOS_ICONS = [
  { emoji: '📝', label: 'Notion' },
  { emoji: '🐙', label: 'GitHub' },
  { emoji: '💬', label: 'Slack' },
  { emoji: '💻', label: 'VS Code' },
  { emoji: '🌐', label: 'Browser Tabs' },
  { emoji: '⬛', label: 'Terminal' },
  { emoji: '📄', label: 'Text File' },
  { emoji: '🔖', label: 'Bookmark' },
];

const arena = document.getElementById('chaos-arena');
const ICON_SIZE = 36;

let arenaW = arena.offsetWidth;
let arenaH = arena.offsetHeight;

const particles = CHAOS_ICONS.map((icon, i) => {
  const el = document.createElement('div');
  el.className = 'chaos-icon';
  el.textContent = icon.emoji;
  el.title = icon.label;
  arena.appendChild(el);

  const angle = (i / CHAOS_ICONS.length) * Math.PI * 2;
  const speed = 0.6 + Math.random() * 0.8;

  return {
    el,
    x: Math.random() * (arenaW - ICON_SIZE),
    y: Math.random() * (arenaH - ICON_SIZE),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: 0,
    rotSpeed: (Math.random() - 0.5) * 1.2,
  };
});

let mouseX = -999;
let mouseY = -999;

arena.addEventListener('mousemove', (e) => {
  const rect = arena.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});
arena.addEventListener('mouseleave', () => {
  mouseX = -999;
  mouseY = -999;
});

function tickChaos() {
  arenaW = arena.offsetWidth;
  arenaH = arena.offsetHeight;

  for (const p of particles) {
    // Mouse repulsion
    const dx = p.x + ICON_SIZE / 2 - mouseX;
    const dy = p.y + ICON_SIZE / 2 - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80 && dist > 0) {
      const force = (80 - dist) / 80 * 2.5;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    // Speed cap
    const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (spd > 2.5) {
      p.vx = (p.vx / spd) * 2.5;
      p.vy = (p.vy / spd) * 2.5;
    }

    // Move
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotSpeed;

    // Bounce off walls
    if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
    if (p.x > arenaW - ICON_SIZE) { p.x = arenaW - ICON_SIZE; p.vx = -Math.abs(p.vx); }
    if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
    if (p.y > arenaH - ICON_SIZE) { p.y = arenaH - ICON_SIZE; p.vy = -Math.abs(p.vy); }

    p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
  }

  requestAnimationFrame(tickChaos);
}
requestAnimationFrame(tickChaos);

/* ============================================================
   SCROLL FADE-IN
   ============================================================ */
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

/* ============================================================
   PRICING TOGGLE
   ============================================================ */
const pricingToggle = document.getElementById('pricing-toggle');
const proPrice = document.getElementById('pro-price');
const proPeriod = document.getElementById('pro-period');
const proSub = document.getElementById('pro-sub');
const labelMonthly = document.getElementById('toggle-label-monthly');
const labelYearly = document.getElementById('toggle-label-yearly');

let isYearly = false;

pricingToggle.addEventListener('click', () => {
  isYearly = !isYearly;
  pricingToggle.setAttribute('aria-checked', String(isYearly));

  if (isYearly) {
    proPrice.textContent = '$72';
    proPeriod.textContent = '/year';
    proSub.textContent = 'Just $6/month — save 25%';
    labelMonthly.classList.remove('active');
    labelYearly.classList.add('active');
  } else {
    proPrice.textContent = '$8';
    proPeriod.textContent = '/month';
    proSub.textContent = ' ';
    labelMonthly.classList.add('active');
    labelYearly.classList.remove('active');
  }
});

/* ============================================================
   FOOTER YEAR
   ============================================================ */
document.getElementById('footer-year').textContent = new Date().getFullYear();
