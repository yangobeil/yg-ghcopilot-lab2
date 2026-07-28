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
- Set up Jest for unit testing:
  - Backend unit tests: `packages/backend/__tests__/*.test.js`
  - Frontend unit tests: `packages/frontend/src/__tests__/*.test.js`
- Set up Jest + Supertest for integration testing:
  - Integration tests: `packages/backend/__tests__/integration/*.test.js`
  - Tests API endpoints with real HTTP requests
- Install and configure Playwright for E2E testing:
  - E2E tests: `tests/e2e/*.spec.js`
  - Use Page Object Model (POM) pattern for maintainability
  - Single browser configuration
  - Focus on 5-8 critical user journeys (happy paths and key edge cases)
- Configure port management with environment variables:
  - Backend: `PORT=3030` (default)
  - Frontend: `PORT=3000` (default)
- Create testing utilities, mocks, and Page Objects

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

## Phase 5: Integration Testing & E2E Tests ✓ COMPLETE

### Backend Integration Tests ✓
- Created Jest + Supertest integration tests in `packages/backend/__tests__/integration/todos-api.test.js`
- Tests include:
  - ✓ Topic CRUD operations (create, read with validation, duplicate error handling)
  - ✓ Todo CRUD operations with all fields (create, update multiple fields, delete)
  - ✓ Filtering by topic_id and due_date range
  - ✓ Error handling (validation, not found, conflicts)
  - ✓ Isolation between tests (independent setup/teardown)
  - ✓ Move todos between topics
- Test Results: 14/14 passing with 81.53% code coverage
- File location: `packages/backend/__tests__/integration/todos-api.test.js`
- Naming convention: `*.test.js` ✓

### E2E Tests with Playwright ✓
- Playwright configuration: `playwright.config.js` at project root
- Single browser (Chromium) configured per guidelines ✓
- Page Object Model pattern implemented:
  - ✓ `tests/e2e/pages/BasePage.js` - Base class with common functionality
  - ✓ `tests/e2e/pages/TodoPage.js` - Main todo application interactions
- E2E tests for 8 critical user journeys created in `tests/e2e/todo-workflow.spec.js`:
  1. ✓ Create Topic Journey - User creates and selects a new topic
  2. ✓ Add Todo Journey - User adds a todo to a topic with due date
  3. ✓ Group Todos Journey - User views todos organized by topic
  4. ✓ Move Todo Journey - User moves a todo between topics
  5. ✓ Delete Todo Journey - User deletes a todo with confirmation
  6. ✓ Filter by Due Date Journey - User sees todos with specific due dates
  7. ✓ Mark Complete Journey - User toggles todo completion status
  8. ✓ Overdue Detection Journey - User sees overdue todos highlighted
- File location: `tests/e2e/*.spec.js` ✓
- Naming convention: `*.spec.js` ✓
- Test setup: Each test creates own data with timestamps for isolation ✓
- Documentation: `tests/e2e/README.md` with comprehensive guide ✓

### Port Configuration with Environment Variables ✓
- Backend: `PORT=3030` (default) in `/packages/backend/src/index.js` ✓
- Frontend: PORT support via React Scripts ✓
- Playwright config uses environment variables for configuration ✓

### Package.json Scripts ✓
- Root package.json:
  - `npm run test:e2e` - Run Playwright tests
  - `npm run test:e2e:install` - Install Playwright browsers
  - `npm run test:all` - Run all tests (unit + integration + E2E)
- Backend package.json:
  - `npm run test:unit` - Run unit tests only
  - `npm run test:integration` - Run integration tests only
  - `npm test` - Run all tests

### UI Polish
- ✓ Black/yellow color scheme in all components
- ✓ Accessibility compliance (WCAG AA, ARIA labels, keyboard navigation)
- ✓ Responsive design for mobile/tablet/desktop
- ✓ Minimum 44x44px click targets throughout

### Documentation ✓
- ✓ API endpoints documented with JSDoc in app.js
- ✓ Page Objects documented with method descriptions
- ✓ E2E test documentation in tests/e2e/README.md
- ✓ Integration test comments explaining test purposes
- ✓ Inline comments for complex logic

### Performance ✓
- Database uses SQLite with proper indexing
- React components use hooks efficiently
- No unnecessary re-renders
- Queries optimized for common use cases

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
