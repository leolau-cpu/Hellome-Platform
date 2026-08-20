# HelloMe UI 设计规范

> 本规范用于后续页面 UI 优化。所有前端样式调整必须优先遵守本文档。
> 目标是让人和 AI 都能快速判断：字号怎么用、颜色怎么用、按钮怎么做。

## 1. 使用原则

- 默认字号为 `14px`。
- 不随意新增字号、颜色和按钮样式。
- 优先使用黑白灰体系，避免页面出现无规则的彩色装饰。
- 页面中同类组件必须保持一致：同一种按钮、同一种标签、同一种列表，不重复发明样式。
- 只做前端 UI、样式、排版和交互呈现调整，不改后端逻辑。

## 2. 字体

### 2.1 默认字体

- 默认字体样式：使用系统默认无衬线字体，不引入自定义品牌字体或远程字体。
- 品牌 Logo 文字例外，使用 `Zen Dots Regular`。
- 默认字体大小：`14px`
- 默认行高：`20px`

### 2.2 字号与行高

| Token | Font Size | Line Height | Usage |
| --- | --- | --- | --- |
| `text-xxs` | `10px` | `13px` | 极小状态标签，仅用于空间受限的状态徽标 |
| `text-label` | `11px` | `14px` | 极小 badge、角标、紧凑数字标签 |
| `text-brand-sm` | `25px` | `32px` | 品牌展示小标题，仅用于设计稿明确指定的品牌模块 |
| `text-xs` | `12px` | `16px` | 辅助信息、标签、状态、表格次要字段 |
| `text-sm` | `14px` | `20px` | 默认正文、按钮、表单、列表内容 |
| `text-base` | `16px` | `24px` | 重要正文、卡片标题、表单分组标题 |
| `text-lg` | `18px` | `26px` | 页面小标题、模块标题 |
| `text-xl` | `20px` | `28px` | 页面标题、重点模块标题 |
| `text-2xl` | `24px` | `32px` | 强标题、运营位标题 |
| `text-3xl` | `28px` | `36px` | 首屏标题、市场页重点标题 |
| `text-4xl` | `32px` | `40px` | 大标题 |
| `text-5xl` | `36px` | `44px` | 强视觉标题 |
| `text-6xl` | `40px` | `48px` | 首页主标题 |
| `text-7xl` | `48px` | `56px` | 大型展示标题 |
| `text-8xl` | `56px` | `64px` | 特殊营销标题 |
| `text-9xl` | `64px` | `72px` | 特殊超大标题 |
| `text-10xl` | `72px` | `80px` | 极少使用的品牌展示标题 |

### 2.3 执行规则

- 页面正文优先使用 `14px / 20px`。
- `10px / 13px` 仅用于设计稿明确标注的极小状态标签，不作为正文、说明文字或按钮字号。
- `11px / 14px` 仅用于极小 badge、角标、紧凑数字标签，不作为正文、说明文字或按钮字号。
- `25px / 32px` 仅用于设计稿明确指定的品牌展示小标题，不能替代常规页面标题。
- 除品牌 Logo 文字外，字体族统一使用系统默认字体；字号、行高、字重按本文档规范执行。
- 表格、标签、说明信息优先使用 `12px / 16px`。
- 标题按层级递增，不为了装饰随意放大。
- 文本必须完整显示，不能和按钮、卡片、图片互相遮挡。

## 3. 颜色

### 3.1 文本颜色

| Token | Color | Usage |
| --- | --- | --- |
| `text.primary` | `#000000` | 重要文字、标题、主信息 |
| `text.secondary` | `#666666` | 次级标题、待选 Tab、次级图标、次级入口 |
| `text.hint` | `#999999` | 副标题、说明文字、表单辅助信息、卡片描述、弱提示 |
| `text.placeholder` | `#B3B3B3` | 输入占位符 |
| `text.disabled` | `#CCCCCC` | 禁用文字 |
| `text.inverse` | `#FFFFFF` | 深色背景上的文字 |
| `text.danger` | `#D94E41` | 红（危险），用于危险操作、错误、不可恢复提醒 |
| `text.warning` | `#D97C25` | 黄（警示），用于警示、注意、额度提醒 |
| `text.success` | `#219B5A` | 绿（成功），用于成功、完成、进行中状态 |
| `text.info` | `#0074D9` | 蓝（信息），用于信息提示、链接、云空间等信息类入口 |

### 3.2 分割线颜色

| Token | Color | Usage |
| --- | --- | --- |
| `border.subtle` | `#F3F3F3` | 弱分割线，用在白色背景 `bg.white` 上，适合卡片内部、列表轻分割 |
| `border.default` | `#EAEAEA` | 默认分割线，用在浅灰背景 `bg.soft` 上，适合卡片边框、表单边框 |
| `border.strong` | `#E5E5E5` | 强分割线，用在中灰或深灰背景 `bg.medium` / `bg.strong` 上，适合模块边界 |
| `border.hover` | `#B3B3B3` | 搜索框等输入控件的 hover 描边 |
| `border.selected` | `#000000` | 选中态下划线、选中边框 |

### 3.2.1 分割线执行规则

