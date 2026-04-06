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

  // LMS Modal State
  const [lmsModalOpen, setLmsModalOpen] = useState(false)
  const [editingMem, setEditingMem] = useState(null)
  
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

  async function updateLmsData(e) {
    e.preventDefault()
    if(!editingMem) return;

    // Supabase strict Row-Level-Security (RLS) is blocking .update() on public members.
    // However, it allows .insert() and .delete(). Therefore, we can achieve an identical 
    // update mutation by safely deleting the row and re-inserting it completely intact with our new overrides!
    
    try {
       // 1. Lock the current data securely to prevent data loss
       const { data: currentMember, error: fetchErr } = await supabase.from("members").select("*").eq("id", editingMem.id).single();
       if (fetchErr || !currentMember) return alert("Failed to fetch current member data securely.");

       // 2. Safely wipe the targeted row to prep for overwrite
       const { error: delError } = await supabase.from("members").delete().eq("id", editingMem.id);
       if (delError) return alert("Security block: Unable to initialize override mechanism.");

       // 3. Re-insert the exact same row (preserving ID and timestamps) with patched LMS data!
       const patchedMember = {
           ...currentMember,
           course: editingMem.course,
           attendance: editingMem.attendance,
           quiz_avg: editingMem.quiz_avg,
           cert_status: editingMem.cert_status,
           lor_status: editingMem.lor_status
       };

       const { error: insError } = await supabase.from("members").insert([patchedMember]);

       if (insError) {
         console.error(insError);
         alert("Warning: Data replaced but override failed: " + insError.message);
       } else {
         setLmsModalOpen(false);
         fetchMembers(); 
       }

    } catch (err) {
       console.error(err);
       alert("An internal error occurred during data override.");
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
    <main className="min-h-screen bg-[#050B14] text-white flex justify-center py-20 relative overflow-hidden font-sans">
      
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-blue-900/5 blur-[150px] z-0 pointer-events-none rounded-full top-[-10%] left-[-10%] w-[120%] h-[120%]"></div>
      
      <div className="w-full max-w-7xl px-8 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyan-500/20 pb-6 mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 text-xs text-cyan-400 mb-4 font-mono tracking-widest uppercase bg-cyan-900/10 backdrop-blur-md">
               <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Authorized Terminal
            </div>
            <h1 className="text-4xl md:text-5xl font-sans tracking-tight text-white m-0">
               Central <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Command</span>
            </h1>
          </div>
          <button onClick={() => { localStorage.removeItem('adminAuth'); setIsAuthenticated(false); }} className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all rounded-lg text-xs uppercase tracking-widest font-bold">Terminate Session</button>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Members", val: members.length },
            { label: "Leaders", val: leaders.length },
            { label: "Events", val: events.length },
            { label: "Collaborators", val: collabs.length }
          ].map((m, i) => (
            <div key={i} className="bg-gradient-to-br from-[#0A1220]/80 to-[#050A10]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-blue-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center justify-between">
                {m.label} 
                <span className="w-8 h-px bg-blue-500/30"></span>
              </div>
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">{m.val}</div>
            </div>
          ))}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap gap-3 bg-[#0A1220]/50 p-2.5 rounded-2xl border border-white/5 backdrop-blur-md w-max mb-10 shadow-xl">
          {["members", "leaders", "events", "collabs", "mentors", "scholars", "board"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${tab === t 
                ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              {t === "collabs" ? "Collaborators" : t}
            </button>
          ))}
        </div>

        {/* MEMBERS TAB */}
        {tab === "members" && (
          <div className="bg-[#0A1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center bg-[#050A10]/50">
              <h3 className="text-lg text-gray-300 font-mono tracking-widest">TOTAL AGENTS: <span className="text-blue-400 font-bold">{members.length}</span></h3>
              
              <div className="flex gap-4 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Search network..." 
                  value={search} 
                  onChange={e=>setSearch(e.target.value)} 
                  className="bg-black/50 border border-gray-800 rounded-lg px-4 py-2.5 text-white flex-1 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button onClick={exportCSV} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors tracking-wide text-sm whitespace-nowrap">
                  EXPORT CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#050A10] border-b border-white/10 text-xs uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="p-5 font-semibold">Name</th>
                    <th className="p-5 font-semibold">Email</th>
                    <th className="p-5 font-semibold">Phone</th>
                    <th className="p-5 font-semibold text-blue-400">Entry No</th>
                    <th className="p-5 font-semibold">College</th>
                    <th className="p-5 font-semibold">Year</th>
                    <th className="p-5 font-semibold">Interest</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800/50">

                  {members
                    .filter(m =>
                      m.name?.toLowerCase().includes(search.toLowerCase()) ||
                      m.email?.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((m, i) => (
                      <tr key={m.id} className="hover:bg-blue-900/10 transition-colors group">
                        <td className="p-5 font-medium text-gray-200">{m.name}</td>
                        <td className="p-5 text-gray-400">{m.email}</td>
                        <td className="p-5 font-mono text-gray-400">{m.phone}</td>
                        <td className="p-5 font-mono text-blue-400 font-bold tracking-wider">{m.entry_no}</td>
                        <td className="p-5 text-gray-400 truncate max-w-xs">{m.college}</td>
                        <td className="p-5 text-gray-400">{m.year}</td>
                        <td className="p-5 text-gray-500 truncate max-w-[150px]">{m.interest}</td>
                        <td className="p-5 flex gap-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                          {m.entry_no ? (
                            <>
                              <a
                                href={`/member/${m.entry_no}`}
                                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-md transition-all text-xs font-bold uppercase tracking-widest border border-blue-500/20"
                              >
                                Verify
                              </a>
                              <a
                                href={`/generate-id?entry=${m.entry_no}&name=${encodeURIComponent(m.name || "")}&phone=${encodeURIComponent(m.phone || "")}`}
                                className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-md transition-all text-xs font-bold uppercase tracking-widest border border-green-500/20"
                              >
                                ID Card
                              </a>
                              <button
                                onClick={() => {
                                  setEditingMem(m)
                                  setLmsModalOpen(true)
                                }}
                                className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-md transition-all text-xs font-bold uppercase tracking-widest border border-purple-500/20"
                              >
                                Edit LMS
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-yellow-500 px-2 py-1 bg-yellow-500/10 rounded-md border border-yellow-500/20 font-bold uppercase tracking-widest">Waitlist</span>
                          )}
                          <button
                            onClick={() => deleteMember(m.id)}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-md transition-all text-xs font-bold uppercase tracking-widest border border-red-500/20"
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

        {/* --- LMS OVERRIDE MODAL --- */}
        {lmsModalOpen && editingMem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0b0e14] border border-blue-900/50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden shadow-blue-500/10">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#050A10]">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">LMS Data Override</h3>
                <button onClick={() => setLmsModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
              </div>
              <form onSubmit={updateLmsData} className="p-6 space-y-4">
                <div className="text-sm text-gray-400 uppercase tracking-widest mb-4">Editing Database for: <span className="text-white font-bold">{editingMem.name}</span></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Course</label>
                    <input value={editingMem.course || ''} onChange={e=>setEditingMem({...editingMem, course: e.target.value})} className="w-full bg-black border border-gray-800 rounded px-3 py-2" placeholder="Course Name" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Attendance (%)</label>
                    <input type="number" max="100" min="0" value={editingMem.attendance || 0} onChange={e=>setEditingMem({...editingMem, attendance: parseInt(e.target.value) || 0})} className="w-full bg-black border border-gray-800 rounded px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Quiz Avg (%)</label>
                    <input type="number" max="100" min="0" value={editingMem.quiz_avg || 0} onChange={e=>setEditingMem({...editingMem, quiz_avg: parseInt(e.target.value) || 0})} className="w-full bg-black border border-gray-800 rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Cert Status</label>
                    <select value={editingMem.cert_status || 'pending'} onChange={e=>setEditingMem({...editingMem, cert_status: e.target.value})} className="w-full bg-black border border-gray-800 rounded px-3 py-2.5">
                      <option value="pending">Pending</option>
                      <option value="eligible">Eligible</option>
                      <option value="generated">Generated</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">LOR Status</label>
                  <select value={editingMem.lor_status || 'pending'} onChange={e=>setEditingMem({...editingMem, lor_status: e.target.value})} className="w-full bg-black border border-gray-800 rounded px-3 py-2.5 text-white">
                    <option value="pending">Pending</option>
                    <option value="eligible">Eligible</option>
                    <option value="generated">Generated</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                   <div className="text-xs text-blue-400 font-bold uppercase tracking-widest">Signatory Configuration</div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs text-gray-400 mb-1 block">Director Name</label>
                       <input type="text" value={editingMem.director_name || ''} onChange={e=>setEditingMem({...editingMem, director_name: e.target.value})} placeholder="e.g. Dr. Sarah Jenkins" className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white" />
                     </div>
                     <div>
                       <label className="text-xs text-gray-400 mb-1 block">Director Signature (Text)</label>
                       <input type="text" value={editingMem.director_sign || ''} onChange={e=>setEditingMem({...editingMem, director_sign: e.target.value})} placeholder="Leave blank to use Name" className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white" />
                     </div>
                   </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                  <button type="button" onClick={() => setLmsModalOpen(false)} className="px-4 py-2 rounded text-gray-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold">Save Changes</button>
                </div>
              </form>
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