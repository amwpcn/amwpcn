/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['./dist/'],
  displayName: 'step',
  testEnvironment: 'node',
};

module.exports = config;
