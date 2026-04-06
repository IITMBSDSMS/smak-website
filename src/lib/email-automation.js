import { Resend } from 'resend';
import { 
  getLMSWelcomeEmail, 
  getLMSInternalNotificationEmail, 
  getInvoiceEmail, 
  getKitAndSOPEmail,
  getEligibilityEmail
} from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'official@smakresearch.com';

export async function sendWelcomeEmail({ to, name }) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Welcome to SMAK LMS',
      html: getLMSWelcomeEmail(name),
    });
    return { success: true, data };
  } catch (error) {
    console.error('Welcome Email Error:', error);
    return { success: false, error };
  }
}

export async function sendInternalNotification({ name, course, email }) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: ['admin@smak.university'],
      subject: 'New Lead Captured - SMAK LMS',
      html: getLMSInternalNotificationEmail(name, course, email),
    });
    return { success: true, data };
  } catch (error) {
    console.error('Notification Email Error:', error);
    return { success: false, error };
  }
}

export async function sendInvoiceEmail({ to, name, invoiceId }) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'SMAK LMS - Payment Confirm & Invoice',
      html: getInvoiceEmail(name, invoiceId),
    });
    return { success: true, data };
  } catch (error) {
    console.error('Invoice Email Error:', error);
    return { success: false, error };
  }
}

export async function sendKitAndSOPEmail({ to, name }) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'SMAK - Your Welcome Kit & SOP',
      html: getKitAndSOPEmail(name),
    });
    return { success: true, data };
  } catch (error) {
    console.error('Kit Email Error:', error);
    return { success: false, error };
  }
}

export async function sendEligibilityEmail({ to, name, type }) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `SMAK - Your ${type} is Unlocked!`,
      html: getEligibilityEmail(name, type),
    });
    return { success: true, data };
  } catch (error) {
    console.error('Eligibility Email Error:', error);
    return { success: false, error };
  }
}
