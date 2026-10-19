'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  phone?: string | null;
  address?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for custom auth change events (e.g. login/logout)
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('topinstock_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('topinstock_auth_changed', handleAuthChange);
    };
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('topinstock_auth_changed'));
      }
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    refresh: checkAuth,
    logout,
  };
}
