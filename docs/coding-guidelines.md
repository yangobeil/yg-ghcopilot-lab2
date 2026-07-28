# Coding Guidelines

## Documentation

All code should include comprehensive documentation to improve readability, maintainability, and help other developers understand the codebase.

**Requirements:**
- Write clear comments explaining complex logic and non-obvious implementations
- Include docstrings for all functions, classes, and modules
- Document function parameters, return values, and exceptions
- Keep documentation up-to-date when code changes
- Use meaningful variable and function names that reduce the need for documentation

**Best Practices:**
- Write documentation as you code, not as an afterthought
- Use appropriate documentation formats for the language (JSDoc for JavaScript, docstrings for Python, etc.)
- Explain the "why" behind the code, not just the "what"
- Include examples in documentation for complex functions

## Small Functions

Code should be organized into small, focused functions that do one thing well.

**Requirements:**
- Keep functions short and focused on a single responsibility
- Aim for functions that are easy to understand and test
- Break down complex logic into multiple smaller functions
- Avoid deeply nested code by extracting functions
- Use function names that clearly describe what they do

**Best Practices:**
- Follow the Single Responsibility Principle (SRP)
- Make functions reusable and composable
- Limit function length to make them easier to read and maintain
- Extract magic numbers and strings into named constants or functions

## Python Code Guidelines

All Python code must follow PEP 8 style guidelines to ensure consistency and readability.

**Requirements:**
- Follow [PEP 8 Style Guide](https://pep8.org/) for all Python code
- Use 4 spaces for indentation (not tabs)
- Limit line length to 79 characters for code and 72 for comments/docstrings
- Use meaningful variable and function names (snake_case for functions and variables)
- Follow naming conventions: `CapWords` for classes, `lowercase_with_underscores` for functions and variables

**Best Practices:**
- Use a linter like `pylint` or `flake8` to check code style
- Use `black` for automatic code formatting
- Organize imports properly: standard library, third-party, then local imports
- Include docstrings for all modules, functions, and classes using the PEP 257 convention
