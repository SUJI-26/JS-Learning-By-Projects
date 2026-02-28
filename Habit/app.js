// Money Tracker - Vanilla JS

// Storage Keys
const STORAGE_KEY = 'money-tracker/expenses/v1';

// Elements
const form = document.getElementById('expenseForm');
const dateInput = document.getElementById('expenseDate');
const categorySelect = document.getElementById('expenseCategorySelect');
const categoryCustomWrap = document.getElementById('expenseCategoryCustomWrap');
const categoryCustomInput = document.getElementById('expenseCategoryCustom');
const amountInput = document.getElementById('expenseAmount');
const noteInput = document.getElementById('expenseNote');
const tbody = document.getElementById('expensesTbody');
const sumTotal = document.getElementById('sumTotal');
const sumCount = document.getElementById('sumCount');
const periodSelect = document.getElementById('periodSelect');
const dayPicker = document.getElementById('dayPicker');
const downloadDayBtn = document.getElementById('downloadDay');
const downloadWeekBtn = document.getElementById('downloadWeek');
const downloadMonthBtn = document.getElementById('downloadMonth');
const seedTodayBtn = document.getElementById('seedToday');
const budgetInput = document.getElementById('budgetInput');
const budgetAlert = document.getElementById('budgetAlert');
const toastContainer = document.getElementById('toastContainer');

const PRESET_CATEGORIES = [
  'Food','Transport','Groceries','Bills','Shopping','Health','Entertainment','Other'
];

let editingId = null;
let previousTotalValue = 0;
const BUDGET_KEY = 'money-tracker/budget';

// Charts
let charts = { donut: null, line: null };
const CATEGORY_PALETTE = ['#6ea8ff','#86e7b8','#ffb86b','#ff6b6b','#c792ea','#64d2ff','#ffd166','#a8ff60','#f78fb3','#b8b8ff'];
function colorForCategory(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

/** @typedef {{ id:string, date:string, category:string, amount:number, note:string }} Expense */

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map(normalizeExpense).filter(Boolean);
  } catch (_) {
    return [];
  }
}

/**
 * @param {Expense} e
 */
function normalizeExpense(e) {
  if (!e) return null;
  const id = typeof e.id === 'string' ? e.id : cryptoRandomId();
  const date = toISODateString(new Date(e.date));
  const category = String(e.category || '').trim();
  const amount = Number(e.amount || 0);
  const note = String(e.note || '').trim();
  if (!date || !category || isNaN(amount)) return null;
  return { id, date, category, amount, note };
}

function saveExpenses(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function cryptoRandomId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// CRUD
function addExpense(expense) {
  const list = loadExpenses();
  list.push(expense);
  saveExpenses(list);
}

function deleteExpense(id) {
  const list = loadExpenses().filter(e => e.id !== id);
  saveExpenses(list);
}

function updateExpense(updated) {
  const list = loadExpenses();
  const idx = list.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    list[idx] = normalizeExpense(updated);
    saveExpenses(list);
  }
}

// Period helpers
function toISODateString(d) {
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun - 6 Sat
  const diff = (day + 6) % 7; // make Monday start
  d.setDate(d.getDate() - diff);
  d.setHours(0,0,0,0);
  return d;
}

function endOfWeek(date) {
  const s = startOfWeek(date);
  const d = new Date(s);
  d.setDate(s.getDate() + 6);
  d.setHours(23,59,59,999);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0,0,0,0);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23,59,59,999);
  return d;
}

