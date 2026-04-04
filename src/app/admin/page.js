"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Admin() {

  const [tab, setTab] = useState("members")

  // Tab state: supports members, leaders, events
  const [members, setMembers] = useState([])
  const [leaders, setLeaders] = useState([])
  const [events, setEvents] = useState([])
  const [collabs, setCollabs] = useState([])
  const [mentors, setMentors] = useState([])
  const [scholars, setScholars] = useState([])

  const [boardMembers, setBoardMembers] = useState([])

  const [boardForm, setBoardForm] = useState({
    name: "",
    role: "",
    college: ""
  })

  const [boardImage, setBoardImage] = useState(null)

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [leaderForm, setLeaderForm] = useState({
    name: "",
    role: "",
    college: ""
  })

  const [leaderImage, setLeaderImage] = useState(null)
  const [editingLeaderId, setEditingLeaderId] = useState(null)
  const [editLeaderForm, setEditLeaderForm] = useState({
    name: "",
    role: "",
    college: ""
  })

  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    location: "",
    description: ""
  })
  const [eventImage, setEventImage] = useState(null)

  const [collabForm, setCollabForm] = useState({
    name: "",
    website: ""
  })

  const [collabLogo, setCollabLogo] = useState(null)

  const [mentorForm, setMentorForm] = useState({ name: "", role: "" })
  const [mentorImage, setMentorImage] = useState(null)

  const [scholarForm, setScholarForm] = useState({ name: "", role: "" })
  const [scholarImage, setScholarImage] = useState(null)

  useEffect(() => {
    fetchMembers()
    fetchLeaders()
    fetchEvents()
    fetchCollabs()
    fetchMentors()
    fetchScholars()
    fetchBoard()
  }, [])

  async function fetchMembers() {
    setLoading(true)

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) setMembers(data)

    setLoading(false)
  }

  async function fetchLeaders() {

    const { data, error } = await supabase
      .from("leaders")
      .select("*")
      .order("created_at", { ascending: true })

    if (!error) setLeaders(data)
  }

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false })

    if (!error) setEvents(data)
  }

  async function fetchCollabs() {
    const { data, error } = await supabase
      .from("collaborators")
      .select("*")
      .order("created_at", { ascending: true })
    if (!error) setCollabs(data)
  }

  async function fetchMentors() {
    const { data, error } = await supabase
      .from("research_mentors")
      .select("*")
      .order("created_at", { ascending: true })
    if (!error) setMentors(data)
  }

  async function fetchScholars() {
    const { data, error } = await supabase
      .from("research_scholars")
      .select("*")
      .order("created_at", { ascending: true })
    if (!error) setScholars(data)
  }

  async function fetchBoard() {
    const { data, error } = await supabase
      .from("board_members")
      .select("*")
      .order("created_at", { ascending: true })

    if (!error) setBoardMembers(data)
  }

  async function addLeader(e) {
    e.preventDefault()

    if (!leaderImage) return alert("Please upload a photo")

    const fileName = `${Date.now()}-${leaderImage.name}`

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("leaders")
      .upload(fileName, leaderImage)

    if (uploadError) {
      alert("Image upload failed")
      return
    }

    const { data } = supabase
      .storage
      .from("leaders")
      .getPublicUrl(fileName)

    const publicUrl = data.publicUrl

    const { error } = await supabase
      .from("leaders")
      .insert([
        {
          ...leaderForm,
          image: publicUrl
        }
      ])

    if (!error) {
      setLeaderForm({
        name: "",
        role: "",
        college: ""
      })
      setLeaderImage(null)
      fetchLeaders()
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

  async function updateLeader(id) {
    const { error } = await supabase
      .from("leaders")
      .update(editLeaderForm)
      .eq("id", id)

    if (!error) {
      setEditingLeaderId(null)
      fetchLeaders()
    }
  }

  async function addEvent(e) {
    e.preventDefault()

    let imageUrl = null

    if (eventImage) {
      const fileName = `${Date.now()}-${eventImage.name}`

      const { error: uploadError } = await supabase
        .storage
        .from("events")
        .upload(fileName, eventImage)

      if (uploadError) {
        alert("Image upload failed")
        return
      }

      const { data } = supabase
        .storage
        .from("events")
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    const { error } = await supabase
      .from("events")
      .insert([
        {
          ...eventForm,
          image: imageUrl
        }
      ])

    if (!error) {
      setEventForm({
        title: "",
        date: "",
        location: "",
        description: ""
      })
      setEventImage(null)
      fetchEvents()
    }
  }

  async function deleteEvent(id) {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)

    if (!error) {
      setEvents(events.filter(ev => ev.id !== id))
    }
  }

  async function addCollab(e) {
    e.preventDefault()

    if (!collabLogo) return alert("Please upload a logo")

    const fileName = `${Date.now()}-${collabLogo.name}`

    const { error: uploadError } = await supabase
      .storage
      .from("collaborators")
      .upload(fileName, collabLogo)

    if (uploadError) {
      alert("Logo upload failed")
      return
    }

    const { data } = supabase
      .storage
      .from("collaborators")
      .getPublicUrl(fileName)

    const publicUrl = data.publicUrl

    const { error } = await supabase
      .from("collaborators")
      .insert([
        {
          ...collabForm,
          logo: publicUrl
        }
      ])

    if (!error) {
      setCollabForm({
        name: "",
        website: ""
      })
      setCollabLogo(null)
      fetchCollabs()
    }
  }

  async function deleteCollab(id) {
    const { error } = await supabase
      .from("collaborators")
      .delete()
      .eq("id", id)
    if (!error) {
      setCollabs(collabs.filter(c => c.id !== id))
    }
  }

  async function addMentor(e) {
    e.preventDefault()
    if (!mentorImage) return alert("Upload mentor photo")
    const fileName = `${Date.now()}-${mentorImage.name}`
    const { error: uploadError } = await supabase
      .storage
      .from("leaders")
      .upload(fileName, mentorImage)
    if (uploadError) {
      alert("Image upload failed")
      return
    }
    const { data } = supabase.storage.from("leaders").getPublicUrl(fileName)
    await supabase.from("research_mentors").insert([
      { ...mentorForm, image: data.publicUrl }
    ])
    setMentorForm({ name: "", role: "" })
    setMentorImage(null)
    fetchMentors()
  }

  async function deleteMentor(id) {
    await supabase.from("research_mentors").delete().eq("id", id)
    setMentors(mentors.filter(m => m.id !== id))
  }

  async function addScholar(e) {
    e.preventDefault()
    if (!scholarImage) return alert("Upload scholar photo")
    const fileName = `${Date.now()}-${scholarImage.name}`
    const { error: uploadError } = await supabase
      .storage
      .from("leaders")
      .upload(fileName, scholarImage)
    if (uploadError) {
      alert("Image upload failed")
      return
    }
    const { data } = supabase.storage.from("leaders").getPublicUrl(fileName)
    await supabase.from("research_scholars").insert([
      { ...scholarForm, image: data.publicUrl }
    ])
    setScholarForm({ name: "", role: "" })
    setScholarImage(null)
    fetchScholars()
  }

  async function deleteScholar(id) {
    await supabase.from("research_scholars").delete().eq("id", id)
    setScholars(scholars.filter(s => s.id !== id))
  }

  async function addBoard(e) {
    e.preventDefault()

    if (!boardImage) return alert("Upload board member photo")

    const fileName = `${Date.now()}-${boardImage.name}`

    const { error: uploadError } = await supabase
      .storage
      .from("board")
      .upload(fileName, boardImage)

    if (uploadError) {
      alert("Image upload failed")
      return
    }

    const { data } = supabase.storage.from("board").getPublicUrl(fileName)

    await supabase.from("board_members").insert([
      {
        ...boardForm,
        image: data.publicUrl
      }
    ])

    setBoardForm({
      name: "",
      role: "",
      college: ""
    })
    setBoardImage(null)

    fetchBoard()
  }

  async function deleteBoard(id) {
    const { error } = await supabase
      .from("board_members")
      .delete()
      .eq("id", id)

    if (!error) {
      setBoardMembers(boardMembers.filter(b => b.id !== id))
    }
  }

  async function deleteMember(id) {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Error deleting member: " + error.message)
    } else {
      setMembers(members.filter(m => m.id !== id))
    }
  }

  function exportCSV() {
    const headers = ["Name","Email","Phone","College","Year","Interest"]

    const rows = members.map(m => [
      m.name,
      m.email,
      m.phone,
      m.college,
      m.year,
      m.interest
    ])

    const csv =
      [headers, ...rows]
        .map(row => row.join(","))
        .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "smak-members.csv"
    a.click()
  }

  return (
    <main className="min-h-screen bg-black text-white flex justify-center py-16">
      <div className="w-full max-w-6xl px-6">


        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">

          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Members</div>
            <div className="text-2xl font-bold">{members.length}</div>
          </div>

          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Leaders</div>
            <div className="text-2xl font-bold">{leaders.length}</div>
          </div>

          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Events</div>
            <div className="text-2xl font-bold">{events.length}</div>
          </div>

          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Collaborators</div>
            <div className="text-2xl font-bold">{collabs.length}</div>
          </div>

        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab("members")}
            className={`px-4 py-2 rounded-md ${tab==="members" ? "bg-white text-black" : "bg-[#111]"}`}
          >
            Members
          </button>

          <button
            onClick={() => setTab("leaders")}
            className={`px-4 py-2 rounded-md ${tab==="leaders" ? "bg-white text-black" : "bg-[#111]"}`}
          >
            Leadership
          </button>

          <button
            onClick={() => setTab("events")}
            className={`px-4 py-2 rounded-md ${tab==="events" ? "bg-white text-black" : "bg-[#111]"}`}
          >
            Events
          </button>

          <button
            onClick={() => setTab("collabs")}
            className={`px-4 py-2 rounded-md ${tab==="collabs" ? "bg-white text-black" : "bg-[#111]"}`}
          >
            Collaborators
          </button>

          <button
            onClick={() => setTab("mentors")}
            className={`px-4 py-2 rounded-md ${tab==="mentors" ? "bg-white text-black" : "bg-[#111]"}`}
          >
            Mentors
          </button>

          <button
            onClick={() => setTab("scholars")}
            className={`px-4 py-2 rounded-md ${tab==="scholars" ? "bg-white text-black" : "bg-[#111]"}`}
          >
            Scholars
          </button>

          <button
            onClick={() => setTab("board")}
            className={`px-4 py-2 rounded-md ${tab==="board" ? "bg-white text-black" : "bg-[#111]"}`}
          >
            Board
          </button>
        </div>

        {/* MEMBERS TAB */}

        {tab === "members" && (

          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl overflow-hidden">

            <div className="px-6 py-4 border-b border-gray-800 flex justify-between">

              <span>Total Members: {members.length}</span>

              <div className="flex gap-3">

                <input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  className="bg-black border border-gray-700 px-3 py-2 rounded-md"
                />

                <button
                  onClick={exportCSV}
                  className="bg-white text-black px-4 py-2 rounded-md"
                >
                  Export CSV
                </button>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="bg-[#111827]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Entry No</th>
                    <th className="p-4">College</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Interest</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {members
                    .filter(m =>
                      m.name?.toLowerCase().includes(search.toLowerCase()) ||
                      m.email?.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((m, i) => (
                      <tr key={m.id} className="border-t border-gray-800">
                        <td className="p-4">{m.name}</td>
                        <td className="p-4">{m.email}</td>
                        <td className="p-4">{m.phone}</td>
                        <td className="p-4">{m.entry_no}</td>
                        <td className="p-4">{m.college}</td>
                        <td className="p-4">{m.year}</td>
                        <td className="p-4">{m.interest}</td>
                        <td className="p-4 flex gap-3">
                          {m.entry_no ? (
                            <>
                              <a
                                href={`/member/${m.entry_no}`}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                              >
                                Verify
                              </a>
                              <a
                                href={`/generate-id?entry=${m.entry_no}&name=${encodeURIComponent(m.name || "")}&phone=${encodeURIComponent(m.phone || "")}`}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                              >
                                ID Card
                              </a>
                            </>
                          ) : (
                            <span className="text-yellow-400 text-xs">No Entry ID</span>
                          )}
                          <button
                            onClick={() => deleteMember(m.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* LEADERS TAB */}

        {tab === "leaders" && (

          <div className="space-y-10">

            {/* Add Leader */}
            <form
              onSubmit={addLeader}
              className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 space-y-4"
            >

              <h2 className="text-xl font-semibold">Add Leader</h2>

              <input
                placeholder="Name"
                value={leaderForm.name}
                onChange={(e)=>setLeaderForm({...leaderForm,name:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                placeholder="Role"
                value={leaderForm.role}
                onChange={(e)=>setLeaderForm({...leaderForm,role:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                placeholder="College"
                value={leaderForm.college}
                onChange={(e)=>setLeaderForm({...leaderForm,college:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setLeaderImage(e.target.files[0])}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <button className="bg-white text-black px-6 py-2 rounded-md">
                Add Leader
              </button>

            </form>

            {/* Leaders List */}

            <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl">

              <div className="px-6 py-4 border-b border-gray-800">
                Total Leaders: {leaders.length}
              </div>

              {leaders.map((leader)=>(
                <div
                  key={leader.id}
                  draggable
                  className="flex items-center justify-between p-6 border-t border-gray-800 cursor-move"
                >

                  <div className="flex items-center gap-4">

                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    {editingLeaderId === leader.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          value={editLeaderForm.name}
                          onChange={(e)=>setEditLeaderForm({...editLeaderForm,name:e.target.value})}
                          className="bg-black border border-gray-700 px-2 py-1 rounded"
                        />
                        <input
                          value={editLeaderForm.role}
                          onChange={(e)=>setEditLeaderForm({...editLeaderForm,role:e.target.value})}
                          className="bg-black border border-gray-700 px-2 py-1 rounded"
                        />
                        <input
                          value={editLeaderForm.college}
                          onChange={(e)=>setEditLeaderForm({...editLeaderForm,college:e.target.value})}
                          className="bg-black border border-gray-700 px-2 py-1 rounded"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold">{leader.name}</div>
                        <div className="text-gray-400 text-sm">
                          {leader.role} • {leader.college}
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="flex gap-3">

                    {editingLeaderId === leader.id ? (
                      <button
                        onClick={()=>updateLeader(leader.id)}
                        className="text-green-400"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={()=>{
                          setEditingLeaderId(leader.id)
                          setEditLeaderForm({
                            name: leader.name,
                            role: leader.role,
                            college: leader.college
                          })
                        }}
                        className="text-blue-400"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={()=>deleteLeader(leader.id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>

        )}

        {/* EVENTS TAB */}

        {tab === "events" && (

          <div className="space-y-10">

            <form
              onSubmit={addEvent}
              className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 space-y-4"
            >

              <h2 className="text-xl font-semibold">Add Event</h2>

              <input
                placeholder="Event Title"
                value={eventForm.title}
                onChange={(e)=>setEventForm({...eventForm,title:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                type="date"
                value={eventForm.date}
                onChange={(e)=>setEventForm({...eventForm,date:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                placeholder="Location"
                value={eventForm.location}
                onChange={(e)=>setEventForm({...eventForm,location:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <textarea
                placeholder="Description"
                value={eventForm.description}
                onChange={(e)=>setEventForm({...eventForm,description:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setEventImage(e.target.files[0])}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <button className="bg-white text-black px-6 py-2 rounded-md">
                Add Event
              </button>

            </form>

            <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl">

              <div className="px-6 py-4 border-b border-gray-800">
                Total Events: {events.length}
              </div>

              {events.map((ev)=>(
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-6 border-t border-gray-800"
                >

                  <div className="flex items-center gap-4">

                    {ev.image && (
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-14 h-14 rounded-md object-cover"
                      />
                    )}

                    <div>
                      <div className="font-semibold">{ev.title}</div>
                      <div className="text-gray-400 text-sm">
                        {ev.date} • {ev.location}
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={()=>deleteEvent(ev.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>

          </div>

        )}

        {/* COLLABORATORS TAB */}

        {tab === "collabs" && (

          <div className="space-y-10">

            <form
              onSubmit={addCollab}
              className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 space-y-4"
            >

              <h2 className="text-xl font-semibold">Add Collaborator</h2>

              <input
                placeholder="Organization Name"
                value={collabForm.name}
                onChange={(e)=>setCollabForm({...collabForm,name:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                placeholder="Website URL"
                value={collabForm.website}
                onChange={(e)=>setCollabForm({...collabForm,website:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setCollabLogo(e.target.files[0])}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <button className="bg-white text-black px-6 py-2 rounded-md">
                Add Collaborator
              </button>

            </form>

            <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl">

              <div className="px-6 py-4 border-b border-gray-800">
                Total Collaborators: {collabs.length}
              </div>

              {collabs.map((c)=>(
                <div
                  key={c.id}
                  className="flex items-center justify-between p-6 border-t border-gray-800"
                >

                  <div className="flex items-center gap-4">

                    <img
                      src={c.logo}
                      alt={c.name}
                      className="w-12 h-12 object-contain"
                    />

                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-gray-400 text-sm">
                        {c.website}
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={()=>deleteCollab(c.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>

          </div>

        )}

        {/* MENTORS TAB */}
        {tab === "mentors" && (
          <div className="space-y-10">

            <form
              onSubmit={addMentor}
              className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold">Add Research Mentor</h2>

              <input
                placeholder="Name"
                value={mentorForm.name}
                onChange={(e)=>setMentorForm({...mentorForm,name:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                placeholder="Role"
                value={mentorForm.role}
                onChange={(e)=>setMentorForm({...mentorForm,role:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setMentorImage(e.target.files[0])}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <button className="bg-white text-black px-6 py-2 rounded-md">
                Add Mentor
              </button>
            </form>

            <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl">
              {mentors.map((m)=>(
                <div key={m.id} className="flex justify-between p-6 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <img src={m.image} className="w-12 h-12 rounded-full object-cover"/>
                    <div>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-gray-400 text-sm">{m.role}</div>
                    </div>
                  </div>
                  <button onClick={()=>deleteMentor(m.id)} className="text-red-400">Delete</button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SCHOLARS TAB */}
        {tab === "scholars" && (
          <div className="space-y-10">

            <form
              onSubmit={addScholar}
              className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold">Add Research Scholar</h2>

              <input
                placeholder="Name"
                value={scholarForm.name}
                onChange={(e)=>setScholarForm({...scholarForm,name:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                placeholder="Role"
                value={scholarForm.role}
                onChange={(e)=>setScholarForm({...scholarForm,role:e.target.value})}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setScholarImage(e.target.files[0])}
                className="w-full bg-black border border-gray-700 p-3 rounded-md"
              />

              <button className="bg-white text-black px-6 py-2 rounded-md">
                Add Scholar
              </button>
            </form>

            <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl">
              {scholars.map((s)=>(
                <div key={s.id} className="flex justify-between p-6 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <img src={s.image} className="w-12 h-12 rounded-full object-cover"/>
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-gray-400 text-sm">{s.role}</div>
                    </div>
                  </div>
                  <button onClick={()=>deleteScholar(s.id)} className="text-red-400">Delete</button>
                </div>
              ))}
            </div>

          </div>
        )}

      {/* BOARD TAB */}
      {tab === "board" && (
        <div className="space-y-10">

          <form
            onSubmit={addBoard}
            className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 space-y-4"
          >

            <h2 className="text-xl font-semibold">Add Board Member</h2>

            <input
              placeholder="Name"
              value={boardForm.name}
              onChange={(e)=>setBoardForm({...boardForm,name:e.target.value})}
              className="w-full bg-black border border-gray-700 p-3 rounded-md"
            />

            <input
              placeholder="Role"
              value={boardForm.role}
              onChange={(e)=>setBoardForm({...boardForm,role:e.target.value})}
              className="w-full bg-black border border-gray-700 p-3 rounded-md"
            />

            <input
              placeholder="College"
              value={boardForm.college}
              onChange={(e)=>setBoardForm({...boardForm,college:e.target.value})}
              className="w-full bg-black border border-gray-700 p-3 rounded-md"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e)=>setBoardImage(e.target.files[0])}
              className="w-full bg-black border border-gray-700 p-3 rounded-md"
            />

            <button className="bg-white text-black px-6 py-2 rounded-md">
              Add Board Member
            </button>

          </form>

          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl">

            <div className="px-6 py-4 border-b border-gray-800">
              Total Board Members: {boardMembers.length}
            </div>

            {boardMembers.map((b)=>(
              <div
                key={b.id}
                className="flex items-center justify-between p-6 border-t border-gray-800"
              >

                <div className="flex items-center gap-4">

                  <img
                    src={b.image}
                    alt={b.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-gray-400 text-sm">
                      {b.role} • {b.college}
                    </div>
                  </div>

                </div>

                <button
                  onClick={()=>deleteBoard(b.id)}
                  className="text-red-400"
                >
                  Delete
                </button>

              </div>
            ))}

          </div>

        </div>
      )}
      </div>
    </main>
  )
}