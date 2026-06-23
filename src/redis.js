const Redis = require("ioredis");

const appEnv = process.env.APP_ENV || "dev";
const redisUrl = process.env.REDIS_URL;

let redis = null;

// TODO: Configure REDIS_URL in production. Without it, this service uses
// process memory and leaderboard data disappears after container restart.
const memoryBoards = new Map();

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true
  });

  redis.on("connect", () => console.log("[beiguo-cloud] redis connected"));
  redis.on("error", (err) => console.error("[beiguo-cloud] redis error:", err.message));
} else {
  console.warn("[beiguo-cloud] REDIS_URL not set; using temporary in-memory leaderboard.");
}

function keyFor(type = "daily") {
  return `lb:${appEnv}:${type}`;
}

function getMemoryBoard(key) {
  if (!memoryBoards.has(key)) {
    memoryBoards.set(key, new Map());
  }
  return memoryBoards.get(key);
}

async function saveScore(type, userId, score) {
  const key = keyFor(type);

  if (redis) {
    await redis.zadd(key, score, userId);
    return;
  }

  getMemoryBoard(key).set(userId, score);
}

async function getLeaderboard(type, limit) {
  const key = keyFor(type);

  if (redis) {
    const result = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
    const rows = [];
    for (let i = 0; i < result.length; i += 2) {
      rows.push({ userId: result[i], score: Number(result[i + 1]) });
    }
    return rows;
  }

  return [...getMemoryBoard(key).entries()]
    .map(([userId, score]) => ({ userId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function getUserRank(type, userId) {
  const key = keyFor(type);

  if (redis) {
    const [rank, score] = await Promise.all([
      redis.zrevrank(key, userId),
      redis.zscore(key, userId)
    ]);

    return {
      rank: rank === null ? null : rank + 1,
      score: score === null ? null : Number(score)
    };
  }

  const board = getMemoryBoard(key);
  if (!board.has(userId)) {
    return { rank: null, score: null };
  }

  const rows = [...board.entries()].sort((a, b) => b[1] - a[1]);
  const rank = rows.findIndex(([id]) => id === userId) + 1;
  return { rank, score: board.get(userId) };
}

async function closeRedis() {
  if (redis) {
    await redis.quit();
  }
}

module.exports = {
  keyFor,
  saveScore,
  getLeaderboard,
  getUserRank,
  closeRedis
};
