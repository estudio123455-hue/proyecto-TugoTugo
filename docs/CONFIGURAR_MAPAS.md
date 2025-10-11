# 🗺️ Configurar Mapas en TugoTugo

## ⚠️ Problema: "No hay ubicaciones disponibles en el mapa"

Este mensaje aparece porque **no hay establecimientos con coordenadas** en la base de datos.

## ✅ Solución Rápida

### Opción 1: Crear Establecimientos desde el Dashboard

1. **Inicia sesión como administrador o restaurante**
2. **Ve al Dashboard** → Establecimientos
3. **Crea un nuevo establecimiento** con los siguientes datos:
   - Nombre
   - Dirección
   - **Latitud** (ejemplo: `4.7110` para Bogotá)
   - **Longitud** (ejemplo: `-74.0721` para Bogotá)
   - Categoría
   - Otros datos

4. **Crea packs** para ese establecimiento
5. **Recarga la página** `/packs` y cambia a vista "Mapa"

### Opción 2: Actualizar Coordenadas Automáticamente

Si ya tienes establecimientos pero sin coordenadas:

```bash
npm run update-coords
```

Este script asignará coordenadas aleatorias en Bogotá a todos los establecimientos que tengan coordenadas en 0.

## 📍 Cómo Obtener Coordenadas

### Método 1: Google Maps
1. Abre [Google Maps](https://maps.google.com)
2. Busca la dirección del restaurante
3. Click derecho en el marcador → "¿Qué hay aquí?"
4. Copia las coordenadas (ejemplo: `4.7110, -74.0721`)
   - Primer número = **Latitud**
   - Segundo número = **Longitud**

### Método 2: OpenStreetMap
1. Abre [OpenStreetMap](https://www.openstreetmap.org)
2. Busca la dirección
3. Click derecho → "Mostrar dirección"
4. Las coordenadas aparecen en la URL

### Método 3: Coordenadas de Ejemplo (Bogotá)

```javascript
// Centro de Bogotá
Latitud: 4.7110
Longitud: -74.0721

// Chapinero
Latitud: 4.6764
Longitud: -74.0480

// Usaquén
Latitud: 4.6951
Longitud: -74.0366

// Kennedy
Latitud: 4.6097
Longitud: -74.0817

// Suba
Latitud: 4.7395
Longitud: -74.0628
```

## 🔧 Verificar que Funciona

1. **Crea al menos un establecimiento** con coordenadas
2. **Crea un pack** para ese establecimiento
3. **Ve a** `/packs`
4. **Cambia a vista "Mapa"**
5. **Deberías ver** el marcador en el mapa

## 📱 Páginas con Mapas

- **`/packs`** - Vista de packs con toggle Mapa/Lista
- **`/map`** - Mapa principal con todos los establecimientos

## 🆘 Troubleshooting

### El mapa está en blanco
- ✅ Verifica que los establecimientos tengan `latitude` y `longitude` diferentes de 0
- ✅ Verifica que los packs estén activos (`isActive: true`)
- ✅ Verifica que los packs tengan cantidad > 0

### Los marcadores no aparecen
- ✅ Abre la consola del navegador (F12)
- ✅ Busca errores en rojo
- ✅ Verifica que las coordenadas sean válidas:
  - Latitud: entre -90 y 90
  - Longitud: entre -180 y 180

### "No hay packs disponibles"
- ✅ Crea packs desde el dashboard del restaurante
- ✅ Asegúrate de que estén activos
- ✅ Asegúrate de que tengan cantidad > 0

## 💡 Características del Mapa

- ✅ **100% Gratis** - No requiere API key ni token
- ✅ **OpenStreetMap** - Datos abiertos y actualizados
- ✅ **MapLibre GL JS** - Rendimiento superior
- ✅ **Responsive** - Funciona en móvil y desktop
- ✅ **Geolocalización** - Botón para centrar en tu ubicación
- ✅ **Popups** - Click en marcadores para ver detalles

## 🎨 Personalización

Los mapas usan:
- **Verde** 🟢 - Establecimientos con packs disponibles
- **Rojo** 🔴 - Establecimientos sin packs
- **Azul** 🔵 - Tu ubicación actual

---

**¿Necesitas ayuda?** Revisa la documentación o contacta al equipo de desarrollo.
