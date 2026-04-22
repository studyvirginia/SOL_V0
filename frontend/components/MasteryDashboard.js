import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  BarChart3, 
  Target, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Search,
  Filter,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MasteryDashboard = ({ onBack }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMastery();
  }, []);

  const fetchMastery = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('curriculum_mastery')
      .select('*')
      .eq('user_id', user.id)
      .order('mastery_score', { ascending: false });

    if (data) setStats(data);
    setLoading(false);
  };

  const filteredStats = stats.filter(s => {
    const matchesFilter = filter === 'All' || s.subject === filter;
    const matchesSearch = s.standard_code.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusBg = (score) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50';
    return 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50';
  };

  const subjects = ['All', ...new Set(stats.map(s => s.subject))];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="px-6 py-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-6xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <BarChart3 size={20} />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mastery Hub</h1>
            </div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Real-time Virginia SOL Progress Tracking
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text"
                  placeholder="Find Standard (e.g. G.8)"
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-48"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <button 
               onClick={() => window.print()}
               className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-800 transition-all flex items-center gap-2"
             >
               <Printer size={14} />
               Print Report
             </button>
             <button 
               onClick={onBack}
               className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
               id="back-btn"
             >
               Back to Sessions
             </button>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-6xl mx-auto w-full">
           <Filter size={14} className="text-gray-400 mr-2 shrink-0" />
           {subjects.map(sub => (
             <button
               key={sub}
               onClick={() => setFilter(sub)}
               className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                 filter === sub 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' 
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600'
               }`}
             >
               {sub}
             </button>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 print:p-0">
        <div className="max-w-6xl mx-auto w-full">
          {/* Print-only Report Header */}
          <div className="hidden print:block mb-10 border-b-2 border-gray-900 pb-6">
            <h1 className="text-4xl font-black mb-2">SOL Mastery Report Card</h1>
            <p className="text-sm font-bold text-gray-600">Generated for Student Access: {new Date().toLocaleDateString()}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-xl">
               <p className="text-xs leading-relaxed">
                 This document summarizes current proficiency levels across the Virginia Standards of Learning (SOL) curriculum. 
                 Proficiency is calculated based on high-rigor assessment performance and cognitive alignment.
               </p>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="h-40 rounded-3xl bg-gray-50 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-700" />
               ))}
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
               <Target size={48} className="text-gray-300 mb-4" />
               <p className="text-lg font-bold text-gray-400">No mastery data yet.</p>
               <p className="text-sm text-gray-500 mt-1">Complete quizzes to populate your dashboard!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStats.map((stat, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={stat.id}
                  className={`group relative overflow-hidden rounded-3xl border p-6 transition-all hover:shadow-xl hover:-translate-y-1 ${getStatusBg(stat.mastery_score)}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.subject}</span>
                       <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{stat.standard_code}</h3>
                    </div>
                    <div className={`p-2.5 rounded-2xl ${getStatusColor(stat.mastery_score)} text-white shadow-lg`}>
                       <Award size={20} />
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-end justify-between mb-2">
                       <span className="text-3xl font-black tabular-nums text-gray-900 dark:text-white">{stat.mastery_score}%</span>
                       <span className="text-[10px] font-bold text-gray-400 italic mb-1">{stat.attempts_count} attempts</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${stat.mastery_score}%` }}
                         transition={{ duration: 1, ease: 'easeOut' }}
                         className={`h-full ${getStatusColor(stat.mastery_score)} shadow-[0_0_12px_rgba(0,0,0,0.1)]`}
                       />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100/50 dark:border-gray-800/50 flex items-center justify-between">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <BookOpen size={12} className="text-blue-500" />
                        <span>High Rigor</span>
                     </div>
                     <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasteryDashboard;
