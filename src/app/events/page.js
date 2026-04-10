"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"
import Navbar from "../components/Navbar"
import { motion, AnimatePresence } from "framer-motion"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── Countdown Timer ────────────────────────────────────────────────────────
function Countdown({ dateStr }) {
  const [time, setTime] = useState(null)

  useEffect(() => {
    if (!dateStr) return
    const target = new Date(dateStr).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setTime({ expired: true }); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setTime({ d, h, m, expired: false })
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [dateStr])

  if (!time) return null
  if (time.expired) return <span className="text-xs text-red-400 font-mono">Event Ended</span>
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="text-gray-500">STARTS IN</span>
      {time.d > 0 && <span className="text-cyan-400 font-bold">{time.d}d</span>}
      <span className="text-blue-400 font-bold">{time.h}h</span>
      <span className="text-purple-400 font-bold">{time.m}m</span>
    </div>
  )
}

// ─── Category Badge ─────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Workshop: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Conference: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Symposium: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Webinar: "bg-green-500/15 text-green-400 border-green-500/30",
  default: "bg-gray-500/15 text-gray-400 border-gray-500/30",
}

function CategoryBadge({ category }) {
  const cls = CATEGORY_COLORS[category] || CATEGORY_COLORS.default
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border ${cls}`}>
      {category || "Event"}
    </span>
  )
}

// ─── Registration Modal ──────────────────────────────────────────────────────
function RegistrationModal({ event, onClose }) {
  const [step, setStep] = useState("detail") // detail | form | processing | success | error
  const [form, setForm] = useState({ name: "", email: "", phone: "", college: "" })
  const [enrolledAlready, setEnrolledAlready] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [enrolledData, setEnrolledData] = useState(null)

  // Seat count
  const [seatsLeft, setSeatsLeft] = useState(null)
  useEffect(() => {
    if (!event?.id) return
    supabase
      .from("events_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("payment_status", ["success", "free"])
      .then(({ count }) => {
        if (event.capacity) setSeatsLeft(event.capacity - (count || 0))
      })
  }, [event])

  // --- Check enrollment when email changes ---
  const checkEnrollment = useCallback(async (email) => {
    if (!email || !event?.id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const res = await fetch("/api/events/check-enrollment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: event.id, email }),
    })
    const data = await res.json()
    setEnrolledAlready(data.enrolled)
  }, [event?.id])

  async function handleFreeEnroll() {
    setStep("processing")
    try {
      const res = await fetch("/api/events/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          college: form.college,
          amount: 0,
          is_free: true,
        }),
      })
      const data = await res.json()
      console.error("Enroll API response:", data)
      if (res.status === 409) {
        setErrorMsg(data.message || "You are already enrolled in this event.")
        setStep("error")
        return
      }
      if (!res.ok) throw new Error(data.detail || data.error || "Enrollment failed")
      setEnrolledData(data)
      setStep("success")
    } catch (e) {
      setErrorMsg(e.message || "Enrollment failed. Please try again.")
      setStep("error")
    }
  }

  async function handlePaidEnroll() {
    setStep("processing")
    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: event.price,
          currency: "INR",
          entry_no: `EVT-${event.id?.substring(0, 8)}`,
          event_id: event.id,
          receipt: `evt_${event.id?.substring(0, 8)}_${Date.now()}`,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderData.order) throw new Error("Failed to create order")

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "SMAK Research",
        description: event.title,
        order_id: orderData.order.id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#2563EB" },
        modal: {
          ondismiss: () => {
            setStep("form")
          },
        },
        handler: async (response) => {
          // Step 3: Enroll after payment
          const enrollRes = await fetch("/api/events/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_id: event.id,
              name: form.name,
              email: form.email,
              phone: form.phone,
              college: form.college,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: event.price,
              is_free: false,
            }),
          })
          const enrollData = await enrollRes.json()
          if (enrollRes.status === 409) {
            setErrorMsg(enrollData.message || "Already enrolled.")
            setStep("error")
            return
          }
          if (!enrollRes.ok) throw new Error(enrollData.error)
          setEnrolledData(enrollData)
          setStep("success")
        },
      }

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.open()
        setStep("form") // keep form visible while Razorpay modal is open
      } else {
        // Load Razorpay script dynamically
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => {
          const rzp = new window.Razorpay(options)
          rzp.open()
          setStep("form")
        }
        script.onerror = () => { throw new Error("Payment gateway failed to load") }
        document.body.appendChild(script)
      }
    } catch (e) {
      setErrorMsg(e.message || "Payment failed. Please try again.")
      setStep("error")
    }
  }

  function handleSubmitForm(e) {
    e.preventDefault()
    if (enrolledAlready) return
    if (!form.name || !form.email || !form.phone) return
    if (event.is_paid) {
      handlePaidEnroll()
    } else {
      handleFreeEnroll()
    }
  }

  const isSoldOut = seatsLeft !== null && seatsLeft <= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#070D1A] border border-blue-900/40 rounded-2xl shadow-2xl shadow-blue-900/20"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          ✕
        </button>

        {/* ── DETAIL STEP ─────────────────────────────── */}
        {step === "detail" && (
          <div className="flex flex-col">
            {/* Poster */}
            {event.image && (
              <div className="relative w-full h-56 md:h-72 overflow-hidden rounded-t-2xl">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070D1A] via-transparent to-transparent" />
                {/* Category badge over poster */}
                <div className="absolute top-4 left-4">
                  <CategoryBadge category={event.category} />
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((t, i) => (
                    <span key={i} className="text-xs text-gray-500 font-mono bg-gray-800/50 px-2 py-0.5 rounded">#{t}</span>
                  ))}
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{event.title}</h2>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Date", val: event.date || "TBD", color: "text-cyan-400" },
                  { label: "Location", val: event.location || "Online", color: "text-blue-400" },
                  { label: "Category", val: event.category || "Event", color: "text-purple-400" },
                  {
                    label: "Seats", color: isSoldOut ? "text-red-400" : "text-green-400",
                    val: seatsLeft === null ? "Loading..." : isSoldOut ? "SOLD OUT" : `${seatsLeft} left`
                  },
                ].map((m, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-1">{m.label}</p>
                    <p className={`text-sm font-semibold ${m.color}`}>{m.val}</p>
                  </div>
                ))}
              </div>

              {event.description && (
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{event.description}</p>
              )}

              {/* Deadline */}
              {event.registration_deadline && (
                <p className="text-xs text-amber-400/70 font-mono mb-6">
                  ⏳ Registration closes: {event.registration_deadline}
                </p>
              )}

              {/* Price + CTA */}
              <div className="flex items-center justify-between">
                <div>
                  {event.is_paid ? (
                    <div>
                      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Registration Fee</p>
                      <p className="text-3xl font-black text-white">₹{event.price}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Registration</p>
                      <p className="text-3xl font-black text-green-400">FREE</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => isSoldOut ? null : setStep("form")}
                  disabled={isSoldOut}
                  className={`px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
                    isSoldOut
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-0.5"
                  }`}
                >
                  {isSoldOut ? "Sold Out" : "Register Now →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FORM STEP ────────────────────────────────── */}
        {step === "form" && (
          <div className="p-6 md:p-8">
            {/* Mini header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-800">
              {event.image && (
                <img src={event.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Registering for</p>
                <p className="text-white font-bold">{event.title}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "name", label: "Full Name", type: "text", placeholder: "Dr. Aarav Sharma", required: true },
                  { id: "email", label: "Email Address", type: "email", placeholder: "you@college.edu", required: true },
                  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210", required: true },
                  { id: "college", label: "College / Institution", type: "text", placeholder: "AIIMS, JIPMER...", required: false },
                ].map((f) => (
                  <div key={f.id}>
                    <label className="text-xs text-gray-400 font-mono uppercase tracking-widest block mb-1.5">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      id={f.id}
                      type={f.type}
                      value={form[f.id]}
                      placeholder={f.placeholder}
                      required={f.required}
                      onChange={(e) => {
                        setForm({ ...form, [f.id]: e.target.value })
                        if (f.id === "email") checkEnrollment(e.target.value)
                      }}
                      className="w-full bg-black/40 border border-gray-700/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Already enrolled warning */}
              {enrolledAlready && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-400 text-sm font-mono">
                  ⚠️ This email is already registered for this event.
                </div>
              )}

              {/* Price summary */}
              <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">Amount to pay:</span>
                <span className="text-lg font-bold text-white">
                  {event.is_paid ? `₹${event.price}` : "FREE"}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("detail")}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-all text-sm font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={enrolledAlready}
                  className={`flex-[2] py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
                    enrolledAlready
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : event.is_paid
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/30"
                        : "bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-400"
                  }`}
                >
                  {enrolledAlready ? "Already Registered" : event.is_paid ? `💳 Pay ₹${event.price}` : "✅ Confirm Free Registration"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── PROCESSING ───────────────────────────────── */}
        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center gap-6 min-h-[300px]">
            <div className="w-14 h-14 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-gray-400 font-mono text-sm">Processing your enrollment…</p>
          </div>
        )}

        {/* ── SUCCESS ──────────────────────────────────── */}
        {step === "success" && (
          <div className="p-8 md:p-12 flex flex-col items-center justify-center gap-6 min-h-[350px] text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-4xl"
            >
              ✅
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">You&apos;re In!</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Successfully enrolled in <span className="text-white font-semibold">{event.title}</span>.<br/>
                A confirmation email has been sent to <span className="text-blue-400">{form.email}</span>.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-all"
            >
              Close
            </button>
          </div>
        )}

        {/* ── ERROR ────────────────────────────────────── */}
        {step === "error" && (
          <div className="p-8 md:p-12 flex flex-col items-center justify-center gap-6 min-h-[300px] text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-3xl">⚠️</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
              <p className="text-gray-400 text-sm">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("form")} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-semibold transition-all">
                Try Again
              </button>
              <button onClick={onClose} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-semibold transition-all">
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Event Card ──────────────────────────────────────────────────────────────
function EventCard({ event, index, onRegister }) {
  const [seats, setSeats] = useState(null)

  useEffect(() => {
    supabase
      .from("events_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("payment_status", ["success", "free"])
      .then(({ count }) => {
        if (event.capacity) setSeats(event.capacity - (count || 0))
      })
  }, [event.id, event.capacity])

  const isSoldOut = seats !== null && seats <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group relative bg-gradient-to-b from-[#0A1220]/90 to-[#070D1A]/95 border border-white/[0.07] rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-500 flex flex-col"
    >
      {/* Poster Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/10 flex-shrink-0">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-5xl opacity-20">🔬</div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070D1A] via-transparent to-transparent opacity-80" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <CategoryBadge category={event.category} />
          {isSoldOut && (
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          )}
          {!isSoldOut && event.is_paid && (
            <span className="bg-white/10 text-white border border-white/20 text-xs font-mono px-2 py-0.5 rounded-full">
              ₹{event.price}
            </span>
          )}
          {!event.is_paid && (
            <span className="bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-mono px-2 py-0.5 rounded-full">
              FREE
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5">
        {/* Date & Location */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">{event.date || "TBD"}</p>
          </div>
          <p className="text-xs text-gray-500 font-mono">{event.location || "Online"}</p>
        </div>

        <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-blue-100 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed flex-grow line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Countdown */}
        <div className="mb-4">
          <Countdown dateStr={event.date} />
        </div>

        {/* Seats bar */}
        {event.capacity && seats !== null && !isSoldOut && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 font-mono mb-1">
              <span>SEATS</span>
              <span className="text-green-400">{seats} left of {event.capacity}</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((event.capacity - seats) / event.capacity) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onRegister(event)}
          className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
            isSoldOut
              ? "bg-gray-800/60 text-gray-500 border border-gray-700/30 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white border border-blue-500/30 hover:from-blue-600 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-900/40 group-hover:-translate-y-0.5"
          }`}
          disabled={isSoldOut}
        >
          {isSoldOut ? "Event Full" : "View & Register →"}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main Events Page ────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Workshop", "Conference", "Symposium", "Webinar"]

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })

      if (!error && data) setEvents(data)
      setLoading(false)
    }
    loadEvents()
  }, [])

  const filtered = activeCategory === "All"
    ? events
    : events.filter((e) => e.category === activeCategory)

  return (
    <>
      {/* SEO */}
      <title>Events | SMAK Research — Workshops, Conferences & Symposiums</title>
      <meta name="description" content="Browse SMAK's upcoming medical research events — workshops, clinical symposiums, webinars and conferences. Register directly with instant payment and email confirmation." />

      <main className="bg-transparent text-gray-100 min-h-screen flex flex-col pt-28 pb-24">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">

          {/* ── Hero Header ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 text-xs text-blue-400 mb-5 font-mono bg-blue-900/10">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              SYSTEM/CALENDAR
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4 leading-none">
              Network <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Deployments</span>
            </h1>
            <p className="text-gray-500 font-mono text-sm max-w-xl mx-auto">
              / symposiums / clinical workshops / research conferences
            </p>
          </motion.div>

          {/* ── Category Filter Tabs ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-500"
                    : "bg-white/[0.04] text-gray-400 border border-white/[0.07] hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* ── Stats Bar ───────────────────────────────── */}
          {!loading && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-8 mb-10"
            >
              {[
                { label: "Total Events", val: events.length },
                { label: "Upcoming", val: events.filter(e => new Date(e.date) > new Date()).length },
                { label: "Free Events", val: events.filter(e => !e.is_paid).length },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-black text-white">{s.val}</p>
                  <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Loading ──────────────────────────────────── */}
          {loading && (
            <div className="flex justify-center items-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-gray-500 font-mono text-sm">Loading events...</span>
            </div>
          )}

          {/* ── Empty State ──────────────────────────────── */}
          {!loading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 text-2xl">
                📅
              </div>
              <p className="text-gray-500 font-mono text-sm">
                {activeCategory === "All" ? "No events scheduled yet." : `No ${activeCategory} events found.`}
              </p>
              {activeCategory !== "All" && (
                <button onClick={() => setActiveCategory("All")} className="mt-4 text-blue-400 text-sm hover:underline">
                  View all events
                </button>
              )}
            </motion.div>
          )}

          {/* ── Events Grid ─────────────────────────────── */}
          {!loading && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  onRegister={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Registration Modal ───────────────────────── */}
        <AnimatePresence>
          {selectedEvent && (
            <RegistrationModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  )
}