- 所有非特殊设计分割线默认使用 `1px border`。
- 在 `bg.white` 背景上，优先使用 `border.subtle`。
- 在 `bg.soft` 背景上，优先使用 `border.default`。
- 在 `bg.medium` 或 `bg.strong` 背景上，优先使用 `border.strong`。
- 表示选中态时，不按背景选择，统一使用 `border.selected`。
- 如果分割线在当前背景上不可见，允许上调一级；如果过重，允许下调一级。
- 分割线所在元素必须使用 `box-sizing: border-box`，确保描边不额外增加元素宽高。
- 当元素已有其他 border、需要多层描边，或使用 `border` 会影响布局时，可使用 `inset box-shadow` 实现等效内侧描边。

### 3.3 背景颜色

| Token | Color | Usage |
| --- | --- | --- |
| `bg.strong` | `#EAEAEA` | 深灰背景 |
| `bg.medium` | `#F3F3F3` | 中灰背景、弱按钮 hover |
| `bg.soft` | `#F9F9F9` | 浅灰背景、页面底色、弱底色区域 |
| `bg.black` | `#000000` | 黑色背景、主按钮 |
| `bg.white` | `#FFFFFF` | 白色背景、卡片、弹窗、表单 |

### 3.4 功能颜色

| Token | Color | Usage |
| --- | --- | --- |
| `accent.success` | `#219B5A` | 成功、进行中等状态文字 |
| `accent.red` | `#FF5C4D` | 红色功能色、强调色 |
| `accent.orange` | `#FF922B` | 橙色功能色、充值和提示强调 |
| `accent.green` | `#27B66A` | 成功、进行中等状态描边 |
| `accent.blue` | `#0088FF` | 云空间、蓝色功能提示 |
| `accent.indigo` | `#7080FF` | 企业默认头像等辅助功能色 |
| `accent.violet` | `#966CFF` | 企业默认头像等辅助功能色 |
| `accent.magenta` | `#CC3380` | 企业默认头像等辅助功能色 |

### 3.5 执行规则

- 灰色背景从深到浅依次为：`bg.strong`、`bg.medium`、`bg.soft`。
- 标题、主信息、当前选中项使用 `text.primary`。
- 副标题、说明文字、表单辅助信息、卡片描述优先使用 `text.hint`。
- 次级标题、待选 Tab、次级图标、次级入口使用 `text.secondary`。
- 占位符统一使用 `text.placeholder`。
- 禁用态统一使用 `text.disabled`。
- 分割线统一使用上表 token，不使用透明黑。
- 除警示按钮已定义红色外，未定义的功能色不得自行新增，需先补充规范。

## 4. 按钮

## 4. 图标

### 4.1 图标来源

- 通用 UI 图标来源统一使用 `lucide-react`。
- `lucide-react` 只允许在项目统一的 `Icon` 组件中引入。
- Figma 中使用 Lucide 图标库时，图标名称不改名；代码中按 Lucide 原始图标名称注册和调用。
- 页面和业务组件不得直接从 `lucide-react` 引入图标，必须通过项目统一的 `Icon` 组件使用。
- 品牌、业务专属或 Lucide 不包含的图标，后续单独放入项目本地图标目录。

### 4.2 图标尺寸与描边

| Size | Icon Size | Stroke Width | Usage |
| --- | --- | --- | --- |
| `xs` | `10px` | `0.625px` | 紧凑控件内部图标，如搜索框清空按钮 |
| `sm` | `14px` | `0.875px` | 极紧凑区域、表格内弱操作 |
| `md` | `16px` | `1px` | 默认图标、导航、按钮、列表操作 |
| `lg` | `20px` | `1.25px` | 模块标题旁图标、重要列表入口、较强调的按钮图标 |
| `xl` | `24px` | `1.5px` | 页面标题旁图标、页面级入口、重点操作 |
| `2xl` | `32px` | `2px` | 缺省状态、空状态、较大的状态提示图标 |

### 4.3 图标执行规则

- 默认图标尺寸使用 `md`，即 `16px / 1px`。
- 常规图标尺寸按 `14 / 16 / 20 / 24 / 32` 五档使用，不随意新增尺寸。
- `xs` 即 `10px / 0.625px`，只用于控件内部极小图标，不用于导航、按钮主图标、列表操作图标。
- 图标描边按 `16px / 1px` 等比放大或缩小。
- 代码实现 Lucide 图标时，需将视觉描边换算到 Lucide `24×24` viewBox，确保浏览器实际显示线宽与 Figma 一致。
- 图标颜色默认继承当前文字颜色，通过文本颜色 token 控制。
- 图标只表达操作或状态，不作为无意义装饰随意添加。
- 图标和文字组合时，图标应与文字垂直居中对齐。

## 5. 按钮

### 5.1 按钮尺寸

