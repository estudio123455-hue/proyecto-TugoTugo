# Sistema de Reseñas - Documentación Completa

## ✅ Implementación Completada

### Componentes Creados

#### 1. **StarRating.tsx** (`src/components/reviews/StarRating.tsx`)
Componente reutilizable para mostrar y seleccionar calificaciones de estrellas.

**Características:**
- ⭐ Calificación de 1-5 estrellas
- 🎨 3 tamaños: `sm`, `md`, `lg`
- 🖱️ Modo interactivo o solo lectura
- 📊 Opción de mostrar contador de reseñas
- ♿ Accesible (ARIA labels)
- 🎯 Hover effects para mejor UX

**Props:**
```typescript
interface StarRatingProps {
  rating: number              // Calificación actual (0-5)
  onRatingChange?: (rating: number) => void  // Callback al cambiar
  readonly?: boolean          // Solo lectura
  size?: 'sm' | 'md' | 'lg'  // Tamaño
  showCount?: boolean         // Mostrar contador
  count?: number              // Número de reseñas
}
```

#### 2. **ReviewForm.tsx** (`src/components/reviews/ReviewForm.tsx`)
Formulario para crear y editar reseñas.

**Características:**
- 📝 Formulario completo con validación
- ⭐ Selector de calificación interactivo
- 💬 Campo de comentario opcional (500 caracteres)
- 🔒 Requiere autenticación
- ✏️ Soporta edición de reseñas existentes
- 🔄 Actualización automática después de enviar
- ⚠️ Manejo de errores

**Funcionalidad:**
- Crear nueva reseña
- Editar reseña existente
- Validación de calificación (1-5 requerido)
- Límite de caracteres en comentario
- Redirección a login si no está autenticado

#### 3. **ReviewList.tsx** (`src/components/reviews/ReviewList.tsx`)
Lista completa de reseñas con resumen estadístico.

**Características:**
- 📊 Resumen de calificaciones con promedio
- 📈 Distribución de ratings (gráfico de barras)
- 👤 Reseña del usuario destacada
- 📝 Lista de reseñas de otros usuarios
- ✏️ Editar/eliminar propia reseña
- 🕐 Timestamps con formato relativo
- 🖼️ Avatares de usuarios
- 📭 Estado vacío amigable

**Secciones:**
1. **Resumen de Calificaciones**
   - Promedio general
   - Total de reseñas
   - Distribución por estrellas

2. **Reseña del Usuario** (si existe)
   - Destacada en color azul
   - Botones de editar/eliminar
   - Formulario de edición inline

3. **Formulario de Nueva Reseña** (si no tiene reseña)
   - Integrado en la misma sección

4. **Reseñas de Otros Usuarios**
   - Lista ordenada por fecha
   - Avatar y nombre de usuario
   - Calificación y comentario
   - Timestamp relativo

### APIs Implementadas

#### 1. **GET /api/reviews** (`src/app/api/reviews/route.ts`)
Obtener todas las reseñas de un establecimiento.

