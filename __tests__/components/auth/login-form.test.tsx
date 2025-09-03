import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

// Mock dos hooks
jest.mock('@/hooks/use-auth');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockPush = jest.fn();
const mockSignIn = jest.fn();
const mockSignInWithGoogle = jest.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn()
    });
    
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn()
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });
  
  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });
  
  it('validates password length', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText(/senha/i);
    await user.type(passwordInput, '123');
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });
  });
  
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ user: { uid: '123' } });
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
  
  it('handles login error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Credenciais inválidas';
    mockSignIn.mockRejectedValue(new Error(errorMessage));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
  
  it('handles Google sign in', async () => {
    const user = userEvent.setup();
    mockSignInWithGoogle.mockResolvedValue({ user: { uid: '123' } });
    
    render(<LoginForm />);
    
    const googleButton = screen.getByRole('button', { name: /continuar com google/i });
    await user.click(googleButton);
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
  
  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText(/entrando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
  
  it('redirects to dashboard after successful login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ user: { uid: '123' } });
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
  
  it('has forgot password link', () => {
    render(<LoginForm />);
    
    const forgotPasswordLink = screen.getByText(/esqueceu a senha/i);
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });
  
  it('has register link', () => {
    render(<LoginForm />);
    
    const registerLink = screen.getByText(/criar conta/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
  
  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    // Tab navigation
    await user.tab();
    expect(emailInput).toHaveFocus();
    
    await user.tab();
    expect(passwordInput).toHaveFocus();
    
    await user.tab();
    expect(submitButton).toHaveFocus();
  });
  
  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('Erro de login'));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    // Trigger error
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/erro de login/i)).toBeInTheDocument();
    });
    
    // Start typing again
    await user.type(emailInput, 'a');
    
    await waitFor(() => {
      expect(screen.queryByText(/erro de login/i)).not.toBeInTheDocument();
    });
  });
});