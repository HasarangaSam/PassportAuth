# PassportAuth — Production-Ready Token Authentication Learning Project

PassportAuth is a full-stack authentication learning project built with the **PERN stack** and **Passport.js**.

The main goal of this project is to understand how **Passport.js works with modern token-based authentication**, including short-lived access tokens, refresh-token rotation, token-family revocation, reuse detection, Google OAuth, and protected API routes.

This project intentionally focuses on authentication rather than building a large business domain.

---

## 1. Project Overview

PassportAuth supports two authentication methods:

- Email and password authentication using Passport Local Strategy
- Google OAuth using Passport Google Strategy

After successful authentication, the backend issues:

- A short-lived **JWT access token**
- A long-lived **opaque refresh token**

The access token is used to authenticate API requests, while the refresh token is stored in an **HttpOnly cookie** and tracked securely in PostgreSQL.

The project does **not** use `express-session`. Passport.js is used for authentication strategies, while JWTs and server-side refresh-token management handle the application's token-based authentication system.

---

## 2. Main Authentication Flow

```text
                    Authentication
                          │
             ┌────────────┴────────────┐
             │                         │
        Email/Password              Google OAuth
             │                         │
       Passport Local            Passport Google
             │                         │
             └────────────┬────────────┘
                          ▼
                     User account
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
       Access Token              Refresh Token
          JWT                       Opaque
       ~15 minutes                  ~7 days
             │                         │
             ▼                         ▼
       Memory only              HttpOnly Cookie
             │                         │
             ▼                         ▼
      Passport JWT             Hashed in DB
             │                         │
             ▼                  Rotation + Revocation
      Protected API                    │
                                       ▼
                                Reuse Detection
```

---

## 3. Why Access and Refresh Tokens?

A short-lived access token limits the amount of time an exposed token can be used.

The refresh token allows the application to obtain a new access token without requiring the user to log in again.

PassportAuth therefore separates the two responsibilities:

### Access Token

- JWT
- Short-lived
- Sent using the `Authorization: Bearer` header
- Stored only in frontend memory
- Verified using Passport JWT Strategy
- Used to access protected API endpoints

### Refresh Token

- Cryptographically random opaque token
- Long-lived
- Stored in an HttpOnly cookie
- Never stored in localStorage
- Stored as a SHA-256 hash in PostgreSQL
- Rotated after every successful refresh
- Revocable by the server
- Associated with a token family

---

## 4. Refresh Token Rotation

Refresh tokens are not reused indefinitely.

For example:

```text
Login
  │
  ▼
Refresh Token A
  │
  │ /refresh
  ▼
Refresh Token A → revoked
  │
  ▼
Refresh Token B → active
```

The database records the replacement relationship:

```text
Token A
  │
  └── replacedById → Token B
```

The new token remains in the same token family.

---

## 5. Token Families

Each login creates a new refresh-token family.

For example:

```text
Device A
  └── Family A

Device B
  └── Family B

Device C
  └── Family C
```

Refreshing a token does not create a new family:

```text
Family A
   │
   ├── Token A → revoked
   │
   ├── Token B → revoked
   │
   └── Token C → active
```

This allows individual devices to have independent refresh-token sessions.

---

## 6. Refresh Token Reuse Detection

One of the main security features of PassportAuth is refresh-token reuse detection.

Suppose:

```text
Token A → Token B
```

Token A is now revoked.

If someone attempts to use Token A again, PassportAuth treats this as possible token theft or reuse.

The entire token family is revoked:

```text
Token A
   ↓
REUSE DETECTED
   ↓
Entire Family Revoked
   │
   ├── Token A → revoked
   ├── Token B → revoked
   └── Token C → revoked
```

The legitimate client must authenticate again.

This prevents an attacker who obtains an old refresh token from continuing to refresh the session.

---

## 7. Google OAuth Flow

Google authentication is implemented using Passport Google OAuth.

The application does not put the access token directly into the OAuth callback URL.

Instead:

```text
Google
  │
  ▼
Backend OAuth callback
  │
  ▼
Authenticate user
  │
  ▼
Generate short-lived one-time OAuth code
  │
  ▼
Redirect to frontend
  │
  ▼
/oauth/callback?code=...
  │
  ▼
Frontend exchanges code
  │
  ▼
Access token + refresh cookie
```

The OAuth exchange code is:

- Cryptographically random
- Short-lived
- Single-use
- Stored hashed
- Deleted after consumption

The actual access token is therefore never exposed through the browser URL.

---

## 8. Google Account Handling

PassportAuth does not implement automatic account linking.

If a Google account is already connected to a PassportAuth user:

```text
Google account
      ↓
Existing OAuthAccount
      ↓
Sign in
```

If the Google email matches an existing local account but there is no Google OAuth account connected:

```text
Google email
      ↓
Existing local account
      ↓
Authentication rejected
```

