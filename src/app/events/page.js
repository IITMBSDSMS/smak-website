"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Events() {

  const [events, setEvents] = useState([])

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) {
      setEvents(data)
    }

  }

  return (

    <div className="p-12">

      <h1 className="text-3xl font-bold mb-8">
        Events
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {events.map((event)=>(
          <div
            key={event.id}
            className="p-6 border rounded-lg hover:border-gray-400 transition"
          >

            <h3 className="font-semibold text-lg">
              {event.title}
            </h3>

            {event.date && (
              <p className="text-gray-400 text-sm mt-2">
                {event.date}
              </p>
            )}

            {event.location && (
              <p className="text-gray-500 text-sm">
                {event.location}
              </p>
            )}

            {event.description && (
              <p className="text-gray-500 mt-3 text-sm">
                {event.description}
              </p>
            )}

          </div>
        ))}

      </div>

      {events.length === 0 && (
        <p className="text-gray-500 mt-6">
          No events yet.
        </p>
      )}

    </div>
  )
}