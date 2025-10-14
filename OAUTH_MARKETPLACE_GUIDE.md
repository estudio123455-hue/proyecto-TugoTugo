# 🔄 Guía OAuth para Marketplace - MercadoPago

## 🎯 **Cuándo usar OAuth**

### **Aplicación Simple (Actual)** ✅
- Un solo negocio (TugoTugo)
- Credenciales fijas
- Pagos directos

### **Marketplace (Futuro)** 🔄
- Múltiples restaurantes
- Cada uno con su cuenta MercadoPago
- Split de comisiones

## 🔧 **Implementación OAuth**

### **1. Configuración de Aplicación**
```typescript
// Credenciales OAuth
const OAUTH_CONFIG = {
  client_id: process.env.MERCADOPAGO_CLIENT_ID!,
  client_secret: process.env.MERCADOPAGO_CLIENT_SECRET!,
  redirect_uri: `${process.env.NEXTAUTH_URL}/api/mercadopago/oauth/callback`
};
```

### **2. Endpoint de Autorización**
```typescript
// src/app/api/mercadopago/oauth/authorize/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurant_id');
  
  const authUrl = new URL('https://auth.mercadopago.com/authorization');
  authUrl.searchParams.set('client_id', OAUTH_CONFIG.client_id);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('platform_id', 'mp');
  authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirect_uri);
  authUrl.searchParams.set('state', restaurantId); // Para identificar el restaurante
  
  return NextResponse.redirect(authUrl.toString());
}
```

### **3. Callback de Autorización**
```typescript
// src/app/api/mercadopago/oauth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // restaurant_id
  
  if (!code || !state) {
    return NextResponse.redirect('/error?message=authorization_failed');
  }
  
  try {
    // Intercambiar código por token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: OAUTH_CONFIG.client_id,
        client_secret: OAUTH_CONFIG.client_secret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: OAUTH_CONFIG.redirect_uri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    // Guardar token del restaurante
    await prisma.establishment.update({
      where: { id: state },
      data: {
        mercadopagoAccessToken: tokenData.access_token,
        mercadopagoRefreshToken: tokenData.refresh_token,
        mercadopagoUserId: tokenData.user_id,
        mercadopagoConnected: true
      }
    });
    
    return NextResponse.redirect('/restaurant/dashboard?connected=true');
    
  } catch (error) {
    return NextResponse.redirect('/error?message=token_exchange_failed');
  }
}
```

### **4. Refresh Token**
```typescript
// src/app/api/mercadopago/oauth/refresh/route.ts
export async function POST(request: NextRequest) {
  const { restaurant_id } = await request.json();
  
  const restaurant = await prisma.establishment.findUnique({
    where: { id: restaurant_id },
    select: { mercadopagoRefreshToken: true }
  });
  
  if (!restaurant?.mercadopagoRefreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 400 });
  }
  
  try {
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: OAUTH_CONFIG.client_id,
        client_secret: OAUTH_CONFIG.client_secret,
        grant_type: 'refresh_token',
        refresh_token: restaurant.mercadopagoRefreshToken
      })
    });
    
    const tokenData = await response.json();
    
    // Actualizar token
    await prisma.establishment.update({
      where: { id: restaurant_id },
      data: {
        mercadopagoAccessToken: tokenData.access_token,
        mercadopagoRefreshToken: tokenData.refresh_token
      }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
```

### **5. Crear Pago con Split**
```typescript
// src/app/api/mercadopago/create-marketplace-preference/route.ts
export async function POST(request: NextRequest) {
  const { items, orderId, restaurantId } = await request.json();
  
  // Obtener token del restaurante
  const restaurant = await prisma.establishment.findUnique({
    where: { id: restaurantId },
    select: { mercadopagoAccessToken: true, mercadopagoUserId: true }
  });
  
  if (!restaurant?.mercadopagoAccessToken) {
    return NextResponse.json({ error: 'Restaurant not connected' }, { status: 400 });
  }
  
  // Usar token del restaurante
  const client = new MercadoPagoConfig({
    accessToken: restaurant.mercadopagoAccessToken,
  });
  
  const preference = new Preference(client);
  
  const totalAmount = items.reduce((sum: number, item: any) => 
    sum + (item.unit_price * item.quantity), 0
  );
  
  const marketplaceFee = totalAmount * 0.10; // 10% comisión TugoTugo
  
  const preferenceData = {
    items,
    marketplace_fee: marketplaceFee,
    collector_id: restaurant.mercadopagoUserId,
    external_reference: orderId,
    // ... resto de configuración
  };
  
  const result = await preference.create({ body: preferenceData });
  
  return NextResponse.json({
    id: result.id,
    init_point: result.init_point,
    marketplace_fee: marketplaceFee
  });
}
```

### **6. Actualizar Modelo de Base de Datos**
```prisma
model Establishment {
  // ... campos existentes
  
  // OAuth MercadoPago
  mercadopagoAccessToken  String?
  mercadopagoRefreshToken String?
  mercadopagoUserId       String?
  mercadopagoConnected    Boolean @default(false)
  mercadopagoConnectedAt  DateTime?
}
```

### **7. Componente de Conexión**
```tsx
// src/components/restaurant/MercadoPagoConnect.tsx
export default function MercadoPagoConnect({ restaurantId }: { restaurantId: string }) {
  const handleConnect = () => {
    window.location.href = `/api/mercadopago/oauth/authorize?restaurant_id=${restaurantId}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conectar MercadoPago</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Conecta tu cuenta de MercadoPago para recibir pagos directamente.
        </p>
        <Button onClick={handleConnect}>
          Conectar con MercadoPago
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🎯 **Resumen**

### **Para TugoTugo Actual** ✅
- Usa credenciales simples (ya implementado)
- Un solo flujo de pago
- Más fácil de mantener

### **Para TugoTugo Marketplace** 🔄
- Implementa OAuth (guía de arriba)
- Split automático de comisiones
- Cada restaurante maneja sus pagos

### **Variables de Entorno OAuth**
```env
# OAuth (solo si implementas marketplace)
MERCADOPAGO_CLIENT_ID="APP-xxxxxxxxxxxxxxxx"
MERCADOPAGO_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## 🚀 **Recomendación**

1. **Ahora**: Usa credenciales simples
2. **Futuro**: Migra a OAuth cuando tengas múltiples restaurantes
3. **Gradual**: Puedes soportar ambos métodos simultáneamente
