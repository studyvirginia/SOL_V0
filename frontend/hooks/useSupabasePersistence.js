import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSupabasePersistence(session, onUpdateSession) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
      setUser(supabaseSession?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Save Message to Supabase
  const saveMessageToDB = async (sessionId, role, content, subMode = null) => {
    if (!user) return;
    const { error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role,
        content,
        sub_mode: subMode
      });
    if (error) console.error("[Supabase] Error saving message:", error);
  };

  // 3. Update Mastery Score
  const updateMasteryScore = async (standardCode, isCorrect) => {
    if (!user) return;
    
    // Fetch current score for this standard
    const { data, error: fetchError } = await supabase
      .from('mastery_scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('standard_code', standardCode)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("[Supabase] Error fetching mastery:", fetchError);
      return;
    }

    const current = data || { correct: 0, total: 0 };
    const { error: upsertError } = await supabase
      .from('mastery_scores')
      .upsert({
        user_id: user.id,
        standard_code: standardCode,
        correct: current.correct + (isCorrect ? 1 : 0),
        total: current.total + 1,
        last_attempt: new Date().toISOString()
      }, { onConflict: 'user_id,standard_code' });

    if (upsertError) console.error("[Supabase] Error updating mastery:", upsertError);
  };

  // 4. Create Session in DB
  const createSessionInDB = async (sessionData) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        subject: sessionData.subject,
        course: sessionData.course,
        session_focus: sessionData.areaOfFocus,
        visual_state: sessionData.visualState || {}
      })
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating session:", error);
      return null;
    }
    return data;
  };

  return {
    user,
    loading,
    saveMessageToDB,
    updateMasteryScore,
    createSessionInDB
  };
}
