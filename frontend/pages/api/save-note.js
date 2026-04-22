/**
 * /api/save-note
 * 
 * Logic:
 * 1. Authenticate user.
 * 2. Save content to student_notes table.
 */

import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { title, content, standard_code } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Unauthorized");

  const token = authHeader.split(" ")[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).send("Unauthorized");

  try {
    const { data: note, error: insertError } = await supabase
      .from('student_notes')
      .insert({
        user_id: user.id,
        standard_code: standard_code || null,
        title: title || "New Note",
        content: content
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.status(200).json({ success: true, note });
  } catch (err) {
    console.error("Note save error:", err);
    return res.status(500).json({ error: err.message });
  }
}
