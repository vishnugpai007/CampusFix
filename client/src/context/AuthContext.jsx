import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken as setClientAccessToken, registerAuthFailureCallback, parseApiError } from '../api/client';

/**
 * SECURITY RATIONALE FOR IN-MEMORY TOKEN STORAGE:
 * 
 * Storing Access Tokens in `localStorage` or `sessionStorage` makes them vulnerable to Cross-Site
 * Scripting (XSS) attacks. Any third-party dependency or injected script running on the page could
 * read `localStorage` and steal credentials.
 * 
 * By keeping the Access Token strictly in Javascript memory (React state / client module scope),
 * scripts cannot extract it directly from web storage.
 * 
 * Long-term session state is maintained via a secure, HTTP-only Refresh Token cookie issued by the server.
 * When the app mounts or reloads, AuthContext automatically invokes a silent refresh endpoint to obtain
 * a fresh short-lived access token in memory without exposing sensitive tokens to client-accessible storage.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize internal state with Axios client instance
  const updateAccessToken = useCallback((token) => {
    setTokenState(token);
    setClientAccessToken(token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors during logout teardown
    } finally {
      setUser(null);
      updateAccessToken(null);
    }
  }, [updateAccessToken]);

  // Handle unexpected authentication failure (e.g., refresh token expired/revoked)
  useEffect(() => {
    registerAuthFailureCallback(() => {
      setUser(null);
      updateAccessToken(null);
    });
  }, [updateAccessToken]);

  // Silent refresh session restoration on initial mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const response = await api.post('/auth/refresh');
        if (isMounted && response.data?.success) {
          const { user: refreshedUser, accessToken: newAccessToken } = response.data.data;
          setUser(refreshedUser);
          updateAccessToken(newAccessToken);
        }
      } catch (error) {
        // Session restoration failed (unauthenticated or expired refresh token)
        if (isMounted) {
          setUser(null);
          updateAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [updateAccessToken]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, accessToken: newAccessToken } = response.data.data;
      setUser(loggedInUser);
      updateAccessToken(newAccessToken);
      return { success: true, data: loggedInUser };
    } catch (error) {
      const parsed = parseApiError(error);
      return { success: false, ...parsed };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      const { user: registeredUser, accessToken: newAccessToken } = response.data.data;
      setUser(registeredUser);
      updateAccessToken(newAccessToken);
      return { success: true, data: registeredUser };
    } catch (error) {
      const parsed = parseApiError(error);
      return { success: false, ...parsed };
    }
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    updateUser: updateUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