function inRange(isoDate, from, to) {
  const t = new Date(isoDate).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

// Rendering
function formatAmount(n) {
  return Number(n).toFixed(2);
}

function render() {
  const all = loadExpenses().sort((a,b) => a.date.localeCompare(b.date));

  const todayDate = new Date(dayPicker.value || new Date());
  const period = periodSelect.value;
  let filtered = all;
  if (period === 'day') {
    const iso = toISODateString(todayDate);
    filtered = all.filter(e => e.date === iso);
  } else if (period === 'week') {
    const s = startOfWeek(todayDate);
    const e = endOfWeek(todayDate);
    filtered = all.filter(exp => inRange(exp.date, s, e));
  } else if (period === 'month') {
    const s = startOfMonth(todayDate);
    const e = endOfMonth(todayDate);
    filtered = all.filter(exp => inRange(exp.date, s, e));
  }

  // summary
  const total = filtered.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  animateTotal(previousTotalValue, total);
  previousTotalValue = total;
  sumCount.textContent = String(filtered.length);

  // budget alert
  const storedBudget = Number(localStorage.getItem(BUDGET_KEY) || 0);
  if (budgetInput && !budgetInput.value && storedBudget) {
    budgetInput.value = String(storedBudget);
  }
  const budget = Number(budgetInput?.value || storedBudget || 0);
  const isScoped = periodSelect.value !== 'all';
  const over = budget > 0 && total > budget && isScoped;
  if (budgetAlert) {
    if (over) {
      const diff = total - budget;
      budgetAlert.style.display = '';
      budgetAlert.textContent = `Over budget by ${formatAmount(diff)} for this ${periodSelect.value}.`;
      sumTotal.classList.add('pulse');
    } else {
      budgetAlert.style.display = 'none';
      sumTotal.classList.remove('pulse');
    }
  }

  // rows
  tbody.innerHTML = '';
  for (const e of filtered) {
    const tr = document.createElement('tr');
    if (editingId === e.id) tr.classList.add('row-editing');
    const dateTd = document.createElement('td');
    if (editingId === e.id) {
      const input = document.createElement('input');
      input.type = 'date';
      input.value = e.date;
      input.id = `edit-date-${e.id}`;
      dateTd.appendChild(input);
    } else {
      dateTd.textContent = e.date;
    }
    const catTd = document.createElement('td');
    if (editingId === e.id) {
      const select = document.createElement('select');
      select.id = `edit-cat-${e.id}`;
      for (const c of PRESET_CATEGORIES) {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        if (c === (PRESET_CATEGORIES.includes(e.category) ? e.category : 'Other')) opt.selected = true;
        select.appendChild(opt);
      }
      const custom = document.createElement('input');
      custom.type = 'text';
      custom.placeholder = 'Type category';
      custom.value = PRESET_CATEGORIES.includes(e.category) ? '' : e.category;
      custom.id = `edit-cat-custom-${e.id}`;
      custom.style.marginTop = '6px';
      if (select.value !== 'Other') custom.style.display = 'none';
      select.addEventListener('change', () => {
        custom.style.display = select.value === 'Other' ? '' : 'none';
      });
      catTd.appendChild(select);
      catTd.appendChild(custom);
    } else {
      catTd.textContent = e.category;
    }
    const amtTd = document.createElement('td');
    amtTd.className = 'right';
    if (editingId === e.id) {
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '0.01';
      input.value = String(e.amount);
      input.id = `edit-amt-${e.id}`;
      amtTd.appendChild(input);
    } else {
      amtTd.textContent = formatAmount(e.amount);
    }
    const noteTd = document.createElement('td');
    if (editingId === e.id) {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = e.note || '';
      input.id = `edit-note-${e.id}`;
      noteTd.appendChild(input);
    } else {
      noteTd.textContent = e.note || '';
    }
    const actionsTd = document.createElement('td');
    actionsTd.className = 'right';
    if (editingId === e.id) {
      const wrap = document.createElement('div');
      wrap.className = 'row-actions';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn save';
      saveBtn.textContent = 'Save';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn';
      cancelBtn.textContent = 'Cancel';
      saveBtn.addEventListener('click', () => {
        const date = /** @type {HTMLInputElement} */(document.getElementById(`edit-date-${e.id}`)).value;
        const catSel = /** @type {HTMLSelectElement} */(document.getElementById(`edit-cat-${e.id}`));
        const catCustomEl = /** @type {HTMLInputElement} */(document.getElementById(`edit-cat-custom-${e.id}`));
        const category = catSel.value === 'Other' ? (catCustomEl.value || '').trim() : catSel.value;
        const amount = Number(/** @type {HTMLInputElement} */(document.getElementById(`edit-amt-${e.id}`)).value);
        const note = /** @type {HTMLInputElement} */(document.getElementById(`edit-note-${e.id}`)).value.trim();
        if (!date || !category || !(amount > 0)) {
          alert('Please fill date, category and a positive amount.');
          return;
        }
        updateExpense({ id: e.id, date, category, amount, note });
        editingId = null;
        showToast('Saved changes', 'success');
        render();
      });
      cancelBtn.addEventListener('click', () => { editingId = null; render(); });
      wrap.appendChild(saveBtn);
      wrap.appendChild(cancelBtn);
      actionsTd.appendChild(wrap);
    } else {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => { editingId = e.id; render(); });
      const delBtn = document.createElement('button');
      delBtn.className = 'btn danger';
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '8px';
      delBtn.addEventListener('click', () => {
        if (confirm('Delete this expense?')) {
          deleteExpense(e.id);
          showToast('Deleted expense', 'success');
          render();
        }
      });
      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(delBtn);
    }

    tr.appendChild(dateTd);
    tr.appendChild(catTd);
    tr.appendChild(amtTd);
    tr.appendChild(noteTd);
    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
  }

  // charts
  updateCharts(filtered, todayDate, period);
}

