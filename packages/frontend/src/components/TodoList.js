import React from 'react';
import TodoItem from './TodoItem';

/**
 * TodoList component displays all todos in the selected topic
 * @param {Array} todos - Array of todo objects
 * @param {Array} topics - Array of all available topics
 * @param {Function} onDeleteTodo - Callback to handle todo deletion
 * @param {Function} onMoveTodo - Callback to handle moving todo to different topic
 * @param {Function} onToggleTodo - Callback to handle toggling todo completion status
 */
function TodoList({ todos, topics, onDeleteTodo, onMoveTodo, onToggleTodo }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>No todos yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="todo-list" role="list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          topics={topics}
          onDelete={onDeleteTodo}
          onMove={onMoveTodo}
          onToggle={onToggleTodo}
        />
      ))}
    </div>
  );
}

export default TodoList;
