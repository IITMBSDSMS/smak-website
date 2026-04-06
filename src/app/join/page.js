"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import GlassCard from "../components/GlassCard"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Join() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    interest: "",
    phone: ""
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      // 1. Generate a temporary Entry No for the email
      const generatedEntryNo = `SMAK-M-${Math.floor(1000 + Math.random() * 9000)}`

      // 2. Insert into Supabase 'members'
      const { error: dbError } = await supabase
        .from('members')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            college: formData.college,
            interest: formData.interest,
            phone: formData.phone,
            year: "1st Year",
            entry_no: generatedEntryNo
          }
        ])

      if (dbError) {
        if (dbError.code === '23505') {
           throw new Error("These credentials (Email or Phone) are already registered in the system.");
        } else {
           throw new Error("Secure database link failed. " + dbError.message);
        }
      }

      // 3. Send the registration email 
      const emailRes = await fetch("/api/register-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          entry_no: generatedEntryNo
        })
      })

      if (!emailRes.ok) {
        throw new Error("Failed to send confirmation email. " + await emailRes.text())
      }

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
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
                  <p className="text-gray-400 font-mono text-sm max-w-md mx-auto">Welcome to the network. Your ID verification and WhatsApp community link have been securely transmitted to your email.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 bg-red-900/30 border border-red-500 text-red-200 rounded-lg text-sm text-center">
                      Error: {errorMsg}
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Full Designation</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Comms Link (Email)</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="operative@network.com" className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Institution / Base</label>
                      <input type="text" name="college" value={formData.college} onChange={handleChange} required placeholder="Medical College / Research Center" className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Direct Line (Phone)</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone Number" className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-blue-neural font-mono uppercase tracking-widest">Primary Objective / Statement</label>
                    <textarea name="interest" value={formData.interest} onChange={handleChange} required rows="4" placeholder="Brief statement of purpose..." className="w-full bg-black-void/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio transition-colors resize-none"></textarea>
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