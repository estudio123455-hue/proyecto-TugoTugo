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

interface EmailVerificationData {
  to: string
  userName: string
  code: string
  type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
}

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData
) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: data.to,
    subject: `✅ Pedido Confirmado - ${data.packTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 ¡Pedido Confirmado!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu pack sorpresa te está esperando</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">¡Hola ${data.userName}!</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
            ¡Excelentes noticias! Tu pack sorpresa ha sido confirmado y pagado exitosamente. 
            Ya puedes planificar tu visita al restaurante para recogerlo.
          </p>
          
          <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h2 style="margin-top: 0; color: #1e293b; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">📦 Detalles del Pedido</h2>
            <div style="display: grid; gap: 10px; margin-top: 15px;">
              <p style="margin: 5px 0;"><strong style="color: #374151;">ID del Pedido:</strong> <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">#${data.orderId.slice(-8).toUpperCase()}</span></p>
              <p style="margin: 5px 0;"><strong style="color: #374151;">Pack:</strong> ${data.packTitle}</p>
              <p style="margin: 5px 0;"><strong style="color: #374151;">Cantidad:</strong> ${data.quantity} ${data.quantity === 1 ? 'pack' : 'packs'}</p>
              <p style="margin: 5px 0;"><strong style="color: #374151;">Total Pagado:</strong> <span style="font-size: 18px; color: #10b981; font-weight: bold;">$${data.totalAmount.toLocaleString('es-CO')}</span></p>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h2 style="margin-top: 0; color: #92400e; font-size: 18px;">📍 Información de Recogida</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 5px 0; font-size: 18px;"><strong style="color: #92400e;">🏪 ${data.establishmentName}</strong></p>
              <p style="margin: 5px 0; color: #374151;">📍 ${data.establishmentAddress}</p>
              <p style="margin: 15px 0 5px 0;"><strong style="color: #92400e;">📅 Fecha:</strong> ${new Date(
                data.pickupDate
              ).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
              <p style="margin: 5px 0;"><strong style="color: #92400e;">⏰ Horario:</strong> ${data.pickupTimeStart} - ${data.pickupTimeEnd}</p>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h2 style="margin-top: 0; color: #1e40af; font-size: 18px;">⚠️ Recordatorios Importantes</h2>
            <ul style="margin: 15px 0; padding-left: 25px; color: #374151; line-height: 1.8;">
              <li style="margin: 8px 0;">🕐 <strong>Llega puntual</strong> durante el horario especificado</li>
              <li style="margin: 8px 0;">🆔 <strong>Trae tu cédula</strong> y muestra este email de confirmación</li>
              <li style="margin: 8px 0;">🎁 <strong>El contenido es sorpresa</strong> - ¡disfruta descubriendo qué hay dentro!</li>
              <li style="margin: 8px 0;">📞 <strong>Si no puedes ir</strong>, contacta al restaurante con anticipación</li>
              <li style="margin: 8px 0;">💝 <strong>Trae tu propia bolsa</strong> para ser más eco-friendly</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 16px;">🌱 ¡Gracias por ayudar al planeta!</h3>
            <p style="margin: 0; color: #374151; font-size: 14px;">
              Con tu compra estás reduciendo el desperdicio alimentario y apoyando restaurantes locales
            </p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
            Te enviaremos un recordatorio antes de la hora de recogida. ¡Esperamos que disfrutes tu pack sorpresa! 🎁
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-top: 20px;">
            Saludos cordiales,<br>
            <strong style="color: #10b981;">El Equipo de FoodSave</strong> 🍃
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px;">
          <p style="margin: 5px 0;">Este email fue enviado a ${data.to}</p>
          <p style="margin: 5px 0; font-weight: bold; color: #10b981;">🍃 FoodSave - Salvando comida, un pack a la vez</p>
          <p style="margin: 10px 0 5px 0;">¿Necesitas ayuda? Visita nuestro <a href="#" style="color: #10b981;">centro de ayuda</a></p>
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
    subject: `🔔 Recordatorio: Tu pack está listo - ${data.packTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🔔 ¡Es hora de recoger!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu pack sorpresa te está esperando</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">¡Hola ${data.userName}!</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
            Este es un recordatorio amigable de que <strong>tu pack sorpresa está listo para recoger</strong>. 
            ¡No olvides pasar por el restaurante durante el horario indicado!
          </p>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h2 style="margin-top: 0; color: #92400e; font-size: 18px;">📦 Tu Pack Sorpresa</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 5px 0; font-size: 18px; color: #92400e;"><strong>🎁 ${data.packTitle}</strong></p>
              <p style="margin: 5px 0; color: #374151;">de <strong>${data.establishmentName}</strong></p>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #10b981; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h2 style="margin-top: 0; color: #065f46; font-size: 18px;">📍 Detalles de Recogida</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 10px 0; color: #374151;"><strong style="color: #065f46;">📍 Ubicación:</strong><br>${data.establishmentAddress}</p>
              <p style="margin: 10px 0; color: #374151;"><strong style="color: #065f46;">📅 Fecha:</strong><br>${new Date(
                data.pickupDate
              ).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
              <p style="margin: 10px 0; color: #374151;"><strong style="color: #065f46;">⏰ Horario:</strong><br><span style="font-size: 20px; color: #f59e0b; font-weight: bold;">${data.pickupTimeStart} - ${data.pickupTimeEnd}</span></p>
              ${data.establishmentPhone ? `<p style="margin: 10px 0; color: #374151;"><strong style="color: #065f46;">📞 Teléfono:</strong><br><a href="tel:${data.establishmentPhone}" style="color: #10b981; text-decoration: none;">${data.establishmentPhone}</a></p>` : ''}
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border: 2px solid #ef4444; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h2 style="margin-top: 0; color: #dc2626; font-size: 18px;">⚠️ No Olvides Llevar</h2>
            <ul style="margin: 15px 0; padding-left: 25px; color: #374151; line-height: 1.8;">
              <li style="margin: 8px 0;">🆔 <strong>Tu cédula o documento de identidad</strong></li>
              <li style="margin: 8px 0;">📧 <strong>Este email</strong> o tu confirmación de pedido</li>
              <li style="margin: 8px 0;">🕐 <strong>Llega puntual</strong> durante el horario de recogida</li>
              <li style="margin: 8px 0;">🛍️ <strong>Tu propia bolsa</strong> para ser eco-friendly</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border: 2px solid #6366f1; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #3730a3; font-size: 16px;">💡 Consejo FoodSave</h3>
            <p style="margin: 0; color: #374151; font-size: 14px;">
              Si tienes algún problema para llegar, contacta al restaurante lo antes posible. 
              ¡Ellos estarán encantados de ayudarte!
            </p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
            ¡Estamos emocionados de que descubras qué hay en tu pack sorpresa! 🎁 
            Gracias por ser parte de la solución contra el desperdicio alimentario.
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-top: 20px;">
            ¡Que disfrutes tu pack!<br>
            <strong style="color: #f59e0b;">El Equipo de FoodSave</strong> 🍃
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px;">
          <p style="margin: 5px 0;">Este recordatorio fue enviado a ${data.to}</p>
          <p style="margin: 5px 0; font-weight: bold; color: #f59e0b;">🍃 FoodSave - Salvando comida, un pack a la vez</p>
          <p style="margin: 10px 0 5px 0;">¿Tienes preguntas? Visita nuestro <a href="#" style="color: #f59e0b;">centro de ayuda</a></p>
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

export async function sendVerificationEmail(data: EmailVerificationData) {
  const getSubjectAndContent = () => {
    switch (data.type) {
      case 'REGISTRATION':
        return {
          subject: '🔐 Verifica tu cuenta - FoodSave',
          title: '¡Bienvenido a FoodSave!',
          subtitle: 'Verifica tu cuenta para comenzar',
          message: 'Para completar tu registro y empezar a ahorrar en comida deliciosa, necesitamos verificar tu dirección de email.',
          codeLabel: 'Tu código de verificación es:',
          instructions: 'Ingresa este código en la página de verificación para activar tu cuenta.',
          footer: '¡Estamos emocionados de tenerte en nuestra comunidad!'
        }
      case 'LOGIN':
        return {
          subject: '🔐 Código de acceso - FoodSave',
          title: '¡Hola de nuevo!',
          subtitle: 'Código de verificación para iniciar sesión',
          message: 'Alguien está intentando iniciar sesión en tu cuenta de FoodSave. Si fuiste tú, usa el código de abajo.',
          codeLabel: 'Tu código de acceso es:',
          instructions: 'Ingresa este código para completar el inicio de sesión.',
          footer: 'Si no fuiste tú, ignora este email y tu cuenta permanecerá segura.'
        }
      case 'PASSWORD_RESET':
        return {
          subject: '🔑 Restablece tu contraseña - FoodSave',
          title: 'Restablecer Contraseña',
          subtitle: 'Código para cambiar tu contraseña',
          message: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta de FoodSave.',
          codeLabel: 'Tu código de restablecimiento es:',
          instructions: 'Ingresa este código para crear una nueva contraseña.',
          footer: 'Si no solicitaste este cambio, ignora este email.'
        }
    }
  }

  const content = getSubjectAndContent()

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: data.to,
    subject: content.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${content.title}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${content.subtitle}</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">¡Hola ${data.userName}!</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
            ${content.message}
          </p>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 3px solid #0ea5e9; padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 16px; color: #0369a1; font-weight: 600;">${content.codeLabel}</p>
            <div style="background: white; padding: 20px; border-radius: 12px; border: 2px solid #0ea5e9; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #0369a1; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.code}</span>
            </div>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b;">Este código expira en 15 minutos</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #92400e; font-size: 16px;">📋 Instrucciones</h3>
            <p style="margin: 10px 0; color: #374151; line-height: 1.6;">
              ${content.instructions}
            </p>
            <ul style="margin: 15px 0; padding-left: 20px; color: #374151; line-height: 1.8;">
              <li style="margin: 5px 0;">⏰ <strong>El código expira en 15 minutos</strong></li>
              <li style="margin: 5px 0;">🔒 <strong>No compartas este código</strong> con nadie</li>
              <li style="margin: 5px 0;">💻 <strong>Úsalo solo en el sitio oficial</strong> de FoodSave</li>
            </ul>
          </div>

          ${data.type === 'LOGIN' ? `
          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border: 2px solid #ef4444; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">🛡️ Seguridad</h3>
            <p style="margin: 0; color: #374151; font-size: 14px;">
              Si no fuiste tú quien intentó iniciar sesión, ignora este email. Tu cuenta permanece segura.
            </p>
          </div>
          ` : ''}
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 30px;">
            ${content.footer}
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-top: 20px;">
            Saludos cordiales,<br>
            <strong style="color: #6366f1;">El Equipo de FoodSave</strong> 🍃
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px;">
          <p style="margin: 5px 0;">Este código fue enviado a ${data.to}</p>
          <p style="margin: 5px 0; font-weight: bold; color: #6366f1;">🍃 FoodSave - Salvando comida, un pack a la vez</p>
          <p style="margin: 10px 0 5px 0;">¿Problemas? Visita nuestro <a href="#" style="color: #6366f1;">centro de ayuda</a></p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`${data.type} verification email sent successfully to ${data.to}`)
  } catch (error) {
    console.error(`Error sending ${data.type} verification email:`, error)
    throw error
  }
}
