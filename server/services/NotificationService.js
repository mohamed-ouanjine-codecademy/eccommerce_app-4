// server/services/NotificationService.js
import nodemailer from 'nodemailer';

export class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendRefundNotification(email, refundData) {
    const mailOptions = {
      from: `"Ecommerce Team" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Refund Request Update',
      html: this._refundTemplate(refundData)
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Sending email:', mailOptions);
      return { accepted: [email] };
    }

    return this.transporter.sendMail(mailOptions);
  }

  _refundTemplate({ amount, status, orderId }) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Refund Update for Order #${orderId}</h2>
        <p>Status: <strong>${status}</strong></p>
        <p>Amount: $${amount.toFixed(2)}</p>
        <p>If you have any questions, reply to this email.</p>
      </div>
    `;
  }

  async lowStockAlert(product) {
    // Implementation for inventory team notifications
  }

  // server/services/NotificationService.js
  async sendOrderConfirmation(userId, order) {
    // Add this method to handle order confirmations
    if (process.env.NODE_ENV === 'test') {
      return { accepted: [userId.toString()] };
    }

    const user = await User.findById(userId);
    // ... rest of your email sending logic
  }
}
