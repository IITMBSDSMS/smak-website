"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import Navbar from "../components/Navbar"
import GlassCard from "../components/GlassCard"
import Image from "next/image"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ResearchClub() {
  const [mentors, setMentors] = useState([])
  const [scholars, setScholars] = useState([])

  const { scrollYProgress } = useScroll()
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 400])

  useEffect(() => {
    async function loadTeam() {
      const { data: mentorData } = await supabase
        .from("research_mentors")
        .select("*")
        .order("created_at", { ascending: true })

      const { data: scholarData } = await supabase
        .from("research_scholars")
        .select("*")
        .order("created_at", { ascending: true })

      if (mentorData) setMentors(mentorData)
      if (scholarData) setScholars(scholarData)
    }

    loadTeam()
  }, [])

  return (
    <main className="bg-transparent text-gray-100 min-h-screen flex flex-col pt-16">
      <Navbar />

      {/* 1. Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative py-32 text-center max-w-5xl mx-auto px-6 overflow-hidden min-h-[80vh] flex flex-col justify-center items-center"
      >
        <motion.div style={{ y: yHero }} className="absolute inset-0 pointer-events-none z-[-1]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-bio/10 rounded-full blur-[150px]"></div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-12 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center p-2 rounded-full border border-blue-neural/30 shadow-[0_0_50px_rgba(0,85,255,0.4)]"
        >
          {/* Animated rings */}
          <div className="absolute inset-[-10px] rounded-full border border-cyan-bio/40 border-l-transparent animate-spin-slow"></div>
          <div className="absolute inset-[-20px] rounded-full border border-blue-cyber/20 border-r-transparent animate-spin-slower reverse"></div>

          <Image
            src="/research-club-logo.png"
            alt="Research Club"
            fill
            className="rounded-full object-cover z-10 p-1"
            unoptimized
          />
        </motion.div>

        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-sans font-medium mb-6 tracking-tight text-glow bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        >
          SMAK Research Hub
        </motion.h1>

        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl"
        >
          A premier collaborative environment dedicated to exploring medical frontiers, publishing high-impact clinical analyses, and forging the next generation of clinician-scientists.
        </motion.p>
      </motion.section>

      {/* 2. Core Pillars */}
      <section className="py-24 relative z-10 border-t border-gray-900/50 bg-black-obsidian/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 px-6 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-bio/30 text-xs text-cyan-bio mb-6 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-bio"></span> MISSION DIRECTIVE
            </div>
            <h2 className="text-3xl md:text-5xl font-light mb-8 text-white">
              Data-Driven <br/> <strong className="font-bold">Medical Progress</strong>
            </h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-8">
              The SMAK Research architecture provides high-level mentorship and state-of-the-art methodological training. Our operatives design rigorous studies, decipher complex clinical datasets, and publish in globally recognized journals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard hoverEffect={true} className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 font-mono flex items-center gap-3">
                <span className="text-cyan-bio">01.</span> Mentorship
              </h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">Direct pipeline to elite, published researchers providing 1-on-1 strategic guidance.</p>
            </GlassCard>

            <GlassCard hoverEffect={true} className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 font-mono flex items-center gap-3">
                <span className="text-cyan-bio">02.</span> Methodology
              </h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">Intensive bootcamps on biostatistics, clinical trial design, and systemic reviews.</p>
            </GlassCard>

            <GlassCard hoverEffect={true} className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 font-mono flex items-center gap-3">
                <span className="text-cyan-bio">03.</span> Synergy Networks
              </h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">Cross-institutional connectivity matching diverse cohorts onto multi-center studies.</p>
            </GlassCard>

            <GlassCard hoverEffect={true} className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 font-mono flex items-center gap-3">
                <span className="text-cyan-bio">04.</span> Publication
              </h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">End-to-end logistical and editorial support ensuring successful global dissemination.</p>
            </GlassCard>
          </div>

        </div>
      </section>

      {/* 3. Research Vectors (Opportunities) */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16 uppercase tracking-wider text-white">Active <span className="font-bold">Vectors</span></h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative rounded-[20px] p-[1px] overflow-hidden bg-gray-900 border border-gray-800 hover:border-cyan-bio/50 transition-colors duration-500 interactive">
              <div className="p-10 h-full relative z-10 bg-black-obsidian rounded-[19px]">
                <div className="w-12 h-12 mb-6 rounded-full border border-blue-neural/50 flex items-center justify-center text-blue-neural group-hover:bg-blue-neural/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Clinical Analytics</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Interface with massive, real-world patient datasets. Extract signals, determine outcomes, and advance diagnostic paradigms.</p>
              </div>
            </div>

            <div className="group relative rounded-[20px] p-[1px] overflow-hidden bg-gray-900 border border-gray-800 hover:border-cyan-bio/50 transition-colors duration-500 interactive">
              <div className="p-10 h-full relative z-10 bg-black-obsidian rounded-[19px]">
                <div className="w-12 h-12 mb-6 rounded-full border border-blue-neural/50 flex items-center justify-center text-blue-neural group-hover:bg-blue-neural/10 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Systematics</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Synthesize thousands of prior trials into definitive meta-analyses. establish ironclad clinical guidelines for the global community.</p>
              </div>
            </div>

            <div className="group relative rounded-[20px] p-[1px] overflow-hidden bg-gray-900 border border-gray-800 hover:border-cyan-bio/50 transition-colors duration-500 interactive">
               <div className="p-10 h-full relative z-10 bg-black-obsidian rounded-[19px]">
                <div className="w-12 h-12 mb-6 rounded-full border border-blue-neural/50 flex items-center justify-center text-blue-neural group-hover:bg-blue-neural/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Tech Innovation</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Collaborate on the intersection of medicine and technology—from AI diagnostic tools to novel surgical robotics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Timeline / Execution Path */}
      <section className="py-24 relative z-10 border-t border-gray-900/50 bg-black-obsidian/40 backdrop-blur-md overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-bio/40 to-transparent hidden md:block"></div>
        
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs tracking-[0.3em] font-mono text-center mb-2 text-cyan-bio uppercase">Protocol</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-20 text-white uppercase">Execution Path</h3>
          
          <div className="grid md:grid-cols-4 gap-12 text-center relative">
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-black-void border-2 border-cyan-bio rounded-full flex items-center justify-center font-mono text-xl text-glow bg-cyan-bio/10 shadow-[0_0_20px_rgba(0,240,255,0.4)] mb-6">01</div>
              <h4 className="font-bold text-white mb-3 tracking-wide">INITIALIZATION</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Master the methodological framework and statistical tooling required for rigorous investigation.</p>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-black-void border border-gray-600 rounded-full flex items-center justify-center font-mono text-xl text-gray-400 mb-6">02</div>
              <h4 className="font-bold text-white mb-3 tracking-wide">ALIGNMENT</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Select a hyper-specialized research vector and integrate with a dedicated mentor cell.</p>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-black-void border border-gray-600 rounded-full flex items-center justify-center font-mono text-xl text-gray-400 mb-6">03</div>
              <h4 className="font-bold text-white mb-3 tracking-wide">SYNTHESIS</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Process data, execute clinical protocols, and draft high-fidelity scientific manuscripts.</p>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-black-void border border-gray-600 rounded-full flex items-center justify-center font-mono text-xl text-gray-400 mb-6">04</div>
              <h4 className="font-bold text-white mb-3 tracking-wide">DEPLOYMENT</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Publish findings across decentralized global journals and international medical symposiums.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 / 6. Operatives (Mentors & Scholars) */}
      <section className="py-24 relative z-10">
        <div className="max-w-[100vw] mx-auto overflow-hidden">
          
          <div className="mb-16 px-6 text-center">
             <h2 className="text-3xl font-bold uppercase tracking-widest text-white">Mentorship Matrix</h2>
             <div className="w-16 h-[2px] bg-blue-neural mx-auto mt-6"></div>
          </div>

          <div className="relative flex">
            <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black-void to-transparent z-10"></div>
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black-void to-transparent z-10"></div>
            
            <motion.div
              className="flex gap-8 items-center interactive py-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              {[...(mentors.length ? mentors : [1,2,3,4]), ...(mentors.length ? mentors : [1,2,3,4])].map((mentor, i) => (
                <GlassCard key={i} className="min-w-[280px]" hoverEffect={true}>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-cyan-bio/40 mb-4 p-1 bg-black-obsidian">
                      <Image
                        src={mentor.image || "/logo.png"}
                        width={96} height={96}
                        alt="Mentor"
                        className="rounded-full object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                    <h3 className="font-bold text-lg text-white font-mono">{mentor.name || `Dr. Unit ${i}`}</h3>
                    <p className="text-cyan-bio text-xs uppercase tracking-widest mt-2">{mentor.role || 'Senior Researcher'}</p>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          </div>

        </div>
      </section>

      {/* Publications Matrix */}
      <section className="py-24 relative z-10 border-t border-gray-900/50 bg-black-obsidian/40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-widest text-white">Publication Logs</h2>
              <p className="text-gray-400 text-sm mt-2 font-mono">/ recorded entries // recent outputs</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link href="#" className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-cyan-bio/50 hover:bg-black-obsidian transition-all interactive group">
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-bio transition-colors">Impact of Next-Gen AI on Diagnostic Confidence Intervals</h3>
                <p className="text-gray-400 text-sm mt-2">Journal of Medical Innovation Systems</p>
              </div>
              <div className="mt-4 md:mt-0 font-mono text-cyan-bio text-sm shrink-0">
                 [ 2025_REF_0A ]
              </div>
            </Link>

            <Link href="#" className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-cyan-bio/50 hover:bg-black-obsidian transition-all interactive group">
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-bio transition-colors">Epidemiological Vector Analysis Using Machine Learning</h3>
                <p className="text-gray-400 text-sm mt-2">International Medical Informatics Review</p>
              </div>
              <div className="mt-4 md:mt-0 font-mono text-cyan-bio text-sm shrink-0">
                 [ 2024_REF_9B ]
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final Call */}
      <section className="py-32 relative z-10 flex flex-col items-center justify-center border-t border-gray-900 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-light mb-6 text-white uppercase tracking-tight">
          Join the <strong className="font-bold text-glow">Team</strong>
        </h2>
        
        <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
          Initialize your path as a premier clinician-scientist. Sync with our global network today.
        </p>
        
        <Link
          href="/join"
          className="group relative px-12 py-5 bg-transparent border border-cyan-bio text-cyan-bio font-bold text-sm tracking-widest rounded-full uppercase interactive overflow-hidden inline-flex items-center justify-center transition-all hover:bg-cyan-bio hover:text-black-void hover:shadow-[0_0_30px_rgba(0,240,255,0.8)]"
        >
          <span>Submit Application</span>
        </Link>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 border-t border-gray-900 text-center relative z-20 bg-black-obsidian text-xs font-mono text-gray-500">
         <p>SMAK.RESEARCH {"//"} {new Date().getFullYear()} {"//"} SYSTEM ONLINE</p>
      </footer>
    </main>
  )
}