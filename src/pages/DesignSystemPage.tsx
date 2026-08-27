import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Button,
  IconButton,
  TextLink,
  ToolbarIconButton,
} from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { CounterInput, InputField } from '../components/ui/Input';
import {
  ConfirmModal,
  ContentModal,
  FeatureModal,
  FormModal,
  InfoModal,
  WorkflowModal,
} from '../components/ui/Modal';
import {
  Popover,
  PopoverMenu,
  PopoverPanel,
  PopoverDivider,
  PopoverEmpty,
  PopoverHeader,
  PopoverItem,
  PopoverSearch,
  PopoverSection,
  PopoverOptions,
} from '../components/ui/Popover';
import { SearchInput } from '../components/ui/SearchInput';
import { TabBar } from '../components/ui/TabBar';
import { TabButton } from '../components/ui/TabButton';
import { Tooltip } from '../components/ui/Tooltip';

const buttonVariants = ['primary', 'secondary', 'text', 'warning', 'notice'] as const;
const buttonSizes = ['xl', 'lg', 'md', 'sm', 'xs'] as const;
const popoverPanelPreviewOptions = [
  { label: '选项一', src: '/assets/home/workflows/cover-1.png' },
  { label: '选项二', src: '/assets/home/workflows/cover-2.png' },
  { label: '选项三', src: '/assets/home/workflows/cover-3.png' },
  { label: '选项四', src: '/assets/home/workflows/cover-4.png' },
  { label: '选项五', src: '/assets/home/workflows/cover-5.png' },
  { label: '选项六', src: '/assets/home/workflows/cover-6.png' },
] as const;
type PopoverPanelPreviewOption = (typeof popoverPanelPreviewOptions)[number];
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
const designWeekLabels = ['日', '一', '二', '三', '四', '五', '六'] as const;
const notificationPreviewTabs = [
  { value: 'announcements', label: '公告', badge: 3 },
  { value: 'activity', label: '动态', badge: 0 },
] as const;
type NotificationPreviewTab = (typeof notificationPreviewTabs)[number]['value'];
const notificationPreviewMessages = [
  { title: '系统通知', time: '刚刚', unread: true },
  { title: '活动消息', time: '10:24', unread: true },
  { title: '功能更新提醒', time: '昨天', unread: false },
] as const;
type ActiveModalPreview =
  | 'info'
  | 'confirm'
  | 'form'
  | 'feature'
  | 'content'
  | 'workflow'
  | null;
const colorGroups = [
  {
    title: 'Text',
    items: [
      { token: 'text.primary', value: '000000', className: 'bg-text-primary' },
      { token: 'text.secondary', value: '666666', className: 'bg-text-secondary' },
      { token: 'text.hint', value: '999999', className: 'bg-text-hint' },
      { token: 'text.placeholder', value: 'B3B3B3', className: 'bg-text-placeholder' },
      { token: 'text.disabled', value: 'CCCCCC', className: 'bg-text-disabled' },
      { token: 'text.inverse', value: 'FFFFFF', className: 'bg-text-inverse' },
      { token: 'text.danger', value: 'D94E41', className: 'bg-text-danger' },
      { token: 'text.warning', value: 'D97C25', className: 'bg-text-warning' },
      { token: 'text.success', value: '219B5A', className: 'bg-text-success' },
      { token: 'text.info', value: '0074D9', className: 'bg-text-info' },
    ],
  },
  {
    title: 'Background',
    items: [
      { token: 'bg.white', value: 'FFFFFF', className: 'bg-bg-white' },
      { token: 'bg.soft', value: 'F9F9F9', className: 'bg-bg-soft' },
      { token: 'bg.medium', value: 'F3F3F3', className: 'bg-bg-medium' },
      { token: 'bg.strong', value: 'EAEAEA', className: 'bg-bg-strong' },
      { token: 'bg.black', value: '000000', className: 'bg-bg-black' },
    ],
  },
  {
    title: 'Border',
    items: [
      { token: 'border.subtle', value: 'F3F3F3', className: 'bg-border-subtle' },
      { token: 'border.default', value: 'EAEAEA', className: 'bg-border-default' },
      { token: 'border.strong', value: 'E5E5E5', className: 'bg-border-strong' },
      { token: 'border.hover', value: 'B3B3B3', className: 'bg-border-hover' },
      { token: 'border.selected', value: '000000', className: 'bg-border-selected' },
    ],
  },
  {
    title: 'Accent',
    items: [
      { token: 'accent.red', value: 'FF5C4D', className: 'bg-accent-red' },
      { token: 'accent.orange', value: 'FF922B', className: 'bg-accent-orange' },
      { token: 'accent.green', value: '27B66A', className: 'bg-accent-green' },
      { token: 'accent.blue', value: '0088FF', className: 'bg-accent-blue' },
      { token: 'accent.indigo', value: '7080FF', className: 'bg-accent-indigo' },
      { token: 'accent.violet', value: '966CFF', className: 'bg-accent-violet' },
      { token: 'accent.magenta', value: 'CC3380', className: 'bg-accent-magenta' },
      { token: 'accent.teal', value: '146666', className: 'bg-accent-teal' },
    ],
  },
] as const;