This avoids silently linking authentication methods.

---

## 9. Password Security

Passwords are never stored as plaintext.

PassportAuth uses **Argon2** for password hashing.

```text
Password
   ↓
Argon2
   ↓
Password Hash
   ↓
PostgreSQL
```

During login:

```text
Submitted password
        ↓
Argon2 verification
        ↓
Valid?
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
 Login     Reject
```

Changing a password also invalidates all existing refresh-token sessions.

---

## 10. Logout and Session Invalidation

PassportAuth supports:

### Logout current device

The refresh-token family associated with the current refresh token is revoked.

```text
Current Device
      ↓
Current Family
      ↓
Revoke family
```

Other devices remain authenticated.

### Logout all devices

All active refresh tokens belonging to the user are revoked.

```text
Device A → revoked
Device B → revoked
Device C → revoked
```

### Password change

Changing the password also revokes all refresh-token sessions.

Existing access tokens may remain technically valid until their short expiration time because access tokens are stateless.

---

## 11. Frontend Token Handling

The frontend deliberately does not store the access token in localStorage.

Instead:

```text
React application memory
        │
        ▼
Access token
```

The refresh token is handled by the browser:

```text
HttpOnly Cookie
      │
      ▼
JavaScript cannot read it
```

This means application JavaScript does not need direct access to the refresh credential.

---

## 12. Automatic Access Token Refresh

Axios interceptors handle expired access tokens.

```text
API Request
    │
    ▼
Access Token
    │
    ▼
Server
    │
    ├── Valid ───────► Response
    │
    └── Expired
          │
          ▼
         401
          │
          ▼
    Axios interceptor
          │
          ▼
     /auth/refresh
          │
          ▼
   Refresh token rotation
          │
          ▼
    New access token
          │
          ▼
   Retry original request
```

The frontend also uses a shared refresh promise so that multiple simultaneous `401` responses do not trigger multiple refresh operations at the same time.

---

## 13. CSRF Protection

Because refresh tokens are stored in cookies, PassportAuth validates the request origin for cookie-based authentication operations.

The backend checks the request's `Origin` against the configured frontend URL.

This is applied to operations such as:

- Refresh
- Logout
- Logout all devices
- Change password
- Google OAuth code exchange

The refresh cookie also uses:

- `HttpOnly`
- `Secure` in production
- `SameSite=Lax`
- A restricted authentication path

---

## 14. Authorization

Authentication and authorization are treated separately.

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this action?

PassportAuth includes:

```text
USER
ADMIN
```

The backend provides role-based authorization middleware:

```text
authenticateAccessToken
        ↓
requireRole(...)
        ↓
Protected resource
```

---

## 15. Database Models

PassportAuth uses three main authentication-related models.

### User

Stores application user information.

```text
User
├── id
├── email
├── passwordHash
├── firstName
├── lastName
├── role
├── emailVerified
└── timestamps
```

### RefreshToken

Tracks refresh-token sessions.

```text
RefreshToken
├── tokenHash
├── familyId
├── userId
├── expiresAt
├── revokedAt
├── replacedById
└── createdAt
```

### OAuthAccount

Stores external authentication identities.

```text
OAuthAccount
├── provider
├── providerAccountId
├── userId
└── timestamps
```

### OAuthCode

Stores short-lived one-time OAuth exchange codes.

```text
OAuthCode
├── codeHash
├── userId
├── expiresAt
└── createdAt
```

---

## 16. Technology Stack

### Backend

- Node.js
- Express 5
- TypeScript
- Passport.js
- Passport Local
- Passport JWT
- Passport Google OAuth 2.0
- PostgreSQL
- Prisma 7
- `@prisma/adapter-pg`
- Argon2
- JSON Web Token
- Zod
- Cookie Parser
- CORS
- dotenv

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

---

## 17. Project Structure

```text
PassportAuth/
│
├── backend/
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── cookies.ts
│   │   │   ├── env.ts
│   │   │   └── passport.ts
│   │   │
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── authorization.middleware.ts
│   │   │   └── csrf.middleware.ts
│   │   │
│   │   ├── routes/
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── oauth-code.service.ts
│   │   │   ├── refresh-token.service.ts
│   │   │   └── token.service.ts
│   │   │
│   │   ├── strategies/
│   │   │   ├── access-token.strategy.ts
│   │   │   ├── google.strategy.ts
│   │   │   └── local.strategy.ts
│   │   │
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── express.d.ts
│   │   │   └── token.types.ts
│   │   │
│   │   ├── utils/
│   │   │   └── refresh-token.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    │
    ├── src/
    │   ├── api/
    │   │   └── axios.ts
    │   │
    │   ├── features/
    │   │   └── auth/
    │   │       ├── api/
    │   │       ├── components/
    │   │       ├── context/
    │   │       ├── hooks/
    │   │       ├── types/
    │   │       └── auth-token.ts
    │   │
    │   ├── layouts/
    │   │   └── AuthenticatedLayout.tsx
    │   │
    │   ├── pages/
    │   │   ├── ChangePasswordPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── HomePage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── OAuthCallbackPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   └── RegisterPage.tsx
    │   │
    │   ├── routes/
    │   │   ├── AppRoutes.tsx
    │   │   └── ProtectedRoute.tsx
    │   │
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    │
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

---

## 18. Environment Variables

### Backend

Create:

```text
backend/.env
```

Example:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://postgres:password@localhost:5432/passportauth"

CLIENT_URL="http://localhost:5173"

JWT_ACCESS_SECRET="replace-this-with-a-long-random-secret"
JWT_ACCESS_EXPIRES_IN="15m"

REFRESH_TOKEN_EXPIRES_IN_DAYS=7

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
```