function updateCharts(filtered, baseDate, period) {
  // Category totals
  const catTotals = new Map();
  for (const e of filtered) {
    const key = e.category;
    catTotals.set(key, (catTotals.get(key) || 0) + Number(e.amount || 0));
  }
  const catLabels = Array.from(catTotals.keys());
  const catData = Array.from(catTotals.values());
  const catColors = catLabels.map(c => colorForCategory(c));

  // Daily totals within filtered range
  const dayTotals = new Map();
  for (const e of filtered) {
    dayTotals.set(e.date, (dayTotals.get(e.date) || 0) + Number(e.amount || 0));
  }
  let lineLabels = [];
  if (period === 'day') {
    const iso = toISODateString(baseDate);
    lineLabels = [iso];
  } else if (period === 'week') {
    const s = startOfWeek(baseDate);
    const e = endOfWeek(baseDate);
    const d = new Date(s);
    while (d <= e) {
      lineLabels.push(toISODateString(d));
      d.setDate(d.getDate() + 1);
    }
  } else if (period === 'month') {
    const s = startOfMonth(baseDate);
    const e = endOfMonth(baseDate);
    const d = new Date(s);
    while (d <= e) {
      lineLabels.push(toISODateString(d));
      d.setDate(d.getDate() + 1);
    }
  } else {
    // all: use distinct dates present
    lineLabels = Array.from(new Set(loadExpenses().map(x => x.date))).sort();
  }
  const lineData = lineLabels.map(lbl => Number(dayTotals.get(lbl) || 0));

  // Handle empty datasets
  const donutLabels = catLabels.length ? catLabels : ['No data'];
  const donutData = catLabels.length ? catData : [1];
  const donutColors = catLabels.length ? catColors : ['#303a66'];

  // Create or update charts
  const donutCtx = /** @type {HTMLCanvasElement} */(document.getElementById('catDonut'))?.getContext('2d');
  const lineCtx = /** @type {HTMLCanvasElement} */(document.getElementById('dailyLine'))?.getContext('2d');
  if (window.Chart && donutCtx) {
    if (!charts.donut) {
      charts.donut = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: donutLabels,
          datasets: [{ data: donutData, backgroundColor: donutColors, borderWidth: 0 }]
        },
        options: {
          responsive: true,
          animation: { duration: 600 },
          plugins: {
            legend: { position: 'bottom', labels: { color: '#e8ecf7' } },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } }
          },
          cutout: '60%'
        }
      });
    } else {
      charts.donut.data.labels = donutLabels;
      charts.donut.data.datasets[0].data = donutData;
      charts.donut.data.datasets[0].backgroundColor = donutColors;
      charts.donut.update();
    }
  }

  if (window.Chart && lineCtx) {
    if (!charts.line) {
      charts.line = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: lineLabels,
          datasets: [{
            label: 'Daily Spend',
            data: lineData,
            borderColor: '#6ea8ff',
            pointBackgroundColor: '#6ea8ff',
            pointRadius: 3,
            tension: 0.3,
            fill: true,
            backgroundColor: 'rgba(110,168,255,.15)'
          }]
        },
        options: {
          responsive: true,
          animation: { duration: 600 },
          scales: {
            x: { ticks: { color: '#9aa7c7' }, grid: { color: 'rgba(255,255,255,.05)' } },
            y: { ticks: { color: '#9aa7c7' }, grid: { color: 'rgba(255,255,255,.05)' } }
          },
          plugins: { legend: { labels: { color: '#e8ecf7' } } }
        }
      });
    } else {
      charts.line.data.labels = lineLabels;
      charts.line.data.datasets[0].data = lineData;
      charts.line.update();
    }
  }
}

// Animate total value
function animateTotal(from, to) {
  const durationMs = 500;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
    const val = from + (to - from) * eased;
    sumTotal.textContent = formatAmount(val);
    if (t < 1) requestAnimationFrame(step);
    else sumTotal.textContent = formatAmount(to);
  }
  requestAnimationFrame(step);
}

