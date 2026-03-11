"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function Contact() {

  const [form, setForm] = useState({ name: "", message: "" })

  const handleSubmit = (e) => {
    e.preventDefault()

    const subject = `SMAK Contact Message from ${form.name}`
    const body = `Name: ${form.name}%0D%0A%0D%0AMessage:%0D%0A${form.message}`

    window.location.href = `mailto:official@smakresearch.com?subject=${encodeURIComponent(subject)}&body=${body}`
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
        <h1 className="text-5xl font-bold mb-6">Contact SMAK</h1>
        <p className="text-gray-400 text-lg">
          We'd love to hear from you. Reach out for collaborations, research
          opportunities or any questions about the SMAK community.
        </p>
      </motion.section>

      {/* Contact Info */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-8">

          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-3">Email</h3>
            <p className="text-gray-400">official@smakresearch.com</p>
          </div>

          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-3">LinkedIn</h3>
            <a
              href="https://www.linkedin.com/company/s-m-a-k-soceity-for-medical-academia-knowledge/"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              SMAK Community
            </a>
          </div>

          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-3">Instagram</h3>
            <a
              href="https://www.instagram.com/smak.community"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              @smak.community
            </a>
          </div>

        </div>
      </section>

      {/* Contact Form */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-3xl mx-auto px-8">

          <h2 className="text-3xl font-semibold text-center mb-10">
            Send us a message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4"
            />

            <textarea
              rows="5"
              placeholder="Your message"
              value={form.message}
              onChange={(e)=>setForm({...form,message:e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send Message
            </button>

          </form>

        </div>
      </section>

    </main>
  )
}