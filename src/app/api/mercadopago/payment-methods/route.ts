import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, PaymentMethod } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  }
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // credit_card, debit_card, digital_wallet, etc.

    const paymentMethod = new PaymentMethod(client);
    const methods = await paymentMethod.get();

    // Filtrar por tipo si se especifica
    let filteredMethods = methods;
    if (type) {
      filteredMethods = methods.filter((method: any) => method.payment_type_id === type);
    }

    // Agrupar por tipo de pago
    const methodsByType = filteredMethods.reduce((acc: any, method: any) => {
      const paymentType = method.payment_type_id;
      if (!acc[paymentType]) {
        acc[paymentType] = [];
      }
      
      acc[paymentType].push({
        id: method.id,
        name: method.name,
        payment_type_id: method.payment_type_id,
        status: method.status,
        thumbnail: method.thumbnail,
        secure_thumbnail: method.secure_thumbnail,
        processing_modes: method.processing_modes,
        min_allowed_amount: method.min_allowed_amount,
        max_allowed_amount: method.max_allowed_amount,
        settings: method.settings
      });
      
      return acc;
    }, {});

    // Estadísticas
    const stats = {
      total: filteredMethods.length,
      by_type: Object.keys(methodsByType).reduce((acc: any, type) => {
        acc[type] = methodsByType[type].length;
        return acc;
      }, {}),
      active: filteredMethods.filter((m: any) => m.status === 'active').length
    };

    return NextResponse.json({
      success: true,
      data: {
        methods: methodsByType,
        stats,
        // Métodos más populares para mostrar primero
        popular: filteredMethods.filter((m: any) => 
          ['visa', 'master', 'amex', 'mercadopago', 'rapipago', 'pagofacil'].includes(m.id)
        ).map((method: any) => ({
          id: method.id,
          name: method.name,
          payment_type_id: method.payment_type_id,
          thumbnail: method.thumbnail,
          secure_thumbnail: method.secure_thumbnail
        }))
      }
    });

  } catch (error: any) {
    console.error('Error obteniendo métodos de pago:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error obteniendo métodos de pago',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Endpoint para obtener un método específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_method_id } = body;

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'payment_method_id requerido' },
        { status: 400 }
      );
    }

    const paymentMethod = new PaymentMethod(client);
    const methods = await paymentMethod.get();
    
    const method = methods.find((m: any) => m.id === payment_method_id);
    
    if (!method) {
      return NextResponse.json(
        { error: 'Método de pago no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: method.id,
        name: method.name,
        payment_type_id: method.payment_type_id,
        status: method.status,
        thumbnail: method.thumbnail,
        secure_thumbnail: method.secure_thumbnail,
        processing_modes: method.processing_modes,
        min_allowed_amount: method.min_allowed_amount,
        max_allowed_amount: method.max_allowed_amount,
        settings: method.settings,
        additional_info_needed: method.additional_info_needed,
        deferred_capture: method.deferred_capture
      }
    });

  } catch (error: any) {
    console.error('Error obteniendo método de pago específico:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error obteniendo método de pago',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
