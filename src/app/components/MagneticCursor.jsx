"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function MagneticCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  
  useEffect(() => {
    // Only track cursor on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e) => {
      const target = e.target
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') ||
        target.classList.contains('interactive')
        
      setHovered(isInteractive)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-cyan-400 pointer-events-none z-[9999] mix-blend-screen"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: hovered ? 1.8 : 1,
        backgroundColor: hovered ? "rgba(0, 240, 255, 0.2)" : "rgba(0, 240, 255, 0)",
        borderColor: hovered ? "rgba(0, 240, 255, 0.8)" : "rgba(0, 240, 255, 0.5)"
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.2 }}
    />
  )
}
