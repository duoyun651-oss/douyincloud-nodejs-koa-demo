const Router = require("@koa/router");
const { saveScore, getLeaderboard, getUserRank } = require("../redis");

const router = new Router({ prefix: "/api" });

router.get("/ping", (ctx) => {
  ctx.body = { ok: true, ts: Date.now() };
});

router.get("/health", (ctx) => {
  ctx.body = { status: "ok" };
});

router.post("/score", async (ctx) => {
  const { userId, score } = ctx.request.body || {};

  if (typeof userId !== "string" || !userId.trim()) {
    ctx.status = 400;
    ctx.body = { error: "bad_request", message: "userId must be a non-empty string" };
    return;
  }

  if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    ctx.status = 400;
    ctx.body = { error: "bad_request", message: "score must be a non-negative number" };
    return;
  }

  await saveScore("daily", userId.trim(), Math.floor(score));
  ctx.body = { saved: true };
});

router.get("/leaderboard", async (ctx) => {
  const rawLimit = Number(ctx.query.limit || 20);
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 20, 1), 100);

  ctx.body = await getLeaderboard("daily", limit);
});

router.get("/me/rank", async (ctx) => {
  const userId = String(ctx.query.userId || "").trim();

  if (!userId) {
    ctx.status = 400;
    ctx.body = { error: "bad_request", message: "userId query is required" };
    return;
  }

  ctx.body = await getUserRank("daily", userId);
});

module.exports = router;
