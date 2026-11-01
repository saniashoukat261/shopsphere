const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + Number(n).toFixed(2);
const fmtDate = d => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const EMOJI = { electronics: '🎧', fashion: '👕', home: '🏠', sports: '🏀', books: '📚', beauty: '💄', toys: '🧸', kitchen: '🍳', food: '🍎' };
const emoji = c => EMOJI[String(c || '').toLowerCase()] || '🛍️';
const stars = r => { const f = Math.round(r); return `<span class="stars" aria-label="${r} out of 5">${'★'.repeat(f)}${'☆'.repeat(5 - f)}</span>`; };
let me = null, wish = new Set();

async function api(url, opts = {}) {
  const o = { credentials: 'same-origin', ...opts, headers: { ...(opts.headers || {}) } };
  if (o.body && !(o.body instanceof FormData)) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(o.body); }
  const r = await fetch(url, o);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}
function toast(msg, err) {
  let box = $('#toast'); if (!box) { box = document.createElement('div'); box.id = 'toast'; document.body.append(box); }
  const t = document.createElement('div'); t.className = 't' + (err ? ' err' : ''); t.textContent = msg; box.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3300);
}
const cart = {
  get() { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } },
  set(c) { localStorage.setItem('cart', JSON.stringify(c)); cart.badge(); drawerRender(); },
  add(p, n = 1, quiet, src) {
    const c = cart.get(), i = c.find(x => x.id === p._id), have = i ? i.qty : 0;
    if (have >= p.stock) return toast('Maximum available stock reached', true);
    if (have + n > p.stock) { n = p.stock - have; toast('Only ' + p.stock + ' in stock', true); }
    if (i) i.qty += n; else c.push({ id: p._id, name: p.name, price: p.price, image: p.image, cat: p.category, stock: p.stock, qty: n });
    cart.set(c); if (!quiet) flyToCart(src).then(openDrawer);
  },
  count() { return cart.get().reduce((s, i) => s + i.qty, 0); },
  badge() { const b = $('#cartBadge'); if (b) { const n = cart.count(), changed = b.dataset.init && b.textContent !== String(n); b.textContent = n; b.style.display = n ? '' : 'none'; b.dataset.init = 1; if (changed) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } } }
};

/* ---- cart drawer ---- */
function buildDrawer() {
  if ($('#drawer')) return;
  document.body.insertAdjacentHTML('beforeend', '<div id="ov"></div><aside id="drawer"><div class="dh"><h2>Your cart</h2><button class="btn sec sm" id="dclose">✕</button></div><div class="db" id="dbody"></div><div class="df"><div class="dtot"><span>Subtotal</span><strong id="dtotal">$0.00</strong></div><a class="btn" href="/cart.html" style="text-align:center">Checkout</a><button class="btn sec" id="dcont">Continue shopping</button></div></aside>');
  $('#ov').onclick = $('#dclose').onclick = $('#dcont').onclick = closeDrawer;
}
function drawerRender() {
  const b = $('#dbody'); if (!b) return;
  const c = cart.get();
  b.innerHTML = c.length ? c.map((i, n) => `<div class="dl">${i.image ? `<img class="th" src="${esc(i.image)}" alt="" onerror="imgFail(this,'${emoji(i.cat)}','th')">` : `<div class="th">${emoji(i.cat)}</div>`}<div class="info"><strong>${esc(i.name)}</strong><span class="hint">${money(i.price)}</span><div class="qty"><button data-m="${n}">−</button><span>${i.qty}</span><button data-p="${n}">+</button></div></div><div style="text-align:right"><strong>${money(i.price * i.qty)}</strong><br><button class="rm" data-r="${n}" title="Remove">🗑</button></div></div>`).join('')
    : '<div class="empty">Your cart is empty 🛒<br><br><a href="/">Start shopping</a></div>';
  $('#dtotal').textContent = money(c.reduce((s, i) => s + i.price * i.qty, 0));
  b.querySelectorAll('[data-m]').forEach(x => x.onclick = () => { const c = cart.get(), i = c[x.dataset.m]; i.qty--; if (i.qty < 1) c.splice(x.dataset.m, 1); cart.set(c); });
  b.querySelectorAll('[data-p]').forEach(x => x.onclick = () => { const c = cart.get(), i = c[x.dataset.p]; if (i.qty < i.stock) i.qty++; else toast('Maximum available stock reached', true); cart.set(c); });
  b.querySelectorAll('[data-r]').forEach(x => x.onclick = () => { const c = cart.get(); c.splice(x.dataset.r, 1); cart.set(c); });
}
function openDrawer() { buildDrawer(); drawerRender(); document.body.classList.add('dopen'); }
function closeDrawer() { document.body.classList.remove('dopen'); }
document.addEventListener('keydown', e => e.key === 'Escape' && closeDrawer());

