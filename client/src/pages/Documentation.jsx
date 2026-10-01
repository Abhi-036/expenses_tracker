import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    body: `Wealthline is a full-stack personal finance app for tracking income and expenses,
setting category budgets, and visualizing spending trends. It's built with React on the
frontend and a Node.js/Express/MongoDB REST API on the backend, connected with JWT-based
authentication so every user only ever sees their own data.`,
  },
  {
    id: 'architecture',
    title: 'Architecture',
    body: `The frontend (client/) is a Vite + React single-page app. It talks to the backend
(server/) exclusively through a REST API under /api. The backend follows an MVC-style
structure: routes define URLs, controllers hold the business logic, and Mongoose models
define the MongoDB schema. A single Axios instance (services/api.js) centralizes the base
URL, the Authorization header, and error handling so components never call fetch/axios directly.`,
  },
  {
    id: 'auth-flow',
    title: 'Authentication Flow (JWT)',
    body: `On register or login, the server verifies credentials (passwords are hashed with
bcrypt, never stored in plain text) and returns a signed JWT. The client stores that token
in localStorage and the Axios interceptor attaches it as "Authorization: Bearer <token>" on
every request. The "protect" middleware on the server verifies the token on each protected
route and attaches the matching user to req.user.`,
  },
  {
    id: 'data-model',
    title: 'Data Model',
    body: `Five Mongoose models back the app: User, Transaction, Category, Budget, and
RecurringTransaction. Every document that belongs to a user stores a "user" field referencing
that User's _id, and every query filters on it.`,
  },
  {
    id: 'budgets',
    title: 'How Budgets Are Calculated',
    body: `A budget stores a category, a limit, and a date range. Progress is computed by
summing expense transactions in that category within the budget's date range, then comparing
that total to the limit. Under 80% is "on track", 80-99% is "near limit", and 100%+ is
"over budget".`,
  },
  {
    id: 'recurring',
    title: 'How Recurring Transactions Work',
    body: `A recurring rule stores an amount, category, frequency, start date, and optional
end date. The processor creates a real Transaction for each due date up to today and saves
how far it got. Because it resumes from lastProcessedDate, running it again does not create
duplicate transactions.`,
  },
  {
    id: 'reports',
    title: 'How Reports Are Generated',
    body: `The dashboard and monthly report endpoints pull the user's transactions for the
relevant period and aggregate totals by type, spending by category, a 6-month income/expense
trend, and comparisons against the previous month.`,
  },
  {
    id: 'charts',
    title: 'Chart.js Usage',
    body: `Charts are built with react-chartjs-2 and Chart.js. Three chart types are used:
a doughnut chart for spending by category, a bar chart comparing income and expenses, and
a line chart showing the 6-month spending trend.`,
  },
  {
    id: 'testing',
    title: 'Jest Testing',
    body: `The backend test suite uses Jest and Supertest with a temporary in-memory MongoDB
instance. It covers authentication, protected routes, transaction CRUD, user isolation,
and budget calculations. Run tests using "npm test" inside the server folder.`,
  },
  {
    id: 'running',
    title: 'Running the Project',
    body: `Start MongoDB locally or use MongoDB Atlas. Inside /server, create your .env file,
run npm install, and then npm run dev. Inside /client, create your .env file, run npm install,
and then npm run dev. The frontend normally runs at http://localhost:5173 and the API at
http://localhost:5000/api.`,
  },
];

export default function Documentation() {
  const [openId, setOpenId] = useState('overview');

  return (
    <MainLayout title="Documentation">

      <div className="page-header">
        <div>
          <h1>How It Works</h1>
          <p>
            A guided tour of the architecture, authentication flow,
            and core logic.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 6 }}>

        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              borderBottom:
                '1px solid var(--border-subtle)'
            }}
          >

            <button
              onClick={() =>
                setOpenId(
                  openId === section.id
                    ? null
                    : section.id
                )
              }
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: 14.5,
                cursor: 'pointer',
              }}
            >
              {section.title}

              <span
                style={{
                  color: 'var(--text-muted)'
                }}
              >
                {openId === section.id ? '−' : '+'}
              </span>

            </button>

            {openId === section.id && (
              <p
                style={{
                  padding: '0 16px 18px',
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}
              >
                {section.body}
              </p>
            )}

          </div>
        ))}

      </div>

    </MainLayout>
  );
}
