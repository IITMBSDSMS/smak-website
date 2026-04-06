"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef(null);

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
        .eq("entry_no", idToFetch.trim() || "INVALID_ID_BLOCK")
        .limit(1)
        .single();

      if (error || !data) {
        setAuthError("Registration ID not found. Ensure you entered it correctly.");
        setIsAuthenticated(false);
      } else {
        setUserData(data);
        setIsAuthenticated(true);
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
    if (!userData || !certRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Log the backend interaction to mark as generated
      await fetch("/api/generate/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_no: userData.entry_no })
      });

      // 2. Generate HD PDF natively on the client
      const canvas = await html2canvas(certRef.current, {
        scale: 3, // High quality printing
        backgroundColor: "#FFFFFF",
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4" // 297mm x 210mm
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      pdf.save(`SMAK-Certificate-${userData.entry_no}.pdf`);
      
      setUserData(prev => ({...prev, cert_status: 'generated'}));
      alert("Certificate generated and downloaded successfully!");

    } catch (err) {
      console.error(err);
      alert("Error generating the high-resolution certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const requestLOR = () => {
    alert(`Success! Email sent to Admin to process the Letter of Recommendation for ${userData.entry_no}. Our team will reach out directly.`);
  };

  const accessModules = () => {
    alert("Welcome! The Module Portal is currently under final academic review. Your syllabus will be unlocked shortly.");
  };

  if (!isAuthenticated && !userData) {
    return (
      <main className="bg-[#050B14] text-white min-h-screen relative overflow-hidden flex flex-col justify-center items-center">
        <Navbar />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md px-6 py-12">
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
                  <input type="text" value={entryNo} onChange={(e) => setEntryNo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full bg-[#050A10] border border-gray-800 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors" placeholder="e.g. SMAK0027" />
                </div>
                <AnimatePresence>
                  {authError && (
                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="text-red-400 text-sm text-center">
                      {authError}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => handleLogin()} disabled={loading || !entryNo} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold tracking-wide rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Unlock Dashboard'}
                </button>
              </div>
           </div>
        </motion.div>
      </main>
    );
  }

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

      {/* HIDDEN CERTIFICATE TEMPLATE */}
      <div className="fixed overflow-hidden pointer-events-none -z-50 opacity-0" style={{ top: '-9999px', left: '-9999px' }}>
        <div ref={certRef} className="relative flex flex-col items-center justify-center font-sans tracking-wide" style={{ width: "1123px", height: "794px", backgroundColor: "#FFFFFF" }}>
           <div className="absolute inset-0 m-[30px] border-[12px] border-[#0A1930] flex flex-col justify-center items-center">
             <div className="absolute inset-0 m-[4px] border-[2px] border-[#CBD5E1]"></div>
             
             {/* Header */}
             <div className="mb-8 flex flex-col items-center">
               <div className="w-[100px] h-[100px] bg-[#0A1930] rounded-full p-[15px] mb-6 flex items-center justify-center">
                 <img src="/logo.png" className="w-full h-full object-contain" alt="SMAK Logo" />
               </div>
               <h3 className="text-[#0A1930] text-[20px] tracking-[0.3em] font-semibold uppercase mb-2">Society for Medical Academia & Knowledge</h3>
             </div>

             <h1 className="text-[#1E3A8A] text-[64px] font-black uppercase tracking-widest mb-10 text-center -mt-2">
               Certificate of <br/> Excellence
             </h1>

             <p className="text-[#64748B] text-[22px] tracking-widest font-medium uppercase mb-8">This is to proudly certify that</p>
             
             <h2 className="text-[#0F172A] text-[54px] font-bold border-b-2 border-[#1E3A8A] px-16 pb-2 mb-8 leading-none" style={{ fontFamily: "Georgia, serif" }}>
               {stats.name}
             </h2>

             <p className="text-[#334155] text-[18px] max-w-[700px] text-center leading-relaxed mb-16">
               has successfully completed the grueling academic requirements, rigorous training, and comprehensive examinations of the <strong className="text-[#1E3A8A]">{stats.course}</strong> program with exceptional performance.
             </p>

             {/* Footer Signatures */}
             <div className="absolute bottom-[60px] w-full px-[120px] flex justify-between items-end">
               <div className="flex flex-col items-center">
                 <div className="w-[200px] h-px bg-[#94A3B8] mb-4"></div>
                 <span className="text-[#0F172A] font-bold text-[18px] uppercase tracking-wide">Program Director</span>
                 <span className="text-[#64748B] text-[14px] mt-1">SMAK Research</span>
               </div>
               
               <div className="flex flex-col items-center">
                 <div className="w-[80px] h-[80px] border-[3px] border-[#0A1930] rounded-full flex items-center justify-center mb-6">
                   <span className="text-[#0A1930] font-black text-[10px] text-center uppercase leading-tight tracking-widest">Official<br/>Seal</span>
                 </div>
               </div>

               <div className="flex flex-col items-center">
                 <div className="w-[200px] h-px bg-[#94A3B8] mb-4"></div>
                 <span className="text-[#0F172A] font-bold text-[18px] uppercase tracking-wide">Date Issued</span>
                 <span className="text-[#64748B] text-[14px] mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
               </div>
             </div>

             <div className="absolute top-[40px] right-[40px] text-[#64748B] text-[12px] font-mono tracking-widest">
               ID: {userData.entry_no}
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-28 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-xs text-blue-400 tracking-widest uppercase mb-2 font-semibold">ID: {userData.entry_no}</div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 mb-2">
              Welcome back, <span className="text-white">{stats.name.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400">Track your progress and access your credentials.</p>
          </div>
          <button onClick={() => { setIsAuthenticated(false); setUserData(null); }} className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-white transition rounded-lg text-sm">
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 grid grid-cols-2 gap-4">
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
              <button onClick={accessModules} className="mt-8 px-6 py-2.5 bg-white text-[#0A1220] text-sm font-bold rounded-lg relative z-10 hover:shadow-lg hover:shadow-white/20 transition-all">
                Access Modules Portal
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[#0A1220]/80 border border-white/5 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-4 text-gray-200">Official Credentials</h3>
            <div className="space-y-4 flex-1">
              <div className="p-4 bg-[#050A10] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-semibold text-gray-200">Course Certificate</span>
                  {stats.certStatus === 'eligible' || stats.certStatus === 'generated' ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500/10 text-green-400 px-2 py-1 rounded shrink-0">Unlocked</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded shrink-0">Locked</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">Requires minimum 70% attendance and 50% quiz average.</p>
                <button onClick={generatePDF} disabled={isGenerating || (stats.certStatus !== 'eligible' && stats.certStatus !== 'generated')} className="w-full flex items-center justify-center gap-2 text-center text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg mt-1 disabled:opacity-30 disabled:bg-gray-800 disabled:text-gray-400 transition cursor-pointer">
                  {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Generate High-Res PDF"}
                </button>
              </div>

              <div className="p-4 bg-[#050A10] rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-semibold text-gray-200">Letter of Recommendation</span>
                  {stats.lorStatus === 'eligible' || stats.lorStatus === 'generated' ? (
                     <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500/10 text-green-400 px-2 py-1 rounded shrink-0">Unlocked</span>
                  ) : (
                     <span className="text-[10px] uppercase font-bold tracking-wider bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded shrink-0">Locked</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">Requires exceptional performance (85% attendance, 75% quiz).</p>
                <button onClick={requestLOR} disabled={stats.lorStatus !== 'eligible' && stats.lorStatus !== 'generated'} className="w-full text-center text-sm font-semibold border border-blue-500 hover:bg-blue-600 transition text-blue-400 hover:text-white px-3 py-2 rounded-lg disabled:opacity-30 disabled:border-gray-700 disabled:text-gray-500 disabled:hover:bg-transparent">
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
