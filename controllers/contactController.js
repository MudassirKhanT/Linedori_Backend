import nodemailer from "nodemailer";

export const sendContactForm = async (req, res) => {
  const { name, email, subject, message, project } = req.body;

  if (!name || !email || !subject || !message || !project) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: `📩 New Inquiry Regarding: ${project}`,
      html: `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h2 style="color: #222; font-size: 22px; margin-bottom: 10px;">New Inquiry Received</h2>
      <p>Hello,</p>
      <p>You have received a new inquiry from your website regarding the project: <strong>${project}</strong>.</p>
      
      <h3 style="margin-top: 20px; color: #333;">Contact Details:</h3>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Subject:</strong> ${subject}</li>
      </ul>

      <h3 style="margin-top: 20px; color: #333;">Message:</h3>
      <p style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${message}</p>

      <p style="margin-top: 20px;">Please respond to the inquiry promptly. This message was automatically generated from your website's contact form.</p>

      <hr style="margin: 20px 0; border-color: #ccc;" />
      <p style="font-size: 12px; color: #555;">This email contains confidential information intended for the recipient only.</p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
