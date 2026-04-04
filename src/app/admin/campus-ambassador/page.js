"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { motion } from "framer-motion"

// Initialize with ANON key, assuming Admin has RLS policies configured
// or we use this just for the UI. Ideally Server Components / Session Auth is used.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState("")
  
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")

  // Check pin
  const handleLogin = (e) => {
    e.preventDefault()
    // Simple mock passcode for now
    if (passcode === "SMAK_ADMIN_2026") {
      setIsAuthenticated(true)
      fetchApplicants()
    } else {
      alert("Invalid Security Clearance")
    }
  }

  const fetchApplicants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("campus_ambassadors")
      .select("*")
      .order("created_at", { ascending: false })
      
    if (error) {
      console.error("Error fetching data: ", error)
    } else {
      setApplicants(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (id, email, name, newStatus) => {
    // Optimistic UI Update
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))

    try {
      const response = await fetch("/api/ambassador/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, email, name })
      });
      
      if (!response.ok) {
        throw new Error("Failed to dispatch update API")
      }
    } catch (error) {
      console.error("Update failed", error)
      alert("Failed to update status and trigger email.")
      // Revert if needed, but a page refresh is safer
      fetchApplicants()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black-void flex items-center justify-center font-sans">
        <div className="bg-black-obsidian border border-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-sm">
          <h2 className="text-cyan-bio font-mono uppercase tracking-widest text-center mb-6">SysAdmin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter clearance code" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-black-void border border-gray-700 px-4 py-3 rounded text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio"
            />
            <button type="submit" className="w-full bg-cyan-bio text-black font-bold uppercase py-3 rounded hover:bg-white transition-colors">
               Initialize
            </button>
          </form>
        </div>
      </div>
    )
  }

  const filteredApplicants = filterStatus === "all" 
    ? applicants 
    : applicants.filter(a => a.status === filterStatus)

  const total = applicants.length
  const shortlisted = applicants.filter(a => a.status === 'shortlisted').length
  const interviewed = applicants.filter(a => a.status === 'interview').length
  const selected = applicants.filter(a => a.status === 'selected').length

  return (
    <div className="min-h-screen bg-black-void text-gray-200 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Ambassador Command Center</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">Manage pipeline & logistics</p>
        </div>
        <div className="flex gap-4">
          <a href="/admin/qr" className="px-4 py-2 border border-cyan-bio text-cyan-bio rounded hover:bg-cyan-bio hover:text-black transition-colors font-mono text-sm">
             QR Generator
          </a>
          <button onClick={() => window.location.href='/'} className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-sm">
             Exit System
          </button>
        </div>
      </header>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-black-obsidian border border-gray-800 p-6 rounded-xl">
          <p className="text-gray-500 uppercase tracking-widest text-xs mb-2">Total Applicants</p>
          <p className="text-4xl text-white font-light">{total}</p>
        </div>
        <div className="bg-black-obsidian border border-gray-800 p-6 rounded-xl">
          <p className="text-gray-500 uppercase tracking-widest text-xs mb-2">Shortlisted</p>
          <p className="text-4xl text-yellow-500 font-light">{shortlisted}</p>
        </div>
        <div className="bg-black-obsidian border border-gray-800 p-6 rounded-xl">
          <p className="text-gray-500 uppercase tracking-widest text-xs mb-2">Interviews Scheduled</p>
          <p className="text-4xl text-blue-400 font-light">{interviewed}</p>
        </div>
        <div className="bg-black-obsidian border border-gray-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-bio/20 blur-xl"></div>
          <p className="text-gray-500 uppercase tracking-widest text-xs mb-2">Selected Agents</p>
          <p className="text-4xl text-cyan-bio font-light">{selected}</p>
        </div>
      </div>

      {/* FILTERS & DATA TABLE */}
      <div className="bg-black-obsidian border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/40">
           <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-cyan-bio animate-pulse"></span>
             Active Candidates
           </h3>
           <select 
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value)}
             className="bg-black-void border border-gray-700 text-sm px-3 py-1.5 rounded focus:outline-none focus:border-cyan-bio"
           >
             <option value="all">View All Stages</option>
             <option value="applied">New (Applied)</option>
             <option value="shortlisted">Shortlisted</option>
             <option value="interview">Interview State</option>
             <option value="selected">Selected/Hired</option>
             <option value="rejected">Rejected</option>
           </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-gray-900 text-gray-400 font-mono tracking-wider">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Institution / Base</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-center">Comm-Link (Email)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-mono">
                    Downloading Data from Mainframe...
                  </td>
                </tr>
              )}
              
              {!loading && filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-mono">
                    No records found matching current parameters.
                  </td>
                </tr>
              )}

              {filteredApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                        {app.photo_url ? (
                          <img src={app.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">{app.full_name}</p>
                        <p className="text-xs text-gray-500">{app.email}</p>
                        {app.utm_source && <span className="text-[10px] uppercase bg-gray-800 text-gray-400 px-1 py-0.5 rounded mt-1 inline-block">src: {app.utm_source}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{app.college_name}</p>
                    <p className="text-xs text-gray-500">{app.city_state} • {app.year_of_study}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 flex w-fit items-center gap-1.5 text-xs font-mono font-bold uppercase rounded-full border ${
                      app.status === 'applied' ? 'bg-gray-800 text-gray-300 border-gray-700' :
                      app.status === 'shortlisted' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' :
                      app.status === 'interview' ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' :
                      app.status === 'selected' ? 'bg-cyan-900/30 text-cyan-bio border-cyan-bio/50' :
                      'bg-red-900/30 text-red-400 border-red-700/50'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <a href={`mailto:${app.email}`} className="text-cyan-bio hover:text-white transition-colors underline decoration-cyan-bio/30 underline-offset-4">
                       Direct Mail
                    </a>
                    {app.phone && (
                      <a href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="ml-3 text-green-400 hover:text-white transition-colors underline decoration-green-400/30 underline-offset-4">
                        WhatsApp
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <select 
                        value="" 
                        onChange={(e) => updateStatus(app.id, app.email, app.full_name, e.target.value)}
                        className="bg-black-void text-xs border border-gray-600 rounded px-2 py-1 hover:border-cyan-bio focus:outline-none cursor-pointer"
                      >
                         <option value="" disabled>Change Status (Sends Email)</option>
                         <option value="shortlisted">→ Mark Shortlisted</option>
                         <option value="interview">→ Schedule Interview</option>
                         <option value="selected">→ Mark Selected</option>
                         <option value="rejected">→ Mark Rejected</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
