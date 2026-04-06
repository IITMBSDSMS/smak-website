import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { name, email, entry_no, course } = await req.json()

  if (!email) {
    return Response.json({ error: "Email required" }, { status: 400 })
  }

  const firstName = name?.split(' ')[0] || "Scholar"

  try {
    // Email to STUDENT — notifying them their LOR is ready
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SMAK Research <official@smakresearch.com>",
      to: email,
      subject: `🎓 Your Letter of Recommendation is Ready — SMAK Research`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#050B14;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050B14;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(160deg,#0A1428,#0C1A30);border:1px solid rgba(34,197,254,0.2);border-radius:20px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg,#0A1E40,#0E2952);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:11px;letter-spacing:4px;color:#38BDF8;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Society for Medical Academia & Knowledge</div>
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">Your LOR is Ready</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#94A3B8;font-size:15px;line-height:1.7;margin:0 0 24px 0;">Dear <strong style="color:#FFFFFF;">${firstName}</strong>,</p>
              <p style="color:#94A3B8;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
                We are delighted to inform you that your <strong style="color:#38BDF8;">Letter of Recommendation</strong> has been officially approved by the SMAK Research administration for the <strong style="color:#FFFFFF;">${course || "SMAK"}</strong> program.
              </p>
              <p style="color:#94A3B8;font-size:15px;line-height:1.7;margin:0 0 32px 0;">
                Your official letter, bearing the program director's signature, is now ready for immediate download from your Student Dashboard.
              </p>
              
              <!-- CTA Box -->
              <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:24px;margin-bottom:32px;">
                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:3px;color:#38BDF8;text-transform:uppercase;font-weight:700;">Steps to Download Your LOR</p>
                <ol style="margin:0;padding-left:20px;color:#CBD5E1;font-size:14px;line-height:2;">
                  <li>Visit <a href="https://smakresearch.com/dashboard" style="color:#38BDF8;font-weight:600;">smakresearch.com/dashboard</a></li>
                  <li>Enter your Registration ID: <strong style="color:#FFFFFF;font-family:monospace;">${entry_no}</strong></li>
                  <li>Click the <strong style="color:#FFFFFF;">"Generate LOR"</strong> button under <em>Official Credentials</em></li>
                  <li>Your letter downloads instantly as a print-ready PDF!</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="https://smakresearch.com/dashboard?entry=${entry_no}" style="display:inline-block;background:linear-gradient(90deg,#1D4ED8,#0EA5E9);color:#FFFFFF;font-weight:700;font-size:14px;letter-spacing:1px;text-decoration:none;padding:14px 36px;border-radius:50px;text-transform:uppercase;">
                  Download My LOR →
                </a>
              </div>

              <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;">
                Congratulations on this achievement, ${firstName}. Your dedication and academic performance have earned you this recognition. We wish you the very best in your academic and professional journey.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="color:#334155;font-size:12px;margin:0 0 6px 0;">Society for Medical Academia & Knowledge</p>
              <p style="color:#334155;font-size:12px;margin:0;">
                <a href="mailto:official@smakresearch.com" style="color:#1D4ED8;text-decoration:none;">official@smakresearch.com</a> · 
                <a href="https://smakresearch.com" style="color:#1D4ED8;text-decoration:none;">smakresearch.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    })

    // Also notify admin for record keeping
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SMAK Research <official@smakresearch.com>",
      to: process.env.ADMIN_EMAIL || "official@smakresearch.com",
      subject: `LOR Approved & Notification Sent — ${entry_no}`,
      html: `<p>LOR approval email successfully dispatched to:<br/><b>${name}</b> (${email})<br/>Entry: ${entry_no}<br/>Course: ${course}</p>`
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error("LOR APPROVAL EMAIL ERROR:", error)
    return Response.json({ error: "Email sending failed" }, { status: 500 })
  }
}
