(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const money = (n) => 'Rs. ' + Number(n).toLocaleString('en-PK');

  const CART_KEY = 'threadly.cart.v1';
  const ORDERS_KEY = 'threadly.orders.v1';
  const FREE_SHIPPING_AT = 5000;
  const SHIPPING_FEE = 250;

  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  const productById = (id) => PRODUCTS.find((p) => p.id === id);
  const gradient = (p) => 'linear-gradient(135deg, ' + p.colors[0] + ', ' + p.colors[1] + ')';
  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  /* ---------- State ---------- */
  // cart: array of { id, size, qty }
  let cart = load(CART_KEY, []);
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter((l) => l && productById(l.id) && l.qty > 0);

  const view = { category: 'All', query: '', sort: 'featured' };
  let openProductId = null;

  const persist = () => save(CART_KEY, cart);

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- Cart logic ---------- */
  function addToCart(id, size) {
    size = size || 'M';
    const line = cart.find((l) => l.id === id && l.size === size);
    if (line) line.qty = Math.min(line.qty + 1, 20);
    else cart.push({ id: id, size: size, qty: 1 });
    persist();
    renderCart();
    const badge = $('#cartCount');
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
  }

  function changeQty(id, size, delta) {
    const line = cart.find((l) => l.id === id && l.size === size);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter((l) => l !== line);
    if (line.qty > 20) line.qty = 20;
    persist();
    renderCart();
  }

  function removeLine(id, size) {
    cart = cart.filter((l) => !(l.id === id && l.size === size));
    persist();
    renderCart();
  }

  function totals() {
    const subtotal = cart.reduce((sum, l) => sum + productById(l.id).price * l.qty, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
    return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
  }

  const itemCount = () => cart.reduce((n, l) => n + l.qty, 0);

  /* ---------- Product grid ---------- */
  function categories() {
    const set = [];
    PRODUCTS.forEach((p) => { if (set.indexOf(p.category) === -1) set.push(p.category); });
    return ['All'].concat(set);
  }

  function renderChips() {
    const wrap = $('#categories');
    wrap.textContent = '';
    categories().forEach((c) => {
      const b = el('button', 'chip' + (c === view.category ? ' on' : ''), c);
      b.type = 'button';
      b.setAttribute('aria-pressed', c === view.category ? 'true' : 'false');
      b.addEventListener('click', () => { view.category = c; renderChips(); renderGrid(); });
      wrap.appendChild(b);
    });
  }

  function visibleProducts() {
    const q = view.query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const inCat = view.category === 'All' || p.category === view.category;
      const inText = !q || p.name.toLowerCase().indexOf(q) !== -1 || p.category.toLowerCase().indexOf(q) !== -1;
      return inCat && inText;
    });
    if (view.sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
    if (view.sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);
    if (view.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function renderGrid() {
    const grid = $('#grid');
    grid.textContent = '';
    const list = visibleProducts();
    $('#emptyMsg').hidden = list.length > 0;
    $('#resultCount').textContent = '(' + list.length + ')';

    list.forEach((p) => {
      const card = el('article', 'card');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'View ' + p.name);

      const thumb = el('div', 'thumb', p.emoji);
      thumb.style.background = gradient(p);
      thumb.setAttribute('aria-hidden', 'true');

      const body = el('div', 'card-body');
      const st = el('div', 'stars', stars(p.rating));
      st.appendChild(el('span', '', p.rating.toFixed(1)));
      const foot = el('div', 'card-foot');
      const add = el('button', 'add', 'Add to cart');
      add.type = 'button';
      add.setAttribute('aria-label', 'Add ' + p.name + ' to cart');
      add.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(p.id, 'M');
        toast('Added "' + p.name + '" to your cart 🛒');
      });
      foot.append(el('span', 'price', money(p.price)), add);
      body.append(el('span', 'cat', p.category), el('h3', 'name', p.name), st, foot);
      card.append(thumb, body);

      const open = () => openProduct(p.id);
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); }
      });
      grid.appendChild(card);
    });
  }

  /* ---------- Overlay / modal / drawer management ---------- */
  let lastFocus = null;
  const overlay = $('#overlay');
  const drawer = $('#cart');
  const productModal = $('#productModal');
  const checkoutModal = $('#checkoutModal');

  function showOverlay() {
    overlay.hidden = false;
    document.body.classList.add('lock');
  }

  function closeAll() {
    productModal.hidden = true;
    checkoutModal.hidden = true;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    document.body.classList.remove('lock');
    openProductId = null;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  function openProduct(id) {
    const p = productById(id);
    if (!p) return;
    lastFocus = document.activeElement;
    openProductId = id;
    $('#pThumb').style.background = gradient(p);
    $('#pThumb').textContent = p.emoji;
    $('#pCategory').textContent = p.category;
    $('#pTitle').textContent = p.name;
    $('#pRating').textContent = stars(p.rating) + ' ';
    $('#pRating').appendChild(el('span', '', p.rating.toFixed(1) + ' / 5'));
    $('#pDesc').textContent = p.desc;
    $('#pPrice').textContent = money(p.price);
    $('#pSize').value = 'M';
    showOverlay();
    productModal.hidden = false;
    $('.close', productModal).focus();
  }

  function openCart() {
    lastFocus = document.activeElement;
    renderCart();
    showOverlay();
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    $('.close', drawer).focus();
  }

  $('#pAdd').addEventListener('click', () => {
    const p = productById(openProductId);
    if (!p) return;
    const size = $('#pSize').value;
    addToCart(p.id, size);
    toast('Added "' + p.name + '" (' + size + ') to your cart 🛒');
    closeAll();
  });

  $('#openCart').addEventListener('click', openCart);
  overlay.addEventListener('click', closeAll);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  productModal.addEventListener('click', (e) => { if (e.target === productModal) closeAll(); });
  checkoutModal.addEventListener('click', (e) => { if (e.target === checkoutModal) closeAll(); });

  /* ---------- Cart drawer render ---------- */
  function renderCart() {
    const list = $('#cartList');
    list.textContent = '';
    const count = itemCount();
    $('#cartCount').textContent = count;
    $('#cartEmpty').hidden = count > 0;
    $('#cartFoot').hidden = count === 0;
    list.hidden = count === 0;

    cart.forEach((l) => {
      const p = productById(l.id);
      const li = el('li', 'line');

      const thumb = el('div', 'line-thumb', p.emoji);
      thumb.style.background = gradient(p);
      thumb.setAttribute('aria-hidden', 'true');

      const body = el('div', 'line-body');
      const qty = el('div', 'qty');
      const minus = el('button', '', '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Decrease quantity of ' + p.name);
      minus.addEventListener('click', () => changeQty(l.id, l.size, -1));
      const plus = el('button', '', '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Increase quantity of ' + p.name);
      plus.addEventListener('click', () => changeQty(l.id, l.size, 1));
      qty.append(minus, el('span', '', String(l.qty)), plus);
      body.append(
        el('div', 'line-name', p.name),
        el('div', 'line-meta', 'Size ' + l.size + ' · ' + money(p.price) + ' each'),
        qty
      );

      const right = el('div');
      right.style.textAlign = 'right';
      const rm = el('button', 'remove', '✕');
      rm.type = 'button';
      rm.setAttribute('aria-label', 'Remove ' + p.name + ' from cart');
      rm.addEventListener('click', () => removeLine(l.id, l.size));
      right.append(rm, el('div', 'line-price', money(p.price * l.qty)));

      li.append(thumb, body, right);
      list.appendChild(li);
    });

    const t = totals();
    $('#tSub').textContent = money(t.subtotal);
    $('#tShip').textContent = t.shipping === 0 ? 'Free' : money(t.shipping);
    $('#tTotal').textContent = money(t.total);
    const hint = $('#shipHint');
    if (t.subtotal >= FREE_SHIPPING_AT) hint.textContent = '🎉 You get free delivery!';
    else hint.textContent = 'Add ' + money(FREE_SHIPPING_AT - t.subtotal) + ' more for free delivery.';
  }

  $('#clearCart').addEventListener('click', () => {
    cart = [];
    persist();
    renderCart();
    toast('Cart cleared');
  });

  /* ---------- Checkout ---------- */
  const FIELDS = [
    { id: 'cName', err: 'eName', test: (v) => v.trim().length >= 3, msg: 'Please enter your full name.' },
    { id: 'cPhone', err: 'ePhone', test: (v) => /^[0-9+\-\s]{10,15}$/.test(v.trim()), msg: 'Enter a valid phone number.' },
    { id: 'cEmail', err: 'eEmail', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Enter a valid email address.' },
    { id: 'cAddress', err: 'eAddress', test: (v) => v.trim().length >= 6, msg: 'Please enter your delivery address.' },
    { id: 'cCity', err: 'eCity', test: (v) => v.trim().length >= 2, msg: 'Please enter your city.' }
  ];

  function openCheckout() {
    if (cart.length === 0) { toast('Your cart is empty'); return; }
    $('#checkoutForm').reset();
    FIELDS.forEach((f) => { $('#' + f.err).hidden = true; $('#' + f.id).classList.remove('bad'); });
    $('#checkoutView').hidden = false;
    $('#successView').hidden = true;

    const box = $('#checkoutSummary');
    box.textContent = '';
    cart.forEach((l) => {
      const p = productById(l.id);
      const row = el('div');
      row.append(el('span', '', l.qty + ' × ' + p.name + ' (' + l.size + ')'), el('span', '', money(p.price * l.qty)));
      box.appendChild(row);
    });
    const t = totals();
    const ship = el('div');
    ship.append(el('span', '', 'Delivery'), el('span', '', t.shipping === 0 ? 'Free' : money(t.shipping)));
    const tot = el('div', 'total');
    tot.append(el('span', '', 'Total'), el('span', '', money(t.total)));
    box.append(ship, tot);

    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    showOverlay();
    checkoutModal.hidden = false;
    $('#cName').focus();
  }

  $('#checkoutBtn').addEventListener('click', openCheckout);

  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    let firstBad = null;
    FIELDS.forEach((f) => {
      const input = $('#' + f.id);
      const valid = f.test(input.value);
      const msg = $('#' + f.err);
      msg.hidden = valid;
      msg.textContent = valid ? '' : f.msg;
      input.classList.toggle('bad', !valid);
      if (!valid) { ok = false; if (!firstBad) firstBad = input; }
    });
    if (!ok) { firstBad.focus(); return; }

    const t = totals();
    const order = {
      id: 'TH-' + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      customer: {
        name: $('#cName').value.trim(),
        phone: $('#cPhone').value.trim(),
        email: $('#cEmail').value.trim(),
        address: $('#cAddress').value.trim(),
        city: $('#cCity').value.trim()
      },
      payment: $('#cPay').value,
      items: cart.map((l) => {
        const p = productById(l.id);
        return { id: p.id, name: p.name, size: l.size, qty: l.qty, price: p.price };
      }),
      subtotal: t.subtotal,
      shipping: t.shipping,
      total: t.total
    };

    const orders = load(ORDERS_KEY, []);
    orders.push(order);
    save(ORDERS_KEY, orders);

    cart = [];
    persist();
    renderCart();

    $('#sName').textContent = order.customer.name.split(' ')[0];
    $('#sId').textContent = order.id;
    $('#sInfo').textContent = 'Total ' + money(order.total) + ' · ' + order.payment + ' · Delivering to ' + order.customer.city + '.';
    $('#checkoutView').hidden = true;
    $('#successView').hidden = false;
  });

  /* ---------- Search / sort ---------- */
  $('#search').addEventListener('input', (e) => { view.query = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', (e) => { view.sort = e.target.value; renderGrid(); });

  /* ---------- Start ---------- */
  renderChips();
  renderGrid();
  renderCart();
})();
