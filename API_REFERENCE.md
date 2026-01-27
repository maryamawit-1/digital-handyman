# Digital Handyman – API Reference

## 1. All available API endpoints and HTTP methods

Base URL: `http://localhost:3000` (or `VITE_API_URL`). Auth: `Authorization: Bearer <token>` where noted.

### Root
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Welcome message |

---

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Admin login |

---

### Admin (`/admin`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/login` | — | Admin login (same as `/api/auth/login`) |
| GET | `/admin/dashboard` | Bearer | Dashboard summary + services, providers, feedbacks |
| POST | `/admin/services` | Bearer | Create service |
| PUT | `/admin/services/:id` | Bearer | Update service |
| PATCH | `/admin/requests/:id` | Bearer | Update request (status, scheduled_at, negotiated_price, provider_id) |
| GET | `/admin/requests/search/:referenceId` | Bearer | Get request by `referenceId` |
| DELETE | `/admin/requests/:id` | Bearer | Delete request (numeric `id` or `SR-…` ref) |
| GET | `/admin/applications/search?skill=` | Bearer | Search applications by `skill` (optional) |
| GET | `/admin/applications` | Bearer | List applications |
| GET | `/admin/applications/:id` | Bearer | Get application by id |
| PATCH | `/admin/applications/:id` | Bearer | Update application |
| POST | `/admin/applications/:id/approve` | Bearer | Approve and transfer to providers |
| GET | `/admin/providers/search?skill=` | Bearer | Search providers by `skill` (required) |
| POST | `/admin/providers` | Bearer | Create provider |
| GET | `/admin/providers` | Bearer | List providers |
| POST | `/admin/requests/:requestId/assign-provider` | Bearer | Assign provider to request |

---

### Services (`/services`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/services` | — | List active services |
| POST | `/services/requests/estimate` | — | Estimate cost (no save) |
| POST | `/services` | — | Submit service request |
| POST | `/services/admin/services` | Bearer | Create service (admin) |
| PUT | `/services/admin/services/:id` | Bearer | Update service (admin) |

---

### Requests (`/requests`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/requests/estimate` | — | Estimate cost (no save) |
| GET | `/requests/admin/requests` | Bearer | List all service requests (admin) |

---

### Providers (`/providers`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/providers/apply` | — | Submit provider application |
| POST | `/providers` | — | Submit provider application (alias) |

---

### Feedback (`/feedback`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/feedback/feedback` | — | Submit feedback (by `referenceId`) |
| GET | `/feedback/admin/feedback` | Bearer | List all feedback |
| DELETE | `/feedback/admin/feedback/:id` | Bearer | Delete feedback |

---

## 2. Login endpoint – request body

**Endpoints:** `POST /api/auth/login` and `POST /admin/login`

**Request body (JSON):**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

- `username`, `password`: non-empty; leading/trailing spaces are trimmed.  
- **Success (200):** `{ "message": "Login successful", "token": "JWT", "admin": { "id", "username", "role" } }`  
- **Error:** `401` `{ "message": "Invalid credentials" }`, `500` `{ "message": "Internal server error" }`

---

## 3. `/api/users` – response structure

**This backend does not expose an `/api/users` endpoint.**  
There is no users API; admin identity is only from `/admin/login` (or `/api/auth/login`) and the JWT payload (`id`, `username`, `role`).

---

## 4. Authentication method

**Method:** JWT (JSON Web Tokens), **Bearer** scheme.

- **Header:** `Authorization: Bearer <JWT>`
- **Obtaining token:** `POST /admin/login` or `POST /api/auth/login` with `{ username, password }`.
- **Verification:** middleware `verifyToken` validates `Authorization: Bearer <token>` and `jwt.verify(token, JWT_SECRET)`; decoded `{ id, username, role }` is attached as `req.admin`.
- **Role checks:** `requireRole('ADMIN','OWNER')` on protected admin routes.
- **Expiry:** default `8h` (from `JWT_SECRET` and `JWT_EXPIRES` in `adminController`).

---

## 5. Main request/response shapes (for frontend)

- **Submit service request** `POST /services`  
  - Body: `name`, `email`, `phone`, `address`, `description?`, `service_id`, `quantity?`, `preferred_date?`, `preferred_time?`  
  - Res: `201` `{ message, referenceId, assignedProviders?, id }`

- **Submit provider application** `POST /providers` or `POST /providers/apply`  
  - Body: `email`, `phone`, `experience_details`, `skills`, `first_name?`, `last_name?`  
  - Res: `201` `{ message, id }`

- **Submit feedback** `POST /feedback/feedback`  
  - Body: `referenceId`, `rating` (1–5), `comment?`  
  - Res: `201` `{ message }`

- **Admin dashboard** `GET /admin/dashboard`  
  - Res: `{ summary: { totalRequests, totalProviders, totalFeedbacks }, services, providers, feedbacks }`

- **Estimate cost** `POST /services/requests/estimate` or `POST /requests/estimate`  
  - Body: `{ service_id, quantity?: 1 }`  
  - Res: `{ estimated_cost }`

- **Assign provider** `POST /admin/requests/:requestId/assign-provider`  
  - Body: `{ providerId }`  
  - Res: `201` `{ success: true, message, data: { requestId, providerId, assignmentStatus } }`
