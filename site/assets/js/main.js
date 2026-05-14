/* ============================================
   ROB'S PLUMBING — Main JS
   ============================================ */

// ---- Nav scroll effect (home page only — others are always scrolled) ----
const nav = document.getElementById('main-nav');
if (nav && !nav.classList.contains('scrolled')) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---- Mobile menu ----
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.add('open');
});
document.getElementById('mobile-close')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.remove('open');
});
document.getElementById('mobile-menu')?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('mobile-menu')?.classList.remove('open'));
});

// ---- Toast helper ----
function showToast(msg, type = 'default') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
window.showToast = showToast;

// ---- Lightbox ----
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
document.getElementById('lightbox-close')?.addEventListener('click', () => lightbox?.classList.remove('open'));
lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox?.classList.remove('open'); });

function initGalleryLightbox() {
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      if (!lightboxImg || !lightbox) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });
}

// ---- Open chat (called by Book buttons) ----
function openChat() {
  const toggle = document.getElementById('chat-toggle');
  const win    = document.getElementById('chat-window');
  if (win && !win.classList.contains('open')) toggle?.click();
}
window.openChat = openChat;

// ---- Render: Service Cards ----
function renderServiceCards(services, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = services.map(s => `
    <div class="service-card">
      <div class="service-card__icon">${s.icon}</div>
      <div class="service-card__name">${s.name}</div>
      <p>${s.description}</p>
      <div class="service-card__price">${s.startingFrom} &nbsp;·&nbsp; ${s.duration}</div>
    </div>
  `).join('');
}

