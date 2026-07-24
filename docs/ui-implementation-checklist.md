# UI 实现检查清单

实现或修改页面前，先确认当前页面属于前台、工作台、后台、运营位还是特殊营销页。

## 必查项

- 正文优先使用 `text-sm`，辅助信息优先使用 `text-xs`。
- 极小状态标签在设计稿明确标注时使用 `text-xxs`，不要用任意字号。
- 除品牌 Logo 文字外，字体族使用系统默认字体；Logo 文字使用 `Zen Dots Regular`。
- 文本颜色使用 `text-text-primary`、`text-text-secondary`、`text-text-hint` 等 token。
- 背景颜色使用 `bg-bg-white`、`bg-bg-soft`、`bg-bg-medium`、`bg-bg-strong` 等 token。
- 分割线按背景选择：`bg-bg-white` 用 `border-border-subtle`，`bg-bg-soft` 用 `border-border-default`，`bg-bg-medium` / `bg-bg-strong` 用 `border-border-strong`。
- 选中态边框或下划线使用 `border-border-selected`。
- 通用图标使用 `Icon` 组件，图标名称沿用 Figma / Lucide 原始名称。
- 默认图标使用 `md`，即 `16px / 1px`；其他常规尺寸只使用 `sm`、`lg`、`xl`、`2xl`；`xs` 只用于控件内部极小图标。
- 页面操作优先使用 `Button` 或 `ButtonLink`，不要在页面内手写按钮颜色、尺寸和圆角。
- 分类筛选、视图切换等单个 Tab 按钮使用 `TabButton`，不要在页面内手写 Tab hover / selected 状态。
- 横向分类导航使用 `TabBar`，不要在页面内手写横向滚动、渐变遮罩或箭头按钮逻辑。
- 页面搜索、筛选搜索、列表检索统一使用 `SearchInput`，不要在页面内手写搜索框结构和清空按钮。
- 新增或修改封装控件时，必须同步更新 `src/pages/DesignSystemPage.tsx` 设计规范实时预览页。
- 设计规范实时预览页只负责排列和说明，必须直接引用封装控件，不得覆盖控件本身样式。
- 按钮描边使用内描边阴影，不使用 CSS `border` 占用按钮尺寸。
- 常规圆角使用 `rounded-button`，胶囊场景使用 `rounded-pill`。
- 不直接写裸颜色、临时色阶、任意字号、任意圆角。

## 验证命令

```bash
npm run check:design
npm run lint
npm run build
```
