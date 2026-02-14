# CareOps Backend

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Resend API key
npm install
```

## Seed Default Admin

```bash
node seed.js
```

Creates: `admin@careops.com` / `123456`

## Run

```bash
npm run dev    # with nodemon (hot reload)
npm start      # production
```

Server runs on `http://localhost:5000`

## API Endpoints

### Auth
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/signup` | `{email, password, businessName, timezone, address}` | No |
| POST | `/api/auth/login` | `{email, password}` | No |

### Contacts (public create, protected list)
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/contact` | `{fullName, email, phone, message}` | No |
| GET | `/api/contact` | — | Bearer token |

### Bookings (public create, protected list)
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/bookings` | `{fullName, email, date, time, serviceName}` | No |
| GET | `/api/bookings` | — | Bearer token |
| PATCH | `/api/bookings/:id/status` | `{status}` | Bearer token |

### Dashboard
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/dashboard/overview` | Bearer token |

### Workspace
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/workspace` | Bearer token |
| PUT | `/api/workspace` | Bearer token |
| POST | `/api/workspace/activate` | Bearer token |
| POST | `/api/workspace/connect-email` | Bearer token |

## Example Test (cURL)

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@careops.com","password":"123456"}'

# Use token from response
curl http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Public: Create contact
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@test.com","message":"Need appointment"}'

# Public: Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane Smith","email":"jane@test.com","serviceName":"Consultation","date":"2026-02-15","time":"10:00 AM"}'
```
