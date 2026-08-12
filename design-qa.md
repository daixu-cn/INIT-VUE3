# Echo 官网 Wow Motion Design QA

## 视觉真值与实现证据

- 设计真值：`/Users/jianvey/.codex/generated_images/019fe465-a565-7800-b2b4-19ae3b58e075/exec-3dd16560-194a-479c-b7ee-a1d36794a5ee.png`
- 桌面实现：
  - `design-qa-wow-hero.png`
  - `design-qa-wow-voice.png`
  - `design-qa-wow-memory.png`
  - `design-qa-wow-characters.png`
  - `design-qa-wow-characters-mid.png`
  - `design-qa-wow-download.png`
- 移动端实现：
  - `design-qa-wow-mobile-hero.png`
  - `design-qa-wow-mobile-voice.png`
  - `design-qa-wow-mobile-characters.png`
- 同屏对照：`design-qa-wow-comparison.png`
- 本地实现：`http://127.0.0.1:12564/`

## 视口与状态归一化

- 设计真值为 864 x 1821 px 全页稿；桌面实现按 1280 x 720 CSS px、深色主题、中文、入场完成后的对应章节状态采集，截图输出同为 1280 x 720 px。
- 同屏对照把设计真值的五个重点章节裁为 16:9 焦点区域，并与对应实现统一归一为 600 x 337 px 后排列，避免因全页纵横比差异造成误判。
- 移动端由同源 390 x 720 iframe 真实触发移动断点，浏览器截图精确裁出应用区域；DOM 实测 `innerWidth=390`、`scrollWidth=390`、DPR=2，无横向溢出。

## Full-view comparison evidence

- 当前实现继续保持设计真值的近黑底、暖色人物、暖白宋体、薄荷声线和克制留白，没有增加卡片化介绍或手机模型。
- Hero、语音、记忆、角色和下载五个章节的主构图仍与设计真值一致；新增章节进度轨道只占右侧 1px 视觉轴，不改变内容密度。
- 语音章节的声场在章节中心完整展开，记忆章节维持左右人物与文案平衡，角色章节最终仍为等宽三列，下载章节保持双按钮水平对齐。

## Focused region comparison evidence

- Hero：中文首句宽屏与 390px 均为单行。桌面文字高度 78.8438px、行高 78.848px；移动端文字高度 45.8984px、行高 45.903px；两端均为 `white-space: nowrap`。
- 语音：章节顶部声场容器达到约 `scaleX(0.9985) / scaleY(1.2781)`，标题、三组语句和播放控制均可见；移动端 390px 的标题区域宽 350px、播放控制透明度 0.6156。
- 角色：展开前中间态左右卡片分别位移约 +326.8px / -326.8px、透明度 0.2801，中心卡片为 0.97；滚动到章节顶部后三卡恢复等宽三列，形成清楚的“叠层展开”过程。
- 下载：两个桌面下载按钮最终均为 164 x 50.6875px，`top` 均为 418.3361px；上一轮错峰造成的约 1px 高差已消除。
- 移动端：Hero、语音和角色三张 390 x 720 聚焦截图均无裁切主标题、横向溢出或不可见主控；桌面章节轨道在移动端隐藏，避免遮挡内容。

## Required fidelity surfaces

- Fonts and typography：继续使用 `Songti SC / STSong / Noto Serif SC` 展示标题；Hero 中文首句显式使用 `max-content + nowrap`，小屏仍保留合理的两段标题层级。
- Spacing and layout rhythm：五个章节高度和桌面三列、移动端单卡轮播结构不变；新增动画只改变元素进入过程，不改最终布局盒模型。
- Colors and visual tokens：沿用 `#020b0e`、暖白与 `#78c2b6` 薄荷色；进度轨道复用现有 token，没有引入新配色。
- Image quality and asset fidelity：继续使用既有高质量 Hero 与两张角色人物素材，没有占位图、CSS 人物、手绘 SVG 或新低清素材。
- Copy and content：中文继续保持无标点版本；英文保留语义需要的标点。实时语音、记忆、角色和下载内容没有删减。
- Accessibility and responsiveness：标题分字只用于 Hero 一次性视觉入场，`h1` 保留完整可访问名称；`prefers-reduced-motion` 降级、键盘焦点、语义按钮和移动菜单保持。