const typographyItems = [
  { token: 'text-xxs', className: 'text-xxs', fontSize: '10px', lineHeight: '13px', sample: '极小状态标签 / Tiny Badge' },
  { token: 'text-label', className: 'text-label', fontSize: '11px', lineHeight: '14px', sample: '极小角标 / Micro Label' },
  { token: 'text-xs', className: 'text-xs', fontSize: '12px', lineHeight: '16px', sample: '辅助信息 / Caption' },
  { token: 'text-sm', className: 'text-sm', fontSize: '14px', lineHeight: '20px', sample: '正文文本 / Body' },
  { token: 'text-sm-reading', className: 'text-sm leading-[22px]', fontSize: '14px', lineHeight: '22px', sample: '特殊阅读输入 / Reading Exception' },
  { token: 'text-base', className: 'text-base', fontSize: '16px', lineHeight: '24px', sample: '强调正文 / Body Large' },
  { token: 'text-lg', className: 'text-lg', fontSize: '18px', lineHeight: '26px', sample: '小标题 / Section Title' },
  { token: 'text-xl', className: 'text-xl', fontSize: '20px', lineHeight: '28px', sample: '模块标题 / Module Title' },
  { token: 'text-2xl', className: 'text-2xl', fontSize: '24px', lineHeight: '32px', sample: '页面标题 / Page Title' },
  { token: 'text-3xl', className: 'text-3xl', fontSize: '28px', lineHeight: '36px', sample: '首屏标题 / Hero Title' },
  { token: 'text-4xl', className: 'text-4xl', fontSize: '32px', lineHeight: '40px', sample: '大标题 / Large Title' },
  { token: 'text-5xl', className: 'text-5xl', fontSize: '36px', lineHeight: '44px', sample: '强视觉标题 / Display Title' },
  { token: 'text-6xl', className: 'text-6xl', fontSize: '40px', lineHeight: '48px', sample: '首页主标题 / Home Title' },
  { token: 'text-7xl', className: 'text-7xl', fontSize: '48px', lineHeight: '56px', sample: '大型展示标题 / Display Large' },
  { token: 'text-8xl', className: 'text-8xl', fontSize: '56px', lineHeight: '64px', sample: '特殊营销标题 / Marketing Title' },
  { token: 'text-9xl', className: 'text-9xl', fontSize: '64px', lineHeight: '72px', sample: '特殊超大标题 / Display Huge' },
  { token: 'text-10xl', className: 'text-10xl', fontSize: '72px', lineHeight: '80px', sample: '品牌展示标题 / Brand Display' },
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
    <div className="grid items-center gap-3 border-t border-border-subtle py-4 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[140px_1fr]">
      <div className="flex min-h-8 items-center text-sm text-text-secondary">{label}</div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function addPreviewMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function createDatePickerPreviewCells(visibleMonth: Date) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  return [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      key: `empty-${index}`,
      day: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `day-${index + 1}`,
      day: index + 1,
    })),
  ];
}

