# Echo Web

[English](README.md)

Echo 的 Vue 3 Web 前端，包含产品官网、隐私政策、服务条款，以及用于处理举报、用户反馈、
维护策略和通知广播的管理后台。

## 路由

- `/`：Echo 产品官网。
- `/terms`、`/privacy`：公开法律文档。
- `/admin/login`：由 SERVER 校验管理员角色的邮箱确认登录。
- `/admin/reports`、`/admin/feedback`、`/admin/app-operations`：仅管理员可用的后台页面。

路由只认可服务端 session 中角色为 `ADMIN` 的用户。API 错误、refresh token 轮换、请求取消
和 trace ID 统一由 `src/server/axios` 处理。

## 本地开发

需要 Node.js `>= 24.14.0`，并使用 `packageManager` 声明的 pnpm 版本。

```zsh
pnpm install
pnpm start
```

环境文件提供 `VITE_APP_BASE_URL`、`VITE_APP_BASE_API`、站点元信息以及可选的品牌和商店
地址。服务端密钥和账号凭据不得进入本仓库；品牌资源默认读取 Echo 的公开媒体域名。

## 目录结构

```text
src/
  assets/styles/   # 全局 CSS、Tailwind token、Vuetify 层
  components/      # 运行时公共组件
  router/          # 官网与管理后台路由
  server/          # API、model 与统一 axios 客户端
  store/           # locale/theme/session 持久状态与全局提示
  views/Main/      # 官网和法律页面
  views/Admin/     # 管理员登录与后台页面
```

全局颜色和重复视觉值统一放在 `src/assets/styles/css/tailwind/tokens.css`；页面应消费这些
token 或 Vuetify 语义能力，不得另建主题体系。

## 质量检查

交付前运行：

```zsh
pnpm quality
git diff --check
```

`pnpm quality` 会检查格式、零 warning Lint、TypeScript/Vue 类型、source-size、style-token
架构守卫和生产构建。