## 动效与性能边界

- 新增四个可感知时刻：Hero 逐字入场、语音声场从纵深聚拢、记忆人物与文案前后景切换、三张角色卡从中心叠层展开；另有固定章节进度轴串联 01–05。
- Hero 分字动画只运行一次，完成后主动清除 glyph 的 transform/opacity/visibility；滚动期间不再逐字更新。
- 所有滚动演出只修改容器级 `transform` 与 `opacity`；没有新增 Canvas、滤镜、模糊、粒子库、滚动 pin 或依赖。
- 现有 `VoiceWave` 仍由单个 passive scroll listener 统一冻结，滚动停止 140ms 后才恢复绘制；Canvas backing store 上限与离屏释放逻辑保持。
- 当前 Chrome DevTools Performance MCP 未接入；应用内浏览器后台标签会主动节流 RAF，因此未把后台 RAF 数字作为验收指标，也不声明 LCP/INP。最终验收以结构约束、可见浏览器交互、无控制台错误、用户已确认的流畅基线和构建结果为准。

## Comparison history

1. `[P2]` 大屏 Hero 首句在旧截图中断到第二行。为首句增加独立 `hero-title-lead`，使用 `width: max-content` 与 `white-space: nowrap`；桌面和 390px 复测均为单行。
2. `[P2]` 初版滚动只有轻微淡入，缺少记忆点。增加章节进度、声场纵深、记忆前后景和角色卡叠层展开，并逐章节采集中间态与最终态。
3. `[P2]` 第一轮增强把多个标题字形绑定到 scroll scrub，存在增加合成层与中间态可读性下降的风险。修复为 Hero 分字只做一次性入场，语音和角色标题改为单容器 3D 过渡；滚动目标数量显著减少。
4. `[P2]` 下载按钮错峰动画使页面最大滚动位置仍有约 1px 高差。移除桌面按钮 stagger，最终两按钮 top 完全一致。

## Findings

- P0：无。
- P1：无。
- P2：无。标题换行、动画记忆点、移动端溢出和下载按钮对齐均已修复并复核。
- P3：尚未取得 Lighthouse/Core Web Vitals 实验室数据；不影响本轮视觉和交互验收，后续若接入 Chrome DevTools 可补充正式性能档案。

## Interaction and runtime checks

- 桌面导航可滚动到关于 Echo、隐私和关于我们，右侧章节编号同步更新到 02、03、04、05。
- 语音按钮可在“正在聆听 / 继续聆听”间往返。
- 中英文可往返切换；英文语音标题为 `Interrupt naturally. Respond instantly.`，切回后 `lang=zh-CN`。
- App Store 链接 3 个、Google Play 链接 2 个，管理员入口仍为 `/admin/login`。
- 最终干净浏览器页 warning/error：0。
- `pnpm exec eslint src/views/Main/Home/Home.vue src/components/VoiceWave.vue src/router/routes/MainRoutes.ts`：通过。
- `pnpm build`：通过，包括 `vue-tsc --build --force` 与 Vite production build；仅有既存 Vite configLoader 迁移提示。
- `git diff --check`：通过。

## Implementation checklist

- [x] 宽屏 Hero 首句强制单行且移动端无溢出。
- [x] 加入 01–05 全局章节进度轨道。
- [x] 加入一次性 Hero 逐字入场并及时清理字形 transform。
- [x] 加入语音声场纵深聚拢和记忆前后景切换。
- [x] 加入角色卡中心叠层到三列展开。
- [x] 保持 Canvas 滚动冻结与离屏释放策略。
- [x] 验证桌面、390px、下载对齐、语言、语音控制、导航和控制台。
- [x] 完成同屏视觉对照、lint、type-check 与生产构建。

## Final result

final result: passed
