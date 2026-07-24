# 🏛️ Dear You Invites — Monolithic Implementation Plan

## 1. Application Overview

**Dear You Invites** is a personalized wedding invitation platform where the host creates individual, letter-style invitation pages for each invited guest. Every guest receives a unique URL to a beautifully designed, personal "letter" invitation — complete with a wax seal, elegant typography, and a custom message.

Beyond invitations, the platform also serves as an **attendee management system** where the admin can track all wedding attendees — including those who may not receive a personalized letter but are part of the guest list.

**Event**: December 19th, 2026  
**Brand colors**: Blush (#F8EDEE), Cream (#FFF8F0), Burgundy (#6B2D3E), Ink (#2D1B1B)  
**Current tech**: React + TanStack Router + TanStack Query + Supabase (to be migrated)

---

## 2. Target Architecture

```
┌─────────────────────────────────────────────────────┐
│                 dear-you-invites/                    │
│                     (monorepo)                       │
├─────────────────────────────────────────────────────┤
│  /server                                             │
│   ├── Express.js  (REST + GraphQL Apollo)            │
│   ├── MongoDB (Mongoose ODM)                         │
│   └── JWT Auth (bcrypt + jsonwebtoken)               │
├─────────────────────────────────────────────────────┤
│  /client                                             │
│   └── Vite + React + TanStack Router + Tailwind      │
├─────────────────────────────────────────────────────┤
│  /shared   (optional — shared Zod schemas / types)   │
└─────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture (Node.js + Express + MongoDB + GraphQL + REST)

### 3.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20+ |
| **Framework** | Express.js (monolithic HTTP server) |
| **Database** | MongoDB with Mongoose ODM |
| **REST API** | Express Router (conventional REST endpoints) |
| **GraphQL API** | Apollo Server Express (served on same Express instance) |
| **Auth** | JWT (access + refresh tokens), bcrypt for password hashing |
| **Validation** | Zod (shared schemas) |
| **File Upload** | multer (for wax seal / letterhead images) |

### 3.2 Project Structure

```
/server
├── index.js                    # Entry: bootstrap Express + Apollo + Mongo
├── config/
│   ├── db.js                   # MongoDB connection
│   ├── env.js                  # Environment variables
│   └── auth.js                 # JWT secrets, token expiry
├── models/
│   ├── User.model.js           # Admin users
│   ├── Guest.model.js          # Invited guests (receive personalized letter)
│   └── Attendee.model.js       # Wedding attendees (RSVP/guest list tracking)
├── middleware/
│   ├── auth.middleware.js       # JWT verification middleware
│   ├── admin.middleware.js      # Admin role check
│   └── error.middleware.js      # Global error handler
├── rest/
│   ├── auth.routes.js          # POST /api/auth/signup, /api/auth/signin, etc.
│   ├── guest.routes.js         # CRUD: /api/guests (letter recipients)
│   ├── invite.routes.js        # GET /api/invites/:slug
│   └── attendee.routes.js      # CRUD: /api/attendees (RSVP + gender tracking)
├── graphql/
│   ├── schema.js               # GraphQL schema definitions
│   ├── resolvers/
│   │   ├── auth.resolver.js    # signUp, signIn, refreshToken, me
│   │   ├── guest.resolver.js   # guests, createGuest, updateGuest, deleteGuest
│   │   ├── invite.resolver.js  # inviteBySlug
│   │   └── attendee.resolver.js
│   └── context.js              # Build GraphQL context (user from JWT)
├── services/
│   ├── auth.service.js         # Sign-up, sign-in, token management
│   ├── guest.service.js        # Guest CRUD
│   ├── invite.service.js       # Slug lookup, letter generation
│   └── attendee.service.js     # Attendee CRUD, bulk import, stats
└── utils/
    ├── slugify.js              # Generate URL-safe slug from name
    ├── token.js                # JWT sign/verify helpers
    └── errors.js               # Custom AppError class
```

---

## 4. Data Models (MongoDB / Mongoose)

### 4.1 `User` model — Admin accounts

```javascript
{
  _id: ObjectId,
  email:         { type: String, unique: true, required: true },
  passwordHash:  { type: String, required: true },
  role:          { type: String, enum: ['admin'], default: 'admin' },
  createdAt:     Date,
  updatedAt:     Date
}
```

### 4.2 `Guest` model — Invited guests (receive personalized letter)

Each guest receives a unique personalized invitation letter at `/invite?invite=<slug>`.

```javascript
{
  _id: ObjectId,
  slug:          { type: String, unique: true, required: true, index: true },
  name:          { type: String, required: true },
  gender:        { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], default: 'other' },
  title:         { type: String, default: '' },
  role:          { type: String, enum: ['Bridesmaid', 'Groomsman', 'Asoebi Lady', 'Asoebi Gentleman', 'Guest', 'Family', 'VIP'], default: 'Guest' },
  message:       { type: String, required: true },
  createdBy:     { type: ObjectId, ref: 'User' },
  createdAt:     Date,
  updatedAt:     Date
}
```

> **Gender field purpose**: Enables the admin to use appropriate honorifics/titles when addressing the invitation (e.g., "Dear Mr. X", "Dear Ms. Y") and to categorize guests for seating arrangements, gift planning, or cultural considerations (e.g., Asoebi colors by gender).

### 4.3 `Attendee` model — Wedding attendee list (RSVP tracking)

This model captures everyone the admin wants to track as wedding attendees, separate from the personalized-invitation "Guest" concept.

```javascript
{
  _id: ObjectId,
  name:          { type: String, required: true },
  gender:        { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], required: true },
  email:         { type: String, default: '' },
  phone:         { type: String, default: '' },
  category:      { type: String, enum: ['family', 'friend', 'colleague', 'plus-one', 'vendor', 'other'], default: 'friend' },
  guestRef:      { type: ObjectId, ref: 'Guest', default: null },
  rsvpStatus:    { type: String, enum: ['pending', 'confirmed', 'declined', 'maybe'], default: 'pending' },
  plusOnes:      { type: Number, default: 0 },
  dietaryNotes:  { type: String, default: '' },
  tableNumber:   { type: String, default: '' },
  notes:         { type: String, default: '' },
  addedBy:       { type: ObjectId, ref: 'User' },
  createdAt:     Date,
  updatedAt:     Date
}
```

> **Why separate `Guest` and `Attendee`?**
> - A **Guest** = someone who receives a personalized invitation letter (the core feature)
> - An **Attendee** = someone the admin wants to track on the actual wedding day (RSVP, seating, dietary needs)
> - Not every attendee needs a personalized letter (e.g., plus-ones, vendors)
> - Not every guest may attend (they could be invited but unable to come)
> - The `guestRef` field links the two when a person has both a letter and an attendee record

---

## 5. REST API Endpoints

### 5.1 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/api/auth/signup` | No | Create admin account |
| **POST** | `/api/auth/signin` | No | Sign in, returns JWT pair |
| **POST** | `/api/auth/refresh` | No | Refresh access token |
| **GET** | `/api/auth/me` | Yes | Get current user |

