const jwt = require('jsonwebtoken');

// Env values pasted into dashboards often carry stray quotes or spaces
// (e.g. "7d" with quotes). Clean them so they cannot break auth.
const clean = (value) =>
  String(value ?? '')
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim();

// Returns a value jsonwebtoken accepts: seconds (number) or a timespan like 7d.
const getExpiresIn = () => {
  const raw = clean(process.env.JWT_EXPIRES_IN);

  if (!raw) return '7d';
  if (/^\d+$/.test(raw)) return Number(raw); // plain digits = seconds
  if (/^\d+\s*(s|m|h|d|w|y)$/i.test(raw)) return raw.replace(/\s+/g, '');

  return '7d'; // invalid value: fall back instead of crashing login/register
};

const getSecret = () => {
  const secret = clean(process.env.JWT_SECRET);

  if (!secret) {
    const err = new Error(
      'Server configuration error: JWT_SECRET is not set. Add it in the Vercel environment variables and redeploy.'
    );
    err.statusCode = 500;
    throw err;
  }

  return secret;
};

// Signs a JWT containing the user's id.
const generateToken = (userId) =>
  jwt.sign({ id: userId }, getSecret(), { expiresIn: getExpiresIn() });

// Lets controllers verify the config BEFORE creating a user.
generateToken.assertConfig = () => {
  getSecret();
  getExpiresIn();
};
generateToken.getSecret = getSecret;
generateToken.getExpiresIn = getExpiresIn;

module.exports = generateToken;