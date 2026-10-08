// Minimal in-memory rate limiter (no extra dependency). Fine for a single
// server instance; switch to express-rate-limit + Redis if you scale out.
const rateLimit = ({ windowMs, max, keyFn, message }) => {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = keyFn ? keyFn(req) : req.ip;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({
        success: false,
        message: message || "Too many requests, please try again later",
      });
    }
    next();
  };
};

module.exports = rateLimit;
