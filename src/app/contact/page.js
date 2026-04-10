"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"

const SUBJECTS = [
  "General Inquiry",
  "Research Collaboration",
  "Partnership / Sponsorship",
  "Events & Programs",
  "Mentorship",
  "Technical Issue",
  "Other",
]

function Toast({ message, type, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 20, x: "-50%" }}
      className={`fixed bottom-8 left-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold ${
        type === "success"
          ? "bg-green-900/90 border-green-500/40 text-green-300"
          : "bg-red-900/90 border-red-500/40 text-red-300"
      }`}
    >
      {type === "success" ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">×</button>
    </motion.div>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send")
      setSubmitted(true)
    } catch (err) {
      showToast(err.message || "Failed to send message. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const contactItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: "Email",
      value: "official@smakresearch.com",
      href: "mailto:official@smakresearch.com",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      label: "LinkedIn",
      value: "SMAK Community",
      href: "https://www.linkedin.com/company/s-m-a-k-soceity-for-medical-academia-knowledge/",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      label: "Instagram",
      value: "@smak.community",
      href: "https://www.instagram.com/smak.community",
    },
  ]

  return (
    <main className="bg-[#050B14] text-white min-h-screen overflow-hidden">
      <Navbar />

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-900/8 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 text-xs text-blue-400 mb-6 font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Contact SMAK
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Let's <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Connect</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Whether it's research, collaboration, partnerships, or questions — we're here.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Contact cards */}
            {contactItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group bg-[#0A1220]/80 border border-white/[0.07] hover:border-blue-500/30 rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:bg-[#0D1B35]/80"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/25 group-hover:text-blue-300 transition-all flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-0.5">{item.label}</div>
                  <div className="text-white font-medium group-hover:text-blue-300 transition-colors">{item.value}</div>
                </div>
                <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}

            {/* Response time card */}
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-mono uppercase tracking-widest">Response Time</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">24 – 48 hrs</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our team typically responds within 1–2 business days. For urgent matters, email us directly.
              </p>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#0A1220]/80 border border-white/[0.07] backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed mb-6">
                      We've received your message and will reply to <span className="text-blue-400">{form.email}</span> within 24–48 hours. Check your inbox for a confirmation.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }) }}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <h2 className="text-lg font-bold text-white tracking-wide">Send a Message</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-1.5">Full Name *</label>
                        <input
                          required
                          type="text"
                          placeholder="Dr. Jane Smith"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-black/40 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-1.5">Email Address *</label>
                        <input
                          required
                          type="email"
                          placeholder="you@institution.com"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-black/40 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-1.5">Subject</label>
                      <select
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-black/40 border border-gray-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm appearance-none"
                      >
                        <option value="">Select a subject...</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-1.5">Message *</label>
                      <textarea
                        required
                        rows={6}
                        placeholder="Tell us how we can help, or share your ideas for collaboration..."
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-black/40 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-600">Be as detailed as possible</span>
                        <span className={`text-xs font-mono ${form.message.length > 1000 ? 'text-orange-400' : 'text-gray-600'}`}>
                          {form.message.length}/1500
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || form.message.length > 1500}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-600">
                      You'll receive an auto-reply confirmation at your email address.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </main>
  )
}