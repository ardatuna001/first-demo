// ===========================
// Todo App - Local Storage
// ===========================

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    // ===========================
    // Local Storage Methods
    // ===========================

    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('todos');
        this.todos = stored ? JSON.parse(stored) : [];
    }

    // ===========================
    // Todo CRUD Operations
    // ===========================

    addTodo(text, priority = 'medium') {
        if (!text.trim()) {
            alert('Please enter a task!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            priority: priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        this.clearInput();
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToStorage();
            this.render();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.render();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Edit task:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            todo.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.render();
        }
    }

    clearCompleted() {
        if (this.todos.some(t => t.completed)) {
            if (confirm('Delete all completed tasks?')) {
                this.todos = this.todos.filter(todo => !todo.completed);
                this.saveToStorage();
                this.render();
            }
        } else {
            alert('No completed tasks to clear!');
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            alert('No tasks to clear!');
            return;
        }

        if (confirm('Are you sure? This will delete ALL tasks!')) {
            this.todos = [];
            this.saveToStorage();
            this.render();
        }
    }

    // ===========================
    // Filter Methods
    // ===========================

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    // ===========================
    // Stats Methods
    // ===========================

    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        return { total, active, completed };
    }

    updateStats() {
        const { total, active, completed } = this.getStats();
        document.getElementById('total-count').textContent = total;
        document.getElementById('active-count').textContent = active;
        document.getElementById('completed-count').textContent = completed;
    }

    // ===========================
    // Rendering Methods
    // ===========================

    render() {
        this.renderTodoList();
        this.updateStats();
        this.updateFilterButtons();
        this.updateEmptyState();
    }

    renderTodoList() {
        const list = document.getElementById('todo-list');
        const filtered = this.getFilteredTodos();

        list.innerHTML = filtered.map(todo => this.createTodoElement(todo)).join('');
    }

    createTodoElement(todo) {
        const priorityClass = `priority-${todo.priority}`;
        const completedClass = todo.completed ? 'completed' : '';

        return `
            <li class="todo-item ${completedClass}" data-id="${todo.id}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="priority-badge ${priorityClass}">${todo.priority}</span>
                <div class="todo-buttons">
                    <button 
                        class="btn-edit" 
                        onclick="app.editTodo(${todo.id})"
                        title="Edit"
                    >
                        ✎
                    </button>
                    <button 
                        class="btn-delete" 
                        onclick="app.deleteTodo(${todo.id})"
                        title="Delete"
                    >
                        ✕
                    </button>
                </div>
            </li>
        `;
    }

    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            }
        });
    }

    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const filtered = this.getFilteredTodos();

        if (filtered.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
        }
    }

    // ===========================
    // Utility Methods
    // ===========================

    clearInput() {
        document.getElementById('todo-input').value = '';
        document.getElementById('todo-input').focus();
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // ===========================
    // Event Listeners
    // ===========================

    setupEventListeners() {
        // Form submission
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('todo-input');
            this.addTodo(input.value);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
            });
        });

        // Action buttons
        document.getElementById('clear-completed-btn').addEventListener('click', () => {
            this.clearCompleted();
        });

        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAll();
        });

        // Auto-focus input on load
        document.getElementById('todo-input').focus();
    }
}

// ===========================
// Initialize App
// ===========================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
    console.log('📝 Todo App Loaded - Local storage enabled!');
});