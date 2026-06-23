require("dotenv").config();

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");

const errorMiddleware = require("./middleware/error");
const rateLimit = require("./middleware/ratelimit");
const leaderboardRoutes = require("./routes/leaderboard");
const { closeRedis } = require("./redis");

const app = new Koa();
const port = Number(process.env.PORT || 8080);

app.use(errorMiddleware);
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(rateLimit({ limit: 60, windowMs: 60 * 1000 }));
app.use(bodyParser({ jsonLimit: "256kb", formLimit: "256kb", textLimit: "256kb" }));
app.use(leaderboardRoutes.routes());
app.use(leaderboardRoutes.allowedMethods());

const server = app.listen(port, () => {
  console.log(`[beiguo-cloud] listening on ${port}`);
});

async function shutdown(signal) {
  console.log(`[beiguo-cloud] ${signal} received, shutting down`);
  server.close(async () => {
    await closeRedis();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