| Size | Font Size | Line Height | Padding | Min Height | Usage |
| --- | --- | --- | --- | --- | --- |
| `xl` | `14px` | `20px` | `10px 20px` | `40px` | 特殊强引导、广告位、运营位按钮 |
| `lg` | `14px` | `20px` | `8px 18px` | `36px` | 默认按钮、页面主操作、弹窗主按钮 |
| `md` | `14px` | `20px` | `6px 16px` | `32px` | 常规按钮、次级操作 |
| `sm` | `12px` | `16px` | `6px 14px` | `28px` | 小按钮、列表操作 |
| `xs` | `12px` | `16px` | `4px 12px` | `24px` | 极小按钮、标签式操作 |

带文字的图标按钮使用 `Button icon="..."`。图标与文字间距统一为 `6px`；`xl`、`lg`、`md` 使用 `16px` 图标，`sm`、`xs` 使用 `14px` 图标。

### 5.2 按钮样式

| Token | Type | State | Background | Text Color | Border |
| --- | --- | --- | --- | --- | --- |
| `button.primary.default` | 主按钮 | 默认 | `#000000` | `#FFFFFF` | none |
| `button.primary.hover` | 主按钮 | 悬停 | `#333333` | `#FFFFFF` | none |
| `button.primary.active` | 主按钮 | 点击 / 选中 | `#000000` | `#FFFFFF` | none |
| `button.secondary.default` | 辅助按钮 / 线框按钮 | 默认 | transparent | `#000000` | `1px` 内描边 `#E5E5E5` |
| `button.secondary.white.hover` | 辅助按钮 / 线框按钮 | 白底悬停 | `#F9F9F9` | `#000000` | `1px` 内描边 `#E5E5E5` |
| `button.secondary.white.active` | 辅助按钮 / 线框按钮 | 白底点击 / 选中 | `#F3F3F3` | `#000000` | `1px` 内描边 `#E5E5E5` |
| `button.secondary.soft.hover` | 辅助按钮 / 线框按钮 | 灰底悬停 | `#F3F3F3` | `#000000` | `1px` 内描边 `#E5E5E5` |
| `button.secondary.soft.active` | 辅助按钮 / 线框按钮 | 灰底点击 / 选中 | `#EAEAEA` | `#000000` | `1px` 内描边 `#E5E5E5` |
| `button.warning.default` | 警示按钮 | 默认 | `#C42B1C` | `#FFFFFF` | none |
| `button.warning.hover` | 警示按钮 | 悬停 | `#B3261A` | `#FFFFFF` | none |
| `button.warning.active` | 警示按钮 | 点击 / 选中 | `#AA2217` | `#FFFFFF` | none |
| `button.notice.default` | 提示按钮 | 默认 | `#FF922B` | `#FFFFFF` | none |
| `button.notice.hover` | 提示按钮 | 悬停 | `#F28B29` | `#FFFFFF` | none |
| `button.notice.active` | 提示按钮 | 点击 / 选中 | `#E68327` | `#FFFFFF` | none |
| `button.text.default` | 文字按钮 | 默认 | transparent | `#000000` | none |
| `button.text.white.hover` | 文字按钮 | 白底悬停 | `#F9F9F9` | `#000000` | none |
| `button.text.white.active` | 文字按钮 | 白底点击 / 选中 | `#F3F3F3` | `#000000` | none |
| `button.text.soft.hover` | 文字按钮 | 灰底悬停 | `#F3F3F3` | `#000000` | none |
| `button.text.soft.active` | 文字按钮 | 灰底点击 / 选中 | `#EAEAEA` | `#000000` | none |
| `textLink.black.default` | 文字链接 | 默认 | transparent | `#000000` | none |
| `textLink.black.hover` | 文字链接 | 悬停 | transparent | `#666666` | none |
| `textLink.black.active` | 文字链接 | 点击 | transparent | `#000000` | none |
| `textLink.red.default` | 文字链接 | 默认 | transparent | `#D94E41` | none |
| `textLink.red.hover` | 文字链接 | 悬停 | transparent | `#FF796D` | none |
| `textLink.red.active` | 文字链接 | 点击 | transparent | `#91342C` | none |
| `textLink.yellow.default` | 文字链接 | 默认 | transparent | `#D97C25` | none |
| `textLink.yellow.hover` | 文字链接 | 悬停 | transparent | `#FFA651` | none |
| `textLink.yellow.active` | 文字链接 | 点击 | transparent | `#915319` | none |
| `textLink.green.default` | 文字链接 | 默认 | transparent | `#219B5A` | none |
| `textLink.green.hover` | 文字链接 | 悬停 | transparent | `#4EC385` | none |
| `textLink.green.active` | 文字链接 | 点击 | transparent | `#16683C` | none |
| `textLink.blue.default` | 文字链接 | 默认 | transparent | `#0074D9` | none |
| `textLink.blue.hover` | 文字链接 | 悬停 | transparent | `#2E9DFF` | none |
| `textLink.blue.active` | 文字链接 | 点击 | transparent | `#004E91` | none |
| `button.disabled` | 通用禁用态 | 禁用 | transparent | `#CCCCCC` | `1px solid #E5E5E5` |

### 5.3 按钮圆角

| Token | Shape | Radius | Usage |
| --- | --- | --- | --- |
| `button.radius.default` | 圆角按钮 | `8px` | 常规按钮、后台系统、表单操作、弹窗按钮 |
| `button.radius.pill` | 全圆角按钮 | `999px` / `50%` | 强引导按钮、胶囊按钮、标签式按钮、移动端底部主按钮 |

