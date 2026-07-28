# Testing Guidelines

## Unit Tests

All code should be tested with unit tests to ensure functionality and maintainability.

**Requirements:**
- Write unit tests for all business logic, functions, and components
- Save all unit tests in the `tests/unit` folder
- Use a testing framework appropriate to the language (Jest for JavaScript/TypeScript)
- Aim for high code coverage to catch bugs early
- Unit tests should be fast and isolated, testing one piece of functionality at a time
- Mock external dependencies to keep tests focused

**Best Practices:**
- Test both success and error cases
- Use descriptive test names that explain what is being tested
- Keep tests DRY (Don't Repeat Yourself)
- Run unit tests frequently during development

## End-to-End Tests

End-to-end (E2E) tests verify the entire application workflow from a user's perspective.

**Requirements:**
- Use Playwright for building end-to-end tests
- Save all end-to-end tests in the `tests/end-to-end` folder
- Test critical user workflows and features
- E2E tests should validate the complete flow from UI interactions to backend responses
- Run E2E tests before deploying to production

**Best Practices:**
- Focus on key user journeys and critical paths
- Use descriptive test names that describe the user scenario
- Avoid testing implementation details; test user-visible behavior
- Keep E2E tests maintainable by using page object models
- Run E2E tests in a staging or test environment
