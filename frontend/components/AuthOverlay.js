import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthOverlay({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = async (e, overrideEmail = null) => {
    e?.preventDefault?.();
    const targetEmail = overrideEmail || email;
    setLoading(true);
    setMessage(null);

    // TEST BYPASS logic for development
    if (targetEmail && targetEmail.toLowerCase() === 'test@example.com') {
      const mockUser = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        user_metadata: { student_name: 'Test Student' },
        is_mock: true
      };
      localStorage.setItem('sol_mock_user', JSON.stringify(mockUser));
      // Force a slight delay for realism
      setTimeout(() => {
        window.location.reload(); // Reload to trigger the useEffect in index.js
      }, 800);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Magic link sent! Check your email to log in.' });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-16 w-16 bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">SOL Assistant</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Enterprise Portfolio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 px-1">Student Email</label>
            <input
              type="email"
              required
              className="w-full rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 py-4 px-6 text-[0.95rem] font-semibold text-gray-800 dark:text-gray-100 transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400"
              placeholder="alex@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-4 font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? 'Sending Link...' : 'Enter SOL Portal'}
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            <span className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
          </div>

          <button
            type="button"
            onClick={() => { 
                setEmail('test@example.com'); 
                handleLogin(null, 'test@example.com'); 
            }}
            className="w-full rounded-2xl border-2 border-blue-100/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/30 py-4 font-black text-blue-600 dark:text-blue-400 shadow-sm transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95"
          >
            Fast Student Access (Dev Box)
          </button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-6 p-4 rounded-xl text-center text-xs font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 pt-10 border-t border-gray-50 dark:border-gray-800 text-center">
           <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest leading-loose">
             Secure Academic Infrastructure<br/>
             <span className="opacity-50 font-medium">Powered by Supabase EOC Persistence</span>
           </p>
        </div>
      </motion.div>
    </div>
  );
}