### 5.3.1 仅图标按钮

仅图标按钮使用 `IconButton`，用于工具栏操作、列表操作、关闭、展开、设置、删除等只有图标即可表达的操作。页面不得手写固定宽高的图标按钮。

| Size | Button Size | Default Icon Size | Usage |
| --- | --- | --- | --- |
| `xl` | `40px × 40px` | `md` / `16px` | 强操作图标按钮 |
| `lg` | `36px × 36px` | `md` / `16px` | 默认较大图标按钮 |
| `md` | `32px × 32px` | `md` / `16px` | 默认图标按钮 |
| `sm` | `28px × 28px` | `md` / `16px` | 列表、表格内图标按钮 |
| `xs` | `24px × 24px` | `md` / `16px` | 紧凑区域图标按钮 |

- `IconButton` 必须传入 `aria-label`。
- `IconButton` 支持 `variant`、`size`、`surface`、`shape`、`selected` 和 `disabled`。
- 工具栏单图标按钮使用 `ToolbarIconButton`，用于筛选、全部已读、工具操作等场景。
- `ToolbarIconButton` 默认 `32px × 32px`，默认图标色 `text.secondary`，hover / active 图标色为 `text.primary`。
- `ToolbarIconButton` 叠加在白色背景时使用 `surface="white"`，叠加在灰色背景时使用 `surface="soft"`。
- 全圆形图标按钮使用 `shape="pill"`。
- 带文字按钮不要使用 `IconButton`，应使用 `Button icon="..."`，不要在内容中手写 `Icon` 和间距。
- 弹窗右上角关闭按钮使用 `ModalCloseButton`，底层复用 `IconButton`，不要在弹窗里手写关闭按钮结构；叠加在灰色背景时传入 `surface="soft"`。

### 5.4 执行规则

- 每个页面只保留一个最强主按钮。
- 主按钮使用 `primary`，不要用彩色渐变代替。
- 次级操作使用 `secondary` 或 `text`。
- 线框按钮和文字按钮叠加在白色背景时使用 `surface="white"`；叠加在灰色背景时使用 `surface="soft"`。
- 文字链接使用 `TextLink`，不使用填充和描边，只通过 `tone="black" | "red" | "yellow" | "green" | "blue"` 控制文字颜色。
- 提示类操作使用 `notice`，例如充值、付费确认、额度提醒等带橙色引导的操作。
- 危险操作才使用 `warning`。
- 默认按钮尺寸使用 `lg`，即 `36px` 高。
- `xl` 即 `40px` 高，只用于特殊强引导、广告位、运营位等场景。
- 弹窗底部按钮使用 `lg`。
- 表格、列表、卡片内操作使用 `sm`。
- 标签式轻操作使用 `xs`。
- 所有线框按钮默认使用 `1px` 内描边。
- 按钮描边统一使用 `inset box-shadow` 实现，不使用 CSS `border` 做按钮描边。
- 按钮描边不计入按钮外部尺寸，不额外增加按钮宽高。
- 禁用按钮必须同时体现禁用文字和禁用边框。
- 所有按钮禁用态统一使用 `button.disabled`，不保留原按钮类型背景。
- 按钮 `loading` / `处理中` 状态必须在文字前使用 `loader-circle` 旋转图标。
- 带文字的图标按钮必须使用 `Button icon`，图标和文字之间固定 `6px` 间距。
- `40px`、`36px`、`32px` 按钮内图标为 `16px`；`28px`、`24px` 按钮内图标为 `14px`。
- 仅图标按钮所有尺寸默认图标均为 `16px`。
- 按钮文字默认单行显示；文案过长时优先缩短文案，不通过增加高度解决。
- 常规按钮圆角为 `8px`，不要随意使用超大圆角。
- 全圆角按钮使用 `Button shape="pill"`，不要在页面里手写 `rounded-pill`。
- 仅图标按钮使用 `IconButton`，不要在页面里手写按钮宽高和图标居中结构。
- 工具栏图标按钮使用 `ToolbarIconButton`，不要在页面里手写 `text-secondary hover:text-primary` 这类状态组合。

### 5.5 Tab 按钮

Tab 按钮用于同一页面内的视图切换、分类筛选或内容分组切换。当前只定义一种样式，基于 `button.text` 文字按钮。

| Token | Type | State | Background | Text Color | Border |
| --- | --- | --- | --- | --- | --- |
| `tab.button.default` | Tab 按钮 | 默认 | transparent | `#666666` | none |
| `tab.button.hover` | Tab 按钮 | 悬停 | `#F3F3F3` | `#666666` | none |
| `tab.button.selected` | Tab 按钮 | 选中 | `#EAEAEA` | `#000000` | none |

- Tab 按钮基于文字按钮，不使用描边。
- Tab 按钮默认尺寸使用 `md`，即 `32px` 高。
- Tab 按钮圆角沿用 `button.radius.default`，即 `8px`。
- Tab 按钮只表达当前视图或筛选项的选中状态，不用于普通提交、保存、删除等操作。
- Tab 组内同一时间只能有一个 `selected` 项。
- 胶囊按钮只用于强引导、标签式操作或移动端底部主按钮。

