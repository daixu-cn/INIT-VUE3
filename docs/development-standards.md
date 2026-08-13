# Echo WEB 开发规范

本文件是 WEB 仓库的强制开发规则。

## 架构与复用

- 页面放 `views`，复用 UI 放 `components`，远程调用放 `server/api`，跨页面状态放
  Pinia，纯逻辑放 hooks/tools。页面不得自建 Axios、重复鉴权/错误处理或直接散落后端
  URL。
- 新生产文件以 400 行以内为目标；超过 600 行必须按头部、筛选、列表、表单、弹窗、
  空态/错误态等稳定职责拆分。
- 导航、菜单、表格、分页、搜索、上传、弹窗、加载/空态和反馈提示出现重复时抽成公共
  组件；不要复制模板与 scoped CSS。

## 统一视觉和可访问性

- 颜色、间距和主题值来自 `src/assets/styles/css/tailwind/tokens.css`、theme layers 和
  Vuetify theme；禁止页面写重复品牌色、焦点色、阴影和字体体系。
- 优先使用 Vuetify、Tailwind 语义 utility 和现有公共组件。页面 scoped CSS 只描述
  页面特有布局，重复模式进入 token、utility 或 shared component。
- 所有交互支持键盘焦点、语义标签、合理触控尺寸、深浅主题、320px 到桌面响应式、
  系统字体缩放和 reduced motion。

## 业务、API 与列表

- 点数、价格、额度、权限、商品 ID、状态机、文件分类和分页上限由 SERVER 决定。WEB
  通过 API 展示；接口未加载时显示未知/由服务器确认，不写相同的本地默认数字。
- 所有 API 使用明确 TypeScript model，禁止 `any` 扩散。错误经统一 axios 层转换，
  页面不展示后端堆栈或 provider 原始错误。
- 无界列表必须服务端 cursor pagination；前端处理 next cursor、末页、去重、取消/过期
  请求和 loading/empty/error 状态，不能先拉全量再本地分页。
- 上传只提交内容、purpose 和业务 ID；不构造对象存储 key，不接触服务端密钥。

## i18n、安全与测试

- 所有文本、错误、通知和无障碍标签进入 Vue I18n，并同步当前启用的全部 locale；数字、
  时间、金额使用 locale formatter。
- 鉴权、权限和内容策略仍由 SERVER 强制执行。日志不得输出 token、OAuth payload 或
  敏感数据。
- 修复 bug 添加复现测试；UI 至少检查深浅主题、响应式、长语言、加载/空态/错误态和
  键盘操作。
- 不提交 QA 临时图、Codex 笔记、生成架构图、构建输出、日志、密钥或无调用代码。

完成前运行：

```zsh
pnpm exec prettier --check src AGENTS.md docs
pnpm exec eslint .
pnpm type-check
pnpm build
git diff --check
```
