module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@api/(.*)$': '<rootDir>/api/$1',
    '^@stores/(.*)$': '<rootDir>/stores/$1',
    '^@queries/(.*)$': '<rootDir>/queries/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-typescript']
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|expo|@react-native|@babel|@testing-library)/)'
  ],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx',
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx'
  ],
  collectCoverageFrom: [
    'types/**/*.{ts,tsx}',
    'api/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'queries/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/dist/'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react'
      }
    }
  }
};