### 5.6 TabBar 单行分类导航

TabBar 用于横向分类、筛选和视图切换容器。TabBar 内部使用 `TabButton`，页面不得临时手写横向滚动、渐变遮罩或箭头按钮逻辑。

| Element | Size / Rule | Style |
| --- | --- | --- |
| `container` | 单行，横向滚动，隐藏原生滚动条 | `gap: 8px` |
| `tab list` | `gap: 4px`，不换行 | 使用 `TabButton` |
| `left overlay` | `48px × 32px` | 从 `bg.soft` 到透明的左侧渐变 |
| `right overlay` | `48px × 32px` | 从透明到 `bg.soft` 的右侧渐变 |
| `arrow button` | `24px × 24px`，圆形 | `bg.soft` + `border.strong` 内描边 |
| `scroll step` | `160px` | 每次点击箭头固定横向滚动距离 |

| State | Arrow Button Background |
| --- | --- |
| `default` | `bg.soft` |
| `hover` | `bg.medium` |
| `active` | `bg.strong` |

- TabBar 必须保持单行，不允许换行。
- 只有左侧有被遮挡内容时才显示左箭头。
- 只有右侧有被遮挡内容时才显示右箭头。
- 点击左 / 右箭头时，按固定 `160px` 距离平滑滚动。
- 左右箭头必须放在对应渐变覆盖层内，不直接悬浮在 TabButton 上。

### 5.7 InputField 输入框

InputField 是输入框基础控件，用于普通文本输入、表单输入和特殊输入组合。页面内不得临时手写输入框结构。`SearchInput`、`CounterInput` 是基于 `InputField` 的场景预设。

| Size | Height | Padding X | Font Size | Icon | Usage |
| --- | --- | --- | --- | --- | --- |
| `xl` | `40px` | `16px` | `14px` | `16px / 1px` | 表单输入、弹窗输入、登录输入 |
| `lg` | `36px` | `14px` | `14px` | `16px / 1px` | 页面顶部搜索、较紧凑表单输入 |
| `md` | `32px` | `14px` | `14px` | `16px / 1px` | 工具栏搜索、列表筛选、小型输入 |

| State | Border | Icon / Prefix | Text | Right Area |
| --- | --- | --- | --- | --- |
| `default` | `border.strong` | `text.hint` | `text.primary` | hidden |
| `hover` | `border.hover` | `text.hint` | `text.primary` | 按输入状态显示 |
| `active` | `border.selected` | `text.primary` | `text.primary` | 按输入状态显示 |
| `focus` | `border.selected` | `text.primary` | `text.primary` | 按输入状态显示 |
| `hasValue` | 按 hover / focus 状态 | 按 hover / focus 状态 | `text.primary` | 按配置显示 |
| `error` | `#FF5C4D` | 按当前交互状态 | `text.primary` | 按配置显示 |

- 普通输入框使用 `InputField`。
- 搜索输入框使用 `SearchInput`；特殊搜索组合可使用 `InputField prefixIcon="Search" clearable`。
- 带计数输入框使用 `CounterInput`，例如昵称、标题、项目名等需要展示字数的场景。
- 带图标输入框使用 `prefixIcon`；需要图片图标时使用 `prefixAsset`。
- 右侧清空按钮通过 `clearable` 开启。
- 右侧文字通过 `suffixText` 开启，例如 `0/15`、单位、状态说明；颜色使用 `text.placeholder`。
- 右侧自定义操作通过 `suffix` 开启，例如发送验证码。
- 清空按钮使用 `16px × 16px` 外层容器，内部圆形按钮为 `14px × 14px`。
- 清空按钮默认底色使用 `text.hint`，hover 使用 `text.secondary`，active 使用 `text.primary`。
- 清空按钮内关闭图标使用 `Icon name="X" size="xs"`，即 `10px`，颜色使用 `text.inverse`。
- 报错状态通过 `error` 开启，描边使用红色 `#FF5C4D`。
- 点击清空按钮后，输入框必须继续保持输入状态。
- InputField 背景透明，承接所在容器背景，不额外设置白色底。
- InputField 圆角沿用 `button.radius.default`，即 `8px`。
- InputField 的浏览器原生清除按钮不作为交互来源，清空行为由控件内部实现。

## 6. Popover 浮窗

Popover 用于点击触发后的轻量浮层，不阻断页面操作。普通 Popover 分为 menu、options、panel 三种；日期选择和消息通知属于业务专用 Popover。

### 6.1 类型

| Component | Default Width | Allowed Width | Usage |
| --- | --- | --- | --- |
| `PopoverMenu` | `sm / 160px` | `sm / md` | 菜单型浮窗，默认结构为图标 + 文字 |
| `PopoverOptions` | `sm / 160px` | `sm / md / lg / trigger / content` | 选项型浮窗，默认结构为文字 + 勾选 |
| `PopoverPanel` | `md / 220px` | `sm / md / lg / trigger / content` | 面板型浮窗，默认结构为搜索 + 分页标题 + 图标或封面 + 文字 |

