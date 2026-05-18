import nodemailer from "nodemailer";

// Configure reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465, // true for 465, false for other ports
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const styles = {
  container: `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; overflow: hidden;`,
  header: `background-color: #008060; padding: 30px 20px; text-align: center;`,
  headerTitle: `color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;`,
  content: `padding: 30px 20px; color: #333333; line-height: 1.6;`,
  heading: `color: #202223; margin-top: 0; font-size: 20px;`,
  paragraph: `margin-bottom: 20px; color: #5c5f62;`,
  button: `display: inline-block; padding: 12px 24px; background-color: #008060; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 20px 0;`,
  footer: `background-color: #f6f6f7; padding: 20px; text-align: center; font-size: 12px; color: #6d7175; border-top: 1px solid #e0e0e0;`,
  list: `padding-left: 20px; margin-bottom: 20px;`,
  listItem: `margin-bottom: 10px; color: #5c5f62;`
};

/**
 * Send Welcome Email
 */
export async function sendWelcomeEmail(email, shopName) {
  if (!email) {
    console.log("No email provided for welcome email");
    return;
  }

  const dashboardUrl = `${process.env.SHOPIFY_APP_URL}/app`;

  try {
    const info = await transporter.sendMail({
      from: `"Mean3 Review App Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to Mean3 Review App, ${shopName}! 🚀`,
      html: `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h1 style="${styles.headerTitle}">Mean3 Review App</h1>
          </div>
          <div style="${styles.content}">
            <h2 style="${styles.heading}">Welcome aboard!</h2>
            <p style="${styles.paragraph}">Hi there,</p>
            <p style="${styles.paragraph}">Thanks for installing <strong>Mean3 Review App</strong> on <strong>${shopName}</strong>! We're thrilled to have you with us.</p>
            
            <p style="${styles.paragraph}">You're now ready to start collecting and showcasing customer reviews to build trust and boost sales.</p>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" style="${styles.button}">Go to Dashboard</a>
            </div>

            <h3 style="${styles.heading}">Getting Started:</h3>
            <ul style="${styles.list}">
              <li style="${styles.listItem}">🚀 <strong>Explore your Dashboard:</strong> Manage all your reviews in one place.</li>
              <li style="${styles.listItem}">🎨 <strong>Customize:</strong> Enable the App Embed in your theme editor to match your store's look.</li>
              <li style="${styles.listItem}">📈 <strong>Grow:</strong> Watch your social proof grow!</li>
            </ul>

            <p style="${styles.paragraph}">If you have any questions or need help setting up, just reply to this email. We're here to help!</p>
            
            <p style="${styles.paragraph}">Best regards,<br>The Mean3 Review App Team</p>
          </div>
          <div style="${styles.footer}">
            <p>&copy; ${new Date().getFullYear()} Mean3 Review App. All rights reserved.</p>
            <p>Made with ❤️ for Shopify Merchants</p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

/**
 * Send Uninstall Email
 */
export async function sendUninstallEmail(email, shopName) {
  if (!email) {
    console.log("No email provided for uninstall email");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Mean3 Review App Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We're sorry to see you go... 😢`,
      html: `
        <div style="${styles.container}">
          <div style="${styles.header}; background-color: #d82c0d;">
            <h1 style="${styles.headerTitle}">Mean3 Review App</h1>
          </div>
          <div style="${styles.content}">
            <h2 style="${styles.heading}">Sad to see you go</h2>
            <p style="${styles.paragraph}">Hi there,</p>
            <p style="${styles.paragraph}">We noticed you uninstalled <strong>Mean3 Review App</strong> from <strong>${shopName}</strong>.</p>
            
            <p style="${styles.paragraph}">We're constantly trying to improve to better serve merchants like you. If you have a moment, we'd appreciate your honest feedback on why you decided to leave:</p>
            
            <ul style="${styles.list}">
              <li style="${styles.listItem}">Was it missing a feature?</li>
              <li style="${styles.listItem}">Was it too hard to use?</li>
              <li style="${styles.listItem}">Did you find a better alternative?</li>
            </ul>

            <p style="${styles.paragraph}">Simply reply to this email to let us know. Your feedback helps us build a better product.</p>

            <p style="${styles.paragraph}"><strong>Miss us already?</strong> You can anytime install the app again.</p>
            
            <p style="${styles.paragraph}">We hope to see you back someday!</p>
            
            <p style="${styles.paragraph}">Best regards,<br>The Mean3 Review App Team</p>
          </div>
          <div style="${styles.footer}">
            <p>&copy; ${new Date().getFullYear()} Mean3 Review App. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Uninstall email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending uninstall email:", error);
  }
}