### 5.2 Guests (Personalized Invitations)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/api/guests` | Yes | List all invited guests |
| **POST** | `/api/guests` | Yes | Create a guest (with gender, role, message) |
| **PUT** | `/api/guests/:slug` | Yes | Update a guest |
| **DELETE** | `/api/guests/:slug` | Yes | Delete a guest |

### 5.3 Invites (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/api/invites/:slug` | No | Get public invite data by guest slug |

### 5.4 Attendees (Wedding Guest List Management)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/api/attendees` | Yes | List all attendees (filters: `?rsvp=confirmed&gender=female`) |
| **POST** | `/api/attendees` | Yes | Add a new attendee (name, gender, category, plus-ones, etc.) |
| **PUT** | `/api/attendees/:id` | Yes | Update an attendee's info |
| **DELETE** | `/api/attendees/:id` | Yes | Remove an attendee |
| **POST** | `/api/attendees/bulk` | Yes | Bulk add multiple attendees (names + genders) |
| **GET** | `/api/attendees/stats` | Yes | Get aggregate stats (total, by gender, by category, by RSVP) |

### 5.5 System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/api/health` | No | Health check |

---

## 6. GraphQL API

Apollo Server mounted at `/graphql`.

### 6.1 Queries

```graphql
type Query {
  me: User
  guests: [Guest!]!
  guestBySlug(slug: String!): Guest
  attendees(filter: AttendeeFilter): [Attendee!]!
  attendee(id: ID!): Attendee
  attendeeStats: AttendeeStats!
  health: Boolean
}
```

### 6.2 Mutations

```graphql
type Mutation {
  signUp(email: String!, password: String!): AuthPayload!
  signIn(email: String!, password: String!): AuthPayload!
  refreshToken(refreshToken: String!): AuthPayload!

  createGuest(input: GuestInput!): Guest!
  updateGuest(slug: String!, input: GuestInput!): Guest!
  deleteGuest(slug: String!): Boolean!

  createAttendee(input: AttendeeInput!): Attendee!
  bulkCreateAttendees(input: [AttendeeInput!]!): [Attendee!]!
  updateAttendee(id: ID!, input: AttendeeInput!): Attendee!
  deleteAttendee(id: ID!): Boolean!
}
```

