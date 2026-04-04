"use client"

import { useState, useRef, useEffect } from "react"
import QRCode from "qrcode"

export default function QRGenerator() {
  const [source, setSource] = useState("poster_hub_1")
  const [qrUrl, setQrUrl] = useState("")
  const [baseUrl, setBaseUrl] = useState("")

  const canvasRef = useRef(null)

  useEffect(() => {
    // Determine the base URL dynamically based on environment
    setBaseUrl(window.location.origin)
  }, [])

  const targetLink = `${baseUrl}/campus-ambassador?source=${encodeURIComponent(source)}`

  useEffect(() => {
    if (canvasRef.current && baseUrl) {
      QRCode.toCanvas(canvasRef.current, targetLink, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      }, (error) => {
        if (error) console.error("QR Code Generation Error:", error)
      })
      
      // Also generate a data URL for easy downloading
      QRCode.toDataURL(targetLink, {
        width: 1000,
        margin: 2
      }, (err, url) => {
        if (!err) setQrUrl(url)
      })
    }
  }, [source, targetLink, baseUrl])

  const handleDownload = () => {
    if (!qrUrl) return
    const a = document.createElement("a")
    a.href = qrUrl
    a.download = `SMAK_QR_${source}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen bg-black-void text-gray-200 p-8 font-sans">
      <header className="mb-10 pb-6 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">QR Code Generator</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">Create offline tracking nodes for the Ambassador pipeline.</p>
        </div>
        <a href="/admin/campus-ambassador" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-sm">
           Back to Dashboard
        </a>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-12">
        <div className="bg-black-obsidian border border-gray-800 p-8 rounded-xl shadow-xl">
          <h3 className="font-bold text-white uppercase tracking-wider mb-6">Configure Parameters</h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-cyan-bio font-mono mb-2 block">UTM Source / Campaign Name</label>
              <input 
                type="text" 
                value={source}
                onChange={(e) => setSource(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_'))}
                className="w-full bg-black-void border border-gray-700 px-4 py-3 rounded text-white focus:outline-none focus:border-cyan-bio"
                placeholder="e.g. jnu_poster_campaign"
              />
              <p className="text-xs text-gray-500 mt-2">Only letters, numbers, hyphens, and underscores allowed.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 font-mono mb-2 block">Generated Destination URL</label>
              <div className="w-full bg-gray-900 border border-gray-800 px-4 py-3 rounded text-gray-400 text-sm break-all font-mono">
                {targetLink}
              </div>
            </div>
            
            <button 
              onClick={handleDownload}
              className="w-full bg-cyan-bio text-black font-bold uppercase py-3 rounded hover:bg-white transition-colors mt-4"
            >
               Download High-Res QR
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-700 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyan-bio/5 group-hover:bg-cyan-bio/10 transition-colors pointer-events-none"></div>
          <p className="text-xs uppercase tracking-widest text-cyan-bio font-mono mb-6 z-10">Live Preview</p>
          
          <div className="bg-white p-4 rounded-xl shadow-2xl relative z-10 transition-transform hover:scale-105 duration-300">
             <canvas ref={canvasRef} className="rounded-lg"></canvas>
          </div>
          
          <p className="text-xs text-gray-500 mt-6 z-10 text-center max-w-xs">
            Scan this code with a mobile device to verify the destination.
          </p>
        </div>
      </div>
    </div>
  )
}
