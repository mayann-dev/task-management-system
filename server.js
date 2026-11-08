const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

// Allow the server to read JSON data
app.use(express.json());

// Display the frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new Database('tasks.db');

// Create tasks table if it does not exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'Pending'
    )
`).run();

// Get all tasks from the database
app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    res.json(tasks);
});

// Add a new task
app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Task title is required' });
    }

    const result = db.prepare(
        'INSERT INTO tasks (title, description) VALUES (?, ?)'
    ).run(title.trim(), description || '');

    res.json({ id: result.lastInsertRowid, message: 'Task added successfully' });
});
   // Edit a task
app.put('/api/tasks/:id', (req, res) => {
    const { title, description, status } = req.body;

    const result = db.prepare(`
        UPDATE tasks
        SET title = ?, description = ?, status = ?
        WHERE id = ?
    `).run(title, description, status, req.params.id);

    res.json({ message: 'Task updated successfully' });
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);

    res.json({ message: 'Task deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});