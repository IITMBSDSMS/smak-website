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
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const entryFromURL = params.get("entry");
      const nameParam = params.get("name");
      const phoneParam = params.get("phone");

      if (entryFromURL) setEntry(entryFromURL);
      if (nameParam) setName(nameParam);
      if (phoneParam) setPhone(phoneParam.replace(" ", "+"));
    }
  }, [])

  useEffect(() => {
    if (!entry) return

    // Professional Black & White QR
    QRCode.toDataURL(`https://smakresearch.com/member/${entry}`, {
      width: 250,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
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
        if(!nameParam && data.name) setName(data.name)
        if(!phoneParam && data.phone) setPhone(data.phone)
        if(data.college) setCollege(data.college)
      }
      setLoading(false)
    }

    loadMember()
  }, [entry, nameParam, phoneParam])

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
      await new Promise(r => setTimeout(r, 100))

      const canvas = await html2canvas(idCardRef.current, {
        scale: 4, // Ultra-high resolution for printing
        backgroundColor: "#FFFFFF",
        useCORS: true,
        logging: false
      })

      const imgData = canvas.toDataURL("image/png")

      // 1. Download PNG
      const link = document.createElement("a")
      link.download = `SMAK-Researcher-ID-${entry || "draft"}.png`
      link.href = imgData
      link.click()

      // 2. Download PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [54, 86] // Standard CR80 ID Card dimensions (54mm x 86mm)
      })
      pdf.addImage(imgData, "PNG", 0, 0, 54, 86)
      pdf.save(`SMAK-Researcher-ID-${entry || "draft"}.pdf`)

      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"))
        await supabase.storage.from("id-cards").upload(`${entry}.png`, blob, { upsert: true, contentType: "image/png" })
      } catch (e) {
        console.log("Skipping upload to server", e)
      }

    } catch (err) {
      console.error(err)
      alert("Error generating ID card: " + err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="bg-[#050B14] text-white min-h-screen pt-32 pb-24 relative overflow-hidden">
      <Navbar />
      
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 text-xs text-blue-400 mb-4 tracking-widest uppercase">
            Official Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-sans tracking-tight text-white mb-4">
             Generate <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Researcher ID</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
             Enter member details and upload a professional headshot to generate the official Society for Medical Academia & Knowledge identity card.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Controls / Form */}
          <GlassCard hoverEffect={false} className="p-8 border border-white/5 bg-[#0A1220]/80 space-y-6">
            <h3 className="text-xl font-bold tracking-wide text-white border-b border-white/10 pb-4">Member Data</h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Member ID / Registration No.</label>
                 <input 
                   value={entry} 
                   onChange={(e) => setEntry(e.target.value)}
                   className="w-full bg-[#050A10] border border-gray-800 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                   placeholder="SMAK-0000"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Full Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#050A10] border border-gray-800 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Contact Phone</label>
                  <input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#050A10] border border-gray-800 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Institution</label>
                <input 
                  value={college} 
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-[#050A10] border border-gray-800 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold tracking-wider text-gray-400 mb-3 block uppercase">Upload Passport Photo</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-800 border-dashed rounded-lg cursor-pointer bg-[#050A10] hover:bg-gray-800/30 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-blue-400">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG (Clear Face Required)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={generateCard}
              disabled={generating}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold tracking-wide rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {generating ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
              ) : 'Generate Professional ID Card'}
            </button>
          </GlassCard>


          {/* Live Preview Container */}
          <div className="flex justify-center items-center h-full">
            
            {/* THIS IS THE ACTUAL ID CARD EXPORTED BY HTML2CANVAS */}
            <div 
              id="id-card-element"
              ref={idCardRef}
              className="relative flex flex-col font-sans"
              style={{
                width: "378px",  // Roughly proportional to CR80
                height: "600px", // Roughly proportional to CR80
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
              }}
            >
              
              {/* CARD HEADER (NAVY BLUE) */}
              <div className="relative w-full h-[100px] bg-[#0A1930] flex items-center px-6">
                <div className="flex items-center gap-4 relative z-10 w-full">
                   <div className="w-14 h-14 bg-[#FFFFFF] rounded-full flex items-center justify-center p-1.5 shrink-0" style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                     <img src="/logo.png" className="w-full h-full object-contain" alt="SMAK" />
                   </div>
                   <div className="flex-1">
                     <div className="text-[10px] tracking-widest text-[#60A5FA] font-medium uppercase leading-tight mb-0.5">Society for Medical</div>
                     <div className="text-lg font-bold text-[#FFFFFF] uppercase leading-tight">Academia & Knowledge</div>
                   </div>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="flex-grow flex flex-col items-center px-6 py-6 border-x border-[#E5E7EB] bg-[#F8FAFC]">
                
                <h2 className="text-[#1E3A8A] font-bold text-center tracking-widest uppercase text-sm mb-5 border-b-2 border-[#1E3A8A] pb-1 inline-block">
                  Research Scholar
                </h2>
                
                {/* Photo Frame */}
                <div className="w-[150px] h-[190px] border border-[#CBD5E1] p-1.5 bg-[#FFFFFF] mb-6 rounded" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <div className="w-[136px] h-[176px] bg-[#F1F5F9] relative overflow-hidden flex flex-col items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover" alt="Member" />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full" style={{ opacity: 0.4, color: "#0F172A" }}>
                        <div className="text-4xl mb-2">👤</div>
                        <span className="text-[10px] font-semibold tracking-wider text-center px-2 leading-tight">PHOTO<br/>REQUIRED</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Details aligned carefully */}
                <div className="w-full space-y-4 px-2">
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#0F172A] tracking-tight leading-none uppercase">{name || "JOHN DOE"}</div>
                  </div>
                  
                  <div className="w-full h-[1px] bg-[#CBD5E1] my-1"></div>

                  <div className="flex justify-center w-full">
                    <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-2 text-sm max-w-[280px]">
                      <div className="text-[#64748B] font-semibold text-right text-[11px] uppercase tracking-wider pt-0.5">Inst.</div>
                      <div className="text-[#1E293B] font-bold text-[12px] leading-tight flex items-center">{college || "Affiliate Organization"}</div>
                      
                      <div className="text-[#64748B] font-semibold text-right text-[11px] uppercase tracking-wider pt-0.5">ID No.</div>
                      <div className="text-[#1E293B] font-bold font-mono tracking-wider">{entry || "SMAK-0000"}</div>
                      
                      <div className="text-[#64748B] font-semibold text-right text-[11px] uppercase tracking-wider pt-0.5">Phone</div>
                      <div className="text-[#1E293B] font-medium">{phone || "XXX-XXX-XXXX"}</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* CARD FOOTER */}
              <div className="h-[80px] bg-[#0F172A] flex justify-between items-center px-5 border-x border-b border-[#0F172A] rounded-b-[16px] relative overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(37,99,235,0.1)' }}></div>
                <div className="flex-1 relative z-10">
                   <div className="text-[9px] font-bold tracking-widest text-[#94A3B8] uppercase mb-1">Status: Active</div>
                   <div className="text-[10px] text-[#CBD5E1] leading-tight">This identification card is the property of SMAK Research. Valid for official duties only.</div>
                </div>
                <div className="w-[56px] h-[56px] bg-[#FFFFFF] shrink-0 rounded-[4px] flex items-center justify-center p-1 relative z-10 ml-4" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  {qrUrl ? (
                    <img src={qrUrl} alt="Verify QR" className="w-full h-full" />
                  ) : (
                     <div className="w-full h-full bg-[#F3F4F6] p-1 flex items-center justify-center">
                       <span className="text-[6px] text-[#9CA3AF] text-center font-bold">QR CODE</span>
                     </div>
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
    <Suspense fallback={<div className="min-h-screen bg-[#050B14] text-white flex justify-center items-center">LOADING COMPONENT...</div>}>
      <GenerateIDComponent />
    </Suspense>
  )
}