// ---- Render: Pricing List ----
function renderPricing(data, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = data.categories.map(cat => `
    <div class="pricing-category">
      <div class="pricing-category__header">
        <span class="pricing-category__title">${cat.name}</span>
      </div>
      ${cat.items.map(item => `
        <div class="pricing-item">
          <div class="pricing-item__left">
            <div class="pricing-item__name">${item.name}</div>
            ${item.description ? `<div class="pricing-item__desc">${item.description}</div>` : ''}
          </div>
          <div class="pricing-item__price">${item.price}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ---- Render: Barber preview cards (home) ----
function renderBarberPreview(team, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = team.slice(0, 4).map(m => `
    <div class="barber-card">
      <div class="barber-card__photo">
        ${hasPhoto(m.photo)
          ? `<img src="${m.photo}" alt="${m.name}" loading="lazy" /><div class="barber-card__photo-overlay"></div>`
          : `<div class="barber-card__placeholder">${m.initials}</div>`}
      </div>
      <div class="barber-card__info">
        <div class="barber-card__name">${m.name}</div>
        <div class="barber-card__role">${m.role}</div>
        ${m.tagline ? `<div class="barber-card__tagline">${m.tagline}</div>` : ''}
        <div class="barber-card__tags" style="margin-top:0.75rem;">
          ${m.specialties.map(s => `<span class="tag">${s}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// ---- Render: Full barber list (barbers page) ----
function renderBarbersFull(team, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = team.map((m, i) => `
    <div class="barber-full-card">
      <div class="barber-full-card__photo">
        ${hasPhoto(m.photo)
          ? `<img src="${m.photo}" alt="${m.name}" loading="lazy" />`
          : `<div class="barber-full-card__photo-placeholder">${m.initials}</div>`}
      </div>
      <div class="barber-full-card__body">
        <div class="barber-full-card__num">0${i + 1}</div>
        <div class="barber-full-card__name">${m.name}</div>
        <div class="barber-full-card__role">${m.role} &nbsp;·&nbsp; ${m.experience} Experience</div>
        ${m.tagline ? `<div class="barber-full-card__tagline">"${m.tagline}"</div>` : ''}
        <p class="barber-full-card__bio">${m.bio}</p>
        <div class="barber-full-card__specialties">
          <div class="barber-full-card__specialties-label">Specialties</div>
          <div class="barber-card__tags">
            ${m.specialties.map(s => `<span class="tag">${s}</span>`).join('')}
          </div>
        </div>
        <div style="margin-top:1.25rem;">
          <button class="btn btn-outline" onclick="openChat()" style="font-size:0.68rem; padding:0.65rem 1.5rem;">
            Book with ${m.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ---- Helper: check if photo file is expected to exist ----
function hasPhoto(path) {
  if (!path) return false;
  // Only treat as having a photo if it's one of the known uploaded files
  const known = ['Rob.jpg'];
  return known.some(f => path.includes(f));
}

// ============================================================
// Embedded data — works with file:// and HTTP both
// Edit here to update services/pricing across all pages
// ============================================================

const SERVICES_DATA = [
  { id:'emergency', name:'Emergency Plumbing',      icon:'🚨',  description:'24/7 emergency response for burst pipes, severe leaks, and flooding. We\'re there when you need us most.',    startingFrom:'From $150', duration:'1–3 hrs' },
  { id:'leak',      name:'Leak Detection & Repair', icon:'💧',  description:'Find and fix hidden leaks fast — walls, ceilings, slabs, or underground. Minimise damage before it spreads.',  startingFrom:'From $90',  duration:'1–2 hrs' },
  { id:'drain',     name:'Drain Cleaning',           icon:'🌀',  description:'Unblock slow or fully blocked drains with professional-grade equipment. Kitchen, bathroom, or main sewer lines.', startingFrom:'From $100', duration:'1–2 hrs' },
  { id:'hotwater',  name:'Hot Water Systems',        icon:'🔥',  description:'Installation, repair, and replacement of electric, gas, and heat pump hot water systems. All major brands.',    startingFrom:'From $120', duration:'1–4 hrs' },
  { id:'bathroom',  name:'Bathroom & Kitchen',       icon:'🚿',  description:'Tap replacements, toilet installs, shower upgrades, and full bathroom fit-outs completed to a high standard.',   startingFrom:'From $95',  duration:'1–3 hrs' },
  { id:'pipes',     name:'Pipe Repair & Repiping',  icon:'🔧',  description:'From single pipe repairs to full repiping of your home. Copper, PEX, and PVC — installed to Australian standards.', startingFrom:'From $100', duration:'2–6 hrs' },
];

const PRICING_DATA = {
  categories: [
    { name: 'Emergency & Call-Out', items: [
      { name:'After-Hours Emergency Call-Out', price:'$150–$250', description:'Nights, weekends & public holidays.' },
      { name:'Standard Call-Out Fee',          price:'$90',       description:'Business hours, Mon–Fri.' },
      { name:'Urgent Same-Day Service',        price:'$120',      description:'Priority booking during business hours.' },
    ]},
    { name: 'Leak Detection & Repair', items: [
      { name:'Leak Detection (Thermal/Acoustic)', price:'$150–$300', description:'Non-invasive precision leak location.' },
      { name:'Minor Tap / Fitting Leak Repair',   price:'$90–$150',  description:'Washer, O-ring, or fitting replacement.' },
      { name:'Pipe Leak Repair',                  price:'$150–$400', description:'Depends on access and pipe material.' },
      { name:'Flexi Hose Replacement',            price:'$90–$150',  description:'Urgent safety replacement — all under sinks.' },
    ]},
    { name: 'Drain Cleaning', items: [
      { name:'Blocked Sink / Basin / Shower', price:'$100–$180', description:'Hand or machine clearing.' },
      { name:'Blocked Toilet',               price:'$120–$200', description:'Includes plunger and snake clearing.' },
      { name:'CCTV Drain Inspection',        price:'$200–$350', description:'Camera inspection with full report.' },
      { name:'High-Pressure Water Jetting',  price:'$250–$500', description:'Root and debris clearing, deep clean.' },
    ]},
    { name: 'Hot Water Systems', items: [
      { name:'Hot Water Service & Repair',       price:'$90–$200',     description:'Diagnosis and parts replacement.' },
      { name:'Electric HWS Installation (std)',  price:'$800–$1,200',  description:'Supply and install, standard location.' },
      { name:'Gas HWS Installation',             price:'$900–$1,400',  description:'Includes gas line connection.' },
      { name:'Heat Pump HWS Installation',       price:'$1,800–$3,500',description:'Energy-efficient supply & install.' },
    ]},
    { name: 'Bathroom & Kitchen', items: [
      { name:'Tap / Mixer Replacement',  price:'$120–$250',   description:'Supply and install, per tap.' },
      { name:'Toilet Suite Installation',price:'$250–$450',   description:'Supply and install new toilet suite.' },
      { name:'Shower Head / Diverter',   price:'$90–$200',    description:'Replace or upgrade shower fittings.' },
      { name:'Full Bathroom Fit-Out',    price:'From $2,500', description:'Quote provided after on-site inspection.' },
    ]},
    { name: 'Pipes & General Plumbing', items: [
      { name:'Pipe Repair (Minor)',          price:'$120–$300', description:'Single section repair or patch.' },
      { name:'Repiping (per metre)',         price:'$80–$150',  description:'Copper or PEX supply line replacement.' },
      { name:'Water Meter Inspection',       price:'$90–$180',  description:'Identify if meter is running unexpectedly.' },
      { name:'General Labour Rate',          price:'$95/hr',    description:'For jobs not listed — minimum 1 hour.' },
    ]},
  ]
};

const TEAM_DATA = [
  {
    id: 'rob',
    name: 'Rob',
    role: 'Master Plumber & Owner',
    tagline: 'Reliable. Honest. Done Right.',
    bio: 'Rob is a licensed master plumber with over 15 years of hands-on experience in residential plumbing across the region. Known for clear communication, upfront pricing, and getting the job done right the first time — no call-backs, no surprises. When Rob shows up, the problem gets fixed.',
    photo: 'assets/images/team/Rob.jpg',
    initials: 'RP',
    specialties: ['Emergency Plumbing', 'Leak Detection', 'Drain Cleaning', 'Hot Water Systems'],
    experience: '15 Years'
  },
];

// ---- Page init ----
function init() {
  renderServiceCards(SERVICES_DATA, 'services-preview');
  renderServiceCards(SERVICES_DATA, 'services-full');
  renderPricing(PRICING_DATA,       'pricing-full');
  renderBarberPreview(TEAM_DATA,    'barbers-preview');
  initGalleryLightbox();
}

init();
