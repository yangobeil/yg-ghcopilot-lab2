const request = require('supertest');
const { app, db } = require('../../src/app');

/**
 * Integration tests for TODO API endpoints
 * Tests the complete API with real HTTP requests and database interactions
 */
describe('TODO API Integration Tests - Topics', () => {
  describe('Topic CRUD Operations', () => {
    it('should create and retrieve a topic', async () => {
      const newTopic = { name: 'Integration Test Topic', color: '#FFDD00' };

      const createRes = await request(app)
        .post('/api/topics')
        .send(newTopic)
        .expect(201);

      expect(createRes.body).toHaveProperty('id');
      expect(createRes.body.name).toBe(newTopic.name);
      expect(createRes.body.color).toBe(newTopic.color);

      const topicId = createRes.body.id;

      // Verify retrieval
      const getRes = await request(app)
        .get('/api/topics')
        .expect(200);

      const retrievedTopic = getRes.body.find(t => t.id === topicId);
      expect(retrievedTopic).toBeDefined();
      expect(retrievedTopic.name).toBe(newTopic.name);
    });

    it('should handle duplicate topic names with error', async () => {
      const topicName = 'Duplicate Test';

      // Create first topic
      await request(app)
        .post('/api/topics')
        .send({ name: topicName, color: '#FFDD00' })
        .expect(201);

      // Attempt to create duplicate
      const res = await request(app)
        .post('/api/topics')
        .send({ name: topicName, color: '#FFDD00' })
        .expect(409);

      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('TODO API Integration Tests - Todos with Topics', () => {
  let topicId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/topics')
      .send({ name: 'Integration Topic', color: '#FFDD00' });
    topicId = res.body.id;
  });

  describe('Todo CRUD Operations', () => {
    it('should create a complete todo with all fields', async () => {
      const newTodo = {
        title: 'Complete integration test',
        topic_id: topicId,
        due_date: '2026-12-31',
      };

      const res = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(newTodo.title);
      expect(res.body.topic_id).toBe(topicId);
      expect(res.body.due_date).toBe(newTodo.due_date);
      expect(res.body.completed).toBe(0);
    });

    it('should update todo with multiple field changes', async () => {
      // Create a todo
      const createRes = await request(app)
        .post('/api/todos')
        .send({
          title: 'Original Title',
          topic_id: topicId,
          due_date: '2026-08-15',
        })
        .expect(201);

      const todoId = createRes.body.id;

      // Update multiple fields
      const updateRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({
          title: 'Updated Title',
          due_date: '2026-09-20',
          completed: true,
        })
        .expect(200);

      expect(updateRes.body.title).toBe('Updated Title');
      expect(updateRes.body.due_date).toBe('2026-09-20');
      expect(updateRes.body.completed).toBe(1);
    });

    it('should delete a todo and verify removal', async () => {
      // Create a todo
      const createRes = await request(app)
        .post('/api/todos')
        .send({
          title: 'Todo to Delete',
          topic_id: topicId,
        })
        .expect(201);

      const todoId = createRes.body.id;

      // Delete the todo
      await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(204);

      // Verify deletion
      const allTodos = await request(app).get('/api/todos').expect(200);
      const deleted = allTodos.body.find(t => t.id === todoId);
      expect(deleted).toBeUndefined();
    });
  });

  describe('Todo Filtering and Grouping', () => {
    beforeAll(async () => {
      // Create multiple todos for filtering tests
      const todos = [
        { title: 'Task A', topic_id: topicId, due_date: '2026-08-10' },
        { title: 'Task B', topic_id: topicId, due_date: '2026-08-20' },
        { title: 'Task C', topic_id: topicId, due_date: '2026-09-05' },
      ];

      for (const todo of todos) {
        await request(app)
          .post('/api/todos')
          .send(todo);
      }
    });

    it('should filter todos by topic', async () => {
      const res = await request(app)
        .get(`/api/todos?topic=${topicId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(todo => {
        expect(todo.topic_id).toBe(topicId);
      });
    });

    it('should filter todos by due date range', async () => {
      const res = await request(app)
        .get('/api/todos?dueDateStart=2026-08-01&dueDateEnd=2026-08-31')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(todo => {
        if (todo.due_date) {
          const dueDate = new Date(todo.due_date);
          expect(dueDate >= new Date('2026-08-01')).toBe(true);
          expect(dueDate <= new Date('2026-08-31')).toBe(true);
        }
      });
    });

    it('should group todos by topic', async () => {
      const res = await request(app)
        .get('/api/todos/group/by-topic')
        .expect(200);

      expect(typeof res.body).toBe('object');
      Object.keys(res.body).forEach(key => {
        expect(res.body[key]).toHaveProperty('topic');
        expect(res.body[key]).toHaveProperty('todos');
        expect(Array.isArray(res.body[key].todos)).toBe(true);
      });
    });
  });

  describe('Error Handling and Validation', () => {
    it('should reject todo creation without required fields', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Missing topic' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app)
        .put('/api/todos/99999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject update with no fields', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Test', topic_id: topicId })
        .expect(201);

      const todoId = createRes.body.id;

      const res = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Move Todo Between Topics', () => {
    it('should move a todo from one topic to another', async () => {
      // Create second topic
      const topic2Res = await request(app)
        .post('/api/topics')
        .send({ name: 'Second Topic', color: '#FFDD00' })
        .expect(201);

      const topic2Id = topic2Res.body.id;

      // Create todo in first topic
      const todoRes = await request(app)
        .post('/api/todos')
        .send({
          title: 'Mobile Todo',
          topic_id: topicId,
        })
        .expect(201);

      const todoId = todoRes.body.id;

      // Move to second topic
      const moveRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ topic_id: topic2Id })
        .expect(200);

      expect(moveRes.body.topic_id).toBe(topic2Id);

      // Verify it's no longer in first topic
      const topic1Todos = await request(app)
        .get(`/api/todos?topic=${topicId}`)
        .expect(200);

      const stillInTopic1 = topic1Todos.body.find(t => t.id === todoId);
      expect(stillInTopic1).toBeUndefined();
    });
  });
});

describe('TODO API Integration Tests - Isolation', () => {
  it('test 1: should have independent data setup', async () => {
    const topic1 = await request(app)
      .post('/api/topics')
      .send({ name: 'Isolated Topic 1', color: '#FFDD00' })
      .expect(201);

    const todo1 = await request(app)
      .post('/api/todos')
      .send({ title: 'Isolated Todo 1', topic_id: topic1.body.id })
      .expect(201);

    expect(todo1.body.topic_id).toBe(topic1.body.id);
  });

  it('test 2: should have independent data setup (different from test 1)', async () => {
    const topic2 = await request(app)
      .post('/api/topics')
      .send({ name: 'Isolated Topic 2', color: '#FFDD00' })
      .expect(201);

    const todo2 = await request(app)
      .post('/api/todos')
      .send({ title: 'Isolated Todo 2', topic_id: topic2.body.id })
      .expect(201);

    expect(todo2.body.topic_id).toBe(topic2.body.id);
  });
});

afterAll(() => {
  if (db) {
    db.close();
  }
});
