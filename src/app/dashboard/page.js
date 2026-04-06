"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
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
  const [isGeneratingLor, setIsGeneratingLor] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [qrCodeURI, setQrCodeURI] = useState("");
  const certRef = useRef(null);
  const lorRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const entryParam = params.get("entry");
    if (entryParam) {
      setEntryNo(entryParam);
      handleLogin(entryParam);
    }
  }, []);

  // Generate QR Code once user is loaded
  useEffect(() => {
    if (userData?.entry_no) {
      QRCode.toDataURL(`https://smakresearch.com/verify?id=${userData.entry_no}`, {
        width: 150,
        margin: 1,
        color: { dark: '#0A1930', light: '#FFFFFF' }
      })
      .then(url => setQrCodeURI(url))
      .catch(err => console.error("QR Generation Error:", err));
    }
  }, [userData]);

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
      await fetch("/api/generate/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_no: userData.entry_no })
      });

      const canvas = await html2canvas(certRef.current, {
        scale: 3, 
        backgroundColor: "#FFFFFF",
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4" 
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

  const generateLOR = async () => {
    if (!userData || !lorRef.current) return;
    setIsGeneratingLor(true);

    try {
      const canvas = await html2canvas(lorRef.current, {
        scale: 3, 
        backgroundColor: "#FFFFFF",
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait", 
        unit: "mm",
        format: "a4" 
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`SMAK-LOR-${userData.entry_no}.pdf`);
      
      setUserData(prev => ({...prev, lor_status: 'generated'}));
      alert("Letter of Recommendation generated and downloaded successfully!");

    } catch (err) {
      console.error(err);
      alert("Error generating the high-resolution LOR. Please try again.");
    } finally {
      setIsGeneratingLor(false);
    }
  };

  const requestLOR = async () => {
    if (userData.lor_status === 'eligible') {
       generateLOR();
    } else {
       try {
         await fetch("/api/lor-request", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ entry_no: userData.entry_no, name: userData.name })
         });
         alert(`Success! Email sent to Admin to manually review LOR eligibility for ${userData.entry_no}. Our team will reach out directly.`);
       } catch(err) {
         alert("Failed to send request. Please try again.");
       }
    }
  };

  const accessModules = () => {
    setIsModulesOpen(true);
  };

  const getSyllabus = (courseName) => {
    const modules = {
      "Medical Research Accelerator": ["Research Fundamentals & Ethics", "Literature Review & Search Strategy", "Data Management & NIH Protocols", "Statistical Analysis in Medicine", "Manuscript Writing & Submission"],
      "Clinical Trials & Ethics": ["Phases of Clinical Trials", "GCP & Regulatory Compliance", "Patient Recruitment & Consent", "Monitoring & Adverse Event Reporting", "Data Integrity & Post-Trial Monitoring"],
      "Healthcare AI & Data Science": ["Intro to Health Informatics", "Machine Learning for Diagnostics", "Electronic Health Records (EHR) Analysis", "Predictive Analytics in Medicine", "Ethical AI & Data Privacy"],
      "Neuroscience Fundamentals": ["Neuroanatomy & Functional Mapping", "Neural Signaling & Synaptic Plasticity", "Cognitive Neuroscience & Memory", "Neuropathology & Current Research", "Neuroimaging Techniques (fMRI/EEG)"],
      "Public Health & Epidemiology": ["Principles of Epidemiology", "Global Health Policy & Systems", "Biostatistics for Public Health", "Infectious Disease Surveillance", "Environmental Health & Sustainability"]
    };
    return modules[courseName] || ["Module 1: Orientation", "Module 2: Core Concepts", "Module 3: Advanced Applications", "Module 4: Final Assessment"];
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
    status: userData.status || "Active",
    enrollmentDate: userData.enrollment_date ? new Date(userData.enrollment_date).toLocaleDateString() : "New Enrollment",
    linkedin: userData.linkedin_url || null
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white p-6 md:p-12 font-sans selection:bg-blue-500 selection:text-white relative">
      <Navbar />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      {/* HIDDEN CERTIFICATE TEMPLATE */}
      <div className="fixed overflow-hidden pointer-events-none -z-50 opacity-0" style={{ top: '-9999px', left: '-9999px' }}>
        <div ref={certRef} style={{ width: "1123px", height: "794px", backgroundColor: "#FFFFFF", padding: "30px", boxSizing: "border-box", fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
           <div style={{ width: "100%", height: "100%", border: "12px solid #0A1930", padding: "4px", boxSizing: "border-box" }}>
             <div style={{ width: "100%", height: "100%", border: "2px solid #CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", paddingTop: "50px", paddingBottom: "0px", boxSizing: "border-box" }}>
               
               {/* Registration ID Top Right */}
               <div style={{ position: "absolute", top: "25px", right: "35px", color: "#64748B", fontSize: "14px", fontFamily: "monospace", letterSpacing: "2px", fontWeight: "bold" }}>
                 ID: {userData.entry_no}
               </div>

               {/* Dual Logo Header Block */}
               <div style={{ width: "100%", padding: "0 60px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", boxSizing: "border-box" }}>
                 {/* Main SMAK Logo */}
                 <div style={{ width: "110px", height: "110px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <img src="/logo.png" style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="SMAK Logo" />
                 </div>
                 
                 {/* Center Brand Text */}
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <h3 style={{ color: "#0A1930", fontSize: "20px", letterSpacing: "0.3em", fontWeight: "600", textTransform: "uppercase", margin: 0 }}>Society for Medical</h3>
                    <h3 style={{ color: "#0A1930", fontSize: "20px", letterSpacing: "0.3em", fontWeight: "600", textTransform: "uppercase", margin: 0 }}>Academia & Knowledge</h3>
                 </div>

                 {/* New Secondary Club Logo */}
                 <div style={{ width: "110px", height: "110px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {/* Pointing to club_logo.png. User needs to drag their image into public/ */}
                   <img src="/club_logo.png" style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="SMAK Club Logo" />
                 </div>
               </div>

               {/* Title */}
               <h1 style={{ color: "#1E3A8A", fontSize: "65px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "5px", margin: "0 0 25px 0", textAlign: "center", lineHeight: "1.15" }}>
                 Certificate of <br/> Excellence
               </h1>

               {/* Certify Text */}
               <p style={{ color: "#64748B", fontSize: "22px", letterSpacing: "3px", fontWeight: "500", textTransform: "uppercase", margin: "0 0 20px 0" }}>This is to proudly certify that</p>
               
               {/* Name Block */}
               <h2 style={{ color: "#0F172A", fontSize: "56px", fontWeight: "bold", fontFamily: "Georgia, serif", margin: "0 0 10px 0", textAlign: "center", textTransform: "capitalize" }}>
                 {stats.name}
               </h2>
               <div style={{ width: "500px", height: "2px", backgroundColor: "#1E3A8A", margin: "0 auto 30px auto" }}></div>

               {/* Paragraph Block */}
               <p style={{ color: "#334155", fontSize: "20px", maxWidth: "800px", textAlign: "center", lineHeight: "1.6", margin: "0 0 0 0" }}>
                 has successfully completed the grueling academic requirements, rigorous training, and comprehensive examinations of the <strong style={{ color: "#1E3A8A" }}>{stats.course}</strong> program with exceptional performance.
               </p>

               {/* Footer Signatures with QR Code (Pushed up using mb-60) */}
               <div style={{ width: "100%", padding: "0 100px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", marginBottom: "50px", boxSizing: "border-box" }}>
                 
                 {/* Left Signature */}
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "10px" }}>
                   {userData.director_sign ? (
                     userData.director_sign.startsWith('http') || userData.director_sign.startsWith('/') ? (
                       <img src={userData.director_sign} alt="Signature" style={{ height: "40px", objectFit: "contain", marginBottom: "10px" }} />
                     ) : (
                       <span style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: "36px", color: "#0F172A", marginBottom: "5px", lineHeight: "1" }}>{userData.director_sign}</span>
                     )
                   ) : <div style={{ height: "45px" }}></div>}
                   <div style={{ width: "240px", height: "1px", backgroundColor: "#94A3B8", marginBottom: "8px" }}></div>
                   <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>{userData.director_name || "Program Director"}</span>
                   <span style={{ color: "#64748B", fontSize: "14px", marginTop: "4px", fontStyle: "italic" }}>SMAK Research</span>
                 </div>
                 
                 {/* Center QR Verification Code */}
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                   {qrCodeURI ? (
                     <div style={{ width: "100px", height: "100px", backgroundColor: "#FFFFFF", padding: "4px", border: "2px solid #E2E8F0", borderRadius: "10px" }}>
                       <img src={qrCodeURI} alt="Verification QR" style={{ width: "100%", height: "100%" }} />
                     </div>
                   ) : (
                     <div style={{ width: "100px", height: "100px", border: "2px dashed #CBD5E1", borderRadius: "10px" }}></div>
                   )}
                   <span style={{ color: "#64748B", fontSize: "10px", marginTop: "8px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "bold" }}>Scan to Verify</span>
                 </div>

                 {/* Right Date */}
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "10px" }}>
                   <div style={{ height: "45px" }}></div>
                   <div style={{ width: "240px", height: "1px", backgroundColor: "#94A3B8", marginBottom: "8px" }}></div>
                   <span style={{ color: "#0F172A", fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Date Issued</span>
                   <span style={{ color: "#64748B", fontSize: "14px", marginTop: "4px" }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                 </div>

               </div>

             </div>
           </div>
        </div>

      {/* HIDDEN LOR TEMPLATE (A4 Portrait) */}
      <div className="fixed overflow-hidden pointer-events-none -z-50 opacity-0" style={{ top: '-9999px', left: '-9999px' }}>
        <div ref={lorRef} style={{ width: "794px", height: "1123px", backgroundColor: "#FFFFFF", padding: "50px", boxSizing: "border-box", fontFamily: "'Times New Roman', Times, serif" }}>
           
           {/* LOR Header */}
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0A1930", paddingBottom: "20px", marginBottom: "40px" }}>
              <div style={{ width: "100px", height: "100px" }}>
                 <img src="/logo.png" style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="SMAK Logo" />
              </div>
              <div style={{ textAlign: "right" }}>
                 <h2 style={{ color: "#0A1930", fontSize: "24px", margin: "0 0 5px 0", textTransform: "uppercase", letterSpacing: "2px" }}>Society for Medical</h2>
                 <h2 style={{ color: "#0A1930", fontSize: "24px", margin: "0 0 15px 0", textTransform: "uppercase", letterSpacing: "2px" }}>Academia & Knowledge</h2>
                 <p style={{ color: "#475569", fontSize: "14px", margin: "0", fontFamily: "sans-serif" }}>official@smakresearch.com</p>
                 <p style={{ color: "#475569", fontSize: "14px", margin: "0", fontFamily: "sans-serif" }}>www.smakresearch.com</p>
              </div>
           </div>

           {/* LOR Meta */}
           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", fontFamily: "sans-serif", fontSize: "14px", color: "#334155" }}>
              <div><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div><strong>Reference ID:</strong> {userData.entry_no}</div>
           </div>

           {/* LOR Title */}
           <h1 style={{ textAlign: "center", fontSize: "28px", color: "#0F172A", letterSpacing: "1px", borderBottom: "1px solid #CBD5E1", display: "inline-block", margin: "0 auto 40px auto", paddingBottom: "10px", width: "100%" }}>LETTER OF RECOMMENDATION</h1>

           {/* LOR Body */}
           <div style={{ fontSize: "16px", lineHeight: "1.8", color: "#1E293B", textAlign: "justify" }}>
              <p style={{ marginBottom: "20px" }}>To Whom It May Concern,</p>
              
              <p style={{ marginBottom: "20px" }}>
                It is with great pleasure and strong endorsement that I write this letter of recommendation for <strong style={{ fontSize: "18px" }}>{stats.name}</strong>, who has demonstrated exemplary performance in the <strong>{stats.course}</strong> program hosted by the Society for Medical Academia & Knowledge.
              </p>
              
              <p style={{ marginBottom: "20px" }}>
                Over the course of the rigorous training, {stats.name.split(' ')[0]} maintained an impressive attendance record of <strong>{stats.attendance}%</strong> and achieved a comprehensive quiz proficiency rating of <strong>{stats.quizAvg}%</strong>. These metrics reflect a level of dedication, analytical aptitude, and intellectual curiosity that places them in the highest percentiles of our cohort.
              </p>

              <p style={{ marginBottom: "20px" }}>
                The curriculum demands exceptional critical thinking, clinical research methodology comprehension, and proactive collaboration. {stats.name.split(' ')[0]} consistently navigated complex medical paradigms with professionalism and a clear commitment to academic excellence. Their ability to synthesize rigorous scientific data and apply it constructively makes them a highly valuable asset to any future clinical or academic endeavor.
              </p>

              <p style={{ marginBottom: "50px" }}>
                I unreservedly recommend {stats.name} for competitive academic placements, advanced research opportunities, or professional capacities. Should you require any further validation of their credentials, please contact our administrative board.
              </p>
           </div>

           {/* LOR Sign Off */}
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                 <p style={{ marginBottom: "10px", fontSize: "16px", color: "#1E293B" }}>Sincerely,</p>
                 {userData.director_sign ? (
                   userData.director_sign.startsWith('http') || userData.director_sign.startsWith('/') ? (
                     <img src={userData.director_sign} alt="Signature" style={{ height: "60px", objectFit: "contain", marginBottom: "10px" }} />
                   ) : (
                     <div style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: "40px", color: "#0A1930", marginBottom: "10px", lineHeight: "1" }}>{userData.director_sign}</div>
                   )
                 ) : <div style={{ height: "60px" }}></div>}
                 <strong style={{ display: "block", fontSize: "18px", color: "#0F172A", margin: "0 0 5px 0" }}>{userData.director_name || "Program Director"}</strong>
                 <p style={{ margin: "0", color: "#475569", fontSize: "14px", fontFamily: "sans-serif" }}>Program Director, {stats.course}</p>
                 <p style={{ margin: "0", color: "#475569", fontSize: "14px", fontFamily: "sans-serif" }}>Society for Medical Academia & Knowledge</p>
              </div>

              {qrCodeURI && (
                <div style={{ width: "90px", height: "90px", padding: "4px", border: "1px solid #CBD5E1", borderRadius: "8px" }}>
                  <img src={qrCodeURI} alt="Verification QR" style={{ width: "100%", height: "100%" }} />
                </div>
              )}
           </div>

        </div>
      </div>
      </div>

      <div className="max-w-6xl mx-auto mt-28 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex gap-2 items-center mb-3">
              <div className="text-xs text-blue-400 tracking-widest uppercase font-semibold">ID: {userData.entry_no}</div>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                stats.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                stats.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {stats.status}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 mb-2">
              Welcome back, <span className="text-white">{stats.name.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <p>Member since {stats.enrollmentDate}</p>
              {stats.linkedin && (
                <a href={stats.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white transition flex items-center gap-1 group">
                   LinkedIn <div className="w-3 h-3 border-t border-r border-blue-400 group-hover:border-white transform rotate-45 mt-1"></div>
                </a>
              )}
            </div>
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
    {/* Modules Modal */}
    {isModulesOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          onClick={() => setIsModulesOpen(false)}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-[#0A1220] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col relative z-20 shadow-2xl"
        >
          <div className="p-8 border-b border-white/10 flex justify-between items-center">
            <div>
              <div className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-2">Program Portal</div>
              <h2 className="text-2xl font-bold text-white">{stats.course}</h2>
            </div>
            <button onClick={() => setIsModulesOpen(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
              <span className="text-2xl text-gray-400">&times;</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid gap-4">
              {getSyllabus(stats.course).map((module, idx) => (
                <div key={idx} className="group p-5 bg-[#050A10] border border-white/5 rounded-2xl hover:border-blue-500/40 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{module}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Status: Unlocked for Member</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-600 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                    &rarr;
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <h5 className="text-blue-400 font-bold flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Official Announcement
              </h5>
              <p className="text-sm text-gray-400 leading-relaxed">
                The interactive video modules for {stats.course} are currently being mastered for UHD streaming. 
                Your textual resources and assignment submission portals will be integrated directly into each module card above shortly.
              </p>
            </div>
          </div>
          
          <div className="p-8 border-t border-white/10 bg-[#050A10] flex justify-end">
            <button onClick={() => setIsModulesOpen(false)} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition-all">
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )}

    </div>
  );
}
