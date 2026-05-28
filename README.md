# Sniply — URL Shortener with Analytics

> A full-stack URL shortener with click analytics, QR codes, custom aliases, and expiry dates.
> Built with React, Node.js/Express, and PostgreSQL.

---

## 🚀 Live Demo

🎥 **Demo Video:** [Add your Loom or YouTube link here]

---

## 📁 Project Structure

```
url-shortener/
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── api/
│       │   └── axios.js        # Axios instance with JWT interceptor
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── UrlCard.jsx
│       ├── context/
│       │   └── AuthContext.jsx # Global auth state
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   └── Analytics.jsx
│       ├── App.jsx
│       ├── index.js
│       └── index.css
│
└── server/                     # Express backend
    ├── config/
    │   ├── db.js               # PostgreSQL connection pool
    │   └── migrate.js          # DB table creation script
    ├── controllers/
    │   ├── authController.js
    │   ├── urlController.js
    │   └── redirectController.js
    ├── middleware/
    │   ├── auth.js             # JWT verification
    │   ├── errorHandler.js
    │   └── validators.js       # express-validator rules
    ├── routes/
    │   ├── auth.js
    │   ├── url.js
    │   └── redirect.js
    └── index.js
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/kavya-selvaraj15/sniply-FINAL.git
cd sniply-FINAL
```

---

### 2. Backend setup

```bash
cd server
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=url_shortener
DB_USER=postgres
DB_PASSWORD=123@srit

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

Create the PostgreSQL database:

```bash
createdb url_shortener
```

Run the migration to create all tables:

```bash
npm run migrate
```

Start the backend server:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Server will run at: `http://localhost:5000`

---

### 3. Frontend setup

```bash
cd ../client
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

App will open at: `http://localhost:3000`

---

## 🗄️ Database Schema

### users

| Column     | Type         | Notes         |
| ---------- | ------------ | ------------- |
| id         | UUID         | Primary key   |
| name       | VARCHAR(100) | Required      |
| email      | VARCHAR(255) | Unique        |
| password   | VARCHAR(255) | bcrypt hashed |
| created_at | TIMESTAMP    | Auto          |
| updated_at | TIMESTAMP    | Auto          |

### urls

| Column       | Type        | Notes             |
| ------------ | ----------- | ----------------- |
| id           | UUID        | Primary key       |
| user_id      | UUID        | FK → users        |
| original_url | TEXT        | Required          |
| short_code   | VARCHAR(20) | Unique, nanoid(6) |
| custom_alias | VARCHAR(50) | Optional, unique  |
| total_clicks | INTEGER     | Default 0         |
| expires_at   | TIMESTAMP   | Nullable          |
| created_at   | TIMESTAMP   | Auto              |

### visits

| Column     | Type        | Notes        |
| ---------- | ----------- | ------------ |
| id         | UUID        | Primary key  |
| url_id     | UUID        | FK → urls    |
| ip_address | VARCHAR(50) | Visitor IP   |
| user_agent | TEXT        | Browser info |
| visited_at | TIMESTAMP   | Auto         |

---

## 📡 API Reference

### Auth

| Method | Endpoint             | Auth | Description        |
| ------ | -------------------- | ---- | ------------------ |
| POST   | `/api/auth/register` | No   | Register new user  |
| POST   | `/api/auth/login`    | No   | Login, returns JWT |
| GET    | `/api/auth/me`       | Yes  | Get current user   |

### URLs

| Method | Endpoint                 | Auth | Description                  |
| ------ | ------------------------ | ---- | ---------------------------- |
| POST   | `/api/url/shorten`       | Yes  | Create short URL             |
| GET    | `/api/url/my-urls`       | Yes  | List user's URLs (paginated) |
| GET    | `/api/url/analytics/:id` | Yes  | Analytics for a URL          |
| PUT    | `/api/url/:id`           | Yes  | Update destination URL       |
| DELETE | `/api/url/:id`           | Yes  | Delete a URL                 |
| GET    | `/:code`                 | No   | Redirect + track visit       |

### Example request — shorten a URL

```bash
curl -X POST http://localhost:5000/api/url/shorten \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.example.com/very/long/url",
    "customAlias": "my-link",
    "expiresAt": "2026-12-31T23:59:59"
  }'
```

Response:

```json
{
  "success": true,
  "message": "URL shortened successfully.",
  "data": {
    "id": "uuid-here",
    "original_url": "https://www.example.com/very/long/url",
    "short_code": "my-link",
    "short_url": "http://localhost:5000/my-link",
    "total_clicks": 0,
    "created_at": "2026-05-25T10:00:00.000Z"
  }
}
```

---

## ✅ Features Implemented

### Mandatory

- [x] User signup and login with JWT authentication
- [x] Protected dashboard routes
- [x] Each user manages only their own URLs
- [x] Long URL → short URL with unique 6-char code (nanoid)
- [x] Redirect short URL to original with 301 redirect
- [x] URL validation before shortening
- [x] Dashboard: view all URLs, original URL, short URL, created date, total clicks
- [x] Delete short URLs
- [x] Copy short URL to clipboard
- [x] Click count per short URL
- [x] Timestamp recorded on each visit
- [x] Analytics page per URL: total clicks, last visited, recent visit history
- [x] Responsive UI with loading, success, and error states
- [x] Form validation with field-level error messages

