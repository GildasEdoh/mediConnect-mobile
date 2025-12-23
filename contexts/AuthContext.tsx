import React, { createContext, useContext, useState } from 'react';
import { Profile } from '@/types/database';
import { mockUsers, mockProfiles, addUser } from '@/data/mockData';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = (userId: string) => {
    const userProfile = mockProfiles[userId];
    if (userProfile) {
      setProfile(userProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    const userData = mockUsers[email];
    if (!userData || userData.password !== password) {
      throw new Error('Email ou mot de passe incorrect');
    }
    const newUser = { id: userData.id, email };
    setUser(newUser);
    loadProfile(userData.id);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (mockUsers[email]) {
      throw new Error('Cet email est déjà utilisé');
    }
    const userId = addUser(email, password, fullName);
    const newUser = { id: userId, email };
    setUser(newUser);
    loadProfile(userId);
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: user ? { user } : null,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
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
