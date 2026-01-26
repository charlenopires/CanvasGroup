'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { isAdminEmail } from '@/lib/constants';

export type UserRole = 'admin' | 'student';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sync user with PostgreSQL database and get role (with retry)
async function syncUserWithDatabase(firebaseUser: FirebaseUser, retries = 3): Promise<User> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Ensure all values are strings to avoid serialization issues
      const requestBody = {
        firebaseUid: String(firebaseUser.uid || ''),
        email: String(firebaseUser.email || ''),
        displayName: firebaseUser.displayName ? String(firebaseUser.displayName) : null,
        photoURL: firebaseUser.photoURL ? String(firebaseUser.photoURL) : null,
      };

      console.log(`[Auth] Attempt ${attempt}: Syncing user`, requestBody);

      let response: Response;
      try {
        const bodyString = JSON.stringify(requestBody);
        console.log(`[Auth] Request body (attempt ${attempt}):`, bodyString.length, 'chars');

        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: bodyString,
        });

        console.log(`[Auth] Response status (attempt ${attempt}):`, response.status);
        console.log(`[Auth] Response headers:`, Object.fromEntries(response.headers.entries()));
      } catch (fetchError) {
        console.error(`[Auth] Fetch failed (attempt ${attempt}):`, fetchError);
        throw fetchError;
      }

      let responseText: string;
      try {
        responseText = await response.text();
        console.log(`[Auth] Response text (attempt ${attempt}):`, responseText.length, 'chars', responseText.slice(0, 500));
      } catch (textError) {
        console.error(`[Auth] Failed to read response (attempt ${attempt}):`, textError);
        responseText = '';
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { rawResponse: responseText };
        }
        console.error(`[Auth] API Error (attempt ${attempt}/${retries}):`, response.status, errorData);

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw new Error(errorData.details || errorData.error || 'Failed to sync user with database');
      }

      const dbUser = JSON.parse(responseText);
      console.log('[Auth] User synced successfully:', dbUser.email, dbUser.role);

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role: dbUser.role as UserRole,
      };
    } catch (error) {
      console.error(`[Auth] Error (attempt ${attempt}/${retries}):`, error);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Fallback: determine role by email if API fails after all retries
      const email = firebaseUser.email || '';
      const role = isAdminEmail(email) ? 'admin' : 'student';
      console.log(`[Auth Fallback] Email: ${email}, Role: ${role}`);
      return {
        uid: firebaseUser.uid,
        email,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role,
      };
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error('Unexpected error in syncUserWithDatabase');
}

// Log logout activity
async function logLogout(firebaseUid: string): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid }),
    });
  } catch (error) {
    console.error('Error logging logout:', error);
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] Auth state changed:', firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      } : 'No user');

      if (firebaseUser) {
        // Validate Firebase user has required fields
        if (!firebaseUser.uid || !firebaseUser.email) {
          console.error('[Auth] Firebase user missing required fields');
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const userData = await syncUserWithDatabase(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('[Auth] Error setting up user:', error);
          // Use fallback - don't block the user
          const email = firebaseUser.email || '';
          const role = isAdminEmail(email) ? 'admin' : 'student';
          setUser({
            uid: firebaseUser.uid,
            email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Log logout activity before signing out
      if (user) {
        await logLogout(user.uid);
      }
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
