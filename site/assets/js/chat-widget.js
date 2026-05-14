/* ============================================
   ROB'S PLUMBING — AI Chat Widget
   Set CHAT_API_URL to your Azure Function endpoint.
   Until then, local fallback answers handle common questions.
   ============================================ */

const IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const CHAT_API_URL = IS_LOCAL
  ? 'http://localhost:8001/api/chat'
  : 'https://robs-plumbing-agent.kindmushroom-93329cd8.eastus.azurecontainerapps.io/api/chat';

const QUICK_REPLIES = [
  'I have an emergency leak',
  'What services do you offer?',
  'How much for a blocked drain?',
  'What are your hours?',
];

const WELCOME = "Welcome to Rob's Plumbing 🔧\n\nI can help you book a job, answer questions about our services, or give you a rough quote. What can I help with today?";

const FALLBACK = {
  hours:   "Our hours:\n• Mon – Fri: 7am – 5pm\n• Saturday: 8am – 2pm\n• Emergency: 24/7 available\n\nFor an emergency job, call Rob directly!",
  booking: "To book a job or get a quote:\n\n📞 <a href='tel:+10000000000' style='color:var(--gold);font-weight:700;text-decoration:underline;'>(000) 000-0000</a>\n\nOr describe your issue here and we'll get back to you promptly.",
  price:   "Prices depend on the job, but here's a guide:\n• Standard call-out: $90\n• After-hours emergency: $150–$250\n• Blocked drain: $100–$180\n• Leak repair: $90–$400\n• Hot water system install: from $800\n\nFull pricing on our <a href='services.html' style='color:var(--gold);text-decoration:underline;'>services page</a>.",
  location:"We service the local area and surrounds. <a href='contact.html'>See contact details →</a>",
  default: "For urgent plumbing jobs, call Rob directly: <a href='tel:+10000000000' style='color:var(--gold);font-weight:700;'>(000) 000-0000</a>. Or describe your issue here and we'll help!",
};

class ChatWidget {
  constructor() {
    this.toggle   = document.getElementById('chat-toggle');
    this.win      = document.getElementById('chat-window');
    this.closeBtn = document.getElementById('chat-close');
    this.messages = document.getElementById('chat-messages');
    this.input    = document.getElementById('chat-input');
    this.sendBtn  = document.getElementById('chat-send');
    this.quickEl  = document.getElementById('quick-replies');
    this.history  = JSON.parse(sessionStorage.getItem('rp_history') || '[]');
    this.greeted  = !!sessionStorage.getItem('rp_html');
    this.isOpen   = false;
    if (!this.toggle) return;
    this.bind();
    this.restore();
  }

  save() {
    sessionStorage.setItem('rp_history', JSON.stringify(this.history));
    if (this.messages) sessionStorage.setItem('rp_html', this.messages.innerHTML);
    sessionStorage.setItem('rp_open', this.isOpen ? '1' : '0');
  }

  restore() {
    const html = sessionStorage.getItem('rp_html');
    if (html && this.messages) {
      this.messages.innerHTML = html;
      this.scrollDown();
    }
    if (sessionStorage.getItem('rp_open') === '1') {
      this.win?.classList.add('open');
      this.toggle.textContent = '✕';
      this.isOpen = true;
      this.scrollDown();
    }
  }

