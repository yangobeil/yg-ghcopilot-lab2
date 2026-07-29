const BasePage = require('./BasePage');

/**
 * TodoPage Page Object
 * Encapsulates all interactions with the TODO app UI
 * Follows Page Object Model pattern for maintainability
 */
class TodoPage extends BasePage {
  // Selectors
  static selectors = {
    header: 'h1:has-text("📋 TODO App")',
    topicList: '[role="navigation"][aria-label="Topics"]',
    topicButtons: 'button[aria-label*="Select topic"]',
    addTopicForm: '.add-topic-form',
    addTopicInput: '#topic-name',
    addTopicButton: 'button:has-text("Add Topic")',
    addTodoForm: '.form-container:has(h3:has-text("Add New Todo"))',
    addTodoInput: '#todo-title',
    addTodoDueDateInput: '#todo-due-date',
    addTodoSubmitButton: '.form-container button[type="submit"]:has-text("Add Todo")',
    todoList: '[role="list"]',
    todoItems: '[role="listitem"]',
    deletButtons: 'button:has-text("Delete")',
    moveSelects: 'select',
    errorMessage: '.error-message',
    closeErrorButton: 'button.close-btn',
    loadingMessage: '.loading',
    emptyState: '.empty-state',
  };

  /**
   * Navigate to the TODO app
   */
  async goto() {
    await super.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify app header is visible
   */
  async verifyHeaderVisible() {
    return await this.isVisible(TodoPage.selectors.header);
  }

  /**
   * Get all topic buttons
   */
  async getTopicButtons() {
    return await this.page.$$(TodoPage.selectors.topicButtons);
  }

  /**
   * Get number of visible topics
   */
  async getTopicCount() {
    const buttons = await this.getTopicButtons();
    return buttons.length;
  }

  /**
   * Select a topic by name
   */
  async selectTopic(topicName) {
    await this.page.click(`button:has-text("${topicName}")`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a new topic
   */
  async addTopic(topicName) {
    await this.page.fill(TodoPage.selectors.addTopicInput, topicName);
    await this.page.click(TodoPage.selectors.addTopicButton);
    await this.page.waitForLoadState('networkidle');
    // Wait for the new topic button to appear in the DOM
    await this.page.waitForSelector(`button:has-text("${topicName}")`);
  }

  /**
   * Add a new TODO with optional due date
   */
  async addTodo(title, dueDate = null) {
    await this.page.fill(TodoPage.selectors.addTodoInput, title);
    
    if (dueDate) {
      await this.page.fill(TodoPage.selectors.addTodoDueDateInput, dueDate);
    }
    
    await this.page.click(TodoPage.selectors.addTodoSubmitButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all visible todos
   */
  async getTodos() {
    return await this.page.$$(TodoPage.selectors.todoItems);
  }

  /**
   * Get number of visible todos
   */
  async getTodoCount() {
    const todos = await this.getTodos();
    return todos.length;
  }

  /**
   * Check if a todo with specific title is visible
   */
  async isTodoVisible(title) {
    const selector = `text="${title}"`;
    return await this.isVisible(selector);
  }

  /**
   * Delete a todo by title
   */
  async deleteTodo(title) {
    // Find the todo item containing the title, then click its delete button
    const todoItem = await this.page.locator(`text="${title}"`).locator('..').first();
    await todoItem.locator('button:has-text("Delete")').click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Move a todo to a different topic
   */
  async moveTodo(title, targetTopic) {
    const todoItem = await this.page.locator(`text="${title}"`).locator('..').first();
    const select = todoItem.locator('select').first();
    await select.selectOption({ label: targetTopic });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toggle a todo as complete
   */
  async toggleTodoComplete(title) {
    const todoItem = await this.page.locator(`text="${title}"`).locator('..').first();
    const checkbox = todoItem.locator('input[type="checkbox"]');
    await checkbox.check();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if an error message is visible
   */
  async isErrorMessageVisible() {
    return await this.isVisible(TodoPage.selectors.errorMessage);
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    return await this.getText(TodoPage.selectors.errorMessage);
  }

  /**
   * Close error message
   */
  async closeError() {
    await this.page.click(TodoPage.selectors.closeErrorButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if loading message is visible
   */
  async isLoadingVisible() {
    return await this.isVisible(TodoPage.selectors.loadingMessage);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    const isLoading = await this.isLoadingVisible();
    if (isLoading) {
      await this.page.waitForSelector(TodoPage.selectors.loadingMessage, {
        state: 'hidden',
      });
    }
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible() {
    return await this.isVisible(TodoPage.selectors.emptyState);
  }

  /**
   * Wait for todo to appear
   */
  async waitForTodo(title, timeout = 5000) {
    await this.page.waitForSelector(`text="${title}"`, { timeout });
  }

  /**
   * Get all todo titles
   */
  async getTodoTitles() {
    const todos = await this.getTodos();
    const titles = [];
    
    for (const todo of todos) {
      const title = await todo.locator('.todo-title').textContent();
      titles.push(title.trim());
    }
    
    return titles;
  }
}

module.exports = TodoPage;