### 6.3 Types

```graphql
type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}

type User {
  id: ID!
  email: String!
  role: String!
}

type Guest {
  id: ID!
  slug: String!
  name: String!
  gender: Gender!
  title: String
  role: String!
  message: String!
  inviteUrl: String!
  createdAt: String
  updatedAt: String
}

type Attendee {
  id: ID!
  name: String!
  gender: Gender!
  email: String
  phone: String
  category: AttendeeCategory!
  guestRef: Guest
  rsvpStatus: RsvpStatus!
  plusOnes: Int!
  dietaryNotes: String
  tableNumber: String
  notes: String
  createdAt: String
  updatedAt: String
}

type AttendeeStats {
  total: Int!
  confirmed: Int!
  declined: Int!
  pending: Int!
  byGender: [GenderCount!]!
  byCategory: [CategoryCount!]!
}

type GenderCount { gender: Gender!; count: Int! }
type CategoryCount { category: AttendeeCategory!; count: Int! }

enum Gender { male female other prefer-not-to-say }
enum AttendeeCategory { family friend colleague plus-one vendor other }
enum RsvpStatus { pending confirmed declined maybe }

input GuestInput {
  name: String!; gender: Gender; slug: String; title: String
  role: GuestRole!; message: String!
}

input AttendeeInput {
  name: String!; gender: Gender!; email: String; phone: String
  category: AttendeeCategory; guestSlug: String; rsvpStatus: RsvpStatus
  plusOnes: Int; dietaryNotes: String; tableNumber: String; notes: String
}

input AttendeeFilter {
  rsvpStatus: RsvpStatus; gender: Gender
  category: AttendeeCategory; search: String
}
```

---

## 7. Frontend Architecture (Vite + React)

### 7.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18+ (Vite) |
| **Routing** | TanStack Router (file-based) |
| **Data Fetching** | TanStack Query (REST) + Apollo Client (GraphQL) |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **Theme Fonts** | Google Fonts (Cormorant Garamond, Lora, Allura) |

### 7.2 Project Structure

```
/client
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── wax-seal.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── routeTree.gen.ts
    ├── index.css
    │
    ├── routes/
    │   ├── __root.tsx
    │   ├── index.tsx                     # Redirect to /invite
    │   ├── auth.tsx                      # Admin login/signup
    │   ├── _authenticated.tsx            # Auth layout wrapper
    │   ├── invite.tsx                    # Public invite letter page
    │   └── _authenticated/
    │       ├── admin.tsx                 # Guest management (letters)
    │       └── attendees.tsx             # Attendee management (RSVP list)
    │
    ├── components/
    │   ├── ui/
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── modal.tsx
    │   │   ├── select.tsx
    │   │   ├── textarea.tsx
    │   │   ├── badge.tsx
    │   │   ├── stats-card.tsx
    │   │   └── data-table.tsx
    │   ├── invite/
    │   │   ├── Letter.tsx
    │   │   ├── WaxSeal.tsx
    │   │   ├── Envelope.tsx
    │   │   └── LetterContent.tsx
    │   ├── admin/
    │   │   ├── GuestList.tsx
    │   │   ├── GuestCard.tsx
    │   │   ├── GuestForm.tsx
    │   │   ├── GuestActions.tsx
    │   │   └── Header.tsx
    │   └── attendees/
    │       ├── AttendeeList.tsx
    │       ├── AttendeeForm.tsx
    │       ├── AttendeeBulkAdd.tsx
    │       ├── AttendeeFilters.tsx
    │       ├── AttendeeStats.tsx
    │       └── AttendeeRow.tsx
    │
    ├── lib/
    │   ├── api.client.ts
    │   ├── apollo.client.ts
    │   ├── queries/
    │   │   ├── auth.queries.ts
    │   │   ├── guest.queries.ts
    │   │   ├── invite.queries.ts
    │   │   └── attendee.queries.ts
    │   ├── auth.ts
    │   └── utils.ts
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useGuests.ts
    │   ├── useInvite.ts
    │   └── useAttendees.ts
    │
    └── types/
        ├── auth.ts
        ├── guest.ts
        ├── attendee.ts
        └── api.ts
```

### 7.3 Routes

