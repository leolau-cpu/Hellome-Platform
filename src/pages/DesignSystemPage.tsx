import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, ButtonLink } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { SearchInput } from '../components/ui/SearchInput';
import { TabBar } from '../components/ui/TabBar';
import { TabButton } from '../components/ui/TabButton';

const buttonVariants = ['primary', 'secondary', 'text', 'warning', 'notice'] as const;
const buttonSizes = ['xl', 'lg', 'md', 'sm', 'xs'] as const;
const tabItems = [
  { value: 'filter-1', label: '筛选按钮' },
  { value: 'filter-2', label: '筛选按钮' },
  { value: 'filter-3', label: '筛选按钮' },
  { value: 'filter-4', label: '筛选按钮' },
];
const overflowTabItems = [
  { value: 'filter-1', label: '筛选按钮' },
  { value: 'filter-2', label: '筛选按钮' },
  { value: 'filter-3', label: '筛选按钮' },
  { value: 'filter-4', label: '筛选按钮' },
  { value: 'filter-5', label: '筛选按钮' },
  { value: 'filter-6', label: '筛选按钮' },
  { value: 'filter-7', label: '筛选按钮' },
  { value: 'filter-8', label: '筛选按钮' },
  { value: 'filter-9', label: '筛选按钮' },
  { value: 'filter-10', label: '筛选按钮' },
  { value: 'filter-11', label: '筛选按钮' },
  { value: 'filter-12', label: '筛选按钮' },
];
const iconSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
const colorGroups = [
  {
    title: 'Text',
    items: [
      { token: 'text.primary', className: 'bg-text-primary' },
      { token: 'text.secondary', className: 'bg-text-secondary' },
      { token: 'text.hint', className: 'bg-text-hint' },
      { token: 'text.placeholder', className: 'bg-text-placeholder' },
      { token: 'text.disabled', className: 'bg-text-disabled' },
      { token: 'text.inverse', className: 'bg-text-inverse shadow-border-strong' },
    ],
  },
  {
    title: 'Background',
    items: [
      { token: 'bg.white', className: 'bg-bg-white shadow-border-strong' },
      { token: 'bg.soft', className: 'bg-bg-soft' },
      { token: 'bg.medium', className: 'bg-bg-medium' },
      { token: 'bg.strong', className: 'bg-bg-strong' },
      { token: 'bg.black', className: 'bg-bg-black' },
    ],
  },
  {
    title: 'Border',
    items: [
      { token: 'border.subtle', className: 'bg-border-subtle' },
      { token: 'border.default', className: 'bg-border-default' },
      { token: 'border.strong', className: 'bg-border-strong' },
      { token: 'border.hover', className: 'bg-border-hover' },
      { token: 'border.selected', className: 'bg-border-selected' },
    ],
  },
  {
    title: 'Accent',
    items: [
      { token: 'accent.orange', className: 'bg-accent-orange' },
      { token: 'accent.red', className: 'bg-accent-red' },
      { token: 'accent.teal', className: 'bg-accent-teal' },
      { token: 'accent.green', className: 'bg-accent-green' },
      { token: 'accent.toolbar', className: 'bg-accent-toolbar' },
    ],
  },
] as const;

const typographyItems = [
  { token: 'text-xs', className: 'text-xs', sample: '辅助信息 / Caption' },
  { token: 'text-sm', className: 'text-sm', sample: '正文文本 / Body' },
  { token: 'text-base', className: 'text-base', sample: '强调正文 / Body Large' },
  { token: 'text-lg', className: 'text-lg', sample: '小标题 / Section Title' },
  { token: 'text-xl', className: 'text-xl', sample: '模块标题 / Module Title' },
  { token: 'text-2xl', className: 'text-2xl', sample: '页面标题 / Page Title' },
] as const;

function PreviewCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-button bg-bg-white p-6 shadow-border-strong">
      {children}
    </div>
  );
}

