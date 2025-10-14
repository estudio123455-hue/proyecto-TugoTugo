import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar que es una notificación de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Tipo de notificación no soportado' });
    }

    const paymentId = body.data?.id;
    
    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pago no encontrado' }, { status: 400 });
    }

    // Obtener información del pago desde MercadoPago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    if (!paymentInfo) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    const orderId = paymentInfo.external_reference;
    const userId = paymentInfo.metadata?.user_id;

    // Actualizar el estado del pedido según el estado del pago
    if (orderId) {
      let orderStatus = 'pending';
      
      switch (paymentInfo.status) {
        case 'approved':
          orderStatus = 'paid';
          break;
        case 'rejected':
          orderStatus = 'cancelled';
          break;
        case 'pending':
        case 'in_process':
          orderStatus = 'pending';
          break;
        default:
          orderStatus = 'pending';
      }

      // Actualizar en la base de datos
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: orderStatus,
          paymentId: paymentId.toString(),
          paymentStatus: paymentInfo.status,
          paymentMethod: paymentInfo.payment_method_id || 'mercadopago',
          paidAmount: paymentInfo.transaction_amount || 0,
          updatedAt: new Date()
        }
      });

      // Si el pago fue aprobado, puedes agregar lógica adicional aquí
      if (paymentInfo.status === 'approved') {
        // Ejemplo: enviar email de confirmación, actualizar stock, etc.
        console.log(`Pago aprobado para orden ${orderId}`);
        
        // Opcional: Crear notificación para el usuario
        if (userId) {
          await prisma.userNotification.create({
            data: {
              userId: userId,
              title: 'Pago confirmado',
              message: `Tu pago para la orden ${orderId} ha sido confirmado`,
              type: 'payment_success',
              read: false
            }
          });
        }
      }
    }

    return NextResponse.json({ message: 'Webhook procesado correctamente' });

  } catch (error) {
    console.error('Error procesando webhook de MercadoPago:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

// Método GET para verificación del webhook (opcional)
export async function GET() {
  return NextResponse.json({ message: 'Webhook de MercadoPago activo' });
}
