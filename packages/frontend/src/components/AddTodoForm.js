import React, { useState } from 'react';

/**
 * AddTodoForm component provides a form to create new todos
 * @param {Function} onAddTodo - Callback to handle adding a new todo
 */
function AddTodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  /**
   * Handle form submission
   */
  const handleSubmit = e => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a todo title');
      return;
    }
    onAddTodo(title, dueDate || null);
    setTitle('');
    setDueDate('');
  };

  return (
    <div className="form-container">
      <h3>Add New Todo</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="todo-title">Todo Title</label>
          <input
            id="todo-title"
            type="text"
            placeholder="Enter your todo..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="todo-due-date">Due Date (Optional)</label>
          <input
            id="todo-due-date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit">Add Todo</button>
        </div>
      </form>
    </div>
  );
}

export default AddTodoForm;
