"use client"

import { motion } from "framer-motion"
// Using standard img to avoid next/image domain configuration issues
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function Board() {
  const [members, setMembers] = useState([])

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    loadBoard()
  }, [])

  async function loadBoard() {
    const { data, error } = await supabase
      .from("board_members")
      .select("*")
      .order("created_at", { ascending: true })

    if (!error) setMembers(data || [])
  }

  return (
    <main className="bg-black text-white min-h-screen">

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-28 text-center max-w-4xl mx-auto px-6"
      >
        <h1 className="text-5xl font-bold mb-6">SMAK Leadership</h1>
        <p className="text-gray-400 text-lg">
          Meet the leadership team driving SMAK's mission to advance
          medical research, collaboration and academic innovation.
        </p>
      </motion.section>

      {/* Board Members Grid */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-6xl mx-auto px-8">

          <h2 className="text-3xl font-semibold text-center mb-16">
            Board Members
          </h2>

          <div className="grid md:grid-cols-3 gap-12">

            {members.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gray-900 rounded-xl p-8 text-center hover:scale-105 transition"
              >

                <div className="w-28 h-28 mx-auto mb-6 relative">
                  <img
                    src={member.image || "/logo.png"}
                    alt={member.name}
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>

                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-blue-400 mt-1">{member.role}</p>
                <p className="text-gray-400 text-sm mt-2">{member.college}</p>

              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* Join Leadership CTA */}
      <section className="border-t border-gray-800 py-28 text-center">

        <h2 className="text-3xl font-semibold mb-6">
          Become Part of the SMAK Leadership
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-10">
          We are always looking for passionate students who want to
          contribute to research, innovation and academic collaboration.
        </p>

        <a
          href="/join"
          className="inline-block bg-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Apply for Leadership
        </a>

      </section>

    </main>
  )
}