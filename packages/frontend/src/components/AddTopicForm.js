import React, { useState } from 'react';

/**
 * AddTopicForm component provides a form to create new topics
 * @param {Function} onAddTopic - Callback to handle adding a new topic
 */
function AddTopicForm({ onAddTopic }) {
  const [topicName, setTopicName] = useState('');

  /**
   * Handle form submission
   */
  const handleSubmit = e => {
    e.preventDefault();
    if (!topicName.trim()) {
      alert('Please enter a topic name');
      return;
    }
    onAddTopic(topicName);
    setTopicName('');
  };

  return (
    <form className="add-topic-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="topic-name">New Topic</label>
        <input
          id="topic-name"
          type="text"
          placeholder="Topic name..."
          value={topicName}
          onChange={e => setTopicName(e.target.value)}
          required
          aria-required="true"
        />
      </div>
      <button type="submit">+ Add Topic</button>
    </form>
  );
}

export default AddTopicForm;
