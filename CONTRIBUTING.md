# Contributing

Thank you for considering contributing to this monorepo! We appreciate your time
and effort in improving the project. Please follow these guidelines to help make
the contribution process smooth and effective.

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Guidelines](#development-guidelines)
  - [Setting Up the Environment](#setting-up-the-environment)
  - [Running Tests](#running-tests)
  - [Code Style](#code-style)
- [License](#license)

## Getting Started

1. Fork the repository.
2. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/your-monorepo.git
   ```
3. Navigate to the project directory:
   ```bash
   cd your-monorepo
   ```
4. Install the dependencies:
   ```bash
   yarn
   ```

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue and provide detailed information to
help us understand and reproduce the issue. Include:

- A clear and descriptive title.
- Steps to reproduce the issue.
- Expected and actual behavior.
- Screenshots or logs, if applicable.

### Suggesting Features

We welcome suggestions for new features. To suggest a feature:

- Create an issue with a clear and descriptive title.
- Provide a detailed explanation of the feature and its benefits.
- Include any relevant examples or use cases.

### Submitting Pull Requests

To submit a pull request:

1. Create a new branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes.
3. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Add feature: Your feature description"
   ```
4. Push your branch to your forked repository:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a pull request from your branch to the `master` branch of the main
   repository.

Ensure that your pull request:

- Follows the project's code style.
- Includes tests for new functionality.
- Includes examples in the examples package if applicable.
- Does not introduce any unnecessary changes.

## Development Guidelines

### Setting Up the Environment

Follow these steps to set up the development environment:

1. Ensure you have Node.js and yarn installed.
2. Install dependencies using:
   ```bash
   yarn
   ```

### Running Tests

Run the tests to ensure your changes do not break existing functionality:

```bash
yarn test
```

### Code Style

Maintain a consistent code style:

- Use Prettier for code formatting.
- Follow the ESLint rules defined in the project.

### Adding Changesets

Always add a changeset:

```bash
yarn changeset
```

Follow the prompts to describe your changes, which will help generate the
changelog and manage versioning.

## License

By contributing to this project, you agree that your contributions will be
licensed under the MIT License.
