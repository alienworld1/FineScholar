import { useState, useCallback } from 'react';

// Mock Privy hook for development when no Privy app ID is available
export function useMockPrivy() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const login = useCallback(() => {
    setAuthenticated(true);
    setUser({
      wallet: {
        address: '0xa78f8A1B665245DB0Ccc703166e85b994C31e9dE', // Mock address
      },
    });
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
    setUser(null);
  }, []);

  return {
    authenticated,
    user,
    login,
    logout,
  };
}

// Hook that switches between real Privy and mock based on environment
export function useAuthProvider() {
  const hasPrivyAppId =
    import.meta.env.VITE_PRIVY_APP_ID &&
    import.meta.env.VITE_PRIVY_APP_ID !== 'your-privy-app-id';

  if (!hasPrivyAppId) {
    console.warn('Using mock authentication for development');
    return useMockPrivy();
  }

  // In production with proper Privy app ID, import and use real Privy
  try {
    const { usePrivy } = require('@privy-io/react-auth');
    return usePrivy();
  } catch {
    console.warn('Privy not available, using mock authentication');
    return useMockPrivy();
  }
}