**Query Parameters:**
- `establishmentId` (requerido): ID del establecimiento

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "...",
        "rating": 5,
        "comment": "Excelente servicio",
        "createdAt": "2025-10-07T...",
        "updatedAt": "2025-10-07T...",
        "user": {
          "id": "...",
          "name": "Juan Pérez",
          "image": "https://..."
        }
      }
    ],
    "avgRating": 4.5,
    "totalReviews": 10
  }
}
```

#### 2. **POST /api/reviews** (`src/app/api/reviews/route.ts`)
Crear una nueva reseña.

**Body:**
```json
{
  "establishmentId": "...",
  "rating": 5,
  "comment": "Excelente servicio"
}
```

**Validaciones:**
- ✅ Usuario autenticado
- ✅ Rating entre 1-5
- ✅ Establecimiento existe
- ✅ Una reseña por usuario por establecimiento

**Nota:** Si el usuario ya tiene una reseña, se actualiza automáticamente.

#### 3. **PUT /api/reviews/[id]** (`src/app/api/reviews/[id]/route.ts`)
Actualizar una reseña existente.

**Body:**
```json
{
  "rating": 4,
  "comment": "Actualizado: Muy bueno"
}
```

**Validaciones:**
- ✅ Usuario autenticado
- ✅ Reseña pertenece al usuario
- ✅ Rating entre 1-5

#### 4. **DELETE /api/reviews/[id]** (`src/app/api/reviews/[id]/route.ts`)
Eliminar una reseña.

**Validaciones:**
- ✅ Usuario autenticado
- ✅ Reseña pertenece al usuario

### Integración en Página de Establecimiento

**Archivo:** `src/app/establecimiento/[id]/page.tsx`

**Cambios realizados:**
1. ✅ Importación de componentes de reseñas
2. ✅ Estado para reseñas, promedio y total
3. ✅ Fetch de reseñas al cargar establecimiento
4. ✅ Mostrar rating en header del establecimiento
5. ✅ Nueva sección "Reseñas y Opiniones"
6. ✅ Integración completa con ReviewList

**Ubicación de la sección:**
- Después de la sección de Packs
- Antes del Call to Action final

## 🎨 Diseño y UX

### Colores
- **Estrellas:** Amarillo (#FBBF24)
- **Reseña propia:** Azul claro (bg-blue-50)
- **Botones principales:** Naranja (#F97316)
- **Texto:** Gris oscuro (#111827)

### Responsive
- ✅ Mobile-first design
- ✅ Grid adaptativo para distribución de ratings
- ✅ Formulario optimizado para móviles
- ✅ Touch-friendly (botones de 44px mínimo)

### Accesibilidad
- ✅ ARIA labels en estrellas
- ✅ Focus states visibles
- ✅ Contraste de colores WCAG AA
- ✅ Navegación por teclado

## 📊 Modelo de Datos

**Prisma Schema** (ya existía):
```prisma
model Review {
  id              String        @id @default(cuid())
  rating          Int           // 1-5 estrellas
  comment         String?
  establishmentId String
  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([userId, establishmentId]) // Un usuario solo puede dejar una reseña por restaurante
  @@index([establishmentId])
  @@index([userId])
  @@index([rating])
}
```

**Restricciones:**
- ✅ Un usuario solo puede dejar una reseña por establecimiento
- ✅ Rating debe ser entre 1-5
- ✅ Comentario es opcional
- ✅ Cascada en eliminación de usuario o establecimiento

## 🔐 Seguridad

### Autenticación
- ✅ Todas las mutaciones requieren sesión activa
- ✅ Verificación de propiedad en edición/eliminación
- ✅ Redirección a login si no autenticado

### Validación
- ✅ Rating entre 1-5 (backend y frontend)
- ✅ Límite de caracteres en comentario (500)
- ✅ Sanitización de inputs
- ✅ Verificación de existencia de establecimiento

### Audit Log
- ✅ Registro de creación de reseñas
- ✅ Registro de actualizaciones
- ✅ Registro de eliminaciones

## 📦 Dependencias Instaladas

```json
{
  "date-fns": "^3.x",      // Formateo de fechas
  "lucide-react": "^0.x"   // Iconos (Star, Edit2, Trash2, etc.)
}
```

## 🚀 Uso

### Para Usuarios

1. **Ver reseñas:**
   - Navegar a cualquier página de establecimiento
   - Scroll hasta la sección "Reseñas y Opiniones"

2. **Dejar una reseña:**
   - Estar autenticado
   - Seleccionar calificación (1-5 estrellas)
   - Escribir comentario opcional
   - Click en "Publicar Reseña"

3. **Editar reseña:**
   - Click en botón de editar (lápiz)
   - Modificar calificación o comentario
   - Click en "Actualizar Reseña"

4. **Eliminar reseña:**
   - Click en botón de eliminar (papelera)
   - Confirmar eliminación

### Para Desarrolladores

**Usar StarRating en otro componente:**
```tsx
import StarRating from '@/components/reviews/StarRating'

// Solo lectura
<StarRating rating={4.5} readonly size="md" />

// Interactivo
<StarRating 
  rating={rating} 
  onRatingChange={setRating}
  size="lg"
/>

// Con contador
<StarRating 
  rating={4.5} 
  readonly 
  showCount 
  count={25}
/>
```

**Usar ReviewForm:**
```tsx
import ReviewForm from '@/components/reviews/ReviewForm'

