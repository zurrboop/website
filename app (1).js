(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const STORE_KEY = 'edutrack.students.v1';
  const CLASSES = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const PAGE_SIZE = 8;
  const AVATAR_COLORS = ['#5b5bff', '#8a4dff', '#12b886', '#ff9f43', '#ff5c7a', '#19b5d4', '#e0559c'];

  function load() {
    try { const v = localStorage.getItem(STORE_KEY); return v ? JSON.parse(v) : null; }
    catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(students)); } catch (e) { /* storage unavailable */ }
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  const colorFor = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  };

  /* ---------- Data ---------- */
  function seed() {
    const base = [
      ['CS-101', 'Ayesha Malik', 'Female', 'Grade 10', 'ayesha.malik@example.com', '0300 1234567', 92.5],
      ['CS-102', 'Hamza Ali', 'Male', 'Grade 10', 'hamza.ali@example.com', '0311 2345678', 78],
      ['CS-103', 'Fatima Noor', 'Female', 'Grade 9', 'fatima.noor@example.com', '0321 3456789', 88.4],
      ['CS-104', 'Usman Tariq', 'Male', 'Grade 9', 'usman.tariq@example.com', '0333 4567890', 64],
      ['CS-105', 'Zainab Raza', 'Female', 'Grade 8', 'zainab.raza@example.com', '0345 5678901', 95],
      ['CS-106', 'Bilal Ahmed', 'Male', 'Grade 8', 'bilal.ahmed@example.com', '0301 6789012', 71.2],
      ['CS-107', 'Hira Siddiqui', 'Female', 'Grade 11', 'hira.siddiqui@example.com', '0312 7890123', 83],
      ['CS-108', 'Ali Hassan', 'Male', 'Grade 11', 'ali.hassan@example.com', '0322 8901234', 56.5],
      ['CS-109', 'Maryam Khan', 'Female', 'Grade 12', 'maryam.khan@example.com', '0334 9012345', 90],
      ['CS-110', 'Daniyal Sheikh', 'Male', 'Grade 7', 'daniyal.sheikh@example.com', '0346 0123456', null]
    ];
    return base.map((r, i) => ({
      id: i + 1, roll: r[0], name: r[1], gender: r[2], className: r[3], email: r[4], phone: r[5], score: r[6], added: i + 1
    }));
  }

  let students = load();
  if (!Array.isArray(students)) { students = seed(); save(); }

  const view = { query: '', cls: 'All', sort: 'name', page: 1 };
  let editingId = null;
  let deletingId = null;

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- Stats ---------- */
  function renderStats() {
    $('#statTotal').textContent = students.length;
    const classes = new Set(students.map((s) => s.className));
    $('#statClasses').textContent = classes.size;
    const scored = students.filter((s) => typeof s.score === 'number');
    if (scored.length) {
      const avg = scored.reduce((n, s) => n + s.score, 0) / scored.length;
      $('#statAvg').textContent = avg.toFixed(1) + '%';
      const top = scored.reduce((a, b) => (b.score > a.score ? b : a));
      $('#statTop').textContent = top.name.split(' ')[0] + ' (' + top.score + '%)';
    } else {
      $('#statAvg').textContent = '-';
      $('#statTop').textContent = '-';
    }
  }

  /* ---------- Filters ---------- */
  function fillClassSelects() {
    const f = $('#filterClass');
    f.textContent = '';
    ['All'].concat(CLASSES).forEach((c) => {
      const o = el('option', '', c === 'All' ? 'All classes' : c);
      o.value = c;
      f.appendChild(o);
    });
    const form = $('#fClass');
    form.textContent = '';
    CLASSES.forEach((c) => { const o = el('option', '', c); o.value = c; form.appendChild(o); });
  }

  function filtered() {
    const q = view.query.trim().toLowerCase();
    let list = students.filter((s) => {
      const inClass = view.cls === 'All' || s.className === view.cls;
      const inText = !q || [s.name, s.roll, s.email, s.phone].some((v) => String(v).toLowerCase().indexOf(q) !== -1);
      return inClass && inText;
    });
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      roll: (a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }),
      score: (a, b) => (b.score === null ? -1 : b.score) - (a.score === null ? -1 : a.score),
      newest: (a, b) => b.added - a.added
    };
    return list.slice().sort(by[view.sort]);
  }

  /* ---------- Table ---------- */
  function cell(label, cls) {
    const td = el('td', cls || '');
    td.setAttribute('data-label', label);
    return td;
  }

  function renderTable() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (view.page > pages) view.page = pages;
    const start = (view.page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    const body = $('#rows');
    body.textContent = '';

    slice.forEach((s) => {
      const tr = el('tr');

      const tdWho = cell('Student', 'cell-who');
      const who = el('div', 'who');
      const av = el('span', 'avatar', initials(s.name));
      av.style.background = colorFor(s.name);
      av.setAttribute('aria-hidden', 'true');
      const info = el('div');
      info.append(el('b', '', s.name), el('small', '', s.email));
      who.append(av, info);
      tdWho.appendChild(who);

      const tdRoll = cell('Roll no');
      tdRoll.textContent = s.roll;

      const tdClass = cell('Class');
      tdClass.appendChild(el('span', 'pill', s.className));

      const tdPhone = cell('Phone');
      tdPhone.textContent = s.phone;

      const tdScore = cell('Score');
      if (typeof s.score === 'number') {
        const band = s.score >= 80 ? 'hi' : s.score >= 60 ? 'mid' : 'lo';
        tdScore.appendChild(el('span', 'score ' + band, s.score + '%'));
      } else {
        tdScore.appendChild(el('span', 'score none', 'Not set'));
      }

      const tdActs = cell('Actions', 'cell-acts');
      const acts = el('div', 'acts');
      const edit = el('button', 'icon-btn', '✏️');
      edit.type = 'button';
      edit.setAttribute('aria-label', 'Edit ' + s.name);
      edit.addEventListener('click', () => openForm(s.id));
      const del = el('button', 'icon-btn del', '🗑️');
      del.type = 'button';
      del.setAttribute('aria-label', 'Delete ' + s.name);
      del.addEventListener('click', () => openConfirm(s.id));
      acts.append(edit, del);
      tdActs.appendChild(acts);

      tr.append(tdWho, tdRoll, tdClass, tdPhone, tdScore, tdActs);
      body.appendChild(tr);
    });

    const hasRows = list.length > 0;
    $('#table').hidden = !hasRows;
    $('#emptyMsg').hidden = hasRows;
    $('#pager').hidden = !hasRows;
    if (!hasRows) {
      $('#emptyText').textContent = students.length === 0
        ? 'No students yet. Click "Add student" to create the first record.'
        : 'No students match your search or filter.';
    }

    $('#pageInfo').textContent = hasRows
      ? 'Showing ' + (start + 1) + '–' + (start + slice.length) + ' of ' + list.length + ' students'
      : '';
    renderPager(pages);
  }

  function renderPager(pages) {
    const wrap = $('#pageBtns');
    wrap.textContent = '';
    if (pages <= 1) return;

    const mk = (label, page, opts) => {
      opts = opts || {};
      const b = el('button', 'pg' + (opts.on ? ' on' : ''), label);
      b.type = 'button';
      b.disabled = !!opts.disabled;
      if (opts.aria) b.setAttribute('aria-label', opts.aria);
      if (opts.on) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', () => { view.page = page; renderTable(); });
      return b;
    };

    wrap.appendChild(mk('‹', view.page - 1, { disabled: view.page === 1, aria: 'Previous page' }));
    for (let p = 1; p <= pages; p++) wrap.appendChild(mk(String(p), p, { on: p === view.page, aria: 'Page ' + p }));
    wrap.appendChild(mk('›', view.page + 1, { disabled: view.page === pages, aria: 'Next page' }));
  }

  function renderAll() { renderStats(); renderTable(); }

  /* ---------- Modals ---------- */
  const overlay = $('#overlay');
  const formModal = $('#formModal');
  const confirmModal = $('#confirmModal');
  let lastFocus = null;

  function showOverlay() { overlay.hidden = false; document.body.classList.add('lock'); }

  function closeAll() {
    formModal.hidden = true;
    confirmModal.hidden = true;
    overlay.hidden = true;
    document.body.classList.remove('lock');
    editingId = null;
    deletingId = null;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  document.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeAll(); });
  overlay.addEventListener('click', closeAll);
  formModal.addEventListener('click', (e) => { if (e.target === formModal) closeAll(); });
  confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  /* ---------- Add / Edit form ---------- */
  const FIELD_IDS = { roll: 'fRoll', name: 'fName', email: 'fEmail', phone: 'fPhone', score: 'fScore' };
  const ERR_IDS = { roll: 'eRoll', name: 'eName', email: 'eEmail', phone: 'ePhone', score: 'eScore' };

  function clearErrors() {
    Object.keys(FIELD_IDS).forEach((k) => {
      $('#' + ERR_IDS[k]).hidden = true;
      $('#' + FIELD_IDS[k]).classList.remove('bad');
    });
  }

  function openForm(id) {
    lastFocus = document.activeElement;
    editingId = id || null;
    clearErrors();
    $('#studentForm').reset();

    if (editingId) {
      const s = students.find((x) => x.id === editingId);
      if (!s) return;
      $('#formTitle').textContent = 'Edit student';
      $('#saveBtn').textContent = 'Save changes';
      $('#fRoll').value = s.roll;
      $('#fName').value = s.name;
      $('#fClass').value = s.className;
      $('#fEmail').value = s.email;
      $('#fPhone').value = s.phone;
      $('#fScore').value = typeof s.score === 'number' ? s.score : '';
      const g = document.querySelector('input[name="gender"][value="' + s.gender + '"]');
      if (g) g.checked = true;
    } else {
      $('#formTitle').textContent = 'Add student';
      $('#saveBtn').textContent = 'Save student';
    }

    showOverlay();
    formModal.hidden = false;
    $('#fRoll').focus();
  }

  function validate() {
    const v = {
      roll: $('#fRoll').value.trim(),
      name: $('#fName').value.trim(),
      email: $('#fEmail').value.trim(),
      phone: $('#fPhone').value.trim(),
      score: $('#fScore').value.trim()
    };
    const errors = {};

    if (!/^[A-Za-z0-9-]{2,12}$/.test(v.roll)) errors.roll = 'Use 2 to 12 letters, numbers or dashes.';
    else if (students.some((s) => s.id !== editingId && s.roll.toLowerCase() === v.roll.toLowerCase())) errors.roll = 'This roll number already exists.';

    if (v.name.length < 3) errors.name = 'Please enter the full name (at least 3 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'Enter a valid email address.';
    if (!/^[0-9+\-\s]{10,16}$/.test(v.phone)) errors.phone = 'Enter a valid phone number.';

    if (v.score !== '') {
      const n = Number(v.score);
      if (isNaN(n) || n < 0 || n > 100) errors.score = 'Score must be between 0 and 100.';
    }
    return { v: v, errors: errors };
  }

  $('#studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const res = validate();
    const keys = Object.keys(res.errors);
    if (keys.length) {
      keys.forEach((k) => {
        const msg = $('#' + ERR_IDS[k]);
        msg.textContent = res.errors[k];
        msg.hidden = false;
        $('#' + FIELD_IDS[k]).classList.add('bad');
      });
      $('#' + FIELD_IDS[keys[0]]).focus();
      return;
    }

    const checked = document.querySelector('input[name="gender"]:checked');
    const data = {
      roll: res.v.roll.toUpperCase(),
      name: res.v.name,
      gender: checked ? checked.value : 'Female',
      className: $('#fClass').value,
      email: res.v.email,
      phone: res.v.phone,
      score: res.v.score === '' ? null : Math.round(Number(res.v.score) * 10) / 10
    };

    if (editingId) {
      const s = students.find((x) => x.id === editingId);
      Object.assign(s, data);
      toast('Student updated ✏️');
    } else {
      const nextId = students.reduce((m, s) => Math.max(m, s.id), 0) + 1;
      const nextAdded = students.reduce((m, s) => Math.max(m, s.added || 0), 0) + 1;
      students.push(Object.assign({ id: nextId, added: nextAdded }, data));
      toast('Student added 🎓');
    }
    save();
    closeAll();
    renderAll();
  });

  $('#addBtn').addEventListener('click', () => openForm(null));

  /* ---------- Delete ---------- */
  function openConfirm(id) {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    lastFocus = document.activeElement;
    deletingId = id;
    $('#confirmText').textContent = 'You are about to delete ' + s.name + ' (' + s.roll + '). This cannot be undone.';
    showOverlay();
    confirmModal.hidden = false;
    $('#confirmDelete').focus();
  }

  $('#confirmDelete').addEventListener('click', () => {
    const id = deletingId;
    students = students.filter((s) => s.id !== id);
    save();
    closeAll();
    renderAll();
    toast('Student deleted 🗑️');
  });

  /* ---------- Toolbar ---------- */
  $('#search').addEventListener('input', (e) => { view.query = e.target.value; view.page = 1; renderTable(); });
  $('#filterClass').addEventListener('change', (e) => { view.cls = e.target.value; view.page = 1; renderTable(); });
  $('#sortBy').addEventListener('change', (e) => { view.sort = e.target.value; view.page = 1; renderTable(); });

  /* ---------- CSV export ---------- */
  function csvCell(value) {
    let t = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; // stop spreadsheet formula injection
    return '"' + t.replace(/"/g, '""') + '"';
  }

  $('#exportBtn').addEventListener('click', () => {
    const list = filtered();
    if (!list.length) { toast('Nothing to export'); return; }
    const head = ['Roll no', 'Name', 'Gender', 'Class', 'Email', 'Phone', 'Score (%)'];
    const rows = list.map((s) => [s.roll, s.name, s.gender, s.className, s.email, s.phone, s.score]);
    const csv = [head].concat(rows).map((r) => r.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Exported ' + list.length + ' students ⬇');
  });

  /* ---------- Reset ---------- */
  $('#resetBtn').addEventListener('click', () => {
    students = seed();
    save();
    view.query = ''; view.cls = 'All'; view.sort = 'name'; view.page = 1;
    $('#search').value = ''; $('#filterClass').value = 'All'; $('#sortBy').value = 'name';
    renderAll();
    toast('Demo data restored');
  });

  /* ---------- Start ---------- */
  fillClassSelects();
  renderAll();
})();
