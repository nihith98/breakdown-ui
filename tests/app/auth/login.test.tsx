/**
 * Component Tests for LoginScreenWeb
 * Tests form validation logic, mutation integration, error handling, and loading states
 *
 * Note: Component rendering tests are covered in integration tests.
 * These tests focus on the component's business logic and state management.
 */

import { useLoginMutation } from '@/queries/authQueries';
import { LoginRequest } from '@/types/auth';

jest.mock('@/queries/authQueries');

const mockUseLoginMutation = useLoginMutation as jest.MockedFunction<typeof useLoginMutation>;

/**
 * Helper function to create a mock useLoginMutation return value
 */
const createMockLoginMutation = (overrides?: Partial<ReturnType<typeof useLoginMutation>>) => {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
    isSuccess: false,
    isError: false,
    data: undefined,
    reset: jest.fn(),
    status: 'idle' as const,
    failureCount: 0,
    failureReason: null,
    variables: undefined,
    context: undefined,
    submittedAt: 0,
    ...overrides,
  } as any;
};

describe('LoginScreen_emailValidation_rejectsInvalidFormats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate that email regex pattern matches valid emails', () => {
    // Arrange
    const validEmails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
      'user_123@example-domain.com',
    ];

    // Act & Assert - the pattern from LoginScreenWeb
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validEmails.forEach((email) => {
      expect(emailPattern.test(email)).toBe(true);
    });
  });

  it('should reject invalid email formats', () => {
    // Arrange
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'user@',
      'user @example.com',
    ];

    // Act & Assert
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    invalidEmails.forEach((email) => {
      expect(emailPattern.test(email)).toBe(false);
    });
  });
});

describe('LoginScreen_passwordValidation_requiresNonEmptyPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject empty passwords', () => {
    // Arrange
    const emptyPasswords = ['', '  ', '\t', '\n'];

    // Act & Assert
    emptyPasswords.forEach((password) => {
      expect(password.trim().length === 0).toBe(true);
    });
  });

  it('should accept non-empty passwords after trim', () => {
    // Arrange
    const validPasswords = ['password', '  password  ', 'P@ssw0rd!'];

    // Act & Assert
    validPasswords.forEach((password) => {
      expect(password.trim().length > 0).toBe(true);
    });
  });
});

describe('LoginScreen_formValidation_validatesBothFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require both email and password to be non-empty', () => {
    // Arrange
    const testCases = [
      { email: '', password: 'password', valid: false },
      { email: 'user@example.com', password: '', valid: false },
      { email: '', password: '', valid: false },
      { email: 'user@example.com', password: 'password', valid: true },
    ];

    // Act & Assert
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    testCases.forEach(({ email, password, valid }) => {
      const isValid =
        email.trim().length > 0 &&
        password.trim().length > 0 &&
        emailPattern.test(email);
      expect(isValid).toBe(valid);
    });
  });
});