业务专用浮窗不强行纳入通用类型。例如 `NotificationPopover` 是顶部通知中心浮窗，宽度为 `400px`，包含消息类型切换、消息列表、空状态和底部操作区；它底层复用 `Popover` 基础壳，但不使用 `PopoverPanel` 的默认宽度和内容结构。

### 6.2 宽度

| Width | Value | Usage |
| --- | --- | --- |
| `sm` | `160px` | 默认菜单宽度，项目内最常用 |
| `md` | `220px` | 较长选项或中等信息浮窗，例如全部 APIKEY |
| `lg` | `320px` | 复杂内容浮窗，为后续页面预留 |
| `trigger` | 跟随触发器宽度，最小 `160px`，默认不限制最大宽度 | 下拉内容需要与输入框、按钮、选择器等触发器等宽 |
| `content` | 内容自适应，最小 `160px`，最大 `320px` | 内容长度不固定但不应无限撑开的轻量内容 |

通用 Popover 模式优先使用宽度 token，不在页面里随意写数值宽度。类型只决定默认尺寸和默认模块倾向；尺寸和模块内容都可以按场景传入。业务专用 Popover 如 `NotificationPopover`、`DatePickerPopover` 可以按业务结构使用固定数值宽度，但必须直接复用 `Popover` 基础壳，不占用普通类型命名。

### 6.3 内容模块

| Module | Usage |
| --- | --- |
| `PopoverHeader` | 标题、分页标题、分组标题 |
| `PopoverSection` | 内容分组，提供统一左右内边距 |
| `PopoverSearch` | 搜索模块，占位态为搜索图标 + 占位文字 |
| `PopoverEmpty` | 空结果占位，复用选项行高度和间距，无交互 |
| `PopoverItem` | 菜单项、选择项、带图标操作、带勾选选项 |
| `PopoverDivider` | 分割线 |

搜索、图标、封面、勾选、分割线、分页标题都属于内容模块，不作为独立浮窗类型。不同类型浮窗可以按业务需要组合这些模块。

`PopoverSearch` 只搜索当前浮窗内的内容；搜索图标使用 `text.hint`，占位文字使用 `text.placeholder`，hover 时不出现底色。输入内容后右侧出现清空按钮，点击清空后继续保持输入状态。搜索无结果时，浮窗高度保持搜索前高度，下方内容展示 `PopoverEmpty`，文字使用 `text.hint`。

### 6.4 交互规则

- 浮窗和触发器之间默认保持 `4px` 间距。
- 带触发器的普通浮窗默认使用 `anchorRef` 自适应定位：上下方向以触发器为判断点，优先向当前窗口剩余空间更大的方向弹出；左右方向只判断左对齐或右对齐，浮窗边缘始终与触发器边缘对齐。
- 普通浮窗最大高度按当前浏览器窗口计算，距离窗口上下边缘最小保留 `48px`；内容超出时浮窗内部滚动。左右方向不设置窗口安全间距。`48px` 只作为内容超高时的最大高度约束，不用于强制撑高浮窗。
- 浮窗打开后页面滚动时，浮窗跟随触发件移动；触发件滚出窗口时，浮窗也允许跟随滚出窗口，不再吸附在窗口上下 `48px` 安全区内。
- 搜索型浮窗有结果时高度按实际内容自适应，并记录当前非空内容高度；无结果时高度使用上一次非空内容高度。如果第一次搜索即无结果，则使用搜索前的实际高度。该锁定高度仍不得超过当前窗口按上下 `48px` 计算出的最大可用高度。
- `DatePickerPopover` 复用自适应弹出方向和左右对齐逻辑，但不复用普通浮窗的最大高度限制。
- `NotificationPopover` 使用通知中心自己的内容和高度规则，不归入普通浮窗类型；弹出位置仍需基于通知触发器对齐。
- 浮窗触发器使用 `pointerdown` 打开，点击瞬间即响应，不等待鼠标释放。
- 浮窗展开后，点击页面其他功能应直接响应被点击目标的功能；外部点击关闭逻辑不得吞掉这次点击。
- 同一时间同一触发区域只保留一个展开浮窗。
- 浮窗内部点击不触发外部关闭，除非当前菜单项本身执行关闭逻辑。
- 普通浮窗不使用遮罩，不使用 `role="dialog"`，需要阻断操作时改用 Modal。

## 7. Tooltip 提示气泡

Tooltip 用于 icon 或短文本触发的轻量说明，只在 hover / focus 时出现，不阻断页面操作，不承载可点击菜单或复杂表单内容。页面不得重复手写 Tooltip 结构，必须优先使用已封装的 `Tooltip` 控件。

### 7.1 结构

| Area | Rule |
| --- | --- |
| Trigger | 默认 `16px × 16px` 容器，常用 `Icon name="Info" size="2xs"` |
| Bubble | 白色气泡，`text-xs / 12px`，`leading-4 / 16px` |
| Arrow Wrap | 位于气泡外部，`padding: 0 12px` |
| Arrow | `12px × 8px`，使用统一矢量路径 |

