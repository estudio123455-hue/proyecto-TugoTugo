import nodemailer from 'nodemailer'

// Configuración del transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Interfaz para datos de email
interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

// Función principal para enviar emails
export async function sendEmail({ to, subject, html, text }: EmailData) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'TugoTugo <noreply@tugotugo.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback texto plano
    }

    const result = await transporter.sendMail(mailOptions)
    
    console.log('Email enviado exitosamente:', {
      to,
      subject,
      messageId: result.messageId
    })
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Templates de email
export const emailTemplates = {
  // Confirmación de orden
  orderConfirmation: (data: {
    userName: string
    orderNumber: string
    packTitle: string
    restaurantName: string
    pickupTime: string
    qrCode: string
    verificationCode: string
  }) => ({
    subject: `¡Tu orden ${data.orderNumber} está confirmada! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orden Confirmada - TugoTugo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #F59E0B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .qr-section { text-align: center; background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 ¡Orden Confirmada!</h1>
            <p>¡Hola ${data.userName}! Tu pack sorpresa está listo para recoger.</p>
          </div>
          
          <div class="content">
            <div class="details">
              <h2>📋 Detalles de tu orden</h2>
              <p><strong>Número de orden:</strong> ${data.orderNumber}</p>
              <p><strong>Pack:</strong> ${data.packTitle}</p>
              <p><strong>Restaurante:</strong> ${data.restaurantName}</p>
              <p><strong>Hora de recogida:</strong> ${data.pickupTime}</p>
            </div>
            
            <div class="qr-section">
              <h2>📱 Tu código QR</h2>
              <img src="${data.qrCode}" alt="Código QR" style="max-width: 200px;">
              <p><strong>Código de verificación:</strong> ${data.verificationCode}</p>
              <p>Presenta este QR o el código en el restaurante</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://tugotugo.vercel.app/orders/${data.orderNumber}" class="button">
                Ver mi orden
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡Gracias por ayudar a reducir el desperdicio alimentario! 🌍</p>
            <p>TugoTugo - Rescata comida, cuida el planeta</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Recordatorio de recogida
  pickupReminder: (data: {
    userName: string
    orderNumber: string
    restaurantName: string
    pickupTime: string
    restaurantAddress: string
  }) => ({
    subject: `⏰ Recordatorio: Recoge tu pack en ${data.restaurantName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recordatorio de Recogida - TugoTugo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #EF4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ ¡No olvides recoger tu pack!</h1>
            <p>Hola ${data.userName}, tu pack te está esperando</p>
          </div>
          
          <div class="content">
            <div class="reminder-box">
              <h2>📍 Información de recogida</h2>
              <p><strong>Restaurante:</strong> ${data.restaurantName}</p>
              <p><strong>Dirección:</strong> ${data.restaurantAddress}</p>
              <p><strong>Hora límite:</strong> ${data.pickupTime}</p>
              <p><strong>Orden:</strong> ${data.orderNumber}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://tugotugo.vercel.app/orders/${data.orderNumber}" class="button">
                Ver detalles de mi orden
              </a>
            </div>
            
            <p><strong>💡 Recuerda:</strong> Lleva tu código QR o el código de verificación para recoger tu pack.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Bienvenida a nuevo usuario
  welcome: (data: { userName: string, userEmail: string }) => ({
    subject: '🌱 ¡Bienvenido a TugoTugo!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a TugoTugo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #10B981; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 ¡Bienvenido a TugoTugo!</h1>
            <p>¡Hola ${data.userName}! Gracias por unirte a nuestra misión</p>
          </div>
          
          <div class="content">
            <p>Estamos emocionados de tenerte en nuestra comunidad de personas que cuidan el planeta rescatando comida deliciosa.</p>
            
            <div class="feature">
              <h3>🗺️ Explora restaurantes cerca</h3>
              <p>Descubre packs sorpresa con hasta 70% de descuento en tu zona</p>
            </div>
            
            <div class="feature">
              <h3>📱 Proceso súper fácil</h3>
              <p>Reserva, paga y recoge con tu código QR</p>
            </div>
            
            <div class="feature">
              <h3>🌍 Impacto real</h3>
              <p>Cada pack salvado evita 2.1 kg de CO₂ al ambiente</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://tugotugo.vercel.app/packs" class="button">
                Explorar packs disponibles
              </a>
            </div>
            
            <p>¡Comienza tu primera aventura gastronómica sostenible hoy mismo!</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

// Función para enviar email de confirmación de orden
export async function sendOrderConfirmation(orderData: any) {
  const template = emailTemplates.orderConfirmation(orderData)
  return await sendEmail({
    to: orderData.userEmail,
    subject: template.subject,
    html: template.html
  })
}

// Función para enviar recordatorio de recogida
export async function sendPickupReminder(reminderData: any) {
  const template = emailTemplates.pickupReminder(reminderData)
  return await sendEmail({
    to: reminderData.userEmail,
    subject: template.subject,
    html: template.html
  })
}

// Función para enviar email de bienvenida
export async function sendWelcomeEmail(userData: any) {
  const template = emailTemplates.welcome(userData)
  return await sendEmail({
    to: userData.userEmail,
    subject: template.subject,
    html: template.html
  })
}
