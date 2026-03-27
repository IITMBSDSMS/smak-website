"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Navbar from "../components/Navbar"
import GlassCard from "../components/GlassCard"
import { motion } from "framer-motion"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }
    loadEvents()
  }, [])

  return (
    <main className="bg-transparent text-gray-100 min-h-screen flex flex-col pt-32 pb-24">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-neural/30 text-xs text-blue-neural mb-6 font-mono">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-neural animate-pulse"></span> SYSTEM/CALENDAR
          </div>
          <h1 className="text-4xl md:text-6xl font-sans tracking-tight text-white mb-4">
             Network <span className="font-bold text-glow">Deployments</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm max-w-xl mx-auto">
             / symposiums / clinical workshops / research conferences
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-bio border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <motion.div
                key={event.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard hoverEffect={true} className="h-full">
                  <div className="flex flex-col h-full">
                    {/* Timestamp / Location header */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-800">
                      <div>
                         <p className="text-xs text-cyan-bio font-mono tracking-widest uppercase mb-1">Date</p>
                         <p className="text-sm text-gray-300 font-mono">{event.date || 'TBD'}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-blue-neural font-mono tracking-widest uppercase mb-1">Loc</p>
                         <p className="text-sm text-gray-300 font-mono">{event.location || 'Virtual / TBA'}</p>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-xl text-white mb-3">
                      {event.title || 'Data Upload Pending'}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                      {event.description || 'Details regarding this deployment have not yet been synchronized to the main network.'}
                    </p>
                    
                    <button className="mt-8 w-full py-3 border border-gray-700 rounded-lg text-xs tracking-widest uppercase text-gray-300 hover:border-cyan-bio hover:text-cyan-bio transition-all interactive">
                      Register Interest
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {events.length === 0 && !loading && (
           <div className="text-center py-20 p-8 border border-gray-800 rounded-2xl bg-black-obsidian">
             <div className="w-16 h-16 mx-auto rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p className="text-gray-500 font-mono">No active deployments found in database.</p>
           </div>
        )}

      </div>
    </main>
  )
}