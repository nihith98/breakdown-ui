import { handleAuthResponseStructure } from '@/lib/response-handler';
import type { AuthResponseStructure } from '@/types';

describe('handleAuthResponseStructure_successResponse_returnsPayload', () => {
  it('should return payload on SUCCESS', () => {
    const response: AuthResponseStructure<{ accessToken: string }> = {
      responseStatus: 'SUCCESS',
      messages: {
        informationMessages: ['Login Successful'],
        warningMessages: [],
        errorMessages: [],
      },
      payload: { accessToken: 'token-123' },
    };

    const result = handleAuthResponseStructure(response);

    expect(result).toEqual({ accessToken: 'token-123' });
  });
});

describe('handleAuthResponseStructure_failureResponse_throwsWithErrorMessage', () => {
  it('should throw with first error message on FAILURE', () => {
    const response: AuthResponseStructure = {
      responseStatus: 'FAILURE',
      messages: {
        informationMessages: [],
        warningMessages: [],
        errorMessages: ['Invalid credentials', 'Account locked'],
      },
      payload: false,
    };

    expect(() => handleAuthResponseStructure(response)).toThrow('Invalid credentials');
  });

  it('should throw generic message if no error messages', () => {
    const response: AuthResponseStructure = {
      responseStatus: 'FAILURE',
      messages: {
        informationMessages: [],
        warningMessages: [],
        errorMessages: [],
      },
      payload: null,
    };

    expect(() => handleAuthResponseStructure(response)).toThrow('Request failed');
  });
});