| Route | Auth | Component | Description |
|-------|------|-----------|-------------|
| `GET /` | No | Redirect | Redirects to `/invite` |
| `GET /invite` | No | `InvitePage` | Invite page; reads `?invite=<slug>` |
| `GET /auth` | No | `AuthPage` | Sign in / Sign up form |
| `GET /admin` | Yes | `AdminPage` | Guest management (letter recipients with gender) |
| `GET /admin/attendees` | Yes | `AttendeesPage` | Attendee list with RSVP, gender stats, bulk import |

---

## 8. Admin Features: Attendee Management — Detail

### 8.1 Add Attendee Modal

**Fields:**
- Full name (text, required)
- Gender (select: male / female / other / prefer-not-to-say, required)
- Email (text, optional)
- Phone (text, optional)
- Category (select: family / friend / colleague / plus-one / vendor / other)
- RSVP Status (select: pending / confirmed / declined / maybe)
- Plus-Ones (number, default 0)
- Dietary Notes (textarea, optional)
- Table Number (text, optional)
- Link to Guest Record (optional search/select from existing Guests)

### 8.2 Bulk Add Attendees

Paste multiple names at once:
```
Aisha Mohammed, female
Chidi Okonkwo, male
Tunde Bakare, male
Funmi Adeleke, female
```

Each row creates a new Attendee record. Missing genders default to "other".

### 8.3 Attendee Stats Dashboard

**Cards showing:**
- Total attendees
- Confirmed / Declined / Pending counts
- Gender breakdown: Male: X, Female: Y, Other: Z
- Category breakdown: Family: X, Friends: Y, Colleagues: Z

### 8.4 Attendee Filters & Search

- RSVP status (All / Pending / Confirmed / Declined / Maybe)
- Gender (All / Male / Female / Other)
- Category (All / Family / Friend / Colleague / Plus-One / Vendor)
- Free-text search by name

### 8.5 Gender-Aware Invitation Letters

When rendering the letter for a Guest, the gender field adjusts honorifics:

```javascript
function getHonorific(gender, role) {
  if (role === 'Bridesmaid' || role === 'Asoebi Lady') return '';
  switch (gender) {
    case 'male': return 'Mr. ';
    case 'female': return 'Ms. ';
    default: return '';
  }
}
// "Dear Sophia," (bridesmaid)
// "Dear Mr. Adebayo," (male guest)
// "Dear Alex," (prefer-not-to-say)
```

---

## 9. Implementation Phases

### Phase 1: Project Scaffolding & Backend Foundation (Days 1-2)

1. **Initialize monorepo** — root package.json with workspaces
2. **Express + MongoDB setup**
   - Express server with CORS, JSON body parser, error middleware
   - Mongoose connection to MongoDB (local + Atlas URI via env)
   - Health check endpoint
3. **MongoDB models**
   - `User.model.js` (email, passwordHash, role, timestamps)
   - `Guest.model.js` (slug, name, **gender**, title, role, message, createdBy, timestamps)
   - `Attendee.model.js` (name, **gender**, email, phone, category, guestRef, rsvpStatus, etc.)
4. **Auth system** — bcrypt hashing, JWT generation, auth middleware
   - REST: `/api/auth/signup`, `/api/auth/signin`, `/api/auth/me`
5. **Guest CRUD (REST)** — with slug auto-generation and gender field
6. **Attendee CRUD (REST)** — CRUD + bulk create + stats aggregation + filtering
7. **Public invite endpoint** — `GET /api/invites/:slug`

### Phase 2: GraphQL Layer (Day 3)

1. **Apollo Server** — mount on Express at `/graphql`
2. **GraphQL schema** — all queries/mutations from Section 6
3. **Resolvers** — delegate to service layer
4. **Validation** — Zod schemas shared between REST and GraphQL

### Phase 3: Frontend Scaffolding (Days 4-5)

1. Vite + React + Tailwind + brand CSS variables + Google Fonts
2. TanStack Router with file-based routing
3. Axios instance + Apollo Client setup
4. Auth flow: login/signup form, token storage, route guards

### Phase 4: Admin — Guest Management (Days 5-6)

1. Guest list display (cards) with gender field in form
2. Add/Edit/Delete guest modals
3. Copy invite link & preview buttons

### Phase 5: Admin — Attendee Management (Days 6-7)

1. Attendee table with sortable columns (Name, Gender, Category, RSVP, Plus-Ones, Table)
2. Add attendee modal with all fields
3. Bulk add modal
4. Stats dashboard + filter bar
5. Admin navigation between Invitations and Guest List

### Phase 6: Invite Letter Page (Day 7-8)

1. Gender-aware letter rendering with honorifics
2. Wax seal SVG, animations (Framer Motion)
3. Dynamic SEO meta tags per guest