// CSV Export
function toCSV(rows) {
  const headers = ['Date','Category','Amount','Note'];
  const data = rows.map(r => [r.date, r.category, String(r.amount), r.note?.replace(/\n/g,' ') || '']);
  const all = [headers, ...data];
  return all.map(cols => cols.map(csvEscape).join(',')).join('\n');
}

function csvEscape(s) {
  const str = String(s ?? '');
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g,'""') + '"';
  return str;
}

function triggerDownload(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportPeriod(period) {
  const all = loadExpenses().sort((a,b) => a.date.localeCompare(b.date));
  const baseDate = new Date(dayPicker.value || new Date());
  let filtered = all;
  let name = 'all';
  if (period === 'day') {
    const iso = toISODateString(baseDate);
    filtered = all.filter(e => e.date === iso);
    name = iso;
  } else if (period === 'week') {
    const s = startOfWeek(baseDate);
    const e = endOfWeek(baseDate);
    filtered = all.filter(exp => inRange(exp.date, s, e));
    name = `${toISODateString(s)}_to_${toISODateString(e)}`;
  } else if (period === 'month') {
    const s = startOfMonth(baseDate);
    const e = endOfMonth(baseDate);
    filtered = all.filter(exp => inRange(exp.date, s, e));
    const y = s.getFullYear();
    const m = String(s.getMonth() + 1).padStart(2, '0');
    name = `${y}-${m}`;
  }
  const csv = toCSV(filtered);
  const filename = `expenses_${period}_${name}.csv`;
  triggerDownload(filename, csv);
}

// Events
form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const date = dateInput.value;
  const category = (categorySelect.value === 'Other' ? categoryCustomInput.value : categorySelect.value).trim();
  const amount = Number(amountInput.value);
  const note = noteInput.value.trim();

  if (!date || !category || !(amount > 0)) {
    alert('Please fill date, category and a positive amount.');
    return;
  }

  const exp = normalizeExpense({ id: cryptoRandomId(), date, category, amount, note });
  addExpense(exp);
  form.reset();
  // Keep date default to selected day
  dateInput.value = dayPicker.value;
  showToast('Expense added', 'success');
  render();
});

periodSelect.addEventListener('change', render);
dayPicker.addEventListener('change', () => {
  // also keep expense form date in sync
  dateInput.value = dayPicker.value;
  render();
});

downloadDayBtn.addEventListener('click', () => exportPeriod('day'));
downloadWeekBtn.addEventListener('click', () => exportPeriod('week'));
downloadMonthBtn.addEventListener('click', () => exportPeriod('month'));

// Category custom visibility
categorySelect?.addEventListener('change', () => {
  const showCustom = categorySelect.value === 'Other';
  categoryCustomWrap.style.display = showCustom ? '' : 'none';
});

// Seed today sample data (3–4 items)
function seedToday() {
  const base = new Date(dayPicker.value || new Date());
  const iso = toISODateString(base);
  const samples = [
    { date: iso, category: 'Food', amount: 8.5, note: 'Breakfast' },
    { date: iso, category: 'Transport', amount: 2.2, note: 'Bus' },
    { date: iso, category: 'Groceries', amount: 15.75, note: 'Veggies' },
    { date: iso, category: 'Other', amount: 3.0, note: 'Coffee' },
  ];
  const list = loadExpenses();
  for (const s of samples) {
    const exp = normalizeExpense({ id: cryptoRandomId(), ...s });
    list.push(exp);
  }
  saveExpenses(list);
  showToast('Added sample expenses for today', 'success');
  render();
}
seedTodayBtn?.addEventListener('click', seedToday);

// Initial render
render();

// Budget persistence
budgetInput?.addEventListener('change', () => {
  const v = Number(budgetInput.value || 0);
  localStorage.setItem(BUDGET_KEY, String(v));
  showToast('Budget updated', 'success');
  render();
});

// Budget quick set 3000
document.getElementById('budgetQuick3k')?.addEventListener('click', () => {
  if (!budgetInput) return;
  budgetInput.value = '3000';
  localStorage.setItem(BUDGET_KEY, '3000');
  showToast('Budget set to 3000', 'success');
  render();
});

// Toasts
function showToast(message, type) {
  if (!toastContainer) return;
  const el = document.createElement('div');
  el.className = `toast ${type || ''}`.trim();
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(() => el.remove(), 250);
  }, 1800);
}

