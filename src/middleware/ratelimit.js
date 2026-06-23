const buckets = new Map();

module.exports = function rateLimit(options = {}) {
  const limit = options.limit || 60;
  const windowMs = options.windowMs || 60 * 1000;

  return async function rateLimitMiddleware(ctx, next) {
    const ip = ctx.ip || ctx.request.ip || "unknown";
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      ctx.status = 429;
      ctx.body = { error: "rate_limited", message: "Too many requests, try again later." };
      return;
    }

    await next();
  };
};
