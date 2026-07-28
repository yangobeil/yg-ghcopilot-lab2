# E2E Testing Guide

## Overview

This directory contains end-to-end (E2E) tests for the TODO application using Playwright. Tests follow the Page Object Model (POM) pattern for maintainability and focus on 5-8 critical user journeys.

## Test Structure

```
tests/e2e/
├── pages/              # Page Object Model classes
│   ├── BasePage.js    # Base class with common functionality
│   └── TodoPage.js    # TODO app page interactions
├── todo-workflow.spec.js  # Main E2E test spec
└── README.md          # This file
```

## Running E2E Tests

### Prerequisites

1. Install Playwright browsers:
```bash
npm run test:e2e:install
```

2. Ensure backend and frontend are running or will start automatically:
```bash
# Start both manually (optional)
npm run start
```

### Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/todo-workflow.spec.js

# Run with debugging
npx playwright test --debug
```

## Test Coverage

### Journey 1: Create New Topic
- **Purpose**: User can create and select a topic
- **Steps**: Verify app header → Get initial topic count → Add topic → Verify count increased → Select topic
- **Assertions**: Topic appears in sidebar, count increases

### Journey 2: Add TODO with Due Date
- **Purpose**: User can create a TODO with all fields
- **Steps**: Create topic → Add TODO with title and due date → Verify todo appears
- **Assertions**: TODO is visible, count increases

### Journey 3: Organize TODOs by Topic
- **Purpose**: User can manage TODOs across multiple topics
- **Steps**: Create 2 topics → Add todos to each → Verify filtering by topic selection
- **Assertions**: Only selected topic's todos are visible

### Journey 4: Move TODO Between Topics
- **Purpose**: User can relocate a TODO to a different topic
- **Steps**: Create 2 topics → Create TODO → Move to new topic → Verify location change
- **Assertions**: TODO appears in new topic, disappears from old topic

### Journey 5: Delete TODO
- **Purpose**: User can remove a TODO with confirmation
- **Steps**: Create TODO → Verify count → Delete → Verify removal
- **Assertions**: TODO is deleted, count decreases

### Journey 6: Filter by Due Date
- **Purpose**: User can see TODOs with specific due dates
- **Steps**: Create TODO with future date → Verify visibility
- **Assertions**: TODO with future date is visible

### Journey 7: Mark TODO Complete
- **Purpose**: User can toggle TODO completion status
- **Steps**: Create TODO → Mark as complete → Verify state
- **Assertions**: TODO remains visible with completion indicator

### Journey 8: Overdue Detection
- **Purpose**: App highlights overdue TODOs
- **Steps**: Create TODO with past due date → Verify visibility and visual indicator
- **Assertions**: Overdue TODO is visible and marked

## Page Object Model

### TodoPage Class

Main page object encapsulating all TODO app interactions.

#### Key Methods

- `goto()` - Navigate to app
- `getTopicCount()` - Get number of visible topics
- `addTopic(name)` - Create new topic
- `selectTopic(name)` - Switch to topic
- `addTodo(title, dueDate)` - Create TODO
- `getTodoCount()` - Get number of visible todos
- `isTodoVisible(title)` - Check if TODO exists
- `deleteTodo(title)` - Remove TODO
- `moveTodo(title, targetTopic)` - Move TODO to topic
- `toggleTodoComplete(title)` - Mark as complete

#### Properties

- `page` - Playwright Page object
- `selectors` - Static object with all CSS selectors

## Configuration

See `playwright.config.js` at project root:

- **Base URL**: http://localhost:3000 (configurable via BASE_URL env var)
- **Browser**: Chromium only (single browser per guidelines)
- **Timeout**: 5 seconds per action
- **Screenshots**: On failure
- **Videos**: On failure
- **Reports**: HTML, JSON, JUnit formats

## Best Practices

1. **Test Isolation**: Each test creates its own data using timestamps
2. **Page Object Pattern**: All UI interactions through TodoPage class
3. **Meaningful Waits**: Use `waitForLoadingComplete()` and `waitForTodo()`
4. **No Hard Waits**: Never use `page.waitForTimeout()` except for special cases
5. **Error Handling**: Gracefully handle missing elements with `isVisible()`
6. **Assertions**: Clear expectations about behavior and state

## Debugging

### View Test Results

```bash
# Open HTML report
npx playwright show-report
```

### Interactive Debug Mode

```bash
# Step through tests with UI
npx playwright test --debug
```

### Environment Variables

```bash
# Change base URL
BASE_URL=http://localhost:8080 npm run test:e2e

# Run in CI mode (no UI, single worker)
CI=true npm run test:e2e
```

## Troubleshooting

### Tests timeout waiting for element

- Increase selector timeout: `await this.page.waitForSelector(selector, { timeout: 10000 })`
- Verify element selector is correct
- Check if application loaded properly

### API calls failing

- Ensure backend is running on correct port
- Check network calls in test report videos
- Verify BASE_URL environment variable

### Flaky tests

- Add explicit waits for network idle: `await this.page.waitForLoadState('networkidle')`
- Ensure test data cleanup between tests
- Use unique identifiers (timestamps) for test data

## CI/CD Integration

In GitHub Actions or similar CI systems:

```yaml
- name: Install Playwright
  run: npm run test:e2e:install

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    BASE_URL: http://localhost:3000
```

## Performance

- All tests run in parallel by default (single worker for consistency)
- Total suite runtime: ~30-60 seconds depending on system
- Each test is independent and can run in any order

## Future Enhancements

- [ ] Add more journey scenarios (bulk operations, undo/redo)
- [ ] Add performance metrics collection
- [ ] Add accessibility testing (axe-core)
- [ ] Add visual regression testing
- [ ] Add multi-device testing (mobile, tablet)
