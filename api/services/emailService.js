require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. Application Received (Acknowledgment to Provider)
const sendApplicationReceivedEmail = async (toEmail, name, skills) => {
  const mailOptions = {
    from: `"Handyman Recruitment" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Application Received - Handyman Hub`,
    html: `<h2>Hello ${name},</h2>
           <p>Thank you for applying as a provider for <b>${skills}</b>.</p>
           <p>Our team is reviewing your application. We will contact you soon.</p>`
  };
  await transporter.sendMail(mailOptions);
};

// 2. Approval Email (Credentials to Provider)
const sendApprovalEmail = async (toEmail, name, tempPassword) => {
  const mailOptions = {
    from: `"Handyman Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Application Approved!',
    html: `<h2>Welcome, ${name}!</h2>
           <p>Your account is ready. Login with:</p>
           <p><b>Email:</b> ${toEmail}<br/><b>Password:</b> ${tempPassword}</p>
           <p><a href="https://digital-handyman.vercel.app/provider/login">Provider Portal</a></p>`
  };
  await transporter.sendMail(mailOptions);
};

// 3. Booking Confirmation (ID to Customer)
const sendBookingConfirmation = async (toEmail, customerName, refId, serviceName) => {
  const mailOptions = {
    from: `"Handyman Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Booking Confirmed: ${refId}`,
    html: `<h2>Hello ${customerName},</h2>
           <p>We received your request for <b>${serviceName}</b>.</p>
           <p>Your Reference ID is: <b>${refId}</b></p>
           <p><a href="https://digital-handyman.vercel.app/track">Track Request</a></p>`
  };
  await transporter.sendMail(mailOptions);
  try {
  await transporter.sendMail(mailOptions);
  console.log('📧 Email sent to', toEmail);
} catch (err) {
  console.error('❌ Email sending failed:', err);
}
};

// 4. New Job Assignment (Details to Provider)
const sendJobAssignmentEmail = async (toEmail, providerName, refId, serviceName, date, time, address) => {
  const mailOptions = {
    from: `"Handyman Dispatch" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🔔 New Job: ${serviceName}`,
    html: `<h2>New Assignment</h2>
           <p><b>Job:</b> ${serviceName}<br/><b>Location:</b> ${address}<br/><b>Time:</b> ${date} at ${time}</p>
           <p><a href="https://digital-handyman.vercel.app/provider/login">View in Dashboard</a></p>`
  };
  await transporter.sendMail(mailOptions);
};

// 5. Completion Receipt (Payment to Customer)
const sendCompletionReceiptEmail = async (toEmail, customerName, refId, serviceName, price) => {
  const mailOptions = {
    from: `"Handyman Billing" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `✅ Receipt for ${serviceName}`,
    html: `<h2>Job Completed!</h2>
           <p>Hello ${customerName}, total due: <b>${price} ETB</b></p>
           <div style="background:#f1f5f9; padding:15px; border-radius:8px;">
             <p><b>CBE Transfer:</b><br/>Acc No: <b>${process.env.BANK_ACCOUNT_NUMBER || '1000...'}</b></p>
             <p>Reason: Ref ID ${refId}</p>
           </div>`
  };
  await transporter.sendMail(mailOptions);
};

// 6. Recovery: Lost IDs (Customer)
const sendLostIdsEmail = async (toEmail, name, ids) => {
  const mailOptions = {
    from: `"Handyman Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your Booking IDs`,
    html: `<h2>Hello ${name},</h2>
           <p>Booking IDs found: <b>${ids.join(', ')}</b></p>`
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { 
  sendApplicationReceivedEmail,
  sendApprovalEmail, 
  sendBookingConfirmation, 
  sendJobAssignmentEmail, 
  sendCompletionReceiptEmail, 
  sendLostIdsEmail 
};