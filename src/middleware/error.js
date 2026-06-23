module.exports = async function errorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    console.error("[beiguo-cloud] request error:", err);
    ctx.status = err.status || 500;
    ctx.body = {
      error: ctx.status === 500 ? "internal_error" : "request_error",
      message: err.message || "Internal Server Error"
    };
  }
};
