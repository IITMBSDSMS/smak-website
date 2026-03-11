import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()

    const { name, email, phone, college, year, interest } = body

    if (!name || !email || !phone || !college) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("members")
      .insert([
        { name, email, phone, college, year, interest }
      ])
      .select()
      .single()

    if (error) {
      console.log("Supabase error:", error)
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return Response.json({
      success: true,
      entry_no: data.entry_no,
      data
    })

  } catch (err) {
    console.log("Server error:", err)
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}