### Phase 7: Polish & Production (Days 9-10)

1. Error boundaries, validation, API error toasts
2. Loading states (skeletons, spinners)
3. Responsive design
4. Security: rate limiting, Helmet, CORS, input sanitization
5. Environment configuration (.env.example)

---

## 10. Environment Variables

```
# /server/.env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/dear-you-invites
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# /client/.env
VITE_API_URL=http://localhost:4000/api
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

---

## 11. Package Dependencies

### Server (`/server/package.json`)
```json
{
  "dependencies": {
    "express": "^4.21.x",
    "mongoose": "^8.x",
    "@apollo/server": "^4.x",
    "@as-integrations/express": "^1.x",
    "graphql": "^16.x",
    "graphql-tag": "^2.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "zod": "^3.x",
    "cors": "^2.x",
    "helmet": "^8.x",
    "express-rate-limit": "^7.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

### Client (`/client/package.json`)
```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "@tanstack/react-router": "^1.x",
    "@tanstack/react-query": "^5.x",
    "@apollo/client": "^3.x",
    "graphql": "^16.x",
    "framer-motion": "^12.x",
    "lucide-react": "^0.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "vite": "^6.x",
    "@vitejs/plugin-react": "^4.x",
    "@tanstack/router-plugin": "^1.x",
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x",
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x"
  }
}
```

---

## 12. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate Guest vs Attendee models** | Guest = personalized letter recipient; Attendee = wedding guest list tracking. Keeps concerns clean and allows flexibility |
| **Gender on both models** | For Guests: enables appropriate honorifics; For Attendees: enables stats breakdown, cultural planning (Asoebi colors), seating arrangements |
| **Monolithic Express server** | Single deployable unit, simpler than microservices; serves both REST and GraphQL from same port |
| **Both REST + GraphQL** | REST for simple CRUD (admin dashboard), GraphQL for flexible queries (nested data, stats aggregation); share service layer |
| **MongoDB** | Document flexibility for invitation content, easy schema evolution |
| **JWT auth** | Stateless, works well with GraphQL and REST; access + refresh token pattern |
| **TanStack Router + Query** | Type-safe routing + server state management; matches current app architecture |
| **Zod validation** | Shared validation between REST and GraphQL inputs; single source of truth |

---

## 13. API Usage Examples

### Add a single attendee via REST
```bash
curl -X POST http://localhost:4000/api/attendees \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aisha Mohammed",
    "gender": "female",
    "category": "family",
    "rsvpStatus": "confirmed",
    "plusOnes": 1
  }'
```

### Bulk add attendees via REST
```bash
curl -X POST http://localhost:4000/api/attendees/bulk \
  -H "Authorization: Bearer <admin-jwt>" \
  -d '{"attendees": [
    {"name": "Aisha Mohammed", "gender": "female"},
    {"name": "Chidi Okonkwo", "gender": "male"},
    {"name": "Tunde Bakare", "gender": "male"}
  ]}'
```

### Get attendee stats via REST
```bash
curl http://localhost:4000/api/attendees/stats \
  -H "Authorization: Bearer <admin-jwt>"
# Response: { total: 45, confirmed: 32, declined: 5, pending: 8, byGender: [...], byCategory: [...] }
```

### Create a guest with gender via GraphQL
```graphql
mutation {
  createGuest(input: {
    name: "Sophia Adeleke"
    gender: female
    role: Bridesmaid
    title: "My Day One"
    message: "From the moment we met..."
  }) { id slug inviteUrl }
}
```

### Filter attendees via GraphQL
```graphql
query {
  attendees(filter: { rsvpStatus: confirmed, gender: female }) {
    id name category tableNumber
  }
  attendeeStats { total confirmed byGender { gender count } }
}
```

---

## 14. Migration Path (from current Supabase)

| Supabase | MongoDB |
|----------|---------|
| `auth.users` | `User` model (with embedded password hash) |
| `guests` table | `Guest` collection (add `gender` field) |
| (new) | `Attendee` collection |
| Row Level Security | JWT middleware checks |
| Supabase client SDK | Custom auth.service.js + guest.service.js |

---

## 15. Potential Future Enhancements

- RSVP portal — attendees self-confirm via link
- Multiple invitation templates/themes
- Image gallery (wedding photos)
- Registry links in invitations
- Seating chart — drag-and-drop table assignment
- Event countdown timer
- Email delivery — automated invite link + RSVP reminders
- Google Calendar integration
- CSV/Excel export of attendee list
- Print nametags with table numbers
- Audit log for guest/attendee changes
- Multi-language support
- Multiple admin users
