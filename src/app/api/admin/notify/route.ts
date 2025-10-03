import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/emailService'

// POST - Enviar notificación por email
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, recipientId, data } = body

    if (!type || !recipientId) {
      return NextResponse.json(
        { success: false, message: 'Tipo y destinatario requeridos' },
        { status: 400 }
      )
    }

    // Obtener email del destinatario
    let recipientEmail = ''
    let emailContent = { subject: '', html: '' }

    switch (type) {
      case 'establishment-approved': {
        const approvedEst = await prisma.establishment.findUnique({
          where: { id: recipientId },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        })

        if (!approvedEst) {
          return NextResponse.json(
            { success: false, message: 'Establecimiento no encontrado' },
            { status: 404 }
          )
        }

        recipientEmail = approvedEst.user.email
        emailContent = emailTemplates.establishmentApproved(approvedEst.name)
        break
      }

      case 'establishment-rejected': {
        const rejectedEst = await prisma.establishment.findUnique({
          where: { id: recipientId },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        })

        if (!rejectedEst) {
          return NextResponse.json(
            { success: false, message: 'Establecimiento no encontrado' },
            { status: 404 }
          )
        }

        recipientEmail = rejectedEst.user.email
        emailContent = emailTemplates.establishmentRejected(
          rejectedEst.name,
          data?.reason
        )
        break
      }

      case 'welcome-user': {
        const user = await prisma.user.findUnique({
          where: { id: recipientId },
        })

        if (!user) {
          return NextResponse.json(
            { success: false, message: 'Usuario no encontrado' },
            { status: 404 }
          )
        }

        recipientEmail = user.email
        emailContent = emailTemplates.welcomeUser(user.name || user.email)
        break
      }

      case 'custom': {
        // Email personalizado
        if (!data?.email || !data?.subject || !data?.html) {
          return NextResponse.json(
            { success: false, message: 'Email, asunto y contenido requeridos' },
            { status: 400 }
          )
        }

        recipientEmail = data.email
        emailContent = {
          subject: data.subject,
          html: data.html,
        }
        break
      }

      default:
        return NextResponse.json(
          { success: false, message: 'Tipo de notificación no válido' },
          { status: 400 }
        )
    }

    // Enviar email
    const result = await sendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notificación enviada exitosamente',
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Error al enviar notificación' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { success: false, message: 'Error al enviar notificación' },
      { status: 500 }
    )
  }
}
