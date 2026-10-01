WEALTHLINE
Smart Expense & Budget Management App
Complete Technical Report — Code, Technologies, and Installation Guide
Stack: React · Node.js · Express.js · MongoDB · Mongoose · JWT · Axios · Chart.js · Jest
Prepared for: Full-stack MERN project documentation / academic viva reference
Generated: August 16, 2026
 
Table of Contents
1. Project Overview
2. Technology Stack Summary
3. Installation & Setup Guide
4. Technology Deep Dive
5. Backend Code Explanation (server/)
6. Frontend Code Explanation (client/src/)
7. Authentication Flow, Step by Step
8. Business Logic Deep Dives
9. REST API Reference
10. Viva / Interview Quick-Reference
11. Troubleshooting
 
1. Project Overview
Wealthline is a full-stack, production-style personal finance and budgeting web application built on the MERN stack (MongoDB, Express.js, React, Node.js). It allows a user to register an account, log income and expenses, organize them into categories, set monthly or yearly budgets per category, automate recurring transactions, and view analytics through an interactive dashboard and monthly reports.
The application is deliberately structured the way a real SaaS product would be: a stateless REST API on the backend that never trusts the client, a JWT-based authentication layer so every user only ever sees their own financial data, and a component-driven React frontend that talks to that API exclusively through a centralized Axios service layer.
1.1 Core Features
•	User registration and login secured with JWT and hashed passwords (bcrypt)
•	Dashboard with total balance, income, expenses, monthly savings, and four Chart.js visualizations
•	Transaction management: add, edit, delete, search, filter by type/category/month, sort, and paginate
•	Category-based budgets with live progress tracking (on track / near limit / exceeded)
•	Recurring transactions (daily, weekly, monthly, yearly) that generate real transactions automatically without duplication
•	Default and custom income/expense categories, scoped per user
•	Monthly reports with category breakdown, highest spending category, and month-over-month comparison
•	CSV export of transaction data
•	Sample/demo data seeding plus a one-click "Reset Data" option
•	Fully responsive, dark "executive fintech" UI with a maroon/burgundy gradient theme
•	Jest + Supertest automated test suite for the API, run against an in-memory MongoDB instance
1.2 Who This Report Is For
This document is written to be usable both as a reference while setting up the project on a new machine, and as a study guide before explaining the code in a viva, interview, or code review. Each major technology is explained at the level of "what it is, why it is used here, and where in the codebase it appears," and every important file is walked through individually.
 
2. Technology Stack Summary
The table below summarizes every major technology used in the project, its role, and where it lives in the codebase.

Layer	Technology	Role in this project
Frontend framework	React 18 (Vite)	Builds the single-page application UI as reusable components
Routing	React Router v6	Client-side navigation between pages without full page reloads
HTTP client	Axios	Sends all requests from the browser to the Express API
Charts	Chart.js + react-chartjs-2	Renders the doughnut, bar, and line charts on the dashboard/reports
Backend runtime	Node.js	Runs the JavaScript server outside the browser
Backend framework	Express.js	Defines REST routes, middleware, and request handling
Database	MongoDB	Stores users, transactions, budgets, categories, and recurring rules
ODM	Mongoose	Defines schemas/models and validates data before it reaches MongoDB
Authentication	JSON Web Tokens (JWT)	Proves a request comes from a logged-in user, without server-side sessions
Password security	bcrypt.js	One-way hashes passwords so plain text is never stored
Validation	express-validator	Validates and sanitizes incoming request bodies
Testing	Jest + Supertest	Automated tests for API endpoints and business logic
Test database	mongodb-memory-server	Spins up a temporary in-memory MongoDB so tests never touch real data
Styling	Plain CSS (CSS variables)	Implements the dark maroon theme without a CSS framework
 
3. Installation & Setup Guide
3.1 Prerequisites
•	Node.js version 18 or later (includes npm)
•	MongoDB running locally on the default port 27017, or a MongoDB Atlas cloud connection string
•	A code editor such as VS Code (recommended, not required)
•	Git, if cloning from a repository
3.2 Project Structure
expense-tracker/
├── server/                  # Express REST API
│   ├── config/db.js          # MongoDB connection logic
│   ├── models/               # Mongoose schemas
│   ├── controllers/          # Business logic per resource
│   ├── routes/               # Express route definitions
│   ├── middleware/           # auth.js, errorHandler.js
│   ├── utils/                # token, budget math, recurring engine, seed data
│   ├── tests/                # Jest test suite
│   ├── server.js             # App entry point
│   └── .env.example
└── client/                  # React (Vite) frontend
    ├── src/
    │   ├── components/       # Reusable UI pieces + Chart.js charts
    │   ├── pages/             # One file per route/screen
    │   ├── layouts/           # MainLayout (sidebar + navbar wrapper)
    │   ├── context/           # AuthContext (global auth state)
    │   ├── services/          # Centralized Axios API modules
    │   ├── utils/             # formatters.js
    │   └── App.jsx / main.jsx / index.css
    └── .env.example
