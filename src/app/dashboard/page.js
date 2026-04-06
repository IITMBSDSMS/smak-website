"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [entryNo, setEntryNo] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  // Check if session exists in URL seamlessly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const entryParam = params.get("entry");
    if (entryParam) {
      setEntryNo(entryParam);
      handleLogin(entryParam);
    }
  }, []);

  const handleLogin = async (overrideEntry) => {
    const idToFetch = overrideEntry || entryNo;
    if (!idToFetch) return;

    setLoading(true);
    setAuthError("");

    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("entry_no", idToFetch.trim() || "INVALID_ID_BLOCK") // Prevent querying all nulls
        .limit(1)
        .single();

      if (error || !data) {
        setAuthError("Registration ID not found. Ensure you entered it correctly.");
        setIsAuthenticated(false);
      } else {
        setUserData(data);
        setIsAuthenticated(true);
        // Optionally clean up URL or push state so they can bookmark it easily
        window.history.replaceState(null, '', `?entry=${idToFetch}`);
      }
    } catch (err) {
      console.error(err);
      setAuthError("Failed to connect to student database.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if(!userData) return;
    try {
      const res = await fetch("/api/generate/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_no: userData.entry_no })
      });
      const result = await res.json();
      if(result.success) {
        alert("Success! Your certificate layout URL is: " + result.url);
        // Refresh local UI
        setUserData(prev => ({...prev, cert_status: 'generated'}));
      } else {
        alert("Error: " + result.error);
      }
    } catch(err) {
      alert("Failed to contact the server to generate certificate.");
    }
  }

  // --- LOGIN VIEW ---
  if (!isAuthenticated && !userData) {
    return (
      <main className="bg-[#050B14] text-white min-h-screen relative overflow-hidden flex flex-col justify-center items-center">
        <Navbar />
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md px-6 py-12"
        >
           <div className="text-center mb-8">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 text-xs text-blue-400 mb-4 tracking-widest uppercase">
               Authorized Personnel
             </div>
             <h1 className="text-4xl font-sans tracking-tight text-white mb-2">
               Access <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Dashboard</span>
             </h1>
             <p className="text-gray-400 text-sm">Enter your registration ID to view your progress.</p>
           </div>

           <div className="bg-[#0A1220]/80 border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1.5 block">Registration ID</label>
                  <input 
                    type="text"
                    value={entryNo}
                    onChange={(e) => setEntryNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full bg-[#050A10] border border-gray-800 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="e.g. SMAK0027"
                  />
                </div>
                
                <AnimatePresence>
                  {authError && (
                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="text-red-400 text-sm text-center">
                      {authError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={() => handleLogin()}
                  disabled={loading || !entryNo}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold tracking-wide rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Unlock Dashboard'}
                </button>
              </div>
           </div>
        </motion.div>
      </main>
    );
  }

  // --- DASHBOARD VIEW ---
  const stats = {
    name: userData.name || "Member",
    course: userData.course || "Medical Research Accelerator",
    attendance: userData.attendance || 0,
    quizAvg: userData.quiz_avg || 0,
    certStatus: userData.cert_status || "pending",
    lorStatus: userData.lor_status || "pending",
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white p-6 md:p-12 font-sans selection:bg-blue-500 selection:text-white relative">
      <Navbar />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto mt-28 relative z-10">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-xs text-blue-400 tracking-widest uppercase mb-2 font-semibold">ID: {userData.entry_no}</div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 mb-2">
              Welcome back, <span className="text-white">{stats.name.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400">Track your progress and access your credentials.</p>
          </div>
          <button 
            onClick={() => { setIsAuthenticated(false); setUserData(null); }}
            className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-white transition rounded-lg text-sm"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 grid grid-cols-2 gap-4"
          >
            <div className="bg-[#0A1220]/80 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-semibold">Attendance</p>
              <div className="text-4xl font-bold text-blue-500">{stats.attendance}%</div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full" style={{ width: `${stats.attendance}%` }}></div>
              </div>
            </div>

            <div className="bg-[#0A1220]/80 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-semibold">Quiz Average</p>
              <div className="text-4xl font-bold text-cyan-400">{stats.quizAvg}%</div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-1.5 rounded-full" style={{ width: `${stats.quizAvg}%` }}></div>
              </div>
            </div>
            
            <div className="col-span-2 bg-gradient-to-br from-[#0F1C34] to-[#0A1220] border border-blue-900/30 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="text-xl font-bold mb-1 relative z-10 text-gray-300">Currently Enrolled</h3>
              <p className="text-blue-400 font-medium relative z-10 text-lg">{stats.course}</p>
              <button className="mt-8 px-6 py-2.5 bg-white text-[#0A1220] text-sm font-bold rounded-lg relative z-10 hover:shadow-lg hover:shadow-white/20 transition-all">
                Access Modules Portal
              </button>
            </div>
          </motion.div>

          {/* Documents & Credentials Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A1220]/80 border border-white/5 rounded-2xl p-6 flex flex-col"
          >
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-4 text-gray-200">Official Credentials</h3>
            
            <div className="space-y-4 flex-1">
              <div className="p-4 bg-[#050A10] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-semibold text-gray-200">Course Certificate</span>
                  {stats.certStatus === 'eligible' ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500/10 text-green-400 px-2 py-1 rounded shrink-0">Unlocked</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded shrink-0">Locked</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">Requires minimum 70% attendance and 50% quiz average.</p>
                <button 
                  onClick={generatePDF}
                  disabled={stats.certStatus !== 'eligible'} 
                  className="w-full text-center text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg mt-1 disabled:opacity-30 transition cursor-pointer"
                >
                  Generate PDF
                </button>
              </div>

              <div className="p-4 bg-[#050A10] rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-semibold text-gray-200">Letter of Recommendation</span>
                  {stats.lorStatus === 'eligible' ? (
                     <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500/10 text-green-400 px-2 py-1 rounded shrink-0">Unlocked</span>
                  ) : (
                     <span className="text-[10px] uppercase font-bold tracking-wider bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded shrink-0">Locked</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">Requires exceptional performance (85% attendance, 75% quiz).</p>
                <button 
                  disabled={stats.lorStatus !== 'eligible'} 
                  className="w-full text-center text-sm font-semibold border border-gray-700 hover:bg-gray-800 transition text-gray-400 px-3 py-2 rounded-lg disabled:opacity-30"
                >
                  Request Fast-Track
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
