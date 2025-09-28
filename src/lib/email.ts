import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface OrderConfirmationEmailData {
  to: string
  userName: string
  orderId: string
  packTitle: string
  establishmentName: string
  establishmentAddress: string
  quantity: number
  totalAmount: number
  pickupDate: string
  pickupTimeStart: string
  pickupTimeEnd: string
}

interface PickupReminderEmailData {
  to: string
  userName: string
  packTitle: string
  establishmentName: string
  establishmentAddress: string
  establishmentPhone?: string
  pickupDate: string
  pickupTimeStart: string
  pickupTimeEnd: string
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: data.to,
    subject: `Order Confirmed - ${data.packTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Order Confirmed!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hi ${data.userName},</p>
          
          <p>Great news! Your surprise pack has been confirmed and is waiting for you.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #374151;">Order Details</h2>
            <p><strong>Order ID:</strong> #${data.orderId.slice(-8).toUpperCase()}</p>
            <p><strong>Pack:</strong> ${data.packTitle}</p>
            <p><strong>Quantity:</strong> ${data.quantity}</p>
            <p><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #92400e;">📍 Pickup Information</h2>
            <p><strong>${data.establishmentName}</strong></p>
            <p>${data.establishmentAddress}</p>
            <p><strong>Date:</strong> ${new Date(data.pickupDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
            <p><strong>Time:</strong> ${data.pickupTimeStart} - ${data.pickupTimeEnd}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1e40af;">Important Reminders</h2>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Please arrive during the specified pickup window</li>
              <li>Bring a valid ID and show this confirmation</li>
              <li>The pack contents are a surprise - enjoy discovering what's inside!</li>
              <li>If you can't make it, please contact the establishment</li>
            </ul>
          </div>
          
          <p>Thank you for helping reduce food waste and supporting local businesses! 🌱</p>
          
          <p>Best regards,<br>The FoodSave Team</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This email was sent to ${data.to}</p>
          <p>FoodSave - Reducing food waste, one pack at a time</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Order confirmation email sent successfully')
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}

export async function sendPickupReminderEmail(data: PickupReminderEmailData) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: data.to,
    subject: `Pickup Reminder - ${data.packTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1>🔔 Pickup Reminder</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hi ${data.userName},</p>
          
          <p>This is a friendly reminder that your surprise pack is ready for pickup!</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #92400e;">📦 Your Pack</h2>
            <p><strong>${data.packTitle}</strong></p>
            <p>from ${data.establishmentName}</p>
          </div>
          
          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #166534;">📍 Pickup Details</h2>
            <p><strong>Location:</strong> ${data.establishmentAddress}</p>
            <p><strong>Date:</strong> ${new Date(data.pickupDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
            <p><strong>Time:</strong> ${data.pickupTimeStart} - ${data.pickupTimeEnd}</p>
            ${data.establishmentPhone ? `<p><strong>Phone:</strong> ${data.establishmentPhone}</p>` : ''}
          </div>
          
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #dc2626;">⚠️ Don't Forget</h2>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Bring a valid ID</li>
              <li>Show this email or your order confirmation</li>
              <li>Arrive during the pickup window</li>
            </ul>
          </div>
          
          <p>We can't wait for you to discover what's in your surprise pack! 🎁</p>
          
          <p>Best regards,<br>The FoodSave Team</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This email was sent to ${data.to}</p>
          <p>FoodSave - Reducing food waste, one pack at a time</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Pickup reminder email sent successfully')
  } catch (error) {
    console.error('Error sending pickup reminder email:', error)
    throw error
  }
}
