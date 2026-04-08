"use client"

import MemberCard from "./components/MemberCard"
import Navbar from "./components/Navbar"
import GlassCard from "./components/GlassCard"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import EventCard from "./components/EventCard"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [events, setEvents] = useState([])
  const [leaders, setLeaders] = useState([])
  const [collabs, setCollabs] = useState([])
  const [index, setIndex] = useState(1)

  const { scrollYProgress } = useScroll()
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300])

  const [stats, setStats] = useState({
    papers: 0,
    members: 0,
    workshops: 0,
    partners: 0
  })

  useEffect(() => {
    async function loadData() {
      const { data: leadersData } = await supabase
        .from("leaders")
        .select("*")
        .order("created_at", { ascending: true })

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false })

      const { data: collabData } = await supabase
        .from("collaborators")
        .select("*")

      if (leadersData) setLeaders(leadersData)
      if (eventsData) setEvents(eventsData)
      if (collabData) setCollabs(collabData)
    }

    loadData()

    const target = { papers: 120, members: 800, workshops: 45, partners: 12 }

    const startCounter = () => {
      setStats({ papers: 0, members: 0, workshops: 0, partners: 0 })

      const interval = setInterval(() => {
        setStats(prev => ({
          papers: prev.papers < target.papers ? prev.papers + 2 : target.papers,
          members: prev.members < target.members ? prev.members + 10 : target.members,
          workshops: prev.workshops < target.workshops ? prev.workshops + 1 : target.workshops,
          partners: prev.partners < target.partners ? prev.partners + 1 : target.partners
        }))
      }, 40)

      setTimeout(() => {
        clearInterval(interval)
        startCounter()
      }, 5000)
    }

    startCounter()
  }, [])

  const prev = () => {
    setIndex((prevIndex) => (prevIndex === 0 ? events.length - 1 : prevIndex - 1))
  }

  const next = () => {
    setIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <main className="bg-transparent text-gray-100 flex flex-col min-h-screen">
      <Navbar />

      {/* 1. HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden"
      >
        <motion.div style={{ y: yHero }} className="absolute inset-0 pointer-events-none z-[-1]">
          {/* Subtle glowing orb behind hero logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-neural/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-bio/10 rounded-full blur-[100px]"></div>
        </motion.div>

        <div className="relative mx-auto mb-10 w-[160px] h-[160px] md:w-[200px] md:h-[200px] flex items-center justify-center z-10">
          {/* Futuristic Medical 3D rings */}
          <div className="absolute inset-0 rounded-full border border-cyan-bio/30 border-r-cyan-bio animate-[spin_12s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border border-blue-cyber/20 border-t-blue-cyber animate-[spin_8s_linear_infinite_reverse]"></div>
          <div className="absolute inset-6 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]"></div>
          
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white shadow-[0_0_25px_rgba(0,240,255,0.3)] border border-cyan-bio/30"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image
              src="/logo.png"
              fill
              sizes="(max-width: 768px) 128px, 128px"
              alt="SMAK logo"
              className="object-cover"
            />
          </motion.div>
        </div>

        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-7xl font-sans tracking-tight text-center relative z-10 max-w-5xl text-glow bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        >
          Society for Medical <br className="hidden md:block"/> Academia & Knowledge
        </motion.h1>

        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-6 max-w-2xl mx-auto text-center text-gray-400 text-sm md:text-lg tracking-wide relative z-10"
        >
          Empowering medical students worldwide through cutting-edge research, clinical collaborations, and unrelenting academic excellence.
        </motion.p>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-6 mt-12 relative z-10"
        >
          <Link
            href="/join"
            className="group relative px-8 py-3 bg-transparent rounded-full overflow-hidden interactive"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-neural to-cyan-bio opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-[1px] bg-black-obsidian rounded-full"></div>
            <span className="relative z-10 text-white font-medium tracking-widest text-sm uppercase group-hover:text-glow transition-all">Join SMAK</span>
          </Link>

          <Link
            href="/campus-ambassador"
            className="group relative px-8 py-3 bg-transparent rounded-full overflow-hidden interactive"
          >
            <div className="absolute inset-0 border border-cyan-bio/50 rounded-full group-hover:border-white transition-colors duration-300"></div>
            <div className="absolute inset-0 bg-cyan-bio/5 rounded-full group-hover:bg-cyan-bio/10 transition-colors"></div>
            <span className="relative z-10 text-cyan-bio font-medium tracking-widest text-sm uppercase group-hover:text-white transition-colors duration-300">Apply for Campus Ambassador</span>
          </Link>

          <Link
            href="/research-club"
            className="group relative px-8 py-3 bg-transparent rounded-full overflow-hidden interactive hidden sm:flex items-center justify-center"
          >
            <div className="absolute inset-0 border border-gray-600 rounded-full group-hover:border-cyan-bio transition-colors duration-300"></div>
            <span className="relative z-10 text-gray-300 font-medium tracking-widest text-sm uppercase group-hover:text-white transition-colors duration-300">Explore Data</span>
          </Link>
        </motion.div>
        
        {/* Scroll indicator down */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.section>

      {/* 2. THE IMPACT (STATS) */}
      <section className="py-24 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-light tracking-wide text-white uppercase"><span className="font-bold">Global</span> Impact</h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-bio to-transparent mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <GlassCard className="text-center" hoverEffect={true}>
              <h3 className="text-4xl md:text-6xl font-sans tracking-tighter text-glow-blue text-white mb-2">{stats.papers}</h3>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Published Papers</p>
            </GlassCard>
            <GlassCard className="text-center" hoverEffect={true}>
              <h3 className="text-4xl md:text-6xl font-sans tracking-tighter text-glow-blue text-white mb-2">{stats.members}</h3>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Active Minds</p>
            </GlassCard>
            <GlassCard className="text-center" hoverEffect={true}>
              <h3 className="text-4xl md:text-6xl font-sans tracking-tighter text-glow-blue text-white mb-2">{stats.workshops}</h3>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Workshops</p>
            </GlassCard>
            <GlassCard className="text-center" hoverEffect={true}>
              <h3 className="text-4xl md:text-6xl font-sans tracking-tighter text-glow-blue text-white mb-2">{stats.partners}</h3>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Institutions</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 3. INNOVATION & RESEARCH */}
      <section className="py-32 relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative aspect-square md:aspect-auto md:h-[600px] w-full flex items-center justify-center">
            {/* Abstract DNA / Medical Tech visualization using CSS/SVGs for performance */}
            <div className="absolute w-full h-full max-w-[400px] max-h-[400px] animate-[spin_40s_linear_infinite]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-blue-cyber/40 overflow-visible">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
                 <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.2" className="animate-[spin_10s_linear_infinite_reverse] origin-center" />
                 <path d="M50 5 Q 60 50, 50 95 Q 40 50, 50 5" fill="none" stroke="var(--color-cyan-bio)" strokeWidth="0.5" className="animate-pulse" />
                 <path d="M5 50 Q 50 60, 95 50 Q 50 40, 5 50" fill="none" stroke="var(--color-blue-neural)" strokeWidth="0.5" className="animate-pulse" style={{ animationDelay: '1s' }} />
              </svg>
            </div>
            {/* Glowing Center */}
            <div className="w-32 h-32 bg-cyan-bio/20 rounded-full blur-2xl absolute"></div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-bio/30 bg-cyan-bio/5 text-xs text-cyan-bio mb-6 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-bio animate-pulse"></span>
              CORE INITIATIVE
            </div>
            <h2 className="text-3xl md:text-5xl font-light mb-6 text-white leading-tight">
              Pioneering the Future of <br/> <span className="font-bold">Medical Research</span>
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed text-lg">
              The SMAK Research Club is a high-performance incubator for medical students. Engage in advanced clinical studies, analyze real-world datasets, and publish impactful findings in world-renowned journals alongside leading mentors.
            </p>
            
            <Link
              href="/research-club"
              className="group inline-flex items-center gap-3 text-cyan-bio font-medium tracking-wide interactive hover:text-white transition-colors"
            >
              ACCESS PORTAL
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS */}
      <section className="py-24 relative z-20">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-neural/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">Active Deployments</h2>
            <p className="text-gray-400 mt-2 font-mono text-sm">/ upcoming.events / workshops / symposiums</p>
          </div>

          <div className="flex gap-4">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:bg-gray-800 hover:border-cyan-bio transition-all interactive text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={next} className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:bg-gray-800 hover:border-cyan-bio transition-all interactive text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-hidden px-6 py-10">
          <div 
            className="flex items-center gap-8 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(calc(50vw - ${index * 350}px - 175px))` }}
          >
            {events.map((event, i) => (
              <motion.div
                key={event.id || i}
                animate={{
                  scale: i === index ? 1.05 : 0.85,
                  opacity: i === index ? 1 : 0.3,
                  filter: i === index ? "blur(0px)" : "blur(4px)"
                }}
                className={`relative min-w-[300px] md:min-w-[350px] aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-500`}
              >
                {/* Fallback image style if event.image fails */}
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <Image src={event.image || '/logo.png'} fill sizes="(max-width: 768px) 100vw, 350px" className="object-cover" alt="Event" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black-void via-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  {event.title && <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>}
                  {event.date && <p className="text-gray-300 text-sm font-mono">{event.date}</p>}
                </div>
                {i === index && (
                  <div className="absolute inset-0 rounded-2xl border border-cyan-bio/50 shadow-[0_0_30px_rgba(0,240,255,0.2)_inset] pointer-events-none"></div>
                )}
              </motion.div>
            ))}
            
            {/* Fallbacks if events array is empty */}
            {events.length === 0 && [1, 2, 3].map(i => (
              <div key={i} className="min-w-[300px] aspect-[3/4] bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800">
                <span className="text-gray-600 font-mono text-sm">NO_DATA_FOUND</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEADERSHIP (Marquee) */}
      <section className="py-24 relative z-20 border-y border-gray-900/50 bg-black-obsidian/40 backdrop-blur-sm">
        <div className="text-center mb-16">
          <h2 className="text-sm font-mono tracking-[0.3em] text-blue-neural uppercase">System Architects</h2>
          <h3 className="text-3xl font-bold text-white mt-4">Leadership Collective</h3>
        </div>

        <div className="relative max-w-[100vw] overflow-hidden flex">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-black-void to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-black-void to-transparent z-10"></div>

          <div className="animate-scroll-x hover:[animation-play-state:paused] interactive py-4">
            {/* Group 1 */}
            <div className="flex gap-10 items-center min-w-max px-6">
              {(leaders.length > 0 ? leaders : [1,2,3,4,5]).map((leader, i) => (
                <GlassCard key={i} className="w-[85vw] sm:w-[380px] flex-shrink-0" hoverEffect={false}>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-800 border flex-shrink-0 border-gray-700 relative shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                      <Image src={leader.image || '/logo.png'} fill sizes="(max-width: 768px) 80px, 80px" className="object-cover" alt="leader" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">{leader.name || `Unit 0${i}`}</h4>
                      <p className="text-xs sm:text-sm text-blue-cyber font-mono mt-1">{leader.role || 'Operative'}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 uppercase tracking-widest">{leader.college || 'Institution X'}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            
            {/* Duplicate for seamless loop */}
            <div className="flex gap-10 items-center min-w-max px-6">
              {(leaders.length > 0 ? leaders : [1,2,3,4,5]).map((leader, i) => (
                <GlassCard key={"dup"+i} className="w-[85vw] sm:w-[380px] flex-shrink-0" hoverEffect={false}>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-800 border flex-shrink-0 border-gray-700 relative shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                      <Image src={leader.image || '/logo.png'} fill sizes="(max-width: 768px) 80px, 80px" className="object-cover" alt="leader" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">{leader.name || `Unit 0${i}`}</h4>
                      <p className="text-xs sm:text-sm text-blue-cyber font-mono mt-1">{leader.role || 'Operative'}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 uppercase tracking-widest">{leader.college || 'Institution X'}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PARTNERS (Marquee) */}
      <section className="py-24 relative z-20">
        <div className="text-center mb-12">
          <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">Network Integration</p>
        </div>

        <div className="relative max-w-5xl mx-auto overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-black-void to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-black-void to-transparent z-10"></div>

          <div className="flex animate-scroll-x hover:[animation-play-state:paused] interactive py-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-24 min-w-max px-12">
              {(collabs.length > 0 ? collabs : [1,2,3,4,5]).map((c, i) => (
                <div key={i} className="relative w-48 h-20 grayscale hover:grayscale-0 hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all duration-300">
                  <Image src={c.logo || '/logo.png'} fill sizes="(max-width: 768px) 192px, 192px" className="object-contain" alt="partner" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-24 min-w-max px-12">
              {(collabs.length > 0 ? collabs : [1,2,3,4,5]).map((c, i) => (
                <div key={"dup"+i} className="relative w-48 h-20 grayscale hover:grayscale-0 hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all duration-300">
                  <Image src={c.logo || '/logo.png'} fill sizes="(max-width: 768px) 192px, 192px" className="object-contain" alt="partner" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA / FOOTER */}
      <footer className="relative z-20 mt-auto bg-black-obsidian border-t border-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center px-6 mb-24">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
            Initialize Network Connection.
          </h2>
          <p className="text-gray-400 mb-10">Join thousands of brilliant minds building the future of medical academia.</p>
          <Link
            href="/join"
            className="group relative px-10 py-4 bg-cyan-bio text-black-void font-bold text-sm tracking-widest rounded-full uppercase interactive overflow-hidden inline-flex items-center justify-center transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(0,240,255,0.8)]"
          >
            <span className="relative z-10">Access Hub</span>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-800 pt-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" width={30} height={30} alt="Logo" />
              <span className="font-bold tracking-widest uppercase text-white">SMAK</span>
            </div>
            <p className="text-sm text-gray-500 font-mono leading-relaxed max-w-xs">
              Society of Medical Academia & Knowledge.<br/>
              Empowering future clinician-scientists globally.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 text-xs tracking-widest uppercase">Navigation</h4>
              <ul className="space-y-3 font-mono text-sm text-gray-400">
                <li><Link href="/" className="hover:text-cyan-bio interactive transition-colors">/home</Link></li>
                <li><Link href="/research-club" className="hover:text-cyan-bio interactive transition-colors">/research</Link></li>
                <li><Link href="/events" className="hover:text-cyan-bio interactive transition-colors">/events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-xs tracking-widest uppercase">System</h4>
              <ul className="space-y-3 font-mono text-sm text-gray-400">
                <li><Link href="/board" className="hover:text-cyan-bio interactive transition-colors">/board</Link></li>
                <li><Link href="/collaborators" className="hover:text-cyan-bio interactive transition-colors">/partners</Link></li>
                <li><Link href="/contact" className="hover:text-cyan-bio interactive transition-colors">/contact</Link></li>
              </ul>
            </div>
          </div>

          <div>
             <h4 className="text-white font-semibold mb-4 text-xs tracking-widest uppercase">Comms Link</h4>
             <ul className="space-y-3 text-sm text-gray-400">
               <li>
                 <a href="mailto:official@smakresearch.com" className="hover:text-cyan-bio interactive transition-colors inline-block">
                   official@smakresearch.com
                 </a>
               </li>
               <li className="flex gap-4 mt-6">
                  <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-gray-800 hover:border-cyan-bio hover:text-cyan-bio transition-all interactive">
                    IN
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-gray-800 hover:border-cyan-bio hover:text-cyan-bio transition-all interactive">
                    IG
                  </a>
               </li>
             </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 font-mono">
          <p>© {new Date().getFullYear()} SMAK. ALL RIGHTS RESERVED.</p>
          <p className="mt-4 md:mt-0">SYS.VERSION 2.0.4</p>
        </div>
      </footer>
    </main>
  )
}