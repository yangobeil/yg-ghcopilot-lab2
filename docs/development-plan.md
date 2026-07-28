# TODO App Development Plan

This plan outlines the development roadmap for the TODO app, incorporating all established guidelines for functionality, UI, testing, and code quality.

## Phase 1: Project Setup & Infrastructure

### Backend Setup
- Initialize Node.js backend with Express.js
- Set up database schema for todos, topics, and due dates
- Configure environment variables and deployment settings
- Follow coding guidelines: document all setup procedures

### Frontend Setup
- Initialize React application
- Set up development environment with build tools
- Configure styling framework with black (#000000) and yellow (#FFDD00) color variables
- Follow UI guidelines: ensure high contrast and accessibility from the start

### Testing Infrastructure
- Set up Jest for unit testing (tests/unit folder)
- Install and configure Playwright for E2E testing (tests/end-to-end folder)
- Create testing utilities and mocks

---

## Phase 2: Core Data Model & API

### Backend Development
- Create todo model with fields: id, title, topic, dueDate, completed, createdAt, updatedAt
- Create topic model with fields: id, name, color, createdAt
- Implement small, focused functions for database operations:
  - `createTodo()` - add new todo
  - `updateTodo()` - modify existing todo
  - `deleteTodo()` - remove todo
  - `getTodosByTopic()` - retrieve todos grouped by topic
  - `filterTodosByDueDate()` - filter todos by date range

### API Endpoints
- `POST /api/todos` - create todo
- `GET /api/todos` - retrieve all todos
- `PUT /api/todos/:id` - update todo
- `DELETE /api/todos/:id` - delete todo
- `GET /api/topics` - retrieve all topics
- `POST /api/topics` - create new topic
- `GET /api/todos?topic=:id` - filter by topic
- `GET /api/todos?dueDateRange=:start-:end` - filter by due date

### Testing
- Write unit tests for all database functions
- Write unit tests for all API endpoints
- Test both success and error cases

---

## Phase 3: Frontend Components (Following UI Guidelines)

### Component Structure
Build small, focused components with clear responsibilities:

#### Layout Components
- `Header` - app title and navigation
- `Sidebar` - topic list navigation
- `MainContent` - main todo display area

#### Feature Components
- `TodoList` - display todos grouped by topic
- `TodoItem` - individual todo display with:
  - Title
  - Due date (if set)
  - Delete button
  - Move button
- `TopicSection` - subtitle header for each topic group
- `AddTodoForm` - input form for creating todos
- `AddTopicForm` - input form for creating topics
- `TodoEditor` - modal for editing existing todos

#### Color & Accessibility
- Apply black (#000000) text on white backgrounds
- Use yellow (#FFDD00) for buttons and highlights
- Maintain WCAG AA contrast ratio (19.56:1)
- Add ARIA labels to all interactive elements
- Ensure keyboard navigation support
- Minimum 44x44px click targets

### Testing
- Write unit tests for all components
- Test component rendering and state changes
- Test user interactions

---

## Phase 4: Feature Implementation

### Feature 1: Group Todos by Topic
**Backend:**
- `getTodosByTopic()` - group query logic
- API endpoint: `GET /api/todos?topic=:id`

**Frontend:**
- `TodoList` component groups todos by topic
- `TopicSection` displays subtitle headers
- Move todo between topics in `TodoItem`

**Testing:**
- Unit tests: verify grouping logic
- E2E tests: create topic → create todos → verify grouping

### Feature 2: Move & Delete Todos
**Backend:**
- `updateTodo()` - modify topic assignment
- `deleteTodo()` - remove todo

**Frontend:**
- `TodoItem` move button → topic selector dropdown
- `TodoItem` delete button with confirmation
- Undo capability

**Testing:**
- Unit tests: verify move and delete operations
- E2E tests: move todo between topics → verify position; delete todo → verify removal

### Feature 3: Due Dates
**Backend:**
- Add `dueDate` field to todo model
- `filterTodosByDueDate()` - query by date range
- API endpoint: `GET /api/todos?dueDateRange=:start-:end`

**Frontend:**
- Due date picker in `AddTodoForm`
- Display due date in `TodoItem`
- Visual indicator for overdue todos (red highlight)
- Filter/sort by due date in `TodoList`

**Testing:**
- Unit tests: verify due date parsing and filtering
- E2E tests: set due date → verify display; filter by due date → verify results

---

## Phase 5: Integration & Polish

### Integration Testing
- Write end-to-end tests covering complete user workflows:
  - Create topic → create todos → group by topic
  - Move todo between topics
  - Set due date → filter by due date
  - Delete todo with confirmation

### UI Polish
- Ensure all components follow black/yellow color scheme
- Verify accessibility compliance
- Test with screen readers
- Test keyboard navigation
- Responsive design for mobile/tablet

### Documentation
- Document all API endpoints (JSDoc style)
- Add inline comments for complex logic
- Create user guide for app features

### Performance
- Optimize database queries
- Implement caching where appropriate
- Minimize re-renders in React components

---

## Phase 6: Deployment & Monitoring

### DevOps
- Set up CI/CD pipeline
- Automated testing on every commit
- Staging and production environments

### Quality Assurance
- Full test suite passes (unit + E2E)
- Code coverage > 80%
- All code follows coding guidelines

### Deployment
- Deploy backend API
- Deploy frontend application
- Monitor for errors and performance issues

---

## Code Quality Standards Throughout

All code must follow the established guidelines:

✓ **Documentation**: Every function includes docstrings/JSDoc with parameters, return values, and usage examples
✓ **Small Functions**: Each function has single responsibility, max 20-30 lines
✓ **Python Code** (if applicable): Follow PEP 8 standards
✓ **Testing**: Unit tests for all logic, E2E tests for user workflows
✓ **UI**: Black and yellow color scheme, accessible to visually impaired users

---

## Estimated Timeline

- Phase 1: 1-2 weeks
- Phase 2: 2-3 weeks
- Phase 3: 2-3 weeks
- Phase 4: 3-4 weeks
- Phase 5: 1-2 weeks
- Phase 6: 1 week

**Total: 10-15 weeks**
