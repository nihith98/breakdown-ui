import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/(auth)/login/page';
import * as authLib from '@/lib/auth';

jest.mock('next/navigation');
jest.mock('@/lib/auth');

describe('LoginPage_emptySubmit_showsFieldErrors', () => {
  it('should show field errors when submitting empty form', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
});

describe('LoginPage_validSubmit_redirectsToSuccess', () => {
  it('should redirect to success page on successful login', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (authLib.loginUser as jest.Mock).mockResolvedValue(undefined);

    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/success');
    });
  });
});

describe('LoginPage_apiFailure_showsErrorBanner', () => {
  it('should show error banner when login fails', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (authLib.loginUser as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('LoginPage_passwordToggle_changesInputType', () => {
  it('should toggle password visibility on eye icon click', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;

    expect(passwordInput.type).toBe('password');

    const eyeToggle = screen.getByLabelText('Toggle password visibility');
    fireEvent.click(eyeToggle);

    await waitFor(() => {
      expect(passwordInput.type).toBe('text');
    });

    fireEvent.click(eyeToggle);

    await waitFor(() => {
      expect(passwordInput.type).toBe('password');
    });
  });
});

describe('LoginPage_escapeKey_dismissesBanner', () => {
  it('should dismiss error banner on Escape key press', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (authLib.loginUser as jest.Mock).mockRejectedValue(new Error('Login failed'));

    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