### 7.2 样式

- 气泡背景使用 `bg.white`。
- 气泡文字使用 `text.primary`。
- 气泡内边距为上下 `6px`、左右 `12px`。
- 气泡圆角为 `8px`。
- 气泡描边使用 `box-shadow: 0 0 0 1px border.strong` 模拟外描边，视觉值为 `#E5E5E5`。
- 气泡阴影使用 `0 2px 6px rgb(0 0 0 / 0.04)` 和 `0 4px 16px rgb(0 0 0 / 0.04)`。
- 文本层允许 `translateY(-0.5px)` 做浏览器字体渲染视觉校正，不改变容器尺寸。
- 单行 Tooltip 文本保持默认左对齐；多行 Tooltip 文本使用 `text-align: justify`，最后一行不强制拉满。
- 触发 icon 默认使用 `text.hint`，hover / focus 时使用 `text.primary`。

### 7.3 尺寸与溢出

- 气泡最大宽度为 `320px`。
- 气泡最大高度为 `172px`，不包含箭头。
- 内容超出最大宽度时换行，超出最大高度时只在气泡内部滚动；内部滚动条隐藏，但保留滚动能力。
- 箭头不参与气泡最大高度计算。

### 7.4 定位与动效

- Tooltip 使用 `createPortal` 挂载到 `document.body`，并使用 `position: fixed` 定位，避免被页面区域、侧边栏或父级 overflow 裁切。
- Tooltip 默认优先向上弹出；上方空间不足时向下弹出。
- Tooltip 与触发件的视觉间距为 `2px`。
- 箭头以触发件中心为锚点对齐；横向防出屏时，气泡整体位置可调整，但箭头必须在气泡内部补偿并继续指向触发件中心。
- Tooltip 与窗口顶部和底部最小保持 `48px` 安全间距。
- Tooltip 左右方向最小保持 `8px` 防出屏间距。
- 页面滚动或窗口 resize 时，Tooltip 必须跟随触发件重新定位。
- 鼠标从触发件移动到 Tooltip 内部时，Tooltip 必须保持打开；经过触发件与 Tooltip 之间的 `2px` 间距时不得触发关闭，以保证超高内容可以在气泡内部滚动。
- 展开动效为 `150ms ease-out`，延迟 `80ms`；收起动效为 `50ms ease-out`，离开后立即播放收起，不保留延迟。

## 8. Layout 页面适配

Layout 规范按端类型分层：`Desktop Web Layout`、`Tablet Layout`、`Mobile Layout`。当前仅实现 `Desktop Web Layout`；平板和手机移动端后续单独补充。

### 8.1 适配隔离原则

不同端的适配规则必须相互隔离。新增或调整某一端布局时，不得影响其他端已确认的样式、间距、结构和交互。

- `Desktop Web Layout`、`Tablet Layout`、`Mobile Layout` 分开定义，不用一个全局样式同时覆盖多个端。
- 调整手机端面板层、菜单间距、底部导航、底部 Sheet 等规则时，必须写在手机端限定规则中，不得污染网页端和平板端。
- 调整平板端布局时，必须验证网页端和手机端样式没有变化。
- 跨端共用控件只承载基础一致性；端差异，例如布局层级、面板形式、菜单密度、页面边距，应写在对应端 Layout 规则中。
- 修改某一端适配后，必须至少回归另两个端的关键页面布局。

### 8.2 Desktop Web Layout

右侧主内容区域最小适配宽度保持 `1024px`。左侧边栏不参与该适配规则。

页面主内容横向边距使用 `page-section-x`，由当前承担页面左右边距的容器板块单独引用，不在最外层 `main` 统一加 padding，也不改组件内部 padding。

| Viewport Width | Horizontal Padding |
| --- | --- |
| `1024px - 1279px` | `24px` |
| `1280px - 1439px` | `32px` |
| `1440px - 1599px` | `40px` |
| `>= 1600px` | `48px` |

仅替换页面主板块左右边距；卡片、弹窗、表格单元格、按钮、输入框等组件内部间距不跟随该规则变化。

右侧顶部固定导航也必须遵守 `1024px` 最小适配宽度。展开侧栏时标题栏最小宽度为 `784px`，收起侧栏时标题栏最小宽度为 `972px`，避免浏览器宽度小于 `1024px` 时 fixed 导航继续压缩。

### 8.3 Tablet Layout

后续单独定义。未定义前，不得用平板假设修改 `Desktop Web Layout`。

### 8.4 Mobile Layout

后续单独定义。未定义前，不得用手机移动端假设修改 `Desktop Web Layout`。

## 9. Modal 模态弹窗

Modal 用于需要阻断当前页面操作、要求用户完成阅读、确认、填写或流程操作的场景。页面不得重复手写 `fixed inset-0` 遮罩、弹窗动画、`role="dialog"`、`aria-modal` 和关闭逻辑，必须优先使用已封装的 Modal 控件。

### 9.1 基础骨架

`Modal` 是底层弹窗骨架，不作为业务首选控件。它负责遮罩、居中、尺寸、圆角、阴影、动画、点击遮罩关闭、`Esc` 关闭、关闭按钮、Header / Body / Footer 和可访问性属性。

