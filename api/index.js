// Vercel serverless entry point.
// Vercel routes every /api/* request here (see vercel.json) and the
// Express app handles the real routing, e.g. /api/auth/login.
module.exports = require('../server/server.js');
