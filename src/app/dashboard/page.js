"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MenteeDashboard() {
  const [loading, setLoading] = useState(true);

  // In a real app we fetch this using Supabase Auth ID
  const mockUserStats = {
    name: "John Doe",
    course: "Medical Research Accelerator",
    attendance: 85, // %
    quizAvg: 78,    // %
    certStatus: "eligible", // pending, eligible, generated
    lorStatus: "eligible",
  };

  useEffect(() => {
    // Simulate fetch delay
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-[#ff4e4e] selection:text-white">
      <div className="max-w-6xl mx-auto mt-20">
        
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500 mb-2">
            Welcome back, {mockUserStats.name}
          </h1>
          <p className="text-gray-400">Track your progress and access your credentials.</p>
        </header>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="h-40 w-full bg-white/5 rounded-2xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stats Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 grid grid-cols-2 gap-4"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Attendance</p>
                <div className="text-4xl font-bold text-[#ff4e4e]">{mockUserStats.attendance}%</div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4">
                  <div className="bg-[#ff4e4e] h-1.5 rounded-full" style={{ width: `${mockUserStats.attendance}%` }}></div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Quiz Average</p>
                <div className="text-4xl font-bold text-white">{mockUserStats.quizAvg}%</div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: `${mockUserStats.quizAvg}%` }}></div>
                </div>
              </div>
              
              <div className="col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#ff4e4e]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-xl font-bold mb-1 relative z-10">Currently Enrolled</h3>
                <p className="text-[#ff4e4e] font-medium relative z-10">{mockUserStats.course}</p>
                <button className="mt-6 px-6 py-2 bg-white text-black text-sm font-bold rounded-lg relative z-10 hover:scale-105 transition">
                  Access Course Modules
                </button>
              </div>
            </motion.div>

            {/* Documents & Credentials Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col"
            >
              <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-4">Credentials</h3>
              
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Course Certificate</span>
                    {mockUserStats.certStatus === 'eligible' ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Unlocked</span>
                    ) : (
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Locked</span>
                    )}
                  </div>
                  <button 
                    disabled={mockUserStats.certStatus !== 'eligible'} 
                    className="w-full text-center text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg mt-2 disabled:opacity-30 transition cursor-pointer"
                  >
                    Generate PDF
                  </button>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[#ff4e4e]/30 transition group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Letter of Recommendation</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/20">Eligible</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">You meet the extreme 85% attendance criteria.</p>
                  <button className="w-full text-center text-sm border border-[#ff4e4e]/50 hover:bg-[#ff4e4e] transition text-[#ff4e4e] hover:text-white px-3 py-2 rounded-lg">
                    Request LOR
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