function Section({
  index,
  name,
  title,
  description,
  children,
}: {
  index: string;
  name: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border-default py-10">
      <div className="mb-6 grid gap-4">
        <div>
          <div className="text-xs font-medium uppercase text-text-hint">
            {index} — {name}
          </div>
          <h2 className="mt-2 text-xl font-medium text-text-primary">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-text-secondary">
            {description}
          </p>
        </div>
      </div>
      <PreviewCanvas>{children}</PreviewCanvas>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 border-t border-border-subtle py-4 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[140px_1fr]">
      <div className="text-sm text-text-secondary">{label}</div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function DesignSystemPage() {
  const [activeTabButton, setActiveTabButton] = useState(tabItems[0].value);
  const [activeTabBar, setActiveTabBar] = useState(overflowTabItems[0].value);

  return (
    <main className="min-h-screen bg-bg-soft px-12 py-10 text-text-primary">
      <div className="mx-auto max-w-[1120px]">
        <header className="pb-10">
          <div className="text-xs font-medium uppercase text-text-hint">
            Hellome Design System
          </div>
          <h1 className="mt-3 text-3xl font-medium">设计规范实时预览</h1>
          <p className="mt-3 max-w-3xl text-sm text-text-secondary">
            这个页面用于集中验收已封装控件。整体说明使用中文，控件名称、props、variant、size、state 和 token
            保持开发侧英文命名。预览区直接引用真实控件，不在页面内覆盖控件本身样式。
          </p>
        </header>

        <Section
          index="01"
          name="Colors"
          title="颜色"
          description="Colors 属于 Foundation，不封装成 React 控件。页面实现时直接使用 token class，不写裸色值。"
        >
          <div className="grid gap-6">
            {colorGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-3 text-sm font-medium text-text-primary">
                  {group.title}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.token}
                      className="overflow-hidden rounded-button bg-bg-white shadow-border-strong"
                    >
                      <div className={`h-16 ${item.className}`} />
                      <div className="p-3 text-sm text-text-secondary">
                        {item.token}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          index="02"
          name="Typography"
          title="文字"
          description="Typography 属于 Foundation，通过字号、行高、字重和字体族 token 控制。除品牌 Logo 外，字体族使用系统默认字体。"
        >
          <div className="grid gap-1">
            {typographyItems.map((item) => (
              <Row key={item.token} label={item.token}>
                <span className={`${item.className} text-text-primary`}>
                  {item.sample}
                </span>
              </Row>
            ))}
            <Row label="font-logo">
              <span className="font-logo text-xl text-text-primary">
                Hello<span className="text-accent-green">me</span>
              </span>
            </Row>
          </div>
        </Section>

        <Section
          index="03"
          name="Button"
          title="按钮"
          description="Button 用于触发页面操作。当前封装包含 variant、size、surface、selected、disabled 和 loading；线框按钮和文字按钮通过 surface 适配白底与灰底的 hover / active 反馈。"
        >
          <div className="grid gap-1">
            {buttonVariants.map((variant) => (
              <Row key={variant} label={`variant: ${variant}`}>
                <Button variant={variant}>默认按钮</Button>
                <Button variant={variant}>
                  <Icon name="Plus" className="mr-1" />
                  带图标
                </Button>
                <Button variant={variant} disabled>
                  禁用按钮
                </Button>
                <Button variant={variant} isLoading>
                  加载按钮
                </Button>
              </Row>
            ))}
            <Row label="surface: white">
              <Button variant="secondary" surface="white">
                线框按钮
              </Button>
              <Button variant="secondary" surface="white" selected>
                选中按钮
              </Button>
              <Button variant="text" surface="white">
                文字按钮
              </Button>
            </Row>
            <Row label="surface: soft">
              <div className="flex flex-wrap items-center gap-3 rounded-button bg-bg-soft p-4">
                <Button variant="secondary" surface="soft">
                  线框按钮
                </Button>
                <Button variant="secondary" surface="soft" selected>
                  选中按钮
                </Button>
                <Button variant="text" surface="soft">
                  文字按钮
                </Button>
              </div>
            </Row>
          </div>
        </Section>

        <Section
          index="04"
          name="Button Size"
          title="按钮尺寸"
          description="Button size 控制按钮高度、内边距与文本层级。页面实现时优先选择既有 size，不在页面内临时写高度或字号。"
        >
          <div className="grid gap-1">
            {buttonSizes.map((size) => (
              <Row key={size} label={`size: ${size}`}>
                <Button size={size}>主按钮</Button>
                <Button variant="secondary" size={size}>
                  辅助按钮
                </Button>
                <Button variant="text" size={size}>
                  文字按钮
                </Button>
              </Row>
            ))}
          </div>
        </Section>

        <Section
          index="05"
          name="ButtonLink"
          title="链接型按钮"
          description="ButtonLink 用于需要链接语义的操作入口。链接按钮不使用填充和描边，只通过 tone 控制文字颜色。"
        >
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink
              href="#preview"
              tone="black"
              onClick={(event) => event.preventDefault()}
            >
              黑字链接
            </ButtonLink>
            <ButtonLink
              href="#preview"
              tone="red"
              onClick={(event) => event.preventDefault()}
            >
              红字链接
            </ButtonLink>
            <ButtonLink
              href="#preview"
              tone="yellow"
              onClick={(event) => event.preventDefault()}
            >
              黄字链接
            </ButtonLink>
            <ButtonLink
              href="#preview"
              tone="green"
              onClick={(event) => event.preventDefault()}
            >
              绿字链接
            </ButtonLink>
          </div>
        </Section>

        <Section
          index="06"
          name="TabButton"
          title="分类与视图切换"
          description="TabButton 用于同一页面内的分类筛选或视图切换。它基于 text button 的视觉逻辑，但拥有 selected 状态。"
        >
          <div className="flex flex-wrap items-center gap-1">
            {tabItems.map((item) => (
              <TabButton
                key={item.value}
                selected={item.value === activeTabButton}
                onClick={() => setActiveTabButton(item.value)}
              >
                {item.label}
              </TabButton>
            ))}
            <TabButton disabled>禁用</TabButton>
          </div>
        </Section>

        <Section
          index="07"
          name="TabBar"
          title="单行分类导航"
          description="TabBar 用于承载横向分类。内容超出时保持单行滚动，并在左右侧通过渐变覆盖层和箭头按钮提示还有更多内容。"
        >
          <div className="max-w-[520px]">
            <TabBar
              items={overflowTabItems}
              value={activeTabBar}
              onValueChange={setActiveTabBar}
            />
          </div>
        </Section>

        <Section
          index="08"
          name="SearchInput"
          title="搜索输入框"
          description="SearchInput 用于页面内搜索。hover 时描边和图标高亮，输入内容后展示清空按钮。当前提供 32px 和 36px 两种尺寸。"
        >
          <div className="grid gap-1">
            <Row label="size: md">
              <SearchInput
                className="w-60"
                placeholder="搜索"
                aria-label="搜索"
              />
            </Row>
            <Row label="md with value">
              <SearchInput
                className="w-60"
                defaultValue="搜索内容"
                placeholder="搜索"
                aria-label="搜索"
              />
            </Row>
            <Row label="size: lg">
              <SearchInput
                size="lg"
                className="w-60"
                placeholder="搜索"
                aria-label="搜索"
              />
            </Row>
            <Row label="lg with value">
              <SearchInput
                size="lg"
                className="w-60"
                defaultValue="搜索内容"
                placeholder="搜索"
                aria-label="搜索"
              />
            </Row>
          </div>
        </Section>

        <Section
          index="09"
          name="Icon"
          title="图标"
          description="Icon 统一注册并调用 lucide-react，页面只通过 name 和 size 使用。默认尺寸为 md，描边按尺寸等比换算。"
        >
          <div className="grid gap-1">
            {iconSizes.map((size) => (
              <Row key={size} label={`size: ${size}`}>
                <Icon name="Search" size={size} />
                <Icon name="Home" size={size} />
                <Icon name="Settings" size={size} />
                <Icon name="ListFilter" size={size} />
                <span className="text-sm text-text-secondary">
                  Icon size: {size}
                </span>
              </Row>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
