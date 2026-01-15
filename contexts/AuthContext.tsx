'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, DbUser } from '@/lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  nickname: string;
  email?: string;
  photoUrl?: string;
  titleId?: number | null;
}

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, nickname: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isSignupModalOpen: boolean;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  refreshDbUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Fetch or create user in our database
  const fetchOrCreateDbUser = async (supabaseUser: SupabaseUser) => {
    try {
      // First try to fetch existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (existingUser) {
        setDbUser(existingUser);
        setUser({
          id: existingUser.id,
          nickname: existingUser.display_name,
          email: existingUser.email,
          photoUrl: existingUser.photo_url || undefined,
          titleId: existingUser.current_title_id,
        });

        // Update last login
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', supabaseUser.id);

        return;
      }

      // If user doesn't exist, create new one
      const newUser = {
        id: supabaseUser.id,
        google_id: supabaseUser.user_metadata?.sub || supabaseUser.id,
        email: supabaseUser.email || '',
        email_verified: supabaseUser.email_confirmed_at ? true : false,
        display_name: supabaseUser.user_metadata?.full_name ||
                      supabaseUser.user_metadata?.name ||
                      supabaseUser.email?.split('@')[0] ||
                      'Player',
        photo_url: supabaseUser.user_metadata?.avatar_url ||
                   supabaseUser.user_metadata?.picture || null,
        is_active: true,
        is_banned: false,
        last_login_at: new Date().toISOString(),
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }

      if (createdUser) {
        setDbUser(createdUser);
        setUser({
          id: createdUser.id,
          nickname: createdUser.display_name,
          email: createdUser.email,
          photoUrl: createdUser.photo_url || undefined,
          titleId: createdUser.current_title_id,
        });

        // Create initial statistics for all game modes
        const { data: gameModes } = await supabase.from('game_modes').select('id');
        if (gameModes) {
          const statsToInsert = gameModes.map((mode) => ({
            user_id: createdUser.id,
            game_mode_id: mode.id,
          }));
          await supabase.from('user_statistics').insert(statsToInsert);
        }
      }
    } catch (error) {
      console.error('Error in fetchOrCreateDbUser:', error);
    }
  };

  // Refresh dbUser data
  const refreshDbUser = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setDbUser(data);
      setUser({
        id: data.id,
        nickname: data.display_name,
        email: data.email,
        photoUrl: data.photo_url || undefined,
        titleId: data.current_title_id,
      });
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await fetchOrCreateDbUser(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchOrCreateDbUser(session.user);
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setDbUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google sign in error:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, nickname: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nickname,
          name: nickname,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    setUser(null);
    setDbUser(null);
  };

  const openLoginModal = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        isLoggedIn: !!user,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isSignupModalOpen,
        openSignupModal,
        closeSignupModal,
        refreshDbUser,
      }}
    >
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
