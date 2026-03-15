# PaySaathi

PaySaathi is a financial management platform designed to track receivables, manage invoices, and monitor payment health through a centralized dashboard.

## Tech Stack

### Backend
- Node.js with Express
- TypeScript (ESM)
- PostgreSQL (via Neon.tech)
- node-postgres (pg)

### Frontend
- React 19 with Vite
- TypeScript
- Tailwind CSS v4
- Shadcn UI
- Recharts (for data visualization)
- Lucide React (for iconography)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A PostgreSQL database (Neon.tech recommended)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/StackSamuraiK/paysaathi.git
cd paysaathi
```

### 2. Database Setup
Ensure your PostgreSQL database is running. Create the necessary tables using the provided schema:
```bash
cd backend
# The schema file is located at src/db/schema.sql
```

### 3. Backend Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5001
DB_URL=your_postgresql_connection_string
```

Install dependencies and start the server:
```bash
npm install
npx tsx src/index.ts
```

### 4. Frontend Configuration
The frontend is configured to communicate with the backend on `http://localhost:5001`.

Install dependencies and start the development server:
```bash
cd ../frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Features
- Financial Overview: Real-time tracking of total receivables and overdue amounts.
- Revenue Trends: Visual representation of monthly incoming payments.
- Urgent Attention Table: Quick access to overdue invoices requiring immediate action.
- Data Integration: Automated synchronization with external API services.
- Sidebar Navigation: Dedicated views for Invoices, Customers, and Payments.

## API Endpoints
- GET `/api/insights/receivables`: Fetch total outstanding balances.
- GET `/api/insights/overdue`: Fetch list of overdue invoices.
- GET `/api/customers/:id/summary`: Fetch specific customer financial health.
- POST `/api/sync`: Trigger manual data synchronization.