/* ---- helpers shared by pages ---- */
function pager(el, page, pages, go) {
  el.innerHTML = pages <= 1 ? '' : `<button class="btn sec sm" ${page <= 1 ? 'disabled' : ''} data-p="${page - 1}">← Prev</button><span class="hint">Page ${page} of ${pages}</span><button class="btn sec sm" ${page >= pages ? 'disabled' : ''} data-p="${page + 1}">Next →</button>`;
  el.querySelectorAll('button').forEach(b => b.onclick = () => go(+b.dataset.p));
}
const debounce = (fn, ms = 350) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
function imgFail(el, e, cls) { el.outerHTML = `<div class="${cls || 'ph'}">${e}</div>`; }
const imgTag = p => p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="imgFail(this,'${emoji(p.category)}')">` : `<div class="ph">${emoji(p.category)}</div>`;
const skeletons = n => Array.from({ length: n }, () => '<div class="card product skel"><div class="ph"></div><div class="body"><i></i><i></i><i style="width:50%"></i></div></div>').join('');
const heart = id => `<button class="heart ${wish.has(id) ? 'on' : ''}" data-w="${id}" title="Add to wishlist" aria-label="Wishlist">${wish.has(id) ? '♥' : '♡'}</button>`;
async function toggleWish(id, btn) {
  if (!me) { toast('Please log in to use your wishlist', true); return setTimeout(() => location.href = '/login.html', 900); }
  try {
    const r = await api('/api/user/wishlist/' + id, { method: 'POST' });
    r.wished ? wish.add(id) : wish.delete(id);
    document.querySelectorAll(`[data-w="${id}"]`).forEach(b => { b.classList.toggle('on', r.wished); b.textContent = b.classList.contains('txt') ? (r.wished ? '♥ In wishlist' : '♡ Add to wishlist') : (r.wished ? '♥' : '♡'); if (r.wished) { b.classList.remove('beat'); void b.offsetWidth; b.classList.add('beat'); } });
    toast(r.wished ? 'Added to wishlist' : 'Removed from wishlist');
  } catch (e) { toast(e.message, true); }
}
const productCard = p => `<div class="card product">${heart(p._id)}<a href="/product.html?id=${p._id}">${imgTag(p)}</a><div class="body"><span class="cat">${esc(p.category)}</span><a href="/product.html?id=${p._id}"><strong>${esc(p.name)}</strong></a>${p.ratingCount ? `<div>${stars(p.ratingAvg)} <span class="hint">${p.ratingAvg} (${p.ratingCount})</span></div>` : '<div class="hint">No reviews yet</div>'}<div><span class="price">${money(p.price)}</span>${p.oldPrice > p.price ? ` <s class="old">${money(p.oldPrice)}</s> <span class="off">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ''}</div>${p.stock === 0 ? '<span class="stock-out">Out of stock</span>' : p.stock <= 5 ? `<span class="stock-low">Only ${p.stock} left</span>` : ''}<button class="btn" data-id="${p._id}" ${p.stock === 0 ? 'disabled' : ''}>Add to cart</button></div></div>`;
function bindCards(root, items) {
  root.querySelectorAll('button[data-id]').forEach(b => b.onclick = () => cart.add(items.find(i => i._id === b.dataset.id), 1, false, b.closest('.product').querySelector('img, .ph')));
  root.querySelectorAll('.heart').forEach(b => b.onclick = () => toggleWish(b.dataset.w, b));
}

async function initNav() {
  try { me = (await api('/api/auth/me')).user; } catch { me = null; }
  if (me) { try { wish = new Set((await api('/api/user/wishlist')).map(p => p._id)); } catch {} }
  const path = location.pathname.split('/').pop() || 'index.html';
  const link = (h, t) => `<a href="/${h}" class="${path === h ? 'active' : ''}">${t}</a>`;
  const account = me
    ? `<div class="acct"><button class="acct-btn" id="acctBtn" aria-haspopup="true" aria-expanded="false"><span class="nav-av">${esc(me.name.trim()[0].toUpperCase())}</span><span class="an">${esc(me.name.trim().split(' ')[0])}</span><span class="car">▾</span></button>
<div class="menu" id="acctMenu" hidden><div class="mh"><strong>${esc(me.name)}</strong><span class="hint">${esc(me.email)}</span></div>
<a href="/orders.html">📦 My orders</a><a href="/wishlist.html">♥ Wishlist</a><a href="/profile.html">👤 Profile</a>${me.role === 'admin' ? '<a href="/admin.html">⚙️ Admin dashboard</a>' : ''}<hr><button class="out" id="logout">↩ Logout</button></div></div>`
    : '<a class="signin" href="/login.html">Login<span class="long"> / Sign up</span></a>';
  $('#nav').innerHTML = `<a class="brand" href="/">🛒 ShopSphere</a>
<div class="navright"><div class="navlinks" id="navlinks">${link('index.html', 'Shop')}${link('about.html', 'About')}${link('contact.html', 'Contact')}</div><button class="link cartbtn" id="cartBtn" aria-label="Open cart">🛍️<span class="ct">Cart</span><span class="badge" id="cartBadge">0</span></button>${account}<button class="link burger" id="burger" aria-label="Menu" aria-expanded="false">☰</button></div>`;
  cart.badge();
  const nav = $('#nav'), menu = $('#acctMenu'), ab = $('#acctBtn'), bg = $('#burger');
  $('#cartBtn').onclick = () => { nav.classList.remove('open'); if (menu) menu.hidden = true; if (path !== 'cart.html') openDrawer(); };
  bg.onclick = e => { e.stopPropagation(); const o = nav.classList.toggle('open'); bg.setAttribute('aria-expanded', o); bg.textContent = o ? '✕' : '☰'; if (menu) menu.hidden = true; };
  if (ab) ab.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; ab.setAttribute('aria-expanded', !menu.hidden); nav.classList.remove('open'); bg.textContent = '☰'; };
  const lo = $('#logout'); if (lo) lo.onclick = async () => { await api('/api/auth/logout', { method: 'POST' }); location.href = '/login.html'; };
  if (!window.__navBound) {
    window.__navBound = true;
    const closeAll = () => { const m = $('#acctMenu'); if (m) m.hidden = true; const n = $('#nav'); if (n) { n.classList.remove('open'); const b = $('#burger'); if (b) b.textContent = '☰'; } };
    document.addEventListener('click', e => { if (!e.target.closest('.acct') && !e.target.closest('#nav')) closeAll(); else if (!e.target.closest('.acct')) { const m = $('#acctMenu'); if (m) m.hidden = true; } });
    document.addEventListener('keydown', e => e.key === 'Escape' && closeAll());
  }
  if (!$('footer')) document.body.insertAdjacentHTML('beforeend', '<footer><a href="/about.html">About</a> · <a href="/contact.html">Contact</a> · <a href="/">Shop</a><br>© ' + new Date().getFullYear() + ' ShopSphere · Built with Node.js, Express &amp; MongoDB</footer>');
}
/* ---- animations ---- */
// the product picture flies into the cart button, then the cart drawer opens
function flyToCart(src) {
  return new Promise(done => {
    const to = $('#cartBtn');
    if (!src || !to || !src.animate || reduceMotion()) return done();
    const a = src.getBoundingClientRect(), b = to.getBoundingClientRect(), s = 72;
    if (!a.width || !b.width) return done();
    const el = document.createElement('div'); el.className = 'fly';
    el.style.cssText = `left:${a.left + a.width / 2 - s / 2}px;top:${a.top + a.height / 2 - s / 2}px;width:${s}px;height:${s}px`;
    if (src.tagName === 'IMG') { const im = new Image(); im.src = src.currentSrc || src.src; el.append(im); } else el.textContent = src.textContent.trim();
    document.body.append(el);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = el.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * .55}px,${dy * .55 - 70}px) scale(.75) rotate(12deg)`, opacity: 1, offset: .55 },
      { transform: `translate(${dx}px,${dy}px) scale(.12) rotate(24deg)`, opacity: .5 }
    ], { duration: 750, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = anim.oncancel = () => { el.remove(); to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump'); done(); };
  });
}
const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
// counts a number like "12" or "$1234.50" up from 0 (anything else is left alone)
function countUp(el, ms = 900) {
  if (!el || reduceMotion()) return;
  const raw = el.textContent.trim(), m = raw.match(/^(\$?)(\d[\d,]*\.?\d*)$/);
  if (!m) return;
  const end = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = k < 1 ? m[1] + (end * e).toFixed(dec) : raw; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const countAll = root => (root || document).querySelectorAll('.stat .n').forEach(el => countUp(el));
// sections fade up the first time they scroll into view
let revealIO;
function initReveal() {
  if (!('IntersectionObserver' in window) || reduceMotion()) return;
  revealIO = revealIO || new IntersectionObserver(entries => {
    let n = 0;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, d = Math.min(n++, 6) * 80;
      el.style.transitionDelay = d + 'ms'; el.classList.add('in'); revealIO.unobserve(el);
      setTimeout(() => { el.classList.remove('rv', 'in'); el.style.transitionDelay = ''; }, 900 + d);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('main .fcard, main .step, main .sh, main .cta, main .features > div, main details, main .card.sec').forEach(el => {
    if (el.dataset.rv) return; el.dataset.rv = 1; el.classList.add('rv'); revealIO.observe(el);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  if ($('#nav')) initNav().then(() => window.onReady && window.onReady()).finally(initReveal);
});