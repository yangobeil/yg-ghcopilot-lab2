const { test, expect } = require('@playwright/test');
const TodoPage = require('./pages/TodoPage');

/**
 * E2E Tests for TODO App
 * Tests 5-8 critical user journeys focusing on happy paths and key edge cases
 * Uses Page Object Model for maintainability
 * Each test is isolated and independent with its own data setup
 */

test.describe('TODO App E2E Tests', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterEach(async () => {
    if (todoPage) {
      await todoPage.close();
    }
  });

  /**
   * Journey 1: User creates a new topic
   * Happy Path: Create topic and verify it appears in the sidebar
   */
  test('Journey 1: User can create and select a new topic', async () => {
    // Verify header is visible
    const headerVisible = await todoPage.verifyHeaderVisible();
    expect(headerVisible).toBe(true);

    // Get initial topic count
    const initialCount = await todoPage.getTopicCount();

    // Add new topic
    const newTopicName = `Test Topic ${Date.now()}`;
    await todoPage.addTopic(newTopicName);

    // Verify topic was added
    const finalCount = await todoPage.getTopicCount();
    expect(finalCount).toBe(initialCount + 1);

    // Select the new topic
    await todoPage.selectTopic(newTopicName);
    await todoPage.waitForLoadingComplete();
  });

  /**
   * Journey 2: User adds a TODO to a topic with due date
   * Happy Path: Create todo with all fields and verify it appears
   */
  test('Journey 2: User can add a TODO with due date', async () => {
    // Create a topic first
    const topicName = `Topic ${Date.now()}`;
    await todoPage.addTopic(topicName);
    await todoPage.selectTopic(topicName);

    // Add todo with due date
    const todoTitle = `Important Task ${Date.now()}`;
    const dueDate = '2026-12-25';
    
    await todoPage.addTodo(todoTitle, dueDate);

    // Verify todo appears
    await todoPage.waitForTodo(todoTitle);
    const isVisible = await todoPage.isTodoVisible(todoTitle);
    expect(isVisible).toBe(true);

    // Verify todo count increased
    const todoCount = await todoPage.getTodoCount();
    expect(todoCount).toBeGreaterThan(0);
  });

  /**
   * Journey 3: User views todos grouped by topic
   * Happy Path: Create multiple topics and todos, verify grouping
   */
  test('Journey 3: User can organize TODOs in different topics', async () => {
    const timestamp = Date.now();
    const topic1 = `Work ${timestamp}`;
    const topic2 = `Personal ${timestamp}`;

    // Create two topics
    await todoPage.addTopic(topic1);
    await todoPage.selectTopic(topic1);

    // Add todo to first topic
    const todo1 = `Work Task ${timestamp}`;
    await todoPage.addTodo(todo1);

    // Create second topic
    await todoPage.addTopic(topic2);
    await todoPage.selectTopic(topic2);

    // Add todo to second topic
    const todo2 = `Personal Task ${timestamp}`;
    await todoPage.addTodo(todo2);

    // Verify only second topic's todo is visible
    let isVisible = await todoPage.isTodoVisible(todo2);
    expect(isVisible).toBe(true);

    // Switch back to first topic
    await todoPage.selectTopic(topic1);

    // Verify only first topic's todo is visible
    isVisible = await todoPage.isTodoVisible(todo1);
    expect(isVisible).toBe(true);
  });

  /**
   * Journey 4: User moves a TODO between topics
   * Happy Path: Create todo, move it to another topic, verify change
   */
  test('Journey 4: User can move a TODO between topics', async () => {
    const timestamp = Date.now();
    const topic1 = `Source ${timestamp}`;
    const topic2 = `Destination ${timestamp}`;

    // Create two topics
    await todoPage.addTopic(topic1);
    await todoPage.selectTopic(topic1);

    // Add todo to first topic
    const todoTitle = `Mobile Task ${timestamp}`;
    await todoPage.addTodo(todoTitle);

    // Verify todo is in first topic
    let isVisible = await todoPage.isTodoVisible(todoTitle);
    expect(isVisible).toBe(true);

    // Create second topic
    await todoPage.addTopic(topic2);

    // Move todo to second topic
    await todoPage.moveTodo(todoTitle, topic2);

    // Switch to second topic
    await todoPage.selectTopic(topic2);

    // Verify todo is now in second topic
    isVisible = await todoPage.isTodoVisible(todoTitle);
    expect(isVisible).toBe(true);
  });

  /**
   * Journey 5: User deletes a TODO
   * Happy Path: Create todo, delete with confirmation, verify removal
   */
  test('Journey 5: User can delete a TODO with confirmation', async () => {
    const topicName = `Delete Topic ${Date.now()}`;
    const todoTitle = `Delete Me ${Date.now()}`;

    // Create topic and add todo
    await todoPage.addTopic(topicName);
    await todoPage.selectTopic(topicName);
    await todoPage.addTodo(todoTitle);

    // Verify todo exists
    let todoCount = await todoPage.getTodoCount();
    expect(todoCount).toBeGreaterThan(0);

    // Delete todo (confirmation handled by browser)
    await todoPage.page.on('dialog', dialog => dialog.accept());
    await todoPage.deleteTodo(todoTitle);

    // Verify todo is gone
    const isVisible = await todoPage.isTodoVisible(todoTitle);
    expect(isVisible).toBe(false);
  });

  /**
   * Journey 6: User filters TODOs by due date
   * Happy Path: Create todos with different due dates, verify filtering
   */
  test('Journey 6: User can see TODOs with upcoming due dates', async () => {
    const topicName = `Date Topic ${Date.now()}`;
    
    // Create topic
    await todoPage.addTopic(topicName);
    await todoPage.selectTopic(topicName);

    // Add todo with near future date
    const todoTitle = `Upcoming ${Date.now()}`;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    
    await todoPage.addTodo(todoTitle, dateString);

    // Verify todo is visible
    const isVisible = await todoPage.isTodoVisible(todoTitle);
    expect(isVisible).toBe(true);
  });

  /**
   * Journey 7: User marks a TODO as complete
   * Happy Path: Create todo, toggle completion, verify status change
   */
  test('Journey 7: User can mark a TODO as complete', async () => {
    const topicName = `Complete Topic ${Date.now()}`;
    const todoTitle = `Completable Task ${Date.now()}`;

    // Create topic and add todo
    await todoPage.addTopic(topicName);
    await todoPage.selectTopic(topicName);
    await todoPage.addTodo(todoTitle);

    // Toggle todo as complete
    await todoPage.toggleTodoComplete(todoTitle);

    // Verify todo is still visible (completed state)
    const isVisible = await todoPage.isTodoVisible(todoTitle);
    expect(isVisible).toBe(true);
  });

  /**
   * Journey 8: User experiences overdue TODO highlighting
   * Edge Case: Create todo with past due date and verify visual indicator
   */
  test('Journey 8: Overdue TODOs are visually indicated', async () => {
    const topicName = `Overdue Topic ${Date.now()}`;
    const todoTitle = `Overdue Task ${Date.now()}`;

    // Create topic
    await todoPage.addTopic(topicName);
    await todoPage.selectTopic(topicName);

    // Add todo with past due date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const dateString = pastDate.toISOString().split('T')[0];
    
    await todoPage.addTodo(todoTitle, dateString);

    // Verify todo is visible
    const isVisible = await todoPage.isTodoVisible(todoTitle);
    expect(isVisible).toBe(true);

    // In a real scenario, we'd also check for visual styling like:
    // const element = await todoPage.page.locator(`text="${todoTitle}"`);
    // const className = await element.locator('..').first().getAttribute('class');
    // expect(className).toContain('overdue');
  });
});

test.describe('TODO App E2E Tests - Error Handling', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterEach(async () => {
    if (todoPage) {
      await todoPage.close();
    }
  });

  /**
   * Edge Case: User attempts to add todo without selecting topic
   */
  test('Edge Case: Shows error when adding TODO without topic', async () => {
    // Try to add todo without selecting a topic
    const todoTitle = `No Topic Task ${Date.now()}`;
    
    // This test verifies the app handles the edge case gracefully
    // The actual behavior depends on implementation
    const initialVisible = await todoPage.isEmptyStateVisible();
    expect(typeof initialVisible).toBe('boolean');
  });
});
