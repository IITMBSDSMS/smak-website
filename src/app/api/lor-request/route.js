import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "fallback_for_vercel");

export async function POST(req) {
  const { entry_no, name } = await req.json()

  if (!entry_no) {
    return Response.json({ error: "Entry number required" }, { status: 400 })
  }

  try {
    // EMAIL TO ADMIN
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SMAK <official@smakresearch.com>",
      to: process.env.ADMIN_EMAIL || "official@smakresearch.com",
      subject: `LOR Fast-Track Request: ${entry_no}`,
      html: `
<div style="font-family:Arial">
<h2>LOR Status Override Requested</h2>
<p>A member has explicitly requested validation for a Letter of Recommendation.</p>
<p><b>Member Name:</b> ${name || "Unknown"}</p>
<p><b>Entry No:</b> ${entry_no}</p>
<hr/>
<p>Navigate to your Admin Dashboard to verify their Attendance / Quiz thresholds, and manually switch their LOR Status to "Eligible" if they qualify.</p>
</div>
`
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error("LOR EMAIL ERROR:", error)
    return Response.json({ error: "Email sending failed" }, { status: 500 })
  }
}
