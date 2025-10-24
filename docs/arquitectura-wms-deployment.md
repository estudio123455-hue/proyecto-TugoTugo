# Diagrama de Deployment - Sistema WMS

## Paso 1: Dispositivos Físicos/Nodos Físicos

### Nodos del Sistema:

- **`<<device>>`** **Client Workstation** - Estación del Operario
  - PC, tableta, dispositivo móvil que usará el personal de bodega para interactuar con el sistema
- **`<<device>>`** **Application Server** - Servidor Web
  - Servidor virtual donde se ejecutará la aplicación WMS
  - Debe ser desplegado en un proveedor de nube
- **`<<device>>`** **Database System** - Servidor de Base de Datos
  - Servidor PostgreSQL para almacenamiento de datos
- **`<<device>>`** **External System** - ERP A2 Softway
  - Sistema externo con API REST
- **`<<device>>`** **External System** - Tienda en Línea
  - Sistema externo con API REST
- **`<<device>>`** **External System** - Pasarela de Envío
  - Sistema externo con API REST

---

## Paso 2: Ambientes de Ejecución

### Entornos por Nodo:

**Estación de Operario:**

- `<<execution environment>>` **Browser**

**Servidor Web:**

- `<<execution environment>>` **Django**

**Servidor de Base de Datos:**

- `<<execution environment>>` **PostgreSQL**

**APIs Externas:**

- `<<execution environment>>` **Servicio REST**

---

## Paso 3: Componentes dentro de los Ambientes de Ejecución

### **Client Workstation** → Browser

- `<<component>>` **Interfaz Usuario WMS**

### **Application Server** → Django

- `<<component>>` **Gestor de Inventario WMS**
- `<<component>>` **Gestor de Pedidos WMS**
- `<<component>>` **Módulo de Pagos**
- `<<component>>` **Módulo de Sincronización (Bróker)**

### **Database System** → PostgreSQL

- `<<component>>` **Base de Datos WMS**

### **External Systems** → Servicio REST

- `<<component>>` **ERP A2 Softway API**
- `<<component>>` **Tienda en Línea API**
- `<<component>>` **Pasarela de Envío API**

---

## Paso 4: Dependencias/Protocolos de Comunicación

### Conexiones y Protocolos:

| Origen                | Destino               | Protocolo     | Descripción                   |
| --------------------- | --------------------- | ------------- | ----------------------------- |
| **Estación Operario** | **Servidor Web**      | HTTP/HTTPS    | Interfaz web del usuario      |
| **Servidor Web**      | **Base de Datos**     | TCP           | Conexión directa a PostgreSQL |
| **Servidor Web**      | **ERP A2 Softway**    | HTTP/REST API | Sincronización de datos ERP   |
| **Servidor Web**      | **Tienda en Línea**   | HTTP/REST API | Integración con e-commerce    |
| **Servidor Web**      | **Pasarela de Envío** | HTTP/REST API | Gestión de envíos             |

---

## Diagrama UML (Representación Textual)

```
┌─────────────────────┐    HTTP/HTTPS    ┌─────────────────────┐
│   Client Workstation│ ───────────────► │  Application Server │
│  ┌─────────────────┐│                  │  ┌─────────────────┐│
│  │   <<Browser>>   ││                  │  │   <<Django>>    ││
│  │ ┌─────────────┐ ││                  │  │ ┌─────────────┐ ││
│  │ │Interfaz     │ ││                  │  │ │Gestor       │ ││
│  │ │Usuario WMS  │ ││                  │  │ │Inventario   │ ││
│  │ └─────────────┘ ││                  │  │ │WMS          │ ││
│  └─────────────────┘│                  │  │ ├─────────────┤ ││
└─────────────────────┘                  │  │ │Gestor       │ ││
                                         │  │ │Pedidos WMS  │ ││
                                         │  │ ├─────────────┤ ││
                                         │  │ │Módulo       │ ││
                                         │  │ │Pagos        │ ││
                                         │  │ ├─────────────┤ ││
                                         │  │ │Módulo Sync  │ ││
                                         │  │ │(Bróker)     │ ││
                                         │  │ └─────────────┘ ││
                                         │  └─────────────────┘│
                                         └─────────────────────┘
                                                  │ TCP
                                                  ▼
                                         ┌─────────────────────┐
                                         │  Database System    │
                                         │  ┌─────────────────┐│
                                         │  │ <<PostgreSQL>>  ││
                                         │  │ ┌─────────────┐ ││
                                         │  │ │Base de      │ ││
                                         │  │ │Datos WMS    │ ││
                                         │  │ └─────────────┘ ││
                                         │  └─────────────────┘│
                                         └─────────────────────┘

External Systems (HTTP/REST API):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ERP A2 Softway   │    │Tienda en Línea  │    │Pasarela Envío   │
│┌───────────────┐│    │┌───────────────┐│    │┌───────────────┐│
││<<REST Service>││    ││<<REST Service>││    ││<<REST Service>││
│└───────────────┘│    │└───────────────┘│    │└───────────────┘│
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                       ▲                       ▲
        │ HTTP                  │ HTTP                  │ HTTP
        └───────────────────────┼───────────────────────┘
                                │
                        Application Server
```

---

## Consideraciones Técnicas

### Seguridad:

- HTTPS para comunicación cliente-servidor
- Autenticación y autorización en APIs
- Encriptación de datos sensibles

### Escalabilidad:

- Servidor de aplicaciones en la nube
- Base de datos con capacidad de escalamiento
- Load balancing si es necesario

### Disponibilidad:

- Backup de base de datos
- Monitoreo de servicios externos
- Manejo de errores en APIs
