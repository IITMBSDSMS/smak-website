"use client"

import { motion } from "framer-motion"
import { useState, useRef } from "react"

export default function GlassCard({ children, className = "", hoverEffect = true }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!hoverEffect || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Slight tilt factor based on mouse position
    setPosition({ x: x * 0.05, y: -y * 0.05 })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: position.y,
        rotateY: position.x,
        scale: isHovered && hoverEffect ? 1.02 : 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30, 
        mass: 0.5 
      }}
      className={`relative rounded-2xl p-[1px] overflow-hidden ${className} interactive`}
      style={{
        transformPerspective: 1000
      }}
    >
      {/* Animated gradient border on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-600 to-transparent opacity-0 z-0"
        animate={{
          opacity: isHovered && hoverEffect ? 0.8 : 0.3
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Inner glass panel that covers the background to leave just a 1px border */}
      <div className="relative z-10 w-full h-full bg-[#0a0a0f] bg-opacity-90 backdrop-blur-xl rounded-[15px] p-6 text-white shadow-xl shadow-black">
        {children}
      </div>
    </motion.div>
  )
}
