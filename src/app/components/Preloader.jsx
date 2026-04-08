"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show the loader for 2.2 seconds before triggering the explosive boom reveal
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          // The background fades out slightly after the boom starts
          className="fixed inset-0 z-[99999] bg-black-void flex items-center justify-center overflow-hidden pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div style={{ perspective: "1000px" }} className="absolute inset-0 flex items-center justify-center">
            {/* The Atom Structure - Expands aggressively on exit */}
            <motion.div
              exit={{ scale: 150, opacity: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} // custom spring/ease for boom
              className="relative flex items-center justify-center"
            >
              {/* Central Nucleus */}
              <motion.div 
                className="w-16 h-16 rounded-full bg-cyan-bio shadow-[0_0_80px_20px_rgba(0,240,255,0.8)] flex items-center justify-center"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-8 h-8 rounded-full bg-white blur-[2px]" />
              </motion.div>

              {/* 3 Electron Orbits */}
              {[
                { rZ: 0, duration: 1.2 },
                { rZ: 60, duration: 1.5 },
                { rZ: 120, duration: 1.8 }
              ].map((orbit, index) => (
                <div 
                  key={index}
                  className="absolute w-80 h-80 rounded-full border border-cyan-bio/20"
                  style={{ transform: `rotateZ(${orbit.rZ}deg) rotateX(75deg)` }}
                >
                  <motion.div
                    className="w-full h-full absolute inset-[0]"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: orbit.duration, repeat: Infinity, ease: "linear" }}
                  >
                    {/* Electron Dot */}
                    <div 
                      className="absolute top-0 left-1/2 -ml-3 -mt-3 w-6 h-6 bg-white rounded-full shadow-[0_0_30px_8px_rgba(0,240,255,1)]" 
                    />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
