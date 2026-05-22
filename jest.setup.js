// Mock expo virtual environment module
jest.mock('expo/virtual/env', () => ({
  env: process.env
}), { virtual: true });

// Only setup React Native testing utilities for component/integration tests
// Unit tests for types, utilities don't need this
if (process.env.JEST_ENV !== 'unit') {
  try {
    require('@testing-library/jest-native/extend-expect');
  } catch (e) {
    // Ignore if not available
  }

  jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn()
  }));

  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    getAllKeys: jest.fn()
  }));

  jest.mock('axios');
}