// Nueva reseña
<ReviewForm 
  establishmentId="123"
  onSuccess={() => console.log('Reseña creada')}
/>

// Editar reseña
<ReviewForm 
  establishmentId="123"
  existingReview={{
    id: "456",
    rating: 4,
    comment: "Muy bueno"
  }}
  onSuccess={() => console.log('Reseña actualizada')}
  onCancel={() => setEditing(false)}
/>
```

**Usar ReviewList:**
```tsx
import ReviewList from '@/components/reviews/ReviewList'

<ReviewList
  establishmentId="123"
  reviews={reviews}
  averageRating={4.5}
  totalReviews={25}
/>
```

## 🧪 Testing

### Casos de Prueba

**Frontend:**
- [ ] Mostrar estrellas correctamente
- [ ] Seleccionar calificación interactivamente
- [ ] Enviar reseña con calificación
- [ ] Enviar reseña con comentario
- [ ] Editar reseña existente
- [ ] Eliminar reseña con confirmación
- [ ] Mostrar promedio correctamente
- [ ] Mostrar distribución de ratings
- [ ] Redirección a login si no autenticado

**Backend:**
- [ ] Crear reseña con datos válidos
- [ ] Rechazar reseña sin autenticación
- [ ] Rechazar rating inválido (<1 o >5)
- [ ] Actualizar reseña solo si es del usuario
- [ ] Eliminar reseña solo si es del usuario
- [ ] Calcular promedio correctamente
- [ ] Prevenir duplicados (una reseña por usuario)

## 📈 Mejoras Futuras

### Corto Plazo
- [ ] Ordenar reseñas (más recientes, mejor calificadas, etc.)
- [ ] Filtrar por calificación
- [ ] Paginación de reseñas
- [ ] Respuestas del establecimiento a reseñas
- [ ] Reportar reseñas inapropiadas

### Mediano Plazo
- [ ] Imágenes en reseñas
- [ ] "Útil" / "No útil" en reseñas
- [ ] Verificar compra antes de reseñar
- [ ] Notificaciones push de nuevas reseñas
- [ ] Estadísticas para establecimientos

### Largo Plazo
- [ ] Sistema de moderación automática
- [ ] Análisis de sentimiento en comentarios
- [ ] Recomendaciones basadas en reseñas
- [ ] Badges para reviewers frecuentes

## 🐛 Troubleshooting

### Error: "Cannot find module 'lucide-react'"
**Solución:** `npm install lucide-react`

### Error: "Cannot find module 'date-fns'"
**Solución:** `npm install date-fns`

### Las reseñas no se actualizan después de crear/editar
**Solución:** Verificar que `router.refresh()` se esté llamando después de la operación

### Error 401 al crear reseña
**Solución:** Verificar que el usuario esté autenticado con `useSession()`

### El promedio no se calcula correctamente
**Solución:** Verificar que todas las reseñas tengan rating válido (1-5)

## 📝 Notas Importantes

1. **Una reseña por usuario:** El sistema permite solo una reseña por usuario por establecimiento. Si intenta crear otra, se actualiza la existente.

2. **Cascada de eliminación:** Si se elimina un usuario o establecimiento, sus reseñas se eliminan automáticamente.

3. **Audit Log:** Todas las operaciones de reseñas se registran en el audit log para trazabilidad.

4. **Timestamps:** Se usa `date-fns` con locale español para mostrar fechas relativas ("hace 2 horas").

5. **Optimización:** Las reseñas se cargan junto con el establecimiento para evitar múltiples requests.

## ✅ Checklist de Implementación

- [x] Crear componente StarRating
- [x] Crear componente ReviewForm
- [x] Crear componente ReviewList
- [x] Crear API GET /api/reviews
- [x] Crear API POST /api/reviews
- [x] Crear API PUT /api/reviews/[id]
- [x] Crear API DELETE /api/reviews/[id]
- [x] Integrar en página de establecimiento
- [x] Instalar dependencias (date-fns, lucide-react)
- [x] Build exitoso
- [x] Commit y push a GitHub
- [x] Documentación completa

---

**Fecha de implementación:** 2025-10-07
**Versión:** 1.0.0
**Estado:** ✅ Completado y desplegado
