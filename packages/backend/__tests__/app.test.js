const request = require('supertest');
const { app, db } = require('../src/app');

/**
 * Test suite for TODO API endpoints
 * Tests CRUD operations for todos and topics
 */
describe('TODO API - Topics', () => {
  describe('GET /api/topics', () => {
    it('should retrieve all topics', async () => {
      const response = await request(app)
        .get('/api/topics')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('color');
    });
  });

  describe('POST /api/topics', () => {
    it('should create a new topic', async () => {
      const response = await request(app)
        .post('/api/topics')
        .send({ name: 'Testing', color: '#FFDD00' })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Testing');
      expect(response.body.color).toBe('#FFDD00');
    });

    it('should reject topic creation without name', async () => {
      const response = await request(app)
        .post('/api/topics')
        .send({ color: '#FFDD00' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject duplicate topic names', async () => {
      await request(app)
        .post('/api/topics')
        .send({ name: 'Unique Topic', color: '#FFDD00' });

      const response = await request(app)
        .post('/api/topics')
        .send({ name: 'Unique Topic', color: '#FFDD00' })
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('TODO API - Todos', () => {
  let topicId;

  beforeAll(async () => {
    const topicResponse = await request(app)
      .post('/api/topics')
      .send({ name: 'Test Topic', color: '#FFDD00' });

    topicId = topicResponse.body.id;
  });

  describe('GET /api/todos', () => {
    it('should retrieve all todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter todos by topic', async () => {
      const response = await request(app)
        .get(`/api/todos?topic=${topicId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(todo => {
        expect(todo.topic_id).toBe(topicId);
      });
    });

    it('should filter todos by due date range', async () => {
      const startDate = '2026-08-01';
      const endDate = '2026-08-31';

      const response = await request(app)
        .get(`/api/todos?dueDateStart=${startDate}&dueDateEnd=${endDate}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Test Todo',
          topic_id: topicId,
          due_date: '2026-08-20',
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Todo');
      expect(response.body.topic_id).toBe(topicId);
      expect(response.body.completed).toBe(0);
    });

    it('should create todo without due date', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Todo without date',
          topic_id: topicId,
        })
        .expect(201);

      expect(response.body.due_date).toBeNull();
    });

    it('should reject todo creation without title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ topic_id: topicId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject todo creation without topic_id', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Todo to Update',
          topic_id: topicId,
        });

      todoId = response.body.id;
    });

    it('should update todo title', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should update todo due date', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ due_date: '2026-09-01' })
        .expect(200);

      expect(response.body.due_date).toBe('2026-09-01');
    });

    it('should toggle todo completion status', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.completed).toBe(1);
    });

    it('should move todo to different topic', async () => {
      const newTopic = await request(app)
        .post('/api/topics')
        .send({ name: 'New Topic', color: '#FFDD00' });

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ topic_id: newTopic.body.id })
        .expect(200);

      expect(response.body.topic_id).toBe(newTopic.body.id);
    });

    it('should reject update with no fields', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/99999')
        .send({ title: 'Test' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Todo to Delete',
          topic_id: topicId,
        });

      todoId = response.body.id;
    });

    it('should delete a todo', async () => {
      await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(204);

      // Verify todo is deleted
      const todos = await request(app).get('/api/todos');
      const deleted = todos.body.find(t => t.id === todoId);
      expect(deleted).toBeUndefined();
    });

    it('should return 404 when deleting non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/todos/group/by-topic', () => {
    it('should retrieve todos grouped by topic', async () => {
      const response = await request(app)
        .get('/api/todos/group/by-topic')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(typeof response.body).toBe('object');
      Object.keys(response.body).forEach(topicIdKey => {
        expect(response.body[topicIdKey]).toHaveProperty('topic');
        expect(response.body[topicIdKey]).toHaveProperty('todos');
        expect(Array.isArray(response.body[topicIdKey].todos)).toBe(true);
      });
    });
  });
});

describe('TODO API - Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('ok');
  });
});

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});