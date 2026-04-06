"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-4 md:top-6 left-0 right-0 z-[60] flex justify-center w-full px-4"
      >
        <div className="flex items-center justify-between w-full max-w-5xl px-4 md:px-6 py-2 md:py-3 glass-panel rounded-full interactive">
          
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2 md:gap-3 group interactive z-[70]">
            <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-full border border-cyan-bio/30 group-hover:border-cyan-bio transition-colors duration-300">
              <Image
                src="/logo.png"
                fill
                className="object-cover"
                alt="SMAK Logo"
                unoptimized
              />
            </div>
            <h1 className="font-bold tracking-widest text-base md:text-lg text-white group-hover:text-glow transition-all duration-300 uppercase">
              SMAK
            </h1>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6 text-[10px] font-bold tracking-widest text-gray-400">
            <NavLink href="/">HOME</NavLink>
            <NavLink href="/research-club">RESEARCH CLUB</NavLink>
            <NavLink href="/events">EVENTS</NavLink>
            <NavLink href="/collaborators">PARTNERS</NavLink>
            <NavLink href="/campus-ambassador">AMBASSADOR</NavLink>
            <NavLink href="/contact">CONTACT</NavLink>
          </nav>
          
          <div className="hidden lg:flex items-center gap-4 z-[70]">
            <Link href="/dashboard" className="px-4 py-2 text-[10px] font-bold text-cyan-bio border border-cyan-bio/30 rounded-full hover:bg-cyan-bio/10 hover:border-cyan-bio transition-all duration-300 uppercase tracking-widest">
              Student Portal
            </Link>
            <Link href="/join" className="px-5 py-2 text-[10px] font-bold text-black-void bg-cyan-bio rounded-full hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-shadow duration-300 interactive uppercase tracking-widest">
              Join Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu} 
            className="lg:hidden interactive p-2 text-cyan-bio focus:outline-none z-[70] ml-auto"
            aria-label="Toggle mobile menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className={`w-6 h-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[50] bg-black-void/80 flex flex-col items-center justify-center lg:hidden"
          >
            <nav className="flex flex-col items-center gap-8 text-lg font-medium tracking-wider uppercase">
              <MobileNavLink href="/" onClick={closeMenu}>HOME</MobileNavLink>
              <MobileNavLink href="/research-club" onClick={closeMenu}>RESEARCH CLUB</MobileNavLink>
              <MobileNavLink href="/events" onClick={closeMenu}>EVENTS</MobileNavLink>
              <MobileNavLink href="/collaborators" onClick={closeMenu}>PARTNERS</MobileNavLink>
              <MobileNavLink href="/campus-ambassador" onClick={closeMenu}>AMBASSADOR</MobileNavLink>
              <MobileNavLink href="/contact" onClick={closeMenu}>CONTACT</MobileNavLink>
              <MobileNavLink href="/dashboard" onClick={closeMenu}>STUDENT PORTAL</MobileNavLink>
            </nav>
            <Link 
              href="/join" 
              onClick={closeMenu}
              className="mt-12 px-8 py-3 text-sm font-bold text-black-void bg-cyan-bio hover:bg-white rounded-full transition-colors duration-300 uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Initialize Subroutine (Join)
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ href, children }) {
  return (
    <Link 
      href={href} 
      className="relative text-gray-300 hover:text-white transition-colors duration-300 group interactive"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-cyan-bio transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_10px_rgba(0,240,255,0.8)]"></span>
    </Link>
  )
}

function MobileNavLink({ href, onClick, children }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="text-gray-300 hover:text-cyan-bio hover:text-glow transition-all duration-300"
    >
      {children}
    </Link>
  )
}