页面优先使用模式控件；只有复杂业务弹窗或新模式尚未稳定时，才直接使用 `Modal size="..."`。

### 9.2 尺寸档与模式控件

| Size | Width | Component | Usage | Current Instance |
| --- | --- | --- | --- | --- |
| `sm` | `360px` | `InfoModal` | 小型信息展示，图片、图标、二维码、简短说明 | 开票、联系客服 |
| `md` | `480px` | `ConfirmModal` | 确认、警告、删除、状态变更 | 全部已读、退出登录、删除项目、删除任务 |
| `md` | `480px` | `FormModal` | 表单、编辑、创建，支持单字段或多字段 | 新建项目、重命名项目、个人资料 |
| `lg` | `640px` | `FeatureModal` | 中型功能面板，多字段功能页、登录、授权、绑定 | 登录 |
| `xl` | `720px` | `ContentModal` | 长内容、协议、说明、多 Tab 内容 | 隐私政策、服务条款 |
| `2xl` | `960px` | `WorkflowModal` | 复杂流程、分栏业务、支付、配置向导 | 充值 |

移动端或窄屏时，弹窗宽度使用 `min(tokenWidth, calc(100vw - 48px))`。

弹窗最大高度统一使用 `calc(100vh - 80px)`，即距离窗口顶部和底部最小保留 `40px`。默认内容超出时只滚动 Body 内容区，Header、Footer、关闭按钮和底部操作区必须保持可见。

分栏、支付、配置向导等需要固定背景、固定侧栏底色或固定右上关闭按钮的复杂弹窗，必须使用 `Modal bodyScroll="none"` 保持弹窗外壳不滚动，再由左右面板或业务内容区各自设置内部滚动。不可让关闭按钮、底图、背景底色、固定侧栏随内容一起滚动。

### 9.3 通用结构

| Area | Rule |
| --- | --- |
| Overlay | 默认 `bg-bg-black/60` |
| Container | `rounded-modal`，默认 `shadow-card-hover` |
| Header | 标题 + 右侧关闭按钮，标准内边距 `pl-6 pr-4 pt-4 pb-2` |
| Title | `16px / 24px`，`font-medium` |
| Close Button | `ModalCloseButton`，`32px × 32px`，使用 `Icon name="X"` |
| Body | 默认 `px-6 py-4`，`bodyScroll="body"` 时内容超高在 Body 内滚动；复杂固定外壳弹窗使用 `bodyScroll="none"` |
| Footer | 默认 `px-6 pt-4 pb-6`，右对齐 |
| Footer Button | 默认使用 `Button size="lg"` |

- `InfoModal` 内容默认居中，通常无 Footer。
- `ConfirmModal` 固定为标题、说明、取消按钮、确认按钮。
- `FormModal` 固定为标题、表单内容、取消按钮、确认按钮；内容区不限制字段数量。
- `FeatureModal`、`ContentModal`、`WorkflowModal` 可以承载业务自定义内容，但仍必须复用统一 Modal 行为。
- 业务弹窗如 `LoginModal`、`RechargeModal` 不直接变成通用控件，应作为对应模式下的业务实例。
- `WorkflowModal` 若包含固定底图、固定背景侧栏、支付二维码区等分栏结构，弹窗 Body 不参与滚动；滚动层必须放在具体内容面板内部。
- 弹窗右上角关闭按钮统一使用 `ModalCloseButton`；`X` 的视觉描边按弹窗规范保持一致；灰底区域使用 `surface="soft"`。
- 点击遮罩关闭仅在鼠标按下和释放都发生在遮罩本身时触发；从弹窗内容区按下后拖到遮罩释放，不关闭弹窗。

## 10. 后续落地要求

### 10.1 优先级

后续 UI 优化时，执行优先级如下：

1. 本文档。
2. 页面所属专项规范。
3. 现有代码样式。

如果旧页面样式和本文档冲突，以本文档为准。

### 10.2 AI 执行规则

AI 修改页面时必须做到：

- 改动前先确认当前页面属于前台、后台、运营位还是特殊营销页，再选择对应按钮尺寸和字体层级。
- 先检查本页面使用的字号、行高、颜色和按钮。
- 图标必须通过统一 `Icon` 组件使用，不直接在页面内引入 `lucide-react`。
- 模态弹窗必须先判断尺寸档，再选择 `InfoModal`、`ConfirmModal`、`FormModal`、`FeatureModal`、`ContentModal` 或 `WorkflowModal`。
- 把不符合本文档的样式收敛到规范 token。
- 不新增后端接口，不修改服务端逻辑。
- 不为了视觉效果新增无意义颜色、渐变、阴影或大圆角。
- 修改后检查移动端和桌面端是否有文字溢出、遮挡、错位。

### 10.3 当前适用范围

本规范适用于：

- 前台页面
- 智能体市场
- 登录后工作台
- 任务页
- 设置页
- 后台管理页面中的基础 UI 样式

特殊营销页可以有更强视觉表现，但字体、按钮和基础文本颜色仍应尽量遵守本文档。