### Frontend

Create:

```text
frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real environment files or secrets to Git.

---

## 19. Installation

Clone the project and install dependencies.

### Backend

```bash
cd backend
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## 20. Available Backend Scripts

```bash
npm run dev
```

Starts the backend in development mode.

```bash
npm run build
```

Builds the TypeScript backend.

```bash
npm start
```

Starts the compiled backend.

```bash
npm run prisma:generate
```

Generates the Prisma client.

```bash
npm run prisma:migrate
```

Runs Prisma database migrations.

```bash
npm run prisma:studio
```

Opens Prisma Studio.

---

## 21. Authentication Endpoints

### Register

```http
POST /api/auth/register
```

Creates a local user account and authenticates the user.

### Login

```http
POST /api/auth/login
```

Authenticates using email and password.

### Refresh

```http
POST /api/auth/refresh
```

Rotates the refresh token and issues a new access token.

### Logout

```http
POST /api/auth/logout
```

Revokes the current refresh-token family.

### Logout all devices

```http
POST /api/auth/logout-all
```

Revokes all refresh tokens belonging to the authenticated user.

### Change password

```http
POST /api/auth/change-password
```

Changes the password and invalidates all refresh-token sessions.

### Profile

```http
GET /api/auth/profile
```

Returns the authenticated user's profile.

### Google OAuth

```http
GET /api/auth/google
```

Starts Google authentication.

```http
GET /api/auth/google/callback
```

Handles the Google OAuth callback.

```http
POST /api/auth/google/exchange
```

Exchanges the short-lived OAuth code for an access token.

---

## 22. What I Learned

This project was built to understand the practical implementation of modern authentication rather than simply adding a login form.

Key concepts covered:

- How Passport.js strategies work
- Passport Local Strategy
- Passport JWT Strategy
- Passport Google OAuth
- Stateless authentication
- JWT access tokens
- Refresh tokens
- HttpOnly cookies
- Token rotation
- Token families
- Refresh-token revocation
- Refresh-token reuse detection
- OAuth callback security
- One-time OAuth exchange codes
- Password hashing with Argon2
- Protected API routes
- Role-based authorization
- CSRF considerations for cookie-based authentication
- Axios authentication interceptors
- Automatic access-token refresh
- Session invalidation
- PostgreSQL persistence of authentication state
- Prisma transactions and refresh-token state management

---

## 23. Important Design Decisions

### No `express-session`

PassportAuth intentionally does not use Passport's session-based authentication.

The project is designed around:

```text
Access JWT + Refresh Token
```

This makes it useful for learning authentication patterns commonly used by modern SPAs and APIs.

### Access token is not stored in localStorage

The access token exists only in frontend memory.

### Refresh token is not accessible to JavaScript

The refresh token is stored in an HttpOnly cookie.

### Refresh tokens are hashed

The raw refresh token is never stored in PostgreSQL.

### Refresh tokens rotate

Every successful refresh invalidates the previous refresh token.

### Reuse revokes the family

Using an already-revoked refresh token triggers token-family revocation.

### Google OAuth does not silently link accounts

A Google identity must already belong to the Google OAuth account being authenticated.

---

## 24. Project Goal

PassportAuth is primarily a **learning project focused on understanding authentication architecture and Passport.js**.

The project demonstrates how Passport.js can be combined with JWT access tokens and server-side refresh-token management to build a modern token-based authentication system.

The most important authentication flow can be summarized as:

```text
Authenticate user
      ↓
Issue short-lived access JWT
      ↓
Issue long-lived refresh token
      ↓
Store refresh token in HttpOnly cookie
      ↓
Hash refresh token in database
      ↓
Use access JWT for API requests
      ↓
Rotate refresh token when access token expires
      ↓
Detect reuse of revoked refresh tokens
      ↓
Revoke token family when reuse is detected
```

This provides a practical foundation for understanding how production-style token authentication systems are designed.