3.3 Backend Installation
1.	Open a terminal and navigate into the server folder: cd server
2.	Copy the environment template: cp .env.example .env
3.	Open .env and set MONGO_URI (leave the default if MongoDB runs locally) and a long random value for JWT_SECRET
4.	Install dependencies: npm install
5.	(Optional) Seed sample data and a demo account: npm run seed
6.	Start the development server: npm run dev
7.	The API is now running at http://localhost:5000 — verify with a browser or curl at http://localhost:5000/api/health

$ cd server
$ cp .env.example .env
$ npm install
$ npm run seed        # optional: creates demo@expensetracker.app / demo1234
$ npm run dev
Server running in development mode on port 5000
MongoDB connected: 127.0.0.1
3.4 Backend Dependencies (package.json)
Package	Purpose
express	Web framework — routing, middleware, request/response handling
mongoose	MongoDB object modeling — schemas, validation, queries
Jsonwebtoken(JWT)	Signs and verifies JWT access tokens
bcryptjs	Hashes and compares user passwords
express-validator	Declarative validation for request bodies
cors	Enables cross-origin requests from the React frontend
dotenv	Loads environment variables from .env
morgan	HTTP request logging in development
jest (dev)	Test runner / assertion framework
supertest (dev)	Sends HTTP requests to the Express app in tests
mongodb-memory-server (dev)	In-memory MongoDB instance for isolated testing
nodemon (dev)	Restarts the server automatically on file changes
cross-env (dev)	Sets NODE_ENV consistently across operating systems
3.5 Frontend Installation
8.	Open a new terminal and navigate into the client folder: cd client
9.	Copy the environment template: cp .env.example .env
10.	Confirm VITE_API_URL points at the backend, e.g. http://localhost:5000/api
11.	Install dependencies: npm install
12.	Start the development server: npm run dev
13.	Open the printed URL, typically http://localhost:5173, in a browser

$ cd client
$ cp .env.example .env
$ npm install
$ npm run dev
  VITE ready in 400 ms
  ➜  Local:   http://localhost:5173/
3.6 Frontend Dependencies (package.json)
Package	Purpose
react / react-dom	Core UI library and DOM renderer
react-router-dom	Client-side routing between pages
axios	Promise-based HTTP client used for every API call
chart.js	Canvas-based charting engine
react-chartjs-2	React wrapper/bindings for Chart.js
vite (dev)	Development server and production bundler
@vitejs/plugin-react (dev)	Enables JSX/Fast Refresh support in Vite
3.7 Running the Automated Tests
The backend ships with a Jest test suite covering authentication, transaction CRUD and per-user data isolation, and budget-progress calculations. Tests run against a temporary in-memory MongoDB instance, so they are safe to run at any time without affecting real data.
$ cd server
$ npm test
 
 PASS  tests/budgetCalc.test.js
 PASS  tests/auth.test.js
 PASS  tests/transaction.test.js
 PASS  tests/budget.test.js
3.8 Building for Production
14.	Frontend: inside client, run npm run build — this outputs static, optimized files to client/dist
15.	Preview the production build locally (optional): npm run preview
16.	The project includes a root vercel.json that deploys client/ and server/ together using Vercel Services.
17.	For Vercel production, use MongoDB Atlas (or another externally reachable MongoDB) and set MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, and NODE_ENV=production in Vercel Environment Variables.
18.	The frontend uses same-origin /api in production, so VITE_API_URL does not need to contain localhost. Keep client/.env local-only.
19.	Deploy from the project root (the folder containing vercel.json) with the current Vercel CLI: vercel login, vercel link, vercel deploy --prod
20.	Keep the existing local setup unchanged: client http://localhost:5173/ and server http://localhost:5000/

