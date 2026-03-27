"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import GlassCard from "../components/GlassCard"

export default function Join() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1500)
  }

  return (
    <main className="bg-transparent text-gray-100 min-h-screen flex flex-col pt-32 pb-24">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-bio/30 text-xs text-cyan-bio mb-6 font-mono">
             <span className="w-1.5 h-1.5 rounded-full bg-cyan-bio animate-pulse"></span> SYSTEM/ONBOARDING
          </div>
          <h1 className="text-4xl md:text-5xl font-sans tracking-tight text-white mb-4 uppercase">
             Initialize <span className="font-bold text-glow">Registration</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm max-w-xl mx-auto">
             / connect to the global network / submit credentials
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative group">
            {/* Ambient glow behind form */}
            <div className="absolute inset-0 bg-cyan-bio/20 blur-[100px] rounded-full z-[-1] opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            <GlassCard hoverEffect={false} className="w-full relative z-10 border border-cyan-bio/20 p-8 md:p-12">
              {success ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto rounded-full bg-cyan-bio/10 border border-cyan-bio flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-cyan-bio" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Credentials Accepted</h3>
                  <p className="text-gray-400 font-mono text-sm">Welcome to the network. An operative will contact you securely.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Full Designation</label>
                      <input type="text" required placeholder="John Doe" className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Comms Link (Email)</label>
                      <input type="email" required placeholder="operative@network.com" className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Institution / Base</label>
                    <input type="text" required placeholder="Medical College / Research Center" className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Primary Objective / Statement</label>
                    <textarea required rows="4" placeholder="Brief statement of purpose..." className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors resize-none"></textarea>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-4 bg-cyan-bio text-black-void font-bold text-sm tracking-widest uppercase rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:bg-white transition-all interactive disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-black-void border-t-transparent rounded-full animate-spin"></span> Transmitting...</>
                    ) : 'Transmit Data'}
                  </button>
                </form>
              )}
            </GlassCard>
          </div>
        </motion.div>

      </div>
    </main>
  )
}