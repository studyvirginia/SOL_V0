import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for Mock User first (Fast Login Bypass)
    const mockUser = localStorage.getItem('sol_mock_user');
    if (mockUser) {
      try {
        const parsed = JSON.parse(mockUser);
        setUser(parsed);
        setProfile({ 
          full_name: parsed.user_metadata?.student_name || 'Test Student',
          id: parsed.id 
        });
        setLoading(false);
      } catch (e) {
        localStorage.removeItem('sol_mock_user');
      }
    }

    // 2. Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!localStorage.getItem('sol_mock_user')) {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        setLoading(false);
      }
    });

    // 3. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If we are using mock user, ignore Supabase until we explicitly sign out
      if (localStorage.getItem('sol_mock_user')) return;

      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error) setProfile(data);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (!error) setProfile(data);
    return { data, error };
  };

  const signUp = (email, password, fullName) => 
    supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { full_name: fullName } } 
    });

  const signIn = (email, password) => 
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => {
    localStorage.removeItem('sol_mock_user');
    return supabase.auth.signOut().then(() => {
      window.location.reload(); // Hard reload to clear all state
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
