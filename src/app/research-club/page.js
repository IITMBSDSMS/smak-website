"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ResearchClub() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [mentors, setMentors] = useState([])
  const [scholars, setScholars] = useState([])

  useEffect(() => {
    async function loadTeam() {
      const { data: mentorData } = await supabase
        .from("research_mentors")
        .select("*")
        .order("created_at", { ascending: true })

      const { data: scholarData } = await supabase
        .from("research_scholars")
        .select("*")
        .order("created_at", { ascending: true })

      if (mentorData) setMentors(mentorData)
      if (scholarData) setScholars(scholarData)
    }

    loadTeam()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    alert("Application submitted! We'll contact you soon.")
  }

  return (
    <main className="bg-black text-white min-h-screen">

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-28 text-center max-w-5xl mx-auto px-6"
      >
        <div className="flex justify-center mb-6">
          <img
  src="/research-club-logo.png"
  alt="Research Club Logo"
  className="w-28 h-28 rounded-full object-cover"
/>
        </div>
        <h1 className="text-5xl font-bold mb-6">SMAK Research Club</h1>
        <p className="text-lg text-gray-400 leading-relaxed">
          Empowering medical students to explore research, collaborate on
          clinical studies, and publish impactful scientific work.
        </p>
      </motion.section>

      {/* About Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 px-8 items-center">

          <div>
            <h2 className="text-3xl font-semibold mb-6">What We Do</h2>
            <p className="text-gray-400 leading-relaxed">
              The SMAK Research Club provides mentorship, training and
              collaboration opportunities for medical students interested
              in academic research. Members learn how to design studies,
              analyze data, and publish papers in reputed journals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-xl font-semibold">Research Mentorship</h3>
              <p className="text-gray-400 text-sm mt-2">
                Guidance from experienced researchers.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-xl font-semibold">Workshops</h3>
              <p className="text-gray-400 text-sm mt-2">
                Learn statistics, methodology and publishing.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-xl font-semibold">Collaborations</h3>
              <p className="text-gray-400 text-sm mt-2">
                Work with institutions and clinicians.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-xl font-semibold">Publications</h3>
              <p className="text-gray-400 text-sm mt-2">
                Support for publishing research papers.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Activities Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8">

          <h2 className="text-3xl font-semibold text-center mb-14">
            Research Opportunities
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Clinical Research</h3>
              <p className="text-gray-400 text-sm">
                Participate in clinical research projects and real-world
                patient data analysis.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Systematic Reviews</h3>
              <p className="text-gray-400 text-sm">
                Work on literature reviews and meta-analyses with mentors.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Innovation Projects</h3>
              <p className="text-gray-400 text-sm">
                Collaborate on medical innovation and research initiatives.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Research Timeline */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-semibold text-center mb-14">Research Journey</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-blue-500 font-semibold">Step 1</h3>
              <p className="text-gray-400 text-sm mt-2">Learn research methodology and fundamentals.</p>
            </div>
            <div>
              <h3 className="text-blue-500 font-semibold">Step 2</h3>
              <p className="text-gray-400 text-sm mt-2">Join mentorship groups and select research topics.</p>
            </div>
            <div>
              <h3 className="text-blue-500 font-semibold">Step 3</h3>
              <p className="text-gray-400 text-sm mt-2">Conduct research, analyze data and collaborate.</p>
            </div>
            <div>
              <h3 className="text-blue-500 font-semibold">Step 4</h3>
              <p className="text-gray-400 text-sm mt-2">Publish findings in journals and conferences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-24 border-t border-gray-800 overflow-hidden">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-semibold text-center mb-14">Research Mentors</h2>

          <motion.div
            className="flex gap-10"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...mentors, ...mentors].map((mentor, i) => (
              <div
                key={i}
                className="bg-gray-900 p-6 rounded-xl text-center min-w-[220px]"
              >
                <img
                  src={mentor.image || "/logo.png"}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold">{mentor.name}</h3>
                <p className="text-gray-400 text-sm">{mentor.role}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Scholars Section */}
      <section className="py-24 border-t border-gray-800 overflow-hidden">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-semibold text-center mb-14">Research Scholars</h2>

          <motion.div
            className="flex gap-10"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {[...scholars, ...scholars].map((scholar, i) => (
              <div
                key={i}
                className="bg-gray-900 p-6 rounded-xl text-center min-w-[220px]"
              >
                <img
                  src={scholar.image || "/logo.png"}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold">{scholar.name}</h3>
                <p className="text-gray-400 text-sm">{scholar.role}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Publications Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-semibold text-center mb-14">Recent Publications</h2>
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <a href="#" className="font-semibold hover:text-blue-400">Impact of AI in Medical Diagnostics</a>
              <p className="text-gray-400 text-sm">Journal of Medical Innovation • 2025</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <a href="#" className="font-semibold hover:text-blue-400">Clinical Data Analysis in Emerging Diseases</a>
              <p className="text-gray-400 text-sm">International Medical Review • 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 text-center border-t border-gray-800">
        <h2 className="text-3xl font-semibold mb-6">
          Join the SMAK Research Community
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-10">
          Become part of a network of medical students dedicated to
          advancing research, innovation and scientific collaboration.
        </p>

        <Link
          href="/join"
          className="bg-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block"
        >
          Apply to Research Club
        </Link>
      </section>

    </main>
  )
}