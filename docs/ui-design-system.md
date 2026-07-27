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

| Font Size | Line Height | Usage |
| --- | --- | --- |
| `10px` | `13px` | 极小状态标签，仅用于空间受限的状态徽标 |
| `12px` | `16px` | 辅助信息、标签、状态、表格次要字段 |
| `14px` | `20px` | 默认正文、按钮、表单、列表内容 |
| `16px` | `24px` | 重要正文、卡片标题、表单分组标题 |
| `18px` | `26px` | 页面小标题、模块标题 |
| `20px` | `28px` | 页面标题、重点模块标题 |
| `24px` | `32px` | 强标题、运营位标题 |
| `28px` | `36px` | 首屏标题、市场页重点标题 |
| `32px` | `40px` | 大标题 |
| `36px` | `44px` | 强视觉标题 |
| `40px` | `48px` | 首页主标题 |
| `48px` | `56px` | 大型展示标题 |
| `56px` | `64px` | 特殊营销标题 |
| `64px` | `72px` | 特殊超大标题 |
| `72px` | `80px` | 极少使用的品牌展示标题 |

### 2.3 执行规则

- 页面正文优先使用 `14px / 20px`。
- `10px / 13px` 仅用于设计稿明确标注的极小状态标签，不作为正文、说明文字或按钮字号。
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
| `accent.successBorder` | `#27B66A` | 成功、进行中等状态描边 |
| `accent.blue` | `#1685FE` | 云空间、蓝色功能提示 |

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
| `button.link.black` | 链接按钮 | 默认 | transparent | `#000000` | none |
| `button.link.red` | 链接按钮 | 默认 | transparent | `#D94E41` | none |
| `button.link.yellow` | 链接按钮 | 默认 | transparent | `#FF922B` | none |
| `button.link.green` | 链接按钮 | 默认 | transparent | `#219B5A` | none |
| `button.disabled` | 通用禁用态 | 禁用 | transparent | `#CCCCCC` | `1px solid #E5E5E5` |

### 5.3 按钮圆角

| Token | Shape | Radius | Usage |
| --- | --- | --- | --- |
| `button.radius.default` | 圆角按钮 | `8px` | 常规按钮、后台系统、表单操作、弹窗按钮 |
| `button.radius.pill` | 全圆角按钮 | `999px` / `50%` | 强引导按钮、胶囊按钮、标签式按钮、移动端底部主按钮 |

### 5.4 执行规则

- 每个页面只保留一个最强主按钮。
- 主按钮使用 `primary`，不要用彩色渐变代替。
- 次级操作使用 `secondary` 或 `text`。
- 线框按钮和文字按钮叠加在白色背景时使用 `surface="white"`；叠加在灰色背景时使用 `surface="soft"`。
- 链接按钮使用 `ButtonLink`，不使用填充和描边，只通过 `tone="black" | "red" | "yellow" | "green"` 控制文字颜色。
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
- 按钮文字默认单行显示；文案过长时优先缩短文案，不通过增加高度解决。
- 常规按钮圆角为 `8px`，不要随意使用超大圆角。

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

### 5.7 SearchInput 搜索输入框

SearchInput 用于页面内搜索、筛选搜索和列表检索。页面内不得临时手写搜索框结构，必须通过统一 `SearchInput` 控件使用。

| Size | Height | Padding X | Font Size | Icon | Usage |
| --- | --- | --- | --- | --- | --- |
| `md` | `32px` | `14px` | `14px` | `16px / 1px` | 默认搜索框、工具栏搜索 |
| `lg` | `36px` | `16px` | `14px` | `16px / 1px` | 较强调搜索、页面顶部搜索 |

| State | Border | Icon | Text | Clear Button |
| --- | --- | --- | --- | --- |
| `default` | `border.strong` | `text.hint` | `text.primary` | hidden |
| `hover` | `border.hover` | `text.hint` | `text.primary` | 按输入状态显示 |
| `active` | `border.selected` | `text.primary` | `text.primary` | 按输入状态显示 |
| `focus` | `border.selected` | `text.primary` | `text.primary` | 按输入状态显示 |
| `hasValue` | 按 hover / focus 状态 | 按 hover / focus 状态 | `text.primary` | visible |

- 搜索图标使用 `Icon name="Search"`，默认 `md` 尺寸。
- 输入文字后右侧展示清空按钮。
- 清空按钮尺寸为 `14px × 14px`，圆形。
- 清空按钮默认底色使用 `text.hint`，hover 使用 `text.secondary`，active 使用 `text.primary`。
- 清空按钮内关闭图标使用 `Icon name="X" size="xs"`，即 `10px`，颜色使用 `text.inverse`。
- SearchInput 圆角沿用 `button.radius.default`，即 `8px`。
- SearchInput 的浏览器原生清除按钮不作为交互来源，清空行为由控件内部实现。

## 6. 后续落地要求

### 6.1 优先级

后续 UI 优化时，执行优先级如下：

1. 本文档。
2. 页面所属专项规范。
3. 现有代码样式。

如果旧页面样式和本文档冲突，以本文档为准。

### 6.2 AI 执行规则

AI 修改页面时必须做到：

- 改动前先确认当前页面属于前台、后台、运营位还是特殊营销页，再选择对应按钮尺寸和字体层级。
- 先检查本页面使用的字号、行高、颜色和按钮。
- 图标必须通过统一 `Icon` 组件使用，不直接在页面内引入 `lucide-react`。
- 把不符合本文档的样式收敛到规范 token。
- 不新增后端接口，不修改服务端逻辑。
- 不为了视觉效果新增无意义颜色、渐变、阴影或大圆角。
- 修改后检查移动端和桌面端是否有文字溢出、遮挡、错位。

### 6.3 当前适用范围

本规范适用于：

- 前台页面
- 智能体市场
- 登录后工作台
- 任务页
- 设置页
- 后台管理页面中的基础 UI 样式

特殊营销页可以有更强视觉表现，但字体、按钮和基础文本颜色仍应尽量遵守本文档。
