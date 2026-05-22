# Volquetes API

Marketplace logístico tipo Uber para alquiler de volquetes de construcción, diseñado para escalar a maquinaria pesada (grúas, camiones, autoelevadores). Incluye features de AI: búsqueda semántica, asistente conversacional con RAG y clasificación automática de pedidos.

> Mercado objetivo: Argentina. Stack moderno, arquitectura lista para producción.

---

## Demo

| Panel | URL |
|-------|-----|
| API REST | `https://volquetes-api.up.railway.app` |
| Swagger docs | `https://volquetes-api.up.railway.app/api` |
| Admin panel | `https://volquetes-admin.vercel.app` |

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS · Node.js · TypeScript |
| Base de datos | PostgreSQL + PostGIS · Supabase (São Paulo) |
| AI / Búsqueda | pgvector · Anthropic Claude SDK · BullMQ |
| Mobile | React Native · Expo |
| Admin / Web | Next.js · Tailwind CSS |
| Pagos | Mercado Pago |
| Notificaciones | Firebase Cloud Messaging |
| Infra | Docker · GitHub Actions · Railway · Vercel |

---

## Features principales

### Core marketplace
- Registro y autenticación de clientes, empresas y conductores (JWT + refresh tokens)
- Zonas de cobertura con geometría PostGIS — cada empresa define sus polígonos de servicio
- Catálogo de servicios con categorías escalables (volquetes → maquinaria sin cambio de schema)
- Flujo completo de orden: pedido → aceptación → asignación de conductor y vehículo → entrega → retiro
- Pagos con Mercado Pago (pago completo o depósito)
- Notificaciones push en cada cambio de estado (FCM)
- Sistema de reseñas por orden completada
- Panel de empresa: precios, stock, zonas, historial
- Panel admin: aprobación de empresas, comisiones, resolución de disputas

### AI features
- **Búsqueda semántica** con pgvector — el cliente escribe en lenguaje natural ("necesito un contenedor para escombros") y el sistema encuentra el servicio correcto aunque no coincidan las palabras exactas
- **Asistente conversacional (RAG)** — responde preguntas sobre disponibilidad, precios y zonas usando datos reales de la base de datos, sin inventar información
- **Clasificación automática** — el sistema clasifica el tipo de residuo y sugiere el vehículo más adecuado a partir de la descripción del pedido
- **Procesamiento en background** con BullMQ para no bloquear el ciclo request-response

---

## Arquitectura

```
┌─────────────────────────────────────────────┐
│              React Native (Expo)             │  ← App cliente y conductor
└─────────────────┬───────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────┐
│           NestJS API (Railway)               │
│                                              │
│  AuthModule      → JWT, guards, RBAC         │
│  OrdenesModule   → flujo completo de orden   │
│  EmpresasModule  → gestión de empresas       │
│  ZonasModule     → PostGIS, cobertura        │
│  PagosModule     → Mercado Pago              │
│  SearchModule    → embeddings + pgvector     │
│  AIModule        → RAG, clasificación        │
│  NotifModule     → FCM push notifications    │
└──────────┬─────────────────┬────────────────┘
           │                 │
┌──────────▼──────┐  ┌───────▼────────────────┐
│   PostgreSQL    │  │   Redis + BullMQ        │
│   + PostGIS     │  │   (jobs de AI en        │
│   + pgvector    │  │    background)          │
│   (Supabase SP) │  └────────────────────────┘
└─────────────────┘
```

---

## Decisiones técnicas

### ¿Por qué NestJS y no Express?
NestJS impone una arquitectura modular que hace el proyecto escalable por múltiples developers. La inyección de dependencias facilita el testing y el sistema de Guards/Pipes/Interceptors resuelve auth, validación y logging de forma declarativa.

### ¿Por qué `services` con campo `category` en lugar de tablas separadas?
El schema genérico (`services + category`) permite agregar grúas, camiones y autoelevadores sin ningún cambio de base de datos. Una tabla por tipo de maquinaria hubiera generado deuda técnica inmediata.

### ¿Por qué pgvector en lugar de Elasticsearch o Pinecone?
Los embeddings viven en la misma instancia de PostgreSQL que el resto de los datos. Sin infra adicional, sin sincronización, con las mismas transacciones ACID. Para el volumen de una etapa MVP/growth en Argentina, pgvector con índice HNSW tiene performance más que suficiente.

### ¿Por qué RAG y no fine-tuning para el asistente?
El asistente necesita responder sobre datos que cambian constantemente (disponibilidad, precios, zonas). Fine-tuning no puede incorporar esos cambios en tiempo real. RAG inyecta el contexto actualizado en cada request.

### ¿Por qué BullMQ para el procesamiento de AI?
Generar embeddings y llamar a la API de Anthropic puede tardar 1-3 segundos. Hacerlo dentro del request-response cycle bloquearía la respuesta al usuario. BullMQ procesa en background con retry automático ante fallos de la API externa.

### ¿Por qué Supabase región São Paulo?
Latencia mínima desde Argentina. Plan gratuito incluye pgvector, PostGIS y backups. La base de datos puede migrarse a cualquier instancia PostgreSQL si la escala lo requiere — sin lock-in.

---

## Correr el proyecto localmente

### Requisitos
- Node.js 20+
- Docker y docker-compose
- Cuenta de Supabase (gratis)

### Setup

```bash
# Clonar el repo
git clone https://github.com/JCAllall/volquetes-api
cd volquetes-api

# Variables de entorno
cp .env.example .env
# Completar: DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, MP_ACCESS_TOKEN, FCM_SERVER_KEY

# Levantar todo con Docker
docker-compose up

# En otro terminal: correr migraciones
npm run migration:run

# La API está en http://localhost:3000
# Swagger en http://localhost:3000/api
```

### Con npm (sin Docker)

```bash
npm install
npm run start:dev
```

---

## Schema principal

```
users           → clientes, conductores, empresas (role enum)
companies       → empresas con commission_pct y approved
services        → catálogo con category (volquete, grua, camion...)
zones           → polígonos PostGIS por empresa
drivers         → conductores vinculados a empresa
vehicles        → flota con tipo y capacidad
orders          → pedidos con estado, lat/lng, driver_id, vehicle_id
order_items     → detalle por servicio
payments        → Mercado Pago con external_id
reviews         → calificaciones por orden completada
```

---

## Tests

```bash
# Unit tests
npm run test

# Coverage
npm run test:cov

# E2E
npm run test:e2e
```

---

## Roadmap

- [x] Auth completo con JWT + refresh tokens
- [x] Zonas con PostGIS
- [x] Flujo completo de orden
- [x] Pagos con Mercado Pago
- [x] Búsqueda semántica con pgvector
- [x] RAG pipeline con Anthropic SDK
- [x] Clasificación automática de pedidos
- [ ] GPS en tiempo real (WebSockets)
- [ ] Chat en tiempo real entre cliente y conductor
- [ ] Panel de empresa en web
- [ ] Escalar a maquinaria pesada (schema ya preparado)

---

## Autor

**Juan Cruz Allall** — [allalljuancruz@gmail.com](mailto:allalljuancruz@gmail.com)  
[GitHub](https://github.com/JCAllall) · [LinkedIn](https://www.linkedin.com/in/juan-cruz-allall-870430254/)
