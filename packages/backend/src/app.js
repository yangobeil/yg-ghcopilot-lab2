const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

/**
 * Initialize database schema for TODO app
 * Creates tables for topics and todos with proper relationships
 */
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#FFDD00',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      topic_id INTEGER NOT NULL,
      due_date DATE,
      completed INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
  `);
}

/**
 * Insert sample data for testing
 */
function insertSampleData() {
  try {
    const topicsStmt = db.prepare('INSERT INTO topics (name, color) VALUES (?, ?)');
    topicsStmt.run('Work', '#FFDD00');
    topicsStmt.run('Personal', '#FFDD00');
    topicsStmt.run('Shopping', '#FFDD00');

    const todosStmt = db.prepare(
      'INSERT INTO todos (title, topic_id, due_date, completed) VALUES (?, ?, ?, ?)'
    );
    todosStmt.run('Complete project report', 1, '2026-08-15', 0);
    todosStmt.run('Review pull requests', 1, '2026-08-10', 0);
    todosStmt.run('Call dentist', 2, '2026-08-05', 0);
    todosStmt.run('Buy groceries', 3, '2026-07-29', 0);

    console.log('Database initialized with sample data');
  } catch (error) {
    console.error('Sample data already exists or error occurred:', error.message);
  }
}

// Initialize database
initializeDatabase();
insertSampleData();

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TODO Backend API is running' });
});

// ============================================================================
// TOPIC ENDPOINTS
// ============================================================================

/**
 * GET /api/topics
 * Retrieve all topics
 */
app.get('/api/topics', (req, res) => {
  try {
    const topics = db.prepare('SELECT * FROM topics ORDER BY created_at ASC').all();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

/**
 * POST /api/topics
 * Create a new topic
 */
app.post('/api/topics', (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Topic name is required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO topics (name, color) VALUES (?, ?)');
    const result = stmt.run(name, color || '#FFDD00');
    const newTopic = db.prepare('SELECT * FROM topics WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTopic);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Topic name already exists' });
    } else {
      console.error('Error creating topic:', error);
      res.status(500).json({ error: 'Failed to create topic' });
    }
  }
});

// ============================================================================
// TODO ENDPOINTS
// ============================================================================

/**
 * GET /api/todos
 * Retrieve all todos with optional filtering by topic or due date range
 * Query parameters:
 *   - topic: Filter by topic_id
 *   - dueDateStart: Start date for due date range filter (YYYY-MM-DD)
 *   - dueDateEnd: End date for due date range filter (YYYY-MM-DD)
 */
app.get('/api/todos', (req, res) => {
  try {
    let query = 'SELECT * FROM todos';
    const params = [];

    if (req.query.topic) {
      query += ' WHERE topic_id = ?';
      params.push(parseInt(req.query.topic));
    }

    if (req.query.dueDateStart || req.query.dueDateEnd) {
      const operator = query.includes('WHERE') ? 'AND' : 'WHERE';
      if (req.query.dueDateStart && req.query.dueDateEnd) {
        query += ` ${operator} due_date BETWEEN ? AND ?`;
        params.push(req.query.dueDateStart, req.query.dueDateEnd);
      } else if (req.query.dueDateStart) {
        query += ` ${operator} due_date >= ?`;
        params.push(req.query.dueDateStart);
      } else if (req.query.dueDateEnd) {
        query += ` ${operator} due_date <= ?`;
        params.push(req.query.dueDateEnd);
      }
    }

    query += ' ORDER BY created_at DESC';

    const todos = db.prepare(query).all(...params);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

/**
 * POST /api/todos
 * Create a new todo
 */
app.post('/api/todos', (req, res) => {
  const { title, topic_id, due_date } = req.body;

  if (!title || !topic_id) {
    return res.status(400).json({ error: 'Title and topic_id are required' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO todos (title, topic_id, due_date) VALUES (?, ?, ?)'
    );
    const result = stmt.run(title, topic_id, due_date || null);
    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

/**
 * PUT /api/todos/:id
 * Update an existing todo (title, topic, due_date, or completed status)
 */
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, topic_id, due_date, completed } = req.body;

  try {
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (topic_id !== undefined) {
      updates.push('topic_id = ?');
      values.push(topic_id);
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(due_date);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

/**
 * DELETE /api/todos/:id
 * Delete a todo by ID
 */
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

/**
 * GET /api/todos/group/by-topic
 * Retrieve all todos grouped by topic
 */
app.get('/api/todos/group/by-topic', (req, res) => {
  try {
    const topics = db.prepare('SELECT * FROM topics ORDER BY created_at ASC').all();
    const result = {};

    topics.forEach(topic => {
      const todos = db.prepare('SELECT * FROM todos WHERE topic_id = ? ORDER BY created_at DESC').all(topic.id);
      result[topic.id] = {
        topic,
        todos
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching grouped todos:', error);
    res.status(500).json({ error: 'Failed to fetch grouped todos' });
  }
});
module.exports = { app, db };