  bind() {
    this.toggle.addEventListener('click', () => this.isOpen ? this.close() : this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.sendBtn?.addEventListener('click', () => this.handleSend());
    this.input?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSend(); }
    });
    this.input?.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
    });
  }

  open() {
    this.isOpen = true;
    this.win?.classList.add('open');
    this.toggle.textContent = '✕';
    sessionStorage.setItem('rp_open', '1');
    if (!this.greeted) {
      this.greeted = true;
      setTimeout(() => { this.addBot(WELCOME); this.showQuickReplies(); }, 280);
    }
    if (window.innerWidth > 480) this.input?.focus();
    this.scrollDown();
    if (CHAT_API_URL) this.warmup();
    if (this.input) setTimeout(() => { this.input.style.height = 'auto'; }, 50);
  }

  warmup() {
    fetch(CHAT_API_URL.replace('/api/chat', '/'), { method: 'GET' }).catch(() => {});
  }

  close() {
    this.isOpen = false;
    this.win?.classList.remove('open');
    this.toggle.textContent = '🔧';
    sessionStorage.setItem('rp_open', '0');
  }

  linkify(text) {
    return text.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
      const clean = url.replace(/[.,!?—\-]+$/, '');
      return `<a href="${clean}" target="_blank" rel="noopener noreferrer" style="color:var(--gold);text-decoration:underline;">${clean}</a>`;
    });
  }

  addBot(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const d = document.createElement('div');
    d.className = 'chat-msg';
    d.innerHTML = `
      <div class="chat-msg__avatar">RP</div>
      <div>
        <div class="chat-msg__bubble">${this.linkify(text).replace(/\n/g, '<br/>')}</div>
        <div class="chat-msg__time">${time}</div>
      </div>`;
    this.messages?.appendChild(d);
    this.save();
    this.scrollDown();
  }

  addUser(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const d = document.createElement('div');
    d.className = 'chat-msg chat-msg--user';
    d.innerHTML = `
      <div class="chat-msg__avatar">You</div>
      <div>
        <div class="chat-msg__bubble">${this.escape(text)}</div>
        <div class="chat-msg__time">${time}</div>
      </div>`;
    this.messages?.appendChild(d);
    this.save();
    this.scrollDown();
  }

  showTyping(label = '') {
    const d = document.createElement('div');
    d.className = 'chat-msg'; d.id = 'chat-typing';
    d.innerHTML = `<div class="chat-msg__avatar">RP</div>
      <div>
        <div class="chat-typing"><span></span><span></span><span></span></div>
        ${label ? `<div class="chat-typing__label">${label}</div>` : ''}
      </div>`;
    this.messages?.appendChild(d);
    this.scrollDown();
  }

  hideTyping() { document.getElementById('chat-typing')?.remove(); }

  showQuickReplies() {
    if (!this.quickEl) return;
    this.quickEl.innerHTML = QUICK_REPLIES.map(q =>
      `<button class="chat-quick-reply">${this.escape(q)}</button>`
    ).join('');
    this.quickEl.querySelectorAll('.chat-quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        this.quickEl.innerHTML = '';
        this.send(btn.textContent);
      });
    });
  }

  async handleSend() {
    const text = this.input?.value.trim();
    if (!text) return;
    this.input.value = '';
    this.input.style.height = 'auto';
    if (this.quickEl) this.quickEl.innerHTML = '';
    await this.send(text);
  }

  async send(text) {
    this.addUser(text);
    this.history.push({ role: 'user', content: text });
    this.save();
    if (this.sendBtn) this.sendBtn.disabled = true;
    this.showTyping(this.history.length <= 1 ? 'Connecting...' : '');

    try {
      const reply = CHAT_API_URL
        ? await this.callAPI(text)
        : this.fallback(text);
      this.hideTyping();
      this.history.push({ role: 'assistant', content: reply });
      this.save();
      this.addBot(reply);
    } catch {
      this.hideTyping();
      this.addBot("Sorry, something went wrong. For urgent jobs please call <a href='tel:+10000000000' style='color:var(--gold);font-weight:700;'>(000) 000-0000</a>.");
    } finally {
      if (this.sendBtn) this.sendBtn.disabled = false;
      this.input?.focus();
    }
  }

  async callAPI(msg, retry = true) {
    let res;
    try {
      res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: this.history.slice(-8) }),
      });
    } catch {
      if (retry) { await new Promise(r => setTimeout(r, 4000)); return this.callAPI(msg, false); }
      throw new Error('Network error');
    }
    if (!res.ok) {
      if (retry) { await new Promise(r => setTimeout(r, 4000)); return this.callAPI(msg, false); }
      throw new Error('API error');
    }
    const data = await res.json();
    return data.reply || data.message || 'Sorry, I could not process that.';
  }

  fallback(text) {
    const t = text.toLowerCase();
    if (/hour|open|close|when|time|available/.test(t))                return FALLBACK.hours;
    if (/book|appoint|call|quote|reserv|schedul|slot/.test(t))        return FALLBACK.booking;
    if (/price|cost|how much|fee|charge|expensive/.test(t))           return FALLBACK.price;
    if (/location|address|where|area|suburb|service area/.test(t))    return FALLBACK.location;
    if (/emergency|urgent|burst|flood|leak.*bad|water.*everywhere/.test(t))
      return "This sounds urgent! Please call Rob immediately:\n\n📞 <a href='tel:+10000000000' style='color:var(--gold);font-weight:700;text-decoration:underline;'>(000) 000-0000</a>\n\nRob is available 24/7 for plumbing emergencies.";
    if (/service|offer|do you|what.*do|fix|repair/.test(t))
      return "Rob's Plumbing services:\n• Emergency Plumbing (24/7)\n• Leak Detection & Repair\n• Drain Cleaning & Unblocking\n• Hot Water System Install & Repair\n• Bathroom & Kitchen Plumbing\n• Pipe Repair & Repiping\n\nFull pricing on our <a href='services.html' style='color:var(--gold);text-decoration:underline;'>services page</a>.";
    if (/drain|blocked|sink|toilet|shower/.test(t))
      return "Blocked drains are one of our most common jobs. Pricing:\n• Blocked sink/basin/shower: $100–$180\n• Blocked toilet: $120–$200\n• CCTV drain inspection: $200–$350\n\nWant to book? Call <a href='tel:+10000000000' style='color:var(--gold);font-weight:700;'>(000) 000-0000</a>";
    if (/hot water|heater|hwu|shower cold|no hot/.test(t))
      return "Hot water issues are usually same-day or next-day jobs. Service & repair starts from $90. New system installations from $800.\n\nCall Rob to discuss: <a href='tel:+10000000000' style='color:var(--gold);font-weight:700;'>(000) 000-0000</a>";
    if (/rob|plumber|who|staff|licensed|qualified/.test(t))
      return "Rob is a licensed master plumber with 15+ years of experience in residential plumbing. Fully insured, upfront pricing, no hidden fees. <a href='barbers.html' style='color:var(--gold);text-decoration:underline;'>Learn more about Rob →</a>";
    if (/hello|hi |hey|good morning|good afternoon/.test(t))
      return "Hey! Thanks for reaching out to Rob's Plumbing. What plumbing issue can I help with today?";
    if (/thank/.test(t))
      return "Anytime! We look forward to helping you. Rob's Plumbing — done right, every time. 🔧";
    return FALLBACK.default;
  }

  scrollDown() { if (this.messages) this.messages.scrollTop = this.messages.scrollHeight; }
  escape(s)    { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
}

document.addEventListener('DOMContentLoaded', () => new ChatWidget());
