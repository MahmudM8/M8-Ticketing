const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with your API Key from Firebase config
sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendTicketEmail = functions.https.onCall(async (data, context) => {
  try {
    const msg = {
      to: data.attendeeEmail,
      from: functions.config().sendgrid.from,
      subject: `Your Ticket for ${data.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Your Ticket for ${data.eventName}</h2>
          <p>Hi ${data.attendeeName},</p>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Location:</strong> ${data.eventLocation}</p>
          <p><strong>Ticket #:</strong> ${data.ticketNumber}</p>
          <img src="${data.qrCodeUrl}" width="150" alt="QR Code"/>
        </div>
      `,
      attachments: [{
        content: data.qrCodeUrl.split(',')[1],
        filename: 'ticket-qr.png',
        type: 'image/png',
        disposition: 'attachment'
      }]
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});