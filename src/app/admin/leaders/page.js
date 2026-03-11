

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function LeadersAdmin() {

  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: "",
    role: "",
    college: "",
    image: ""
  })

  useEffect(() => {
    fetchLeaders()
  }, [])

  async function fetchLeaders() {
    setLoading(true)

    const { data, error } = await supabase
      .from("leaders")
      .select("*")
      .order("created_at", { ascending: true })

    if (!error) {
      setLeaders(data)
    }

    setLoading(false)
  }

  async function addLeader(e) {
    e.preventDefault()

    const { error } = await supabase
      .from("leaders")
      .insert([form])

    if (!error) {
      setForm({
        name: "",
        role: "",
        college: "",
        image: ""
      })
      fetchLeaders()
    } else {
      alert("Error adding leader")
      console.log(error)
    }
  }

  async function deleteLeader(id) {

    const { error } = await supabase
      .from("leaders")
      .delete()
      .eq("id", id)

    if (!error) {
      setLeaders(leaders.filter(l => l.id !== id))
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex justify-center py-16">
      <div className="w-full max-w-5xl px-6">

        <h1 className="text-4xl font-bold mb-10">Leadership Manager</h1>

        {/* Add Leader Form */}
        <form
          onSubmit={addLeader}
          className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 mb-10 space-y-4"
        >

          <h2 className="text-xl font-semibold mb-4">Add Leader</h2>

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
            className="w-full bg-black border border-gray-700 p-3 rounded-md"
          />

          <input
            placeholder="Role"
            value={form.role}
            onChange={(e)=>setForm({...form,role:e.target.value})}
            className="w-full bg-black border border-gray-700 p-3 rounded-md"
          />

          <input
            placeholder="College"
            value={form.college}
            onChange={(e)=>setForm({...form,college:e.target.value})}
            className="w-full bg-black border border-gray-700 p-3 rounded-md"
          />

          <input
            placeholder="Image URL"
            value={form.image}
            onChange={(e)=>setForm({...form,image:e.target.value})}
            className="w-full bg-black border border-gray-700 p-3 rounded-md"
          />

          <button
            type="submit"
            className="bg-white text-black px-6 py-2 rounded-md font-medium"
          >
            Add Leader
          </button>

        </form>

        {/* Leaders List */}

        <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-800">
            Total Leaders: {leaders.length}
          </div>

          {loading ? (
            <div className="p-10 text-gray-400">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-800">

              {leaders.map((leader)=>(
                <div
                  key={leader.id}
                  className="flex items-center justify-between p-6"
                >

                  <div className="flex items-center gap-4">

                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />

                    <div>
                      <div className="font-semibold">{leader.name}</div>
                      <div className="text-gray-400 text-sm">
                        {leader.role} • {leader.college}
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={()=>deleteLeader(leader.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  )
}