"use client"

import { Suspense, useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import GlassCard from "../components/GlassCard"
import { motion } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function CampusAmbassadorForm() {
  const [source, setSource] = useState('organic')

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    college_name: "",
    city_state: "",
    year_of_study: "",
    reason: "",
    experience: "",
    linkedin: "",
    instagram: "",
  })
  const [photo, setPhoto] = useState(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('source');
      if (s) setSource(s);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    if (!photo) {
      setErrorMessage("Please select a mandatory photo.")
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Upload Photo to Supabase Storage
      const fileExt = photo.name.split('.').pop()
      const fileName = `${formData.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ambassador_photos")
        .upload(fileName, photo, { upsert: true })

      if (uploadError) {
        throw new Error(`Photo Upload Failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("ambassador_photos")
        .getPublicUrl(fileName)

      // 2. Insert Record into Supabase Database
      const { data: insertData, error: dbError } = await supabase
        .from("campus_ambassadors")
        .insert([
          {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            college_name: formData.college_name,
            city_state: formData.city_state,
            year_of_study: formData.year_of_study,
            reason: formData.reason,
            experience: formData.experience,
            linkedin: formData.linkedin,
            instagram: formData.instagram,
            photo_url: publicUrl,
            utm_source: source
          }
        ])

      if (dbError) {
        // If constraint violation (e.g. duplicate email)
        if (dbError.code === '23505') {
            throw new Error("You have already applied with this email.")
        }
        throw new Error(`Database Error: ${dbError.message}`)
      }

      // 3. Trigger Confirmation Email API
      try {
        await fetch("/api/ambassador/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
             email: formData.email, 
             name: formData.full_name,
             type: "confirmation" 
          }),
        })
      } catch (emailErr) {
        console.error("Email API failed, but db insert succeeded", emailErr)
        // We do not fail the submission if just the auto-reply fails
      }

      setSubmitSuccess(true)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <main className="bg-transparent text-gray-100 flex flex-col min-h-screen">
        <Navbar />
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
             {/* Background glow */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-bio/10 rounded-full blur-[120px] pointer-events-none z-[-1]"></div>
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-center w-full max-w-2xl"
            >
                <GlassCard className="p-12 text-center border-cyan-bio">
                   <h2 className="text-4xl font-bold text-white mb-6">Application Received</h2>
                   <p className="text-gray-300 text-lg mb-8">
                     Thank you for applying to be a SMAK Campus Ambassador! <br/>
                     We have sent a confirmation email to <strong>{formData.email}</strong>. Our team will review your application and get back to you within 48-72 hours.
                   </p>
                   <a href="/" className="px-8 py-3 bg-cyan-bio text-black-void rounded-full font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                       Return Home
                   </a>
                </GlassCard>
            </motion.div>
        </section>
      </main>
    )
  }

  return (
    <main className="bg-transparent text-gray-100 flex flex-col min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-16 px-6 overflow-hidden z-10 text-center">
        {/* Abstract Background Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-neural/20 rounded-full blur-[120px] pointer-events-none z-[-1]"></div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-cyan-bio/30 bg-cyan-bio/5 text-xs text-cyan-bio mb-6 font-mono tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-bio animate-pulse"></span>
            India's First Research Accelerator
          </div>
          <h1 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-tight">
            Become a <span className="font-bold text-glow">Campus Ambassador</span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
            Lead the integration of modern medical research at your institution. Connect ambitious students to exclusive workshops, publication opportunities, and global networks. Represent SMAK and pioneer the future of academia.
          </p>
        </motion.div>
      </section>

      <section className="relative z-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 md:p-12 relative overflow-hidden" hoverEffect={false}>
            {/* Subtle internal border glow */}
            <div className="absolute inset-0 border border-cyan-bio/20 rounded-2xl pointer-events-none"></div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <h3 className="text-2xl font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-4 mb-8">
                Initialize Application
              </h3>

              {errorMessage && (
                <div className="p-4 bg-red-900/30 border border-red-500 text-red-200 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">Full Name *</label>
                  <input 
                    required type="text" name="full_name" value={formData.full_name} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">Email ID *</label>
                  <input 
                    required type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">WhatsApp Number *</label>
                  <input 
                    required type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* College Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">College/Institution *</label>
                  <input 
                    required type="text" name="college_name" value={formData.college_name} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all"
                    placeholder="XYZ Medical College"
                  />
                </div>

                {/* City / State */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">City / State *</label>
                  <input 
                    required type="text" name="city_state" value={formData.city_state} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all"
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>

                {/* Year of Study */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">Year of Study *</label>
                  <select 
                    required name="year_of_study" value={formData.year_of_study} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all appearance-none"
                  >
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Intern/Other">Intern / Other</option>
                  </select>
                </div>
              </div>

              {/* Long Answers */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">Why do you want to join SMAK? *</label>
                <textarea 
                  required name="reason" rows={4} value={formData.reason} onChange={handleInputChange}
                  className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all resize-none"
                  placeholder="Detail your motivation and what you can bring to the table..."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">Past Experience (Optional)</label>
                <textarea 
                  name="experience" rows={2} value={formData.experience} onChange={handleInputChange}
                  className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all resize-none"
                  placeholder="Any relevant leadership or research experience..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LinkedIn */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">LinkedIn Profile (Optional)</label>
                  <input 
                    type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono">Instagram Handle (Optional)</label>
                  <input 
                    type="text" name="instagram" value={formData.instagram} onChange={handleInputChange}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-bio focus:ring-1 focus:ring-cyan-bio transition-all"
                    placeholder="@yourhandle"
                  />
                </div>
              </div>

              {/* Upload Photo */}
              <div className="space-y-2 border border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-cyan-bio transition-colors">
                <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono block mb-3">Upload Identification Photo *</label>
                <input 
                  required type="file" accept="image/jpeg, image/png" onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold file:uppercase file:tracking-widest
                    file:bg-cyan-bio/10 file:text-cyan-bio
                    hover:file:bg-cyan-bio/20 cursor-pointer file:cursor-pointer mx-auto"
                />
                <p className="text-xs text-gray-500 mt-2">JPG or PNG only. Max 5MB.</p>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group relative py-4 bg-transparent rounded-full overflow-hidden interactive disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-neural to-cyan-bio opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10 text-black-void font-bold tracking-widest uppercase transition-all">
                    {isSubmitting ? "Transmitting Data..." : "Submit Application"}
                  </span>
                </button>
              </div>

            </form>
          </GlassCard>
        </div>
      </section>
    </main>
  )
}

export default function CampusAmbassador() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050B14] flex items-center justify-center text-white font-sans">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>}>
      <CampusAmbassadorForm />
    </Suspense>
  )
}