function DatePickerPopoverPreview({
  selectedDay,
  visibleMonth,
  onSelectedDayChange,
  onVisibleMonthChange,
}: {
  selectedDay: number;
  visibleMonth: Date;
  onSelectedDayChange: (day: number) => void;
  onVisibleMonthChange: (date: Date) => void;
}) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const datePickerPreviewCells = createDatePickerPreviewCells(visibleMonth);

  return (
    <Popover
      position="static"
      width={280}
      padding="none"
      constrainHeight={false}
      className="p-3"
      role="dialog"
      aria-label="日期选择浮窗示例"
    >
      <div className="flex h-10 items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center">
          <IconButton
            name="ArrowLeft"
            variant="text"
            size="md"
            aria-label="上个月"
            onClick={() => onVisibleMonthChange(addPreviewMonths(visibleMonth, -1))}
          />
        </div>
        <div className="flex h-10 w-40 items-center justify-center text-sm font-medium leading-5 text-text-primary">
          {year}年{month + 1}月
        </div>
        <div className="flex h-10 w-10 items-center justify-center">
          <IconButton
            name="ArrowRight"
            variant="text"
            size="md"
            aria-label="下个月"
            onClick={() => onVisibleMonthChange(addPreviewMonths(visibleMonth, 1))}
          />
        </div>
      </div>
      <div className="flex h-4 items-center px-1">
        <div className="h-px w-full bg-border-subtle" />
      </div>
      <div className="grid w-full grid-cols-[repeat(7,32px)] auto-rows-[32px] gap-1 px-1 py-1">
        {designWeekLabels.map((label) => (
          <div
            key={label}
            className="flex h-8 w-8 items-center justify-center text-sm font-medium leading-5 text-text-hint"
          >
            {label}
          </div>
        ))}
        {datePickerPreviewCells.map((cell) => {
          const day = cell.day;
          const isSelected = day === selectedDay;

          return (
            <div
              key={cell.key}
              className="flex h-8 w-8 items-center justify-center"
            >
              {day !== null && (
                <button
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-button text-sm font-medium leading-5',
                    isSelected
                      ? 'bg-bg-black text-text-inverse'
                      : 'text-text-primary hover:bg-bg-soft active:bg-bg-medium',
                  ].join(' ')}
                  type="button"
                  onClick={() => onSelectedDayChange(day)}
                >
                  {day}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Popover>
  );
}

function NotificationPopoverPreview({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: NotificationPreviewTab;
  onActiveTabChange: (tab: NotificationPreviewTab) => void;
}) {
  const messagesToShow =
    activeTab === 'announcements' ? notificationPreviewMessages : [];

  return (
    <Popover
      position="static"
      width={400}
      constrainHeight={false}
      className="flex min-h-[196px] flex-col"
      role="dialog"
      aria-label="消息通知浮窗示例"
    >
      <div className="flex h-9 w-full items-center px-4">
        <div className="flex h-9 w-full items-center gap-4">
          {notificationPreviewTabs.map((tab) => {
            const isActive = tab.value === activeTab;

            return (
              <button
                key={tab.value}
                className={[
                  'flex h-9 items-center gap-1 text-sm leading-5',
                  isActive
                    ? 'font-medium text-text-primary'
                    : 'font-normal text-text-hint hover:text-text-secondary active:text-text-primary',
                ].join(' ')}
                type="button"
                onClick={() => onActiveTabChange(tab.value)}
              >
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent-red px-1 text-xs leading-4 text-text-inverse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex h-4 items-center px-4">
        <div className="h-px w-full bg-border-subtle" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        {messagesToShow.length === 0 ? (
          <div className="flex h-[110px] items-center justify-center px-4 text-sm leading-5 text-text-hint">
            <span className="flex items-center gap-2">
              <Icon name="MailOpen" className="shrink-0" />
              <span>暂无消息</span>
            </span>
          </div>
        ) : (
          messagesToShow.map((message) => (
            <button
              key={message.title}
              className="group flex h-10 w-full items-center px-2 text-left"
              type="button"
            >
              <span className="flex h-9 min-w-0 flex-1 items-center rounded-button px-2 hover:bg-bg-soft active:bg-bg-medium">
                <span
                  className={[
                    'h-1.5 w-1.5 shrink-0 rounded-pill',
                    message.unread ? 'bg-accent-red' : 'bg-bg-strong',
                  ].join(' ')}
                />
                <span
                  className={[
                    'ml-2 min-w-0 flex-1 truncate text-sm leading-5 text-text-primary',
                    message.unread ? 'font-medium' : 'font-normal',
                  ].join(' ')}
                >
                  {message.title}
                </span>
                <time className="ml-2 shrink-0 text-xs leading-4 text-text-hint group-hover:hidden">
                  {message.time}
                </time>
                <Icon
                  name="ChevronRight"
                  className="ml-2 hidden shrink-0 text-text-secondary group-hover:block"
                />
              </span>
            </button>
          ))
        )}
      </div>
      <div className="flex h-3 items-center px-4">
        <div className="h-px w-full bg-border-subtle" />
      </div>
      <div className="flex h-9 items-center px-4">
        <div className="flex h-9 w-full items-center justify-between">
          <button
            className="h-5 rounded-button text-sm leading-5 text-text-secondary hover:text-text-primary active:text-text-primary"
            type="button"
          >
            全部已读
          </button>
          <button
            className="group flex h-5 items-center rounded-button text-sm leading-5 text-text-secondary hover:text-text-primary active:text-text-primary"
            type="button"
          >
            <span>全部消息</span>
            <Icon
              name="ChevronRight"
              className="text-text-secondary group-hover:text-text-primary group-active:text-text-primary"
            />
          </button>
        </div>
      </div>
    </Popover>
  );
}

export function DesignSystemPage() {
  const [activeTabButton, setActiveTabButton] = useState(tabItems[0].value);
  const [activeTabBar, setActiveTabBar] = useState(overflowTabItems[0].value);
  const [activeModalPreview, setActiveModalPreview] =
    useState<ActiveModalPreview>(null);
  const [modalFormName, setModalFormName] = useState('示例项目');
  const [popoverSearchValue, setPopoverSearchValue] = useState('');
  const [selectedPopoverOption, setSelectedPopoverOption] = useState('选项一');
  const [selectedPopoverPanelOption, setSelectedPopoverPanelOption] =
    useState('选项一');
  const [selectedDatePreviewDay, setSelectedDatePreviewDay] = useState(28);
  const [visibleDatePreviewMonth, setVisibleDatePreviewMonth] = useState(
    () => new Date(2026, 6, 1),
  );
  const [activeNotificationPreviewTab, setActiveNotificationPreviewTab] =
    useState<NotificationPreviewTab>('announcements');
  const popoverPanelPreviewRef = useRef<HTMLDivElement | null>(null);
  const [popoverPanelEmptyHeight, setPopoverPanelEmptyHeight] =
    useState<number | null>(null);
  const normalizedPopoverSearchValue = popoverSearchValue.trim().toLowerCase();
  const filterPopoverOptions = (options: readonly PopoverPanelPreviewOption[]) =>
    normalizedPopoverSearchValue
      ? options.filter((option) =>
          option.label.toLowerCase().includes(normalizedPopoverSearchValue),
        )
      : options;
  const firstPopoverPanelOptions = filterPopoverOptions(
    popoverPanelPreviewOptions.slice(0, 2),
  );
  const secondPopoverPanelOptions = filterPopoverOptions(
    popoverPanelPreviewOptions.slice(2, 5),
  );
  const hasPopoverSearchValue = normalizedPopoverSearchValue.length > 0;
  const hasPopoverPanelResults =
    firstPopoverPanelOptions.length > 0 || secondPopoverPanelOptions.length > 0;

  useLayoutEffect(() => {
    if (hasPopoverSearchValue && !hasPopoverPanelResults) {
      return;
    }

    const popoverPanelElement = popoverPanelPreviewRef.current;

    if (!popoverPanelElement) {
      return;
    }

    const nextHeight = Math.ceil(
      popoverPanelElement.getBoundingClientRect().height,
    );

    setPopoverPanelEmptyHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  }, [hasPopoverPanelResults, hasPopoverSearchValue, popoverSearchValue]);

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
                      className="overflow-hidden rounded-button border border-border-strong bg-bg-white"
                    >
                      <div className={`h-16 border-b border-border-subtle ${item.className}`} />
                      <div className="flex items-center justify-between gap-3 p-3 text-sm">
                        <span className="min-w-0 truncate text-text-secondary">
                          {item.token}
                        </span>
                        <span className="shrink-0 text-text-hint">
                          {item.value}
                        </span>
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
                <div className="flex min-w-0 flex-1 items-center justify-between gap-6">
                  <span className={`${item.className} min-w-0 text-text-primary`}>
                    {item.sample}
                  </span>
                  <span className="shrink-0 text-sm leading-5 text-text-hint">
                    {item.fontSize} / {item.lineHeight}
                  </span>
                </div>
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
          name="TextLink"
          title="文字链接"
          description="TextLink 用于正文、列表和说明区域中的链接入口。文字链接不复用按钮尺寸，不使用填充和描边，只通过 tone 控制文字颜色。"
        >
          <div className="flex flex-wrap items-center gap-3">
            <TextLink
              href="#preview"
              tone="black"
              onClick={(event) => event.preventDefault()}
            >
              黑字链接
            </TextLink>
            <TextLink
              href="#preview"
              tone="red"
              onClick={(event) => event.preventDefault()}
            >
              红字链接
            </TextLink>
            <TextLink
              href="#preview"
              tone="yellow"
              onClick={(event) => event.preventDefault()}
            >
              黄字链接
            </TextLink>
            <TextLink
              href="#preview"
              tone="green"
              onClick={(event) => event.preventDefault()}
            >
              绿字链接
            </TextLink>
            <TextLink
              href="#preview"
              tone="blue"
              onClick={(event) => event.preventDefault()}
            >
              蓝字链接
            </TextLink>
          </div>
        </Section>

        <Section
          index="04"
          name="Button"
          title="按钮"
          description="Button 用于触发页面操作。当前封装包含 variant、size、surface、selected、disabled 和 loading；线框按钮和文字按钮通过 surface 适配白底与灰底的 hover / active 反馈。"
        >
          <div className="grid gap-1">
            {buttonVariants.map((variant) => (
              <Row key={variant} label={`variant: ${variant}`}>
                <Button variant={variant}>默认按钮</Button>
                <Button variant={variant} icon="Plus">带图标</Button>
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
            <Row label="shape: pill">
              <Button shape="pill">全圆角按钮</Button>
              <Button variant="secondary" shape="pill">
                全圆角线框
              </Button>
              <Button variant="notice" shape="pill">
                全圆角提示
              </Button>
            </Row>
            <Row label="IconButton">
              <IconButton name="Plus" aria-label="新增" />
              <IconButton
                name="Search"
                variant="secondary"
                aria-label="搜索"
              />
              <IconButton
                name="Settings"
                variant="text"
                aria-label="设置"
              />
              <IconButton
                name="Trash"
                variant="warning"
                aria-label="删除"
              />
              <IconButton
                name="Plus"
                shape="pill"
                aria-label="新增"
              />
            </Row>
            <Row label="ToolbarIconButton">
              <div className="flex items-center gap-2">
                <ToolbarIconButton name="ListFilter" tone="secondary" aria-label="次要色筛选" />
                <span className="text-xs leading-4 text-text-hint">secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <ToolbarIconButton name="Ellipsis" tone="hint" aria-label="提示色更多" />
                <span className="text-xs leading-4 text-text-hint">hint</span>
              </div>
            </Row>
          </div>
        </Section>

        <Section
          index="05"
          name="Button Size"
          title="按钮尺寸"
          description="Button size 控制按钮高度、内边距与文本层级。页面实现时优先选择既有 size，不在页面内临时写高度或字号。"
        >
          <div className="grid gap-1">
            {buttonSizes.map((size) => (
              <Row key={size} label={`size: ${size}`}>
                <Button size={size}>主按钮</Button>
                <Button size={size} icon="Plus">
                  带图标
                </Button>
                <Button variant="secondary" size={size}>
                  辅助按钮
                </Button>
                <Button variant="text" size={size}>
                  文字按钮
                </Button>
              </Row>
            ))}
            <Row label="IconButton size">
              {buttonSizes.map((size) => (
                <IconButton
                  key={size}
                  name="Plus"
                  size={size}
                  variant="secondary"
                  aria-label={`新增 ${size}`}
                />
              ))}
            </Row>
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
          name="InputField"
          title="输入框"
          description="InputField 是输入框基础控件，SearchInput 和 CounterInput 是基于它的场景预设。当前定义 40、36、32 三档尺寸，支持 prefix、suffix、清空和报错组合。"
        >
          <div className="grid gap-1">
            <Row label="InputField / 40">
              <InputField className="w-60" placeholder="请输入内容" aria-label="40 输入框" />
              <InputField className="w-60" prefixIcon="Search" placeholder="搜索" aria-label="40 搜索" />
            </Row>
            <Row label="InputField / 36">
              <InputField
                size="lg"
                className="w-60"
                placeholder="请输入内容"
                aria-label="36 输入框"
              />
              <InputField
                size="lg"
                className="w-60"
                prefixIcon="Search"
                placeholder="搜索"
                aria-label="36 搜索"
              />
            </Row>
            <Row label="InputField / 32">
              <InputField
                size="md"
                className="w-60"
                placeholder="请输入内容"
                aria-label="32 输入框"
              />
              <InputField
                size="md"
                className="w-60"
                prefixIcon="Search"
                placeholder="搜索"
                aria-label="32 搜索"
              />
            </Row>
            <Row label="InputField / suffix">
              <InputField
                className="w-60"
                defaultValue="已输入内容"
                placeholder="请输入内容"
                clearable
                aria-label="可清空输入框"
              />
              <InputField
                size="lg"
                className="w-60"
                placeholder="请输入数量"
                suffixText="个"
                aria-label="带右侧文字输入框"
              />
              <InputField
                size="md"
                className="w-60"
                defaultValue="验证中"
                placeholder="请输入验证码"
                suffix={<span className="shrink-0 text-sm leading-5 text-text-secondary">发送验证码</span>}
                aria-label="带右侧操作输入框"
              />
            </Row>
            <Row label="SearchInput">
              <SearchInput className="w-60" placeholder="搜索" aria-label="搜索" />
              <SearchInput
                size="lg"
                className="w-60"
                defaultValue="搜索内容"
                placeholder="搜索"
                aria-label="搜索内容"
              />
            </Row>
            <Row label="CounterInput">
              <CounterInput
                className="w-60"
                placeholder="请输入昵称"
                maxLength={15}
                aria-label="计数输入框"
              />
              <CounterInput
                size="lg"
                className="w-60"
                defaultValue="Hello"
                prefixIcon="UserPen"
                maxLength={15}
                clearable
                aria-label="带图标计数和清空输入框"
              />
            </Row>
            <Row label="state / error">
              <InputField
                className="w-60"
                defaultValue="错误内容"
                placeholder="请输入内容"
                clearable
                error
                aria-label="错误可清空输入框"
              />
              <CounterInput
                size="lg"
                className="w-60"
                defaultValue="超出限制"
                maxLength={15}
                clearable
                error
                aria-label="错误计数输入框"
              />
              <SearchInput
                size="lg"
                className="w-60"
                defaultValue="搜索错误"
                placeholder="搜索"
                error
                aria-label="错误搜索框"
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

        <Section
          index="10"
          name="Popover"
          title="浮窗"
          description="Popover 普通类型分为 menu、options、panel：menu 默认 sm / 图标+文字，options 默认 sm / 文字+勾选，panel 默认 md / 搜索+分页标题+图标或封面+文字。日期选择和消息通知属于独立业务型浮窗，单独封装和展示。"
        >
          <div className="flex flex-wrap items-start gap-10">
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text-primary">PopoverMenu / sm</div>
              <PopoverMenu position="static" width="sm" shadow="strong" role="menu" aria-label="操作浮窗示例">
                <PopoverSection>
                  <PopoverItem icon="SquarePen" role="menuitem">重命名</PopoverItem>
                </PopoverSection>
                <PopoverDivider />
                <PopoverSection>
                  <PopoverItem icon="Trash" role="menuitem">删除</PopoverItem>
                </PopoverSection>
              </PopoverMenu>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text-primary">PopoverOptions / sm</div>
              <PopoverOptions position="static" width="sm" role="listbox" aria-label="选择浮窗示例">
                <PopoverSection>
                  <PopoverItem
                    selected={selectedPopoverOption === '选项一'}
                    role="option"
                    onClick={() => setSelectedPopoverOption('选项一')}
                  >
                    选项一
                  </PopoverItem>
                </PopoverSection>
                <PopoverSection>
                  <PopoverItem
                    selected={selectedPopoverOption === '选项二'}
                    role="option"
                    onClick={() => setSelectedPopoverOption('选项二')}
                  >
                    选项二
                  </PopoverItem>
                </PopoverSection>
                <PopoverSection>
                  <PopoverItem
                    selected={selectedPopoverOption === '选项三'}
                    role="option"
                    onClick={() => setSelectedPopoverOption('选项三')}
                  >
                    选项三
                  </PopoverItem>
                </PopoverSection>
              </PopoverOptions>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text-primary">PopoverPanel / md</div>
              <PopoverPanel
                ref={popoverPanelPreviewRef}
                position="static"
                width="md"
                role="listbox"
                aria-label="封面选择浮窗示例"
                style={
                  hasPopoverSearchValue &&
                  !hasPopoverPanelResults &&
                  popoverPanelEmptyHeight !== null
                    ? { height: popoverPanelEmptyHeight }
                    : undefined
                }
              >
                <PopoverSection>
                  <PopoverSearch
                    value={popoverSearchValue}
                    placeholder="搜索"
                    aria-label="搜索"
                    onValueChange={setPopoverSearchValue}
                  />
                </PopoverSection>
                <PopoverDivider />
                {hasPopoverSearchValue && !hasPopoverPanelResults && (
                  <PopoverSection>
                    <PopoverEmpty>无搜索结果</PopoverEmpty>
                  </PopoverSection>
                )}
                {firstPopoverPanelOptions.length > 0 && (
                  <PopoverHeader>分页标题</PopoverHeader>
                )}
                {firstPopoverPanelOptions.map((option) => (
                  <div key={option.label}>
                    <PopoverSection>
                      <PopoverItem
                        selected={selectedPopoverPanelOption === option.label}
                        role="option"
                        onClick={() => setSelectedPopoverPanelOption(option.label)}
                        startAdornment={
                          <span className="mr-2 h-4 w-4 shrink-0 overflow-hidden rounded-icon">
                            <img
                              className="h-full w-full object-cover"
                              src={option.src}
                              alt=""
                            />
                          </span>
                        }
                      >
                        {option.label}
                      </PopoverItem>
                    </PopoverSection>
                  </div>
                ))}
                {secondPopoverPanelOptions.length > 0 && (
                  <PopoverHeader>分页标题</PopoverHeader>
                )}
                {secondPopoverPanelOptions.map((option) => (
                  <div key={option.label}>
                    <PopoverSection>
                      <PopoverItem
                        selected={selectedPopoverPanelOption === option.label}
                        role="option"
                        onClick={() => setSelectedPopoverPanelOption(option.label)}
                        startAdornment={
                          <span className="mr-2 h-4 w-4 shrink-0 overflow-hidden rounded-icon">
                            <img
                              className="h-full w-full object-cover"
                              src={option.src}
                              alt=""
                            />
                          </span>
                        }
                      >
                        {option.label}
                      </PopoverItem>
                    </PopoverSection>
                  </div>
                ))}
              </PopoverPanel>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text-primary">DatePickerPopover / independent</div>
              <DatePickerPopoverPreview
                selectedDay={selectedDatePreviewDay}
                visibleMonth={visibleDatePreviewMonth}
                onSelectedDayChange={setSelectedDatePreviewDay}
                onVisibleMonthChange={setVisibleDatePreviewMonth}
              />
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text-primary">NotificationPopover / independent</div>
              <NotificationPopoverPreview
                activeTab={activeNotificationPreviewTab}
                onActiveTabChange={setActiveNotificationPreviewTab}
              />
            </div>
          </div>
        </Section>

        <Section
          index="11"
          name="Tooltip"
          title="提示气泡"
          description="Tooltip 用于 icon 或短文本的 hover / focus 辅助说明。气泡最大宽度 320px，最大高度 172px，不含箭头；内容超出时在气泡内部滚动。"
        >
          <div className="flex flex-wrap items-start gap-10">
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text-primary">Regular size</div>
              <div className="flex items-center gap-3">
                <Tooltip content="按自然日汇总的消费、原价与折扣">
                  <Icon name="Info" size="2xs" />
                </Tooltip>
                <span className="text-sm leading-5 text-text-secondary">
                  Hover / focus icon
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text-primary">Max width / height</div>
              <div className="flex items-center gap-3">
                <Tooltip content="Tooltip 气泡最大宽度为 320px，最大高度为 172px，箭头尺寸为 12px × 8px。内容超过最大高度时，气泡内部滚动，箭头不计入最大高度。这里展示的是最大尺寸和内部滚动效果，用于检查边框、投影、圆角、文字行高、内部上下 6px 左右 12px 间距，以及长内容在固定高度内滚动时的视觉表现。当说明文字继续增加时，内容不会撑开气泡，而是在气泡内部滚动，保证浮层不会占用过多屏幕空间。这段补充文本用于填满高度，方便观察最大高度限制和内部滚动区域。继续补充一些说明内容，让文本高度超过 172px 后可以在 Tooltip 内部滚动。滚动区域只存在于气泡本体，不包含下方箭头。">
                  <Icon name="Info" size="2xs" />
                </Tooltip>
                <span className="text-sm leading-5 text-text-secondary">
                  Hover / focus icon
                </span>
              </div>
            </div>
          </div>
        </Section>

        <Section
          index="12"
          name="Modal"
          title="模态弹窗"
          description="Modal 按尺寸档沉淀模式控件：360 InfoModal、480 ConfirmModal / FormModal、640 FeatureModal、720 ContentModal、960 WorkflowModal。最大高度按窗口上下各 40px 安全间距限制；默认只滚动 Body，固定外壳分栏可用 bodyScroll='none' 后由内部面板滚动。"
        >
          <div className="grid gap-1">
            <Row label="360 / InfoModal">
              <Button
                variant="secondary"
                onClick={() => setActiveModalPreview('info')}
              >
                打开信息弹窗
              </Button>
            </Row>
            <Row label="480 / ConfirmModal">
              <Button
                variant="secondary"
                onClick={() => setActiveModalPreview('confirm')}
              >
                打开确认弹窗
              </Button>
            </Row>
            <Row label="480 / FormModal">
              <Button
                variant="secondary"
                onClick={() => setActiveModalPreview('form')}
              >
                打开表单弹窗
              </Button>
            </Row>
            <Row label="640 / FeatureModal">
              <Button
                variant="secondary"
                onClick={() => setActiveModalPreview('feature')}
              >
                打开功能弹窗
              </Button>
            </Row>
            <Row label="720 / ContentModal">
              <Button
                variant="secondary"
                onClick={() => setActiveModalPreview('content')}
              >
                打开内容弹窗
              </Button>
            </Row>
            <Row label="960 / WorkflowModal">
              <Button
                variant="secondary"
                onClick={() => setActiveModalPreview('workflow')}
              >
                打开流程弹窗
              </Button>
            </Row>
            <Row label="Max height">
              <p className="text-sm leading-5 text-text-secondary">
                `calc(100vh - 80px)`，上下最小间距 40px，超出内容在 Body 内部滚动。
              </p>
            </Row>
            <Row label="Fixed shell">
              <p className="text-sm leading-5 text-text-secondary">
                分栏、支付、配置向导使用 `bodyScroll="none"`，关闭按钮、底图、侧栏底色固定，滚动层放在具体内容面板内部。
              </p>
            </Row>
          </div>
        </Section>
      </div>

      {activeModalPreview === 'info' && (
        <InfoModal
          title="小型信息"
          description="这里可以放二维码、图标、图片或状态说明。"
          media={
            <div className="flex h-28 w-28 items-center justify-center rounded-pill bg-bg-soft text-text-primary">
              <Icon name="Info" size="2xl" />
            </div>
          }
          onClose={() => setActiveModalPreview(null)}
        />
      )}

      {activeModalPreview === 'confirm' && (
        <ConfirmModal
          title="确认执行操作？"
          description="确认弹窗用于普通确认、危险操作、删除和状态变更。"
          confirmText="确认"
          onClose={() => setActiveModalPreview(null)}
          onConfirm={() => undefined}
        />
      )}

      {activeModalPreview === 'form' && (
        <FormModal
          title="编辑名称"
          confirmDisabled={!modalFormName.trim()}
          onClose={() => setActiveModalPreview(null)}
          onConfirm={() => modalFormName.trim().length > 0}
        >
          <InputField
            className="w-full"
            value={modalFormName}
            placeholder="请输入名称"
            aria-label="请输入名称"
            onValueChange={setModalFormName}
          />
        </FormModal>
      )}

      {activeModalPreview === 'feature' && (
        <FeatureModal
          title="中型功能面板"
          footer={({ close }) => (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={close}>
                取消
              </Button>
              <Button onClick={close}>完成</Button>
            </div>
          )}
          onClose={() => setActiveModalPreview(null)}
        >
          <div className="grid gap-3 text-sm leading-5 text-text-secondary">
            <p>FeatureModal 用于登录、授权、绑定、多字段配置等中型功能页。</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-button bg-bg-soft p-4">表单区域</div>
              <div className="rounded-button bg-bg-soft p-4">辅助区域</div>
            </div>
          </div>
        </FeatureModal>
      )}

      {activeModalPreview === 'content' && (
        <ContentModal
          title="内容阅读"
          panelClassName="h-[640px]"
          bodyClassName="overflow-y-auto"
          onClose={() => setActiveModalPreview(null)}
        >
          <div className="grid gap-4 whitespace-pre-wrap text-sm leading-5 text-text-primary">
            <p>ContentModal 用于协议、说明、文档、多 Tab 内容等长内容场景。</p>
            <p>
              内容区域应独立滚动，标题栏保持稳定。这里展示的是结构预览，业务页面可以在标题区放置 Tab 或其他内容导航。
            </p>
            <p>
              当内容很长时，不要让整个页面滚动；只滚动弹窗 Body 内容区，避免关闭按钮和操作区域离开视野。Modal 容器最大高度统一保留窗口上下各 40px。
            </p>
          </div>
        </ContentModal>
      )}

      {activeModalPreview === 'workflow' && (
        <WorkflowModal
          title="复杂流程"
          panelClassName="h-[560px]"
          bodyPadding={false}
          bodyScroll="none"
          onClose={() => setActiveModalPreview(null)}
        >
          <div className="flex h-full min-h-0 overflow-hidden">
            <div className="relative h-full min-w-0 flex-1 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-bg-soft" />
              <div className="relative h-full overflow-y-auto p-8">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 12 }, (_, index) => (
                    <div
                      key={index + 1}
                      className="rounded-button bg-bg-soft p-4 text-sm leading-5 text-text-secondary"
                    >
                      流程选项 {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <aside className="h-full w-[280px] shrink-0 overflow-hidden bg-bg-soft">
              <div className="h-full overflow-y-auto px-8 py-8">
                <div className="flex min-h-full flex-col justify-center gap-3 text-sm leading-5 text-text-secondary">
                  <p className="text-text-primary">固定侧栏</p>
                  <p>侧栏底色不滚动，只滚动内部摘要、支付、步骤状态或结果预览。</p>
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index + 1} className="rounded-button bg-bg-white p-3">
                      摘要 {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </WorkflowModal>
      )}
    </main>
  );
}
