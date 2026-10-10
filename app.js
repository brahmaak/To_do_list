const STORAGE_KEY = 'task_flow_items';
let tasks = [];
let currentFilter = 'all';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCounter = document.getElementById('task-counter');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const dateDisplay = document.getElementById('date-display');

function init() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  dateDisplay.textContent = new Date().toLocaleDateString(undefined, options);

  tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;
    tasks.unshift({
      id: Date.now().toString(),
      text,
      completed: false
    });
    taskInput.value = '';
    saveAndRender();
  });

  filterBtns.forEach(btn => btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    e.target.classList.add('active');
    e.target.setAttribute('aria-pressed', 'true');
    currentFilter = e.target.dataset.filter;
    render();
  }));

  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
  });

  taskList.addEventListener('click', (e) => {
    const id = e.target.closest('[data-id]')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.delete-btn')) {
      tasks = tasks.filter(t => t.id !== id);
    } else if (e.target.matches('.custom-checkbox')) {
      const task = tasks.find(t => t.id === id);
      if (task) task.completed = !task.completed;
    }
    saveAndRender();
  });

  render();
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  render();
}

function render() {
  const filtered = tasks.filter(t => {
    if (currentFilter === 'active') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  taskList.innerHTML = '';
  emptyState.hidden = filtered.length > 0;

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    li.innerHTML = `
      <input type="checkbox" class="custom-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''} aria-label="Mark completed">
      <span class="task-text">${task.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>
      <button type="button" class="delete-btn" data-id="${task.id}" aria-label="Delete">🗑️</button>
    `;
    taskList.appendChild(li);
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  taskCounter.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} left`;
  clearCompletedBtn.style.visibility = tasks.some(t => t.completed) ? 'visible' : 'hidden';
}

init();
