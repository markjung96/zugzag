interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export type { User, AuthState };