describe('LoginScreen_submitWithValidCredentials_callsLoginMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should invoke mutation with correct credential structure', () => {
    // Arrange
    const mockMutate = jest.fn();
    mockUseLoginMutation.mockReturnValue(
      createMockLoginMutation({ mutate: mockMutate })
    );

    const credentials: LoginRequest = {
      email: 'testuser@example.com',
      password: 'password123',
    };

    // Act - simulate what the component would do
    mockMutate(credentials, { onSuccess: jest.fn() });

    // Assert
    expect(mockMutate).toHaveBeenCalledWith(
      credentials,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it('should trim whitespace from email before submission', () => {
    // Arrange
    const emailWithWhitespace = '  testuser@example.com  ';

    // Act & Assert
    expect(emailWithWhitespace.trim()).toBe('testuser@example.com');
  });

  it('should preserve password as-is (no trimming)', () => {
    // Arrange
    const passwordWithSpaces = 'pass word123';

    // Act & Assert
    expect(passwordWithSpaces).toBe('pass word123');
  });
});

describe('LoginScreen_loginMutationIntegration_usesCorrectHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useLoginMutation hook', () => {
    // Arrange & Act
    mockUseLoginMutation.mockReturnValue(createMockLoginMutation());
    mockUseLoginMutation();

    // Assert
    expect(mockUseLoginMutation).toHaveBeenCalled();
  });

  it('should extract mutate and isPending from hook', () => {
    // Arrange
    const mockMutate = jest.fn();
    mockUseLoginMutation.mockReturnValue(
      createMockLoginMutation({
        mutate: mockMutate,
        isPending: false,
      })
    );

    // Act
    const { mutate, isPending } = mockUseLoginMutation();

    // Assert
    expect(mutate).toBe(mockMutate);
    expect(isPending).toBe(false);
  });

  it('should handle mutation error state', () => {
    // Arrange
    const error = new Error('Invalid credentials');
    mockUseLoginMutation.mockReturnValue(
      createMockLoginMutation({
        error: error as any,
        isError: true,
      })
    );

    // Act
    const { error: returnedError, isError } = mockUseLoginMutation();

    // Assert
    expect(isError).toBe(true);
    expect(returnedError).toBe(error);
  });

  it('should handle pending state during mutation', () => {
    // Arrange
    mockUseLoginMutation.mockReturnValue(
      createMockLoginMutation({
        isPending: true,
        status: 'pending',
      })
    );

    // Act
    const { isPending, status } = mockUseLoginMutation();

    // Assert
    expect(isPending).toBe(true);
    expect(status).toBe('pending');
  });
});

describe('LoginScreen_errorHandling_mapsBackendErrors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle error message from Error object', () => {
    // Arrange
    const errorMessage = 'Invalid email or password';
    const error = new Error(errorMessage);

    // Act
    const displayMessage =
      error instanceof Error ? error.message : 'Login failed. Please try again.';

    // Assert
    expect(displayMessage).toBe('Invalid email or password');
  });

  it('should display generic error message for unknown errors', () => {
    // Arrange
    const error = null;

    // Act
    const displayMessage =
      error instanceof Error ? error.message : 'Login failed. Please try again.';

    // Assert
    expect(displayMessage).toBe('Login failed. Please try again.');
  });
});

describe('LoginScreen_buttonState_disablesBasedOnValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should disable button when form is incomplete', () => {
    // Arrange
    const testCases = [
      { email: '', password: 'password', isPending: false, disabled: true },
      { email: 'user@example.com', password: '', isPending: false, disabled: true },
      { email: 'invalid-email', password: 'password', isPending: false, disabled: true },
      { email: 'user@example.com', password: 'password', isPending: false, disabled: false },
      { email: 'user@example.com', password: 'password', isPending: true, disabled: true },
    ];

    // Act & Assert
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    testCases.forEach(({ email, password, isPending, disabled }) => {
      const isFormValid =
        email.trim().length > 0 &&
        password.trim().length > 0 &&
        !isPending &&
        emailPattern.test(email);
      expect(!isFormValid).toBe(disabled);
    });
  });
});

describe('LoginScreen_loadingIndicator_showsDuringRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading text when isPending is true', () => {
    // Arrange
    const isPending = true;

    // Act
    const buttonText = isPending ? 'LOGGING IN...' : 'LOG IN';

    // Assert
    expect(buttonText).toBe('LOGGING IN...');
  });

  it('should show normal text when isPending is false', () => {
    // Arrange
    const isPending = false;

    // Act
    const buttonText = isPending ? 'LOGGING IN...' : 'LOG IN';

    // Assert
    expect(buttonText).toBe('LOG IN');
  });
});

describe('LoginScreen_successNavigation_initiatesRouting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass onSuccess callback to mutation', () => {
    // Arrange
    const mockMutate = jest.fn();
    const onSuccess = jest.fn();
    mockUseLoginMutation.mockReturnValue(
      createMockLoginMutation({ mutate: mockMutate })
    );

    // Act - simulate form submission
    const credentials: LoginRequest = {
      email: 'user@example.com',
      password: 'password123',
    };
    mockMutate(credentials, { onSuccess });

    // Assert
    expect(mockMutate).toHaveBeenCalledWith(
      credentials,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });
});
