import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@tugotugo.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Plantillas de email
export const emailTemplates = {
  establishmentApproved: (establishmentName: string) => ({
    subject: '¡Tu restaurante ha sido aprobado! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #22c55e;">¡Felicitaciones!</h1>
        <p>Tu restaurante <strong>${establishmentName}</strong> ha sido aprobado y ya está visible en TugoTugo.</p>
        <p>Ahora puedes:</p>
        <ul>
          <li>Crear packs de comida</li>
          <li>Publicar posts</li>
          <li>Recibir órdenes de clientes</li>
        </ul>
        <p>¡Gracias por unirte a nuestra misión de reducir el desperdicio de alimentos!</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Ir al Panel
        </a>
      </div>
    `,
  }),

  establishmentRejected: (establishmentName: string, reason?: string) => ({
    subject: 'Actualización sobre tu solicitud de restaurante',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Solicitud en revisión</h1>
        <p>Lamentamos informarte que tu restaurante <strong>${establishmentName}</strong> requiere más información.</p>
        ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
        <p>Por favor, contacta con nuestro equipo de soporte para más detalles.</p>
        <a href="${process.env.NEXTAUTH_URL}/contact" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Contactar Soporte
        </a>
      </div>
    `,
  }),

  newOrder: (orderDetails: { packTitle: string; quantity: number; total: number; pickupDate: string }) => ({
    subject: '¡Nueva orden recibida! 🛒',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #22c55e;">¡Nueva Orden!</h1>
        <p>Has recibido una nueva orden:</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Pack:</strong> ${orderDetails.packTitle}</p>
          <p><strong>Cantidad:</strong> ${orderDetails.quantity}</p>
          <p><strong>Total:</strong> $${orderDetails.total}</p>
          <p><strong>Fecha de recogida:</strong> ${orderDetails.pickupDate}</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/orders" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Ver Órdenes
        </a>
      </div>
    `,
  }),

  welcomeUser: (userName: string) => ({
    subject: '¡Bienvenido a TugoTugo! 🌱',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #22c55e;">¡Bienvenido, ${userName}!</h1>
        <p>Gracias por unirte a TugoTugo, la plataforma que conecta restaurantes con clientes para reducir el desperdicio de alimentos.</p>
        <p>Descubre packs de comida con descuento y ayuda al medio ambiente.</p>
        <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Explorar Packs
        </a>
      </div>
    `,
  }),
}
