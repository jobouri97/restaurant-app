# Restaurant Web App

A full-stack restaurant ordering and management application for small and medium-sized restaurants. Restaurant owners can manage their menu and tables, while customers scan a table-specific QR code to browse the menu, customize items, submit requests, and follow their order status in real time.

## Live Demo

[Open the deployed application](https://restaurant-app-frontend-u7a0.onrender.com)

## Features

### Restaurant dashboard

- Email/password authentication and Google sign-in
- Category management with category images
- Menu item management with descriptions, prices, images, and availability
- Custom ingredients and selectable options for every item
- Restaurant table management
- A unique, printable QR code for every table
- Live incoming-request board with a sound notification
- Real-time request status updates: pending, accepted, preparing, ready, and completed
- Sales history with request items, selected options, totals, and date filtering

### Customer ordering

- No account or app installation required
- Opens the correct table menu by scanning its QR code
- Category filtering and mobile-friendly menu browsing
- Item customization using ingredient options
- Identical items with identical options are grouped into one cart line
- Collapsible mobile cart that keeps the menu visible
- Live order tracking after submission
- Previously submitted requests remain accessible on the same device for a limited time

## How It Works

1. The restaurant owner creates categories, menu items, ingredients, and ingredient options.
2. The owner creates restaurant tables and prints each table's QR code.
3. A customer scans the QR code and opens the menu for that table.
4. The customer selects items, customizes their options, and submits a request.
5. The dashboard receives the request instantly through Socket.IO and plays a notification sound.
6. The restaurant updates the request status, and the customer sees each update in real time.
7. Completed requests are added to the restaurant's sales history.

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- Socket.IO Client
- Google OAuth
- QRCode React

### Backend

- Node.js
- Express 5
- Socket.IO
- PostgreSQL
- `pg`
- JSON Web Tokens
- bcrypt
- Google Auth Library

### Infrastructure

- Neon PostgreSQL
- Render
- Google Cloud OAuth 2.0

## Project Structure

```text
restaurant-app/
├── backend/
│   ├── controllers/       # Request handlers and application logic
│   ├── middleware/        # Authentication middleware
│   ├── migrations/        # Incremental PostgreSQL migrations
│   ├── models/            # Database queries
│   ├── routes/            # API endpoints
│   ├── scripts/           # Migration runner
│   ├── src/               # Server, database, and Socket.IO setup
│   └── neon-schema.sql    # Complete schema for a new Neon database
├── frontend/
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── hooks/         # React hooks
│       ├── pages/         # Authentication, admin, and customer pages
│       ├── services/      # Backend API clients
│       └── utils/         # Shared frontend helpers
└── README.md
```

## Getting Started

### Requirements

- Node.js 20 or later
- npm
- A PostgreSQL database, such as a Neon project
- A Google OAuth 2.0 Web Client ID for Google sign-in

### 1. Clone the repository

```bash
git clone https://github.com/jobouri97/restaurant-app.git
cd restaurant-app
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
DIRECT_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
DB_POOL_MAX=5

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

GOOGLE_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
```

`DATABASE_URL` is used by the running application. `DIRECT_DATABASE_URL` is used by the migration script when provided.

Generate a JWT secret with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Create the database tables

For a new, empty Neon database, open the Neon SQL Editor and run:

```text
backend/neon-schema.sql
```

For a database already managed by this project's incremental migrations, run:

```bash
npm run migrate
```

Do not initialize the same empty database using both methods.

### 4. Start the backend

```bash
npm run dev
```

The API runs at `http://localhost:5000` by default. Check it at:

```text
http://localhost:5000/api/health
```

### 5. Configure and start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
```

Then start Vite:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Google OAuth Setup

In Google Cloud Console, create an OAuth 2.0 Client ID with the application type **Web application**.

Add these authorized JavaScript origins:

```text
http://localhost:5173
https://restaurant-app-frontend-u7a0.onrender.com
```

This application uses Google Identity Services in the browser and sends the returned credential to the backend for verification. It does not use a Google redirect callback, so **Authorized redirect URIs can remain empty**.

Use the same Web Client ID for `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`.

## Useful Commands

### Backend

```bash
npm run dev       # Start with nodemon
npm start         # Start with Node.js
npm run migrate   # Apply SQL migrations
```

### Frontend

```bash
npm run dev       # Start the Vite development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run preview   # Preview the production build locally
```

## Main Routes

### Frontend

| Route | Purpose |
| --- | --- |
| `/auth` | Restaurant owner registration and sign-in |
| `/admin` | Protected restaurant dashboard |
| `/order/:qrCode` | Public customer menu and ordering page |

### Backend

| API prefix | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, Google sign-in, and current user |
| `/api/categories` | Category management |
| `/api/items` | Menu item and customization management |
| `/api/tables` | Restaurant table and QR-code management |
| `/api/requests` | Authenticated request management |
| `/api/profits` | Completed-request sales history |
| `/api/public` | Public menu, submission, and tracking endpoints |
| `/api/health` | Server and database health check |

## Deployment

The project can be deployed as two Render services:

- **Backend:** Node web service using the `backend` directory
- **Frontend:** Static site using the `frontend` directory and `frontend/dist` output

Set the production environment variables in Render rather than committing `.env` files. The backend's `FRONTEND_URL` must exactly match the deployed frontend origin, including `https://` and without a trailing slash.

For a client-side React deployment, configure Render to rewrite unknown frontend routes to `/index.html`.

## Security Notes

- Passwords are hashed with bcrypt.
- Protected endpoints require a signed JWT.
- Google credentials are verified by the backend.
- Restaurant-owned records are scoped to the authenticated user.
- Customer requests use non-guessable tracking tokens.
- Secrets and database connection strings belong only in environment variables.

## Author

Developed by [jobouri97](https://github.com/jobouri97).
