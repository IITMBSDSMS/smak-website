"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function Collaborators() {
  const [logos, setLogos] = useState([])

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    const loadLogos = async () => {
      const { data, error } = await supabase
        .from("collaborators")
        .select("*")
        .order("created_at", { ascending: true })

      if (!error && data) {
        setLogos(data)
      }
    }

    loadLogos()
  }, [])

  return (
    <main className="bg-black text-white min-h-screen">

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-28 text-center max-w-4xl mx-auto px-6"
      >
        <h1 className="text-5xl font-bold mb-6">SMAK Collaborators</h1>
        <p className="text-gray-400 text-lg">
          SMAK collaborates with leading medical institutions, researchers,
          and academic communities to advance research and innovation.
        </p>
      </motion.section>

      {/* Partner Institutions */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-6xl mx-auto px-8">

          <h2 className="text-3xl font-semibold text-center mb-16">
            Partner Institutions
          </h2>

          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-16 items-center"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >

              {/* dynamic logos */}
              <div className="flex gap-16 items-center">
                {logos.map((logo) => (
                  <img
                    key={logo.id}
                    src={logo.logo}
                    alt={logo.name}
                    className="h-[70px] object-contain"
                  />
                ))}
              </div>

              {/* duplicate set for infinite loop */}
              <div className="flex gap-16 items-center">
                {logos.map((logo) => (
                  <img
                    key={`dup-${logo.id}`}
                    src={logo.logo}
                    alt={logo.name}
                    className="h-[70px] object-contain"
                  />
                ))}
              </div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* Collaboration Opportunities */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-5xl mx-auto px-8 text-center">

          <h2 className="text-3xl font-semibold mb-8">
            Collaborate With SMAK
          </h2>

          <p className="text-gray-400 mb-10">
            We welcome partnerships with universities, healthcare
            institutions, research labs and innovators who share our
            vision of advancing medical science through collaboration.
          </p>

          <a
            href="/join"
            className="inline-block bg-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Collaboration
          </a>

        </div>
      </section>

    </main>
  )
}