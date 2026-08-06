# Volquetes API

REST API for a logistics marketplace connecting clients who need construction dumpsters with rental companies. Built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Live Demo

**Base URL:** `https://bolquetes-api-production.up.railway.app`

## 🛠️ Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL (Supabase) + PostGIS
- **ORM:** TypeORM
- **Auth:** JWT + bcrypt
- **Payments:** Mercado Pago
- **Deploy:** Railway

## 📦 Modules

| Module | Description |
|--------|-------------|
| Users | Registration and authentication |
| Auth | JWT login |
| Companies | Company management and approval |
| Services | Dumpster catalog per company |
| Drivers | Driver management per company |
| Vehicles | Vehicle fleet management |
| Zones | Geographic coverage areas (PostGIS) |
| Orders | Full order lifecycle management |
| Payments | Mercado Pago integration |
| Reviews | Company ratings and reviews |

## 🔄 Order Lifecycle

pending → accepted → assigned → delivered → picked_up → completed
↘ cancelled


## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login, returns JWT token |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users` | Public | Register user |
| GET | `/users` | JWT | List all users |

### Companies
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/companies` | Public | Register company |
| GET | `/companies` | JWT | List all companies |
| GET | `/companies/approved` | Public | List approved companies |
| PATCH | `/companies/:id/approve` | JWT | Approve company |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/services` | JWT | Create service |
| GET | `/services/company/:id` | Public | Services by company |
| GET | `/services/category/:category` | Public | Services by category |

### Drivers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/drivers` | JWT | Create driver |
| GET | `/drivers/company/:id` | JWT | Drivers by company |
| GET | `/drivers/:id` | JWT | Get driver |
| PATCH | `/drivers/:id/deactivate` | JWT | Deactivate driver |

### Vehicles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/vehicles` | JWT | Create vehicle |
| GET | `/vehicles/company/:id` | JWT | Vehicles by company |
| GET | `/vehicles/:id` | JWT | Get vehicle |
| PATCH | `/vehicles/:id/deactivate` | JWT | Deactivate vehicle |

### Zones
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/zones` | JWT | Create coverage zone |
| GET | `/zones/company/:id` | JWT | Zones by company |
| GET | `/zones/search?lat=X&lng=Y` | Public | Companies covering location |
| PATCH | `/zones/:id/deactivate` | JWT | Deactivate zone |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | JWT | Create order |
| GET | `/orders` | JWT | List all orders |
| GET | `/orders/user/:id` | JWT | Orders by user |
| GET | `/orders/company/:id` | JWT | Orders by company |
| GET | `/orders/:id` | JWT | Get order |
| PATCH | `/orders/:id/status` | JWT | Update order status |
| PATCH | `/orders/:id/assign` | JWT | Assign driver and vehicle |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-preference` | JWT | Create Mercado Pago preference |
| POST | `/payments/webhook` | Public | Mercado Pago webhook |
| GET | `/payments/order/:id` | JWT | Payments by order |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | JWT | Create review |
| GET | `/reviews/company/:id` | Public | Reviews by company |
| GET | `/reviews/company/:id/rating` | Public | Average rating |
| GET | `/reviews/order/:id` | JWT | Review by order |

## ⚙️ Environment Variables

```env
DATABASE_HOST=your_supabase_host
DATABASE_PORT=6543
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=postgres
JWT_SECRET=your_jwt_secret
MP_ACCESS_TOKEN=your_mercadopago_token
APP_URL=https://your-railway-url.up.railway.app
```

## 🏃 Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build
```

## 📋 Database

PostgreSQL hosted on Supabase (São Paulo region) with PostGIS extension enabled for geographic zone queries.

## 🌍 Geographic Search

Find companies covering a specific location:

GET /zones/search?lat=-32.9&lng=-60.6


Returns all companies whose coverage zones contain the given coordinates.