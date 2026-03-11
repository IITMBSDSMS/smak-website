"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function MemberVerifyComponent() {

  const { id } = useParams()

  const [member,setMember] = useState(null)
  const [loading,setLoading] = useState(true)

  useEffect(() => {

    async function fetchMember(){

      const { data,error } = await supabase
        .from("members")
        .select("*")
        .eq("entry_no", id)
        .single()

      if(!error){
        setMember(data)
      }

      setLoading(false)
    }

    if(id){
      fetchMember()
    }

  },[id])

  if(loading){
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if(!member){
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-red-400">
        Invalid Member
      </div>
    )
  }

  return (

    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="bg-[#0b0b0b] border border-gray-800 p-10 rounded-xl text-center max-w-md">

        <h1 className="text-2xl font-bold text-green-400 mb-4">
          ✔ Verified SMAK Member
        </h1>

        <div className="space-y-2">

          <p><b>Name:</b> {member.name}</p>

          <p><b>Entry No:</b> {member.entry_no}</p>

          <p><b>Email:</b> {member.email}</p>

          <p><b>Phone:</b> {member.phone}</p>

          <p><b>College:</b> {member.college}</p>

          <p><b>Year:</b> {member.year}</p>

        </div>

      </div>

    </div>

  )
}

export default function MemberVerify(){
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    }>
      <MemberVerifyComponent />
    </Suspense>
  )
}