require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'SMAK Admin <official@smakresearch.com>',
      to: ['official@smakresearch.com'], // Send to selves just to test api auth 
      subject: 'Debug Test Mail',
      html: '<h1>If you see this, the API key works!</h1>'
    });
    console.log('Success:', data);
  } catch (error) {
    console.error('Failure:', error);
  }
}

testEmail();
