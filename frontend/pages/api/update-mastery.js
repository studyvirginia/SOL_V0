/**
 * /api/update-mastery
 * 
 * Logic:
 * 1. Increment attempts_count.
 * 2. Calculate new mastery_score.
 *    - Mastery is weighted: (prev_score * 0.7) + (current_result * 0.3)
 *    - Correct = 100, Incorrect = 0
 * 3. UPSERT into curriculum_mastery table.
 */

import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { standard_code, subject, is_correct } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Unauthorized");

  const token = authHeader.split(" ")[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).send("Unauthorized");

  try {
    // 1. Fetch existing stats for this user/standard
    const { data: existing } = await supabase
      .from('curriculum_mastery')
      .select('*')
      .eq('user_id', user.id)
      .eq('standard_code', standard_code)
      .single();

    const currentResult = is_correct ? 100 : 0;
    let newScore = currentResult;
    let newAttempts = 1;

    if (existing) {
      newAttempts = (existing.attempts_count || 0) + 1;
      // Moving average to prevent jumping too fast
      newScore = Math.round((existing.mastery_score * 0.7) + (currentResult * 0.3));
    }

    const { error: upsertError } = await supabase
      .from('curriculum_mastery')
      .upsert({
        user_id: user.id,
        subject,
        standard_code,
        mastery_score: newScore,
        attempts_count: newAttempts,
        last_attempt_at: new Date().toISOString()
      }, { onConflict: 'user_id,standard_code' });

    if (upsertError) throw upsertError;

    return res.status(200).json({ success: true, newScore, newAttempts });
  } catch (err) {
    console.error("Mastery update error:", err);
    return res.status(500).json({ error: err.message });
  }
}
