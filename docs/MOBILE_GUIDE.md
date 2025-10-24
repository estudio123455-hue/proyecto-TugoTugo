# 📱 Guía de Componentes y Utilidades Móviles

## 🚀 Cómo Usar los Nuevos Componentes

### 1. Páginas con Layout Móvil

```tsx
import MobileLayoutWrapper from '@/components/MobileLayoutWrapper'

export default function MyPage() {
  return (
    <MobileLayoutWrapper showBottomNav={true}>
      <h1 className="title-responsive">Mi Página</h1>
      <p className="text-responsive">Contenido optimizado para móvil</p>
    </MobileLayoutWrapper>
  )
}
```

### 2. Botones Optimizados para Móvil

```tsx
import Button from '@/components/ui/Button'

// Botón con touch target óptimo
<Button 
  variant="primary" 
  size="lg" 
  fullWidth
  className="btn-mobile"
>
  Botón Móvil Perfecto
</Button>

// Botón con feedback táctil
<button className="btn-mobile tap-feedback">
  Click Me
</button>
```

### 3. Formularios Mobile-First

```tsx
import Input from '@/components/ui/Input'

<form className="spacing-mobile">
  <Input 
    label="Email"
    type="email"
    placeholder="tu@email.com"
    fullWidth
    className="input-mobile"
  />
  
  <Input 
    label="Teléfono"
    type="tel"
    fullWidth
    className="input-mobile"
  />
  
  <textarea 
    className="textarea-mobile w-full"
    placeholder="Mensaje..."
  />
  
  <Button fullWidth className="btn-mobile">
    Enviar
  </Button>
</form>
```

### 4. Bottom Navigation

```tsx
import { Home, Search, ShoppingCart, User } from '@/lib/icons'

<nav className="bottom-nav">
  <div className="flex justify-around items-center h-full">
    <a href="/" className="bottom-nav-item active">
      <Home className="bottom-nav-icon" />
      <span className="bottom-nav-label">Inicio</span>
    </a>
    <a href="/search" className="bottom-nav-item">
      <Search className="bottom-nav-icon" />
      <span className="bottom-nav-label">Buscar</span>
    </a>
    <a href="/cart" className="bottom-nav-item">
      <ShoppingCart className="bottom-nav-icon" />
      <span className="bottom-nav-label">Carrito</span>
    </a>
    <a href="/profile" className="bottom-nav-item">
      <User className="bottom-nav-icon" />
      <span className="bottom-nav-label">Perfil</span>
    </a>
  </div>
</nav>
```

## 🎯 Utilidades CSS Móviles

### Visibilidad Responsive

```tsx
// Oculto en móvil, visible en desktop
<div className="hidden-mobile">
  Sidebar de Desktop
</div>

// Solo visible en móvil
<div className="show-mobile">
  Menú Hamburguesa
</div>

// Oculto en desktop
<div className="hidden-desktop">
  Bottom Navigation
</div>

// Solo visible en desktop
<div className="show-desktop">
  Top Navigation
</div>
```

### Containers Responsive

```tsx
// Container con padding adaptativo
<div className="container-mobile">
  Contenido con márgenes perfectos
</div>

// Container estrecho (para formularios)
<div className="container-mobile-narrow">
  Formulario centrado
</div>
```

### Grids Móviles

```tsx
// Grid que colapsa en móvil
<div className="grid-mobile">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// Grid de 2 columnas en móvil
<div className="grid-mobile-2">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### Spacing Adaptativo

```tsx
// Padding que crece con el viewport
<div className="spacing-mobile">
  Contenido con padding perfecto
</div>

// Solo padding horizontal
<div className="spacing-mobile-x">
  Contenido
</div>

// Solo padding vertical
<div className="spacing-mobile-y">
  Contenido
</div>
```

### Tipografía Responsive

```tsx
// Título que escala
<h1 className="title-responsive">
  Título Principal
</h1>

// Subtítulo responsive
<h2 className="subtitle-responsive">
  Subtítulo
</h2>

// Texto adaptativo
<p className="text-responsive">
  Párrafo que se adapta al tamaño de pantalla
</p>

// Cuerpo optimizado para móvil
<p className="body-mobile">
  Texto de cuerpo con line-height perfecto
</p>
```

### Cards Móviles

```tsx
// Card con padding adaptativo
<div className="card-mobile">
  <h3>Título</h3>
  <p>Contenido</p>
</div>

// Card compacta
<div className="card-mobile-compact">
  Contenido compacto
