import React from 'react';

/**
 * TodoItem component displays a single todo with actions
 * @param {Object} todo - Todo object with id, title, topic_id, due_date, completed
 * @param {Array} topics - Array of all available topics
 * @param {Function} onDelete - Callback to delete this todo
 * @param {Function} onMove - Callback to move todo to different topic
 * @param {Function} onToggle - Callback to toggle completion status
 */
function TodoItem({ todo, topics, onDelete, onMove, onToggle }) {
  /**
   * Check if todo is overdue
   */
  const isOverdue = () => {
    if (!todo.due_date) return false;
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && !todo.completed;
  };

  /**
   * Format date to readable string
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const todoClasses = `todo-item ${todo.completed ? 'completed' : ''} ${
    isOverdue() ? 'overdue' : ''
  }`;

  return (
    <div className={todoClasses} role="listitem">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, todo.completed)}
        aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      
      <div className="todo-content">
        <h3 className="todo-title">{todo.title}</h3>
        <div className="todo-meta">
          {todo.due_date && (
            <div
              className={`todo-date ${isOverdue() ? 'overdue' : ''}`}
              role="text"
              aria-label={`Due date: ${formatDate(todo.due_date)}`}
            >
              📅 <span className="todo-date-value">{formatDate(todo.due_date)}</span>
            </div>
          )}
          {isOverdue() && <span className="overdue-badge">⚠️ Overdue</span>}
        </div>
      </div>

      <div className="todo-actions">
        <select
          className="move-select"
          defaultValue={todo.topic_id}
          onChange={e => onMove(todo.id, parseInt(e.target.value))}
          aria-label="Move todo to different topic"
        >
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>

        <button
          className="delete-btn"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete ${todo.title}`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
