import nodemailer from 'nodemailer'

// Log SMTP configuration (without password)
console.log('📧 [Email Config] SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com')
console.log('📧 [Email Config] SMTP Port:', process.env.SMTP_PORT || '587')
console.log('📧 [Email Config] SMTP User:', process.env.SMTP_USER ? '✅ Configured' : '❌ Missing')
console.log('📧 [Email Config] SMTP Password:', process.env.SMTP_PASSWORD ? '✅ Configured' : '❌ Missing')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface Establishment {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  category: string
  description?: string
  createdAt: Date
}

interface User {
  name?: string
  email: string
}

export async function sendRestaurantConfirmation(
  establishment: Establishment,
  user: User
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
        .status { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍃 FoodSave</h1>
          <h2>Solicitud de Restaurante Recibida</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${user.name || 'Estimado usuario'}</strong>,</p>
          
          <p>¡Gracias por registrar tu restaurante en FoodSave! Hemos recibido tu solicitud correctamente.</p>
          
          <div class="info-box">
            <h3>📋 RESUMEN DE TU SOLICITUD</h3>
            <div class="info-row">
              <span class="label">Nombre del Restaurante:</span> ${establishment.name}
            </div>
            <div class="info-row">
              <span class="label">Dirección:</span> ${establishment.address}
            </div>
            <div class="info-row">
              <span class="label">Teléfono:</span> ${establishment.phone || 'No proporcionado'}
            </div>
            <div class="info-row">
              <span class="label">Categoría:</span> ${establishment.category}
            </div>
            <div class="info-row">
              <span class="label">Email:</span> ${establishment.email || user.email}
            </div>
            <div class="info-row">
              <span class="label">Fecha de solicitud:</span> ${new Date(establishment.createdAt).toLocaleDateString('es-ES')}
            </div>
          </div>
          
          <div class="status">
            <h3>🔍 ESTADO ACTUAL</h3>
            <p>Tu solicitud ha sido aprobada automáticamente. ¡Ya puedes empezar a publicar!</p>
          </div>
          
          <div class="info-box">
            <h3>📧 PRÓXIMOS PASOS</h3>
            <ol>
              <li>Accede a tu dashboard de restaurante</li>
              <li>Crea tu primera publicación o pack sorpresa</li>
              <li>Tus clientes podrán encontrarte en la app</li>
            </ol>
          </div>
          
          <p>¿Tienes preguntas? Responde a este email y te ayudaremos.</p>
          
          <div class="footer">
            <p>Saludos,<br><strong>Equipo FoodSave</strong></p>
            <p style="font-size: 12px; color: #999;">
              Este es un email automático. Por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
FoodSave - Solicitud de Restaurante Recibida

Hola ${user.name || 'Estimado usuario'},

¡Gracias por registrar tu restaurante en FoodSave!

RESUMEN DE TU SOLICITUD:
- Nombre: ${establishment.name}
- Dirección: ${establishment.address}
- Teléfono: ${establishment.phone || 'No proporcionado'}
- Categoría: ${establishment.category}
- Email: ${establishment.email || user.email}

ESTADO ACTUAL:
Tu solicitud ha sido aprobada automáticamente. ¡Ya puedes empezar a publicar!

PRÓXIMOS PASOS:
1. Accede a tu dashboard
2. Crea tu primera publicación
3. Tus clientes podrán encontrarte

Saludos,
Equipo FoodSave
  `

  try {
    console.log('📧 [Restaurant Confirmation] Attempting to send email to:', user.email)
    console.log('📧 [Restaurant Confirmation] From:', process.env.SMTP_USER)
    
    const result = await transporter.sendMail({
      from: `"FoodSave" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `✅ Solicitud de Restaurante Recibida - ${establishment.name}`,
      text: textContent,
      html: htmlContent,
    })
    
    console.log('✅ [Restaurant Confirmation] Email sent successfully to:', user.email)
    console.log('✅ [Restaurant Confirmation] Message ID:', result.messageId)
    return { success: true }
  } catch (error) {
    console.error('❌ [Restaurant Confirmation] Error sending email:', error)
    console.error('❌ [Restaurant Confirmation] Error details:', error instanceof Error ? error.message : error)
    return { success: false, error }
  }
}

export async function sendRestaurantApproval(
  establishment: Establishment,
  user: User
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 5px; }
        .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Felicitaciones!</h1>
          <h2>Tu Restaurante Ha Sido Aprobado</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${user.name || 'Estimado usuario'}</strong>,</p>
          
          <div class="success-box">
            <h3>✅ ¡Excelentes noticias!</h3>
            <p>Tu restaurante <strong>${establishment.name}</strong> ha sido aprobado y ya está activo en FoodSave.</p>
          </div>
          
          <h3>🚀 YA PUEDES:</h3>
          <ul>
            <li>Publicar packs sorpresa con descuentos</li>
            <li>Crear ofertas especiales</li>
            <li>Recibir pedidos de clientes</li>
            <li>Reducir el desperdicio de comida</li>
          </ul>
          
          <h3>📱 COMIENZA AHORA:</h3>
          <ol>
            <li>Inicia sesión en tu dashboard</li>
            <li>Crea tu primer pack o publicación</li>
            <li>¡Empieza a vender y ayudar al planeta!</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">
              Ir a Mi Dashboard
            </a>
          </div>
          
          <div class="footer">
            <p>Bienvenido a FoodSave,<br><strong>Equipo FoodSave</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"FoodSave" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `🎉 ¡Tu Restaurante Ha Sido Aprobado! - ${establishment.name}`,
      html: htmlContent,
    })
    console.log('✅ Email de aprobación enviado a:', user.email)
    return { success: true }
  } catch (error) {
    console.error('❌ Error enviando email de aprobación:', error)
    return { success: false, error }
  }
}

export async function sendRestaurantRejection(
  establishment: Establishment,
  user: User,
  reason: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fee2e2; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Actualización de Solicitud</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${user.name || 'Estimado usuario'}</strong>,</p>
          
          <p>Lamentamos informarte que tu solicitud para el restaurante <strong>${establishment.name}</strong> no ha sido aprobada en este momento.</p>
          
          <div class="warning-box">
            <h3>📋 Razón:</h3>
            <p>${reason}</p>
          </div>
          
          <h3>🔄 ¿Qué puedes hacer?</h3>
          <ul>
            <li>Revisa la información proporcionada</li>
            <li>Corrige los datos necesarios</li>
            <li>Vuelve a enviar tu solicitud</li>
          </ul>
          
          <p>Si tienes preguntas, no dudes en contactarnos respondiendo a este email.</p>
          
          <div class="footer">
            <p>Saludos,<br><strong>Equipo FoodSave</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"FoodSave" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Actualización de Solicitud - ${establishment.name}`,
      html: htmlContent,
    })
    console.log('✅ Email de rechazo enviado a:', user.email)
    return { success: true }
  } catch (error) {
    console.error('❌ Error enviando email de rechazo:', error)
    return { success: false, error }
  }
}
