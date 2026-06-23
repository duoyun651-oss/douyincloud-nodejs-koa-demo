# 背锅接力云容器后端

这是给抖音云容器服务部署的 Node.js 18 + Koa 2 排行榜 Demo。接口统一使用 `/api` 前缀。

## 本地运行

```bash
npm i
npm run dev
```

可选 Redis：

```bash
REDIS_URL=redis://localhost:6379 npm run dev
```

没有配置 `REDIS_URL` 时，会用内存 Map 临时保存排行榜。容器重启后数据会丢失，正式上线建议配置 Redis。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `PORT` | 服务端口，默认 `8080` |
| `APP_ENV` | `dev`、`test`、`prod`，默认 `dev` |
| `REDIS_URL` | Redis 连接地址，可选 |

Redis 榜单 Key：`lb:{APP_ENV}:daily`

## 接口

```bash
curl http://localhost:8080/api/ping

curl -X POST http://localhost:8080/api/score \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","score":123}'

curl "http://localhost:8080/api/leaderboard?limit=5"

curl "http://localhost:8080/api/me/rank?userId=u1"
```

## 抖音云部署

1. 抖音云服务选择 `Node` 容器模板。
2. 上传或关联本目录作为云容器服务代码。
3. 服务端口填 `8080`，健康检查路径填 `/api/health`。
4. 部署完成后复制默认 HTTPS 域名。
5. 在小游戏/小程序后台，把云容器默认域名加入 `request 合法域名`。
6. 推荐路径授权配置为 `/api/*`。

## 小游戏前端调用示例

`tt.request` 示例，注意线上必须使用 HTTPS：

```js
const API_BASE = "https://你的云容器默认域名";

tt.request({
  url: `${API_BASE}/api/score`,
  method: "POST",
  header: { "Content-Type": "application/json" },
  data: { userId: "u1", score: 123 },
  success(res) {
    console.log("saved", res.data);
  },
  fail(err) {
    console.error("score failed", err);
  }
});
```

`callContainer` 示例：

```js
tt.cloud.callContainer({
  path: "/api/leaderboard?limit=20",
  method: "GET",
  header: { "Content-Type": "application/json" },
  success(res) {
    console.log("leaderboard", res.data);
  },
  fail(err) {
    console.error("leaderboard failed", err);
  }
});
```
