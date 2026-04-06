// src/lib/emailTemplates.js

export const getConfirmationEmail = (name) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #00f0ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Application Received</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for submitting your application to the <strong>SMAK Campus Ambassador Program</strong>.</p>
    <p>We are thrilled to see your interest in joining India's First Medical Research Accelerator. Our leadership team is currently reviewing your profile.</p>
    <h3 style="color: #00f0ff;">Next Steps</h3>
    <ul>
      <li>Please ensure that the photo you provided during the application was a clear headshot. <em>If it wasn't, or you missed it, please reply directly to this email with your photo attached.</em></li>
      <li>Our team will get back to you within <strong>48-72 hours</strong> regarding the status of your application.</li>
    </ul>
    <p>We appreciate your patience and look forward to potentially having you on board!</p>
    <hr style="border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="font-size: 12px; color: #777;">
      Best regards,<br/>
      <strong>The SMAK Leadership Team</strong><br/>
      Society of Medical Academia & Knowledge
    </p>
  </div>
</div>
`;

export const getShortlistEmail = (name) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #00f0ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">You are Shortlisted!</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>Congratulations! Your application stood out, and we are excited to inform you that you have been <strong>shortlisted</strong> for the SMAK Campus Ambassador role.</p>
    <p>The next phase of our process involves a brief virtual interaction with our core leadership team to understand your vision and how we can best align.</p>
    <p>We will be sending a separate email shortly with a link to schedule your interview slot.</p>
    <p>Prepare well, and keep an eye on your inbox!</p>
    <hr style="border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="font-size: 12px; color: #777;">
      Best regards,<br/>
      <strong>The SMAK Leadership Team</strong>
    </p>
  </div>
</div>
`;

export const getInterviewEmail = (name, calendarLink = "https://calendly.com/smak-interviews") => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #00f0ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Interview Scheduling</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>Following up on our previous email, it's time to schedule your interview for the SMAK Campus Ambassador program.</p>
    <p>Please use the button below to pick a date and time that works best for you. Please note that slots are limited and booked on a first-come, first-served basis.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${calendarLink}" style="background-color: #00f0ff; color: #0b0e14; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Schedule Interview Now</a>
    </div>

    <p>Once you book your slot, you will receive an automatic calendar invite with the meeting link (Zoom/Google Meet) and detailed instructions.</p>
    <p>We look forward to speaking with you!</p>
    <hr style="border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="font-size: 12px; color: #777;">
      Best regards,<br/>
      <strong>The SMAK Leadership Team</strong>
    </p>
  </div>
</div>
`;

export const getSelectionEmail = (name) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #00f0ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Welcome to the Team!</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>It is our greatest pleasure to officially welcome you as a <strong>SMAK Campus Ambassador</strong>!</p>
    <p>We were highly impressed by your background, enthusiasm, and vision during our interaction. You are now part of a global collective of brilliant minds shaping the future of medical academia.</p>
    <p>You will soon receive an onboarding package detailing your responsibilities, access to our research portals, and an invitation to the official team communication channels.</p>
    <p>Let's build the future, together.</p>
    <hr style="border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="font-size: 12px; color: #777;">
      Best regards,<br/>
      <strong>The SMAK Leadership Team</strong>
    </p>
  </div>
</div>
`;

export const getLMSWelcomeEmail = (name) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #ff4e4e; margin: 0; font-size: 24px; text-transform: uppercase;">Welcome to SMAK LMS</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>We have successfully received your course application. Your learning journey is about to begin.</p>
    <p>Please complete your payment using the link provided on the dashboard to finalize your enrollment.</p>
  </div>
</div>
`;

export const getLMSInternalNotificationEmail = (name, course, email) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <h1 style="color: #ff4e4e; margin: 0; font-size: 20px; text-transform: uppercase;">New LMS Lead Captured</h1>
    <p>A new applicant has registered:</p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Course ID:</strong> ${course}</li>
    </ul>
    <p>Check the admin dashboard for details.</p>
  </div>
</div>
`;

export const getInvoiceEmail = (name, invoiceId) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #00f0ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Enrollment Confirmed</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are thrilled to officially welcome you aboard. Your payment was successful and your enrollment is confirmed.</p>
    <p>Your Payment Reference / Invoice ID is: <strong>${invoiceId}</strong></p>
    <p>You can track your progress and access documentation immediately via the Student Portal.</p>
    <hr style="border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="font-size: 12px; color: #777;">
      <strong>The SMAK Core Team</strong>
    </p>
  </div>
</div>
`;

export const getKitAndSOPEmail = (name) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #00f0ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Your Welcome Kit</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your learning journey begins now. Please find your essential onboarding resources below:</p>
    <ul style="line-height: 2;">
      <li><a href="#" style="color:#00f0ff; background:#0b0e14; padding:2px 8px; border-radius:4px; text-decoration:none;">Download Welcome Kit (PDF)</a></li>
      <li><a href="#" style="color:#00f0ff; background:#0b0e14; padding:2px 8px; border-radius:4px; text-decoration:none;">Review Operating Procedures (SOP)</a></li>
      <li><a href="https://chat.whatsapp.com/dummy" style="font-weight:bold; color:green;">Join the WhatsApp Community Group</a></li>
    </ul>
  </div>
</div>
`;

export const getEligibilityEmail = (name, type) => `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0b0e14; padding: 20px; text-align: center;">
    <h1 style="color: #00f0ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Document Unlocked</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #eaeaea;">
    <p>Dear <strong>${name}</strong>,</p>
    <p>Congratulations! Based on your recent performance, you have crossed the required threshold.</p>
    <p>Your <strong>${type}</strong> is now officially available for download.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://smakresearch.com/dashboard" style="background-color: #00f0ff; color: #0b0e14; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Access Student Portal</a>
    </div>
    <hr style="border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="font-size: 12px; color: #777;">
      <strong>The SMAK Core Team</strong>
    </p>
  </div>
</div>
`;
