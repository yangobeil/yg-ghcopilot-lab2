import React, { useState, useEffect } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import AddTopicForm from './components/AddTopicForm';

/**
 * Main App component for the TODO application
 * Manages global state for topics and todos
 */
function App() {
  const [topics, setTopics] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Fetch topics and todos on component mount
  useEffect(() => {
    fetchTopics();
    fetchTodos();
  }, []);

  /**
   * Fetch all topics from the API
   */
  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
      if (data.length > 0 && !selectedTopic) {
        setSelectedTopic(data[0].id);
      }
    } catch (err) {
      setError('Error fetching topics: ' + err.message);
      console.error('Error fetching topics:', err);
    }
  };

  /**
   * Fetch all todos from the API
   */
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Error fetching todos: ' + err.message);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle adding a new topic
   */
  const handleAddTopic = async (topicName) => {
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: topicName, color: '#FFDD00' }),
      });
      if (!response.ok) throw new Error('Failed to add topic');
      await fetchTopics();
    } catch (err) {
      setError('Error adding topic: ' + err.message);
      console.error('Error adding topic:', err);
    }
  };

  /**
   * Handle adding a new todo
   */
  const handleAddTodo = async (todoTitle, dueDate) => {
    if (!selectedTopic) {
      setError('Please select a topic first');
      return;
    }
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todoTitle,
          topic_id: selectedTopic,
          due_date: dueDate || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to add todo');
      await fetchTodos();
    } catch (err) {
      setError('Error adding todo: ' + err.message);
      console.error('Error adding todo:', err);
    }
  };

  /**
   * Handle deleting a todo
   */
  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      await fetchTodos();
    } catch (err) {
      setError('Error deleting todo: ' + err.message);
      console.error('Error deleting todo:', err);
    }
  };

  /**
   * Handle moving a todo to a different topic
   */
  const handleMoveTodo = async (todoId, newTopicId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: newTopicId }),
      });
      if (!response.ok) throw new Error('Failed to move todo');
      await fetchTodos();
    } catch (err) {
      setError('Error moving todo: ' + err.message);
      console.error('Error moving todo:', err);
    }
  };

  /**
   * Handle toggling todo completed status
   */
  const handleToggleTodo = async (todoId, completed) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!response.ok) throw new Error('Failed to toggle todo');
      await fetchTodos();
    } catch (err) {
      setError('Error toggling todo: ' + err.message);
      console.error('Error toggling todo:', err);
    }
  };

  const filteredTodos = selectedTopic
    ? todos.filter(todo => todo.topic_id === selectedTopic)
    : todos;

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 TODO App</h1>
        <p>Organize your tasks by topic</p>
      </header>

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button
            className="close-btn"
            onClick={() => setError(null)}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      <div className="app-container">
        <aside className="sidebar">
          <h2>Topics</h2>
          <nav className="topic-list" role="navigation" aria-label="Topics">
            {topics.map(topic => (
              <button
                key={topic.id}
                className={`topic-button ${
                  selectedTopic === topic.id ? 'active' : ''
                }`}
                onClick={() => setSelectedTopic(topic.id)}
                aria-label={`Select topic: ${topic.name}`}
                aria-current={selectedTopic === topic.id ? 'page' : undefined}
              >
                {topic.name}
              </button>
            ))}
          </nav>
          <AddTopicForm onAddTopic={handleAddTopic} />
        </aside>

        <main className="main-content">
          {selectedTopic && (
            <>
              <AddTodoForm onAddTodo={handleAddTodo} />
              {loading ? (
                <div className="loading">Loading todos...</div>
              ) : (
                <TodoList
                  todos={filteredTodos}
                  topics={topics}
                  onDeleteTodo={handleDeleteTodo}
                  onMoveTodo={handleMoveTodo}
                  onToggleTodo={handleToggleTodo}
                />
              )}
            </>
          )}
          {!selectedTopic && topics.length === 0 && (
            <div className="empty-state">
              <p>No topics yet. Create one to get started!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
