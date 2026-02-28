// ===== Local Storage Keys =====
const STORAGE_KEY_EXPENSES = 'expense-tracker/expenses';
const STORAGE_KEY_BUDGET = 'expense-tracker/budget';

// ===== Select Elements =====
const form = document.getElementById('expenseForm');
const expenseName = document.getElementById('expenseName');
const expenseAmount = document.getElementById('expenseAmount');
const expenseCategory = document.getElementById('expenseCategory');
const expenseList = document.getElementById('expenseList');
const budgetInput = document.getElementById('budgetInput');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const budgetValue = document.getElementById('budgetValue');
const spentValue = document.getElementById('spentValue');
const progress = document.getElementById('progress');
const chartCanvas = document.getElementById('expenseChart');

// ===== Load Data =====
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY_EXPENSES)) || [];
let budget = parseFloat(localStorage.getItem(STORAGE_KEY_BUDGET)) || 0;
let expenseChart;

updateUI();

// ===== Add Expense =====
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = expenseName.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const category = expenseCategory.value;

  if (!name || !amount) return;

  const expense = { id: Date.now(), name, amount, category };
  expenses.push(expense);
  saveExpenses();
  form.reset();
  updateUI();
});

// ===== Set Budget =====
setBudgetBtn.addEventListener('click', () => {
  const newBudget = parseFloat(budgetInput.value);
  if (!newBudget || newBudget <= 0) return;
  budget = newBudget;
  localStorage.setItem(STORAGE_KEY_BUDGET, budget);
  updateUI();
});

// ===== Update UI =====
function updateUI() {
  expenseList.innerHTML = '';
  let totalSpent = 0;

  expenses.forEach(exp => {
    totalSpent += exp.amount;
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${exp.name} - ₹${exp.amount} (${exp.category})</span>
      <button onclick="deleteExpense(${exp.id})">❌</button>
    `;
    expenseList.appendChild(li);
  });

  spentValue.textContent = totalSpent;
  budgetValue.textContent = budget;

  const percent = budget ? Math.min((totalSpent / budget) * 100, 100) : 0;
  progress.style.width = percent + '%';

  if (totalSpent > budget && budget > 0) {
    progress.style.background = 'linear-gradient(90deg, #ff0000, #ff6a00)';
  } else {
    progress.style.background = 'linear-gradient(90deg, #00c6ff, #0072ff)';
  }

  updateChart();
}

// ===== Delete Expense =====
function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses();
  updateUI();
}

// ===== Save =====
function saveExpenses() {
  localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
}

// ===== Chart Update =====
function updateChart() {
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'
        ],
        hoverOffset: 8
      }]
    },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      animation: { duration: 1200, easing: 'easeOutQuart' }
    }
  });
}

// ===== Floating Particles Background =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

for (let i = 0; i < 50; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
