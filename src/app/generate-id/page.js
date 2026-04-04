"use client"

"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import QRCode from "qrcode"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Navbar from "../components/Navbar"
import GlassCard from "../components/GlassCard"
import { motion } from "framer-motion"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function GenerateIDComponent() {
  const [name, setName] = useState("John Doe")
  const [phone, setPhone] = useState("+91 00000 00000")
  const [college, setCollege] = useState("Institute Name")
  const [entry, setEntry] = useState("")
  const [photoPreview, setPhotoPreview] = useState(null)
  const [qrUrl, setQrUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const idCardRef = useRef(null)
  const searchParams = useSearchParams()
  const entryFromURL = searchParams.get("entry")
  const nameParam = searchParams.get("name")
  const phoneParam = searchParams.get("phone")

  useEffect(() => {
    if (entryFromURL) setEntry(entryFromURL)
    if (nameParam) setName(nameParam)
    // Sometimes phone has spaces inside URL
    if (phoneParam) setPhone(phoneParam.replace(" ", "+"))
  }, [entryFromURL, nameParam, phoneParam])

  useEffect(() => {
    if (!entry) return

    // Pre-generate QR code for the ID Card
    QRCode.toDataURL(`https://smakresearch.com/member/${entry}`, {
      width: 200,
      margin: 1,
      color: {
        dark: "#00F0FF", // Cyan Bio
        light: "#00000000" // Transparent
      }
    }).then(url => setQrUrl(url))

    const loadMember = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("members")
        .select("name, phone, college")
        .eq("entry_no", entry)
        .single()

      if (data) {
        if(data.name) setName(data.name)
        if(data.phone) setPhone(data.phone)
        if(data.college) setCollege(data.college)
      }
      setLoading(false)
    }

    if (!nameParam) {
      loadMember()
    }
  }, [entry, nameParam])

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target.result)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const generateCard = async () => {
    if (!idCardRef.current) return
    setGenerating(true)

    try {
      // Small pause to let UI render the 'generating' state
      await new Promise(r => setTimeout(r, 100))

      const canvas = await html2canvas(idCardRef.current, {
        scale: 3, // High resolution
        backgroundColor: null,
        useCORS: true,
        logging: false
      })

      const imgData = canvas.toDataURL("image/png")

      // 1. Download PNG
      const link = document.createElement("a")
      link.download = `SMAK-ID-${entry || "draft"}.png`
      link.href = imgData
      link.click()

      // 2. Download PDF (CR80 standard ID dimension proportion)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 3, canvas.height / 3]
      })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 3, canvas.height / 3)
      pdf.save(`SMAK-ID-${entry || "draft"}.pdf`)

      // Optional: upload to supabase (silently fail if no auth)
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"))
        await supabase.storage.from("id-cards").upload(`${entry}.png`, blob, { upsert: true, contentType: "image/png" })
      } catch (e) {
        console.log("Skipping upload to server", e)
      }

    } catch (err) {
      console.error(err)
      alert("Error generating ID card. Ensure your photo is a valid file type.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="bg-black text-white min-h-screen pt-32 pb-24 relative overflow-hidden">
      <Navbar />
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-bio/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-bio/30 text-xs text-cyan-bio mb-4 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-bio animate-pulse"></span> IDENTIFICATION PROTOCOL
          </div>
          <h1 className="text-4xl md:text-5xl font-sans tracking-tight uppercase">
             ID Card <span className="font-bold text-glow">Generator</span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Controls / Form */}
          <GlassCard hoverEffect={false} className="p-8 border border-white/10 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-cyan-bio mb-2">Member Details</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-xs font-mono text-gray-400">Entry / Member No</label>
                 <input 
                   value={entry} 
                   onChange={(e) => setEntry(e.target.value)}
                   className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-bio focus:outline-none"
                   placeholder="SMAK-001"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400">Full Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-bio focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400">Phone</label>
                  <input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-bio focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400">Institution</label>
                <input 
                  value={college} 
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-black-void border border-gray-700 rounded-lg px-4 py-2 focus:border-cyan-bio focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="text-xs font-mono text-gray-400 mb-2 block">Upload Official Headshot</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-bio/20 file:text-cyan-bio hover:file:bg-cyan-bio/30 transition-all cursor-pointer"
                />
              </div>

            </div>

            <button
              onClick={generateCard}
              disabled={generating}
              className="w-full mt-6 py-4 bg-cyan-bio text-black-void font-bold text-sm tracking-widest uppercase rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? "Compiling Assets..." : "Export ID Card (PDF & PNG)"}
            </button>
          </GlassCard>


          {/* Live Preview Container */}
          <div className="flex justify-center items-center h-full">
            
            {/* THIS IS THE ACTUAL ID CARD EXPORTED BY HTML2CANVAS */}
            <div 
              id="id-card-element"
              ref={idCardRef}
              className="relative overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.2)] bg-[#030B17] flex flex-col"
              style={{
                width: "360px",
                height: "570px", // Portrait CR80 Ratio equivalent
                border: "2px solid rgba(0, 240, 255, 0.4)",
                borderRadius: "16px",
              }}
            >
              {/* Card Background Pattern & Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-bio/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[60px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
              
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00f0ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* CARD HEADER */}
              <div className="relative pt-6 px-6 pb-4 flex justify-between items-start border-b border-cyan-bio/20 bg-black/40 backdrop-blur-sm">
                <div className="flex gap-3 items-center">
                   <div className="w-10 h-10 bg-cyan-bio/10 border border-cyan-bio/50 rounded-lg flex items-center justify-center overflow-hidden relative p-1 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                     <img src="/logo.png" className="w-full h-full object-contain" alt="SMAK Logo" />
                   </div>
                   <div>
                     <div className="text-[10px] tracking-[0.2em] text-cyan-bio font-mono uppercase mb-0.5">Operative</div>
                     <div className="text-xl font-black tracking-widest text-white leading-none">SMAK</div>
                   </div>
                </div>
                <div className="text-[9px] font-mono text-right text-gray-400 mt-1 uppercase">
                  <div>AUTHORIZED</div>
                  <div className="text-cyan-bio mt-0.5">{entry || "SMAK-XXX"}</div>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="relative flex-grow flex flex-col items-center px-6 pt-6">
                
                {/* Photo Frame */}
                <div className="relative mb-6">
                  <div className="absolute inset-[-4px] bg-gradient-to-tr from-cyan-bio to-blue-600 rounded-xl opacity-50 blur-[2px]"></div>
                  <div className="w-36 h-44 rounded-xl border-2 border-cyan-bio/80 overflow-hidden relative shadow-inner z-10 bg-[#0a1220]">
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover grayscale-[20%] contrast-125" alt="Member" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                        <svg className="w-12 h-12 text-cyan-bio mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="text-[9px] font-mono tracking-wider">AWAITING PHOTO</span>
                      </div>
                    )}
                  </div>
                  {/* Decor elements */}
                  <div className="absolute -left-2 top-8 w-1 h-8 bg-cyan-bio z-20"></div>
                  <div className="absolute -right-2 bottom-8 w-1 h-8 bg-cyan-bio z-20"></div>
                </div>

                {/* Details */}
                <div className="w-full space-y-4">
                  <div className="border-l-2 border-cyan-bio pl-3">
                    <div className="text-[9px] text-gray-400 font-mono tracking-[0.2em] mb-0.5 uppercase">Full Designation</div>
                    <div className="text-xl font-bold tracking-wide text-white uppercase break-words leading-tight">{name || "JOHN DOE"}</div>
                  </div>
                  
                  <div className="border-l-2 border-cyan-bio/40 pl-3">
                    <div className="text-[9px] text-gray-400 font-mono tracking-[0.2em] mb-0.5 uppercase">Institution / Base</div>
                    <div className="text-sm tracking-wide text-gray-200 break-words leading-snug">{college || "AFFILIATE ORGANIZATION"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="border-l-2 border-cyan-bio/40 pl-3">
                        <div className="text-[9px] text-gray-400 font-mono tracking-[0.2em] mb-0.5 uppercase">Comms Link</div>
                        <div className="text-xs font-mono text-gray-300 truncate">{phone || "XXX-XXX-XXXX"}</div>
                     </div>
                     <div className="border-l-2 border-cyan-bio/40 pl-3">
                        <div className="text-[9px] text-gray-400 font-mono tracking-[0.2em] mb-0.5 uppercase">Status</div>
                        <div className="text-xs font-mono text-cyan-bio">ACTIVE</div>
                     </div>
                  </div>
                </div>

              </div>

              {/* CARD FOOTER WITH QR */}
              <div className="relative mt-auto p-4 pt-3 flex justify-between items-end border-t border-white/5 bg-black/40">
                <div className="flex-grow pr-2">
                   <div className="text-[8px] font-mono text-cyan-bio/70 tracking-widest uppercase mb-1">Society for Medical Academia & Knowledge</div>
                   <img src="/logo-text.png" className="h-4 object-contain opacity-80" alt="SMAK Logo Text" onError={(e) => e.target.style.display='none'} />
                   <div className="mt-2 flex gap-1">
                     <div className="h-1 w-6 bg-cyan-bio"></div>
                     <div className="h-1 w-2 bg-blue-500"></div>
                     <div className="h-1 w-2 bg-white/20"></div>
                   </div>
                </div>
                <div className="w-16 h-16 bg-white shrink-0 rounded flex items-center justify-center p-0.5 border border-cyan-bio shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Verification QR" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-cyan-bio/10 rounded-sm"></div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  )
}

export default function GenerateID() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex justify-center items-center">LOADING INTERFACE...</div>}>
      <GenerateIDComponent />
    </Suspense>
  )
}