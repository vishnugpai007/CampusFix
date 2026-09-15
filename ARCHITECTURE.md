# CampusFix Architectural Blueprint 📐

This document outlines the architectural patterns, security trade-offs, and data modeling decisions governing **CampusFix**.

---

## 1. Architectural Layering & System Design

CampusFix follows a strict **Controller-Service-Model** multi-tiered separation of concerns to maximize testability, maintainability, and code reuse.

```
                   ┌───────────────────────────────┐
                   │    HTTP Request (Client)      │
                   └──────────────┬────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │   Middleware & Validation     │ (Helmet, Cors, Rate Limit, Auth, Zod)
                   └──────────────┬────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │          Controllers          │ (HTTP Statuses, Headers, Response Formatting)
                   └──────────────┬────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │           Services            │ (Business Logic, Cloud Streaming, DB Queries)
                   └──────────────┬────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │        Models & Schemas       │ (Mongoose Documents & Indexes)
                   └───────────────────────────────┘
```

### Layer Responsibilities

1. **Routes Layer (`src/routes/`)**: Defines HTTP verbs, paths, and wires specific middleware chains (Authentication, Authorization, File Upload, Schema Validation) to target controllers.
2. **Middleware & Validator Layer (`src/middleware/`, `src/validators/`)**: Enforces cross-cutting concerns:
   - Request rate limiting and security headers (`helmet`, `express-rate-limit`).
   - Request body and query parameter validation using `Zod`.
   - JWT authentication verification (`authenticate`).
   - Role-Based Access Control (`authorize('staff', 'admin')`).
3. **Controller Layer (`src/controllers/`)**: Acts as HTTP orchestrator. Parses `req.body`, `req.params`, and `req.query`, invokes service methods, and maps outcomes into standardized `ApiResponse` structures. Contains no direct database queries or business logic.
4. **Service Layer (`src/services/`)**: Contains core application business logic:
   - Manages transactional boundaries and multi-step logic (e.g., uploading images to Cloudinary with rollback on database failure).
   - Handles aggregation pipelines and database queries.
5. **Data Layer (`src/models/`)**: Defines Mongoose database schemas, field validation constraints, default values, and database index definitions.

---

## 2. Authentication & Token Strategy

CampusFix implements a **Hybrid Short-Lived Access Token + Long-Lived Refresh Token** authentication pattern.

```
       Client Application                                 Backend API
┌───────────────────────────────┐              ┌───────────────────────────────┐
│ Memory State (AuthContext)    │              │ HTTP-Only Cookie (Browser)    │
│ Access Token: "eyJhbGci..."   │              │ refreshToken: "d8a1f3..."     │
└──────────────┬────────────────┘              └──────────────┬────────────────┘
               │                                              │
               │ Sent via Authorization Header                │ Sent automatically via HTTP Cookie
               ▼                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            Backend Verification                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Why In-Memory Access Tokens over `localStorage`?

| Storage Location | XSS Vulnerability | CSRF Vulnerability | Persistence across reload |
| :--- | :---: | :---: | :---: |
| `localStorage` / `sessionStorage` | ❌ High risk (Accessible by any script) | ✅ Immune | Yes |
| **In-Memory (AuthContext)** | ✅ **Protected** (Inaccessible to DOM scripts) | ✅ Immune | Restored via Silent Refresh |
| HTTP-Only Cookie | ✅ Protected (Inaccessible to JavaScript) | ⚠️ Requires CSRF Mitigation | Yes |

#### Token Flow Lifecycle
1. **Login/Register**: Upon successful login, the server returns a short-lived access token (expires in 15 minutes) in the JSON payload, and sets a long-lived refresh token (expires in 7 days) in a `httpOnly`, `sameSite`, `secure` cookie.
2. **In-Memory Storage**: The client stores the access token strictly in JavaScript memory within `AuthContext`.
3. **Silent Refresh Cycle**: On page reload or when an access token expires (401 response), an Axios interceptor catches the error, sends a request to `/api/v1/auth/refresh` carrying the HTTP-only cookie, obtains a fresh access token, and retries the failed request seamlessly without prompting the user to re-login.
4. **Logout**: Invalidates the refresh token hash in MongoDB and clears the HTTP-only cookie.

---

## 3. Data Modeling & Why MongoDB Fits CampusFix

CampusFix utilizes **MongoDB** due to its document-oriented model, which maps naturally to campus issue reporting requirements:

### Key Reasons for MongoDB Choice

1. **Flexible, Evolving Categories & Attributes**: Campus maintenance issues vary across departments (Wi-Fi, plumbing, electrical). Document models allow adding category-specific fields without complex SQL schema migrations.
2. **Embedded Subdocuments & Atomic Updates**:
   - **Upvote Collection**: Stored as an array of User ObjectIds (`upvotes: [ObjectId]`) within the Issue document. Toggling upvotes is an atomic `$push` or `$pull` update.
   - **Comment Threads**: Comments reference both issue IDs and user IDs with indexed fields for high-conformance concurrent fetching.
3. **Compound Text Search**: MongoDB supports native `$text` indexes on `title`, `description`, and `location` fields, enabling instant full-text search across issue feeds without requiring an external search engine like Elasticsearch.
4. **Aggregation Engine for Analytics**: Staff dashboards require real-time status counts, category breakdowns, and average resolution times. MongoDB's aggregation pipeline handles `$group`, `$match`, and `$project` operations efficiently.
