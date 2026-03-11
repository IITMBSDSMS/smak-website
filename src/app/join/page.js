"use client"

import { useState } from "react"

export default function Join() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    interest: ""
  })

  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const res = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          college: form.college,
          year: form.year,
          interest: form.interest
        })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {

        const entry_no = data.entry_no

        // send welcome/admin email
        try {
          await fetch("/api/register-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              entry_no: entry_no
            })
          })
        } catch (emailError) {
          console.error("Email trigger failed:", emailError)
        }

        setSuccess(true)

        setForm({
          name: "",
          email: "",
          phone: "",
          college: "",
          year: "",
          interest: ""
        })

      } else {
        const message = data?.error?.message || "Registration failed"
        alert(message)
        console.error("API error:", data)
      }

    } catch (error) {
      console.error("Fetch error:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-xl bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-10 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Join SMAK</h1>
          <p className="text-gray-400 text-sm">
            Become part of the Society for Medical Academia and Knowledge and
            collaborate with students across India in research and innovation.
          </p>
        </div>

        {success && (
          <div className="mb-6 text-green-400 text-center font-semibold">
            ✅ Registration Successful! Welcome to SMAK.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            placeholder="Full Name"
            required
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            required
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            placeholder="College / Institution"
            required
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.college}
            onChange={(e) => setForm({ ...form, college: e.target.value })}
          />

          <input
            placeholder="Year of Study"
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />

          <textarea
            placeholder="Research Interest"
            rows="4"
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-lg font-semibold text-lg disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

      </div>

    </main>
  )
}