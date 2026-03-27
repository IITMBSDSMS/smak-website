"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Navbar from "../components/Navbar"
import Image from "next/image"

export default function Collaborators() {
  const [logos, setLogos] = useState([])

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    const loadLogos = async () => {
      const { data, error } = await supabase
        .from("collaborators")
        .select("*")
        .order("created_at", { ascending: true })

      if (!error && data) {
        setLogos(data)
      }
    }

    loadLogos()
  }, [])

  return (
    <main className="bg-transparent text-gray-100 min-h-screen flex flex-col pt-32 pb-24">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto px-6 mb-24"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-neural/30 text-xs text-blue-neural mb-6 font-mono">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-neural animate-pulse"></span> SYSTEM/NODES
        </div>
        <h1 className="text-4xl md:text-6xl font-sans tracking-tight text-white mb-6 uppercase">
          Network <span className="font-bold text-glow">Integrations</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          SMAK operates through secure, high-tier partnerships with global medical institutions, independent researchers, and academic nodes to accelerate clinical innovation.
        </p>
      </motion.section>

      {/* Partner Institutions */}
      <section className="relative py-24 mb-24 z-10 border-y border-gray-900/50 bg-black-obsidian/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-sm font-mono tracking-[0.3em] text-cyan-bio uppercase text-center mb-16">
            Verified Partner Nodes
          </h2>

          <div className="relative overflow-hidden">
             {/* Gradient Masks */}
            <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black-void to-transparent z-10"></div>
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black-void to-transparent z-10"></div>

            <motion.div
              className="flex gap-20 items-center opacity-70 hover:opacity-100 transition-opacity duration-500 interactive"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            >
              {/* dynamic logos */}
              <div className="flex gap-20 items-center min-w-max">
                {(logos.length > 0 ? logos : [1,2,3,4,5]).map((logo, i) => (
                  <div key={logo.id || i} className="relative h-16 w-40 grayscale hover:grayscale-0 hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all duration-300">
                    <Image
                      src={logo.logo || "/logo.png"}
                      alt={logo.name || "Partner"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>

              {/* duplicate set for infinite loop */}
              <div className="flex gap-20 items-center min-w-max">
                {(logos.length > 0 ? logos : [1,2,3,4,5]).map((logo, i) => (
                    <div key={`dup-${logo.id || i}`} className="relative h-16 w-40 grayscale hover:grayscale-0 hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all duration-300">
                    <Image
                      src={logo.logo || "/logo.png"}
                      alt={logo.name || "Partner"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Collaboration Opportunities */}
      <section className="max-w-4xl mx-auto px-8 text-center relative z-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-cyan-bio/10 border border-cyan-bio/50 flex items-center justify-center mb-8">
           <svg className="w-10 h-10 text-cyan-bio" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
        </div>
        
        <h2 className="text-3xl font-semibold mb-6 text-white uppercase tracking-tight">
          Establish System <span className="text-glow">Link</span>
        </h2>

        <p className="text-gray-400 mb-10 leading-relaxed text-lg">
          We welcome strategic data-sharing partnerships with universities, healthcare 
          institutions, and independent labs. Integrate your infrastructure with SMAK to 
          accelerate global medical breakthroughs.
        </p>

        <a
          href="/contact"
          className="inline-block border border-cyan-bio text-cyan-bio px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-cyan-bio hover:text-black-void hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all interactive"
        >
          Initiate Contact
        </a>
      </section>
    </main>
  )
}