</div>
```

### Listas Móviles

```tsx
<div className="list-mobile">
  <div className="list-item-mobile">
    Item 1 con feedback táctil
  </div>
  <div className="list-item-mobile">
    Item 2
  </div>
</div>
```

### Modales Móviles

```tsx
// Modal fullscreen en móvil
<div className="modal-mobile">
  <div className="spacing-mobile">
    Contenido del modal
  </div>
</div>

// Modal bottom sheet
<div className="modal-mobile-bottom">
  <div className="spacing-mobile">
    Opciones del bottom sheet
  </div>
</div>
```

### Tabs Móviles

```tsx
<div className="tabs-mobile">
  <button className="tab-mobile active">
    Tab 1
  </button>
  <button className="tab-mobile">
    Tab 2
  </button>
  <button className="tab-mobile">
    Tab 3
  </button>
</div>
```

### Touch Targets

```tsx
// Touch target estándar (44x44px)
<button className="touch-target">
  <Icon icon={Plus} />
</button>

// Touch target grande (56x56px)
<button className="touch-target-lg">
  <Icon icon={Star} />
</button>

// Feedback táctil
<button className="tap-feedback">
  Botón con escala
</button>

// Feedback suave
<button className="tap-feedback-soft">
  Botón con opacidad
</button>
```

### Safe Area (iPhone Notch)

```tsx
// Respeta el notch superior
<header className="safe-area-top">
  Header
</header>

// Respeta el área inferior
<nav className="bottom-nav safe-area-bottom">
  Navigation
</nav>
```

## 📋 Checklist de Optimización Móvil

### ✅ Touch Targets
- [ ] Todos los botones tienen min 44x44px
- [ ] Elementos clickeables tienen min 48x48px
- [ ] Hay espacio entre elementos táctiles

### ✅ Formularios
- [ ] Inputs tienen min-height: 48px
- [ ] Font-size: 16px (previene zoom en iOS)
- [ ] Labels claros y visibles
- [ ] Teclado apropiado (type="email", "tel", etc)

### ✅ Navegación
- [ ] Bottom nav fija en móvil
- [ ] Iconos grandes (24x24px)
- [ ] Labels descriptivos
- [ ] Estado activo visible

### ✅ Contenido
- [ ] Texto legible (min 16px)
- [ ] Line-height adecuado (1.5-1.6)
- [ ] Contraste suficiente (4.5:1)
- [ ] Imágenes responsive

### ✅ Performance
- [ ] Lazy loading de imágenes
- [ ] Componentes optimizados
- [ ] Transiciones suaves
- [ ] Sin layouts que salten

## 🎨 Ejemplos Completos

### Página de Producto Móvil

```tsx
export default function ProductPage() {
  return (
    <MobileLayoutWrapper showBottomNav>
      <div className="container-mobile spacing-mobile-y">
        {/* Hero Image */}
        <img 
          src="/product.jpg" 
          alt="Product"
          className="w-full rounded-lg"
        />
        
        {/* Info */}
        <div className="spacing-mobile-y">
          <h1 className="title-responsive">
            Nombre del Producto
          </h1>
          <p className="text-responsive text-gray-600">
            Descripción del producto
          </p>
        </div>
        
        {/* Price & CTA */}
        <div className="card-mobile">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold">$99.99</span>
            <Badge variant="success">Disponible</Badge>
          </div>
          <Button fullWidth className="btn-mobile">
            Agregar al Carrito
          </Button>
        </div>
      </div>
    </MobileLayoutWrapper>
  )
}
```

### Lista de Items Móvil

```tsx
export default function ItemsList() {
  return (
    <MobileLayoutWrapper>
      <div className="container-mobile spacing-mobile-y">
        <h1 className="title-responsive mb-6">
          Mis Items
        </h1>
        
        <div className="list-mobile">
          {items.map(item => (
            <div key={item.id} className="list-item-mobile">
              <div className="flex items-center gap-4">
                <img 
                  src={item.image} 
                  className="w-16 h-16 rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.price}</p>
                </div>
                <button className="touch-target tap-feedback">
                  <Icon icon={ChevronRight} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayoutWrapper>
  )
}
```

## 🔧 Configuración Adicional

### Meta Tags para Móvil

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
<meta name="theme-color" content="#22c55e">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

### PWA Manifest

```json
{
  "name": "TugoTugo",
  "short_name": "TugoTugo",
  "theme_color": "#22c55e",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [...]
}
```
