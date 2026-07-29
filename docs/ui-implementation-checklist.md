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
- Layout 适配按端隔离：当前只实现 `Desktop Web Layout`；新增或调整 `Tablet Layout` / `Mobile Layout` 时，不得改变网页端已确认的样式、间距、结构和交互。
- 右侧主内容区域的页面级左右边距使用 `page-section-x`：`1024-1279=24px`、`1280-1439=32px`、`1440-1599=40px`、`>=1600=48px`；只加在当前承担页面边距的容器板块，不用于组件内部间距。
- 右侧顶部 fixed 导航也要锁定最小适配宽度：展开侧栏 `min-width: 784px`，收起侧栏 `min-width: 972px`，不得在小于 `1024px` 时继续压缩。
- 通用图标使用 `Icon` 组件，图标名称沿用 Figma / Lucide 原始名称。
- 默认图标使用 `md`，即 `16px / 1px`；其他常规尺寸只使用 `sm`、`lg`、`xl`、`2xl`；`xs` 只用于控件内部极小图标。
- 页面操作优先使用 `Button` 或 `ButtonLink`；线框按钮和文字按钮按背景传入 `surface="white"` 或 `surface="soft"`，链接按钮单独使用 `ButtonLink tone="black" | "red" | "yellow" | "green" | "blue"`，不要在页面内手写按钮颜色、尺寸和圆角。
- 带文字的图标按钮使用 `Button icon="..."`，不要在按钮内容中手写 `Icon` 和 margin；`40/36/32` 按钮内图标为 `16px`，`28/24` 按钮内图标为 `14px`，图标与文字间距固定 `6px`。
- 仅图标操作使用 `IconButton`，必须传入 `aria-label`；全圆角按钮使用 `Button shape="pill"` 或 `IconButton shape="pill"`。
- `IconButton` 所有按钮尺寸中的默认图标均为 `16px`。
- 工具栏里的筛选、全部已读、单图标工具操作使用 `ToolbarIconButton`；按背景传入 `surface="white"` 或 `surface="soft"`。
- 分类筛选、视图切换等单个 Tab 按钮使用 `TabButton`，不要在页面内手写 Tab hover / selected 状态。
- 横向分类导航使用 `TabBar`，不要在页面内手写横向滚动、渐变遮罩或箭头按钮逻辑。
- 普通输入、表单输入和特殊输入组合使用 `InputField`；搜索使用 `SearchInput`；带字数统计使用 `CounterInput`；不得在页面内手写输入框结构、图标、右侧文字或清空按钮。
- InputField 只使用 `xl / 40px`、`lg / 36px`、`md / 32px` 三档；`xl` 左右间距 `16px`，`lg` 和 `md` 左右间距 `14px`。
- 普通浮窗使用 `PopoverMenu`、`PopoverOptions`、`PopoverPanel`；日期选择和消息通知使用业务专用 Popover，不混入普通浮窗类型。
- 顶部通知中心使用业务专用 `NotificationPopover`，底层复用 `Popover`，不归入通用 `PopoverPanel` 宽度档。
- 浮窗宽度优先使用 `sm / 160px`、`md / 220px`、`lg / 320px`；跟随触发器使用 `trigger`，内容自适应用 `content`。
- 通用 Popover 模式不随意传数值宽度；业务专用浮窗需要固定数值宽度时，直接复用 `Popover` 基础壳。
- 带触发器的普通浮窗必须传入 `anchorRef` 使用自适应定位；最大高度按当前窗口上下 `48px` 安全间距限制，左右不设窗口安全间距，始终与触发器边缘对齐。日期选择只复用定位，不复用高度限制；通知浮窗不归入普通类型，但也必须基于通知触发器对齐。
- 浮窗与触发器默认间距为 `4px`；触发器优先使用 `onPointerDown` 打开，不等到鼠标释放；外部点击关闭不得阻断被点击目标的原有功能响应。
- 浮窗打开后页面滚动时必须跟随触发件移动，不得为了上下 `48px` 安全区吸附停留在窗口内；搜索型浮窗无结果高度使用上一次非空内容高度。
- 模态弹窗优先使用已封装控件：`InfoModal`、`ConfirmModal`、`FormModal`、`FeatureModal`、`ContentModal`、`WorkflowModal`；复杂业务弹窗可作为对应模式下的业务实例，但底层必须复用 `Modal`。
- 新增模态弹窗时先判断尺寸档，再判断模式：`360 InfoModal`、`480 ConfirmModal / FormModal`、`640 FeatureModal`、`720 ContentModal`、`960 WorkflowModal`。
- 弹窗遮罩关闭必须判断按下和释放都在遮罩上；从弹窗内容区按下后拖出释放，不得关闭弹窗。
- 新增或修改封装控件时，必须同步更新 `src/pages/DesignSystemPage.tsx` 设计规范实时预览页。
- 设计规范实时预览页只负责排列和说明，必须直接引用封装控件，不得覆盖控件本身样式。
- 按钮描边使用内描边阴影，不使用 CSS `border` 占用按钮尺寸。
- 常规圆角使用 `rounded-button`，胶囊场景通过封装控件的 `shape="pill"` 使用 `rounded-pill`。
- 不直接写裸颜色、临时色阶、任意字号、任意圆角。

## 验证命令

```bash
npm run check:design
npm run lint
npm run build
```
