"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function MemberPage(){

  const searchParams = useSearchParams()
  const entryId = searchParams.get("entry")

  const [member,setMember] = useState(null)

  useEffect(()=>{

    const loadMember = async () => {

      if(!entryId) return

      const { data } = await supabase
      .from("members")
      .select("*")
      .eq("entry_no", entryId)
      .single()

      setMember(data)

    }

    loadMember()

  },[entryId])

  if (!entryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Invalid verification link</p>
      </div>
    )
  }

  if(!member){
    return(
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading member verification...</p>
      </div>
    )
  }

  return(

    <div className="min-h-screen flex flex-col items-center justify-center gap-4">

      <h1 className="text-3xl font-bold text-green-600">
        Member Verified ✓
      </h1>

      <div className="border rounded p-6 text-center">

        <p className="text-lg font-semibold">{member.name}</p>
        <p>Entry No: {member.entry_no}</p>
        <p>Phone: {member.phone}</p>
        <p>Email: {member.email}</p>

      </div>

    </div>

  )

}