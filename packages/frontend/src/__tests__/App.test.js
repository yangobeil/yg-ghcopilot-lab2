import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

/**
 * Mock server for testing TODO API
 * Handles topic and todo endpoints
 */
const server = setupServer(
  rest.get('/api/topics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Work', color: '#FFDD00', created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, name: 'Personal', color: '#FFDD00', created_at: '2023-01-02T00:00:00.000Z' },
      ])
    );
  }),

  rest.post('/api/topics', (req, res, ctx) => {
    const { name } = req.body;
    if (!name) {
      return res(ctx.status(400), ctx.json({ error: 'Topic name is required' }));
    }
    return res(
      ctx.status(201),
      ctx.json({ id: 3, name, color: '#FFDD00', created_at: new Date().toISOString() })
    );
  }),

  rest.get('/api/todos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: 'Complete project report',
          topic_id: 1,
          due_date: '2026-08-15',
          completed: 0,
          created_at: '2023-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          title: 'Call dentist',
          topic_id: 2,
          due_date: '2026-08-05',
          completed: 0,
          created_at: '2023-01-02T00:00:00.000Z',
        },
      ])
    );
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { title, topic_id } = req.body;
    if (!title || !topic_id) {
      return res(ctx.status(400), ctx.json({ error: 'Title and topic_id are required' }));
    }
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        topic_id,
        due_date: req.body.due_date || null,
        completed: 0,
        created_at: new Date().toISOString(),
      })
    );
  }),

  rest.put('/api/todos/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(req.params.id),
        title: req.body.title || 'Updated Todo',
        topic_id: req.body.topic_id || 1,
        due_date: req.body.due_date || null,
        completed: req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : 0,
        created_at: '2023-01-01T00:00:00.000Z',
      })
    );
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('📋 TODO App')).toBeInTheDocument();
    expect(screen.getByText('Organize your tasks by topic')).toBeInTheDocument();
  });

  test('loads and displays topics', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });
  });

  test('loads and displays todos for selected topic', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Complete project report')).toBeInTheDocument();
    });
  });

  test('allows user to add a new topic', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Topic name...');
    await user.type(input, 'Shopping');

    const addButton = screen.getByRole('button', { name: /\+ Add Topic/ });
    await user.click(addButton);
  });

  test('allows user to add a new todo', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText('Enter your todo...');
    await user.type(titleInput, 'New Todo Task');

    const addButton = screen.getByRole('button', { name: 'Add Todo' });
    await user.click(addButton);
  });

  test('handles API error gracefully', async () => {
    server.use(
      rest.get('/api/topics', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error fetching topics/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no topics', async () => {
    server.use(
      rest.get('/api/topics', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No topics yet. Create one to get started!')).toBeInTheDocument();
    });
  });

  test('filters todos by selected topic', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    // Click on Personal topic
    const personalButton = screen.getAllByRole('button', { name: /Select topic/ })[1];
    await user.click(personalButton);

    await waitFor(() => {
      expect(screen.getByText('Call dentist')).toBeInTheDocument();
    });
  });
});
