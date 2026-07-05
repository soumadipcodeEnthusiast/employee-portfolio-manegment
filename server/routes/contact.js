import express from 'express';

const router = express.Router();

const rateMap = new Map();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count += 1;
  rateMap.set(ip, entry);

  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  next();
}

router.post('/', rateLimit, (req, res) => {
  const { name, email, budget, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  console.log('[Contact] New enquiry from', email, '| Budget:', budget);

  res.json({ success: true, message: 'Enquiry received.' });
});

export default router;