### Bonus

- [x] Custom alias for short URL
- [x] QR code generation per link
- [x] Expiry date for links (server-side check on redirect)
- [x] Edit destination URL
- [x] Charts for daily click trends (Recharts area chart)
- [x] Browser and OS detection from user agent

---

## 🛠️ Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Frontend      | React 18, React Router v6    |
| State         | React Context API            |
| HTTP client   | Axios                        |
| Charts        | Recharts                     |
| QR codes      | qrcode.react                 |
| Notifications | react-hot-toast              |
| Icons         | lucide-react                 |
| Backend       | Node.js, Express             |
| Auth          | JWT (jsonwebtoken), bcryptjs |
| Validation    | express-validator            |
| Short codes   | nanoid                       |
| Rate limiting | express-rate-limit           |
| Database      | PostgreSQL (pg, pg-pool)     |
| Dev tooling   | nodemon                      |

---

## 🤖 AI Planning Document

### Planning Approach

This project was built using Claude (Anthropic) as the primary AI code generation tool. The workflow followed was:

**Step 1 — Requirements analysis**
Read the problem statement carefully and broke it into distinct layers: Authentication, URL logic, Analytics tracking, and UI.

**Step 2 — Architecture design**
Decided on a clean three-tier architecture:

- React SPA (no SSR needed, purely client-side routing)
- Express REST API with JWT auth
- PostgreSQL with three normalized tables

**Step 3 — Database-first design**
Modeled the schema before writing any application code. Defined `users`, `urls`, and `visits` tables with proper foreign keys, indexes, and UUID primary keys.

**Step 4 — Backend first**
Built and tested the backend API (auth, URL CRUD, redirect, analytics) before starting the frontend. This allowed clean API contract definition.

**Step 5 — Frontend last**
Built the React app against the finalized API. Used Context API for global auth state and Axios interceptors for automatic JWT attachment and 401 handling.

### Key Design Decisions

| Decision                  | Rationale                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL over MongoDB   | Relational data (users → urls → visits) fits SQL naturally; JOINs and aggregations are cleaner                      |
| nanoid(6) for short codes | Cryptographically random, URL-safe, collision-resistant at small scale                                              |
| Async visit tracking      | The redirect endpoint records visits with `pool.query(...).catch(...)` without awaiting, so the redirect is instant |
| JWT in localStorage       | Simple for a hackathon; production would use httpOnly cookies                                                       |
| 301 redirect              | Permanent redirect; browsers cache it, reducing server load for repeat clicks                                       |
| Context API over Redux    | App state is simple (just auth); Redux would be overkill                                                            |

### Architecture Diagram

See the architecture diagram in the repository (`/docs/architecture.png`) or in the README above.

---

## 📝 Assumptions Made

1. **Short code uniqueness** — nanoid(6) generates 64^6 ≈ 68 billion combinations. Collision probability is negligible at hackathon scale. A while-loop checks for uniqueness before inserting.

2. **No email verification** — Registration is immediate without email confirmation for simplicity.

3. **Single server redirect** — Short URLs point to the same server (`BASE_URL`). In production this would be a dedicated redirect service on a custom domain.

4. **IP address for analytics** — Visitor IPs are stored as-is. In production, you would anonymize the last octet for GDPR compliance.

5. **User agent parsing** — Browser and OS are parsed client-side from the raw user agent string using simple string matching, not a full UA parser library.

6. **No refresh tokens** — JWT tokens expire after 7 days and the user is asked to log in again. Production apps would implement refresh token rotation.

7. **Password policy** — Minimum 6 characters. Production would enforce stronger rules (uppercase, numbers, symbols).

8. **Rate limiting** — Global 200 req/15min, auth endpoints 20 req/15min. These are reasonable development defaults.

---

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens verified on every protected route
- Input validated and sanitized with express-validator
- Rate limiting on all endpoints (stricter on auth)
- CORS restricted to the client URL
- SQL injection prevented via parameterized queries (`pg` library)

---

## 📸 Sample Output

### Database entries (example)

**users table:**

```
id                                   | name       | email
-------------------------------------|------------|-------------------
a1b2c3d4-...                         | Jane Doe   | jane@example.com
```

**urls table:**

```
short_code | original_url                          | total_clicks
-----------|---------------------------------------|-------------
aB3xYz     | https://www.example.com/long/path/... | 42
my-link    | https://docs.google.com/...           | 7
```

**visits table:**

```
url_id       | ip_address    | user_agent          | visited_at
-------------|---------------|---------------------|--------------------
uuid...      | 103.x.x.x     | Mozilla/5.0 Chrome  | 2026-05-25 10:32:00
```

---

## 🚀 Deployment Notes

To deploy with a live demo:

1. **Backend** — Deploy to Railway, Render, or Fly.io. Set all `.env` variables in the platform dashboard.
2. **Database** — Use Railway PostgreSQL or Supabase. Run `npm run migrate` after provisioning.
3. **Frontend** — Deploy to Vercel or Netlify. Set `REACT_APP_API_URL` to your backend URL.
4. **Short URL domain** — Point `BASE_URL` to your backend domain so short links resolve correctly.

---

This project is a part of a hackathon run by https://katomaran.com
