/**
 * Tests for error message mapping functionality
 * Validates backend error mapping to user-friendly messages
 */

import { mapBackendErrorToMessage, ERROR_MESSAGE_MAP } from '@types/auth';

describe('mapBackendErrorToMessage_invalidInput_returnsCorrectMessage', () => {
  it('should map invalid credentials message', () => {
    const result = mapBackendErrorToMessage('Invalid credentials');
    expect(result).toBe(ERROR_MESSAGE_MAP.invalid_credentials);
  });

  it('should map account disabled message', () => {
    const result = mapBackendErrorToMessage('Account is disabled');
    expect(result).toBe(ERROR_MESSAGE_MAP.account_disabled);
  });

  it('should map service error message', () => {
    const result = mapBackendErrorToMessage('Service unavailable');
    expect(result).toBe(ERROR_MESSAGE_MAP.service_error);
  });

  it('should return unknown error for unmapped message', () => {
    const result = mapBackendErrorToMessage('Some random error');
    expect(result).toBe(ERROR_MESSAGE_MAP.unknown_error);
  });
});
