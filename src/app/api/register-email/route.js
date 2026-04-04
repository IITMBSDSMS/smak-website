import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {

  const { name, email, entry_no } = await req.json()

  if (!name || !email) {
    return Response.json({ error: "Missing required fields (name or email)" }, { status: 400 })
  }

  if (!entry_no) {
    return Response.json({ error: "Entry number not generated" }, { status: 400 })
  }

  try {

    // EMAIL TO ADMIN
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SMAK <official@smakresearch.com>",
      to: process.env.ADMIN_EMAIL || "official@smakresearch.com",
      subject: "New SMAK Member Registration",
      html: `
<div style="font-family:Arial">
<h2>New SMAK Member Registered</h2>
<p><b>Name:</b> ${name}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Entry No:</b> ${entry_no}</p>
</div>
`
    })

    // EMAIL TO USER
    const generateIdLink = `https://smakresearch.com/generate-id?entry=${encodeURIComponent(entry_no)}&name=${encodeURIComponent(name)}`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SMAK <official@smakresearch.com>",
      to: email,
      subject: "Welcome to SMAK Research Community",
      html: `
<div style="font-family:Arial;line-height:1.6">

<h2>Welcome to SMAK Research Community 🎓</h2>

<p>Hello ${name},</p>

<p>Thank you for registering with the <b>Society for Medical Academia & Knowledge (SMAK)</b>.</p>

<p>Your registration has been successfully completed.</p>

<p>Your SMAK Entry Number:</p>
<h2 style="color:#2563eb;margin:0">${entry_no}</h2>

<p style="margin-top:20px;">
👉 Connect with other SMAK members by joining our WhatsApp research community:
</p>

<a href="https://chat.whatsapp.com/DC7K2jXflcxIB2LvjGjHBV?mode=gi_t"
target="_blank"
style="background:#25D366;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">
Join SMAK WhatsApp Community
</a>

<p style="margin-top:25px;">
🎓 Generate your official SMAK Member ID Card:
</p>

<a href="${generateIdLink}"
style="background:#2563eb;color:white;padding:12px 22px;text-decoration:none;border-radius:8px;display:inline-block;margin-top:10px;font-weight:bold;">
Generate Your SMAK ID Card
</a>

<p style="margin-top:30px">
Regards,<br>
<b>SMAK Research Team</b><br>
official@smakresearch.com
</p>

</div>
`
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error("EMAIL ERROR:", error)
    return Response.json({ error: "Email sending failed" }, { status: 500 })
  }
}