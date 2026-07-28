/**
 * Base Page Object
 * Contains common functionality used by all pages
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL path
   */
  async goto(path = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `./test-results/${name}.png` });
  }

  /**
   * Check if an element is visible
   */
  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content of an element
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Close the page
   */
  async close() {
    await this.page.close();
  }
}

module.exports = BasePage;