3.9 Vercel Deployment Notes
•	vercel.json defines two services: client (Vite) and server (Express), with /api/* routed to the server and all other paths routed to the client.
•	server/server.js exports the Express app for Vercel while still starting normally with npm run dev or npm start when executed directly.
•	server/config/db.js caches the Mongoose connection so warm Vercel invocations reuse the existing connection.
•	The local server message remains: “Server running in development mode on port 5000”.
•	Do not commit .env files. The repository .gitignore excludes them; use .env.example files as templates.
 
4. Technology Deep Dive
4.1 React
What it is: A JavaScript library for building user interfaces out of small, reusable pieces called components. It uses a virtual DOM to efficiently update only the parts of the page that actually change.
Why it is used here: React lets the dashboard, transaction list, budget cards, and forms all be built as independent, testable components that re-render automatically whenever their underlying data (state) changes — for example, adding a transaction instantly updates the dashboard charts without a page reload.
Where it is used: The entire client/src folder. Key files: main.jsx (mounts the app), App.jsx (defines routes), every file under pages/ and components/.
4.2 Node.js
What it is: A JavaScript runtime built on Chrome’s V8 engine that lets JavaScript run outside the browser, on a server.
Why it is used here: Node.js runs the Express API, handles incoming HTTP requests, talks to MongoDB, and generates JWTs — all in the same language (JavaScript) used on the frontend, which keeps the whole stack consistent.
Where it is used: The entire server/ folder runs on Node.js; server.js is the process entry point started by npm run dev or npm start.
4.3 Express.js
What it is: A minimal, unopinionated web framework for Node.js that provides routing, middleware support, and request/response helpers on top of Node’s built-in HTTP module.
Why it is used here: Express organizes the API into clean routes (server/routes/*.js) that delegate to controllers (server/controllers/*.js), with middleware handling cross-cutting concerns like authentication (middleware/auth.js) and centralized error handling (middleware/errorHandler.js).
Where it is used: server.js wires everything together: app.use() mounts each route file under a base path such as /api/transactions.
4.4 MongoDB
What it is: A document-oriented NoSQL database that stores data as flexible, JSON-like documents (BSON) instead of rows in fixed tables.
Why it is used here: Financial data such as transactions naturally varies in shape (a recurring expense has different optional fields than a one-off income entry), and MongoDB’s schema flexibility, combined with Mongoose’s validation layer, gives the best of both worlds: flexibility with safety.
Where it is used: Every model file in server/models/ defines a MongoDB collection: users, transactions, budgets, categories, recurringtransactions (Mongoose pluralizes and lowercases model names automatically).
4.5 Mongoose
What it is: An Object Data Modeling (ODM) library for MongoDB and Node.js. It maps JavaScript classes/schemas to MongoDB documents and adds validation, middleware hooks, and query helpers.
Why it is used here: Mongoose schemas (e.g. TransactionSchema) enforce that an amount is always a positive number and a type is always "income" or "expense" before anything reaches the database, and pre-save hooks (like password hashing on User) run automatically.
Where it is used: server/models/*.js define the schemas; every controller uses Mongoose methods like Model.find(), Model.create(), Model.findOneAndDelete() to talk to MongoDB.
4.6 Axios
What it is: A promise-based HTTP client for the browser and Node.js, used here purely on the frontend to call the backend REST API.
Why it is used here: A single, centralized Axios instance (client/src/services/api.js) avoids repeating the base URL and auth header in every component. An interceptor automatically attaches the JWT to every outgoing request and automatically logs the user out if a request comes back 401 Unauthorized.
Where it is used: client/src/services/api.js (the instance) plus one small service module per resource — authService.js, transactionService.js, budgetService.js, categoryService.js, recurringService.js, reportService.js.
4.7 JSON Web Tokens (JWT)
What it is: A compact, URL-safe, digitally signed token format used to represent claims (here, just the user’s ID) that can be verified without a database lookup on every request.
Why it is used here: JWT lets the API stay stateless — there is no server-side session store. On login, the server signs a token containing the user’s ID; the client stores it and sends it back on every future request; the server verifies its signature and trusts the ID inside it.
Where it is used: server/utils/generateToken.js signs tokens; server/middleware/auth.js verifies them on every protected route; the frontend stores the token in localStorage and attaches it via the Axios interceptor in services/api.js.
4.8 Jest
What it is: A JavaScript testing framework that provides a test runner, assertion library (expect), and mocking utilities in one package.
Why it is used here: Automated tests catch regressions before they reach production — for example, a bug in budget percentage math or a broken authorization check would be caught by npm test instead of discovered by a user.
Where it is used: server/tests/*.test.js. budgetCalc.test.js tests pure functions directly; auth.test.js, transaction.test.js, and budget.test.js use Supertest to send real HTTP requests into the Express app against an in-memory database.
4.9 Chart.js (via react-chartjs-2)
What it is: A canvas-based charting library. react-chartjs-2 is a thin wrapper that lets Chart.js configurations be written as React components and props.
Why it is used here: Turns raw financial numbers into an at-a-glance dashboard: a doughnut chart for spending by category, a bar chart comparing income vs. expenses, and a line chart for the 6-month spending trend.
Where it is used: client/src/components/charts/ — chartSetup.js registers the Chart.js modules once; ExpenseDoughnut.jsx, IncomeExpenseBar.jsx, and SpendingLineChart.jsx each wrap one chart type.
 
5. Backend Code Explanation (server/)
5.1 Entry Point & Configuration
server.js
What it does: The application’s entry point. Creates the Express app, applies global middleware (CORS, JSON body parsing, request logging), mounts every route module under /api/*, and starts the HTTP server.
Main functions / exports: The default-exported Express app instance; connectDB() is only called when the file is run directly, not when it is imported by the Jest test suite.
How it connects to other files: Imports every file under routes/ and the two functions from middleware/errorHandler.js. It is imported directly (not started) by every test file, via require("../server"), so Supertest can send requests to it in-memory.

config/db.js
What it does: Establishes the connection to MongoDB using Mongoose, reading the connection string from the MONGO_URI environment variable. The connection is cached and reused for warm serverless invocations.
Main functions / exports: A single async function, connectDB().
How it connects to other files: Called once from server.js when the server starts for real (not during tests, where mongodb-memory-server provides its own connection).

5.2 Models (Mongoose Schemas)
models/User.js
What it does: Defines the shape of a user account: name, email (unique), a hashed password (never returned by default queries), preferred currency, and avatar color.
Main functions / exports: A pre("save") hook that hashes the password with bcrypt whenever it changes; an instance method comparePassword() for login checks; a toJSON() override that strips the password field from any response.
How it connects to other files: Referenced by every other model via a "user" ObjectId field, and used directly by controllers/authController.js for registration, login, and profile updates.

models/Transaction.js
What it does: Defines a single income or expense entry: type, amount, category, description, date, payment method, and whether it was generated by a recurring rule.
Main functions / exports: Schema definition with validation (amount must be > 0, type must be "income" or "expense") and compound indexes on {user, date} and {user, category} for fast filtering.
How it connects to other files: Created, read, updated, and deleted by controllers/transactionController.js; also created automatically by utils/recurringProcessor.js when a recurring rule comes due; read by controllers/reportController.js and budgetController.js to compute totals.

models/Budget.js
What it does: Defines a spending limit for one category over a date range (monthly or yearly).
Main functions / exports: Schema definition only — the actual "how much has been spent" calculation is intentionally NOT stored on the model; it is computed on read.
How it connects to other files: Created/read/updated/deleted by controllers/budgetController.js, which combines each Budget document with live Transaction data via utils/budgetCalc.js.

models/Category.js
What it does: Defines a named income or expense category belonging to one user, with a color and icon for the UI, and an isDefault flag protecting the seeded starter categories from deletion.
Main functions / exports: A unique compound index on {user, name, type} prevents duplicate categories per user.
How it connects to other files: Seeded automatically for every new user by controllers/authController.js at registration time; managed by controllers/categoryController.js afterward.

models/RecurringTransaction.js
What it does: Defines a rule for a transaction that repeats on a schedule: amount, category, frequency, start/end dates, and a lastProcessedDate watermark.
Main functions / exports: Schema definition only; the generation logic lives in utils/recurringProcessor.js so it can be unit-tested and reused.
How it connects to other files: Managed by controllers/recurringController.js, which calls processRecurringRule() from utils/recurringProcessor.js both immediately on creation and via a manual "process" endpoint.

5.3 Middleware
middleware/auth.js
What it does: Protects private routes. Reads the "Authorization: Bearer <token>" header, verifies the JWT signature, looks up the matching user in MongoDB, and attaches it to req.user for downstream controllers to use.
Main functions / exports: A single Express middleware function, protect().
How it connects to other files: Imported by every route file except authRoutes.js’s public register/login endpoints, e.g. router.use(protect) at the top of transactionRoutes.js.

middleware/errorHandler.js
What it does: Centralizes error responses so every controller can simply call next(err) or let a thrown error propagate, instead of writing try/catch response formatting everywhere.
Main functions / exports: errorHandler() maps Mongoose errors (CastError, ValidationError, duplicate key 11000) to clean HTTP status codes and messages; notFound() handles unmatched routes with a 404.
How it connects to other files: Registered last in server.js, after all routes, per Express convention for error-handling middleware.

5.4 Controllers (Business Logic)
controllers/authController.js
What it does: Implements registration (with automatic default-category seeding), login, fetching the current profile, updating profile fields, and changing password.
Main functions / exports: register(), login(), getMe(), updateProfile(), changePassword().
How it connects to other files: Uses models/User.js and models/Category.js, and utils/generateToken.js to issue JWTs. Wired into routes/authRoutes.js.

controllers/transactionController.js
What it does: Implements the full transaction lifecycle: paginated/searchable/sortable listing, single-record fetch, create, update, delete, CSV export, and a demo-data reset.
Main functions / exports: getTransactions(), getTransaction(), createTransaction(), updateTransaction(), deleteTransaction(), exportTransactionsCSV(), resetDemoData().
How it connects to other files: Every query is scoped with { user: req.user._id }, which is how per-user data isolation is enforced. Wired into routes/transactionRoutes.js.

controllers/budgetController.js
What it does: Implements budget CRUD and, on every read, joins each budget with the user’s transactions to compute live spend/remaining/percentUsed/status.
Main functions / exports: getBudgets(), getBudget(), createBudget(), updateBudget(), deleteBudget().
How it connects to other files: Delegates the actual math to utils/budgetCalc.js so that logic can be unit-tested independently of MongoDB. Wired into routes/budgetRoutes.js.

controllers/categoryController.js
What it does: Implements category CRUD, blocking edits/deletes on default (seeded) categories and blocking deletion of a category that is still in use by existing transactions.
Main functions / exports: getCategories(), createCategory(), updateCategory(), deleteCategory().
How it connects to other files: Wired into routes/categoryRoutes.js; reads models/Transaction.js to check for in-use categories before deleting.

controllers/recurringController.js
What it does: Implements CRUD for recurring rules and exposes an endpoint to manually trigger processing of all due rules.
Main functions / exports: getRecurring(), createRecurring(), updateRecurring(), deleteRecurring(), processAllRecurring().
How it connects to other files: Delegates transaction generation to utils/recurringProcessor.js. Wired into routes/recurringRoutes.js.

controllers/reportController.js
What it does: Aggregates raw transactions into the dashboard summary (totals, category breakdown, 6-month trend, budget overview, recent transactions) and the monthly report (income/expenses/savings, category breakdown, previous-month comparison, budget performance).
Main functions / exports: getDashboardSummary(), getMonthlyReport().
How it connects to other files: Reads models/Transaction.js and models/Budget.js directly and reuses utils/budgetCalc.js for consistency with the Budgets page. Wired into routes/reportRoutes.js.

5.5 Utilities
utils/generateToken.js
What it does: Signs a JWT containing the user’s ID, using JWT_SECRET and an expiry from the environment.
Main functions / exports: A single function, generateToken(userId).
How it connects to other files: Called by authController.js after a successful register or login.

utils/budgetCalc.js
What it does: Pure, dependency-free functions that compute how much has been spent in a category within a date range, and turn that into a budget’s progress summary (spent, remaining, percentUsed, status).
Main functions / exports: sumSpentForCategory(), calculateBudgetProgress().
How it connects to other files: Because these functions take plain arrays/objects and return plain objects (no Mongoose, no Express), they are directly unit-tested in tests/budgetCalc.test.js and reused by both budgetController.js and reportController.js.

utils/recurringProcessor.js
What it does: Contains the logic that turns a recurring rule into real Transaction documents, advancing one interval at a time from the rule’s lastProcessedDate up to today, and saving that watermark so re-running it never creates duplicates.
Main functions / exports: getNextDate(from, frequency), processRecurringRule(rule).
How it connects to other files: Called by recurringController.js both when a rule is first created (to catch up on already-due dates) and via the manual /process endpoint.

utils/seedData.js
What it does: Exports the list of default categories created for every new user, and doubles as a standalone script (npm run seed) that creates a demo account with realistic sample transactions and budgets.
Main functions / exports: DEFAULT_CATEGORIES (exported constant); runStandaloneSeed() (only runs when the file is executed directly with node utils/seedData.js).
How it connects to other files: DEFAULT_CATEGORIES is imported by authController.js during registration; the standalone seed script is a developer convenience, not part of the request/response cycle.

 
6. Frontend Code Explanation (client/src/)
6.1 Application Bootstrap
main.jsx
What it does: The React entry point. Mounts the App component into the DOM, wrapped in BrowserRouter (enables client-side routing) and AuthProvider (makes auth state available everywhere).
Main functions / exports: A single ReactDOM.createRoot(...).render(...) call.
How it connects to other files: Imports App.jsx, context/AuthContext.jsx, and index.css. This is the file referenced by index.html’s <script type="module" src="/src/main.jsx">.

App.jsx
What it does: Defines every route in the application using React Router, wrapping every private page in ProtectedRoute so an unauthenticated visitor is redirected to /login.
Main functions / exports: A single App() component returning a <Routes> tree.
How it connects to other files: Imports every page under pages/ and components/ProtectedRoute.jsx.

6.2 Global State
context/AuthContext.jsx
What it does: Provides the current logged-in user, a loading flag, and login/register/logout/updateUser functions to the entire app via React Context, avoiding prop-drilling the user object through every component.
Main functions / exports: AuthProvider (wraps the app), useAuth() (the hook every component calls to read/update auth state).
How it connects to other files: On mount, if a JWT already exists in localStorage, it calls authService.getMe() to re-hydrate the user (keeps the user logged in across page refreshes). Used by ProtectedRoute.jsx, Navbar.jsx, Sidebar.jsx, and every page that needs the current user’s name/currency.

6.3 Services (Axios API Layer)
services/api.js
What it does: Creates the single, shared Axios instance for the whole app: sets the base URL from VITE_API_URL, attaches the JWT to every outgoing request via a request interceptor, and logs the user out automatically on a 401 response via a response interceptor.
Main functions / exports: The default-exported axios instance; getErrorMessage(err), a helper that extracts a user-friendly message from any Axios error.
How it connects to other files: Imported by every other file in services/, and by getErrorMessage() calls in forms across pages/ and components/.

services/authService.js, transactionService.js, budgetService.js, categoryService.js, recurringService.js, reportService.js
What it does: One thin module per backend resource, each exposing plain async functions (e.g. transactionService.getAll(), .create(), .update(), .remove()) that call api.js and unwrap response.data.
Main functions / exports: CRUD-style functions matching the corresponding backend controller’s endpoints.
How it connects to other files: This is the only place in the frontend that constructs API URLs — pages and components call these functions instead of using axios directly, which is what "centralized Axios service" means in practice.

6.4 Reusable Components
components/Sidebar.jsx & Navbar.jsx
What it does: Sidebar renders the primary navigation (Dashboard, Transactions, Budgets, Categories, Reports, Recurring, Profile, Documentation) using React Router’s NavLink for automatic active-state styling, plus a logout button. Navbar renders the top bar, including the mobile menu toggle and the current user’s avatar chip.
Main functions / exports: Sidebar({ open, onClose }), Navbar({ onMenuClick, title, subtitle, search, onSearchChange }).
How it connects to other files: Both are composed together inside layouts/MainLayout.jsx, which every private page wraps itself in.

components/DashboardCard.jsx, TransactionTable.jsx, TransactionForm.jsx, BudgetCard.jsx, BudgetForm.jsx
What it does: Presentational and form components: DashboardCard renders one stat tile; TransactionTable renders a list of transactions with edit/delete actions; TransactionForm and BudgetForm are controlled forms with client-side validation used for both "create" and "edit" (the same form component is reused, switching mode based on whether an "initial" record is passed in).
Main functions / exports: Each exports a single default React component taking props for its data and callback handlers (onSubmit, onEdit, onDelete, etc.).
How it connects to other files: Used by pages/Dashboard.jsx, pages/Transactions.jsx, and pages/Budgets.jsx respectively.

components/Modal.jsx, Loader.jsx, EmptyState.jsx, ErrorMessage.jsx, ProtectedRoute.jsx
What it does: Shared UI primitives used across nearly every page: Modal is a reusable dialog wrapper (closes on Escape or backdrop click); Loader shows a spinner during data fetches; EmptyState and ErrorMessage give consistent "nothing here" and "something went wrong" screens; ProtectedRoute guards private routes and redirects unauthenticated visitors to /login.
Main functions / exports: One default-exported component each.
How it connects to other files: Composed into nearly every page component to keep loading/empty/error handling consistent app-wide.

components/charts/*.jsx
What it does: chartSetup.js registers the Chart.js building blocks used across the app exactly once (avoiding duplicate registration warnings) and defines the shared color palette and tooltip theme. ExpenseDoughnut.jsx, IncomeExpenseBar.jsx, and SpendingLineChart.jsx each wrap one Chart.js chart type with data/options tailored to the dark maroon theme, and fall back to an EmptyState when there is no data yet.
Main functions / exports: One default-exported chart component per file, each taking a "data" prop already shaped by the backend report endpoints.
How it connects to other files: Used by pages/Dashboard.jsx and pages/Reports.jsx.

6.5 Pages
pages/Login.jsx & Register.jsx
What it does: Public authentication screens. Both are controlled forms that call useAuth().login() / .register(), redirect to the dashboard on success, and surface backend validation errors inline.
Main functions / exports: Login(), Register() — default-exported page components.
How it connects to other files: Use context/AuthContext.jsx directly (not a service) since auth state must update globally on success.

pages/Dashboard.jsx
What it does: The main landing page after login. Loads the dashboard summary and category list in parallel, renders four stat cards, three charts, a recent-transactions list, and a budget-progress panel, and includes an "Add Transaction" modal and a "Reset Data" action.
Main functions / exports: A single default-exported Dashboard() component with local state for the summary, loading/error flags, and modal visibility.
How it connects to other files: Calls reportService.getDashboard(), transactionService.create()/resetDemoData(), and categoryService.getAll(); composes DashboardCard, the three chart components, Modal, and TransactionForm.

pages/Transactions.jsx
What it does: The full transaction management screen: search box, type/category filters, sort dropdown, pagination, CSV export, and an add/edit modal reusing TransactionForm.
Main functions / exports: Transactions() — manages filters, page number, and modal/editing state.
How it connects to other files: Calls transactionService for all CRUD + export operations and categoryService.getAll() to populate filter/form dropdowns; renders TransactionTable.

pages/Budgets.jsx, Categories.jsx, Recurring.jsx
What it does: Budgets.jsx lists budget cards with progress bars and an add/edit modal (BudgetForm). Categories.jsx splits income/expense categories into two panels with a simple add-category modal, blocking deletion of defaults or in-use categories. Recurring.jsx lists recurring rules in a table with a "Run Now" button to manually trigger generation, plus an add-rule modal.
Main functions / exports: One default-exported page component per file.
How it connects to other files: Call budgetService, categoryService, and recurringService respectively; all three read categoryService.getAll() to populate their forms.

pages/Reports.jsx
What it does: Lets the user pick a month/year and view that period’s income, expenses, savings, savings rate, category breakdown (doughnut chart), highlights (highest spending category, month-over-month deltas), and budget performance bars.
Main functions / exports: Reports() plus two small local presentational helpers, StatBox and Highlight.
How it connects to other files: Calls reportService.getMonthly({ year, month }); reuses the ExpenseDoughnut chart component.

pages/Profile.jsx
What it does: Lets the user update their name, preferred currency, and avatar color, change their password, and log out.
Main functions / exports: Profile() with two independent forms and their own loading/message state.
How it connects to other files: Calls authService.updateProfile() and authService.changePassword(), and useAuth().updateUser()/logout() to keep global state in sync.

pages/Documentation.jsx
What it does: An in-app, accordion-style "How It Works" page summarizing the architecture, auth flow, data model, budget math, recurring-transaction logic, report generation, charting, testing, and setup steps — a condensed, in-product version of this report.
Main functions / exports: Documentation() with a static "sections" array and an openId state for the accordion.
How it connects to other files: Self-contained; does not call any service.

 
7. Authentication Flow, Step by Step
21.	The user submits the registration form (Register.jsx) with name, email, and password.
22.	The frontend calls authService.register(), which POSTs to /api/auth/register.
23.	express-validator checks the request body; authController.register() checks the email is not already taken.
24.	The User model’s pre("save") hook hashes the password with bcrypt before it is stored — the plain-text password is never written to the database.
25.	Default categories are seeded for the new user via models/Category.js and utils/seedData.js.
26.	generateToken(userId) signs a JWT (payload: { id: userId }) using JWT_SECRET, valid for JWT_EXPIRES_IN (default 7 days).
27.	The API responds with { token, user }. The frontend stores the token in localStorage and updates AuthContext, which triggers a redirect to the dashboard.
28.	On every subsequent request, the Axios request interceptor (services/api.js) reads the token from localStorage and attaches it as an Authorization: Bearer <token> header.
29.	On the server, the protect middleware (middleware/auth.js) verifies the token’s signature and expiry, looks up the matching user, and attaches it to req.user.
30.	Every controller then scopes its database queries to req.user._id — this is what guarantees one user can never read or modify another user’s data.
31.	If a token is missing, invalid, or expired, the server returns 401 Unauthorized, and the Axios response interceptor automatically clears localStorage and redirects to /login.
 
8. Business Logic Deep Dives
8.1 How Budget Progress Is Calculated
A Budget document stores only a category, a limit, and a date range — it does not store a running total. Instead, utils/budgetCalc.js computes progress on every read:
•	sumSpentForCategory() filters the user’s expense transactions to those matching the budget’s category and falling within [startDate, endDate], then sums their amounts.
•	calculateBudgetProgress() compares that sum to the budget’s limit and derives remaining, percentUsed, and a status: "ok" below 80%, "warning" from 80–99%, and "exceeded" at 100% or above.
Because this logic is pure JavaScript with no database or Express dependency, it is tested directly and quickly in tests/budgetCalc.test.js, and reused identically by both the Budgets page and the Reports page — so the two screens can never disagree about a budget’s status.
8.2 How Recurring Transactions Work
A RecurringTransaction rule stores an amount, category, frequency, a start date, an optional end date, and a lastProcessedDate watermark. utils/recurringProcessor.js processes a rule as follows:
•	Starting from lastProcessedDate (or startDate on the very first run), it computes the next due date for the rule’s frequency (daily/weekly/monthly/yearly).
•	While that due date is on or before today, and on or before the rule’s optional endDate, it creates a real Transaction document dated on that due date, marked isRecurring: true.
•	It repeats this, advancing one interval each time, until it reaches today or the rule’s end date, then saves the last date it processed back onto the rule.
•	A hard safety cap (500 iterations) prevents a misconfigured rule from ever looping indefinitely.
Because the function always resumes from lastProcessedDate rather than recomputing from the beginning, calling it again — whether automatically on next login or manually via the "Run Now" button — can never create duplicate transactions for a date that was already processed.
8.3 How Reports Are Generated
Both the dashboard summary and the monthly report are computed in reportController.js by pulling the relevant transactions once and aggregating them in memory (grouping by category, summing by type, building a rolling multi-month trend, and comparing the selected month to the previous one) rather than issuing many small database queries. This keeps the aggregation logic centralized on the server, so the frontend only ever needs to render numbers it is handed.
 
9. REST API Reference
All endpoints are prefixed with /api. Every route except /auth/register and /auth/login requires an Authorization: Bearer <token> header.

Method & Route	Description
POST /auth/register	Create a new account; seeds default categories; returns a JWT
POST /auth/login	Authenticate with email/password; returns a JWT
GET /auth/me	Return the logged-in user’s profile
PUT /auth/profile	Update name, currency, or avatar color
PUT /auth/change-password	Change the current password
GET /transactions	List transactions with search/filter/sort/pagination query params
POST /transactions	Create a transaction
PUT /transactions/:id	Update a transaction
DELETE /transactions/:id	Delete a transaction
GET /transactions/export/csv	Download all transactions as a CSV file
DELETE /transactions/demo/reset	Delete all of the user’s transactions
GET /budgets	List budgets, each annotated with live spend/progress
POST /budgets	Create a budget
PUT /budgets/:id	Update a budget
DELETE /budgets/:id	Delete a budget
GET /categories	List categories, optionally filtered by ?type=
POST /categories	Create a custom category
PUT /categories/:id	Rename/recolor a custom category
DELETE /categories/:id	Delete a custom category (blocked if in use or default)
GET /recurring-transactions	List recurring rules
POST /recurring-transactions	Create a rule (also generates any already-due transactions)
POST /recurring-transactions/process	Manually generate any transactions currently due
DELETE /recurring-transactions/:id	Delete a recurring rule
GET /reports/dashboard	Dashboard summary: totals, trend, category breakdown, budget overview
GET /reports/monthly	Monthly report for ?year=&month=, with previous-month comparison

10. Viva / Interview Quick-Reference
Short, plain-language answers to the questions most likely to come up when explaining this project.
Q: Why JWT instead of sessions?
Sessions require the server to store session data and look it up on every request. A JWT is self-contained and digitally signed, so the server can verify a request’s identity just by checking the signature — no session store needed, which makes the API stateless and easy to scale.
Q: How do you make sure one user can’t see another user’s data?
Every document (transaction, budget, category, recurring rule) stores a "user" field. Every single database query in every controller includes { user: req.user._id } in its filter, and req.user is only ever set by verifying the JWT — so there is no code path that returns another user’s data.
Q: Why hash passwords with bcrypt instead of storing them directly?
If the database were ever compromised, plain-text passwords would immediately compromise every user’s account (and likely their accounts elsewhere, since people reuse passwords). bcrypt is a slow, salted, one-way hash function — it is computationally impractical to reverse, so a leaked hash does not reveal the password.
Q: Why keep budget math in a separate utils file instead of inside the controller?
Pulling pure calculation logic out of Express/Mongoose-specific code means it can be tested directly with plain JavaScript objects and arrays, with no database setup required — that is exactly what tests/budgetCalc.test.js does. It also means the same logic can be reused from two different controllers (budgets and reports) without duplication.
Q: How are duplicate recurring transactions prevented?
Each recurring rule stores a lastProcessedDate watermark. Every time the rule is processed, generation starts from the date after that watermark, not from the beginning — so re-running the process (on login, or manually) only ever generates transactions for dates that have not been processed yet.
Q: What happens if a request has no token, or an invalid/expired one?
The protect middleware returns 401 Unauthorized before the request ever reaches a controller. On the frontend, an Axios response interceptor watches for 401 responses globally, clears the stored token, and redirects to the login page — so an expired session is handled consistently everywhere in the app, not per-page.
Q: Why Chart.js instead of building charts by hand?
Chart.js handles canvas rendering, responsive resizing, animations, and accessible tooltips out of the box. react-chartjs-2 lets that configuration be expressed declaratively as React props, so a chart is just another component that re-renders when its data prop changes — the same mental model as the rest of the UI.

11. Troubleshooting
Symptom	Likely cause & fix
"MongoDB connection error" on server start	MongoDB isn’t running, or MONGODB_URI in server/.env is wrong. Start MongoDB locally or update the connection string.
Frontend shows "Network Error" on every request	The backend isn’t running, or VITE_API_URL in client/.env doesn’t match the backend’s address/port.
401 Unauthorized immediately after logging in	JWT_SECRET was changed after the token was issued, or the system clock is significantly off. Log in again to get a fresh token.
"Duplicate value for field: email" on register	An account with that email already exists — use the login page instead.
npm install fails on server or client	Confirm Node.js 18+ is installed (node --version) and that you’re in the correct folder (server or client) before running the command.
Charts show an empty state	Expected behavior with no transactions yet — add a transaction, or run npm run seed for sample data.

 
 

End of Report — Wealthline Technical Documentation
