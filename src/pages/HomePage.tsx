import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent, MouseEvent, ReactNode, Ref, RefObject } from 'react';
import {
  defaultProfileNickname,
  getCurrentMockUser,
  loginMockUser,
  logoutMockUser,
  mockUserChangedEventName,
  resetMockAiWorkstationConnectionStatus,
  updateMockAiWorkstationConnectionStatus,
  updateMockUserProfile,
  type MockAiWorkstationConnectionStatus,
  type MockUser,
} from '../api/mockUserApi';
import {
  getMockMessageUnreadCounts,
  getMockMessages,
  getUnreadMockMessageIds,
  markAllMockMessagesRead,
  markMockMessageRead,
  mockMessagesChangedEventName,
  pushMockMessage,
  resetMockMessages,
  type MockMessage,
  type MockMessageByMode,
  type MockMessageMode,
} from '../api/mock/mockMessageApi';
import {
  getMockProjects,
  mockProjectsChangedEventName,
  resetMockProjects,
  saveCurrentMockProjects,
  type MockProject,
  type MockProjectFile,
  type MockProjectItem,
} from '../api/mock/mockProjectApi';
import {
  addMockExtraAccountData,
  getMockAccountData,
  mockAccountChangedEventName,
  resetMockExtraAccountData,
  resetMockAccountData,
  updateMockAccountAvatar,
  updateMockAccountName,
  type MockAccount,
  type MockAccountData,
  type MockAccountStat,
  type MockBillingDetail,
  type MockProductBillingDetail,
  type MockRequestBillingDetail,
} from '../api/mock/mockAccountApi';
import {
  addMockAgentComment,
  addMockAgentReply,
  getMockAgentDetailData,
  resetMockAgentAccountState,
  toggleMockAgentCommentLike,
  toggleMockAgentReaction,
  type MockAgentAuthorInput,
  type MockAgentCommentItem,
  type MockAgentStatName,
} from '../api/mock/mockAgentApi';
import {
  Button,
  IconButton,
  ModalCloseButton,
  ToolbarIconButton,
} from '../components/ui/Button';
import { Icon, SortChevronsIcon } from '../components/ui/Icon';
import { CounterInput, InputField } from '../components/ui/Input';
import {
  ConfirmModal,
  FormModal,
  InfoModal,
  Modal,
  WorkflowModal,
} from '../components/ui/Modal';
import { NotificationPopover } from '../components/ui/NotificationPopover';
import {
  Popover,
  PopoverMenu,
  PopoverDivider,
  PopoverItem,
  PopoverPanel,
  PopoverSection,
  PopoverOptions,
  type PopoverOptionsWidth,
} from '../components/ui/Popover';
import { SearchInput } from '../components/ui/SearchInput';
import { TabBar } from '../components/ui/TabBar';
import { Tooltip } from '../components/ui/Tooltip';
import { LoginModal } from './LoginPage';

const navGroups = [
  [
    { icon: 'Home', label: '首页', page: 'home' },
    { icon: 'LampDesk', label: '工作台' },
    { icon: 'LibraryBig', label: '项目中心', page: 'projects' },
    { icon: 'HousePlug', label: '账户总览', page: 'account' },
  ],
  [
    { icon: 'SquareDashedBottomCode', label: 'API' },
    { icon: 'Bell', label: '消息', page: 'messages', badge: 3 },
  ],
] as const;

const tabs = [
  '全部',
  'GEO营销',
  '内容创作',
  '销售获客',
  '办公协同',
  '品牌增长',
  '数据分析',
  '技术工程',
];

const workflowTabs = [
  '全部',
  '内容创作',
  '数据处理',
  '办公自动化',
  '营销创作',
  '设计创意',
  '开发工具',
  '生活服务',
];

const projectTabs = ['创建时间', '修改时间', '名称'];
const projectDetailModeTabs = ['任务', '文件', '成员'] as const;
const projectDetailTabs = ['全部任务', '运行中', '已完成'];
const projectDetailStatusFilterOptions = [
  '全部状态',
  '待填写',
  '排队中',
  '执行中',
  '待确认',
  '已完成失败',
  '已取消',
  '草稿',
] as const;
const projectFileTypeFilterOptions = [
  '全部',
  '文件夹',
  '压缩包',
  '文档',
  '表格',
  '幻灯片',
  'PDF',
  '图片',
  '视频',
  '音频',
  '链接',
  'Markdown',
  '其他',
] as const;
const billingTabs = ['日账单', '产品账单', '请求明细'];
const billingTabTooltips: Record<string, string> = {
  日账单: '按自然日汇总的消费、原价与折扣',
  产品账单: '按模型/产品类型汇总的消费金额',
  请求明细: '每次API请求的用量与扣费明细',
};
const aiWorkstationConnectionStatusLabels: Record<
  MockAiWorkstationConnectionStatus,
  string
> = {
  'not-installed': '未安装',
  'not-connected': '未连接',
  connected: '已连接',
};
const aiWorkstationConnectionStatusOptions = [
  'not-installed',
  'not-connected',
  'connected',
] as const satisfies readonly MockAiWorkstationConnectionStatus[];
const messageTabs = ['全部', '未读', '已读'];

const messageModeTabs = [
  { value: 'announcements', label: '公告' },
  { value: 'activity', label: '动态' },
] as const;

function blurActiveInputControl() {
  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement)) {
    return;
  }

  if (
    activeElement.matches('input, textarea, select, [contenteditable="true"]')
  ) {
    activeElement.blur();
  }
}

const profilePresetAvatarSrcs = [
  '/assets/avatars/avatar-male-1.png',
  '/assets/avatars/avatar-female-1.png',
  '/assets/avatars/avatar-male-2.png',
  '/assets/avatars/avatar-female-2.png',
  '/assets/avatars/avatar-male-3.png',
  '/assets/avatars/avatar-female-3.png',
  '/assets/avatars/avatar-male-4.png',
  '/assets/avatars/avatar-female-4.png',
] as const satisfies readonly string[];

const enterpriseAvatarPresetPrefix = 'enterprise-avatar:';
const enterpriseAvatarPresets = [
  {
    value: `${enterpriseAvatarPresetPrefix}black`,
    previewClassName: 'bg-bg-black text-text-inverse',
  },
  {
    value: `${enterpriseAvatarPresetPrefix}red`,
    previewClassName: 'bg-accent-red text-text-inverse',
  },
  {
    value: `${enterpriseAvatarPresetPrefix}orange`,
    previewClassName: 'bg-accent-orange text-text-inverse',
  },
  {
    value: `${enterpriseAvatarPresetPrefix}green`,
    previewClassName: 'bg-accent-green text-text-inverse',
  },
  {
    value: `${enterpriseAvatarPresetPrefix}blue`,
    previewClassName: 'bg-accent-blue text-text-inverse',
  },
  {
    value: `${enterpriseAvatarPresetPrefix}indigo`,
    previewClassName: 'bg-accent-indigo text-text-inverse',
  },
  {
    value: `${enterpriseAvatarPresetPrefix}violet`,
    previewClassName: 'bg-accent-violet text-text-inverse',
  },
  {
    value: `${enterpriseAvatarPresetPrefix}magenta`,
    previewClassName: 'bg-accent-magenta text-text-inverse',
  },
] as const;

const accountKeyOptions = ['全部APIKey', 'Hermes Desktop'] as const;
const sortFilterOptions = ['最热', '最新', '查看最多', '使用最多'] as const;
const projectSortFilterOptions = ['最新更新', '最早创建'] as const;
const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
}

function addMonths(date: Date, offset: number) {
  const nextDate = new Date(date);
  const targetDay = nextDate.getDate();

  nextDate.setDate(1);
  nextDate.setMonth(nextDate.getMonth() + offset);

  const lastDay = new Date(
    nextDate.getFullYear(),
    nextDate.getMonth() + 1,
    0,
  ).getDate();
  nextDate.setDate(Math.min(targetDay, lastDay));

  return nextDate;
}

function createDefaultDateRange() {
  const endDate = new Date();
  const startDate = addMonths(endDate, -1);

  return {
    startDate: formatDateValue(startDate),
    endDate: formatDateValue(endDate),
  };
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split('/').map(Number);

  return new Date(year, month - 1, day);
}

const heroBanners = [
  '/assets/home/banner-main.png',
  '/assets/home/banner-carousel-2.jpg',
  '/assets/home/banner-carousel-3.jpg',
];

const cards = [
  {
    id: 'hz-canvas',
    title: 'Hz Canvas无限画布',
    detailSubtitle: '图像与音视频',
    description:
      'Hz Canvas 是一个把无限画布、素材标注和 AI 视频生成整合在一起的本地图片视频创作工具。',
    image: '/assets/home/agents/card-1.png',
  },
  {
    id: 'moneyprinterturbo-local-hermes',
    title: '快速混剪视频工具',
    detailSubtitle: '图像与音视频',
    description: '把一段想法、一篇文案或几段本地视频素材，快速制作成可发布的短视频。',
    image: '/assets/home/agents/card-2.png',
  },
  {
    id: 'geo-ops-workbench',
    title: 'GEO助手',
    detailSubtitle: '文本创作',
    description: '一款帮助品牌生成关键词、检测 AI 可见度并创作 GEO 文章的智能运营工具。',
    image: '/assets/home/agents/card-3.png',
  },
  {
    id: 'hellome-jiuji-wenshu',
    title: '救急文书工坊',
    detailSubtitle: '文本创作',
    description:
      '基于 AI 大模型的智能文书工具，支持一键生成请示、报告、通知、总结等常用文书，帮助你快速完成规范、清晰的文案撰写。',
    image: '/assets/home/agents/card-4.png',
  },
  {
    id: 'world-monitor-workspace',
    title: '全球新闻实时雷达',
    detailSubtitle: '效率工具',
    description: '实时汇聚全球新闻、官方信息源、市场行情和地图态势，帮助你快速掌握正在发生的重要事件。',
    image: '/assets/home/agents/card-5.png',
  },
  {
    id: 'linggan-xiezuotai',
    title: '小说灵感写作台',
    detailSubtitle: '文本创作',
    description: '让每个人都能轻松记录想法、完善文字，写出自己的好文章。',
    image: '/assets/home/agents/card-6.png',
  },
  {
    id: 'careerkit-workspace',
    title: '求职小助手',
    detailSubtitle: '办公协同',
    description:
      '一款 AI 求职工作台，支持简历优化、JD 匹配、模拟面试和投递跟进，帮助你更高效地拿到心仪 Offer。',
    image: '/assets/home/agents/card-7.png',
  },
  {
    id: 'wechat-article-agent-local-hermes',
    title: '公众号文章一键排版',
    detailSubtitle: '文本创作',
    description:
      '输入一个主题，它会自动抓取相关资讯，生成文章、配图和排版内容，并可将成品保存到公众号草稿箱，减少查资料、写文章和排版的时间。',
    image: '/assets/home/agents/card-8.png',
  },
  {
    id: 'stirling-pdf-lite',
    title: '轻量PDF小工具',
    detailSubtitle: '效率工具',
    description: '快速完成 PDF 合并、页面提取与旋转，让文件整理更高效。',
    image: '/assets/home/agents/card-9.png',
  },
  {
    id: 'image-compressor-local',
    title: '图片压缩小工具',
    detailSubtitle: '效率工具',
    description: '一个无需登录的在线图片压缩工具：上传 JPG、PNG 等图片后，可调节质量并保持原格式下载。',
    image: '/assets/home/agents/card-10.png',
  },
  {
    id: 'stock-analysis-hub-local-hermes',
    title: '股票交易分析工具',
    detailSubtitle: '数据分析',
    description: '帮助普通用户查询股票行情、查看技术指标、基本面、资金流向和龙虎榜信息。',
    image: '/assets/home/agents/card-11.png',
  },
  {
    id: 'acui-floating-window',
    title: 'ACUI桌面悬浮窗',
    description:
      '轻量级桌面展示技能，把客户的产品、数据或品牌内容悬浮在用户桌面右下角。',
    image: '/assets/home/card-acui.png',
  },
  {
    id: 'airtable-data-manager',
    title: 'Airtable数据管理',
    description: '用 RESTAPI 操作 Airtable: 增删改查、筛选、更新插入。',
    image: '/assets/home/card-airtable.png',
  },
  {
    id: 'apple-notes-manager',
    title: 'Apple备忘录',
    description: '用 memoCLI 管理 Apple 备忘录:创建、搜索、编辑。',
    image: '/assets/home/card-apple-notes.png',
  },
  {
    id: 'apple-reminders-manager',
    title: 'Apple提醒事项',
    description: '用 remindctl 管理提醒事项:添加、列出、完成。',
    image: '/assets/home/card-reminders.png',
  },
  {
    id: 'architecture-diagram-generator',
    title: '架构图生成',
    description: '生成深色 SVG 架构/云/基础设施图 (HTML)0',
    image: '/assets/home/card-architecture.png',
  },
  {
    id: 'arxiv-paper-search',
    title: 'arXiv 论文检索',
    description: '按关键词/作者/分类/ ID 检索 arXiv 论文。',
    image: '/assets/home/card-arxiv.png',
  },
  {
    id: 'ascii-art-generator',
    title: '字符画生成',
    description: '字符画: pyfiglet、cowsay、boxes、图片转字符。',
    image: '/assets/home/card-ascii.png',
  },
  {
    id: 'ascii-video-generator',
    title: '字符视频生成',
    description: '字符视频:视频/音频转彩色字符 MP4/GIF。',
    image: '/assets/home/card-video.png',
  },
  {
    id: 'audiocraft-audio-generator',
    title: 'AudioCraft音频生成',
    description: 'AudioCraft:MusicGen 文生音乐、AudioGen 文生音效。',
    image: '/assets/home/card-audiocraft.png',
  },
];

type AgentCardData = (typeof cards)[number];

const hellomeOfficialAvatar = '/assets/agents/hellome-official-avatar.png';

const agentCardAuthorsById: Record<string, { name: string; avatar: string }> = {
  'hz-canvas': { name: 'HelloMe官方', avatar: hellomeOfficialAvatar },
  'moneyprinterturbo-local-hermes': { name: 'HelloMe官方', avatar: hellomeOfficialAvatar },
  'geo-ops-workbench': { name: 'Oliver', avatar: '/assets/home/workflows/avatar-1.png' },
  'hellome-jiuji-wenshu': { name: 'Sophia', avatar: '/assets/home/workflows/avatar-2.png' },
  'world-monitor-workspace': { name: 'Lucas', avatar: '/assets/home/workflows/avatar-3.png' },
  'linggan-xiezuotai': { name: 'Emma', avatar: '/assets/home/workflows/avatar-4.png' },
  'careerkit-workspace': { name: 'Ethan', avatar: '/assets/home/workflows/avatar-5.png' },
  'wechat-article-agent-local-hermes': { name: 'Mia', avatar: '/assets/home/workflows/avatar-6.png' },
  'stirling-pdf-lite': { name: 'Noah', avatar: '/assets/home/workflows/avatar-7.png' },
  'image-compressor-local': { name: 'Ava', avatar: '/assets/home/workflows/avatar-8.png' },
  'stock-analysis-hub-local-hermes': { name: 'Liam', avatar: '/assets/avatars/avatar-male-1.png' },
  'acui-floating-window': { name: 'Garcia', avatar: '/assets/avatars/avatar-female-1.png' },
  'airtable-data-manager': { name: 'Jenny Wilson', avatar: '/assets/avatars/avatar-female-2.png' },
  'apple-notes-manager': { name: 'Albert Flores', avatar: '/assets/avatars/avatar-male-2.png' },
  'apple-reminders-manager': { name: 'Kristin', avatar: '/assets/avatars/avatar-female-3.png' },
  'architecture-diagram-generator': { name: 'Brooklyn', avatar: '/assets/avatars/avatar-male-3.png' },
  'arxiv-paper-search': { name: 'Annette', avatar: '/assets/avatars/avatar-female-4.png' },
  'ascii-art-generator': { name: 'Wade', avatar: '/assets/avatars/avatar-male-4.png' },
  'ascii-video-generator': { name: 'Cameron', avatar: '/assets/agents/canvas-comment-avatar-2.png' },
  'audiocraft-audio-generator': { name: 'Leslie', avatar: '/assets/agents/canvas-comment-avatar-3.png' },
};

const workflowCards = [
  {
    title: '一键生成线条艺术风格的PPT',
    author: 'Garcia',
    date: '2026.2.26',
    frequency: 26,
    cover: '/assets/home/workflows/cover-1.png',
    avatar: '/assets/home/workflows/avatar-1.png',
  },
  {
    title: '社交媒体AI工具包生成器',
    author: 'Jackie',
    date: '2026.2.26',
    frequency: 26,
    cover: '/assets/home/workflows/cover-2.png',
    avatar: '/assets/home/workflows/avatar-2.png',
  },
  {
    title: '病毒式解构角色艺术新闻',
    author: 'Marvin McKinney',
    date: '2026.2.26',
    frequency: 23,
    cover: '/assets/home/workflows/cover-3.png',
    avatar: '/assets/home/workflows/avatar-3.png',
  },
  {
    title: '产品场景多角度图像生成器',
    author: 'Devon Lane',
    date: '2026.2.26',
    frequency: 32,
    cover: '/assets/home/workflows/cover-4.png',
    avatar: '/assets/home/workflows/avatar-4.png',
  },
  {
    title: '基准脚本分析和数字头像视频生成',
    author: '李光盛',
    date: '2026.2.26',
    frequency: 24,
    cover: '/assets/home/workflows/cover-5.png',
    avatar: '/assets/home/workflows/avatar-5.png',
  },
  {
    title: '产品场景营销视频生成器',
    author: '宋力春',
    date: '2026.2.26',
    frequency: 18,
    cover: '/assets/home/workflows/cover-6.png',
    avatar: '/assets/home/workflows/avatar-6.png',
  },
  {
    title: '短剧工厂',
    author: '孔俊',
    date: '2026.2.26',
    frequency: 22,
    cover: '/assets/home/workflows/cover-7.png',
    avatar: '/assets/home/workflows/avatar-7.png',
  },
  {
    title: '产品场景生成器',
    author: 'Jenny Wilson',
    date: '2026.2.26',
    frequency: 24,
    cover: '/assets/home/workflows/cover-8.png',
    avatar: '/assets/home/workflows/avatar-8.png',
  },
];

const previewCards = cards.slice(0, 20);
const previewWorkflowCards = [
  ...workflowCards,
  ...workflowCards,
  ...workflowCards,
];

const projectFileIconBasePath = '/assets/project-files';

const seededProjectFiles: MockProjectFile[] = [
  {
    name: '项目文件夹',
    type: '文件夹',
    date: '2026/07/28',
    size: '24.80 GB',
    icon: `${projectFileIconBasePath}/folder.svg`,
  },
  {
    name: '文件夹压缩包.zip',
    type: '压缩包',
    date: '2026/07/18',
    size: '8.42 GB',
    icon: `${projectFileIconBasePath}/zip.svg`,
  },
  {
    name: '产品文档.word',
    type: '文档',
    date: '2026/06/30',
    size: '36.20 MB',
    icon: `${projectFileIconBasePath}/word.svg`,
  },
  {
    name: '财务报表.xlsx',
    type: '表格',
    date: '2026/06/12',
    size: '18.74 MB',
    icon: `${projectFileIconBasePath}/xlsx.svg`,
  },
  {
    name: '公司简介.ppt',
    type: '幻灯片',
    date: '2026/05/26',
    size: '128.60 MB',
    icon: `${projectFileIconBasePath}/ppt.svg`,
  },
  {
    name: '产品文档.pdf',
    type: 'PDF',
    date: '2026/05/08',
    size: '9.86 MB',
    icon: `${projectFileIconBasePath}/pdf.svg`,
  },
  {
    name: '小狗图片.png',
    type: '图片',
    date: '2026/04/22',
    size: '2.48 MB',
    icon: `${projectFileIconBasePath}/pic.svg`,
  },
  {
    name: '宣传视频.mp4',
    type: '视频',
    date: '2026/04/03',
    size: '1.36 GB',
    icon: `${projectFileIconBasePath}/video.svg`,
  },
  {
    name: '口播配音.mp3',
    type: '音频',
    date: '2026/03/19',
    size: '48.32 MB',
    icon: `${projectFileIconBasePath}/audio.svg`,
  },
  {
    name: '公司门户网站.html',
    type: '链接',
    date: '2026/03/01',
    size: '856 KB',
    icon: `${projectFileIconBasePath}/link.svg`,
  },
  {
    name: '设计规范.md',
    type: 'Markdown',
    date: '2026/02/14',
    size: '324 KB',
    icon: `${projectFileIconBasePath}/md.svg`,
  },
  {
    name: '不知名文件.js',
    type: '其他',
    date: '2026/01/28',
    size: '72 KB',
    icon: `${projectFileIconBasePath}/noname.svg`,
  },
];

const projects: MockProject[] = [
  {
    id: 'classic-video',
    title: '经典版视频管家项目',
    count: 4,
    createdAt: '7月20日创建',
    files: seededProjectFiles,
    items: [
      {
        title: '测评讲解视频',
        project: '经典版视频管家项目',
        time: '刚刚',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/avatar-1.png',
        status: '在线',
      },
      {
        title: '小红书投流视频',
        project: '经典版视频管家项目',
        time: '1小时前',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-3.png',
      },
      {
        title: 'OOTD穿搭视频',
        project: '经典版视频管家项目',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-5.png',
      },
      {
        title: '内容素材整理',
        project: '经典版视频管家项目',
        time: '7月18日',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-6.png',
      },
    ],
  },
  {
    id: 'speed-optimizer',
    title: '计算机速度优化智能体',
    count: 1,
    createdAt: '7月9日创建',
    files: seededProjectFiles.slice(0, 4),
    items: [
      {
        title: '测评讲解视频',
        project: '计算机速度优化智能体',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/avatar-2.png',
      },
    ],
  },
  {
    id: 'new-project-01',
    title: '新项目01',
    count: 4,
    createdAt: '7月18日创建',
    files: seededProjectFiles.slice(2, 8),
    items: [
      {
        title: '测评讲解视频',
        project: '新项目01',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-8.png',
      },
      {
        title: '小红书投流视频',
        project: '新项目01',
        time: '7月8日',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-2.png',
      },
      {
        title: 'OOTD穿搭视频',
        project: '新项目01',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-4.png',
      },
      {
        title: '内容素材整理',
        project: '新项目01',
        time: '7月7日',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-6.png',
      },
    ],
  },
  {
    id: 'new-project-02',
    title: '新项目02',
    count: 3,
    createdAt: '7月9日创建',
    files: seededProjectFiles.slice(4, 10),
    items: [
      {
        title: '测评讲解视频',
        project: '新项目02',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/avatar-3.png',
      },
      {
        title: '小红书投流视频',
        project: '新项目02',
        time: '1小时前',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-7.png',
      },
      {
        title: 'OOTD穿搭视频',
        project: '新项目02',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/avatar-4.png',
      },
    ],
  },
  {
    id: 'new-project-03',
    title: '新项目03',
    count: 2,
    createdAt: '7月02日创建',
    files: seededProjectFiles.slice(6, 12),
    items: [
      {
        title: '小红书投流视频',
        project: '新项目03',
        time: '1小时前',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-3.png',
      },
      {
        title: 'OOTD穿搭视频',
        project: '新项目03',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-5.png',
      },
    ],
  },
  {
    id: 'new-project-04',
    title: '新项目04',
    count: 4,
    createdAt: '7月02日创建',
    files: seededProjectFiles.slice(0, 8),
    items: [
      {
        title: '测评讲解视频',
        project: '新项目04',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-8.png',
      },
      {
        title: '小红书投流视频',
        project: '新项目04',
        time: '1小时前',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-2.png',
      },
      {
        title: 'OOTD穿搭视频',
        project: '新项目04',
        time: '昨天',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-4.png',
      },
      {
        title: '素材混剪视频',
        project: '新项目04',
        time: '7月1日',
        task: '任务 mock-1783329764785',
        image: '/assets/home/workflows/cover-6.png',
      },
    ],
  },
  {
    id: 'new-project-05',
    title: '新项目05',
    count: 0,
    createdAt: '7月02日创建',
    files: [],
    items: [],
  },
];

type Project = MockProject;
type ProjectDetailMode = (typeof projectDetailModeTabs)[number];

function formatProjectCreatedAt(date = new Date()) {
  return `${date.getMonth() + 1}月${date.getDate()}日创建`;
}

const accountStats: MockAccountStat[] = [
  {
    title: '账户总览',
    description: '包含当前所有项目、智能体、工作流消耗明细',
    icon: 'Zap',
    iconClassName: 'bg-accent-red/10 text-accent-red',
    actions: ['去开票', '充值'],
    metrics: [
      ['可用余额', '512'],
      ['赠送额度', '64'],
      ['累计充值', '128'],
      ['累计消费', '256'],
    ],
  },
  {
    title: '云端空间',
    description: '用于图片上传保存、过程文件和结果输出存储',
    icon: 'Cloud',
    iconClassName: 'bg-accent-blue/10 text-accent-blue',
    actions: ['购买空间'],
    metrics: [
      ['总空间', '2 GB'],
      ['已使用', '128 MB'],
      ['剩余空间', '1.92 GB'],
      ['已购买空间', '512 MB'],
    ],
  },
];

const accounts: MockAccount[] = [
  {
    id: 'account-personal-default',
    name: '个人账户',
    type: 'personal',
    status: '正常',
    balance: '512.00',
    apiKeyCount: 2,
    createdAt: '2026/05/26',
  },
  {
    id: 'account-enterprise-owner',
    name: '江苏汇智智能数字科技有限公司',
    type: 'enterprise',
    enterpriseRole: 'owner',
    status: '正常',
    balance: '8,640.00',
    apiKeyCount: 6,
    createdAt: '2026/06/02',
  },
  {
    id: 'account-enterprise-employee',
    name: '南京汇智互娱有限公司',
    type: 'enterprise',
    enterpriseRole: 'employee',
    status: '正常',
    balance: '企业共享',
    apiKeyCount: 1,
    createdAt: '2026/06/12',
  },
];

const billingDetails: MockBillingDetail[] = [
  {
    id: 'bill-50',
    date: '2026/05/26 16:05:02',
    amount: '50.00',
    originalAmount: '50.00',
    discount: '8%',
  },
  {
    id: 'bill-100',
    date: '2026/05/27 09:18:24',
    amount: '100.00',
    originalAmount: '120.00',
    discount: '12%',
  },
  {
    id: 'bill-200',
    date: '2026/05/28 14:32:08',
    amount: '200.00',
    originalAmount: '240.00',
    discount: '15%',
  },
  {
    id: 'bill-1000',
    date: '2026/05/29 18:06:37',
    amount: '1000.00',
    originalAmount: '1200.00',
    discount: '20%',
  },
  {
    id: 'bill-2000',
    date: '2026/05/30 11:45:19',
    amount: '2000.00',
    originalAmount: '2200.00',
    discount: '18%',
  },
  {
    id: 'bill-5000-a',
    date: '2026/06/01 08:21:56',
    amount: '5000.00',
    originalAmount: '5600.00',
    discount: '22%',
  },
  {
    id: 'bill-5000-b',
    date: '2026/06/03 20:10:12',
    amount: '3200.00',
    originalAmount: '4000.00',
    discount: '25%',
  },
  {
    id: 'bill-5000-c',
    date: '2026/06/05 13:52:43',
    amount: '6800.00',
    originalAmount: '8000.00',
    discount: '30%',
  },
  {
    id: 'bill-extra-01',
    date: '2026/06/06 09:16:28',
    amount: '88.00',
    originalAmount: '100.00',
    discount: '12%',
  },
  {
    id: 'bill-extra-02',
    date: '2026/06/07 17:42:05',
    amount: '360.00',
    originalAmount: '400.00',
    discount: '10%',
  },
  {
    id: 'bill-extra-03',
    date: '2026/06/08 12:08:51',
    amount: '720.00',
    originalAmount: '900.00',
    discount: '20%',
  },
  {
    id: 'bill-extra-04',
    date: '2026/06/09 21:35:14',
    amount: '1280.00',
    originalAmount: '1600.00',
    discount: '20%',
  },
  {
    id: 'bill-extra-05',
    date: '2026/06/10 10:24:39',
    amount: '2400.00',
    originalAmount: '3000.00',
    discount: '20%',
  },
  {
    id: 'bill-extra-06',
    date: '2026/06/11 15:57:22',
    amount: '1680.00',
    originalAmount: '2100.00',
    discount: '20%',
  },
  {
    id: 'bill-extra-07',
    date: '2026/06/12 08:49:03',
    amount: '560.00',
    originalAmount: '700.00',
    discount: '20%',
  },
  {
    id: 'bill-extra-08',
    date: '2026/06/13 19:12:46',
    amount: '4200.00',
    originalAmount: '5000.00',
    discount: '16%',
  },
  {
    id: 'bill-extra-09',
    date: '2026/06/14 11:30:18',
    amount: '960.00',
    originalAmount: '1200.00',
    discount: '20%',
  },
  {
    id: 'bill-extra-10',
    date: '2026/06/15 16:44:59',
    amount: '7500.00',
    originalAmount: '9000.00',
    discount: '17%',
  },
];

const productBillingDetails: MockProductBillingDetail[] = [
  {
    id: 'product-kimi',
    model: 'Kimi-K3',
    type: '文本对话',
    amount: '50.00',
    icon: '/assets/account/product-kimi.png',
  },
  {
    id: 'product-doubao-seedance',
    model: 'Doubao-Seedance-2.0',
    type: '图像生成\\视频生成',
    amount: '100.00',
    icon: '/assets/account/product-doubao.png',
  },
  {
    id: 'product-glm',
    model: 'GLM-5.2',
    type: '文本对话',
    amount: '200.00',
    icon: '/assets/account/product-glm.png',
  },
  {
    id: 'product-doubao-mini',
    model: 'Doubao-Seedance-2.0-mini',
    type: '图像生成\\视频生成',
    amount: '1000.00',
    icon: '/assets/account/product-doubao.png',
  },
  {
    id: 'product-minimax',
    model: 'MiniMax-M2.7',
    type: '文本对话',
    amount: '2000.00',
    icon: '/assets/account/product-minimax.png',
  },
  {
    id: 'product-deepseek',
    model: 'deepseek-v4-pro',
    type: '5000.00',
    amount: '5000.00',
    icon: '/assets/account/product-deepseek.png',
  },
  {
    id: 'product-cosyvoice',
    model: 'cosyvoice-v3-flash',
    type: '文本对话\\音频生成',
    amount: '5000.00',
    icon: '/assets/account/product-cosyvoice.png',
  },
  {
    id: 'product-pixverse',
    model: 'Pixverse-V6-transition',
    type: '视频生成',
    amount: '5000.00',
    icon: '/assets/account/product-pixverse.png',
  },
];

const requestBillingDetails: MockRequestBillingDetail[] = [
  {
    id: 'request-kimi',
    model: 'Kimi-K3',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '2560',
    originalAmount: '50.00',
    amount: '50.00',
    icon: '/assets/account/request-kimi.png',
  },
  {
    id: 'request-doubao-seedance',
    model: 'Doubao-Seedance-2.0',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '2560',
    originalAmount: '100.00',
    amount: '100.00',
    icon: '/assets/account/request-doubao.png',
  },
  {
    id: 'request-glm',
    model: 'GLM-5.2',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '2560',
    originalAmount: '200.00',
    amount: '200.00',
    icon: '/assets/account/request-glm.png',
  },
  {
    id: 'request-doubao-mini',
    model: 'Doubao-Seedance-2.0-mini',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '1280',
    originalAmount: '1000.00',
    amount: '1000.00',
    icon: '/assets/account/request-doubao.png',
  },
  {
    id: 'request-minimax',
    model: 'MiniMax-M2.7',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '1280',
    originalAmount: '2000.00',
    amount: '2000.00',
    icon: '/assets/account/request-minimax.png',
  },
  {
    id: 'request-deepseek',
    model: 'deepseek-v4-pro',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '1280',
    originalAmount: '5000.00',
    amount: '5000.00',
    icon: '/assets/account/request-deepseek.png',
  },
  {
    id: 'request-cosyvoice',
    model: 'cosyvoice-v3-flash',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '1280',
    originalAmount: '5000.00',
    amount: '5000.00',
    icon: '/assets/account/request-cosyvoice.png',
  },
  {
    id: 'request-pixverse',
    model: 'Pixverse-V6-transition',
    time: '2026/05/26 16:05:02',
    apiKey: 'sk-huizhi-8BWPNMBhLXJnrbFOhpMT6zNLKYPTagsr',
    tokens: '1280',
    originalAmount: '5000.00',
    amount: '5000.00',
    icon: '/assets/account/request-pixverse.png',
  },
];

const seededAccountData: MockAccountData = {
  accounts,
  stats: accountStats,
  billingDetails,
  productBillingDetails,
  requestBillingDetails,
};

type IconName = Parameters<typeof Icon>[0]['name'];
type ViewMode = 'agents' | 'workflows';
type PageMode = 'home' | 'projects' | 'account' | 'messages';
type MessageMode = MockMessageMode;
type MessageUnreadCounts = Record<MessageMode, number>;
type MessageItem = MockMessage;
type ProjectItem = MockProjectItem;
type ProjectFile = MockProjectFile;
type PolicyTab = 'privacy' | 'agreement';
type AgentActionHoverSuppression = 'collect' | 'like' | 'share' | null;

const emptyMessageUnreadCounts: MessageUnreadCounts = {
  announcements: 0,
  activity: 0,
};
const emptyUnreadMessageIds = new Set<string>();

function getProjectTaskKey(item: ProjectItem) {
  return `${item.project}-${item.title}-${item.time}-${item.task}-${item.image}`;
}

function getProjectFileKey(file: ProjectFile) {
  return `${file.name}-${file.type}-${file.date}-${file.size}`;
}

const profileMenuItems = [
  { icon: 'ArrowRightLeft', label: '切换账号' },
  { icon: 'UserPen', label: '个人资料' },
  { icon: 'Headset', label: '联系客服' },
  { icon: 'ShieldCheck', label: '政策/协议' },
  { icon: 'Info', label: '关于我们' },
  { icon: 'LogOut', label: '退出登录' },
] as const satisfies ReadonlyArray<{ icon: IconName; label: string }>;

const profileSocialItems = [
  { src: '/assets/home/social-wechat.svg', label: '微信' },
  { src: '/assets/home/social-rednote.svg', label: '小红书' },
  { src: '/assets/home/social-tiktok.svg', label: '抖音' },
  { src: '/assets/home/social-bilibili.svg', label: '哔哩哔哩' },
] as const;

const pagePaths: Record<PageMode, string> = {
  home: '/',
  projects: '/projects',
  account: '/account',
  messages: '/messages',
};

function getPageFromPath(pathname: string): PageMode {
  if (pathname === pagePaths.projects || getProjectDetailIdFromPath(pathname) !== null) {
    return 'projects';
  }

  if (getAgentDetailIdFromPath(pathname) !== null) {
    return 'home';
  }

  if (pathname === pagePaths.account) {
    return 'account';
  }

  if (pathname === pagePaths.messages) {
    return 'messages';
  }

  return 'home';
}

function getProjectDetailIdFromPath(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)$/);

  return match ? decodeURIComponent(match[1]) : null;
}

function getProjectDetailPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}`;
}

function getAgentDetailIdFromPath(pathname: string) {
  const match = pathname.match(/^\/agents\/([^/]+)$/);

  return match ? decodeURIComponent(match[1]) : null;
}

function getAgentDetailPath(agentId: string) {
  return `/agents/${encodeURIComponent(agentId)}`;
}

function getMessageStateKey(messageMode: MessageMode, activeTab: string) {
  return `${messageMode}:${activeTab}`;
}

function getDefaultActiveTab(page: PageMode, currentViewMode: ViewMode) {
  if (page === 'projects') {
    return projectTabs[0];
  }

  if (page === 'account') {
    return billingTabs[0];
  }

  if (page === 'messages') {
    return messageTabs[0];
  }

  return currentViewMode === 'agents' ? tabs[0] : workflowTabs[0];
}

function getDefaultActiveTabForPath(
  pathname: string,
  page: PageMode,
  currentViewMode: ViewMode,
) {
  if (getProjectDetailIdFromPath(pathname) !== null) {
    return projectDetailTabs[0];
  }

  return getDefaultActiveTab(page, currentViewMode);
}

const heroSectionHeight = 246;
const contentTitleHeight = 76;
const projectTitleHeight = 96;
const accountTitleHeight = 76;
const accountOverviewHeight = 228;
const accountStickyStartScrollTop = accountTitleHeight + accountOverviewHeight;
const stickyTransitionDistance = 16;

function getTitleMenuVisibleScrollTop(page: PageMode) {
  if (page === 'home') {
    return heroSectionHeight + contentTitleHeight;
  }

  if (page === 'projects') {
    return projectTitleHeight;
  }

  if (page === 'messages') {
    return contentTitleHeight;
  }

  return contentTitleHeight;
}

function getStickyMetrics(
  nextOffset: number,
  stickyStartScrollTop: number,
  collapseRows = 1,
) {
  const scrollTop = Math.max(0, nextOffset);
  const transitionDistance = stickyTransitionDistance * collapseRows;
  const collapseScroll = Math.min(
    transitionDistance,
    Math.max(0, scrollTop - stickyStartScrollTop),
  );
  const toolbarCollapse = collapseScroll / transitionDistance;

  return {
    filterPadding: 24 - toolbarCollapse * 8,
    isStuck: scrollTop >= stickyStartScrollTop,
    spacerHeight: collapseScroll,
  };
}

const sidebarMenuBaseClassName =
  'flex h-9 items-center rounded-button py-2 text-sm transition-[width,padding,gap] duration-200 ease-out';
const sidebarMenuExpandedClassName = 'w-full gap-2.5 px-3';
const sidebarMenuCollapsedClassName = 'w-9 gap-0 pl-2.5 pr-0';
const sidebarMenuSelectedClassName = 'bg-bg-strong text-text-primary';
const sidebarMenuIdleClassName = 'text-text-primary hover:bg-bg-strong';
const sidebarControlButtonClassName =
  'items-center justify-center rounded-button hover:bg-bg-white hover:text-text-primary';

function Logo({
  collapsed = false,
  showCollapsedToggle = false,
  onToggle,
  onLogoClick,
}: {
  collapsed?: boolean;
  showCollapsedToggle?: boolean;
  onToggle?: () => void;
  onLogoClick?: () => void;
}) {
  return (
    <div
      className={[
        'relative flex h-9 items-center gap-1.5 transition-[width,padding] duration-200 ease-out',
        collapsed ? 'w-9 pl-1.5 pr-0' : 'w-auto pl-2 pr-0',
        collapsed && showCollapsedToggle
          ? 'rounded-button hover:bg-bg-white hover:text-text-primary'
          : '',
      ].join(' ')}
      onClick={() => {
        if (!collapsed) {
          onLogoClick?.();
        }
      }}
    >
      {collapsed && showCollapsedToggle ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Icon name="PanelLeft" className="shrink-0 text-text-primary" />
        </span>
      ) : (
        <img
          className="h-6 w-6 shrink-0"
          src="/assets/home/logo-mark.svg"
          alt=""
        />
      )}
      <div
        className={[
          'font-logo whitespace-nowrap text-xl leading-8 text-text-primary',
          collapsed ? 'hidden' : 'block',
        ].join(' ')}
      >
        Hello<span className="text-accent-green">me</span>
      </div>
      {collapsed && (
        <button
          className="absolute inset-0 rounded-button"
          type="button"
          aria-label="展开侧边栏"
          aria-expanded={!collapsed}
          onClick={onToggle}
        />
      )}
    </div>
  );
}

function SidebarItem({
  icon,
  avatarSrc,
  avatarAccount,
  label,
  badge,
  active = false,
  collapsed = false,
  buttonRef,
  onClick,
}: {
  icon?: IconName;
  avatarSrc?: string;
  avatarAccount?: MockAccount | null;
  label: string;
  badge?: number;
  active?: boolean;
  collapsed?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onClick?: () => void;
}) {
  return (
    <button
      ref={buttonRef}
      className="flex h-10 w-full items-center px-2 py-0.5"
      type="button"
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      onClick={onClick}
    >
      <span
        className={[
          sidebarMenuBaseClassName,
          collapsed
            ? sidebarMenuCollapsedClassName
            : sidebarMenuExpandedClassName,
          active ? sidebarMenuSelectedClassName : sidebarMenuIdleClassName,
        ].join(' ')}
      >
        {avatarSrc ? (
          <AccountAvatar
            account={avatarAccount ?? null}
            avatarSrc={avatarSrc}
            size="sm"
          />
        ) : icon ? (
          <Icon name={icon} className="shrink-0" />
        ) : null}
        {!collapsed && (
          <span className="flex min-w-0 flex-1 items-center gap-1 whitespace-nowrap text-left">
            <span className="min-w-0 truncate">{label}</span>
            {badge !== undefined && (
              <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-pill bg-accent-redSoft px-1 text-label text-accent-red">
                {badge}
              </span>
            )}
          </span>
        )}
      </span>
    </button>
  );
}

function ProfilePopover({
  popoverRef,
  accounts,
  avatarSrc,
  nickname,
  phone,
  selectedAccountId,
  onAccountSelect,
  onLoginMoreAccountsClick,
  onProfileClick,
  onPolicyClick,
  onAboutClick,
  onSupportClick,
  onLogoutClick,
}: {
  popoverRef: Ref<HTMLDivElement>;
  accounts: MockAccount[];
  avatarSrc: string;
  nickname: string;
  phone: string;
  selectedAccountId: string | null;
  onAccountSelect: (accountId: string) => void;
  onLoginMoreAccountsClick: () => void;
  onProfileClick: () => void;
  onPolicyClick: () => void;
  onAboutClick: () => void;
  onSupportClick: () => void;
  onLogoutClick: () => void;
}) {
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);

  return (
    <Popover
      ref={popoverRef}
      width={224}
      position="fixed"
      align="none"
      offset={null}
      className="bottom-12 left-2 z-50 h-[364px]"
    >
      {isAccountSwitcherOpen && (
        <AccountSwitcherPopover
          accounts={accounts}
          avatarSrc={avatarSrc}
          nickname={nickname}
          phone={phone}
          selectedAccountId={selectedAccountId}
          className="left-[calc(100%+4px)]"
          topOffset={0}
          onAccountSelect={onAccountSelect}
          onLoginMoreAccountsClick={onLoginMoreAccountsClick}
        />
      )}
      <div className="flex h-[348px] w-full flex-col">
        {profileMenuItems.map((item) => (
          <button
            key={item.label}
            className="group flex h-9 w-full items-center px-2 text-left"
            type="button"
            onClick={
              item.label === '切换账号'
                ? () => setIsAccountSwitcherOpen((currentValue) => !currentValue)
                : item.label === '个人资料'
                  ? onProfileClick
                  : item.label === '联系客服'
                    ? onSupportClick
                    : item.label === '政策/协议'
                      ? onPolicyClick
                      : item.label === '关于我们'
                        ? onAboutClick
                        : onLogoutClick
            }
          >
            <span
              className={[
                'flex h-9 w-full items-center gap-2 rounded-button px-2 text-sm leading-5 text-text-primary hover:bg-bg-soft active:bg-bg-medium',
                item.label === '切换账号' && isAccountSwitcherOpen
                  ? '!bg-bg-medium hover:!bg-bg-medium active:!bg-bg-medium'
                  : '',
              ].join(' ')}
            >
              <Icon name={item.icon} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.label === '关于我们' && (
                <Icon
                  name="ArrowUpRight"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                />
              )}
            </span>
          </button>
        ))}

        <div className="flex h-3 w-full items-center px-4">
          <div className="h-px w-full bg-border-subtle" />
        </div>

        <div className="flex h-8 w-full items-center px-2">
          <div className="flex h-8 w-[208px] items-center gap-1">
            {profileSocialItems.map((item) => (
              <button
                key={item.label}
                className="flex h-8 w-8 items-center justify-center rounded-button hover:bg-bg-soft active:bg-bg-medium"
                type="button"
                aria-label={item.label}
                title={item.label}
              >
                <img className="h-4 w-4" src={item.src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-3 w-full items-center px-4">
          <div className="h-px w-full bg-border-subtle" />
        </div>

        <div className="flex h-[76px] w-full px-2">
          <div className="flex h-[76px] w-[208px] flex-col px-2 py-2 text-xxs text-text-hint">
            <p className="h-[13px] leading-[13px]">江苏汇智智能数字科技有限公司</p>
            <p className="h-[13px] leading-[13px]">苏ICP备2023021414号-14</p>
            <p className="mt-1 h-[26px] leading-[13px]">
              算法备案号:
              <br />
              Jiangsu-CarrotAI-202407030002
            </p>
          </div>
        </div>
      </div>
    </Popover>
  );
}

function getSwitcherAccountTypeBadge(account: MockAccount) {
  if (account.type === 'personal') return '个人';

  return '企业';
}

function getSwitcherEnterpriseRoleBadge(account: MockAccount) {
  if (account.type !== 'enterprise') return null;

  return account.enterpriseRole === 'owner' ? '拥有' : '员工';
}

function getAccountInitial(accountName: string) {
  return accountName.trim().charAt(0) || '企';
}

function isEnterpriseAvatarPreset(value?: string) {
  return value?.startsWith(enterpriseAvatarPresetPrefix) ?? false;
}

function getEnterpriseAvatarPreset(value?: string) {
  return (
    enterpriseAvatarPresets.find((preset) => preset.value === value) ??
    enterpriseAvatarPresets[0]
  );
}

function getAccountDisplayName(account: MockAccount | null, nickname: string) {
  if (account?.type === 'enterprise') return account.name;

  return nickname;
}

function CertifiedBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3 shrink-0 text-text-success"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="fill-current stroke-current"
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        className="stroke-text-inverse"
        d="m9 12 2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SelectedAccountCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-text-success"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="fill-current stroke-current"
        cx="12"
        cy="12"
        r="10"
        strokeWidth="1.5"
      />
      <path
        className="stroke-text-inverse"
        d="m9 12 2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function AccountAvatar({
  account,
  avatarSrc,
  size = 'md',
}: {
  account: MockAccount | null;
  avatarSrc: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClassName =
    size === 'sm'
      ? 'h-4 w-4 text-xxs'
      : size === 'lg'
        ? 'h-9 w-9 text-sm'
        : size === 'xl'
          ? 'h-10 w-10 text-sm'
          : 'h-8 w-8 text-sm';
  const resolvedAvatarSrc =
    account?.type === 'enterprise' ? account.avatarSrc : avatarSrc;

  if (
    account?.type === 'enterprise' &&
    (!resolvedAvatarSrc || isEnterpriseAvatarPreset(resolvedAvatarSrc))
  ) {
    const preset = getEnterpriseAvatarPreset(resolvedAvatarSrc);

    return (
      <span
        className={[
          'flex shrink-0 items-center justify-center rounded-pill font-medium leading-5',
          sizeClassName,
          preset.previewClassName,
        ].join(' ')}
      >
        {getAccountInitial(account.name)}
      </span>
    );
  }

  return (
    <span
      className={[
        'shrink-0 overflow-hidden rounded-pill shadow-avatar-border',
        sizeClassName,
      ].join(' ')}
    >
      <img className="h-full w-full object-cover" src={resolvedAvatarSrc} alt="" />
    </span>
  );
}

function AccountSwitcherRow({
  account,
  avatarSrc,
  nickname,
  phone,
  selected,
  density = 'popover',
  onSelect,
}: {
  account: MockAccount;
  avatarSrc: string;
  nickname: string;
  phone: string;
  selected: boolean;
  density?: 'popover' | 'modal';
  onSelect: () => void;
}) {
  const isPersonal = account.type === 'personal';
  const roleBadge = getSwitcherEnterpriseRoleBadge(account);
  const outerPaddingClassName = density === 'modal' ? 'px-3' : 'px-2';
  const innerPaddingClassName = density === 'modal' ? 'p-3' : 'p-2';

  return (
    <button
      className={['flex w-full items-center text-left', outerPaddingClassName].join(' ')}
      type="button"
      onClick={onSelect}
    >
      <span
        className={[
          'flex min-w-0 flex-1 items-start gap-3 rounded-button hover:bg-bg-soft active:bg-bg-medium',
          innerPaddingClassName,
        ].join(' ')}
      >
        <span className="flex self-stretch items-center justify-center">
          <AccountAvatar account={account} avatarSrc={avatarSrc} size="lg" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm leading-5 text-text-primary">
              {isPersonal ? nickname : account.name}
            </span>
            <span className="truncate text-xs leading-4 text-text-secondary">
              {phone}
            </span>
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-1">
            {account.type === 'enterprise' && account.enterpriseRole === 'owner' && (
              <span className="flex h-4 shrink-0 items-center gap-0.5 rounded-pill bg-accent-success/10 px-1.5 text-xxs font-medium leading-[13px] text-text-success">
                <CertifiedBadgeIcon />
                已认证
              </span>
            )}
            <span className="flex h-4 shrink-0 items-center rounded-pill bg-bg-medium px-1.5 text-xxs leading-[13px] text-text-secondary">
              {getSwitcherAccountTypeBadge(account)}
            </span>
            {roleBadge && (
              <span className="flex h-4 shrink-0 items-center rounded-pill bg-bg-medium px-1.5 text-xxs leading-[13px] text-text-secondary">
                {roleBadge}
              </span>
            )}
          </span>
        </span>
        {selected && (
          <span className="flex self-stretch items-center justify-end text-text-success">
            <SelectedAccountCheckIcon />
          </span>
        )}
      </span>
    </button>
  );
}

function AccountSwitcherPopover({
  accounts,
  avatarSrc,
  nickname,
  phone,
  selectedAccountId,
  className = 'right-[calc(100%+4px)]',
  topOffset = 64,
  onAccountSelect,
  onLoginMoreAccountsClick,
}: {
  accounts: MockAccount[];
  avatarSrc: string;
  nickname: string;
  phone: string;
  selectedAccountId: string | null;
  className?: string;
  topOffset?: number;
  onAccountSelect: (accountId: string) => void;
  onLoginMoreAccountsClick: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>(() => ({
    maxHeight: 'calc(100vh - 96px)',
    top: topOffset,
  }));
  const visibleAccounts =
    accounts.length > 0
      ? accounts
      : [
          {
            id: 'current-personal-account',
            name: '个人账户',
            type: 'personal',
            status: '正常',
            balance: '0.00',
            apiKeyCount: 0,
            createdAt: '',
          } satisfies MockAccount,
        ];
  const resolvedSelectedAccountId =
    selectedAccountId ?? visibleAccounts[0]?.id ?? null;

  useLayoutEffect(() => {
    function updatePanelStyle() {
      const panel = panelRef.current;
      const parent = panel?.offsetParent;

      if (!panel) return;

      const viewportHeight = window.innerHeight;

      if (!(parent instanceof HTMLElement)) return;

      const parentRect = parent.getBoundingClientRect();
      const scrollArea = panel.querySelector<HTMLElement>(
        '[data-account-switcher-scroll]',
      );
      const footer = panel.querySelector<HTMLElement>(
        '[data-account-switcher-footer]',
      );
      const preferredTop = parentRect.top + topOffset;
      const availableBelow = Math.max(0, viewportHeight - preferredTop - 48);
      const naturalHeight =
        (scrollArea?.scrollHeight ?? 0) + (footer?.scrollHeight ?? 0) + 16;
      const nextHeight = Math.min(naturalHeight, Math.max(0, viewportHeight - 96));

      if (naturalHeight <= availableBelow) {
        setPanelStyle({
          maxHeight: availableBelow,
          top: topOffset,
        });
        return;
      }

      const nextTop = Math.max(48, viewportHeight - 48 - nextHeight);

      setPanelStyle({
        maxHeight: nextHeight,
        top: nextTop - parentRect.top,
      });
    }

    updatePanelStyle();
    window.addEventListener('resize', updatePanelStyle);

    return () => {
      window.removeEventListener('resize', updatePanelStyle);
    };
  }, [topOffset, visibleAccounts.length]);

  return (
    <PopoverPanel
      ref={panelRef}
      width="lg"
      position="absolute"
      align="none"
      offset={null}
      constrainHeight={false}
      shadow="strong"
      className={`${className} z-50 flex flex-col overflow-hidden`}
      style={panelStyle}
    >
      <div
        className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto"
        data-account-switcher-scroll
      >
        {visibleAccounts.map((account, index) => (
          <div key={account.id}>
            <AccountSwitcherRow
              account={account}
              avatarSrc={avatarSrc}
              nickname={nickname}
              phone={phone}
              selected={account.id === resolvedSelectedAccountId}
              onSelect={() => onAccountSelect(account.id)}
            />
            {index < visibleAccounts.length - 1 && <PopoverDivider />}
          </div>
        ))}
      </div>
      <div className="shrink-0" data-account-switcher-footer>
        <div className="flex h-3 w-full items-center px-4">
          <div className="h-px w-full bg-border-subtle" />
        </div>
        <button
          className="flex h-9 w-full items-center px-2 text-left"
          type="button"
        >
          <span className="flex h-9 w-full items-center gap-2 rounded-button px-2 text-sm leading-5 text-text-primary hover:bg-bg-soft active:bg-bg-medium">
            <Icon name="Building2" className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">申请企业认证</span>
          </span>
        </button>
        <button
          className="flex h-9 w-full items-center px-2 text-left"
          type="button"
          onClick={onLoginMoreAccountsClick}
        >
          <span className="flex h-9 w-full items-center gap-2 rounded-button px-2 text-sm leading-5 text-text-primary hover:bg-bg-soft active:bg-bg-medium">
            <Icon name="Plus" className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">登录更多账号</span>
          </span>
        </button>
      </div>
    </PopoverPanel>
  );
}

function LoginAccountSelectionModal({
  accounts,
  avatarSrc,
  nickname,
  phone,
  selectedAccountId,
  onAccountSelect,
  onClose,
  onConfirm,
}: {
  accounts: MockAccount[];
  avatarSrc: string;
  nickname: string;
  phone: string;
  selectedAccountId: string | null;
  onAccountSelect: (accountId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const visibleAccounts = accounts.length > 0 ? accounts : [];
  const resolvedSelectedAccountId =
    selectedAccountId ?? visibleAccounts[0]?.id ?? null;

  return (
    <Modal
      size="md"
      title="选择要登录的账号"
      closeLabel="关闭选择账号弹窗"
      bodyPadding={false}
      panelClassName="shadow-card-hover"
      bodyClassName="scrollbar-none"
      footerClassName="!flex-row !items-start !justify-between"
      footer={({ close }) => (
        <>
          <Button
            variant="text"
            size="lg"
            surface="white"
            icon="Building2"
            className="!px-2"
            onClick={() => undefined}
          >
            申请企业认证
          </Button>
          <Button
            size="lg"
            disabled={resolvedSelectedAccountId === null}
            onClick={() => {
              onConfirm();
              close();
            }}
          >
            确认登录
          </Button>
        </>
      )}
      onClose={onClose}
    >
      <div className="flex w-full flex-col">
        {visibleAccounts.map((account) => (
          <div key={account.id}>
            <AccountSwitcherRow
              account={account}
              avatarSrc={avatarSrc}
              nickname={nickname}
              phone={phone}
              selected={account.id === resolvedSelectedAccountId}
              density="modal"
              onSelect={() => onAccountSelect(account.id)}
            />
            <div className="flex h-3 w-full items-center px-6">
              <div className="h-px w-full bg-border-subtle" />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

const aiWorkstationFeatureCards = [
  {
    icon: 'Lock',
    title: '数据更可控',
    description: '智能体在本地工作站执行，减少业务数据外传。',
  },
  {
    icon: 'Atom',
    title: '适合企业场景',
    description: '企业资料、知识库与流程由您自主管理。',
  },
  {
    icon: 'BadgeCheck',
    title: '支持私有化能力',
    description: '可连接本地模型，支持专属部署方案。',
  },
] as const;

const aiWorkstationQuestions = [
  {
    title: '为什么需要连接本地 AI 工作站?',
    description:
      'Hellome负责工作台交互，HzHermes负责在您的电脑上执行智能体任务。连接后，任务数据可以在本地处理，帮助企业降低敏感信息外泄风。',
  },
  {
    title: '连接后数据会上传到云端吗?',
    description:
      '重要的任务数据，是在本地处理，不会上传至云端，只有部分账户数据会同步。',
  },
  {
    title: 'HzHermes 可以安装在另一台电脑上使用吗？',
    description:
      'HzHermes 可以安装在另一台电脑上使用，只要登录同一个手机号，HelloMe 就可以识别连接状态。',
  },
] as const;

const aiWorkstationPairingSteps = [
  {
    title: '打开 HzHermes',
    description: '请先确认 HzHermes 已启动，并保持在后台运行。',
  },
  {
    title: '完成配对',
    description: '在“消息平台”中找到 Hellome，点击“一键配对 HzHermes”',
  },
  {
    title: '检查登录账号',
    description: 'Hellome 与 HzHermes 必须使用同一个登录账号。',
  },
] as const;

const customAgentSceneCards: Array<{
  icon: IconName;
  label: string;
}> = [
  { icon: 'LibraryBig', label: '企业知识库问答与内部助手' },
  { icon: 'Headset', label: '客服、销售及售前咨询' },
  { icon: 'PencilSparkles', label: '内容创作、审核与批量生成' },
  { icon: 'Users', label: '招聘、面试及员工培训' },
  { icon: 'ReceiptText', label: '报告、合同、方案等文档处理' },
  { icon: 'ListChecks', label: '数据分析、业务流程自动化' },
];

const customAgentCapabilities: Array<{
  icon: IconName;
  label: string;
}> = [
  { icon: 'Zap', label: '智能体功能与交互设计' },
  { icon: 'LibraryBig', label: '企业知识库接入' },
  { icon: 'Columns3Cog', label: '专属提示词与业务规则配置' },
  { icon: 'GitBranchPlus', label: '工作流程及工具调用设计' },
  { icon: 'Laptop', label: '本地模型或私有化部署方案' },
  { icon: 'BadgeCheck', label: '上线后的调试与优化支持' },
];

const customAgentServiceSteps = [
  {
    index: '1',
    title: '需求沟通',
    description: '明确业务目标与需求',
  },
  {
    index: '2',
    title: '方案评估',
    description: '制定适合的实施方案',
  },
  {
    index: '3',
    title: '智能体配置',
    description: '完成智能体能力搭建',
  },
  {
    index: '4',
    title: '测试验收',
    description: '测试效果并优化调整',
  },
  {
    index: '5',
    title: '正式上线',
    description: '部署交付并投入使用',
  },
] as const;

const customAgentDeploymentOptions = [
  '暂不需求',
  '有此需求，想了解方案',
  '暂不确定，希望获得建议',
] as const;

type CustomAgentErrorField = 'requirement' | 'contact' | null;

function AiWorkstationConnectionModal({
  status,
  currentUser,
  accountStats,
  avatarSrc,
  nickname,
  onPairComplete,
  onOverviewClick,
  onClose,
}: {
  status: MockAiWorkstationConnectionStatus;
  currentUser: MockUser | null;
  accountStats: MockAccountStat[];
  avatarSrc: string;
  nickname: string;
  onPairComplete: () => void;
  onOverviewClick: () => void;
  onClose: () => void;
}) {
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<
    number | null
  >(null);

  return (
    <Modal
      size="md"
      ariaLabel="连接AI工作站"
      showCloseButton={false}
      bodyPadding={false}
      panelClassName="relative h-[640px] !w-[840px] !bg-bg-black p-0 !shadow-ai-workstation-modal"
      bodyClassName="overflow-y-auto"
      header={({ close }) => (
        <div className="absolute right-0 top-0 z-20 flex h-14 w-14 items-start justify-end pb-2 pl-2 pr-4 pt-4">
          <ModalCloseButton
            aria-label="关闭连接AI工作站弹窗"
            surface="soft"
            onClick={close}
          />
        </div>
      )}
      onClose={onClose}
    >
      <div className="relative flex h-full min-h-0 w-full items-start overflow-hidden">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 flex items-center justify-center [container-type:size]">
            <div className="h-[100cqw] w-[100cqh] shrink-0 -rotate-90">
              <img
                className="h-full w-full object-cover"
                src="/assets/ai-workstation/connect-cover.png"
                alt=""
              />
              <div className="absolute inset-0 bg-bg-black/20" />
            </div>
          </div>
        </div>

        <section className="scrollbar-none relative flex h-full min-w-0 flex-1 flex-col items-start gap-6 overflow-y-auto overflow-x-hidden px-12 py-10">
          <div
            className="relative z-10 h-12 w-[45px] shrink-0"
            data-name="hermes-logo 4"
          >
            <img
              className="absolute inset-0 block h-full w-full max-w-none"
              src="/assets/ai-workstation/hermes-logo.svg"
              alt=""
            />
          </div>

          <div
            className="relative z-10 flex w-full shrink-0 flex-col items-start gap-2"
            data-name="Heading"
          >
            <div
              className="flex w-full shrink-0 flex-col items-start text-left text-accent-warningSoft"
              data-name="Title"
            >
              <h2 className="w-full shrink-0 text-brand-sm font-extrabold uppercase leading-[30px]">
                HZ HERMES
              </h2>
              <p className="w-full shrink-0 text-xl font-semibold">
                你的 AI 智能体管家，发号施令，坐等成果
              </p>
            </div>
            <div
              className="relative flex w-full shrink-0 items-start justify-center overflow-hidden"
              data-name="Subtitle"
            >
              <p className="min-w-0 flex-1 text-justify text-label text-accent-warningSoft">
                Hellome 是本地化的智能体操作工作台，连接 HzHermes
                后，由 Hellome 统一组织智能体任务，HzHermes
                在本地工作站完成执行，你的工作流更顺畅，数据边界也更清晰。
              </p>
            </div>
          </div>

          <div
            className="relative z-10 flex w-full shrink-0 items-start justify-center gap-1"
            data-name="Card Container"
          >
            {aiWorkstationFeatureCards.map((card) => (
              <article
                key={card.title}
                className="relative flex min-w-0 flex-1 flex-col items-start gap-4 rounded-lg bg-overlay-white8 p-4 text-accent-warningSoft"
                data-name="Card"
              >
                <Icon name={card.icon} size="md" className="shrink-0" />
                <div
                  className="relative flex w-full shrink-0 flex-col items-start gap-1.5"
                  data-name="Text Container"
                >
                  <div
                    className="relative flex w-full shrink-0 items-center justify-center"
                    data-name="Title"
                  >
                    <p className="min-w-0 flex-1 text-left text-label font-normal">
                      {card.title}
                    </p>
                  </div>
                  <div
                    className="relative flex w-full shrink-0 items-start overflow-hidden"
                    data-name="Subtitle"
                  >
                    <p className="min-w-0 flex-1 text-justify text-label text-accent-warningSoft/80">
                      {card.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div
            className="relative z-10 flex w-full shrink-0 flex-col items-center gap-2"
            data-name="QA"
          >
              <div
                className="relative flex w-full shrink-0 items-center gap-1 text-accent-warningSoft/60"
                data-name="Title"
              >
                <Icon name="MessageCircleQuestion" size="2xs" />
                <span className="text-label font-medium">
                  常见问题
                </span>
              </div>
              <div
                className="relative flex w-full shrink-0 flex-col items-start gap-1"
                data-name="List"
              >
                {aiWorkstationQuestions.map((question, index) => {
                  const isExpanded = expandedQuestionIndex === index;

                  return (
                  <button
                    key={question.title}
                    className="relative flex w-full shrink-0 flex-col items-start rounded-lg bg-overlay-white8 px-4 text-left text-accent-warningSoft transition-colors hover:bg-overlay-white12"
                    type="button"
                    data-name="List Item"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedQuestionIndex((currentIndex) =>
                        currentIndex === index ? null : index,
                      )
                    }
                  >
                    <span
                      className="relative flex h-10 w-full shrink-0 items-center justify-center gap-2 py-3"
                      data-name="Title"
                    >
                      <span className="flex min-w-0 flex-1 flex-col justify-center text-left text-label">
                        {question.title}
                      </span>
                      <Icon
                        name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                        size="sm"
                        className="shrink-0 opacity-60 transition-transform duration-200 ease-out"
                      />
                    </span>
                    <span
                      className={[
                        'grid w-full overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out',
                        isExpanded
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0',
                      ].join(' ')}
                      data-name="Detail"
                    >
                      <span className="min-h-0 overflow-hidden">
                        <span className="block px-0 pb-3 pt-0 text-justify text-label text-accent-warningSoft/80">
                          {question.description}
                        </span>
                      </span>
                    </span>
                  </button>
                  );
                })}
              </div>
          </div>
        </section>

        <aside className="relative flex h-full w-[360px] shrink-0 items-center py-2 pr-2">
          <div
            className="scrollbar-none flex h-full min-w-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden rounded-lg bg-bg-soft px-8 py-6"
            data-name="Panel"
          >
            {status === 'not-installed' ? (
              <AiWorkstationUninstalledPanelContent />
            ) : status === 'not-connected' ? (
              <AiWorkstationNotConnectedPanelContent
                onPairComplete={onPairComplete}
              />
            ) : (
              <AiWorkstationConnectedPanelContent
                currentUser={currentUser}
                accountStats={accountStats}
                avatarSrc={avatarSrc}
                nickname={nickname}
                onOverviewClick={onOverviewClick}
              />
            )}
            <div
              className="relative flex h-4 w-full shrink-0 items-center justify-center px-0"
              data-name="Menu Item"
            >
              <div className="h-px w-full bg-border-subtle" />
            </div>
            <div
              className="relative flex w-full shrink-0 flex-col items-center gap-0.5 pt-2 text-center"
              data-name="Footer"
            >
              <p className="flex w-full flex-col justify-center text-label font-extrabold uppercase text-text-placeholder">
                HZHERMES
              </p>
              <p className="w-full text-xxs text-text-placeholder">
                多种能力，无限可能
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
}

function AiWorkstationRightHeader({
  icon,
  iconClassName,
  title,
  titleLineClassName = 'leading-6',
}: {
  icon: 'CircleAlert' | 'CircleCheckBig' | 'CircleX';
  iconClassName: string;
  title: string;
  titleLineClassName?: string;
}) {
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-center justify-center gap-3 pb-2 pt-4"
      data-name="Header"
    >
      <Icon name={icon} size="xl" className={iconClassName} />
      <div
        className="flex w-full shrink-0 flex-col items-center text-center"
        data-name="Text Container"
      >
        <h2 className="w-full shrink-0 text-base font-semibold leading-6 text-text-primary">
          {title}
        </h2>
        <p
          className={[
            'w-full shrink-0 text-base font-extrabold uppercase text-text-primary',
            titleLineClassName,
          ].join(' ')}
        >
          HZHERMES
        </p>
      </div>
    </div>
  );
}

function AiWorkstationRightDivider({ inset }: { inset: 'wide' | 'none' }) {
  return (
    <div
      className={[
        'relative flex h-4 w-full shrink-0 items-center justify-center',
        inset === 'wide' ? 'px-16' : 'px-0',
      ].join(' ')}
      data-name="Menu Item"
    >
      <div
        className={[
          'h-px w-full',
          inset === 'wide' ? 'bg-border-default' : 'bg-border-subtle',
        ].join(' ')}
      />
    </div>
  );
}

function AiWorkstationUninstalledPanelContent() {
  return (
    <div
      className="relative flex min-h-max w-full flex-1 flex-col items-center"
      data-name="Content"
    >
      <AiWorkstationRightHeader
        icon="CircleX"
        iconClassName="text-text-danger"
        title="未安装"
        titleLineClassName="leading-[22px]"
      />
      <AiWorkstationRightDivider inset="wide" />
      <div
        className="relative flex w-full shrink-0 items-center justify-center overflow-hidden px-4 py-2"
        data-name="Subtitle"
      >
        <p className="min-w-0 flex-1 text-center text-xs leading-4 text-text-secondary">
          安装本地AI工作站后
          <br />
          Hellome才能连接并使用本地智能体
        </p>
      </div>
      <div
        className="relative flex w-full shrink-0 flex-col items-center justify-center px-6 py-4"
        data-name="Actions Wrapper"
      >
        <Button
          icon="Download"
          size="lg"
          shape="pill"
          fullWidth
          className="gap-2"
          type="button"
          data-name="Button"
        >
          下载安装
        </Button>
      </div>
    </div>
  );
}

function AiWorkstationNotConnectedPanelContent({
  onPairComplete,
}: {
  onPairComplete: () => void;
}) {
  return (
    <div
      className="relative flex min-h-max w-full flex-1 flex-col items-center"
      data-name="Content"
    >
      <AiWorkstationRightHeader
        icon="CircleAlert"
        iconClassName="text-text-warning"
        title="未连接"
        titleLineClassName="leading-[22px]"
      />
      <AiWorkstationRightDivider inset="wide" />
      <div
        className="relative flex w-full shrink-0 items-center justify-center overflow-hidden px-4 py-2"
        data-name="Subtitle"
      >
        <p className="min-w-0 flex-1 text-center text-xs leading-4 text-text-secondary">
          Hellome 无法直接检查您电脑上的本地程序，请按照下方步骤完成自查后，再手动尝试连接
        </p>
      </div>
      <div
        className="relative flex w-full shrink-0 flex-col items-start pb-2 pt-4"
        data-name="Stepper Content"
      >
        <div
          className="relative flex w-full shrink-0 flex-col items-start rounded-card bg-bg-white p-5"
          data-name="Stepper"
        >
          {aiWorkstationPairingSteps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex w-full shrink-0 items-start overflow-hidden"
              data-name="List Item"
            >
              <div
                className={[
                  'relative flex shrink-0 self-stretch flex-col items-center pb-0.5',
                  index === aiWorkstationPairingSteps.length - 1 ? 'gap-0' : 'gap-0.5',
                ].join(' ')}
                data-name="Stepper"
              >
                <div
                  className="relative flex shrink-0 items-center"
                  data-name="icon"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-pill bg-bg-black text-xxs font-medium text-text-inverse">
                    {index + 1}
                  </span>
                </div>
                {index < aiWorkstationPairingSteps.length - 1 && (
                  <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                    <div className="h-full w-px bg-border-default" />
                  </div>
                )}
              </div>
              <div
                className={[
                  'relative flex min-w-0 flex-1 flex-col items-start gap-1.5 pl-3',
                  index < aiWorkstationPairingSteps.length - 1 ? 'pb-5' : '',
                ].join(' ')}
                data-name="Text Container"
              >
                <div
                  className="relative flex w-full shrink-0 items-center"
                  data-name="Title"
                >
                  <p className="min-w-0 flex-1 text-left text-xs font-medium leading-4 text-text-primary">
                    {step.title}
                  </p>
                </div>
                <div
                  className="relative flex w-full shrink-0 items-center overflow-hidden"
                  data-name="Subtitle"
                >
                  <p className="min-w-0 flex-1 text-justify text-label text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="relative flex w-full shrink-0 flex-col items-center justify-center px-6 py-4"
        data-name="Actions Wrapper"
      >
        <Button
          icon="Check"
          size="lg"
          shape="pill"
          fullWidth
          className="gap-2"
          type="button"
          data-name="Button"
          onClick={onPairComplete}
        >
          我已完成配对
        </Button>
      </div>
    </div>
  );
}

function getAiWorkstationOverviewMetrics(
  accountStats: MockAccountStat[],
): Array<readonly [string, string]> {
  const overviewStat = accountStats.find((stat) => stat.title === '账户总览');
  const getMetricValue = (label: string) =>
    overviewStat?.metrics.find(([metricLabel]) => metricLabel === label)?.[1] ??
    '0';

  return [
    ['可用余额', getMetricValue('可用余额')],
    ['赠送额度', getMetricValue('赠送额度')],
    ['累计充值', getMetricValue('累计充值')],
    ['累计消费', getMetricValue('累计消费')],
  ];
}

function AiWorkstationConnectedPanelContent({
  currentUser,
  accountStats,
  avatarSrc,
  nickname,
  onOverviewClick,
}: {
  currentUser: MockUser | null;
  accountStats: MockAccountStat[];
  avatarSrc: string;
  nickname: string;
  onOverviewClick: () => void;
}) {
  const overviewMetrics = getAiWorkstationOverviewMetrics(accountStats);
  const displayName = nickname || currentUser?.nickname || defaultProfileNickname;
  const phone = currentUser?.phone ?? '';

  return (
    <div
      className="relative flex min-h-max w-full flex-1 flex-col items-center"
      data-name="Content"
    >
      <AiWorkstationRightHeader
        icon="CircleCheckBig"
        iconClassName="text-text-success"
        title="已连接"
        titleLineClassName="leading-[22px]"
      />
      <div
        className="relative flex w-full shrink-0 items-center justify-center gap-1.5 py-2 text-text-primary"
        data-name="Connection Status"
      >
        <Icon name="Laptop" size="sm" />
        <p className="shrink-0 whitespace-nowrap text-left text-xs leading-4">
          Shiwuan 的电脑
        </p>
      </div>
      <AiWorkstationRightDivider inset="wide" />
      <div
        className="relative flex w-full shrink-0 flex-col items-center justify-center gap-2 rounded-lg p-2"
        data-name="Menu Button"
      >
        <div
          className="relative flex w-full shrink-0 items-center justify-center"
          data-name="Text Container"
        >
          <p className="min-w-0 flex-1 text-center text-label uppercase text-text-hint">
            当前登录账号
          </p>
        </div>
        <img
          className="h-10 w-10 shrink-0 rounded-pill object-cover"
          src={avatarSrc}
          alt=""
        />
        <div
          className="relative flex w-full shrink-0 flex-col items-center justify-center"
          data-name="name&phone"
        >
          <div
            className="relative flex w-full shrink-0 items-center justify-center"
            data-name="name"
          >
            <p className="min-w-0 flex-1 truncate text-center text-sm leading-5 text-text-primary">
              {displayName}
            </p>
          </div>
          <div
            className="relative flex w-full shrink-0 items-center justify-center"
            data-name="phone"
          >
            <p className="min-w-0 flex-1 truncate text-center text-xs leading-4 text-text-secondary">
              {phone}
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex w-full shrink-0 flex-col items-center justify-center pb-4 pt-2">
        <Button
          size="sm"
          shape="pill"
          className="w-[160px]"
          type="button"
          data-name="Button"
        >
          进入工作台
        </Button>
      </div>
      <div
        className="relative flex w-full shrink-0 items-center justify-between py-3"
        data-name="Title"
      >
        <p className="shrink-0 whitespace-nowrap text-left text-xs uppercase leading-4 text-text-primary">
          账户概览
        </p>
        <button
          className="relative flex shrink-0 items-center text-text-hint transition-colors hover:text-text-primary active:text-text-secondary"
          type="button"
          data-name="More"
          onClick={onOverviewClick}
        >
          <span className="shrink-0 whitespace-nowrap text-center text-xs uppercase leading-4">
            详情
          </span>
          <Icon name="ChevronRight" size="sm" />
        </button>
      </div>
      <div
        className="relative grid w-full shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-lg text-center"
        data-name="List Item"
      >
        {overviewMetrics.map(([label, value]) => (
          <div
            key={label}
            className="relative flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-bg-white p-4"
            data-name="Content"
          >
            <p className="w-full shrink-0 text-sm font-medium leading-5 text-text-primary">
              {value}
            </p>
            <p className="w-full shrink-0 text-label text-text-secondary">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDetailCheckboxMark({
  checked,
  indeterminate = false,
  alwaysVisible = true,
}: {
  checked: boolean;
  indeterminate?: boolean;
  alwaysVisible?: boolean;
}) {
  return (
    <span
      className={[
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-default text-text-primary transition-[opacity,background-color]',
        checked || indeterminate ? 'bg-bg-medium' : 'bg-transparent',
        alwaysVisible || checked || indeterminate
          ? 'opacity-100'
          : 'opacity-0 group-hover/project-file-row:opacity-100',
      ].join(' ')}
      aria-hidden="true"
    >
      {checked && <Icon name="Check" size="xs" strokeWidth={3} />}
      {indeterminate && !checked && (
        <Icon name="Minus" size="xs" strokeWidth={3} />
      )}
    </span>
  );
}

function CustomAgentModal({ onClose }: { onClose: () => void }) {
  const [requirement, setRequirement] = useState('');
  const [contact, setContact] = useState('');
  const [contactName, setContactName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedDeploymentOption, setSelectedDeploymentOption] = useState<
    number | null
  >(null);
  const [errorField, setErrorField] = useState<CustomAgentErrorField>(null);

  const hasRequirementError = errorField === 'requirement';
  const hasContactError = errorField === 'contact';
  const textareaFrameClassName = [
    'flex h-[108px] w-full shrink-0 flex-col items-start justify-center gap-2 rounded-button px-4 py-3 transition-shadow',
    hasRequirementError
      ? 'shadow-border-error'
      : 'shadow-border-strong hover:shadow-border-hover focus-within:!shadow-border-selected',
  ].join(' ');

  function handleSubmitCustomAgentRequest() {
    if (requirement.trim().length === 0) {
      setErrorField('requirement');
      return;
    }

    if (contact.trim().length === 0) {
      setErrorField('contact');
      return;
    }

    setErrorField(null);
  }

  return (
    <Modal
      size="md"
      ariaLabel="定制智能体需求"
      showCloseButton={false}
      bodyPadding={false}
      panelClassName="relative h-[800px] !w-[960px] p-0 !shadow-ai-workstation-modal"
      bodyClassName="h-full overflow-hidden"
      header={({ close }) => (
        <div
          className="absolute right-0 top-0 z-20 flex h-14 w-14 items-start justify-end pb-2 pl-2 pr-4 pt-4"
          data-name="Heading"
        >
          <ModalCloseButton
            aria-label="关闭定制需求弹窗"
            onClick={close}
          />
        </div>
      )}
      onClose={onClose}
    >
      <div className="relative flex h-full w-full items-start overflow-hidden">
        <section
          className="relative h-full min-w-0 flex-1 overflow-hidden text-text-inverse [container-type:size]"
          data-name="Left Panel"
        >
          <div className="absolute inset-0 bg-bg-black" data-name="Cover Image">
            <img
              className="h-full w-full object-cover"
              src="/assets/custom-agent/cover.png"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-l from-bg-black/40 to-overlay-clear" />
          </div>

          <div className="scrollbar-none relative z-10 flex h-full w-full flex-col items-start gap-[clamp(24px,calc((100cqh-650px)/4),32px)] overflow-y-auto overflow-x-hidden px-16 py-10">
            <Icon
              name="PackagePlus"
              size="2xl"
              className="shrink-0"
            />

            <div
              className="flex w-full shrink-0 flex-col items-start gap-2"
              data-name="Heading"
            >
              <div className="flex w-full shrink-0 flex-col items-start">
                <h2 className="w-full text-2xl font-semibold">
                  定制专属智能体
                </h2>
              </div>
              <div className="flex w-full shrink-0 items-start justify-center overflow-hidden">
                <div className="min-w-0 flex-1 text-justify text-xs leading-4 text-text-inverse">
                  <p>根据您的业务目标、工作流程和数据需求，打造专属AI智能体。</p>
                  <p>
                    定制智能体可以结合企业内部知识、业务规则和操作流程，为您提供更贴合实际工作的智能服务，帮助提升效率、统一标准，并减少重复性工作。
                  </p>
                </div>
              </div>
            </div>

            <div
              className="flex w-full shrink-0 flex-col items-start gap-2"
            >
              <div className="flex w-full shrink-0 items-center text-xs leading-4 text-text-inverse/60">
                <p className="min-w-0 flex-1">适用场景</p>
              </div>
              <div
                className="grid w-full shrink-0 grid-cols-3 gap-1"
                data-name="Card Container"
              >
                {customAgentSceneCards.map((card) => (
                  <div
                    key={card.label}
                    className="flex h-[52px] shrink-0 items-center gap-3 rounded-lg bg-overlay-white8 px-4 py-3"
                    data-name="Card"
                  >
                    <Icon name={card.icon} size="sm" className="shrink-0 opacity-40" />
                    <p className="w-[89px] shrink-0 text-label text-text-inverse">
                      {card.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex w-full shrink-0 flex-col items-start gap-2"
            >
              <div className="flex w-full shrink-0 items-center text-xs leading-4 text-text-inverse/60">
                <p className="min-w-0 flex-1">我们可以为您提供</p>
              </div>
              <div
                className="flex w-full shrink-0 flex-col items-start rounded-lg py-1"
                data-name="Card Container"
              >
                {customAgentCapabilities.map((capability, index) => (
                  <div className="w-full" key={capability.label}>
                    <div
                      className="flex h-[26px] w-full shrink-0 items-center gap-3 rounded-lg py-1.5"
                      data-name="Card"
                    >
                      <Icon name={capability.icon} size="sm" className="shrink-0 opacity-40" />
                      <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
                        <p className="w-full text-label text-text-inverse">
                          {capability.label}
                        </p>
                      </div>
                    </div>
                    {index < customAgentCapabilities.length - 1 && (
                      <div className="flex h-2 w-full shrink-0 items-center">
                        <div className="h-px w-full bg-overlay-white8" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex w-full shrink-0 flex-col items-center gap-2"
              data-name="QA"
            >
              <div className="flex w-full shrink-0 items-center text-xs leading-4 text-text-inverse/60">
                <p className="min-w-0 flex-1">服务流程</p>
              </div>
              <div
                className="flex h-[66px] w-full shrink-0 items-center"
                data-name="List"
              >
                {customAgentServiceSteps.map((step, index) => (
                  <Fragment key={step.index}>
                    <div
                      className="flex h-full min-w-0 flex-1 flex-col items-start gap-1"
                      data-name="List Item"
                    >
                      <p className="w-full text-xs leading-4 text-text-inverse/40">
                        {step.index}
                      </p>
                      <p className="w-full text-label text-text-inverse">
                        {step.title}
                      </p>
                      <p className="w-full text-label text-text-inverse/40">
                        {step.description}
                      </p>
                    </div>
                    {index < customAgentServiceSteps.length - 1 && (
                      <div className="relative h-full w-8 shrink-0">
                        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-overlay-white8" />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside
          className="flex h-full w-96 shrink-0 flex-col items-start overflow-hidden bg-bg-white"
          data-name="Login Panel"
        >
          <div
            className="flex w-full shrink-0 flex-col items-start px-8 pb-2 pt-10"
            data-name="Sticky Header"
          >
            <div className="flex w-full shrink-0 items-center justify-center">
              <h2 className="min-w-0 flex-1 text-base font-medium leading-6 text-text-primary">
                定制需求
              </h2>
            </div>
          </div>

          <div
            className="flex min-h-0 w-full flex-1 flex-col items-start gap-6 overflow-y-auto overflow-x-hidden px-8 pb-2 pt-6"
            data-name="Form"
          >
            <div className="flex w-full shrink-0 flex-col items-start gap-2">
              <label className="flex w-full shrink-0 items-center gap-0.5 whitespace-nowrap text-sm leading-5">
                <span className="text-text-danger">*</span>
                <span className="text-text-primary">需求场景</span>
              </label>
              <div className={textareaFrameClassName}>
                <textarea
                  className="scrollbar-none min-h-0 w-full flex-1 resize-none overflow-y-auto bg-transparent text-sm leading-5 text-text-primary placeholder:text-text-placeholder focus:outline-none"
                  maxLength={200}
                  placeholder="例如：希望搭建企业内部知识库问答助手，能够根据公司资料回答员工问题"
                  value={requirement}
                  onChange={(event) => {
                    const nextRequirement = event.target.value;
                    setRequirement(nextRequirement);
                    if (errorField === 'requirement' && nextRequirement.trim().length > 0) {
                      setErrorField(null);
                    }
                  }}
                />
                <p className="w-full text-right text-xs leading-4 text-text-placeholder">
                  {requirement.length}/200
                </p>
              </div>
              {hasRequirementError && (
                <div className="flex w-full items-center gap-1 text-accent-error">
                  <Icon name="CircleAlert" size="2xs" className="shrink-0" />
                  <p className="min-w-0 flex-1 text-xs leading-4">
                    请输入需求场景
                  </p>
                </div>
              )}
            </div>

            <div className="flex w-full shrink-0 flex-col items-start gap-2">
              <label className="flex w-full shrink-0 items-center gap-0.5 whitespace-nowrap text-sm leading-5">
                <span className="text-text-danger">*</span>
                <span className="text-text-primary">联系电话</span>
              </label>
              <InputField
                className="w-full shrink-0"
                error={hasContactError}
                placeholder="请输入手机号或其他有效联系方式"
                value={contact}
                onValueChange={(nextContact) => {
                  setContact(nextContact);
                  if (errorField === 'contact' && nextContact.trim().length > 0) {
                    setErrorField(null);
                  }
                }}
              />
              {hasContactError && (
                <div className="flex w-full items-center gap-1 text-accent-error">
                  <Icon name="CircleAlert" size="2xs" className="shrink-0" />
                  <p className="min-w-0 flex-1 text-xs leading-4">
                    请输入联系电话
                  </p>
                </div>
              )}
            </div>

            <div className="flex w-full shrink-0 flex-col items-start gap-2">
              <label className="flex w-full shrink-0 items-center text-sm leading-5 text-text-primary">
                联系人称呼
              </label>
              <InputField
                className="w-full shrink-0"
                placeholder="请输入您的称呼"
                value={contactName}
                onValueChange={setContactName}
              />
            </div>

            <div className="flex w-full shrink-0 flex-col items-start gap-2">
              <label className="flex w-full shrink-0 items-center text-sm leading-5 text-text-primary">
                企业/团队名称
              </label>
              <InputField
                className="w-full shrink-0"
                placeholder="请输入企业或团队名称"
                value={teamName}
                onValueChange={setTeamName}
              />
            </div>

            <div className="flex w-full shrink-0 flex-col items-start gap-3">
              <p className="flex w-full shrink-0 items-center whitespace-nowrap text-sm leading-5 text-text-primary">
                是否需要本地大模型或私有化部署？
              </p>
              <div className="flex w-full shrink-0 flex-col items-start justify-center gap-2">
                {customAgentDeploymentOptions.map((option, index) => (
                  <button
                    key={option}
                    className="flex w-full shrink-0 items-center gap-2 text-left"
                    type="button"
                    onClick={() => setSelectedDeploymentOption(index)}
                  >
                    <ProjectDetailCheckboxMark
                      checked={selectedDeploymentOption === index}
                    />
                    <span className="min-w-0 flex-1 text-sm leading-5 text-text-primary">
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col items-start gap-3 px-8 pb-8 pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="button"
              onClick={handleSubmitCustomAgentRequest}
            >
              提交需求
            </Button>
            <div className="flex w-full shrink-0 items-center overflow-hidden px-10">
              <p className="min-w-0 flex-1 text-center text-xs leading-4 text-text-hint">
                我们将仅使用您提交的信息与您沟通定制需求，不会用于其他用途。
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
}

function TopAvatarPopover({
  popoverRef,
  anchorRef,
  avatarSrc,
  nickname,
  phone,
  currentAccount,
  accounts,
  selectedAccountId,
  onAccountSelect,
  onLoginMoreAccountsClick,
  onProfileClick,
  onSupportClick,
  onLogoutClick,
}: {
  popoverRef: Ref<HTMLDivElement>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  avatarSrc: string;
  nickname: string;
  phone: string;
  currentAccount: MockAccount | null;
  accounts: MockAccount[];
  selectedAccountId: string | null;
  onAccountSelect: (accountId: string) => void;
  onLoginMoreAccountsClick: () => void;
  onProfileClick: () => void;
  onSupportClick: () => void;
  onLogoutClick: () => void;
}) {
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const menuItems: ReadonlyArray<{
    icon: IconName;
    label: string;
    onClick: () => void;
    selected?: boolean;
  }> = [
    {
      icon: 'ArrowRightLeft',
      label: '切换账号',
      onClick: () => setIsAccountSwitcherOpen((currentValue) => !currentValue),
      selected: isAccountSwitcherOpen,
    },
    { icon: 'UserPen', label: '个人资料', onClick: onProfileClick },
    { icon: 'Headset', label: '联系客服', onClick: onSupportClick },
    { icon: 'SquareArrowRight', label: '退出登录', onClick: onLogoutClick },
  ];

  return (
    <PopoverPanel
      ref={popoverRef}
      width="md"
      anchorRef={anchorRef}
      placement="bottom"
      align="right"
      offset={4}
      boundaryPadding={8}
      constrainHeight={false}
      repositionOnChildrenChange={false}
      shadow="strong"
      className="z-50 overflow-visible"
    >
      {isAccountSwitcherOpen && (
        <AccountSwitcherPopover
          accounts={accounts}
          avatarSrc={avatarSrc}
          nickname={nickname}
          phone={phone}
          selectedAccountId={selectedAccountId}
          onAccountSelect={onAccountSelect}
          onLoginMoreAccountsClick={onLoginMoreAccountsClick}
        />
      )}
      <div className="flex w-full flex-col">
        <div className="flex w-full items-center px-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-button p-2">
            <AccountAvatar account={currentAccount} avatarSrc={avatarSrc} />
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="truncate text-sm leading-5 text-text-primary">
                {getAccountDisplayName(currentAccount, nickname)}
              </p>
              <p className="truncate text-xs leading-4 text-text-secondary">
                {phone}
              </p>
            </div>
          </div>
        </div>

        <PopoverDivider />

        {menuItems.map((item) => (
          <button
            key={item.label}
            className="flex h-9 w-full items-center px-2 text-left"
            type="button"
            onClick={item.onClick}
          >
            <span
              className={[
                'flex h-9 w-full items-center gap-2 rounded-button px-2 text-sm leading-5 text-text-primary hover:bg-bg-soft active:bg-bg-medium',
                item.selected ? '!bg-bg-medium hover:!bg-bg-medium active:!bg-bg-medium' : '',
              ].join(' ')}
            >
              <Icon name={item.icon} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </span>
          </button>
        ))}
      </div>
    </PopoverPanel>
  );
}

function MockDebugPanel({
  currentUser,
  accounts,
  selectedAccountId,
  onClose,
  onLoginWithData,
  onLoginEmptyData,
  onLogout,
  onSelectAccount,
  onResetMessages,
  onResetProjects,
  onResetAccount,
  onAddExtraAccount,
  onResetExtraAccounts,
  onAiWorkstationConnectionStatusChange,
  onResetAiWorkstationConnectionStatus,
  onPushAnnouncement,
  onPushActivity,
}: {
  currentUser: MockUser | null;
  accounts: MockAccount[];
  selectedAccountId: string | null;
  onClose: () => void;
  onLoginWithData: () => void;
  onLoginEmptyData: () => void;
  onLogout: () => void;
  onSelectAccount: (accountId: string) => void;
  onResetMessages: () => void;
  onResetProjects: () => void;
  onResetAccount: () => void;
  onAddExtraAccount: () => void;
  onResetExtraAccounts: () => void;
  onAiWorkstationConnectionStatusChange: (
    status: MockAiWorkstationConnectionStatus,
  ) => void;
  onResetAiWorkstationConnectionStatus: () => void;
  onPushAnnouncement: () => void;
  onPushActivity: () => void;
}) {
  const isLoggedIn = currentUser !== null;
  const statusText =
    currentUser === null
      ? '未登录'
      : currentUser.dataMode === 'empty-data'
        ? '已登录没数据'
        : '已登录有数据';
  const selectedAccount =
    selectedAccountId !== null
      ? accounts.find((account) => account.id === selectedAccountId) ?? null
      : accounts[0] ?? null;
  const accountShortcuts = [
    {
      label: '个人账户',
      account: accounts.find((account) => account.type === 'personal') ?? null,
    },
    {
      label: '企业拥有者',
      account:
        accounts.find(
          (account) =>
            account.type === 'enterprise' && account.enterpriseRole === 'owner',
        ) ?? null,
    },
    {
      label: '企业员工',
      account:
        accounts.find(
          (account) =>
            account.type === 'enterprise' &&
            account.enterpriseRole === 'employee',
        ) ?? null,
    },
  ];

  return (
    <Popover
      width={280}
      position="fixed"
      align="none"
      offset={null}
      padding="none"
      className="bottom-4 left-4 z-[80] p-3 text-sm leading-5"
      role="dialog"
      aria-label="Mock 调试"
    >
      <div className="flex h-8 items-center justify-between">
        <h2 className="font-medium text-text-primary">Mock 调试</h2>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-button hover:bg-bg-soft active:bg-bg-medium"
          type="button"
          aria-label="关闭 Mock 调试"
          onClick={onClose}
        >
          <Icon name="X" />
        </button>
      </div>
      <div className="mt-2 rounded-button bg-bg-soft px-3 py-2 text-xs leading-4 text-text-secondary">
        <p>状态：{statusText}</p>
        <p>账号：{currentUser?.phone ?? '-'}</p>
        <p>
          AI工作站：
          {currentUser
            ? aiWorkstationConnectionStatusLabels[
                currentUser.aiWorkstationConnectionStatus
              ]
            : '-'}
        </p>
        <p>当前账户：{selectedAccount?.name ?? '-'}</p>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <Button variant="secondary" size="sm" onClick={onLogout}>
          切到未登录
        </Button>
        <Button variant="secondary" size="sm" onClick={onLoginWithData}>
          登录有数据账号
        </Button>
        <Button variant="secondary" size="sm" onClick={onLoginEmptyData}>
          登录空数据账号
        </Button>
      </div>
      <div className="mt-3 h-px bg-border-subtle" />
      <div className="mt-3 grid grid-cols-1 gap-2">
        {accountShortcuts.map((shortcut) => (
          <Button
            key={shortcut.label}
            variant="secondary"
            size="sm"
            selected={shortcut.account?.id === selectedAccount?.id}
            disabled={!isLoggedIn || shortcut.account === null}
            onClick={() => {
              if (shortcut.account !== null) {
                onSelectAccount(shortcut.account.id);
              }
            }}
          >
            {shortcut.label}
          </Button>
        ))}
      </div>
      <div className="mt-3 h-px bg-border-subtle" />
      <div className="mt-3 grid grid-cols-1 gap-2">
        {aiWorkstationConnectionStatusOptions.map((status) => (
          <Button
            key={status}
            variant="secondary"
            size="sm"
            selected={currentUser?.aiWorkstationConnectionStatus === status}
            disabled={!isLoggedIn}
            onClick={() => onAiWorkstationConnectionStatusChange(status)}
          >
            {`AI工作站${aiWorkstationConnectionStatusLabels[status]}`}
          </Button>
        ))}
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onResetAiWorkstationConnectionStatus}
        >
          重置连接状态
        </Button>
      </div>
      <div className="mt-3 h-px bg-border-subtle" />
      <div className="mt-3 grid grid-cols-1 gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onResetMessages}
        >
          重置消息数据
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onResetProjects}
        >
          重置项目数据
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onResetAccount}
        >
          重置账户数据
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onAddExtraAccount}
        >
          添加多账号
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onResetExtraAccounts}
        >
          重置多账号
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onPushAnnouncement}
        >
          推送公告
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!isLoggedIn}
          onClick={onPushActivity}
        >
          推送动态
        </Button>
      </div>
    </Popover>
  );
}

function SideNav({
  collapsed,
  showCollapsedToggle,
  activePage,
  messageUnreadCount,
  profileAvatarSrc,
  profileLabel,
  profileNickname,
  profilePhone,
  aiWorkstationConnectionStatus,
  currentAccount,
  accounts,
  selectedAccountId,
  isLoggedIn,
  onToggle,
  onPageChange,
  onLoginClick,
  onAiWorkstationClick,
  onAccountSelect,
  onProfileClick,
  onPolicyClick,
  onSupportClick,
  onLogout,
  onLogoClick,
  onCollapsedMouseEnter,
  onCollapsedMouseLeave,
}: {
  collapsed: boolean;
  showCollapsedToggle: boolean;
  activePage: PageMode;
  messageUnreadCount: number;
  profileAvatarSrc?: string;
  profileLabel: string;
  profileNickname: string;
  profilePhone: string;
  aiWorkstationConnectionStatus: MockAiWorkstationConnectionStatus;
  currentAccount: MockAccount | null;
  accounts: MockAccount[];
  selectedAccountId: string | null;
  isLoggedIn: boolean;
  onToggle: () => void;
  onPageChange: (value: PageMode) => void;
  onLoginClick: () => void;
  onAiWorkstationClick: () => void;
  onAccountSelect: (accountId: string) => void;
  onProfileClick: () => void;
  onPolicyClick: () => void;
  onSupportClick: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onCollapsedMouseEnter: () => void;
  onCollapsedMouseLeave: () => void;
}) {
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profilePopoverRef = useRef<HTMLDivElement | null>(null);
  const aiWorkstationConnected =
    aiWorkstationConnectionStatus === 'connected';
  const aiWorkstationLabel = aiWorkstationConnected
    ? '已连接AI工作站'
    : '连接AI工作站';

  useEffect(() => {
    if (!isProfilePopoverOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;

      if (
        target &&
        (profileButtonRef.current?.contains(target) ||
          profilePopoverRef.current?.contains(target))
      ) {
        return;
      }

      setIsProfilePopoverOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isProfilePopoverOpen]);

  useEffect(() => {
    setIsProfilePopoverOpen(false);
  }, [collapsed]);

  return (
    <aside
      className={[
        'fixed left-0 top-0 z-40 flex h-screen shrink-0 flex-col overflow-hidden overscroll-none bg-bg-medium transition-[width] duration-200 ease-out',
        collapsed ? 'w-[52px]' : 'w-[240px]',
      ].join(' ')}
      onWheelCapture={(event) => event.preventDefault()}
      onTouchMoveCapture={(event) => event.preventDefault()}
      onMouseEnter={() => {
        if (collapsed) onCollapsedMouseEnter();
      }}
      onMouseLeave={() => {
        if (collapsed) onCollapsedMouseLeave();
      }}
    >
      <div
        className={[
          'flex h-14 items-center px-2',
          collapsed ? 'justify-start' : 'justify-between',
        ].join(' ')}
      >
        <Logo
          collapsed={collapsed}
          showCollapsedToggle={showCollapsedToggle}
          onToggle={onToggle}
          onLogoClick={onLogoClick}
        />
        {!collapsed && (
          <button
            className={`flex h-7 w-7 text-text-hint ${sidebarControlButtonClassName}`}
            type="button"
            aria-label="收起侧边栏"
            aria-expanded={!collapsed}
            onClick={onToggle}
          >
            <Icon name="PanelLeft" />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div>
          {navGroups[0].map((item) => {
            const page = 'page' in item ? item.page : undefined;

            return (
              <SidebarItem
                key={item.label}
                {...item}
                active={page === activePage}
                collapsed={collapsed}
                onClick={page ? () => onPageChange(page) : undefined}
              />
            );
          })}
        </div>

        <div className="flex h-3 items-center px-4 py-1.5">
          <div className="h-px w-full bg-border-strong" />
        </div>

        <div>
          {navGroups[1].map((item) => {
            const page = 'page' in item ? item.page : undefined;

            return (
              <SidebarItem
                key={item.label}
                {...item}
                badge={item.label === '消息' ? messageUnreadCount || undefined : undefined}
                active={page === activePage}
                collapsed={collapsed}
                onClick={page ? () => onPageChange(page) : undefined}
              />
            );
          })}
        </div>
      </div>

      <div className="py-1.5">
        <button
          className="flex h-10 w-full items-center px-2 py-0.5"
          type="button"
          aria-label={collapsed ? aiWorkstationLabel : undefined}
          title={collapsed ? aiWorkstationLabel : undefined}
          onClick={onAiWorkstationClick}
        >
          <span
            className={[
              sidebarMenuBaseClassName,
              aiWorkstationConnected ? 'text-accent-teal' : 'text-text-primary',
              'hover:bg-bg-strong',
              collapsed
                ? sidebarMenuCollapsedClassName
                : sidebarMenuExpandedClassName,
            ].join(' ')}
          >
            <img
              className={[
                'h-4 w-4 shrink-0',
                aiWorkstationConnected ? '' : 'brightness-0',
              ].join(' ')}
              src="/assets/home/link-me-logo.svg"
              alt=""
            />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 whitespace-nowrap text-left">
                  {aiWorkstationLabel}
                </span>
                <Icon name={aiWorkstationConnected ? 'Check' : 'ChevronRight'} />
              </>
            )}
          </span>
        </button>
        <SidebarItem
          icon={isLoggedIn ? undefined : 'CircleUserRound'}
          avatarSrc={isLoggedIn ? profileAvatarSrc : undefined}
          avatarAccount={currentAccount}
          label={profileLabel}
          active={isLoggedIn && isProfilePopoverOpen}
          collapsed={collapsed}
          buttonRef={profileButtonRef}
          onClick={
            isLoggedIn
              ? () => setIsProfilePopoverOpen((currentValue) => !currentValue)
              : onLoginClick
          }
        />
        {isLoggedIn && isProfilePopoverOpen && (
          <ProfilePopover
            popoverRef={profilePopoverRef}
            accounts={accounts}
            avatarSrc={profileAvatarSrc ?? '/assets/home/Avatar.png'}
            nickname={profileNickname}
            phone={profilePhone}
            selectedAccountId={selectedAccountId}
            onAccountSelect={(accountId) => {
              setIsProfilePopoverOpen(false);
              onAccountSelect(accountId);
            }}
            onLoginMoreAccountsClick={() => {
              setIsProfilePopoverOpen(false);
              onLoginClick();
            }}
            onProfileClick={() => {
              setIsProfilePopoverOpen(false);
              onProfileClick();
            }}
            onPolicyClick={() => {
              setIsProfilePopoverOpen(false);
              onPolicyClick();
            }}
            onAboutClick={() => {
              setIsProfilePopoverOpen(false);
              window.open('https://www.huizhihuyuai.com', '_blank', 'noopener,noreferrer');
            }}
            onSupportClick={() => {
              setIsProfilePopoverOpen(false);
              onSupportClick();
            }}
            onLogoutClick={() => {
              setIsProfilePopoverOpen(false);
              onLogout();
            }}
          />
        )}
      </div>
    </aside>
  );
}

function ModeTabs({
  viewMode,
  onViewModeChange,
  size = 'lg',
}: {
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  size?: 'sm' | 'lg';
}) {
  const textClassName =
    size === 'lg' ? 'text-lg font-medium leading-7' : 'text-sm font-medium leading-5';

  return (
    <div
      className={[
        'flex items-center',
        size === 'lg' ? 'gap-4' : 'gap-3',
      ].join(' ')}
    >
      <button
        data-account-filter-trigger="true"
        className={[
          textClassName,
          viewMode === 'agents'
            ? 'text-text-primary'
            : 'text-text-hint hover:text-text-secondary active:text-text-primary',
        ].join(' ')}
        type="button"
        onClick={() => onViewModeChange('agents')}
      >
        智能体
      </button>
      <button
        className={[
          textClassName,
          viewMode === 'workflows'
            ? 'text-text-primary'
            : 'text-text-hint hover:text-text-secondary active:text-text-primary',
        ].join(' ')}
        type="button"
        onClick={() => onViewModeChange('workflows')}
      >
        工作流
      </button>
    </div>
  );
}

function MessageModeTabs({
  messageMode,
  unreadCounts,
  onMessageModeChange,
  size = 'lg',
}: {
  messageMode: MessageMode;
  unreadCounts: MessageUnreadCounts;
  onMessageModeChange: (value: MessageMode) => void;
  size?: 'sm' | 'lg';
}) {
  const textClassName =
    size === 'lg' ? 'text-lg font-medium leading-7' : 'text-sm font-medium leading-5';

  return (
    <div
      className={[
        'flex items-center',
        size === 'lg' ? 'gap-4' : 'gap-3',
      ].join(' ')}
    >
      {messageModeTabs.map((tab) => {
        const isActive = messageMode === tab.value;
        const badge = unreadCounts[tab.value] > 0 ? unreadCounts[tab.value] : undefined;

        return (
          <button
            key={tab.value}
            className={[
              textClassName,
              'flex items-center gap-1',
              isActive
                ? 'text-text-primary'
                : 'text-text-hint hover:text-text-secondary active:text-text-primary',
            ].join(' ')}
            type="button"
            onClick={() => onMessageModeChange(tab.value)}
          >
            <span>{tab.label}</span>
            {badge !== undefined && (
              <span
                className={[
                  'flex items-center justify-center rounded-pill bg-accent-red text-text-inverse',
                  size === 'lg'
                    ? 'h-4 min-w-4 px-1 text-xs leading-4'
                    : 'h-3.5 min-w-3.5 px-1 text-label',
                ].join(' ')}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ProjectDetailNavTitle({
  projectTitle,
  onBack,
  isMenuOpen = false,
  onMenuToggle,
  onMenuClose,
  onRename,
  onDelete,
}: {
  projectTitle: string;
  onBack: () => void;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
  onMenuClose?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}) {
  const canOpenMenu = Boolean(onMenuToggle && onRename && onDelete);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative flex h-14 items-center gap-1">
      <button
        className="h-5 shrink-0 text-sm font-medium leading-5 text-text-hint hover:text-text-secondary active:text-text-primary"
        type="button"
        onClick={onBack}
      >
        项目中心
      </button>
      <span className="shrink-0 text-sm leading-5 text-text-hint">／</span>
      <h1 className="max-w-[320px] truncate text-sm font-medium leading-5 text-text-primary">
        {projectTitle}
      </h1>
      <button
        ref={menuTriggerRef}
        className={[
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-button transition-colors',
          isMenuOpen
            ? 'bg-bg-strong text-text-primary'
            : 'text-text-hint hover:bg-bg-medium hover:text-text-primary active:bg-bg-strong active:text-text-primary',
        ].join(' ')}
        type="button"
        aria-label={`${projectTitle} 更多操作`}
        aria-expanded={isMenuOpen}
        onPointerDown={(event) => {
          blurActiveInputControl();
          event.stopPropagation();
          event.preventDefault();
          onMenuToggle?.();
        }}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <Icon name="Ellipsis" />
      </button>
      {isMenuOpen && canOpenMenu && (
        <ProjectCardMenu
          anchorRef={menuTriggerRef}
          ariaLabel={`${projectTitle}项目操作`}
          onRename={() => {
            onMenuClose?.();
            onRename?.();
          }}
          onDelete={() => {
            onMenuClose?.();
            onDelete?.();
          }}
        />
      )}
    </div>
  );
}

function AgentDetailNavTitle({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="relative flex h-14 items-center gap-1"
      data-node-id="4737:22441"
      data-name="Title"
    >
      <button
        className="flex h-5 shrink-0 items-center gap-1 text-sm font-medium leading-5 text-text-hint hover:text-text-secondary active:text-text-primary"
        type="button"
        onClick={onBack}
      >
        <Icon
          name="ChevronLeft"
          size="sm"
          className="shrink-0"
          data-node-id="4737:22442"
        />
        <span className="shrink-0" data-node-id="4737:22444">
          返回
        </span>
      </button>
    </div>
  );
}

function TitleBar({
  activePage,
  viewMode,
  onViewModeChange,
  messageMode,
  notificationMode,
  messagesByMode,
  messageUnreadCount,
  messageUnreadCounts,
  onMessageModeChange,
  onCustomAgentClick,
  onRechargeClick,
  notificationOpen,
  onNotificationToggle,
  onNotificationClose,
  onNotificationModeChange,
  onNotificationMessageClick,
  onNotificationMarkAllRead,
  onNotificationAllMessagesClick,
  unreadMessageIds,
  showModeTabs,
  showDivider,
  sidebarCollapsed,
  isLoggedIn,
  accountsToShow,
  currentAccount,
  selectedAccountId,
  profileAvatarSrc,
  profileNickname,
  profilePhone,
  onLoginClick,
  onSwitchAccountClick,
  onAccountSelect,
  onProfileClick,
  onSupportClick,
  onLogoutClick,
  projectDetailTitle,
  onProjectDetailBack,
  agentDetailTitle,
  onAgentDetailBack,
  projectDetailMenuOpen = false,
  onProjectDetailMenuToggle,
  onProjectDetailMenuClose,
  onProjectDetailRename,
  onProjectDetailDelete,
}: {
  activePage: PageMode;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  messageMode: MessageMode;
  notificationMode: MessageMode;
  messagesByMode: MockMessageByMode;
  messageUnreadCount: number;
  messageUnreadCounts: MessageUnreadCounts;
  onMessageModeChange: (value: MessageMode) => void;
  onCustomAgentClick: () => void;
  onRechargeClick: () => void;
  notificationOpen: boolean;
  onNotificationToggle: () => void;
  onNotificationClose: () => void;
  onNotificationModeChange: (value: MessageMode) => void;
  onNotificationMessageClick: (
    messageMode: MessageMode,
    messageId: string,
  ) => void;
  onNotificationMarkAllRead: (messageMode: MessageMode) => void;
  onNotificationAllMessagesClick: () => void;
  unreadMessageIds: Set<string>;
  showModeTabs: boolean;
  showDivider: boolean;
  sidebarCollapsed: boolean;
  isLoggedIn: boolean;
  accountsToShow: MockAccount[];
  currentAccount: MockAccount | null;
  selectedAccountId: string | null;
  profileAvatarSrc: string;
  profileNickname: string;
  profilePhone: string;
  onLoginClick: () => void;
  onSwitchAccountClick: () => void;
  onAccountSelect: (accountId: string) => void;
  onProfileClick: () => void;
  onSupportClick: () => void;
  onLogoutClick: () => void;
  projectDetailTitle?: string | null;
  onProjectDetailBack?: () => void;
  agentDetailTitle?: string | null;
  onAgentDetailBack?: () => void;
  projectDetailMenuOpen?: boolean;
  onProjectDetailMenuToggle?: () => void;
  onProjectDetailMenuClose?: () => void;
  onProjectDetailRename?: () => void;
  onProjectDetailDelete?: () => void;
}) {
  const showLeftContent =
    showModeTabs || Boolean(projectDetailTitle) || Boolean(agentDetailTitle);
  const notificationTriggerRef = useRef<HTMLDivElement | null>(null);
  const topAvatarButtonRef = useRef<HTMLButtonElement | null>(null);
  const topAvatarPopoverRef = useRef<HTMLDivElement | null>(null);
  const [isTopAvatarPopoverOpen, setIsTopAvatarPopoverOpen] = useState(false);

  useEffect(() => {
    if (!isTopAvatarPopoverOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;

      if (
        target &&
        (topAvatarButtonRef.current?.contains(target) ||
          topAvatarPopoverRef.current?.contains(target))
      ) {
        return;
      }

      setIsTopAvatarPopoverOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isTopAvatarPopoverOpen]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsTopAvatarPopoverOpen(false);
    }
  }, [isLoggedIn]);

  return (
    <header
      className={[
        'fixed right-0 top-0 z-30 flex h-14 shrink-0 items-center justify-end bg-bg-soft px-2 transition-[left] duration-200 ease-out',
        sidebarCollapsed ? 'left-[52px] min-w-[972px]' : 'left-[240px] min-w-[784px]',
        showDivider ? 'shadow-border-bottom-subtle' : '',
      ].join(' ')}
      onWheelCapture={(event) => event.preventDefault()}
      onTouchMoveCapture={(event) => event.preventDefault()}
    >
      <div className="flex h-full min-w-0 flex-1 items-center pl-2">
        <div
          className={[
            'transition-opacity duration-200 ease-out',
            showLeftContent ? 'opacity-100' : 'pointer-events-none opacity-0',
          ].join(' ')}
        >
          {agentDetailTitle ? (
            <AgentDetailNavTitle onBack={onAgentDetailBack ?? (() => undefined)} />
          ) : projectDetailTitle ? (
            <ProjectDetailNavTitle
              projectTitle={projectDetailTitle}
              onBack={onProjectDetailBack ?? (() => undefined)}
              isMenuOpen={projectDetailMenuOpen}
              onMenuToggle={onProjectDetailMenuToggle}
              onMenuClose={onProjectDetailMenuClose}
              onRename={onProjectDetailRename}
              onDelete={onProjectDetailDelete}
            />
          ) : activePage === 'home' ? (
            <ModeTabs
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              size="sm"
            />
          ) : activePage === 'messages' ? (
            <MessageModeTabs
              messageMode={messageMode}
              unreadCounts={messageUnreadCounts}
              onMessageModeChange={onMessageModeChange}
              size="sm"
            />
          ) : (
            <h1 className="text-sm font-medium leading-5 text-text-primary">
              {activePage === 'projects' ? '项目中心' : '计费明细'}
            </h1>
          )}
        </div>
      </div>
      <div
        className="flex h-14 items-center"
      >
        <div className="flex h-14 items-center gap-3 px-1">
          <div ref={notificationTriggerRef} className="relative h-8 w-8 shrink-0">
            <IconButton
              name="Bell"
              variant="secondary"
              surface="soft"
              shape="pill"
              size="md"
              selected={notificationOpen}
              aria-label="通知"
              aria-expanded={notificationOpen}
	              onPointerDown={(event) => {
	                blurActiveInputControl();
	                event.stopPropagation();
	                event.preventDefault();
	                setIsTopAvatarPopoverOpen(false);
	                onNotificationToggle();
	              }}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
            />
            {messageUnreadCount > 0 && (
              <span className="absolute right-px top-px h-1.5 w-1.5 rounded-pill bg-accent-red" />
            )}
          </div>
          {notificationOpen && (
            <NotificationPopover
              tabs={messageModeTabs}
              value={notificationMode}
              messagesByMode={messagesByMode}
              unreadCounts={messageUnreadCounts}
              unreadMessageIds={unreadMessageIds}
              isLoggedIn={isLoggedIn}
              anchorRef={notificationTriggerRef}
              onValueChange={onNotificationModeChange}
              onMessageClick={onNotificationMessageClick}
              onMarkAllRead={onNotificationMarkAllRead}
              onAllMessagesClick={onNotificationAllMessagesClick}
              onClose={onNotificationClose}
            />
          )}
          <Button
            className="whitespace-nowrap"
            variant="agent"
            size="md"
            shape="pill"
            icon="PackagePlus"
            onClick={onCustomAgentClick}
          >
            定制智能体
          </Button>
          <Button
            className="whitespace-nowrap"
            variant="notice"
            size="md"
            shape="pill"
            icon="Plus"
            onClick={onRechargeClick}
          >
            充值
          </Button>
        </div>
        <div
          className={[
            'flex h-14 items-center justify-center px-2',
            isLoggedIn ? 'w-12' : '',
          ].join(' ')}
        >
          {isLoggedIn ? (
            <>
              <button
                ref={topAvatarButtonRef}
                className={[
                  'h-8 w-8 overflow-hidden rounded-pill shadow-avatar-border hover:shadow-[0_0_0_1px_rgb(0_0_0_/_0.08)]',
                  isTopAvatarPopoverOpen
                    ? '!shadow-[0_0_0_1px_rgb(0_0_0_/_0.16)]'
                    : '',
                ].join(' ')}
                type="button"
                aria-label="账户菜单"
                aria-expanded={isTopAvatarPopoverOpen}
	                onPointerDown={(event) => {
	                  blurActiveInputControl();
	                  event.stopPropagation();
	                  event.preventDefault();
	                  onNotificationClose();
	                  setIsTopAvatarPopoverOpen((currentValue) => !currentValue);
	                }}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
              >
                <AccountAvatar account={currentAccount} avatarSrc={profileAvatarSrc} />
              </button>
              {isTopAvatarPopoverOpen && (
                <TopAvatarPopover
                  popoverRef={topAvatarPopoverRef}
                  anchorRef={topAvatarButtonRef}
                  avatarSrc={profileAvatarSrc}
                  nickname={profileNickname}
                  phone={profilePhone}
                  currentAccount={currentAccount}
                  accounts={accountsToShow}
                  selectedAccountId={selectedAccountId}
                  onAccountSelect={(accountId) => {
                    onAccountSelect(accountId);
                    setIsTopAvatarPopoverOpen(false);
                  }}
                  onLoginMoreAccountsClick={() => {
                    setIsTopAvatarPopoverOpen(false);
                    onSwitchAccountClick();
                  }}
                  onProfileClick={() => {
                    setIsTopAvatarPopoverOpen(false);
                    onProfileClick();
                  }}
                  onSupportClick={() => {
                    setIsTopAvatarPopoverOpen(false);
                    onSupportClick();
                  }}
                  onLogoutClick={() => {
                    setIsTopAvatarPopoverOpen(false);
                    onLogoutClick();
                  }}
                />
              )}
            </>
          ) : (
            <Button
              className="h-8 whitespace-nowrap px-4"
              size="md"
              shape="pill"
              onClick={onLoginClick}
            >
              <span>登录</span>
              <span className="-mx-0.5">／</span>
              <span>注册</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}


function HeroBanner() {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [pendingBannerIndex, setPendingBannerIndex] = useState<number | null>(
    null,
  );
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>(
    'left',
  );
  const [isSliding, setIsSliding] = useState(false);
  const slideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current !== null) {
        window.clearTimeout(slideTimeoutRef.current);
      }
    };
  }, []);

  function showBanner(nextIndex: number, direction: 'left' | 'right') {
    if (nextIndex === activeBannerIndex || pendingBannerIndex !== null) {
      return;
    }

    if (slideTimeoutRef.current !== null) {
      window.clearTimeout(slideTimeoutRef.current);
    }

    setPendingBannerIndex(nextIndex);
    setSlideDirection(direction);
    setIsSliding(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsSliding(true);
      });
    });

    slideTimeoutRef.current = window.setTimeout(() => {
      setActiveBannerIndex(nextIndex);
      setPendingBannerIndex(null);
      setIsSliding(false);
    }, 340);
  }

  function showPreviousBanner() {
    showBanner(
      activeBannerIndex === 0 ? heroBanners.length - 1 : activeBannerIndex - 1,
      'right',
    );
  }

  function showNextBanner() {
    showBanner(
      activeBannerIndex === heroBanners.length - 1 ? 0 : activeBannerIndex + 1,
      'left',
    );
  }

  return (
    <div className="group relative h-[220px] min-w-0 flex-1 overflow-hidden rounded-xl">
      <img
        key={`active-banner-${activeBannerIndex}`}
        className={[
          'absolute inset-0 h-full w-full rounded-xl object-cover transition-transform duration-300 ease-out',
          pendingBannerIndex === null || !isSliding
            ? 'translate-x-0'
            : slideDirection === 'left'
              ? '-translate-x-full'
              : 'translate-x-full',
        ].join(' ')}
        src={heroBanners[activeBannerIndex]}
        alt=""
      />
      {pendingBannerIndex !== null && (
        <img
          key={`pending-banner-${pendingBannerIndex}`}
          className={[
            'absolute inset-0 h-full w-full rounded-xl object-cover transition-transform duration-300 ease-out',
            isSliding
              ? 'translate-x-0'
              : slideDirection === 'left'
                ? 'translate-x-full'
                : '-translate-x-full',
          ].join(' ')}
          src={heroBanners[pendingBannerIndex]}
          alt=""
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-overlay-mask opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
      <div className="pointer-events-none absolute left-0 top-0 flex h-[220px] w-20 items-center bg-gradient-to-r from-overlay-edge to-overlay-clear pl-4 pr-6 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
        <button
          className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-pill bg-bg-white/80 text-text-primary hover:bg-bg-white active:bg-bg-white/80"
          type="button"
          aria-label="上一张主横幅"
          onClick={showPreviousBanner}
        >
          <Icon name="ChevronLeft" />
        </button>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 flex h-[220px] w-20 items-center justify-end bg-gradient-to-r from-overlay-clear to-overlay-edge pl-6 pr-4 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
        <button
          className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-pill bg-bg-white/80 text-text-primary hover:bg-bg-white active:bg-bg-white/80"
          type="button"
          aria-label="下一张主横幅"
          onClick={showNextBanner}
        >
          <Icon name="ChevronRight" />
        </button>
      </div>
      <div className="absolute bottom-0 left-1/2 flex h-3.5 -translate-x-1/2 items-end gap-1 py-1.5">
        {heroBanners.map((banner, index) => (
          <span
            key={banner}
            className={[
              'h-0.5 w-2 rounded-pill bg-bg-white',
              index === (pendingBannerIndex ?? activeBannerIndex)
                ? 'opacity-100'
                : 'opacity-60',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="page-section-x flex h-[246px] gap-4 pb-6 pt-0.5">
      <HeroBanner />
      <div className="flex h-[220px] min-w-0 flex-1 gap-4">
        <div className="group relative h-full min-w-0 flex-1 overflow-hidden rounded-xl">
          <img
            className="h-full w-full rounded-xl object-cover"
            src="/assets/home/banner-secondary.png"
            alt=""
          />
          <div className="pointer-events-none absolute inset-0 bg-overlay-mask opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
        </div>
        <div className="group relative h-full min-w-0 flex-1 overflow-hidden rounded-xl">
          <img
            className="h-full w-full rounded-xl object-cover"
            src="/assets/home/banner-tertiary.png"
            alt=""
          />
          <div className="pointer-events-none absolute inset-0 bg-overlay-mask opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
        </div>
      </div>
    </section>
  );
}

function InvoiceModal({
  title = '开具发票',
  description = '请联系客服申请开具发票',
  closeLabel = '关闭开票弹窗',
  onClose,
}: {
  title?: string;
  description?: string;
  closeLabel?: string;
  onClose: () => void;
}) {
  return (
    <InfoModal
      title={title}
      closeLabel={closeLabel}
      description={description}
      media={
        <img
          className="h-56 w-56 shrink-0 object-cover"
          src="/assets/home/invoice-qr.png"
          alt=""
        />
      }
      onClose={onClose}
    />
  );
}

function ProfileModal({
  account,
  avatarSrc,
  nickname,
  presetAvatarSrcs,
  onAvatarChange,
  onAvatarPresetSelect,
  onNicknameChange,
  onClose,
}: {
  account: MockAccount | null;
  avatarSrc: string;
  nickname: string;
  presetAvatarSrcs: readonly string[];
  onAvatarChange: (file: File) => void;
  onAvatarPresetSelect: (src: string) => void;
  onNicknameChange: (nickname: string) => void;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [nicknameHasError, setNicknameHasError] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const overlayPointerStartedRef = useRef(false);
  const isEnterpriseProfile = account?.type === 'enterprise';
  const canSaveProfile = draftNickname.trim().length > 0;
  const enterpriseAvatarPreset = getEnterpriseAvatarPreset(avatarSrc);
  const shouldShowEnterpriseTextAvatar =
    isEnterpriseProfile && (!avatarSrc || isEnterpriseAvatarPreset(avatarSrc));

  const handleAvatarFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      onAvatarChange(file);
      event.target.value = '';
    },
    [onAvatarChange],
  );

  const closeWithAnimation = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 180);
  }, [onClose]);

  const requestClose = useCallback(() => {
    closeWithAnimation();
  }, [closeWithAnimation]);

  const saveAndClose = useCallback(() => {
    if (!canSaveProfile) {
      setNicknameHasError(true);
      return;
    }

    onNicknameChange(draftNickname.trim());
    closeWithAnimation();
  }, [canSaveProfile, closeWithAnimation, draftNickname, onNicknameChange]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        requestClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [requestClose]);

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-bg-black/20 transition-opacity duration-200 ease-out',
        isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      role="presentation"
      onPointerDown={(event) => {
        overlayPointerStartedRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (
          overlayPointerStartedRef.current &&
          event.target === event.currentTarget
        ) {
          requestClose();
        }

        overlayPointerStartedRef.current = false;
      }}
    >
      <div
        className={[
          'flex w-[480px] shrink-0 flex-col items-center overflow-hidden rounded-modal bg-bg-white shadow-card-hover transition-all duration-200 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-end gap-2 pb-2 pl-6 pr-4 pt-4">
          <div className="flex h-full min-w-0 flex-1 items-center">
            <h2
              id="profile-modal-title"
              className="min-w-0 flex-1 text-base font-medium leading-6 text-text-primary"
            >
              {isEnterpriseProfile ? '企业资料' : '个人资料'}
            </h2>
          </div>
          <ModalCloseButton aria-label="关闭个人资料弹窗" onClick={requestClose} />
        </div>

        <div className="flex w-full flex-col items-start justify-center gap-4 px-6 py-4">
          <div className="flex w-full flex-col items-center gap-2">
            <button
              className="group relative h-24 w-24 shrink-0 rounded-pill outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected"
              type="button"
              aria-label={isEnterpriseProfile ? '修改企业头像' : '修改头像'}
              onClick={() => avatarInputRef.current?.click()}
            >
              <div className="absolute inset-0 overflow-hidden rounded-pill shadow-avatar-border">
                {shouldShowEnterpriseTextAvatar ? (
                  <span
                    className={[
                      'flex h-full w-full items-center justify-center rounded-pill text-5xl font-medium',
                      enterpriseAvatarPreset.previewClassName,
                    ].join(' ')}
                  >
                    {getAccountInitial(draftNickname)}
                  </span>
                ) : (
                    <img
                      className="h-full w-full rounded-pill object-cover"
                      src={avatarSrc}
                      alt=""
                    />
                )}
              </div>
              <span className="absolute inset-0 rounded-pill bg-bg-black/0 transition-colors group-hover:bg-bg-black/40 group-active:bg-bg-black/60" />
              <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-pill bg-bg-white shadow-border-strong hover:bg-bg-soft active:bg-bg-medium">
                <Icon name="ImagePlus" size="2xs" strokeWidth={1} />
              </span>
            </button>
            <input
              ref={avatarInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
            />
            <p className="text-center text-xs leading-4 text-text-hint">
              点击修改头像
            </p>
          </div>

          <div
            className="flex w-full items-center justify-center gap-1 py-2"
            aria-label="默认头像"
          >
            {isEnterpriseProfile ? (
              enterpriseAvatarPresets.map((preset) => {
                const isSelected =
                  avatarSrc === preset.value || (!avatarSrc && preset === enterpriseAvatarPresets[0]);

                return (
                  <button
                    key={preset.value}
                    className={[
                      'flex shrink-0 items-center justify-center rounded-pill p-1 transition-shadow',
                      isSelected
                        ? 'shadow-border-selected'
                        : 'hover:shadow-border-strong active:shadow-border-selected',
                    ].join(' ')}
                    type="button"
                    aria-label="选择企业默认头像"
                    aria-pressed={isSelected}
                    onClick={() => onAvatarPresetSelect(preset.value)}
                  >
                    <span
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-pill text-sm font-medium leading-5',
                        preset.previewClassName,
                      ].join(' ')}
                    >
                      {getAccountInitial(draftNickname)}
                    </span>
                  </button>
                );
              })
            ) : (
              presetAvatarSrcs.map((presetAvatarSrc) => {
                const isSelected = avatarSrc === presetAvatarSrc;

                return (
                  <button
                    key={presetAvatarSrc}
                    className={[
                      'flex shrink-0 items-center justify-center rounded-pill p-1 transition-shadow',
                      isSelected
                        ? 'shadow-border-selected'
                        : 'hover:shadow-border-strong active:shadow-border-selected',
                    ].join(' ')}
                    type="button"
                    aria-label="选择默认头像"
                    aria-pressed={isSelected}
                    onClick={() => onAvatarPresetSelect(presetAvatarSrc)}
                  >
                    <img
                      className="h-8 w-8 rounded-pill object-cover"
                      src={presetAvatarSrc}
                      alt=""
                    />
                  </button>
                );
              })
            )}
          </div>

          <div className="flex w-full flex-col items-center gap-2">
            <label
              className="w-full text-sm leading-5 text-text-primary"
              htmlFor="profile-nickname"
            >
              {isEnterpriseProfile ? '企业名称' : '用户昵称'}
            </label>
            <CounterInput
              id="profile-nickname"
              className="w-full"
              value={draftNickname}
              placeholder={isEnterpriseProfile ? '请输入企业名称' : '起个好听的昵称吧！'}
              maxLength={15}
              error={nicknameHasError}
              onValueChange={(nextNickname) => {
                setDraftNickname(nextNickname);
                if (nicknameHasError && nextNickname.trim().length > 0) {
                  setNicknameHasError(false);
                }
              }}
            />
            <p
              className={[
                'w-full text-xs leading-4',
                nicknameHasError ? 'text-accent-error' : 'text-text-hint',
              ].join(' ')}
            >
              {nicknameHasError
                ? '昵称不可为空！'
                : isEnterpriseProfile
                  ? '长度1-15个字符，支持中文、英文、数字、“_”'
                  : '长度1-15个字符，支持中文、英文、数字、“_”'}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-end px-6 pb-6 pt-4">
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="lg" onClick={requestClose}>
              取消
            </Button>
            <Button size="lg" onClick={saveAndClose}>
              确定
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyModal({
  initialTab = 'privacy',
  onClose,
}: {
  initialTab?: PolicyTab;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [activePolicyTab, setActivePolicyTab] =
    useState<PolicyTab>(initialTab);
  const [policyTexts, setPolicyTexts] = useState<Record<PolicyTab, string>>({
    privacy: '',
    agreement: '',
  });
  const closeTimerRef = useRef<number | null>(null);
  const overlayPointerStartedRef = useRef(false);
  const policyTabs: ReadonlyArray<{ value: PolicyTab; label: string }> = [
    { value: 'privacy', label: '隐私政策' },
    { value: 'agreement', label: '服务条款' },
  ];

  useEffect(() => {
    setActivePolicyTab(initialTab);
  }, [initialTab]);

  const closeWithAnimation = useCallback(() => {
    setIsVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPolicyTexts() {
      try {
        const [privacyText, agreementText] = await Promise.all([
          fetch('/assets/legal/privacy-policy.txt').then((response) =>
            response.text(),
          ),
          fetch('/assets/legal/user-agreement.txt').then((response) =>
            response.text(),
          ),
        ]);

        if (!isMounted) {
          return;
        }

        setPolicyTexts({
          privacy: privacyText,
          agreement: agreementText,
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setPolicyTexts({
          privacy: '隐私政策加载失败，请稍后重试。',
          agreement: '用户协议加载失败，请稍后重试。',
        });
      }
    }

    loadPolicyTexts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeWithAnimation();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [closeWithAnimation]);

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-bg-black/40 transition-opacity duration-200 ease-out',
        isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      role="presentation"
      onPointerDown={(event) => {
        overlayPointerStartedRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (
          overlayPointerStartedRef.current &&
          event.target === event.currentTarget
        ) {
          closeWithAnimation();
        }

        overlayPointerStartedRef.current = false;
      }}
    >
      <div
        className={[
          'flex h-[640px] w-[720px] shrink-0 flex-col items-center overflow-hidden rounded-modal bg-bg-white shadow-[0_8px_12px_rgb(0_0_0_/_0.05),0_0_12px_rgb(0_0_0_/_0.05)] transition-all duration-200 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-end gap-2 pb-2 pl-6 pr-4 pt-4">
          <div className="flex h-full min-w-0 flex-1 items-center gap-4">
            {policyTabs.map((tab) => {
              const isActive = activePolicyTab === tab.value;

              return (
                <button
                  key={tab.value}
                  id={tab.value === 'privacy' ? 'policy-modal-title' : undefined}
                  className={[
                    'h-6 shrink-0 text-base font-medium leading-6 transition-colors',
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-hint hover:text-text-secondary active:text-text-primary',
                  ].join(' ')}
                  type="button"
                  onClick={() => setActivePolicyTab(tab.value)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <ModalCloseButton aria-label="关闭政策协议弹窗" onClick={closeWithAnimation} />
        </div>

        <div className="relative flex min-h-0 w-full flex-1 items-start overflow-hidden px-6">
          <div className="h-full w-full overflow-y-auto">
            <div className="w-full whitespace-pre-wrap py-4 text-sm font-normal leading-5 text-text-primary">
              {policyTexts[activePolicyTab] || '文档加载中...'}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-4 bg-bg-white" />
        </div>
      </div>
    </div>
  );
}

function PaymentServiceAgreementModal({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [agreementText, setAgreementText] = useState('');
  const closeTimerRef = useRef<number | null>(null);
  const overlayPointerStartedRef = useRef(false);

  const closeWithAnimation = useCallback(() => {
    setIsVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAgreementText() {
      try {
        const nextAgreementText = await fetch(
          '/assets/legal/payment-service-agreement.txt',
        ).then((response) => response.text());

        if (isMounted) {
          setAgreementText(nextAgreementText);
        }
      } catch {
        if (isMounted) {
          setAgreementText('付费服务协议加载失败，请稍后重试。');
        }
      }
    }

    loadAgreementText();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeWithAnimation();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [closeWithAnimation]);

  return (
    <div
      className={[
        'fixed inset-0 z-[60] flex items-center justify-center bg-bg-black/40 transition-opacity duration-200 ease-out',
        isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      role="presentation"
      onPointerDown={(event) => {
        overlayPointerStartedRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (
          overlayPointerStartedRef.current &&
          event.target === event.currentTarget
        ) {
          closeWithAnimation();
        }

        overlayPointerStartedRef.current = false;
      }}
    >
      <div
        className={[
          'flex h-[640px] w-[720px] shrink-0 flex-col items-center overflow-hidden rounded-modal bg-bg-white shadow-[0_8px_12px_rgb(0_0_0_/_0.05),0_0_12px_rgb(0_0_0_/_0.05)] transition-all duration-200 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-service-agreement-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-end gap-2 pb-2 pl-6 pr-4 pt-4">
          <div className="flex h-full min-w-0 flex-1 items-center gap-4">
            <h2
              id="payment-service-agreement-title"
              className="h-6 shrink-0 text-base font-medium leading-6 text-text-primary"
            >
              付费服务协议
            </h2>
          </div>
          <ModalCloseButton aria-label="关闭付费服务协议弹窗" onClick={closeWithAnimation} />
        </div>

        <div className="relative flex min-h-0 w-full flex-1 items-start overflow-hidden px-6">
          <div className="h-full w-full overflow-y-auto">
            <div className="w-full whitespace-pre-wrap py-4 text-sm font-normal leading-5 text-text-primary">
              {agreementText || '文档加载中...'}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-4 bg-bg-white" />
        </div>
      </div>
    </div>
  );
}

function MarkAllReadModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      title="全部标记为已读？"
      description="确保重要消息已查看，不要漏了哦！"
      confirmText="全部已读"
      closeLabel="关闭全部已读提示"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function LogoutConfirmModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      title="退出登录？"
      description="退出后无法继续使用 Hellome"
      confirmText="退出登录"
      confirmVariant="warning"
      closeLabel="关闭退出登录提示"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

type RechargeOption = {
  amount: number;
  discount?: string;
  label?: string;
  labelTone?: 'dark' | 'red';
};

const rechargeOptions: RechargeOption[] = [
  { amount: 50, discount: '减 2.0 元', label: '限时', labelTone: 'dark' },
  { amount: 100, discount: '减 4.0 元', label: '推荐', labelTone: 'red' },
  { amount: 200, discount: '减 6.0 元', label: '限时', labelTone: 'dark' },
  { amount: 500 },
  { amount: 1000 },
  { amount: 2000 },
  { amount: 5000 },
];

function getRechargeDiscountAmount(discount?: string) {
  const discountAmount = discount?.match(/[\d.]+/)?.[0];
  return discountAmount ? Number(discountAmount) : 0;
}

function RechargeModal({
  onClose,
  onPaymentAgreementClick,
}: {
  onClose: () => void;
  onPaymentAgreementClick: () => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [qrExpiresIn, setQrExpiresIn] = useState(60);
  const [qrRefreshVersion, setQrRefreshVersion] = useState(0);
  const isQrExpired = qrExpiresIn === 0;
  const selectedRechargeOption =
    rechargeOptions.find((option) => option.amount === selectedAmount) ??
    rechargeOptions[0];
  const paymentAmount =
    selectedAmount - getRechargeDiscountAmount(selectedRechargeOption.discount);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQrExpiresIn((currentValue) => Math.max(0, currentValue - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <WorkflowModal
      ariaLabelledBy="recharge-modal-title"
      showCloseButton={false}
      bodyPadding={false}
      panelClassName="h-[560px]"
      bodyScroll="none"
      bodyClassName="h-full"
      onClose={onClose}
    >
      {({ close }) => (
      <div className="relative flex h-full items-start overflow-hidden">
        <div className="relative h-full min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 h-[152px] w-[680px] overflow-hidden">
            <img
              className="h-full w-full object-cover object-top"
              src="/assets/home/recharge-bg.png"
              alt=""
            />
          </div>
          <div className="relative flex h-full min-w-0 flex-col items-center gap-6 overflow-y-auto overflow-x-hidden p-10">
            <div className="relative flex w-full flex-col items-start pb-6 shadow-border-bottom-subtle">
              <div className="flex w-full flex-col gap-2">
                <h2
                  id="recharge-modal-title"
                  className="w-full truncate text-lg font-medium leading-7 text-text-primary"
                >
                  充值
                </h2>
                <p className="text-xs leading-4 text-text-hint">
                  本余额用于抵扣平台提供的 AI 大模型调用费用。系统将根据您选择的模型计费标准，按实际消耗的 Token（字符单位）实时扣费，确保计量精准透明。
                </p>
              </div>
            </div>
            <div className="grid w-full shrink-0 grid-cols-4 gap-2 overflow-hidden">
              {rechargeOptions.map((option) => {
                const isSelected = option.amount === selectedAmount;

                return (
                  <button
                    key={option.amount}
                    className={[
                      'relative flex h-[84px] flex-col items-start rounded-card p-5 text-left transition hover:bg-bg-soft active:bg-bg-medium',
                      isSelected
                        ? 'bg-bg-soft shadow-border-selected-strong'
                        : 'shadow-border-strong',
                    ].join(' ')}
                    type="button"
                    onClick={() => setSelectedAmount(option.amount)}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex h-[26px] items-start gap-0.5">
                        <span className="flex h-[26px] items-end pb-px text-sm leading-5 text-text-primary">
                          ¥
                        </span>
                        <span className="text-lg font-medium leading-7 text-text-primary">
                          {option.amount}
                        </span>
                      </div>
                      {option.discount && (
                        <span className="text-xs leading-4 text-accent-error">
                          {option.discount}
                        </span>
                      )}
                    </div>
                    {option.label && (
                      <span
                        className={[
                          'absolute right-0 top-0 flex h-[18px] items-center justify-center rounded-bl-button rounded-tr-card px-2 text-center text-label text-text-inverse',
                          option.labelTone === 'red' ? 'bg-accent-red' : 'bg-bg-black',
                        ].join(' ')}
                      >
                        {option.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="w-full text-xs leading-4 text-text-hint">
              <ul className="list-disc space-y-1 pl-[18px]">
                <li>API 算力额度属于虚拟商品，专用于接口调用，一经充值不可提现或退款，请按需购买。</li>
                <li>为了保障您的账户安全与充值体验的顺畅，您每月最多可以享受30次充值服务。</li>
                <li>1天内未支付的订单，会自动关闭。</li>
                <li>若充值过程遇到交易问题，请前往相应的第三方支付平台进行确认。</li>
                <li>未成年用户请在监护人陪同下理性充值，避免过度消费。</li>
                <li>充值完成后可前往账户总览查看账户余额。</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="h-full w-[280px] shrink-0 overflow-hidden bg-bg-soft">
          <div className="h-full w-full overflow-y-auto overflow-x-hidden px-6">
            <div className="flex min-h-full w-full flex-col items-center justify-center gap-4 py-14">
            <div className="flex w-full flex-col items-center gap-1">
              <div className="flex w-full items-start justify-center gap-1 text-accent-error">
                <span className="flex h-10 w-2.5 items-end pb-0.5 text-lg font-medium">
                  ¥
                </span>
                <span className="text-4xl font-semibold">
                  {paymentAmount.toFixed(0)}
                </span>
              </div>
              <p className="w-full text-center text-xs leading-4 text-text-primary">
                实际到账 {selectedAmount}元
              </p>
            </div>
            <div className="relative flex h-[180px] w-[180px] shrink-0 items-center justify-center rounded-button bg-bg-white p-3 shadow-border-strong">
              <img
                className="h-full w-full object-cover"
                src={`/assets/home/recharge-qr.png?v=${qrRefreshVersion}`}
                alt=""
              />
              {isQrExpired && (
                <button
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-button bg-bg-white/90 text-text-secondary backdrop-blur-qr transition hover:text-text-primary active:bg-bg-white/90"
                  type="button"
                  onClick={() => {
                    setQrRefreshVersion((currentVersion) => currentVersion + 1);
                    setQrExpiresIn(60);
                  }}
                >
                  <Icon name="RefreshCw" size="lg" />
                  <span className="text-sm leading-5">点击刷新</span>
                </button>
              )}
            </div>
            <p className="w-full text-center text-xs leading-4 text-text-hint">
              {qrExpiresIn}秒后二维码失效
            </p>
            <div className="flex w-full items-center justify-center gap-1 text-xs leading-4 text-text-hint">
              <span>使用</span>
              <img className="h-3 w-3" src="/assets/home/recharge-wepay.svg" alt="" />
              <span>微信/</span>
              <img className="h-3 w-3" src="/assets/home/recharge-alipay.svg" alt="" />
              <span>支付宝</span>
              <span>扫码支付</span>
            </div>
            <div className="w-full text-center text-xs leading-4 text-text-hint">
              <p>
                支付即视为你同意
              </p>
              <button
                className="text-accent-link transition-colors hover:text-accent-blueHover active:text-accent-linkBlueActive"
                type="button"
                onClick={onPaymentAgreementClick}
              >
                《付费服务协议》
              </button>
            </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 flex items-center justify-end pb-2 pl-2 pr-4 pt-4">
          <ModalCloseButton
            surface="soft"
            aria-label="关闭充值弹窗"
            onClick={close}
          />
        </div>
      </div>
      )}
    </WorkflowModal>
  );
}

function AccountOverviewCards({
  stats,
  onInvoiceClick,
  onRechargeClick,
}: {
  stats: MockAccountStat[];
  onInvoiceClick: () => void;
  onRechargeClick: () => void;
}) {
  return (
    <section className="page-section-x py-6">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-bg-white px-6"
          >
            <div className="flex items-center gap-4 py-6 shadow-border-bottom-subtle">
              <div
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-button',
                  stat.iconClassName,
                ].join(' ')}
              >
                <Icon
                  name={stat.icon as IconName}
                  size="lg"
                  className="fill-current"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-sm font-medium leading-5 text-text-primary">
                  {stat.title}
                </p>
                <p className="truncate text-xs leading-4 text-text-hint">
                  {stat.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {stat.actions.map((action, index) => (
                  <Button
                    key={action}
                    className="h-8 px-4"
                    size="md"
                    variant={index === stat.actions.length - 1 ? 'primary' : 'secondary'}
                    onClick={
                      action === '去开票'
                        ? onInvoiceClick
                        : action === '充值'
                          ? onRechargeClick
                          : undefined
                    }
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-8 py-6">
              {stat.metrics.map(([label, value]) => {
                const [amount, unit] = value.split(' ');

                return (
                  <div key={label} className="flex min-w-0 flex-col gap-1">
                    <p className="truncate text-xs leading-4 text-text-secondary">
                      {label}
                    </p>
                    <p className="truncate font-medium leading-6 text-text-primary">
                      <span className="text-base">{amount}</span>
                      {unit && <span className="ml-1 text-sm">{unit}</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BillingTabs({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: string;
  onActiveTabChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {billingTabs.map((tab) => (
        <button
          key={tab}
          className={[
            'flex h-5 items-center gap-0.5 text-sm font-medium leading-5',
            activeTab === tab
              ? 'text-text-primary'
              : 'text-text-hint hover:text-text-secondary active:text-text-primary',
          ].join(' ')}
          type="button"
          onClick={() => onActiveTabChange(tab)}
        >
          <span>{tab}</span>
          <Tooltip content={billingTabTooltips[tab]}>
            <Icon name="Info" size="2xs" />
          </Tooltip>
        </button>
      ))}
    </div>
  );
}

function DatePickerPopover({
  value,
  onValueChange,
  onClose,
  anchorRef,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => parseDateValue(value));
  const selectedDate = parseDateValue(value);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const today = new Date();
  const todayStartTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      key: `empty-${index}`,
      day: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `day-${index + 1}`,
      day: index + 1,
    })),
  ];

  return (
    <Popover
      data-account-filter-popover="true"
      width={280}
      padding="none"
      anchorRef={anchorRef}
      align="auto"
      placement="auto"
      constrainHeight={false}
      className="p-3"
    >
      <div className="flex h-10 items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-button text-text-primary hover:bg-bg-soft active:bg-bg-medium"
            type="button"
            aria-label="上个月"
            onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))}
          >
            <Icon name="ArrowLeft" />
          </button>
        </div>
        <div className="flex h-10 w-40 items-center justify-center text-sm font-medium leading-5 text-text-primary">
          {year}年{month + 1}月
        </div>
        <div className="flex h-10 w-10 items-center justify-center">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-button text-text-primary hover:bg-bg-soft active:bg-bg-medium"
            type="button"
            aria-label="下个月"
            onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))}
          >
            <Icon name="ArrowRight" />
          </button>
        </div>
      </div>
      <div className="flex h-4 items-center px-1">
        <div className="h-px w-full bg-border-subtle" />
      </div>
      <div className="grid w-full grid-cols-[repeat(7,32px)] auto-rows-[32px] gap-1 px-1 py-1">
        {weekLabels.map((label) => (
          <div
            key={label}
            className="flex h-8 w-8 items-center justify-center text-sm font-medium leading-5 text-text-hint"
          >
            {label}
          </div>
        ))}
        {dayCells.map((cell) => {
          const cellDate =
            cell.day === null ? null : new Date(year, month, cell.day);
          const isDisabled =
            cellDate !== null && cellDate.getTime() > todayStartTime;
          const isSelected =
            cell.day !== null &&
            !isDisabled &&
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === cell.day;

          return (
            <div
              key={cell.key}
              className="flex h-8 w-8 items-center justify-center"
            >
              {cell.day !== null && (
                <button
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-button text-sm font-medium leading-5',
                    isDisabled
                      ? 'text-text-disabled'
                      : isSelected
                      ? 'bg-bg-black text-text-inverse'
                      : 'text-text-primary hover:bg-bg-soft active:bg-bg-medium',
                  ].join(' ')}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onValueChange(formatDateValue(new Date(year, month, cell.day ?? 1)));
                    onClose();
                  }}
                >
                  {cell.day}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Popover>
  );
}

function DateFilterButton({
  value,
  open,
  onToggle,
  onValueChange,
  onClose,
  width,
}: {
  value: string;
  open: boolean;
  onToggle: () => void;
  onValueChange: (value: string) => void;
  onClose: () => void;
  width: number;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative h-8 flex-none" style={{ width }}>
      <button
        ref={triggerRef}
        data-account-filter-trigger="true"
        className={[
          'flex h-8 w-full items-center gap-2 rounded-button px-4 py-2 text-sm leading-5 text-text-primary shadow-border-strong active:bg-bg-strong',
          open ? 'bg-bg-strong' : 'hover:bg-bg-medium',
        ].join(' ')}
        type="button"
        onPointerDown={(event) => {
          blurActiveInputControl();
          event.preventDefault();
          onToggle();
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return;
          }

          event.preventDefault();
          onToggle();
        }}
      >
        <span className="min-w-0 flex-1 truncate text-left">{value}</span>
        <Icon
          name="Calendar"
          size="sm"
          className={[
            'shrink-0',
            open ? 'text-text-primary' : 'text-text-hint',
          ].join(' ')}
        />
      </button>
      {open && (
        <DatePickerPopover
          value={value}
          onValueChange={onValueChange}
          onClose={onClose}
          anchorRef={triggerRef}
        />
      )}
    </div>
  );
}

function SelectOptionPopover<T extends string>({
  options,
  value,
  onValueChange,
  widthClassName = 'w-[220px]',
  align = 'auto',
  anchorRef,
}: {
  options: readonly T[];
  value: T;
  onValueChange: (value: T) => void;
  widthClassName?: string;
  align?: 'auto' | 'left' | 'right';
  anchorRef?: RefObject<HTMLElement | null>;
}) {
  const widthByClassName: Record<string, PopoverOptionsWidth> = {
    'w-40': 'sm',
    'w-[160px]': 'sm',
    'w-[220px]': 'md',
  };
  const width = widthByClassName[widthClassName] ?? 'md';

  return (
    <PopoverOptions
      data-account-filter-popover="true"
      width={width}
      align={align}
      anchorRef={anchorRef}
    >
      {options.map((option) => {
        const selected = option === value;

        return (
          <PopoverSection key={option}>
            <PopoverItem selected={selected} onClick={() => onValueChange(option)}>
              {option}
            </PopoverItem>
          </PopoverSection>
        );
      })}
    </PopoverOptions>
  );
}

function AccountKeyPopover({
  value,
  onValueChange,
  anchorRef,
}: {
  value: (typeof accountKeyOptions)[number];
  onValueChange: (value: (typeof accountKeyOptions)[number]) => void;
  anchorRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <SelectOptionPopover
      options={accountKeyOptions}
      value={value}
      onValueChange={onValueChange}
      anchorRef={anchorRef}
    />
  );
}

function AccountFilterBar({
  activeTab,
  onActiveTabChange,
  searchValue,
  onSearchValueChange,
}: {
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}) {
  const [dateRange, setDateRange] = useState(createDefaultDateRange);
  const [openFilterPopover, setOpenFilterPopover] = useState<
    'startDate' | 'endDate' | 'apiKey' | null
  >(null);
  const [selectedApiKey, setSelectedApiKey] =
    useState<(typeof accountKeyOptions)[number]>('全部APIKey');
  const filterBarRef = useRef<HTMLDivElement>(null);
  const apiKeyMeasureRef = useRef<HTMLSpanElement>(null);
  const apiKeyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [filterLayout, setFilterLayout] = useState({
    apiKeyWidth: 100,
    dateWidth: 160,
    searchWidth: 240,
  });

  useLayoutEffect(() => {
    const filterBarElement = filterBarRef.current;

    if (!filterBarElement) {
      return undefined;
    }

    function updateFilterLayout() {
      const currentFilterBarElement = filterBarRef.current;

      if (!currentFilterBarElement) {
        return;
      }

      const filterBarWidth =
        currentFilterBarElement.getBoundingClientRect().width;
      const apiKeyMeasureElement = apiKeyMeasureRef.current;
      const measuredApiKeyTextWidth = Math.max(
        apiKeyMeasureElement?.scrollWidth ?? 0,
        apiKeyMeasureElement?.getBoundingClientRect().width ?? 0,
      );
      const apiKeyTextWidth = Math.ceil(
        measuredApiKeyTextWidth || selectedApiKey.length * 10,
      );
      const apiKeyNaturalWidth = Math.max(100, apiKeyTextWidth + 56);
      const outerGapWidth = 16;
      const leftStaticWidth = 61;
      const defaultDateWidth = 160;
      const minDateWidth = 140;
      const defaultSearchWidth = 240;
      const minSearchWidth = 128;

      let dateWidth = defaultDateWidth;
      let apiKeyWidth = apiKeyNaturalWidth;
      let searchWidth = defaultSearchWidth;
      let shortage =
        defaultDateWidth * 2 +
        leftStaticWidth +
        apiKeyNaturalWidth +
        outerGapWidth +
        defaultSearchWidth -
        filterBarWidth;

      if (shortage > 0) {
        const dateShrink = Math.min(
          (defaultDateWidth - minDateWidth) * 2,
          shortage,
        );
        dateWidth = defaultDateWidth - dateShrink / 2;
        shortage -= dateShrink;
      }

      if (shortage > 0) {
        const apiKeyShrink = Math.min(apiKeyNaturalWidth - 100, shortage);
        apiKeyWidth = apiKeyNaturalWidth - apiKeyShrink;
        shortage -= apiKeyShrink;
      }

      if (shortage > 0) {
        const searchShrink = Math.min(
          defaultSearchWidth - minSearchWidth,
          shortage,
        );
        searchWidth = defaultSearchWidth - searchShrink;
      }

      setFilterLayout((currentLayout) => {
        const nextLayout = {
          apiKeyWidth: Math.round(apiKeyWidth),
          dateWidth: Math.round(dateWidth),
          searchWidth: Math.round(searchWidth),
        };

        if (
          currentLayout.apiKeyWidth === nextLayout.apiKeyWidth &&
          currentLayout.dateWidth === nextLayout.dateWidth &&
          currentLayout.searchWidth === nextLayout.searchWidth
        ) {
          return currentLayout;
        }

        return nextLayout;
      });
    }

    updateFilterLayout();

    const resizeObserver = new ResizeObserver(updateFilterLayout);
    resizeObserver.observe(filterBarElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedApiKey]);

  useEffect(() => {
    if (openFilterPopover === null) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest('[data-account-filter-popover="true"]') ||
        target?.closest('[data-account-filter-trigger="true"]')
      ) {
        return;
      }

      setOpenFilterPopover(null);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [openFilterPopover]);

  return (
      <section className="page-section-x sticky top-14 z-20 bg-bg-soft">
        <div className="account-billing-tabs-bar flex items-center shadow-border-bottom-default">
          <BillingTabs
            activeTab={activeTab}
            onActiveTabChange={onActiveTabChange}
          />
        </div>
        <div
          ref={filterBarRef}
          className="home-filter-bar relative flex items-center justify-between gap-4"
        >
          <span
            ref={apiKeyMeasureRef}
            className="invisible pointer-events-none absolute left-0 top-0 whitespace-nowrap text-sm leading-5"
            aria-hidden="true"
          >
            {selectedApiKey}
          </span>
          <div className="flex min-w-0 flex-none items-center gap-3">
            <DateFilterButton
              value={dateRange.startDate}
              open={openFilterPopover === 'startDate'}
              width={filterLayout.dateWidth}
              onToggle={() =>
                setOpenFilterPopover((currentPopover) =>
                  currentPopover === 'startDate' ? null : 'startDate',
                )
              }
              onValueChange={(value) =>
                setDateRange((currentRange) => ({
                  ...currentRange,
                  startDate: value,
                }))
              }
              onClose={() => setOpenFilterPopover(null)}
            />
            <span className="text-xs leading-4 text-text-secondary">至</span>
            <DateFilterButton
              value={dateRange.endDate}
              open={openFilterPopover === 'endDate'}
              width={filterLayout.dateWidth}
              onToggle={() =>
                setOpenFilterPopover((currentPopover) =>
                  currentPopover === 'endDate' ? null : 'endDate',
                )
              }
              onValueChange={(value) =>
                setDateRange((currentRange) => ({
                  ...currentRange,
                  endDate: value,
                }))
              }
              onClose={() => setOpenFilterPopover(null)}
            />
            <div className="h-[15px] w-px shrink-0 bg-border-strong" />
            <div
              className="relative h-8 flex-none"
              style={{ width: filterLayout.apiKeyWidth }}
            >
              <button
                ref={apiKeyTriggerRef}
                data-account-filter-trigger="true"
                className={[
                  'flex h-8 w-full items-center gap-2 rounded-button px-4 py-2 text-sm leading-5 text-text-primary shadow-border-strong active:bg-bg-strong',
                  openFilterPopover === 'apiKey' ? 'bg-bg-strong' : 'hover:bg-bg-medium',
                ].join(' ')}
                type="button"
                onPointerDown={(event) => {
                  blurActiveInputControl();
                  event.preventDefault();
                  setOpenFilterPopover((currentPopover) =>
                    currentPopover === 'apiKey' ? null : 'apiKey',
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') {
                    return;
                  }

                  event.preventDefault();
                  setOpenFilterPopover((currentPopover) =>
                    currentPopover === 'apiKey' ? null : 'apiKey',
                  );
                }}
              >
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                  {selectedApiKey}
                </span>
                <Icon
                  name={openFilterPopover === 'apiKey' ? 'ChevronUp' : 'ChevronDown'}
                  className="shrink-0"
                />
              </button>
              {openFilterPopover === 'apiKey' && (
                <AccountKeyPopover
                  value={selectedApiKey}
                  anchorRef={apiKeyTriggerRef}
                  onValueChange={(value) => {
                    setSelectedApiKey(value);
                    setOpenFilterPopover(null);
                  }}
                />
              )}
            </div>
          </div>
          <div
            className="account-search-field h-8 flex-none"
            style={{ width: filterLayout.searchWidth }}
          >
            <SearchInput
              className="account-search-input h-full w-full"
              value={searchValue}
              placeholder="搜索明细"
              aria-label="搜索明细"
              onValueChange={onSearchValueChange}
            />
          </div>
        </div>
      </section>
  );
}

function StickyHeader({
  activePage,
  viewMode,
  onViewModeChange,
  messageMode,
  messageUnreadCounts,
  onMessageModeChange,
  activeTab,
  onActiveTabChange,
  searchValue,
  onSearchValueChange,
  onInvoiceClick,
  onRechargeClick,
  accountStatsToShow,
  onMarkAllReadClick,
  canMarkAllRead,
  onCreateProjectClick,
}: {
  activePage: PageMode;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  messageMode: MessageMode;
  messageUnreadCounts: MessageUnreadCounts;
  onMessageModeChange: (value: MessageMode) => void;
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onInvoiceClick: () => void;
  onRechargeClick: () => void;
  accountStatsToShow: MockAccountStat[];
  onMarkAllReadClick: () => void;
  canMarkAllRead: boolean;
  onCreateProjectClick: () => void;
}) {
  const currentTabs =
    activePage === 'account'
      ? billingTabs
      : activePage === 'messages'
      ? messageTabs
      : activePage === 'projects'
      ? projectTabs
      : viewMode === 'agents'
        ? tabs
        : workflowTabs;
  const searchPlaceholder =
    activePage === 'account'
      ? '搜索明细'
      : activePage === 'messages'
      ? '搜索消息'
      : activePage === 'projects'
      ? '搜索项目'
      : viewMode === 'agents'
        ? '搜索智能体'
        : '搜索工作流';
  const [openSortFilter, setOpenSortFilter] = useState(false);
  const [selectedSortFilter, setSelectedSortFilter] = useState<string>('最热');
  const sortFilterTriggerRef = useRef<HTMLDivElement | null>(null);
  const activeSortFilterOptions =
    activePage === 'projects' ? projectSortFilterOptions : sortFilterOptions;
  const activeSortFilterValue = activeSortFilterOptions.includes(
    selectedSortFilter as never,
  )
    ? selectedSortFilter
    : activeSortFilterOptions[0];

  useEffect(() => {
    if (selectedSortFilter === activeSortFilterValue) {
      return;
    }

    setSelectedSortFilter(activeSortFilterValue);
  }, [activeSortFilterValue, selectedSortFilter]);

  useEffect(() => {
    if (!openSortFilter) return undefined;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest('[data-account-filter-popover="true"]') ||
        target?.closest('[data-sort-filter-trigger="true"]')
      ) {
        return;
      }

      setOpenSortFilter(false);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [openSortFilter]);

  if (activePage === 'account') {
    return (
      <>
        <section className="page-section-x">
          <div className="flex h-[76px] items-center shadow-border-bottom-default">
            <h1 className="text-lg font-medium leading-7 text-text-primary">
              计费明细
            </h1>
          </div>
        </section>
        <AccountOverviewCards
          stats={accountStatsToShow}
          onInvoiceClick={onInvoiceClick}
          onRechargeClick={onRechargeClick}
        />
        <AccountFilterBar
          activeTab={activeTab}
          onActiveTabChange={onActiveTabChange}
          searchValue={searchValue}
          onSearchValueChange={onSearchValueChange}
        />
      </>
    );
  }

  return (
    <>
      <section className="page-section-x">
        <div
          className={[
            'flex border-b border-border-default',
            activePage === 'projects'
              ? 'h-24 items-start py-6'
              : 'h-[76px] items-center py-6',
          ].join(' ')}
        >
          {activePage === 'home' ? (
            <div className="flex h-7 items-center">
              <ModeTabs viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </div>
          ) : activePage === 'messages' ? (
            <div className="flex h-7 items-center">
              <MessageModeTabs
                messageMode={messageMode}
                unreadCounts={messageUnreadCounts}
                onMessageModeChange={onMessageModeChange}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-medium leading-7 text-text-primary">
                项目中心
              </h1>
              <p className="text-xs leading-4 text-text-primary">
                运行中任务 <span className="font-medium">1</span> 个 / 排队中任务{' '}
                <span className="font-medium">0</span> 个
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="page-section-x sticky top-14 z-20 bg-bg-soft">
        <div
          className="home-filter-bar flex items-center justify-between gap-4"
        >
          <TabBar
            items={currentTabs}
            value={activeTab}
            onValueChange={onActiveTabChange}
          />

          <div
            className={[
              'flex h-8 shrink-0 items-center justify-end gap-3',
              activePage === 'projects'
                ? 'w-[384px]'
                : activePage === 'messages'
                  ? 'w-[404px]'
                  : 'w-[284px]',
            ].join(' ')}
          >
            {activePage === 'messages' && activeTab !== '已读' && (
              <ToolbarIconButton
                name="MailCheck"
                surface="soft"
                aria-label="全部已读"
                title="全部已读"
                disabled={!canMarkAllRead}
                onClick={onMarkAllReadClick}
              />
            )}
            {activePage !== 'messages' && (
              <div
                ref={sortFilterTriggerRef}
                className="relative flex h-8 w-8 items-center"
              >
                <ToolbarIconButton
                  data-sort-filter-trigger="true"
                  name="ListFilter"
                  surface="soft"
                  selected={openSortFilter}
                  aria-label="筛选"
                  aria-expanded={openSortFilter}
                  onPointerDown={(event) => {
                    blurActiveInputControl();
                    event.preventDefault();
                    setOpenSortFilter((currentValue) => !currentValue);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    setOpenSortFilter((currentValue) => !currentValue);
                  }}
                />
                {openSortFilter && (
                  <SelectOptionPopover
                    options={activeSortFilterOptions}
                    value={activeSortFilterValue}
                    widthClassName="w-40"
                    anchorRef={sortFilterTriggerRef}
                    onValueChange={(value) => {
                      setSelectedSortFilter(value);
                      setOpenSortFilter(false);
                    }}
                  />
                )}
              </div>
            )}
            <SearchInput
              className="w-60"
              value={searchValue}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onValueChange={onSearchValueChange}
            />
            {activePage === 'projects' && (
              <Button
                className="h-8 w-[88px] shrink-0 px-4"
                size="md"
                onClick={onCreateProjectClick}
              >
                新建项目
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function InteractiveCard({
  heightClassName,
  image,
  contentHeightClassName,
  contentHoverHeightClassName,
  children,
  actions,
  actionsClassName = '',
  ariaLabel,
  onClick,
}: {
  heightClassName: string;
  image: string;
  contentHeightClassName: string;
  contentHoverHeightClassName: string;
  children: ReactNode;
  actions: ReactNode;
  actionsClassName?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const isInteractive = Boolean(onClick);

  return (
    <article
      className={[
        'group relative overflow-hidden rounded-xl transition-shadow duration-200 ease-out hover:shadow-card-hover',
        isInteractive ? 'cursor-pointer' : undefined,
        heightClassName,
      ].filter(Boolean).join(' ')}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;

        event.preventDefault();
        onClick();
      }}
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-110"
          src={image}
          alt=""
        />
      </div>
      <div
        className={[
          'absolute inset-x-0 bottom-0 flex flex-col items-start overflow-hidden rounded-b-xl bg-bg-white transition-[height] duration-200 ease-out',
          contentHeightClassName,
          contentHoverHeightClassName,
        ].join(' ')}
      >
        <div
          className={[
            'flex w-full shrink-0 flex-col items-start justify-center p-4',
            contentHeightClassName,
          ].join(' ')}
        >
          {children}
        </div>
        <div
          className={[
            'flex h-12 w-full shrink-0 overflow-hidden px-4 pb-4 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100',
            actionsClassName,
          ].join(' ')}
          onClick={(event) => event.stopPropagation()}
        >
          {actions}
        </div>
      </div>
    </article>
  );
}

function AgentCard({
  id,
  title,
  description,
  image,
  currentAccount,
  externalRefreshKey,
  onAgentDataChange,
  onOpenDetail,
}: AgentCardData & {
  currentAccount: MockAccount | null;
  externalRefreshKey: number;
  onAgentDataChange: () => void;
  onOpenDetail: () => void;
}) {
  const agentCardData = useMemo(
    () => {
      void externalRefreshKey;

      return getMockAgentDetailData(id, currentAccount?.id ?? null);
    },
    [id, currentAccount?.id, externalRefreshKey],
  );
  const likeValue = agentCardData.stats.like;
  const collectValue = agentCardData.stats.collect;
  const isLiked = agentCardData.accountState.likedAgentIds.includes(id);
  const isCollected = agentCardData.accountState.collectedAgentIds.includes(id);
  const author = agentCardAuthorsById[id] ?? {
    name: 'HelloMe官方',
    avatar: hellomeOfficialAvatar,
  };

  function handleToggleLike(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    toggleMockAgentReaction(id, currentAccount?.id ?? null, 'like');
    onAgentDataChange();
  }

  function handleToggleCollect(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    toggleMockAgentReaction(id, currentAccount?.id ?? null, 'collect');
    onAgentDataChange();
  }

  return (
    <InteractiveCard
      heightClassName="h-[304px]"
      image={image}
      contentHeightClassName="h-[144px]"
      contentHoverHeightClassName="group-hover:h-[192px]"
      ariaLabel={`查看${title}详情`}
      onClick={onOpenDetail}
      actions={
        <Button
          className="w-full"
          size="md"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          使用智能体
        </Button>
      }
    >
        <div
          className="flex h-full w-full flex-col items-start justify-end gap-2"
          data-node-id="4755:15356"
          data-name="Content"
        >
          <div
            className="flex w-full shrink-0 flex-col items-start gap-1"
            data-node-id="4755:15357"
            data-name="Text container"
          >
            <div
              className="flex w-full shrink-0 items-start"
              data-node-id="4755:15358"
              data-name="title"
            >
              <h3
                className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-text-primary"
                data-node-id="4755:15359"
              >
                {title}
              </h3>
            </div>
            <div
              className="flex w-full shrink-0 items-start"
              data-node-id="4755:15360"
              data-name="Body Text"
            >
              <p
                className="line-clamp-2 min-w-0 flex-1 text-xs leading-4 text-text-hint"
                data-node-id="4755:15361"
              >
                {description}
              </p>
            </div>
          </div>
          <div
            className="flex h-4 w-full shrink-0 items-center"
            data-node-id="4755:15362"
            data-name="Divider"
          >
            <div className="h-px w-full bg-border-subtle" />
          </div>
          <div
            className="flex w-full shrink-0 items-center gap-2"
            data-node-id="4755:15364"
            data-name="user"
          >
            <div
              className="flex min-w-0 flex-1 items-center gap-2"
              data-node-id="4755:15365"
              data-name="published-user"
            >
              <div
                className="h-4 w-4 shrink-0 overflow-hidden rounded-pill"
                data-node-id="4755:15366"
                data-name="Avatar"
              >
                <img
                  className="h-full w-full object-cover"
                  src={author.avatar}
                  alt=""
                />
              </div>
              <div
                className="flex shrink-0 items-center justify-center"
                data-node-id="4755:15368"
                data-name="Name"
              >
                <p
                  className="whitespace-nowrap text-xs leading-4 text-text-secondary"
                  data-node-id="4755:15369"
                >
                  {author.name}
                </p>
              </div>
            </div>
            <div
              className="flex shrink-0 items-center justify-end gap-4"
              data-node-id="4755:15370"
              data-name="data-info"
            >
              <button
                className={[
                  'flex h-4 shrink-0 items-center gap-1 transition-colors',
                  isLiked ? 'text-accent-red' : 'text-text-secondary hover:text-text-primary',
                ].join(' ')}
                data-name="like"
                type="button"
                onClick={handleToggleLike}
              >
                <span
                  className="flex h-[13px] w-[13px] shrink-0 items-center justify-center"
                  data-node-id="4755:15372"
                  data-name="lucide/heart"
                >
                  <Icon
                    name="Heart"
                    size="agent-card"
                    className={isLiked ? 'fill-current' : undefined}
                  />
                </span>
                <span
                  className="whitespace-nowrap text-xs leading-4"
                  data-node-id="4755:15374"
                >
                  {likeValue}
                </span>
              </button>
              <button
                className={[
                  'flex h-4 shrink-0 items-center gap-1 transition-colors',
                  isCollected ? 'text-accent-orange' : 'text-text-secondary hover:text-text-primary',
                ].join(' ')}
                data-name="collect"
                type="button"
                onClick={handleToggleCollect}
              >
                <span
                  className="flex h-[13px] w-[13px] shrink-0 items-center justify-center"
                  data-node-id="4755:15376"
                  data-name="lucide/star"
                >
                  <Icon
                    name="Star"
                    size="agent-card"
                    className={isCollected ? 'fill-current' : undefined}
                  />
                </span>
                <span
                  className="whitespace-nowrap text-xs leading-4"
                  data-node-id="4755:15378"
                >
                  {collectValue}
                </span>
              </button>
            </div>
          </div>
        </div>
    </InteractiveCard>
  );
}

type AgentDetailVariant = 'empty' | 'commented';

type AgentDetailStat = {
  nodeIds: [string, string, string];
  name: MockAgentStatName;
  value: string;
  label: string;
};

type AgentCommentItem = MockAgentCommentItem;

const hzCanvasCovers = [
  '/assets/home/agents/card-1.png',
  '/assets/home/agents/card-4.png',
  '/assets/home/agents/card-5.png',
];

const agentCoverImagesById: Partial<Record<string, string[]>> = {
  'hz-canvas': hzCanvasCovers,
  'moneyprinterturbo-local-hermes': [
    '/assets/home/agents/card-2.png',
    '/assets/home/agents/card-3.png',
    '/assets/home/agents/card-6.png',
  ],
};

const hzCanvasDetailDescription = [
  'Hz Canvas 是一个面向图片与视频创作的无限画布工具，它把素材管理、灵感整理、AI 图像生成、视频分镜和项目批注整合在同一个工作空间里。你可以把参考图、角色设定、脚本片段、镜头草图和生成结果放在同一张画布中，通过拖拽建立素材之间的关系，让创作过程不再被零散文件和反复切换的软件打断。对于需要长时间推进的内容项目，画布会保留每一次尝试、每一个版本和每一条批注，方便你随时回到某个节点继续扩展。',
  '在实际使用中，Hz Canvas 适合短视频脚本、广告分镜、角色设定、产品概念图、品牌视觉探索和内容矩阵的批量创作。创作者可以先把灵感与素材收集到画布里，再围绕不同主题拆分区域，记录提示词、生成参数、画面方向和后续修改意见。团队协作时，成员可以围绕同一份素材上下文讨论问题，补充参考，沉淀可复用的工作流。相比只保存最终图片，它更重视创作过程中的上下文，帮助团队知道每张图为什么这样生成、下一步应该往哪里调整。你也可以把不同方向的尝试并排摆放，快速比较构图、色彩、角色动作和镜头节奏，再把最终选定的版本继续延展成完整的视频分镜或成组素材。',
  '当项目资料越来越多时，Hz Canvas 会帮助你把素材按照主题、场景、用途和阶段组织起来，减少反复查找、复制粘贴和重新说明背景的时间。你可以把成熟的提示词、镜头模板、风格参考和审核意见沉淀下来，在后续项目中继续复用。对于需要连续产出的内容团队，它可以把零散想法变成可追踪的创作流程：从灵感收集、画面生成、镜头拆分，到视频草稿和最终交付，每一步都能在画布上保留上下文，方便回溯、修改和继续扩展。',
].join('\n\n');

const agentDetailConfigs: Record<AgentDetailVariant, {
  title: string;
  subtitle: string;
  banner: string;
  authorAvatar: string;
  inputAvatar: string;
  description: string;
  contentAreaHeightClassName: string;
  bodyWrapNodeId?: string;
  bodyWrapName?: string;
  bodyWrapHeightClassName?: string;
  bodyTextNodeId: string;
  bodyTextInnerNodeId: string;
  commentsNodeId: string;
  commentsHeightClassName: string;
  titleBarNodeId: string;
  commentsTitleNodeId: string;
  commentsTitleTextNodeId: string;
  engageNodeId: string;
  engageAvatarNodeId: string;
  inputBoxNodeId: string;
  inputTextareaNodeId: string;
  inputTextNodeId: string;
  inputRightNodeId: string;
  inputButtonNodeId: string;
  commentsContainerNodeId: string;
  stats: AgentDetailStat[];
}> = {
  empty: {
    title: '公众号文章一键排版',
    subtitle: '图像与音视频',
    banner: '/assets/agents/detail-banner.png',
    authorAvatar: hellomeOfficialAvatar,
    inputAvatar: '/assets/agents/comment-avatar.png',
    description:
      '输入一个主题，它会自动抓取相关资讯，生成文章、配图和排版内容，并可将成品保存到公众号草稿箱，减少查资料、写文章和排版的时间。',
    contentAreaHeightClassName: 'h-[640px]',
    bodyTextNodeId: '4737:22491',
    bodyTextInnerNodeId: '4737:22492',
    commentsNodeId: '4737:22493',
    commentsHeightClassName: 'h-[337px]',
    titleBarNodeId: '4737:22494',
    commentsTitleNodeId: '4737:22495',
    commentsTitleTextNodeId: '4737:22496',
    engageNodeId: '4737:22497',
    engageAvatarNodeId: '4737:22498',
    inputBoxNodeId: '4737:22500',
    inputTextareaNodeId: '4737:22501',
    inputTextNodeId: '4737:22502',
    inputRightNodeId: '4737:22503',
    inputButtonNodeId: '4737:22504',
    commentsContainerNodeId: '4737:22505',
    stats: [
      { nodeIds: ['4737:22660', '4737:22661', '4737:22662'], name: 'comments', value: '0', label: '评论' },
      { nodeIds: ['4737:22655', '4737:22656', '4737:22657'], name: 'like', value: '0', label: '获赞' },
      { nodeIds: ['4737:22665', '4737:22666', '4737:22667'], name: 'collect', value: '0', label: '收藏' },
      { nodeIds: ['4737:22670', '4737:22671', '4737:22672'], name: 'share', value: '0', label: '分享' },
    ],
  },
  commented: {
    title: 'Hz Canvas无限画布',
    subtitle: '图像与音视频',
    banner: '/assets/agents/canvas-banner.png',
    authorAvatar: hellomeOfficialAvatar,
    inputAvatar: '/assets/agents/canvas-comment-avatar-1.png',
    description:
      '大型语言模型32，支持高性能绘图平台，适用于手绘、写实、抽象、水彩等多种风格，提供超高清质量，快速生成精美图像。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。',
    contentAreaHeightClassName: 'h-auto',
    bodyWrapNodeId: '4740:24397',
    bodyWrapName: 'content-wrap prompt',
    bodyWrapHeightClassName: 'h-auto',
    bodyTextNodeId: '4740:24398',
    bodyTextInnerNodeId: '4740:24399',
    commentsNodeId: '4727:18756',
    commentsHeightClassName: 'h-[793px]',
    titleBarNodeId: '4731:19248',
    commentsTitleNodeId: '4734:19638',
    commentsTitleTextNodeId: '4731:19249',
    engageNodeId: '4727:18759',
    engageAvatarNodeId: '4727:19062',
    inputBoxNodeId: '4737:23796',
    inputTextareaNodeId: '4737:23797',
    inputTextNodeId: '4737:23798',
    inputRightNodeId: '4737:23799',
    inputButtonNodeId: '4737:23800',
    commentsContainerNodeId: '4731:19244',
    stats: [
      { nodeIds: ['4727:18888', '4727:18889', '4727:18890'], name: 'comments', value: '512', label: '评论' },
      { nodeIds: ['4727:18883', '4727:18884', '4727:18885'], name: 'like', value: '210', label: '获赞' },
      { nodeIds: ['4727:18893', '4727:18894', '4727:18895'], name: 'collect', value: '98', label: '收藏' },
      { nodeIds: ['4727:18898', '4727:18899', '4727:18900'], name: 'share', value: '24', label: '分享' },
    ],
  },
};

function AgentCommentRow({
  comment,
  onLikeClick,
  onReplyClick,
}: {
  comment: AgentCommentItem;
  onLikeClick: (commentId: string) => void;
  onReplyClick: (commentId: string) => void;
}) {
  const isIndented = Boolean(comment.indent);
  const avatarSizeClassName = isIndented ? 'h-6 w-6' : 'h-10 w-10';
  const rowHeightClassName = comment.heightClassName ?? (isIndented ? 'min-h-[76px]' : 'min-h-[92px]');
  const rightHeightClassName = comment.rightHeightClassName ?? 'min-h-[60px]';
  const contentHeightClassName = comment.contentHeightClassName ?? 'min-h-5';
  const topMarginClassName = isIndented ? 'ml-[52px]' : '';

  return (
    <div
      className={`flex ${rowHeightClassName} w-full min-w-0 shrink-0 items-start py-2`}
      data-node-id={comment.nodeId}
      data-name="comment-inner-container"
    >
      <div
        className={[
          topMarginClassName,
          avatarSizeClassName,
          'shrink-0 overflow-hidden rounded-pill',
          comment.avatarSrc
            ? 'shadow-avatar-border'
            : 'bg-bg-black text-text-inverse',
        ].join(' ')}
        data-node-id={comment.avatarNodeId}
        data-name="Avatar"
      >
        {comment.avatarSrc ? (
          <img className="h-full w-full object-cover" src={comment.avatarSrc} alt="" />
        ) : (
          <div
            className={[
              'flex h-full w-full items-center justify-center font-medium',
              isIndented ? 'text-xs leading-4' : 'text-sm leading-5',
            ].join(' ')}
          >
            {comment.avatarText}
          </div>
        )}
      </div>
      <div
        className={`ml-3 flex ${rightHeightClassName} min-w-0 flex-1 flex-col items-start`}
        data-node-id={comment.rightNodeId}
        data-name="right"
      >
        <div
          className="flex h-5 w-full shrink-0 items-center"
          data-node-id={comment.authorWrapperNodeId}
          data-name="author-wrapper"
        >
          <p
            className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary"
            data-node-id={comment.authorNodeId}
            data-name="author"
          >
            {comment.author}
          </p>
          <button
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-text-hint transition-colors hover:bg-bg-hover hover:text-text-primary active:bg-bg-active"
            data-name="Button"
            type="button"
          >
            <Icon name="Ellipsis" size="sm" />
          </button>
        </div>
        <div
          className={`mt-1 flex ${contentHeightClassName} w-full shrink-0 items-start overflow-hidden`}
          data-node-id={comment.commentNodeId}
          data-name="Comment"
        >
          <p className="w-full text-sm leading-5 text-text-primary">{comment.content}</p>
        </div>
        <div
          className="mt-1 flex h-5 w-full shrink-0 items-center"
          data-node-id={comment.dateNodeId}
          data-name="date"
        >
          <p className="text-xs leading-4 text-text-hint">{comment.date}</p>
        </div>
        <div
          className="mt-1 flex h-5 w-full shrink-0 items-center gap-4"
          data-node-id={comment.interactionsNodeId}
          data-name="interactions"
        >
          {comment.actions.map((action) => (
            <button
              key={`${comment.nodeId}-${action.icon}-${action.label}`}
              className={[
                'flex h-4 shrink-0 items-center gap-1 text-xs leading-4 transition-colors',
                action.icon === 'Heart' && comment.isLiked
                  ? 'text-accent-red hover:text-accent-red active:text-accent-red'
                  : 'text-text-hint hover:text-text-primary',
              ].join(' ')}
              type="button"
              onClick={() => {
                if (action.icon === 'MessageCircle') {
                  onReplyClick(comment.nodeId);
                  return;
                }

                if (action.icon === 'Heart') {
                  onLikeClick(comment.nodeId);
                }
              }}
            >
              <Icon
                name={action.icon}
                size="sm"
                className={
                  action.icon === 'Heart' && comment.isLiked
                    ? 'fill-current'
                    : undefined
                }
              />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentReplyInput({
  isIndented,
  value,
  onValueChange,
  onSubmit,
}: {
  isIndented: boolean;
  value: string;
  onValueChange: (nextValue: string) => void;
  onSubmit: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasValue = value.trim().length > 0;
  const offsetClassName = isIndented ? 'pl-[88px]' : 'pl-[52px]';

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = '22px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 102)}px`;
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className={`flex w-full min-w-0 shrink-0 items-start pb-4 pt-2 ${offsetClassName}`}
      data-node-id="4737:24067"
      data-name="reply-input-container"
    >
      <div
        className="flex max-h-[110px] min-h-10 min-w-0 flex-1 items-start gap-4 rounded-lg bg-transparent py-1 pl-4 pr-1 shadow-border-strong transition-shadow hover:shadow-border-hover focus-within:!shadow-border-selected"
        data-node-id="4737:24068"
        data-name="input-box"
      >
        <textarea
          ref={textareaRef}
          className="scrollbar-none min-h-[22px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-[5px] text-sm leading-[22px] text-text-primary outline-none placeholder:text-text-placeholder"
          data-node-id="4737:24069"
          data-name="content-textarea"
          placeholder="回复："
          rows={1}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
        <div
          className="flex w-[60px] shrink-0 self-stretch flex-col items-center justify-center"
          data-node-id="4737:24070"
          data-name="right-btn-area"
        >
          <Button
            size="md"
            variant={hasValue ? 'primary' : 'text'}
            className="h-8 w-[60px] px-4"
            disabled={!hasValue}
            data-node-id="4737:24071"
            onClick={onSubmit}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

function AgentCommentList({
  comments,
  onCommentLikeToggle,
  onReplySubmit,
}: {
  comments: AgentCommentItem[];
  onCommentLikeToggle: (commentId: string) => void;
  onReplySubmit: (commentId: string, content: string) => void;
}) {
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeReplyTargetId, setActiveReplyTargetId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  function toggleReplies(commentId: string) {
    setExpandedCommentIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(commentId)) {
        nextIds.delete(commentId);
      } else {
        nextIds.add(commentId);
      }

      return nextIds;
    });
  }

  function openReplyInput(commentId: string) {
    setActiveReplyTargetId((currentTargetId) => {
      if (currentTargetId === commentId) {
        setReplyDraft('');
        return null;
      }

      setReplyDraft('');
      return commentId;
    });
  }

  function renderCommentWithReplyInput(
    comment: AgentCommentItem,
    rootCommentId: string,
  ) {
    function handleSubmitReply() {
      const normalizedReply = replyDraft.trim();

      if (normalizedReply.length === 0) return;

      onReplySubmit(
        rootCommentId,
        comment.indent ? `回复 ${comment.author}：${normalizedReply}` : normalizedReply,
      );
      setReplyDraft('');
      setActiveReplyTargetId(null);
    }

    return (
      <>
        <AgentCommentRow
          comment={comment}
          onLikeClick={onCommentLikeToggle}
          onReplyClick={openReplyInput}
        />
        {activeReplyTargetId === comment.nodeId && (
          <AgentReplyInput
            isIndented={Boolean(comment.indent)}
            value={replyDraft}
            onValueChange={setReplyDraft}
            onSubmit={handleSubmitReply}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className="flex w-full shrink-0 flex-col items-start gap-4"
        data-node-id="4731:19244"
        data-name="comments-container"
      >
        {comments.map((comment) => {
          const replies = comment.replies ?? [];
          const defaultVisibleReplyCount = comment.defaultVisibleReplyCount ?? 5;
          const isExpanded = expandedCommentIds.has(comment.nodeId);
          const visibleReplies = isExpanded
            ? replies
            : replies.slice(0, defaultVisibleReplyCount);
          const hiddenReplyCount = Math.max(0, replies.length - visibleReplies.length);

          return (
            <div
              key={comment.nodeId}
              className="flex w-full shrink-0 flex-col items-start"
              data-node-id={comment.replies ? '4740:24548' : comment.nodeId}
              data-name="comment-group"
            >
              <div className="flex w-full shrink-0 flex-col items-start" data-name="main-comment">
                {renderCommentWithReplyInput(comment, comment.nodeId)}
              </div>
              {replies.length > 0 && (
                <div
                  className="flex w-full shrink-0 flex-col items-start"
                  data-name="reply-comments"
                >
                  {visibleReplies.map((reply) => (
                    <div key={reply.nodeId} className="flex w-full shrink-0 flex-col items-start" data-name="reply-comment">
                      {renderCommentWithReplyInput(reply, comment.nodeId)}
                    </div>
                  ))}
                  {hiddenReplyCount > 0 && (
                    <div
                      className="flex h-9 w-full shrink-0 items-center py-2 pl-[88px]"
                      data-node-id="4740:24697"
                      data-name="show-more-replies"
                    >
                      <button
                        className="flex h-5 items-center gap-1 text-sm font-medium leading-5 text-accent-commentReply transition-colors hover:text-accent-commentReplyHover active:text-accent-commentReply"
                        type="button"
                        onClick={() => toggleReplies(comment.nodeId)}
                      >
                        展开 {hiddenReplyCount} 条评论
                      </button>
                    </div>
                  )}
                  {isExpanded && replies.length > defaultVisibleReplyCount && (
                    <div
                      className="flex h-9 w-full shrink-0 items-center py-2 pl-[88px]"
                      data-name="show-less-replies"
                    >
                      <button
                        className="flex h-5 items-center gap-1 text-sm font-medium leading-5 text-accent-commentReply transition-colors hover:text-accent-commentReplyHover active:text-accent-commentReply"
                        type="button"
                        onClick={() => toggleReplies(comment.nodeId)}
                      >
                        收起回复
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        className="flex h-[68px] w-full shrink-0 items-center"
        data-node-id="4727:18851"
        data-name="end-container"
      >
        <div className="h-px min-w-0 flex-1 bg-border-default" data-node-id="4727:18852" data-name="Line 26" />
        <p className="mx-4 w-[42px] shrink-0 text-center text-sm leading-5 text-text-hint" data-node-id="4727:18853">
          到底了
        </p>
        <div className="h-px min-w-0 flex-1 bg-border-default" data-node-id="4727:18854" data-name="Line 27" />
      </div>
    </>
  );
}

function AgentDetailPage({
  agent,
  currentAccount,
  externalRefreshKey,
  profileAvatarSrc,
  profileLabel,
}: {
  agent: AgentCardData;
  currentAccount: MockAccount | null;
  externalRefreshKey: number;
  profileAvatarSrc: string;
  profileLabel: string;
}) {
  const [commentDraft, setCommentDraft] = useState('');
  const [coverIndex, setCoverIndex] = useState(0);
  const [pendingCoverIndex, setPendingCoverIndex] = useState<number | null>(null);
  const [coverSlideDirection, setCoverSlideDirection] = useState<'left' | 'right'>('left');
  const [isCoverSliding, setIsCoverSliding] = useState(false);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [canExpandIntro, setCanExpandIntro] = useState(false);
  const [agentDetailRefreshKey, setAgentDetailRefreshKey] = useState(0);
  const [suppressedAgentActionHover, setSuppressedAgentActionHover] =
    useState<AgentActionHoverSuppression>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const introTextRef = useRef<HTMLParagraphElement | null>(null);
  const coverSlideTimeoutRef = useRef<number | null>(null);
  const hasCommentDraft = commentDraft.trim().length > 0;
  const agentDetailData = useMemo(
    () => {
      void agentDetailRefreshKey;
      void externalRefreshKey;

      return getMockAgentDetailData(
        agent.id,
        currentAccount?.id ?? null,
      );
    },
    [agent.id, currentAccount?.id, agentDetailRefreshKey, externalRefreshKey],
  );
  const detailVariant: AgentDetailVariant = agentDetailData.hasData
    ? 'commented'
    : 'empty';
  const detailConfig = agentDetailConfigs[detailVariant];
  const isCommentedDetail = detailVariant === 'commented';
  const detailTitle = agent.title;
  const detailSubtitle =
    'detailSubtitle' in agent ? agent.detailSubtitle : detailConfig.subtitle;
  const detailDescription = isCommentedDetail
    ? agent.id === 'hz-canvas'
      ? hzCanvasDetailDescription
      : agent.description
    : agent.description;
  const coverImages = agentCoverImagesById[agent.id] ?? [agent.image];
  const hasMultipleCoverImages = coverImages.length >= 2;
  const commentCount = agentDetailData.comments.length;
  const detailStats = detailConfig.stats.map((stat) => ({
    ...stat,
    value: agentDetailData.stats[stat.name],
  }));
  const isAgentCollected = agentDetailData.accountState.collectedAgentIds.includes(agent.id);
  const isAgentLiked = agentDetailData.accountState.likedAgentIds.includes(agent.id);
  const currentCommentAuthor = useMemo<MockAgentAuthorInput>(() => {
    if (currentAccount?.type === 'enterprise') {
      return {
        author: currentAccount.name,
        avatarText: getAccountInitial(currentAccount.name),
      };
    }

    return {
      author: profileLabel,
      avatarSrc: profileAvatarSrc,
    };
  }, [currentAccount, profileAvatarSrc, profileLabel]);

  useEffect(() => {
    if (coverSlideTimeoutRef.current !== null) {
      window.clearTimeout(coverSlideTimeoutRef.current);
      coverSlideTimeoutRef.current = null;
    }

    setCoverIndex(0);
    setPendingCoverIndex(null);
    setIsCoverSliding(false);
    setIsIntroExpanded(false);
  }, [agent.id]);

  useEffect(() => {
    return () => {
      if (coverSlideTimeoutRef.current !== null) {
        window.clearTimeout(coverSlideTimeoutRef.current);
      }
    };
  }, []);

  function showCover(nextIndex: number, direction: 'left' | 'right') {
    if (
      !hasMultipleCoverImages ||
      nextIndex === coverIndex ||
      pendingCoverIndex !== null
    ) {
      return;
    }

    if (coverSlideTimeoutRef.current !== null) {
      window.clearTimeout(coverSlideTimeoutRef.current);
    }

    setPendingCoverIndex(nextIndex);
    setCoverSlideDirection(direction);
    setIsCoverSliding(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsCoverSliding(true);
      });
    });

    coverSlideTimeoutRef.current = window.setTimeout(() => {
      setCoverIndex(nextIndex);
      setPendingCoverIndex(null);
      setIsCoverSliding(false);
    }, 340);
  }

  function handlePreviousCover() {
    showCover(
      coverIndex === 0 ? coverImages.length - 1 : coverIndex - 1,
      'right',
    );
  }

  function handleNextCover() {
    showCover(
      coverIndex === coverImages.length - 1 ? 0 : coverIndex + 1,
      'left',
    );
  }

  function handleSelectCover(nextIndex: number) {
    showCover(nextIndex, nextIndex > coverIndex ? 'left' : 'right');
  }

  function refreshAgentDetailData() {
    setAgentDetailRefreshKey((currentKey) => currentKey + 1);
  }

  function handleSubmitComment() {
    const normalizedComment = commentDraft.trim();

    if (normalizedComment.length === 0) return;

    addMockAgentComment(
      agent.id,
      currentAccount?.id ?? null,
      normalizedComment,
      currentCommentAuthor,
    );
    setCommentDraft('');
    refreshAgentDetailData();
  }

  function handleSubmitReply(commentId: string, content: string) {
    addMockAgentReply(
      agent.id,
      currentAccount?.id ?? null,
      commentId,
      content,
      currentCommentAuthor,
    );
    refreshAgentDetailData();
  }

  function handleToggleCommentLike(commentId: string) {
    toggleMockAgentCommentLike(
      agent.id,
      currentAccount?.id ?? null,
      commentId,
    );
    refreshAgentDetailData();
  }

  function handleToggleAgentCollect() {
    toggleMockAgentReaction(agent.id, currentAccount?.id ?? null, 'collect');
    setSuppressedAgentActionHover('collect');
    refreshAgentDetailData();
  }

  function handleToggleAgentLike() {
    toggleMockAgentReaction(agent.id, currentAccount?.id ?? null, 'like');
    setSuppressedAgentActionHover('like');
    refreshAgentDetailData();
  }

  function handleShareAgent() {
    const shareUrl = window.location.href;

    setSuppressedAgentActionHover('share');
    void navigator.clipboard?.writeText(shareUrl).catch(() => {
      const textarea = document.createElement('textarea');

      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    });
  }

  useLayoutEffect(() => {
    const textarea = commentTextareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = '22px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 102)}px`;
  }, [commentDraft]);

  useLayoutEffect(() => {
    function updateCanExpandIntro() {
      const introText = introTextRef.current;

      if (!introText || !isCommentedDetail) {
        setCanExpandIntro(false);
        return;
      }

      setCanExpandIntro(introText.scrollHeight > 228);
    }

    updateCanExpandIntro();
    window.addEventListener('resize', updateCanExpandIntro);

    return () => {
      window.removeEventListener('resize', updateCanExpandIntro);
    };
  }, [detailDescription, isCommentedDetail]);

  return (
    <div className="agent-detail-layout page-section-x flex min-h-[calc(100vh-56px)] w-full justify-center bg-bg-soft">
      <div className="agent-detail-content flex w-full max-w-[1280px] items-start gap-12 py-6">
        <section
          className="flex min-w-0 flex-1 flex-col items-start"
          data-node-id={isCommentedDetail ? '4727:18729' : '4737:22469'}
          data-name="left"
        >
          <div
            className={`flex ${detailConfig.contentAreaHeightClassName} w-full shrink-0 flex-col items-start`}
            data-node-id={isCommentedDetail ? '4727:18730' : '4737:22470'}
            data-name="Content Area"
          >
            <div
              className="flex h-[68px] w-full shrink-0 flex-col items-start"
              data-node-id={isCommentedDetail ? '4727:18731' : '4737:22471'}
              data-name="Heading"
            >
              <div
                className="flex h-8 w-full shrink-0 items-start"
                data-node-id={isCommentedDetail ? '4727:18732' : '4737:22472'}
                data-name="title"
              >
                <h1
                  className="w-full text-2xl font-medium leading-8 text-text-primary"
                  data-node-id={isCommentedDetail ? '4727:18733' : '4737:22473'}
                >
                  {detailTitle}
                </h1>
              </div>
              <div
                className="mt-2 flex h-5 w-full shrink-0 items-start"
                data-node-id={isCommentedDetail ? '4737:21141' : '4737:22474'}
                data-name="Subtitle"
              >
                <p
                  className="w-full text-sm leading-5 text-text-hint"
                  data-node-id={isCommentedDetail ? '4737:21142' : '4737:22475'}
                >
                  {detailSubtitle}
                </p>
              </div>
            </div>

            <div
              className="flex w-full shrink-0 flex-col items-start py-4"
              data-node-id={isCommentedDetail ? '4734:19639' : '4737:22476'}
              data-name="Media Section"
            >
              <div
                className="group/media relative aspect-[892/502] w-full shrink-0 overflow-hidden rounded-xl bg-bg-strong"
                data-node-id={isCommentedDetail ? '4737:23131' : '4737:22477'}
                data-name="Media Container"
              >
                <img
                  key={`active-cover-${agent.id}-${coverIndex}`}
                  className={[
                    'absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out',
                    pendingCoverIndex === null || !isCoverSliding
                      ? 'translate-x-0'
                      : coverSlideDirection === 'left'
                        ? '-translate-x-full'
                        : 'translate-x-full',
                  ].join(' ')}
                  src={coverImages[coverIndex] ?? agent.image}
                  alt=""
                />
                {pendingCoverIndex !== null && (
                  <img
                    key={`pending-cover-${agent.id}-${pendingCoverIndex}`}
                    className={[
                      'absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out',
                      isCoverSliding
                        ? 'translate-x-0'
                        : coverSlideDirection === 'left'
                          ? 'translate-x-full'
                          : '-translate-x-full',
                    ].join(' ')}
                    src={coverImages[pendingCoverIndex] ?? agent.image}
                    alt=""
                  />
                )}
                {hasMultipleCoverImages && (
                  <>
                    <button
                      aria-label="上一张封面"
                      className="absolute left-5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-bg-black/40 text-text-inverse opacity-0 transition-colors transition-opacity duration-150 hover:bg-bg-black/60 group-hover/media:opacity-100"
                      type="button"
                      onClick={handlePreviousCover}
                    >
                      <Icon name="ChevronLeft" size="md" />
                    </button>
                    <button
                      aria-label="下一张封面"
                      className="absolute right-5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-bg-black/40 text-text-inverse opacity-0 transition-colors transition-opacity duration-150 hover:bg-bg-black/60 group-hover/media:opacity-100"
                      type="button"
                      onClick={handleNextCover}
                    >
                      <Icon name="ChevronRight" size="md" />
                    </button>
                  </>
                )}
                {hasMultipleCoverImages && (
                  <div
                    className="absolute bottom-0 left-1/2 flex h-3.5 -translate-x-1/2 items-center gap-1"
                    data-node-id={isCommentedDetail ? '4737:23133' : '4737:22479'}
                    data-name="Indicator"
                  >
                    {coverImages.map((coverImage, index) => (
                      <button
                        key={coverImage}
                        aria-label={`切换到第 ${index + 1} 张封面`}
                        className={[
                          'h-0.5 w-2 rounded-pill transition-colors',
                          index === (pendingCoverIndex ?? coverIndex)
                            ? 'bg-bg-white'
                            : 'bg-bg-white/40',
                        ].join(' ')}
                        type="button"
                        onClick={() => handleSelectCover(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isCommentedDetail ? (
              <div
                className={`flex ${detailConfig.bodyWrapHeightClassName} w-full shrink-0 flex-col items-start`}
                data-node-id={detailConfig.bodyWrapNodeId}
                data-name={detailConfig.bodyWrapName}
              >
                <div
                  className="flex w-full shrink-0 items-start py-2"
                  data-node-id={detailConfig.bodyTextNodeId}
                  data-name="Body Text"
                >
                  <p
                    ref={introTextRef}
                    className={[
                      'flex w-full flex-col gap-2 overflow-hidden text-justify text-sm leading-[22px] text-text-primary',
                      isIntroExpanded || !canExpandIntro ? '' : 'max-h-[228px]',
                    ].join(' ')}
                    data-node-id={detailConfig.bodyTextInnerNodeId}
                  >
                    {detailDescription.split('\n\n').map((paragraph) => (
                      <span key={paragraph}>{paragraph}</span>
                    ))}
                  </p>
                </div>
                {canExpandIntro && (
                  <div
                    className="flex h-9 w-full shrink-0 items-center py-2"
                    data-name="expand-action"
                  >
                    <button
                      className="flex h-5 shrink-0 items-center gap-1 text-sm leading-5 text-text-hint transition-colors hover:text-text-primary"
                      type="button"
                      onClick={() => setIsIntroExpanded((currentValue) => !currentValue)}
                    >
                      {isIntroExpanded ? '收起' : '展开全部'}
                      <Icon name={isIntroExpanded ? 'ChevronUp' : 'ChevronDown'} size="sm" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex h-[38px] w-full shrink-0 items-start py-2"
                data-node-id={detailConfig.bodyTextNodeId}
                data-name="Body Text"
              >
                <p
                  className="w-full text-justify text-sm leading-[22px] text-text-primary"
                  data-node-id={detailConfig.bodyTextInnerNodeId}
                >
                  {detailDescription}
                </p>
              </div>
            )}
          </div>

          <div
            className={`mt-6 flex ${isCommentedDetail ? 'h-auto' : detailConfig.commentsHeightClassName} w-full shrink-0 flex-col items-start`}
            data-node-id={detailConfig.commentsNodeId}
            data-name="comments"
          >
            <div
              className="flex h-14 w-full shrink-0 items-start py-4"
              data-node-id={detailConfig.titleBarNodeId}
              data-name="titleBar"
            >
              <div
                className="flex h-6 w-full shrink-0 items-start"
                data-node-id={detailConfig.commentsTitleNodeId}
                data-name="title"
              >
                <h2
                  className="w-full text-base font-medium leading-6 text-text-primary"
                  data-node-id={detailConfig.commentsTitleTextNodeId}
                >
                  共 {commentCount} 条评论
                </h2>
              </div>
            </div>
            <div
              className="flex min-h-[74px] w-full shrink-0 items-start py-[17px]"
              data-node-id={detailConfig.engageNodeId}
              data-name="interactions engage-bar"
            >
              <div
                className="h-10 w-10 shrink-0 overflow-hidden rounded-pill"
                data-node-id={detailConfig.engageAvatarNodeId}
                data-name="Avatar"
              >
                <AccountAvatar
                  account={currentAccount}
                  avatarSrc={profileAvatarSrc}
                  size="xl"
                />
              </div>
              <div
                className="group ml-3 flex max-h-[110px] min-h-10 min-w-0 flex-1 items-start gap-4 rounded-lg bg-transparent py-1 pl-4 pr-1 shadow-border-strong transition-shadow hover:shadow-border-hover focus-within:!shadow-border-selected"
                data-node-id={detailConfig.inputBoxNodeId}
                data-name="input-box"
              >
                <div
                  className="flex min-h-8 min-w-0 flex-1 items-start"
                  data-node-id={detailConfig.inputTextareaNodeId}
                  data-name="content-textarea"
                >
                  <textarea
                    ref={commentTextareaRef}
                    className="scrollbar-none min-h-[22px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-[5px] text-sm leading-[22px] text-text-primary outline-none placeholder:text-text-placeholder"
                    data-node-id={detailConfig.inputTextNodeId}
                    placeholder="聊聊你的想法"
                    rows={1}
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                  />
                </div>
                <div
                  className="flex w-[60px] shrink-0 self-stretch flex-col items-center justify-center"
                  data-node-id={detailConfig.inputRightNodeId}
                  data-name="right-btn-area"
                >
                  <Button
                    size="md"
                    variant={hasCommentDraft ? 'primary' : 'text'}
                    className="h-8 w-[60px] px-4"
                    data-node-id={detailConfig.inputButtonNodeId}
                    disabled={!hasCommentDraft}
                    onClick={handleSubmitComment}
                  >
                    发送
                  </Button>
                </div>
              </div>
            </div>
            {isCommentedDetail ? (
              <AgentCommentList
                comments={agentDetailData.comments}
                onCommentLikeToggle={handleToggleCommentLike}
                onReplySubmit={handleSubmitReply}
              />
            ) : (
              <div
                className="flex h-52 w-full shrink-0 flex-col items-start"
                data-node-id={detailConfig.commentsContainerNodeId}
                data-name="comments-container"
              >
                <div
                  className="flex h-52 w-full shrink-0 flex-col items-center justify-center rounded-xl px-4 py-12"
                  data-node-id="4737:22826"
                  data-name="Content"
                >
                  <div
                    className="flex h-28 w-80 shrink-0 flex-col items-center justify-center gap-4"
                    data-node-id="4737:22827"
                    data-name="Content"
                  >
                    <div
                      className="h-20 w-20 shrink-0"
                      data-node-id="4737:23146"
                      data-name="Frame"
                    >
                      <img
                        className="h-full w-full object-contain"
                        src="/assets/agents/comments-empty.svg"
                        alt=""
                      />
                    </div>
                    <div
                      className="flex h-4 w-full shrink-0 flex-col items-center"
                      data-node-id="4737:22835"
                      data-name="Text container"
                    >
                      <p
                        className="w-full text-center text-xs leading-4 text-text-hint"
                        data-node-id="4737:22836"
                      >
                        暂无评论，快发表你的意见吧～
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="sr-only">{agent.title}</p>
        </section>

        <aside
          className="flex h-[812px] w-[260px] shrink-0 flex-col items-start gap-6 pt-[84px]"
          data-node-id={isCommentedDetail ? '4727:18855' : '4737:22635'}
          data-name="right"
        >
          <div
            className="flex h-10 w-full shrink-0 items-center gap-3"
            data-node-id={isCommentedDetail ? '4727:18856' : '4737:22636'}
            data-name="author-wrapper"
          >
            <div
              className="flex h-10 min-w-0 flex-1 items-center gap-3"
              data-node-id="4737:22637"
              data-name="published-user"
            >
              <div
                className="h-10 w-10 shrink-0 overflow-hidden rounded-pill"
                data-node-id="4737:22638"
                data-name="Avatar"
              >
                <img
                  className="h-full w-full object-cover"
                  src={detailConfig.authorAvatar}
                  alt=""
                />
              </div>
              <div
                className="flex h-[38px] min-w-0 flex-1 flex-col items-start justify-center gap-0.5"
                data-node-id="4737:22640"
                data-name="user-info"
              >
                <div
                  className="flex h-5 w-full shrink-0 items-center"
                  data-node-id="4737:22641"
                  data-name="Name"
                >
                  <p
                    className="w-full truncate text-sm leading-5 text-text-primary"
                    data-node-id="4737:22642"
                  >
                    HelloMe官方
                  </p>
                </div>
                <div
                  className="flex h-4 shrink-0 items-start gap-2 text-center text-xs leading-4 text-text-hint"
                  data-node-id="4737:22643"
                  data-name="user-count"
                >
                  <div className="flex shrink-0 gap-0.5" data-node-id="4737:22644" data-name="agents">
                    <span data-node-id="4737:22645">智能体</span>
                    <span data-node-id="4737:22646">16</span>
                  </div>
                  <div className="flex shrink-0 gap-0.5" data-node-id="4737:22647" data-name="fans">
                    <span data-node-id="4737:22648">粉丝</span>
                    <span data-node-id="4737:22649">12</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="flex h-6 w-12 shrink-0 items-center"
              data-node-id="4737:22650"
              data-name="user-follow-area"
            >
              <Button
                size="xs"
                className="h-6 w-12 rounded-lg bg-bg-black px-3 text-text-inverse hover:bg-bg-black/80 active:bg-bg-black"
                data-node-id="4737:22651"
              >
                关注
              </Button>
            </div>
          </div>

          <div
            className="flex h-4 w-full shrink-0 items-center"
            data-node-id="4737:22652"
            data-name="Menu Item"
          >
            <div className="h-px w-full bg-border-default" data-node-id="4737:22653" data-name="Divider" />
          </div>

          <div
            className="flex h-9 w-full shrink-0 items-center justify-between text-center"
            data-node-id="4737:22654"
            data-name="data-info"
          >
            {detailStats.map((stat, index) => (
              <Fragment key={stat.name}>
                <div
                  className="flex h-full shrink-0 flex-col items-center justify-center"
                  data-node-id={stat.nodeIds[0]}
                  data-name={stat.name}
                >
                  <p className="text-sm font-medium leading-5 text-text-primary" data-node-id={stat.nodeIds[1]}>{stat.value}</p>
                  <p className="text-xs leading-4 text-text-hint" data-node-id={stat.nodeIds[2]}>{stat.label}</p>
                </div>
                {index < 3 && (
                  <div
                    className="flex h-full w-4 shrink-0 items-center"
                    data-node-id={index === 0 ? '4737:22658' : index === 1 ? '4737:22663' : '4737:22668'}
                    data-name="Vertical Divider"
                  >
                    <div
                      className="mx-auto h-5 w-px bg-border-default"
                      data-node-id={index === 0 ? '4737:22659' : index === 1 ? '4737:22664' : '4737:22669'}
                      data-name="Divider"
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <div
            className="flex h-9 w-full shrink-0 items-center gap-2"
            data-node-id="4737:22673"
            data-name="Actions Wrapper"
          >
            <Button
              className="h-9 w-32 shrink-0 rounded-lg px-[18px]"
              icon="SquareMousePointer"
              size="md"
              data-node-id="4737:22674"
            >
              使用智能体
            </Button>
            <IconButton
              name="Heart"
              size="lg"
              variant="secondary"
              surface="soft"
              className={[
                isAgentLiked ? '!text-accent-red' : undefined,
                suppressedAgentActionHover === 'like'
                  ? 'hover:!bg-transparent'
                  : undefined,
              ].filter(Boolean).join(' ')}
              iconClassName={isAgentLiked ? 'fill-current' : undefined}
              aria-label="点赞"
              data-node-id="4737:22682"
              onClick={handleToggleAgentLike}
              onMouseLeave={() => setSuppressedAgentActionHover(null)}
            />
            <IconButton
              name="Star"
              size="lg"
              variant="secondary"
              surface="soft"
              className={[
                isAgentCollected ? '!text-accent-orange' : undefined,
                suppressedAgentActionHover === 'collect'
                  ? 'hover:!bg-transparent'
                  : undefined,
              ].filter(Boolean).join(' ')}
              iconClassName={isAgentCollected ? 'fill-current' : undefined}
              aria-label="收藏"
              data-node-id="4737:22679"
              onClick={handleToggleAgentCollect}
              onMouseLeave={() => setSuppressedAgentActionHover(null)}
            />
            <IconButton
              name="Share2"
              size="lg"
              variant="secondary"
              surface="soft"
              className={
                suppressedAgentActionHover === 'share'
                  ? 'hover:!bg-transparent'
                  : undefined
              }
              aria-label="分享"
              data-node-id="4737:22686"
              onClick={handleShareAgent}
              onMouseLeave={() => setSuppressedAgentActionHover(null)}
            />
          </div>

          <div
            className="flex h-4 w-full shrink-0 items-center"
            data-node-id="4737:22693"
            data-name="Horizontal Divider"
          >
            <div className="h-px w-full bg-border-default" data-node-id="4737:22694" data-name="Divider" />
          </div>

          <div
            className="flex h-[464px] w-full shrink-0 flex-col items-start"
            data-node-id="4737:22695"
            data-name="Frame 2131333561"
          >
            <div
              className="flex h-[72px] w-full shrink-0 flex-col items-start gap-3"
              data-node-id="4737:22696"
              data-name="updateTime"
            >
              <div className="flex h-5 w-full shrink-0 items-start" data-node-id="4737:22697" data-name="title">
                <p className="w-full text-sm leading-5 text-text-primary" data-node-id="4737:22698">更新</p>
              </div>
              <div className="flex h-10 w-full shrink-0 flex-col items-start gap-2 text-xs leading-4" data-node-id="4737:22699" data-name="Content">
                <div className="flex h-4 w-full shrink-0 items-start gap-4" data-node-id="4737:22700" data-name="List Item">
                  <span className="w-[60px] shrink-0 text-text-hint" data-node-id="4737:22701">最近更新</span>
                  <span className="min-w-0 flex-1 text-right text-text-primary" data-node-id="4737:22702">2026/08/20</span>
                </div>
                <div className="flex h-4 w-full shrink-0 items-start gap-4" data-node-id="4737:22703" data-name="List Item">
                  <span className="w-[60px] shrink-0 text-text-hint" data-node-id="4737:22704">首次发布</span>
                  <span className="min-w-0 flex-1 text-right text-text-primary" data-node-id="4737:22705">2026/08/20</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex h-4 w-full shrink-0 items-center" data-node-id="4737:22706" data-name="Horizontal Divider">
              <div className="h-px w-full bg-border-default" data-node-id="4737:22707" data-name="Divider" />
            </div>

            <div className="mt-4 flex h-24 w-full shrink-0 flex-col items-start gap-3" data-node-id="4737:22708" data-name="Version">
              <div className="flex h-5 w-full shrink-0 items-center" data-node-id="4737:22709" data-name="Title">
                <p className="w-full text-sm leading-5 text-text-primary" data-node-id="4737:22710">版本信息</p>
              </div>
              <div className="flex h-16 w-full shrink-0 flex-col items-start gap-2 text-xs leading-4" data-node-id="4737:22711" data-name="Content">
                <div className="flex h-4 w-full shrink-0 items-center gap-4" data-node-id="4737:22712" data-name="List Item">
                  <span className="w-[60px] shrink-0 text-left text-text-hint" data-node-id="4737:22713">开发者</span>
                  <span className="min-w-0 flex-1 text-right text-text-primary" data-node-id="4737:22714">HelloMe</span>
                </div>
                <div className="flex h-4 w-full shrink-0 items-center gap-4" data-node-id="4737:22715" data-name="List Item">
                  <span className="w-[60px] shrink-0 text-left text-text-hint" data-node-id="4737:22716">类别</span>
                  <span className="min-w-0 flex-1 text-right text-text-primary" data-node-id="4737:22717">开发者工具</span>
                </div>
                <div className="flex h-4 w-full shrink-0 items-center gap-4" data-node-id="4737:22718" data-name="List Item">
                  <span className="w-[60px] shrink-0 text-left text-text-hint" data-node-id="4737:22719">版本</span>
                  <span className="min-w-0 flex-1 text-right text-text-primary" data-node-id="4737:22720">v1.0.2</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex h-4 w-full shrink-0 items-center" data-node-id="4737:22721" data-name="Horizontal Divider">
              <div className="h-px w-full bg-border-default" data-node-id="4737:22722" data-name="Divider" />
            </div>

            <div className="mt-4 flex h-[200px] w-full shrink-0 flex-col items-start gap-3" data-node-id="4737:22723" data-name="license">
              <div className="flex h-5 w-full shrink-0 items-center" data-node-id="4737:22724" data-name="Title">
                <p className="w-full text-sm leading-5 text-text-primary" data-node-id="4737:22725">许可范围</p>
              </div>
              <div className="flex h-[168px] w-full shrink-0 flex-col items-start justify-center gap-3 text-xs leading-4" data-node-id="4737:22726" data-name="Content">
                <div className="flex h-14 w-full shrink-0 flex-col items-start gap-1" data-node-id="4737:22727" data-name="List Item">
                  <div className="flex h-4 w-full shrink-0 items-center" data-node-id="4737:22728" data-name="List Item">
                    <p className="w-full text-left text-text-primary" data-node-id="4737:22729">商用</p>
                  </div>
                  <div className="flex h-4 w-full shrink-0 items-center gap-1.5" data-node-id="4737:22730" data-name="List Item">
                    <Icon name="CircleCheck" size="sm" className="text-accent-green" data-node-id="4737:22731" />
                    <p className="min-w-0 flex-1 text-left text-text-hint" data-node-id="4737:22734">生成内容可商用</p>
                  </div>
                  <div className="flex h-4 w-full shrink-0 items-center gap-1.5" data-node-id="4737:22735" data-name="List Item">
                    <Icon name="CircleX" size="sm" className="text-accent-red" data-node-id="4737:22736" />
                    <p className="min-w-0 flex-1 text-left text-text-hint" data-node-id="4737:22740">不可转售模型或出售融合模型</p>
                  </div>
                </div>
                <div className="flex h-14 w-full shrink-0 flex-col items-start gap-1" data-node-id="4737:22741" data-name="List Item">
                  <div className="flex h-4 w-full shrink-0 items-center" data-node-id="4737:22742" data-name="List Item">
                    <p className="w-full text-left text-text-primary" data-node-id="4737:22743">创作</p>
                  </div>
                  <div className="flex h-4 w-full shrink-0 items-center gap-1.5" data-node-id="4737:22744" data-name="List Item">
                    <Icon name="CircleCheck" size="sm" className="text-accent-green" data-node-id="4737:22745" />
                    <p className="min-w-0 flex-1 text-left text-text-hint" data-node-id="4737:22748">可HelloMe在线生图</p>
                  </div>
                  <div className="flex h-4 w-full shrink-0 items-center gap-1.5" data-node-id="4737:22749" data-name="List Item">
                    <Icon name="CircleCheck" size="sm" className="text-accent-green" data-node-id="4737:22750" />
                    <p className="min-w-0 flex-1 text-left text-text-hint" data-node-id="4737:22753">可HelloMe在线生图可进行融合</p>
                  </div>
                </div>
                <div className="flex h-8 w-full shrink-0 items-center" data-node-id="4737:22754" data-name="List Item">
                  <p className="w-full text-left text-text-hint" data-node-id="4737:22755">
                    *以上许可信息由创作者自行编辑，请遵守相关许可范围进行使用
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WorkflowCard({
  title,
  author,
  date,
  frequency,
  cover,
  avatar,
}: {
  title: string;
  author: string;
  date: string;
  frequency: number;
  cover: string;
  avatar: string;
}) {
  return (
    <InteractiveCard
      heightClassName="h-[268px]"
      image={cover}
      contentHeightClassName="h-[108px]"
      contentHoverHeightClassName="group-hover:h-[156px]"
      actionsClassName="gap-2"
      actions={
        <>
          <Button
            className="min-w-0 flex-1 px-3.5"
            variant="secondary"
            size="md"
          >
            体验
          </Button>
          <Button className="min-w-0 flex-1 px-3.5" size="md">
            做同款
          </Button>
        </>
      }
    >
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-start">
            <h3 className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-text-primary">
              {title}
            </h3>
          </div>
          <div className="flex w-full items-center gap-2">
            <div className="h-4 w-4 shrink-0 overflow-hidden rounded-pill">
              <img className="h-full w-full object-cover" src={avatar} alt="" />
            </div>
            <p className="shrink-0 whitespace-nowrap text-xs leading-4 text-text-secondary">
              {author}
            </p>
            <div className="h-2.5 w-px shrink-0 bg-border-strong" />
            <p className="shrink-0 whitespace-nowrap text-xs leading-4 text-text-secondary">
              {date}
            </p>
          </div>
          <div className="flex w-full items-center gap-1">
            <Icon name="Zap" size="sm" className="shrink-0 text-text-primary" />
            <div className="flex items-center gap-0.5 self-stretch">
              <p className="shrink-0 whitespace-nowrap text-base font-medium leading-6 text-text-primary">
                {frequency}
              </p>
              <div className="flex h-full shrink-0 items-end justify-center pb-1">
                <p className="shrink-0 whitespace-nowrap text-xs leading-4 tracking-[-0.5px] text-text-secondary">
                  ／次
                </p>
              </div>
            </div>
          </div>
        </div>
    </InteractiveCard>
  );
}

function EmptySearchResult({ title }: { title: string }) {
  return (
    <div
      className="flex min-w-0 items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-white/40 p-4"
    >
      <div className="flex w-80 flex-col items-center gap-4">
        <Icon name="SearchSlash" size="2xl" className="text-text-primary" />
        <div className="flex w-full flex-col items-center gap-1 text-center text-sm leading-5">
          <p className="font-medium text-text-primary">{title}</p>
          <p className="text-text-hint">更换关键词再试试</p>
        </div>
      </div>
    </div>
  );
}

function EmptyProjectResult({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <div className="flex min-w-0 items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-white/40 p-4">
      <div className="flex w-80 flex-col items-center gap-4">
        <Icon name="FolderMinus" size="2xl" className="text-text-primary" />
        <div className="flex w-full flex-col items-center gap-1 text-center text-sm leading-5">
          <p className="font-medium text-text-primary">还没有项目</p>
          <p className="text-text-hint">开始创建你的第一个项目吧</p>
        </div>
        <Button className="h-8 px-4" size="md" onClick={onCreateProject}>
          新建项目
        </Button>
      </div>
    </div>
  );
}

function EmptyBillingResult() {
  return (
    <div className="flex min-w-0 items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-white/40 p-4">
      <div className="flex w-80 flex-col items-center gap-4">
        <Icon name="ReceiptText" size="2xl" className="text-text-primary" />
        <div className="flex w-full flex-col items-center gap-1 text-center text-sm leading-5">
          <p className="font-medium text-text-primary">暂无明细</p>
          <p className="text-text-hint">有明细时会记录在此</p>
        </div>
      </div>
    </div>
  );
}

function EmptyMessageResult() {
  return (
    <div className="flex min-w-0 items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-white/40 p-4">
      <div className="flex w-80 flex-col items-center gap-4">
        <Icon name="MailOpen" size="2xl" className="text-text-primary" />
        <div className="flex w-full flex-col items-center gap-1 text-center text-sm leading-5">
          <p className="font-medium text-text-primary">暂无消息</p>
          <p className="text-text-hint">有新消息时，我们会及时通知你</p>
        </div>
      </div>
    </div>
  );
}

function CardContainer({
  cardsToShow,
  currentAccount,
  externalRefreshKey,
  onAgentDataChange,
  onOpenAgentDetail,
}: {
  cardsToShow: typeof cards;
  currentAccount: MockAccount | null;
  externalRefreshKey: number;
  onAgentDataChange: () => void;
  onOpenAgentDetail: (agent: AgentCardData) => void;
}) {
  if (cardsToShow.length === 0) {
    return <EmptySearchResult title="未找到智能体" />;
  }

  return (
    <div className="agent-card-grid grid gap-4">
      {cardsToShow.map((card, index) => (
        <AgentCard
          key={`${card.title}-${index}`}
          {...card}
          currentAccount={currentAccount}
          externalRefreshKey={externalRefreshKey}
          onAgentDataChange={onAgentDataChange}
          onOpenDetail={() => onOpenAgentDetail(card)}
        />
      ))}
    </div>
  );
}

function WorkflowCardContainer({
  workflowsToShow,
}: {
  workflowsToShow: typeof workflowCards;
}) {
  if (workflowsToShow.length === 0) {
    return <EmptySearchResult title="未找到工作流" />;
  }

  return (
    <div className="agent-card-grid grid gap-4">
      {workflowsToShow.map((workflow, index) => (
        <WorkflowCard key={`${workflow.title}-${index}`} {...workflow} />
      ))}
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-pill bg-bg-strong px-1 text-xs leading-4 text-text-secondary">
      {count}
    </span>
  );
}

function ProjectTaskPreviewRow({ item }: { item: ProjectItem }) {
  return (
    <button
      className="group/row flex w-full items-center gap-4 rounded-button p-2 text-left hover:bg-bg-soft active:bg-bg-medium"
      type="button"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex h-4 w-4 shrink-0 overflow-hidden rounded-button bg-bg-medium">
          <img className="h-full w-full object-cover" src={item.image} alt="" />
        </div>
        <p className="h-5 min-w-0 flex-1 truncate text-sm font-normal leading-5 text-text-primary">
          {item.title}
        </p>
        {'status' in item && item.status && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-accent-success" />
        )}
      </div>
      <span className="shrink-0 text-xs leading-4 text-text-hint">{item.time}</span>
    </button>
  );
}

function ProjectCardMenu({
  onRename,
  onDelete,
  className = 'right-5 top-11',
  ariaLabel = '项目操作',
  anchorRef,
  align = 'auto',
}: {
  onRename: () => void;
  onDelete: () => void;
  className?: string;
  ariaLabel?: string;
  anchorRef?: RefObject<HTMLElement | null>;
  align?: 'auto' | 'left' | 'right';
}) {
  return (
    <PopoverMenu
      className={[
        'z-30 overflow-hidden',
        anchorRef ? undefined : className,
      ].join(' ')}
      width="sm"
      align={anchorRef ? align : 'none'}
      offset={anchorRef ? 4 : null}
      anchorRef={anchorRef}
      shadow="strong"
      role="menu"
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
    >
      <PopoverSection>
        <PopoverItem icon="SquarePen" role="menuitem" onClick={onRename}>
          重命名
        </PopoverItem>
      </PopoverSection>
      <PopoverDivider />
      <PopoverSection>
        <PopoverItem icon="Trash" role="menuitem" onClick={onDelete}>
          删除
        </PopoverItem>
      </PopoverSection>
    </PopoverMenu>
  );
}

function ProjectCard({
  project,
  onChooseAgent,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onRename,
  onDelete,
  onOpenDetail,
}: {
  project: Project;
  onChooseAgent: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onRename: () => void;
  onDelete: () => void;
  onOpenDetail: () => void;
}) {
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative h-[234px] min-w-0">
      <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-bg-white">
        <div
          className="flex h-[52px] w-full shrink-0 cursor-pointer flex-col px-5 text-left"
          role="button"
          tabIndex={0}
          onClick={onOpenDetail}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpenDetail();
            }
          }}
        >
          <div className="flex h-full w-full items-center gap-4 shadow-border-bottom-subtle">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Icon name="FolderOpen" className="shrink-0 text-text-primary" />
              <span className="min-w-0 truncate text-left text-sm font-medium leading-5 text-text-primary">
                {project.title}
              </span>
              <CountBadge count={project.count} />
            </div>
            <button
              ref={menuTriggerRef}
              className={[
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-button',
                isMenuOpen
                  ? 'bg-bg-medium text-text-primary'
                  : 'text-text-hint hover:bg-bg-soft hover:text-text-primary active:bg-bg-medium active:text-text-primary',
              ].join(' ')}
              type="button"
              aria-label={`${project.title} 更多操作`}
              aria-expanded={isMenuOpen}
              onPointerDown={(event) => {
                blurActiveInputControl();
                event.stopPropagation();
                event.preventDefault();
                onToggleMenu();
              }}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
            >
              <Icon name="Ellipsis" />
            </button>
          </div>
        </div>

        <div className="scrollbar-none flex h-[134px] shrink-0 flex-col overflow-y-auto px-3 py-2">
          {project.items.length > 0 ? (
            project.items.map((item, index) => (
              <ProjectTaskPreviewRow key={`${project.id}-${item.title}-${index}`} item={item} />
            ))
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <Button
                variant="text"
                size="md"
                icon="Plus"
                onClick={onChooseAgent}
                className="text-text-secondary"
              >
                创建任务
              </Button>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col px-5">
          <div className="flex h-12 w-full items-center justify-between shadow-border-top-subtle">
            <p className="shrink-0 text-xs leading-4 text-text-hint">{project.createdAt}</p>
            <button
              className="flex shrink-0 items-center text-xs leading-4 text-text-hint hover:text-text-secondary active:text-text-primary"
              type="button"
              onClick={onOpenDetail}
            >
              详情
              <Icon name="ChevronRight" size="sm" className="shrink-0" />
            </button>
          </div>
        </div>
      </article>
      {isMenuOpen && (
        <ProjectCardMenu
          anchorRef={menuTriggerRef}
          align="right"
          onRename={() => {
            onCloseMenu();
            onRename();
          }}
          onDelete={() => {
            onCloseMenu();
            onDelete();
          }}
        />
      )}
    </div>
  );
}

function ProjectList({
  projectsToShow,
  isSearching,
  onChooseAgent,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onOpenProjectDetail,
}: {
  projectsToShow: Project[];
  isSearching: boolean;
  onChooseAgent: () => void;
  onCreateProject: () => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onOpenProjectDetail: (project: Project) => void;
}) {
  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (openProjectMenuId === null) {
      return undefined;
    }

    const closeMenu = () => setOpenProjectMenuId(null);
    document.addEventListener('click', closeMenu);

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [openProjectMenuId]);

  if (projectsToShow.length === 0) {
    return isSearching ? (
      <EmptySearchResult title="未找到项目" />
    ) : (
      <EmptyProjectResult onCreateProject={onCreateProject} />
    );
  }

  return (
    <div className="project-card-grid grid gap-4">
      {projectsToShow.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onChooseAgent={onChooseAgent}
          isMenuOpen={openProjectMenuId === project.id}
          onToggleMenu={() =>
            setOpenProjectMenuId((currentId) => (currentId === project.id ? null : project.id))
          }
          onCloseMenu={() => setOpenProjectMenuId(null)}
          onRename={() => onRenameProject(project)}
          onDelete={() => onDeleteProject(project)}
          onOpenDetail={() => onOpenProjectDetail(project)}
        />
      ))}
    </div>
  );
}

function ProjectDetailModeTabs({
  value,
  onValueChange,
}: {
  value: ProjectDetailMode;
  onValueChange: (value: ProjectDetailMode) => void;
}) {
  return (
    <div className="flex h-7 items-center gap-4">
      {projectDetailModeTabs.map((tab) => {
        const isActive = value === tab;

        return (
          <button
            key={tab}
            className={[
              'h-7 shrink-0 text-lg leading-7 transition-colors',
              isActive
                ? 'font-medium text-text-primary'
                : 'font-medium text-text-hint hover:text-text-secondary active:text-text-primary',
            ].join(' ')}
            type="button"
            onClick={() => onValueChange(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

function ProjectDetailTaskRow({
  item,
  isLast,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onRename,
  onDelete,
}: {
  item: ProjectItem;
  isLast: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const isRunning = 'status' in item && Boolean(item.status);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="flex h-[82px] w-full">
      <div className="group/project-detail-row flex h-full min-w-0 flex-1 rounded-lg px-3">
        <div
          className="relative flex h-full min-w-0 flex-1 items-center gap-4 py-5 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-medium">
            <img className="h-full w-full object-cover" src={item.image} alt="" />
          </div>

          <div className="flex h-[42px] min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex h-5 min-w-0 items-center gap-2">
              <p className="shrink-0 truncate text-sm leading-5 text-text-primary">
                {item.title}
              </p>
              {isRunning && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-accent-success" />
              )}
              <span className="flex h-4 shrink-0 items-center justify-center rounded-pill border border-border-default px-2 text-center text-xxs text-text-secondary">
                自动化
              </span>
            </div>

            <div className="flex h-4 min-w-0 items-start gap-4 text-xs leading-4 text-text-hint">
              <span className="flex shrink-0 items-center gap-1">
                <Icon name="Clock4" size="sm" className="shrink-0" />
                <span className="whitespace-nowrap">{item.time}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <Icon name="ListChecks" size="sm" className="shrink-0" />
                <span className="whitespace-nowrap">{item.task}</span>
              </span>
            </div>
          </div>

          <ToolbarIconButton
            ref={menuTriggerRef}
            name="Ellipsis"
            surface="white"
            tone="hint"
            selected={isMenuOpen}
            aria-label={`${item.title} 更多操作`}
            aria-expanded={isMenuOpen}
            onPointerDown={(event) => {
              blurActiveInputControl();
              event.stopPropagation();
              event.preventDefault();
              onToggleMenu();
            }}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
          />

          {isMenuOpen && (
            <ProjectCardMenu
              anchorRef={menuTriggerRef}
              ariaLabel="任务操作"
              onRename={() => {
                onCloseMenu();
                onRename();
              }}
              onDelete={() => {
                onCloseMenu();
                onDelete();
              }}
            />
          )}

          {!isLast && (
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-bg-medium"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectDetailTaskList({
  tasksToShow,
  onRenameTask,
  onDeleteTask,
}: {
  tasksToShow: ProjectItem[];
  onRenameTask: (item: ProjectItem) => void;
  onDeleteTask: (item: ProjectItem) => void;
}) {
  const [openTaskMenuKey, setOpenTaskMenuKey] = useState<string | null>(null);

  useEffect(() => {
    if (openTaskMenuKey === null) {
      return undefined;
    }

    const closeMenu = () => setOpenTaskMenuKey(null);
    document.addEventListener('click', closeMenu);

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [openTaskMenuKey]);

  if (tasksToShow.length === 0) {
    return <EmptySearchResult title="未找到任务" />;
  }

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-bg-white px-3 py-1">
      {tasksToShow.map((item, index) => {
        const rowKey = `${getProjectTaskKey(item)}-${index}`;

        return (
          <ProjectDetailTaskRow
            key={rowKey}
            item={item}
            isLast={index === tasksToShow.length - 1}
            isMenuOpen={openTaskMenuKey === rowKey}
            onToggleMenu={() =>
              setOpenTaskMenuKey((currentKey) =>
                currentKey === rowKey ? null : rowKey,
              )
            }
            onCloseMenu={() => setOpenTaskMenuKey(null)}
            onRename={() => onRenameTask(item)}
            onDelete={() => onDeleteTask(item)}
          />
        );
      })}
    </div>
  );
}

function ProjectDetailFileCheckbox({
  label,
  checked = false,
  indeterminate = false,
  alwaysVisible = false,
  onToggle,
}: {
  label: string;
  checked?: boolean;
  indeterminate?: boolean;
  alwaysVisible?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={[
        'flex h-4 w-4 shrink-0 items-center justify-center',
        alwaysVisible || checked || indeterminate ? 'opacity-100' : 'opacity-0 group-hover/project-file-row:opacity-100',
      ].join(' ')}
      type="button"
      aria-label={label}
      aria-checked={indeterminate ? 'mixed' : checked}
      role="checkbox"
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <ProjectDetailCheckboxMark
        checked={checked}
        indeterminate={indeterminate}
        alwaysVisible
      />
    </button>
  );
}

type ProjectDetailFileSortKey = 'name' | 'time' | 'size';
type ProjectDetailFileSortState = {
  key: ProjectDetailFileSortKey;
  direction: AccountDetailSortDirection;
} | null;

function parseProjectFileDate(date: string) {
  const [year, month, day] = date.split('/').map(Number);

  return new Date(year, month - 1, day).getTime();
}

function parseProjectFileSize(size: string) {
  const match = size.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/);

  if (match === null) {
    return 0;
  }

  const value = Number.parseFloat(match[1]);
  const unit = (match[2] ?? 'B').toUpperCase();
  const unitScale: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return value * (unitScale[unit] ?? 1);
}

function ProjectDetailFileSortIcon({
  direction,
}: {
  direction: AccountDetailSortDirection | null;
}) {
  return <SortChevronsIcon className="shrink-0 text-text-primary" direction={direction} />;
}

function getProjectFileSortValue(file: ProjectFile, key: ProjectDetailFileSortKey) {
  if (key === 'time') {
    return parseProjectFileDate(file.date);
  }

  if (key === 'size') {
    return parseProjectFileSize(file.size);
  }

  return file.name;
}

function ProjectDetailFileList({
  filesToShow,
  selectedFileKeys,
  onToggleFile,
  onToggleAllFiles,
  onRenameFile,
  onDeleteFile,
}: {
  filesToShow: ProjectFile[];
  selectedFileKeys: Set<string>;
  onToggleFile: (file: ProjectFile) => void;
  onToggleAllFiles: () => void;
  onRenameFile: (file: ProjectFile) => void;
  onDeleteFile: (file: ProjectFile) => void;
}) {
  const [openFileMenuKey, setOpenFileMenuKey] = useState<string | null>(null);
  const [sortState, setSortState] = useState<ProjectDetailFileSortState>(null);
  const sortedFilesToShow = useMemo(() => {
    if (sortState === null) {
      return filesToShow;
    }

    return [...filesToShow].sort((firstFile, secondFile) => {
      const firstValue = getProjectFileSortValue(firstFile, sortState.key);
      const secondValue = getProjectFileSortValue(secondFile, sortState.key);

      if (typeof firstValue === 'string' && typeof secondValue === 'string') {
        return sortState.direction === 'asc'
          ? firstValue.localeCompare(secondValue, 'zh-Hans-CN')
          : secondValue.localeCompare(firstValue, 'zh-Hans-CN');
      }

      return sortState.direction === 'asc'
        ? Number(firstValue) - Number(secondValue)
        : Number(secondValue) - Number(firstValue);
    });
  }, [filesToShow, sortState]);
  const allVisibleFilesSelected =
    filesToShow.length > 0 &&
    filesToShow.every((file) => selectedFileKeys.has(getProjectFileKey(file)));
  const someVisibleFilesSelected =
    filesToShow.some((file) => selectedFileKeys.has(getProjectFileKey(file)));

  useEffect(() => {
    if (openFileMenuKey === null) {
      return undefined;
    }

    const closeMenu = () => setOpenFileMenuKey(null);
    document.addEventListener('click', closeMenu);

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [openFileMenuKey]);

  const handleSortColumn = (key: ProjectDetailFileSortKey) => {
    setSortState((currentSort) => {
      if (currentSort?.key !== key) {
        return {
          key,
          direction: key === 'name' ? 'asc' : key === 'size' ? 'desc' : 'asc',
        };
      }

      if (currentSort.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return null;
    });
  };

  if (filesToShow.length === 0) {
    return <EmptySearchResult title="未找到文件" />;
  }

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-bg-white">
      <div className="w-full px-5">
        <div className="flex h-[52px] items-center gap-4 border-b border-border-subtle text-sm leading-5 text-text-hint">
          <ProjectDetailFileCheckbox
            label="选择全部文件"
            checked={allVisibleFilesSelected}
            indeterminate={someVisibleFilesSelected && !allVisibleFilesSelected}
            alwaysVisible
            onToggle={onToggleAllFiles}
          />
          <button
            className="group flex min-w-0 flex-1 items-center gap-1 text-left transition-colors hover:text-text-secondary active:text-text-primary"
            type="button"
            onClick={() => handleSortColumn('name')}
          >
            <span className="truncate">名称</span>
            <ProjectDetailFileSortIcon
              direction={sortState?.key === 'name' ? sortState.direction : null}
            />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex min-w-0 flex-1 items-center">
              <span className="truncate">类型</span>
            </div>
            <button
              className="group flex min-w-0 flex-1 items-center gap-1 text-left transition-colors hover:text-text-secondary active:text-text-primary"
              type="button"
              onClick={() => handleSortColumn('time')}
            >
              <span className="truncate">时间</span>
              <ProjectDetailFileSortIcon
                direction={sortState?.key === 'time' ? sortState.direction : null}
              />
            </button>
            <button
              className="group flex min-w-0 flex-1 items-center gap-1 text-left transition-colors hover:text-text-secondary active:text-text-primary"
              type="button"
              onClick={() => handleSortColumn('size')}
            >
              <span className="truncate">大小</span>
              <ProjectDetailFileSortIcon
                direction={sortState?.key === 'size' ? sortState.direction : null}
              />
            </button>
            <div className="h-5 w-7 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-3 py-1">
        {sortedFilesToShow.map((file) => {
          const fileKey = getProjectFileKey(file);
          const selected = selectedFileKeys.has(fileKey);

          return (
            <ProjectDetailFileRow
              key={fileKey}
              file={file}
              selected={selected}
              isMenuOpen={openFileMenuKey === fileKey}
              onToggle={() => onToggleFile(file)}
              onToggleMenu={() =>
                setOpenFileMenuKey((currentKey) =>
                  currentKey === fileKey ? null : fileKey,
                )
              }
              onCloseMenu={() => setOpenFileMenuKey(null)}
              onRename={() => onRenameFile(file)}
              onDelete={() => onDeleteFile(file)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ProjectDetailFileRow({
  file,
  selected,
  isMenuOpen,
  onToggle,
  onToggleMenu,
  onCloseMenu,
  onRename,
  onDelete,
}: {
  file: ProjectFile;
  selected: boolean;
  isMenuOpen: boolean;
  onToggle: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div
      className={[
        'group/project-file-row relative flex h-12 items-center gap-4 rounded-lg px-2 py-3',
        selected ? 'bg-bg-soft' : 'hover:bg-bg-soft',
      ].join(' ')}
    >
      <ProjectDetailFileCheckbox
        label={`选择 ${file.name}`}
        checked={selected}
        onToggle={onToggle}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <img className="h-6 w-6 shrink-0" src={file.icon} alt="" />
        <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary group-hover/project-file-row:underline">
          {file.name}
        </p>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-hint">
          {file.type}
        </p>
        <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-hint">
          {file.date}
        </p>
        <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-hint">
          {file.size}
        </p>
        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
          <ToolbarIconButton
            ref={menuTriggerRef}
            name="Ellipsis"
            size="xs"
            surface="soft"
            tone="hint"
            selected={isMenuOpen}
            className={[
              'h-6 w-6 opacity-0 transition-opacity group-hover/project-file-row:opacity-100',
              isMenuOpen ? 'opacity-100' : undefined,
            ].filter(Boolean).join(' ')}
            aria-label={`${file.name} 更多操作`}
            aria-expanded={isMenuOpen}
            onPointerDown={(event) => {
              blurActiveInputControl();
              event.stopPropagation();
              event.preventDefault();
              onToggleMenu();
            }}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
          />
        </div>
      </div>
      {isMenuOpen && (
        <ProjectDetailFileMenu
          anchorRef={menuTriggerRef}
          onRename={() => {
            onCloseMenu();
            onRename();
          }}
          onDownload={() => {}}
          onMove={() => {}}
          onDelete={() => {
            onCloseMenu();
            onDelete();
          }}
        />
      )}
    </div>
  );
}

function ProjectDetailFileMenu({
  anchorRef,
  onRename,
  onDownload,
  onMove,
  onDelete,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  onRename: () => void;
  onDownload: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  return (
    <PopoverMenu
      width="sm"
      align="right"
      anchorRef={anchorRef}
      shadow="strong"
      role="menu"
      aria-label="文件操作"
      onPointerDownCapture={(event) => event.stopPropagation()}
      onMouseDownCapture={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <PopoverSection>
        <PopoverItem icon="SquarePen" role="menuitem" onClick={onRename}>
          修改名称
        </PopoverItem>
      </PopoverSection>
      <PopoverSection>
        <PopoverItem icon="Download" role="menuitem" onClick={onDownload}>
          下载
        </PopoverItem>
      </PopoverSection>
      <PopoverSection>
        <PopoverItem icon="FolderInput" role="menuitem" onClick={onMove}>
          移动位置
        </PopoverItem>
      </PopoverSection>
      <PopoverDivider />
      <PopoverSection>
        <PopoverItem icon="Trash" role="menuitem" onClick={onDelete}>
          删除
        </PopoverItem>
      </PopoverSection>
    </PopoverMenu>
  );
}

function ProjectDetailView({
  mode,
  onModeChange,
  activeTab,
  onActiveTabChange,
  searchValue,
  onSearchValueChange,
  tasksToShow,
  filesToShow,
  onRenameTask,
  onDeleteTask,
  onRenameFile,
  onRequestDeleteFiles,
}: {
  mode: ProjectDetailMode;
  onModeChange: (value: ProjectDetailMode) => void;
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  tasksToShow: ProjectItem[];
  filesToShow: ProjectFile[];
  onRenameTask: (item: ProjectItem) => void;
  onDeleteTask: (item: ProjectItem) => void;
  onRenameFile: (file: ProjectFile) => void;
  onRequestDeleteFiles: (fileKeys: string[]) => void;
}) {
  const emptyTitle = mode === '文件' ? '暂无文件' : '暂无成员';
  const detailTabs = mode === '文件' ? projectTabs : projectDetailTabs;
  const searchPlaceholder = mode === '文件' ? '搜索文件' : '搜索任务';
  const showTaskActions = mode === '任务';
  const showFileActions = mode === '文件';
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [openFileTypeFilter, setOpenFileTypeFilter] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<(typeof projectDetailStatusFilterOptions)[number]>('全部状态');
  const [selectedFileTypeFilter, setSelectedFileTypeFilter] =
    useState<(typeof projectFileTypeFilterOptions)[number]>('全部');
  const [selectedFileKeys, setSelectedFileKeys] = useState<Set<string>>(new Set());
  const statusFilterTriggerRef = useRef<HTMLDivElement | null>(null);
  const fileTypeFilterTriggerRef = useRef<HTMLDivElement | null>(null);
  const visibleFilesToShow = selectedFileTypeFilter === '全部'
    ? filesToShow
    : filesToShow.filter((file) => file.type === selectedFileTypeFilter);
  const selectedFileCount = selectedFileKeys.size;
  const selectedFileKeyList = [...selectedFileKeys];

  useEffect(() => {
    if (mode !== '任务') {
      setOpenStatusFilter(false);
    }

    if (mode !== '文件') {
      setOpenFileTypeFilter(false);
      setSelectedFileKeys(new Set());
    }
  }, [mode]);

  useEffect(() => {
    setSelectedFileKeys((currentKeys) => {
      const visibleKeys = new Set(filesToShow.map(getProjectFileKey));
      const nextKeys = [...currentKeys].filter((key) => visibleKeys.has(key));

      return nextKeys.length === currentKeys.size ? currentKeys : new Set(nextKeys);
    });
  }, [filesToShow]);

  useEffect(() => {
    if (!openStatusFilter && !openFileTypeFilter) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest('[data-project-detail-status-filter-trigger="true"]') ||
        target?.closest('[data-project-detail-file-type-filter-trigger="true"]') ||
        target?.closest('[data-account-filter-popover="true"]')
      ) {
        return;
      }

      setOpenStatusFilter(false);
      setOpenFileTypeFilter(false);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [openStatusFilter, openFileTypeFilter]);

  function toggleFile(file: ProjectFile) {
    const fileKey = getProjectFileKey(file);

    setSelectedFileKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      if (nextKeys.has(fileKey)) {
        nextKeys.delete(fileKey);
      } else {
        nextKeys.add(fileKey);
      }

      return nextKeys;
    });
  }

  function toggleAllVisibleFiles() {
    const visibleFileKeys = visibleFilesToShow.map(getProjectFileKey);
    const allVisibleFilesSelected =
      visibleFileKeys.length > 0 &&
      visibleFileKeys.every((key) => selectedFileKeys.has(key));

    setSelectedFileKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      if (allVisibleFilesSelected) {
        visibleFileKeys.forEach((key) => nextKeys.delete(key));
      } else {
        visibleFileKeys.forEach((key) => nextKeys.add(key));
      }

      return nextKeys;
    });
  }

  function deleteSelectedFiles() {
    if (selectedFileKeyList.length === 0) return;

    onRequestDeleteFiles(selectedFileKeyList);
  }

  return (
    <>
      <section className="page-section-x sticky top-14 z-20 bg-bg-soft">
        <div className="account-billing-tabs-bar flex items-center shadow-border-bottom-default">
          <ProjectDetailModeTabs value={mode} onValueChange={onModeChange} />
        </div>

        <div className="home-filter-bar flex items-center justify-between gap-4">
          <TabBar
            items={detailTabs}
            value={activeTab}
            onValueChange={onActiveTabChange}
          />

          <div
            className={[
              'flex h-8 shrink-0 items-center justify-end gap-3',
              showFileActions ? 'w-auto' : 'w-[384px]',
            ].join(' ')}
          >
            {showTaskActions && (
              <div
                ref={statusFilterTriggerRef}
                className="relative flex h-8 w-8 shrink-0 items-center"
              >
                <ToolbarIconButton
                  data-project-detail-status-filter-trigger="true"
                  name="ListFilter"
                  surface="soft"
                  selected={openStatusFilter}
                  aria-label="筛选"
                  aria-expanded={openStatusFilter}
                  onPointerDown={(event) => {
                    blurActiveInputControl();
                    event.preventDefault();
                    setOpenStatusFilter((currentValue) => !currentValue);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') {
                      return;
                    }

                    event.preventDefault();
                    setOpenStatusFilter((currentValue) => !currentValue);
                  }}
                />
                {openStatusFilter && (
                  <SelectOptionPopover
                    options={projectDetailStatusFilterOptions}
                    value={selectedStatusFilter}
                    widthClassName="w-40"
                    anchorRef={statusFilterTriggerRef}
                    onValueChange={(value) => {
                      setSelectedStatusFilter(value);
                      setOpenStatusFilter(false);
                    }}
                  />
                )}
              </div>
            )}
            {showFileActions && (
              <div
                ref={fileTypeFilterTriggerRef}
                className="relative flex h-8 w-8 shrink-0 items-center"
              >
                <ToolbarIconButton
                  data-project-detail-file-type-filter-trigger="true"
                  name="ListFilter"
                  surface="soft"
                  selected={openFileTypeFilter}
                  aria-label="文件类型筛选"
                  aria-expanded={openFileTypeFilter}
                  onPointerDown={(event) => {
                    blurActiveInputControl();
                    event.preventDefault();
                    setOpenFileTypeFilter((currentValue) => !currentValue);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') {
                      return;
                    }

                    event.preventDefault();
                    setOpenFileTypeFilter((currentValue) => !currentValue);
                  }}
                />
                {openFileTypeFilter && (
                  <SelectOptionPopover
                    options={projectFileTypeFilterOptions}
                    value={selectedFileTypeFilter}
                    widthClassName="w-40"
                    anchorRef={fileTypeFilterTriggerRef}
                    onValueChange={(value) => {
                      setSelectedFileTypeFilter(value);
                      setOpenFileTypeFilter(false);
                    }}
                  />
                )}
              </div>
            )}
            <SearchInput
              className="w-60"
              value={searchValue}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onValueChange={onSearchValueChange}
            />
            {showTaskActions && (
              <Button className="h-8 w-[88px] shrink-0 px-4" size="md">
                新建任务
              </Button>
            )}
            {showFileActions && selectedFileCount > 0 && (
              <>
                <div className="h-[15px] w-px shrink-0 bg-border-strong" />
                <Button
                  variant="secondary"
                  surface="soft"
                  size="md"
                  icon="Download"
                  onClick={() => {}}
                >
                  下载
                </Button>
                <Button
                  variant="secondary"
                  surface="soft"
                  size="md"
                  icon="FolderInput"
                  onClick={() => {}}
                >
                  移动
                </Button>
                <Button
                  variant="secondary"
                  surface="soft"
                  size="md"
                  icon="Trash"
                  onClick={deleteSelectedFiles}
                >
                  删除
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="home-sticky-spacer" aria-hidden="true" />
      <div className="home-results-scroll">
        <section className="home-results-content page-section-x">
            {mode === '任务' ? (
              <ProjectDetailTaskList
                tasksToShow={tasksToShow}
                onRenameTask={onRenameTask}
                onDeleteTask={onDeleteTask}
              />
            ) : mode === '文件' ? (
              <ProjectDetailFileList
                filesToShow={visibleFilesToShow}
                selectedFileKeys={selectedFileKeys}
                onToggleFile={toggleFile}
                onToggleAllFiles={toggleAllVisibleFiles}
                onRenameFile={onRenameFile}
                onDeleteFile={(file) => onRequestDeleteFiles([getProjectFileKey(file)])}
              />
            ) : (
              <EmptySearchResult title={emptyTitle} />
            )}
        </section>
      </div>
    </>
  );
}

function ProjectNameModal({
  title,
  initialValue,
  placeholder = '请输入项目名称',
  focusPlacement = 'select',
  disableConfirmWhenEmpty = true,
  onClose,
  onConfirm,
}: {
  title: string;
  initialValue: string;
  placeholder?: string;
  focusPlacement?: 'start' | 'end' | 'select';
  disableConfirmWhenEmpty?: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}) {
  const [projectName, setProjectName] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function placeInputCaret(input: HTMLInputElement) {
      if (focusPlacement === 'select') {
        input.select();
        return;
      }

      const caretPosition = focusPlacement === 'start' ? 0 : input.value.length;
      input.setSelectionRange(caretPosition, caretPosition);
    }

    let caretFrame = 0;
    const openTimer = window.setTimeout(() => {
      const input = inputRef.current;

      if (!input) return;

      input.focus({ preventScroll: true });
      placeInputCaret(input);

      caretFrame = window.requestAnimationFrame(() => {
        if (inputRef.current === input) {
          placeInputCaret(input);
        }
      });
    }, 20);

    return () => {
      window.clearTimeout(openTimer);
      if (caretFrame) {
        window.cancelAnimationFrame(caretFrame);
      }
    };
  }, [focusPlacement]);

  function handleConfirm() {
    const nextName = projectName.trim();
    if (!nextName) return false;

    onConfirm(nextName);
    return true;
  }

  return (
    <FormModal
      title={title}
      closeLabel={`关闭${title}弹窗`}
      confirmDisabled={disableConfirmWhenEmpty && !projectName.trim()}
      formProps={{
        onPointerDown: (event) => {
          const target = event.target as HTMLElement | null;

          if (!target?.closest('input, textarea, button, a, select, [role="button"]')) {
            inputRef.current?.blur();
          }
        },
      }}
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <InputField
        ref={inputRef}
        className="w-full"
        value={projectName}
        placeholder={placeholder}
        maxLength={20}
        onValueChange={setProjectName}
      />
    </FormModal>
  );
}

function ProjectDeleteModal({
  projectTitle,
  title = '删除项目？',
  description = '确定要删除此项目吗？删除后项目将被永久删除，包括项目内所有任务及产物，且不可恢复。',
  closeLabel = '关闭删除项目弹窗',
  ariaLabel = `删除${projectTitle}项目确认`,
  onClose,
  onConfirm,
}: {
  projectTitle: string;
  title?: string;
  description?: string;
  closeLabel?: string;
  ariaLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      title={title}
      description={description}
      confirmText="删除"
      confirmVariant="warning"
      closeLabel={closeLabel}
      ariaLabel={ariaLabel}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

const accountDetailColumns = [
  { key: 'date', label: '账单日期' },
  { key: 'amount', label: '消费金额 (¥)' },
  { key: 'originalAmount', label: '原价总额 (¥)' },
  { key: 'discount', label: '综合折扣 (%)' },
] as const;

type AccountDetailColumnKey = (typeof accountDetailColumns)[number]['key'];
type AccountDetailSortDirection = 'asc' | 'desc';
type AccountDetailSortState = {
  key: AccountDetailColumnKey;
  direction: AccountDetailSortDirection;
} | null;

function parseBillingDate(date: string) {
  const [datePart, timePart = '00:00:00'] = date.split(' ');
  const [year, month, day] = datePart.split('/').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

function getBillingSortValue(
  item: MockBillingDetail,
  key: AccountDetailColumnKey,
) {
  if (key === 'date') {
    return parseBillingDate(item.date);
  }

  return Number.parseFloat(item[key]);
}

function BillingSortIcon({
  direction,
}: {
  direction: AccountDetailSortDirection | null;
}) {
  return <SortChevronsIcon className="shrink-0 text-text-primary" direction={direction} />;
}

function AccountDetailList({
  detailsToShow,
  isSearching,
}: {
  detailsToShow: MockBillingDetail[];
  isSearching: boolean;
}) {
  const [sortState, setSortState] = useState<AccountDetailSortState>(null);
  const sortedDetailsToShow = useMemo(() => {
    const activeSort = sortState ?? { key: 'date', direction: 'desc' as const };

    return [...detailsToShow].sort((firstItem, secondItem) => {
      const firstValue = getBillingSortValue(firstItem, activeSort.key);
      const secondValue = getBillingSortValue(secondItem, activeSort.key);

      return activeSort.direction === 'asc'
        ? firstValue - secondValue
        : secondValue - firstValue;
    });
  }, [detailsToShow, sortState]);

  const handleSortColumn = (key: AccountDetailColumnKey) => {
    setSortState((currentSort) => {
      if (currentSort?.key !== key) {
        return { key, direction: 'asc' };
      }

      if (currentSort.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return null;
    });
  };

  if (detailsToShow.length === 0) {
    return isSearching ? (
      <EmptySearchResult title="未找到明细" />
    ) : (
      <EmptyBillingResult />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-card bg-bg-white">
      <div className="flex w-full flex-col px-5">
        <div className="flex w-full items-start gap-4 py-4 shadow-border-bottom-subtle">
          {accountDetailColumns.map((column) => (
            <button
              key={column.key}
              className="group flex h-5 min-w-0 flex-1 items-center gap-1 text-left text-sm leading-5 text-text-hint transition-colors hover:text-text-secondary active:text-text-primary"
              type="button"
              onClick={() => handleSortColumn(column.key)}
            >
              <span className="min-w-0 truncate">{column.label}</span>
              <BillingSortIcon
                direction={sortState?.key === column.key ? sortState.direction : null}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col gap-1 px-3 py-1">
        {sortedDetailsToShow.map((item) => (
          <div
            key={item.id}
            className="flex w-full items-center gap-4 rounded-button p-2 hover:bg-bg-soft active:bg-bg-medium"
          >
            {accountDetailColumns.map((column) => (
              <div key={column.key} className="flex h-6 min-w-0 flex-1 items-center">
                <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                  {item[column.key]}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const productBillingColumns = [
  { key: 'model', label: '模型名称' },
  { key: 'type', label: '产品类型' },
  { key: 'amount', label: '消费金额 (¥)' },
] as const;

type ProductBillingColumnKey = (typeof productBillingColumns)[number]['key'];

function ProductBillingList({
  detailsToShow,
  isSearching,
}: {
  detailsToShow: MockProductBillingDetail[];
  isSearching: boolean;
}) {
  const [sortDirection, setSortDirection] =
    useState<AccountDetailSortDirection | null>(null);
  const sortedDetailsToShow = useMemo(() => {
    if (sortDirection === null) {
      return detailsToShow;
    }

    return [...detailsToShow].sort((firstItem, secondItem) => {
      const firstValue = Number.parseFloat(firstItem.amount);
      const secondValue = Number.parseFloat(secondItem.amount);

      return sortDirection === 'asc'
        ? firstValue - secondValue
        : secondValue - firstValue;
    });
  }, [detailsToShow, sortDirection]);

  const handleAmountSort = () => {
    setSortDirection((currentDirection) => {
      if (currentDirection === null) {
        return 'asc';
      }

      if (currentDirection === 'asc') {
        return 'desc';
      }

      return null;
    });
  };

  if (detailsToShow.length === 0) {
    return isSearching ? (
      <EmptySearchResult title="未找到明细" />
    ) : (
      <EmptyBillingResult />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-card bg-bg-white">
      <div className="flex w-full flex-col px-5">
        <div className="flex w-full items-start gap-4 py-4 shadow-border-bottom-subtle">
          {productBillingColumns.map((column) => {
            const sortable = column.key === 'amount';
            const content = (
              <>
                <span className="min-w-0 truncate">{column.label}</span>
                {sortable && <BillingSortIcon direction={sortDirection} />}
              </>
            );

            return sortable ? (
              <button
                key={column.key}
                className="group flex h-5 min-w-0 flex-1 items-center gap-1 text-left text-sm leading-5 text-text-hint transition-colors hover:text-text-secondary active:text-text-primary"
                type="button"
                onClick={handleAmountSort}
              >
                {content}
              </button>
            ) : (
              <div
                key={column.key}
                className="flex h-5 min-w-0 flex-1 items-center text-sm leading-5 text-text-hint"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex w-full flex-col gap-1 px-3 py-1">
        {sortedDetailsToShow.map((item) => (
          <div
            key={item.id}
            className="flex w-full items-center gap-4 rounded-button p-2 hover:bg-bg-soft active:bg-bg-medium"
          >
            {productBillingColumns.map((column) => (
              <div key={column.key} className="flex h-6 min-w-0 flex-1 items-center">
                {column.key === 'model' && (
                  <span className="mr-2 h-5 w-5 shrink-0 overflow-hidden rounded-icon">
                    <img
                      className="h-full w-full object-cover"
                      src={item.icon}
                      alt=""
                    />
                  </span>
                )}
                <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                  {item[column.key as ProductBillingColumnKey]}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type RequestBillingSortKey = 'originalAmount' | 'amount';
type RequestBillingSortState = {
  key: RequestBillingSortKey;
  direction: AccountDetailSortDirection;
} | null;

function RequestBillingList({
  detailsToShow,
  isSearching,
}: {
  detailsToShow: MockRequestBillingDetail[];
  isSearching: boolean;
}) {
  const [sortState, setSortState] = useState<RequestBillingSortState>(null);
  const sortedDetailsToShow = useMemo(() => {
    if (sortState === null) {
      return detailsToShow;
    }

    return [...detailsToShow].sort((firstItem, secondItem) => {
      const firstValue = Number.parseFloat(firstItem[sortState.key]);
      const secondValue = Number.parseFloat(secondItem[sortState.key]);

      return sortState.direction === 'asc'
        ? firstValue - secondValue
        : secondValue - firstValue;
    });
  }, [detailsToShow, sortState]);

  const handleSortColumn = (key: RequestBillingSortKey) => {
    setSortState((currentSort) => {
      if (currentSort?.key !== key) {
        return { key, direction: 'asc' };
      }

      if (currentSort.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return null;
    });
  };

  if (detailsToShow.length === 0) {
    return isSearching ? (
      <EmptySearchResult title="未找到明细" />
    ) : (
      <EmptyBillingResult />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-card bg-bg-white">
      <div className="flex w-full flex-col px-5">
        <div className="flex w-full items-start gap-4 py-4 shadow-border-bottom-subtle">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-5 min-w-0 flex-1 items-center text-sm leading-5 text-text-hint">
              <span className="min-w-0 truncate">模型名称</span>
            </div>
            <div className="flex h-5 min-w-0 flex-1 items-center text-sm leading-5 text-text-hint">
              <span className="min-w-0 truncate">时间</span>
            </div>
          </div>
          <div className="flex h-5 min-w-0 flex-1 items-center text-sm leading-5 text-text-hint">
            <span className="min-w-0 truncate">API Key</span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-5 min-w-0 flex-1 items-center text-sm leading-5 text-text-hint">
              <span className="min-w-0 truncate">请求用量 (Tokens)</span>
            </div>
            <button
              className="group flex h-5 min-w-0 flex-1 items-center gap-1 text-left text-sm leading-5 text-text-hint transition-colors hover:text-text-secondary active:text-text-primary"
              type="button"
              onClick={() => handleSortColumn('originalAmount')}
            >
              <span className="min-w-0 truncate">原价 (¥)</span>
              <BillingSortIcon
                direction={
                  sortState?.key === 'originalAmount' ? sortState.direction : null
                }
              />
            </button>
            <button
              className="group flex h-5 min-w-0 flex-1 items-center gap-1 text-left text-sm leading-5 text-text-hint transition-colors hover:text-text-secondary active:text-text-primary"
              type="button"
              onClick={() => handleSortColumn('amount')}
            >
              <span className="min-w-0 truncate">实扣金额 (¥)</span>
              <BillingSortIcon
                direction={sortState?.key === 'amount' ? sortState.direction : null}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1 px-3 py-1">
        {sortedDetailsToShow.map((item) => (
          <div
            key={item.id}
            className="flex w-full items-center gap-4 rounded-button p-2 hover:bg-bg-soft active:bg-bg-medium"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-6 min-w-0 flex-1 items-center">
                <span className="mr-2 h-5 w-5 shrink-0 overflow-hidden rounded-icon">
                  <img className="h-full w-full object-cover" src={item.icon} alt="" />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                  {item.model}
                </p>
              </div>
              <div className="flex h-6 min-w-0 flex-1 items-center">
                <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                  {item.time}
                </p>
              </div>
            </div>
            <div className="flex h-6 min-w-0 flex-1 items-center">
              <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                {item.apiKey}
              </p>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-6 min-w-0 flex-1 items-center">
                <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                  {item.tokens}
                </p>
              </div>
              <div className="flex h-6 min-w-0 flex-1 items-center">
                <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                  {item.originalAmount}
                </p>
              </div>
              <div className="flex h-6 min-w-0 flex-1 items-center">
                <p className="min-w-0 flex-1 truncate text-sm leading-5 text-text-primary">
                  {item.amount}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageRow({
  message,
  expanded,
  isUnread,
  animateCollapse,
  onToggle,
}: {
  message: MessageItem;
  expanded: boolean;
  isUnread: boolean;
  animateCollapse: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={[
        'overflow-hidden rounded-xl bg-bg-white px-5',
        expanded ? 'message-collapse-card' : '',
      ].join(' ')}
    >
      <button
        className="flex h-[52px] w-full items-center text-left"
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div
          className={[
            'flex h-full min-w-0 flex-1 items-center gap-2 py-4',
            expanded ? 'shadow-border-bottom-subtle' : '',
          ].join(' ')}
        >
          <span
            className={[
              'h-1.5 w-1.5 shrink-0 rounded-pill',
              isUnread ? 'bg-accent-red' : 'bg-bg-strong',
            ].join(' ')}
          />
          <h2
            className={[
              'min-w-0 flex-1 truncate text-sm leading-5 text-text-primary',
              isUnread ? 'font-medium' : 'font-normal',
            ].join(' ')}
          >
            {message.title}
          </h2>
          <div className="flex shrink-0 items-center gap-0.5">
            <time className="text-xs leading-4 text-text-hint">
              {message.time}
            </time>
            <Icon
              name={expanded ? 'ChevronDown' : 'ChevronRight'}
              className="shrink-0 text-text-hint"
            />
          </div>
        </div>
      </button>
      <div
        className="project-collapse-panel"
        data-open={expanded}
        data-animate={animateCollapse}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 pb-5 pt-4">
            <p className="whitespace-pre-line text-sm leading-5 text-text-secondary">
              {message.content}
            </p>
            {'action' in message && message.action && (
              <div>
                <Button className="h-8 px-4" size="md">
                  {message.action}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function MessageList({
  messagesToShow,
  expandedMessageIds,
  unreadMessageIds,
  animateCollapse,
  isSearching,
  onToggleMessage,
}: {
  messagesToShow: MessageItem[];
  expandedMessageIds: Set<string>;
  unreadMessageIds: Set<string>;
  animateCollapse: boolean;
  isSearching: boolean;
  onToggleMessage: (id: string) => void;
}) {
  if (messagesToShow.length === 0) {
    return isSearching ? (
      <EmptySearchResult title="未找到消息" />
    ) : (
      <EmptyMessageResult />
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {messagesToShow.map((message) => (
        <MessageRow
          key={message.id}
          message={message}
          expanded={expandedMessageIds.has(message.id)}
          isUnread={unreadMessageIds.has(message.id)}
          animateCollapse={animateCollapse}
          onToggle={() => onToggleMessage(message.id)}
        />
      ))}
    </div>
  );
}

export function HomePage() {
  const initialPathname =
    typeof window === 'undefined' ? pagePaths.home : window.location.pathname;
  const initialPage = getPageFromPath(initialPathname);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCollapsedToggle, setShowCollapsedToggle] = useState(false);
  const [currentPathname, setCurrentPathname] = useState(initialPathname);
  const [activePage, setActivePage] = useState<PageMode>(initialPage);
  const [viewMode, setViewMode] = useState<ViewMode>('agents');
  const [messageMode, setMessageMode] = useState<MessageMode>('announcements');
  const [notificationMode, setNotificationMode] =
    useState<MessageMode>('announcements');
  const [activeTab, setActiveTab] = useState(() =>
    getDefaultActiveTabForPath(initialPathname, initialPage, 'agents'),
  );
  const [projectDetailMode, setProjectDetailMode] =
    useState<ProjectDetailMode>(projectDetailModeTabs[0]);
  const [searchValue, setSearchValue] = useState('');
  const [isTitleMenuVisible, setIsTitleMenuVisible] = useState(false);
  const [hasPageScrolled, setHasPageScrolled] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isPaymentAgreementModalOpen, setIsPaymentAgreementModalOpen] =
    useState(false);
  const [isCustomAgentModalOpen, setIsCustomAgentModalOpen] = useState(false);
  const [isAiWorkstationModalOpen, setIsAiWorkstationModalOpen] =
    useState(false);
  const [isMarkAllReadModalOpen, setIsMarkAllReadModalOpen] = useState(false);
  const [markAllReadTargetMode, setMarkAllReadTargetMode] =
    useState<MessageMode>('announcements');
  const [isLogoutConfirmModalOpen, setIsLogoutConfirmModalOpen] =
    useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isMockDebugPanelOpen, setIsMockDebugPanelOpen] = useState(false);
  const [initialPolicyTab, setInitialPolicyTab] =
    useState<PolicyTab>('privacy');
  const [projectItems, setProjectItems] = useState<Project[]>(() =>
    getMockProjects(getCurrentMockUser(), projects),
  );
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(
    null,
  );
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  );
  const [isProjectDetailMenuOpen, setIsProjectDetailMenuOpen] =
    useState(false);
  const [renamingProjectTaskKey, setRenamingProjectTaskKey] = useState<
    string | null
  >(null);
  const [deletingProjectTaskKey, setDeletingProjectTaskKey] = useState<
    string | null
  >(null);
  const [renamingProjectFileKey, setRenamingProjectFileKey] = useState<
    string | null
  >(null);
  const [deletingProjectFileKeys, setDeletingProjectFileKeys] = useState<
    string[] | null
  >(null);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(() =>
    getCurrentMockUser(),
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginAccountSelectionModalOpen, setIsLoginAccountSelectionModalOpen] =
    useState(false);
  const [profileAvatarSrc, setProfileAvatarSrc] = useState(
    () => getCurrentMockUser()?.avatarSrc ?? '/assets/home/Avatar.png',
  );
  const [profileNickname, setProfileNickname] = useState(
    () => getCurrentMockUser()?.nickname ?? defaultProfileNickname,
  );
  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] =
    useState(false);
  const [agentDataRefreshKey, setAgentDataRefreshKey] = useState(0);
  const [expandedMessageIdsByTab, setExpandedMessageIdsByTab] = useState<
    Record<string, Set<string>>
  >(
    () => ({
      [getMessageStateKey('announcements', '全部')]: new Set(),
      [getMessageStateKey('announcements', '未读')]: new Set(),
      [getMessageStateKey('announcements', '已读')]: new Set(),
      [getMessageStateKey('activity', '全部')]: new Set(),
      [getMessageStateKey('activity', '未读')]: new Set(),
      [getMessageStateKey('activity', '已读')]: new Set(),
    }),
  );

  const handleCloseProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  useEffect(() => {
    function syncCurrentUser() {
      const nextCurrentUser = getCurrentMockUser();

      setCurrentUser(nextCurrentUser);
      if (nextCurrentUser !== null) {
        setProfileAvatarSrc(nextCurrentUser.avatarSrc);
        setProfileNickname(nextCurrentUser.nickname);
      }
      setMessagesByMode(getMockMessages(nextCurrentUser));
      setProjectItems(getMockProjects(nextCurrentUser, projects));
      setAccountData(getMockAccountData(nextCurrentUser, seededAccountData));
      setPendingReadMessageIds(new Set());
    }

    window.addEventListener(mockUserChangedEventName, syncCurrentUser);
    window.addEventListener(mockMessagesChangedEventName, syncCurrentUser);
    window.addEventListener(mockProjectsChangedEventName, syncCurrentUser);
    window.addEventListener(mockAccountChangedEventName, syncCurrentUser);
    window.addEventListener('storage', syncCurrentUser);
    syncCurrentUser();

    return () => {
      window.removeEventListener(mockUserChangedEventName, syncCurrentUser);
      window.removeEventListener(mockMessagesChangedEventName, syncCurrentUser);
      window.removeEventListener(mockProjectsChangedEventName, syncCurrentUser);
      window.removeEventListener(mockAccountChangedEventName, syncCurrentUser);
      window.removeEventListener('storage', syncCurrentUser);
    };
  }, []);
  useEffect(() => {
    if (!isProjectDetailMenuOpen) return undefined;

    const closeMenu = () => setIsProjectDetailMenuOpen(false);

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [isProjectDetailMenuOpen]);
  const [shouldAnimateMessageCollapse, setShouldAnimateMessageCollapse] =
    useState(true);
  const [messagesByMode, setMessagesByMode] = useState<MockMessageByMode>(() =>
    getMockMessages(getCurrentMockUser()),
  );
  const [accountData, setAccountData] = useState<MockAccountData>(() =>
    getMockAccountData(getCurrentMockUser(), seededAccountData),
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const unreadMessageIds = useMemo(
    () => getUnreadMockMessageIds(messagesByMode),
    [messagesByMode],
  );
  const [pendingReadMessageIds, setPendingReadMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const mainRef = useRef<HTMLDivElement | null>(null);
  const pendingContentReflowRef = useRef(false);
  const filterStuckRef = useRef(false);
  const titleMenuVisibleRef = useRef(false);
  const pageScrolledRef = useRef(false);
  const mockDebugLogoClickCountRef = useRef(0);
  const mockDebugLogoClickTimerRef = useRef<number | null>(null);
  const messageAnimationFrameRef = useRef<number | null>(null);
  const normalizedSearchValue = searchValue.trim().toLowerCase();
  const messageUnreadCounts = useMemo(
    () => getMockMessageUnreadCounts(messagesByMode),
    [messagesByMode],
  );
  const messageUnreadCount =
    messageUnreadCounts.announcements + messageUnreadCounts.activity;
  const isLoggedIn = currentUser !== null;
  const currentAccount =
    selectedAccountId !== null
      ? accountData.accounts.find((account) => account.id === selectedAccountId) ??
        accountData.accounts[0] ??
        null
      : accountData.accounts[0] ?? null;
  const resolvedSelectedAccountId = currentAccount?.id ?? null;
  const currentAccountDisplayName = isLoggedIn
    ? getAccountDisplayName(currentAccount, profileNickname)
    : '点击登录';
  const handleCurrentAccountProfileNameChange = useCallback(
    (nickname: string) => {
      if (currentAccount?.type === 'enterprise') {
        setAccountData(
          updateMockAccountName(
            currentUser,
            seededAccountData,
            currentAccount.id,
            nickname,
          ),
        );
        return;
      }

      setProfileNickname(nickname);
      updateMockUserProfile({ nickname });
    },
    [currentAccount, currentUser],
  );

  const handleProfileAvatarChange = useCallback(
    (file: File) => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (typeof reader.result !== 'string') {
          return;
        }

        if (currentAccount?.type === 'enterprise') {
          setAccountData(
            updateMockAccountAvatar(
              currentUser,
              seededAccountData,
              currentAccount.id,
              reader.result,
            ),
          );
          return;
        }

        setProfileAvatarSrc(reader.result);
        updateMockUserProfile({ avatarSrc: reader.result });
      });

      reader.readAsDataURL(file);
    },
    [currentAccount, currentUser],
  );

  const handleProfileAvatarPresetSelect = useCallback(
    (avatarSrc: string) => {
      if (currentAccount?.type === 'enterprise') {
        setAccountData(
          updateMockAccountAvatar(
            currentUser,
            seededAccountData,
            currentAccount.id,
            avatarSrc,
          ),
        );
        return;
      }

      setProfileAvatarSrc(avatarSrc);
      updateMockUserProfile({ avatarSrc });
    },
    [currentAccount, currentUser],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      if (selectedAccountId !== null) {
        setSelectedAccountId(null);
      }
      return;
    }

    if (
      selectedAccountId !== null &&
      !accountData.accounts.some((account) => account.id === selectedAccountId)
    ) {
      setSelectedAccountId(accountData.accounts[0]?.id ?? null);
    }
  }, [accountData.accounts, isLoggedIn, selectedAccountId]);
  const visibleMessageUnreadCounts = isLoggedIn
    ? messageUnreadCounts
    : emptyMessageUnreadCounts;
  const visibleMessageUnreadCount = isLoggedIn ? messageUnreadCount : 0;
  const visibleUnreadMessageIds = isLoggedIn ? unreadMessageIds : emptyUnreadMessageIds;
  const currentMessages = messagesByMode[messageMode];
  const currentMessageStateKey = getMessageStateKey(messageMode, activeTab);
  const currentExpandedMessageIds =
    expandedMessageIdsByTab[currentMessageStateKey] ?? new Set<string>();
  const canMarkAllRead =
    activePage === 'messages' &&
    activeTab !== '已读' &&
    isLoggedIn &&
    messageUnreadCounts[messageMode] > 0;
  const renamingProject =
    projectItems.find((project) => project.id === renamingProjectId) ?? null;
  const deletingProject =
    projectItems.find((project) => project.id === deletingProjectId) ?? null;
  const agentDetailId = getAgentDetailIdFromPath(currentPathname);
  const currentAgentDetail =
    agentDetailId !== null
      ? cards.find((agent) => agent.id === agentDetailId) ?? null
      : null;
  const isAgentDetailPage =
    activePage === 'home' &&
    agentDetailId !== null &&
    currentAgentDetail !== null;
  const projectDetailId = getProjectDetailIdFromPath(currentPathname);
  const currentProjectDetail =
    projectDetailId !== null
      ? projectItems.find((project) => project.id === projectDetailId) ?? null
      : null;
  const projectDetailItems = currentProjectDetail?.items ?? [];
  const projectDetailFiles = currentProjectDetail?.files ?? [];
  const renamingProjectTask =
    renamingProjectTaskKey !== null
      ? projectDetailItems.find(
          (item) => getProjectTaskKey(item) === renamingProjectTaskKey,
        ) ?? null
      : null;
  const deletingProjectTask =
    deletingProjectTaskKey !== null
      ? projectDetailItems.find(
          (item) => getProjectTaskKey(item) === deletingProjectTaskKey,
        ) ?? null
      : null;
  const renamingProjectFile =
    renamingProjectFileKey !== null
      ? projectDetailFiles.find(
          (file) => getProjectFileKey(file) === renamingProjectFileKey,
        ) ?? null
      : null;
  const deletingProjectFiles =
    deletingProjectFileKeys !== null
      ? projectDetailFiles.filter((file) =>
          deletingProjectFileKeys.includes(getProjectFileKey(file)),
        )
      : [];
  const isProjectDetailPage =
    activePage === 'projects' &&
    projectDetailId !== null &&
    currentProjectDetail !== null;
  const hasOpenModal =
    isInvoiceModalOpen ||
    isSupportModalOpen ||
    isRechargeModalOpen ||
    isPaymentAgreementModalOpen ||
    isCustomAgentModalOpen ||
    isAiWorkstationModalOpen ||
    isLoginModalOpen ||
    isLoginAccountSelectionModalOpen ||
    isMarkAllReadModalOpen ||
    isLogoutConfirmModalOpen ||
    isProfileModalOpen ||
    isPolicyModalOpen ||
    isCreateProjectModalOpen ||
    renamingProjectId !== null ||
    deletingProjectId !== null ||
    renamingProjectTaskKey !== null ||
    deletingProjectTaskKey !== null ||
    renamingProjectFileKey !== null ||
    deletingProjectFileKeys !== null;
  const stickyStartScrollTop =
    isProjectDetailPage || isAgentDetailPage
      ? contentTitleHeight
      : activePage === 'home'
      ? heroSectionHeight + contentTitleHeight
      : activePage === 'projects'
        ? projectTitleHeight
        : activePage === 'messages'
          ? contentTitleHeight
        : accountStickyStartScrollTop;
  const titleMenuVisibleScrollTop = Math.max(
    0,
    isProjectDetailPage || isAgentDetailPage
      ? contentTitleHeight
      : getTitleMenuVisibleScrollTop(activePage),
  );
  const filteredCards =
    normalizedSearchValue.length === 0
      ? previewCards
      : previewCards.filter((card) => {
          const searchableText = `${card.title} ${card.description}`.toLowerCase();

          return searchableText.includes(normalizedSearchValue);
        });
  const filteredWorkflows =
    normalizedSearchValue.length === 0
      ? previewWorkflowCards
      : previewWorkflowCards.filter((workflow) => {
          const searchableText =
            `${workflow.title} ${workflow.author} ${workflow.date} ${workflow.frequency}`.toLowerCase();

          return searchableText.includes(normalizedSearchValue);
        });
  const filteredProjects =
    normalizedSearchValue.length === 0
      ? projectItems
      : projectItems.filter((project) => {
          const itemText = project.items
            .map((item) => `${item.title} ${item.project} ${item.time} ${item.task}`)
            .join(' ');
          const searchableText = `${project.title} ${itemText}`.toLowerCase();

          return searchableText.includes(normalizedSearchValue);
        });
  const filteredProjectDetailItems = projectDetailItems.filter((item) => {
    const isRunning = 'status' in item && Boolean(item.status);

    if (activeTab === '运行中' && !isRunning) {
      return false;
    }

    if (activeTab === '已完成' && isRunning) {
      return false;
    }

    if (normalizedSearchValue.length === 0) {
      return true;
    }

    const searchableText =
      `${item.title} ${item.project} ${item.time} ${item.task}`.toLowerCase();

    return searchableText.includes(normalizedSearchValue);
  });
  const filteredProjectDetailFiles = projectDetailFiles
    .filter((file) => {
      if (normalizedSearchValue.length === 0) {
        return true;
      }

      const searchableText = `${file.name} ${file.type}`.toLowerCase();

      return searchableText.includes(normalizedSearchValue);
    })
    .sort((firstFile, secondFile) => {
      if (activeTab === '名称') {
        return firstFile.name.localeCompare(secondFile.name, 'zh-Hans-CN');
      }

      return secondFile.date.localeCompare(firstFile.date);
    });
  const filteredBillingDetails =
    normalizedSearchValue.length === 0
      ? accountData.billingDetails
      : accountData.billingDetails.filter((detail) => {
          const searchableText =
            `${detail.date} ${detail.amount} ${detail.originalAmount} ${detail.discount}`.toLowerCase();

          return searchableText.includes(normalizedSearchValue);
        });
  const filteredProductBillingDetails =
    normalizedSearchValue.length === 0
      ? accountData.productBillingDetails
      : accountData.productBillingDetails.filter((detail) => {
          const searchableText =
            `${detail.model} ${detail.type} ${detail.amount}`.toLowerCase();

          return searchableText.includes(normalizedSearchValue);
        });
  const filteredRequestBillingDetails =
    normalizedSearchValue.length === 0
      ? accountData.requestBillingDetails
      : accountData.requestBillingDetails.filter((detail) => {
          const searchableText =
            `${detail.model} ${detail.time} ${detail.apiKey} ${detail.tokens} ${detail.originalAmount} ${detail.amount}`.toLowerCase();

          return searchableText.includes(normalizedSearchValue);
        });
  const filteredMessages = currentMessages.filter((message) => {
    const isUnread = unreadMessageIds.has(message.id);
    const isPendingReadInUnreadTab =
      activeTab === '未读' && pendingReadMessageIds.has(message.id);

    if (activeTab === '未读' && !isUnread && !isPendingReadInUnreadTab) {
      return false;
    }

    if (activeTab === '已读' && isUnread) {
      return false;
    }

    if (normalizedSearchValue.length === 0) {
      return true;
    }

    const searchableText =
      `${message.title} ${message.time} ${message.content}`.toLowerCase();

    return searchableText.includes(normalizedSearchValue);
  });

  const resetExpandedMessages = useCallback(() => {
    setExpandedMessageIdsByTab({
      [getMessageStateKey('announcements', '全部')]: new Set(),
      [getMessageStateKey('announcements', '未读')]: new Set(),
      [getMessageStateKey('announcements', '已读')]: new Set(),
      [getMessageStateKey('activity', '全部')]: new Set(),
      [getMessageStateKey('activity', '未读')]: new Set(),
      [getMessageStateKey('activity', '已读')]: new Set(),
    });
  }, []);

  const restoreMessageCollapseAnimationOnNextFrame = useCallback(() => {
    if (messageAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(messageAnimationFrameRef.current);
    }

    messageAnimationFrameRef.current = window.requestAnimationFrame(() => {
      messageAnimationFrameRef.current = null;
      setShouldAnimateMessageCollapse(true);
    });
  }, []);

  const quietMessageListTransition = useCallback(() => {
    setShouldAnimateMessageCollapse(false);
    restoreMessageCollapseAnimationOnNextFrame();
  }, [restoreMessageCollapseAnimationOnNextFrame]);

  useEffect(() => {
    if (!hasOpenModal) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const originalBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.top = originalBodyStyle.top;
      document.body.style.left = originalBodyStyle.left;
      document.body.style.right = originalBodyStyle.right;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.overflow = originalBodyStyle.overflow;
      window.scrollTo({ top: scrollY });
    };
  }, [hasOpenModal]);

  useEffect(() => {
    return () => {
      if (messageAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(messageAnimationFrameRef.current);
      }

      if (mockDebugLogoClickTimerRef.current !== null) {
        window.clearTimeout(mockDebugLogoClickTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handlePopState() {
      const nextPathname = window.location.pathname;
      const nextPage = getPageFromPath(nextPathname);
      const nextProjectDetailId = getProjectDetailIdFromPath(nextPathname);
      const nextAgentDetailId = getAgentDetailIdFromPath(nextPathname);

      setCurrentPathname(nextPathname);
      setActivePage(nextPage);
      setIsNotificationPopoverOpen(false);
      setIsTitleMenuVisible(false);
      filterStuckRef.current = false;
      titleMenuVisibleRef.current = false;
      if (nextPage === 'messages') {
        quietMessageListTransition();
        resetExpandedMessages();
      }
      if (nextProjectDetailId !== null) {
        setProjectDetailMode(projectDetailModeTabs[0]);
        setActiveTab(projectDetailTabs[0]);
      } else if (nextAgentDetailId === null) {
        setSearchValue('');
        setProjectDetailMode(projectDetailModeTabs[0]);
        setActiveTab(getDefaultActiveTab(nextPage, viewMode));
      } else {
        setViewMode('agents');
      }
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quietMessageListTransition, resetExpandedMessages, viewMode]);

  const updateResultAreaHeight = useCallback(() => {
    const mainElement = mainRef.current;
    const filterElement = mainElement?.querySelector('.home-filter-bar');

    if (!mainElement || !(filterElement instanceof HTMLElement)) {
      return;
    }

    const filterRect = filterElement.getBoundingClientRect();
    const cardAreaTop = Math.max(0, filterRect.bottom);
    const resultMinHeight = Math.max(0, window.innerHeight - cardAreaTop);

    mainElement.style.setProperty(
      '--home-results-min-height',
      `${Math.round(resultMinHeight)}px`,
    );
  }, []);

  const applyStickyScrollState = useCallback(
    (nextOffset: number) => {
      const mainElement = mainRef.current;
      const scrollTop = Math.max(0, nextOffset);
      const stickyMetrics = getStickyMetrics(
        scrollTop,
        stickyStartScrollTop,
      );

      mainElement?.style.setProperty(
        '--home-filter-padding',
        `${Math.round(stickyMetrics.filterPadding)}px`,
      );
      mainElement?.style.setProperty(
        '--home-sticky-spacer-height',
        `${Math.round(stickyMetrics.spacerHeight)}px`,
      );

      if (filterStuckRef.current !== stickyMetrics.isStuck) {
        filterStuckRef.current = stickyMetrics.isStuck;
      }

      const isTitleMenuVisibleNext = scrollTop >= titleMenuVisibleScrollTop;

      if (titleMenuVisibleRef.current !== isTitleMenuVisibleNext) {
        titleMenuVisibleRef.current = isTitleMenuVisibleNext;
        setIsTitleMenuVisible(isTitleMenuVisibleNext);
      }

      const hasPageScrolledNext = scrollTop > 0;

      if (pageScrolledRef.current !== hasPageScrolledNext) {
        pageScrolledRef.current = hasPageScrolledNext;
        setHasPageScrolled(hasPageScrolledNext);
      }
    },
    [stickyStartScrollTop, titleMenuVisibleScrollTop],
  );

  useEffect(() => {
    const mainElement = mainRef.current;

    if (!mainElement) {
      return undefined;
    }

    function syncStickyState() {
      applyStickyScrollState(window.scrollY);
      updateResultAreaHeight();
    }

    applyStickyScrollState(window.scrollY);
    updateResultAreaHeight();
    window.addEventListener('scroll', syncStickyState, { passive: true });
    window.addEventListener('resize', syncStickyState);

    return () => {
      window.removeEventListener('scroll', syncStickyState);
      window.removeEventListener('resize', syncStickyState);
    };
  }, [applyStickyScrollState, updateResultAreaHeight]);

  const alignResultsToCurrentTab = useCallback(() => {
    const mainElement = mainRef.current;
    const resultsElement = mainElement?.querySelector('.home-results-scroll');
    const filterElement = mainElement?.querySelector('.home-filter-bar');

    if (
      !mainElement ||
      !(resultsElement instanceof HTMLElement) ||
      !(filterElement instanceof HTMLElement)
    ) {
      return;
    }

    updateResultAreaHeight();

    const resultsRect = resultsElement.getBoundingClientRect();
    const filterRect = filterElement.getBoundingClientRect();
    const cardAreaTop = Math.max(0, filterRect.bottom);
    const resultsTopInScroll = resultsRect.top + window.scrollY;
    const nextScrollTop = Math.max(0, resultsTopInScroll - cardAreaTop);

    window.scrollTo({ top: nextScrollTop });
    applyStickyScrollState(nextScrollTop);
    updateResultAreaHeight();
  }, [applyStickyScrollState, updateResultAreaHeight]);

  useLayoutEffect(() => {
    const mainElement = mainRef.current;

    if (!mainElement) {
      return;
    }

    if (pendingContentReflowRef.current) {
      alignResultsToCurrentTab();
      pendingContentReflowRef.current = false;
    }

    updateResultAreaHeight();
    applyStickyScrollState(window.scrollY);
  }, [
    activeTab,
    alignResultsToCurrentTab,
    applyStickyScrollState,
    filteredCards.length,
    filteredWorkflows.length,
    filteredProjects.length,
    filteredProjectDetailItems.length,
    filteredProjectDetailFiles.length,
    filteredBillingDetails.length,
    filteredMessages.length,
    filteredProductBillingDetails.length,
    filteredRequestBillingDetails.length,
    messageUnreadCount,
    pendingReadMessageIds.size,
    searchValue,
    updateResultAreaHeight,
    activePage,
    viewMode,
    projectDetailMode,
  ]);

  function prepareContentReflow() {
    updateResultAreaHeight();
    pendingContentReflowRef.current = true;
  }

  function handleSearchValueChange(nextValue: string) {
    prepareContentReflow();
    setSearchValue(nextValue);
  }

  function handleActiveTabChange(nextActiveTab: string) {
    prepareContentReflow();
    if (activePage === 'messages' && activeTab === '未读' && nextActiveTab !== '未读') {
      setPendingReadMessageIds(new Set());
    }
    if (activePage === 'messages' && activeTab !== nextActiveTab) {
      quietMessageListTransition();
    }
    setActiveTab(nextActiveTab);
  }

  function handleViewModeChange(nextViewMode: ViewMode) {
    prepareContentReflow();
    setViewMode(nextViewMode);
    setSearchValue('');
    setActiveTab(nextViewMode === 'agents' ? tabs[0] : workflowTabs[0]);
  }

  function handleMessageModeChange(nextMessageMode: MessageMode) {
    prepareContentReflow();
    quietMessageListTransition();
    setMessageMode(nextMessageMode);
    setPendingReadMessageIds(new Set());
  }

  function handlePageChange(nextPage: PageMode) {
    const nextPath = pagePaths[nextPage];

    if (nextPage === activePage && currentPathname === nextPath) {
      return;
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    setCurrentPathname(nextPath);
    setActivePage(nextPage);
    setProjectDetailMode(projectDetailModeTabs[0]);
    setSearchValue('');
    setIsNotificationPopoverOpen(false);
    setIsProjectDetailMenuOpen(false);
    setPendingReadMessageIds(new Set());
    if (nextPage === 'messages') {
      quietMessageListTransition();
      resetExpandedMessages();
    }
    setIsTitleMenuVisible(false);
    filterStuckRef.current = false;
    titleMenuVisibleRef.current = false;
    window.scrollTo({ top: 0 });
    setActiveTab(getDefaultActiveTab(nextPage, viewMode));
  }

  function handleCreateProject(projectName: string) {
    const projectTitle = projectName.trim();
    if (!projectTitle) return;

    const createdProject: Project = {
      id: `project-${Date.now()}`,
      title: projectTitle,
      count: 0,
      createdAt: formatProjectCreatedAt(),
      items: [],
      files: [],
    };

    updateProjectItems((currentProjects) => [createdProject, ...currentProjects]);
  }

  function handleRenameProject(projectId: string, projectName: string) {
    const projectTitle = projectName.trim();
    if (!projectTitle) return;

    updateProjectItems((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              title: projectTitle,
              items: project.items.map((item) => ({
                ...item,
                project: projectTitle,
              })),
            }
          : project,
      ),
    );
  }

  function handleDeleteProject(projectId: string) {
    if (projectDetailId === projectId) {
      handlePageChange('projects');
    }

    updateProjectItems((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId),
    );
  }

  function handleRenameProjectTask(taskKey: string, taskName: string) {
    const taskTitle = taskName.trim();
    if (!taskTitle || projectDetailId === null) return;

    updateProjectItems((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectDetailId
          ? {
              ...project,
              items: project.items.map((item) =>
                getProjectTaskKey(item) === taskKey
                  ? { ...item, title: taskTitle }
                  : item,
              ),
            }
          : project,
      ),
    );
    setDeletingProjectFileKeys(null);
  }

  function handleDeleteProjectTask(taskKey: string) {
    if (projectDetailId === null) return;

    updateProjectItems((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectDetailId) {
          return project;
        }

        const nextItems = project.items.filter(
          (item) => getProjectTaskKey(item) !== taskKey,
        );

        return {
          ...project,
          count: nextItems.length,
          items: nextItems,
        };
      }),
    );
  }

  function handleRenameProjectFile(fileKey: string, fileName: string) {
    const nextFileName = fileName.trim();
    if (!nextFileName || projectDetailId === null) return;

    updateProjectItems((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectDetailId
          ? {
              ...project,
              files: (project.files ?? []).map((file) =>
                getProjectFileKey(file) === fileKey
                  ? { ...file, name: nextFileName }
                  : file,
              ),
            }
          : project,
      ),
    );
    setRenamingProjectFileKey(null);
  }

  function handleDeleteProjectFiles(fileKeys: string[]) {
    if (projectDetailId === null || fileKeys.length === 0) return;

    const fileKeySet = new Set(fileKeys);

    updateProjectItems((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectDetailId
          ? {
              ...project,
              files: (project.files ?? []).filter(
                (file) => !fileKeySet.has(getProjectFileKey(file)),
              ),
            }
          : project,
      ),
    );
  }

  function handleOpenProjectDetail(project: Project) {
    const nextPath = getProjectDetailPath(project.id);

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    setCurrentPathname(nextPath);
    setActivePage('projects');
    setProjectDetailMode(projectDetailModeTabs[0]);
    setActiveTab(projectDetailTabs[0]);
    setSearchValue('');
    setIsNotificationPopoverOpen(false);
    setIsProjectDetailMenuOpen(false);
    setIsTitleMenuVisible(false);
    filterStuckRef.current = false;
    titleMenuVisibleRef.current = false;
    window.scrollTo({ top: 0 });
  }

  function handleProjectDetailBack() {
    handlePageChange('projects');
  }

  function handleOpenAgentDetail(agent: AgentCardData) {
    const nextPath = getAgentDetailPath(agent.id);

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    setCurrentPathname(nextPath);
    setActivePage('home');
    setViewMode('agents');
    setIsNotificationPopoverOpen(false);
    setIsTitleMenuVisible(false);
    filterStuckRef.current = false;
    titleMenuVisibleRef.current = false;
    window.scrollTo({ top: 0 });
  }

  function handleAgentDetailBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    handlePageChange('home');
  }

  function handleProjectDetailModeChange(nextMode: ProjectDetailMode) {
    prepareContentReflow();
    setProjectDetailMode(nextMode);
    setActiveTab(nextMode === '文件' ? projectTabs[0] : projectDetailTabs[0]);
    setSearchValue('');
  }

  function handleNotificationMessageClick(
    targetMessageMode: MessageMode,
    messageId: string,
  ) {
    const targetMessageStateKey = getMessageStateKey(
      targetMessageMode,
      messageTabs[0],
    );
    const isTargetAlreadyExpanded =
      activePage === 'messages' &&
      messageMode === targetMessageMode &&
      activeTab === messageTabs[0] &&
      (expandedMessageIdsByTab[targetMessageStateKey] ?? new Set<string>()).has(
        messageId,
      );

    if (window.location.pathname !== pagePaths.messages) {
      window.history.pushState(null, '', pagePaths.messages);
    }

    setCurrentPathname(pagePaths.messages);
    setActivePage('messages');
    setMessageMode(targetMessageMode);
    setActiveTab(messageTabs[0]);
    setSearchValue('');
    setPendingReadMessageIds(new Set());
    setIsNotificationPopoverOpen(false);
    setIsTitleMenuVisible(false);
    filterStuckRef.current = false;
    titleMenuVisibleRef.current = false;
    window.scrollTo({ top: 0 });
    if (!isTargetAlreadyExpanded) {
      quietMessageListTransition();
      resetExpandedMessages();

      if (messageAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(messageAnimationFrameRef.current);
      }

      messageAnimationFrameRef.current = window.requestAnimationFrame(() => {
        messageAnimationFrameRef.current = null;
        setShouldAnimateMessageCollapse(true);
        setExpandedMessageIdsByTab((currentMap) => ({
          ...currentMap,
          [targetMessageStateKey]: new Set([messageId]),
        }));
      });
    }
    setMessagesByMode(markMockMessageRead(currentUser, targetMessageMode, messageId));
  }

  function handleOpenMarkAllReadModal(targetMessageMode: MessageMode) {
    setMarkAllReadTargetMode(targetMessageMode);
    setIsMarkAllReadModalOpen(true);
  }

  function handleOpenPolicyModal(tab: PolicyTab = 'privacy') {
    setInitialPolicyTab(tab);
    setIsPolicyModalOpen(true);
  }

  function handleRechargeClick() {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsRechargeModalOpen(true);
  }

  function handleInvoiceClick() {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsInvoiceModalOpen(true);
  }

  function handleCreateProjectClick() {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsCreateProjectModalOpen(true);
  }

  function handleAiWorkstationClick() {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsAiWorkstationModalOpen(true);
  }

  function handleNotificationMarkAllRead(targetMessageMode: MessageMode) {
    setIsNotificationPopoverOpen(false);
    handleOpenMarkAllReadModal(targetMessageMode);
  }

  function handleNotificationAllMessagesClick() {
    setIsNotificationPopoverOpen(false);
    handlePageChange('messages');
  }

  function handleOpenProfileModal() {
    setIsProfileModalOpen(false);

    window.requestAnimationFrame(() => {
      setIsProfileModalOpen(true);
    });
  }

  function applyMockUser(nextUser: MockUser | null) {
    setCurrentUser(nextUser);
    setMessagesByMode(getMockMessages(nextUser));
    setProjectItems(getMockProjects(nextUser, projects));
    const nextAccountData = getMockAccountData(nextUser, seededAccountData);
    setAccountData(nextAccountData);
    setSelectedAccountId(nextAccountData.accounts[0]?.id ?? null);
    setPendingReadMessageIds(new Set());

    if (nextUser !== null) {
      setProfileAvatarSrc(nextUser.avatarSrc);
      setProfileNickname(nextUser.nickname);
    }
  }

  function updateProjectItems(
    getNextProjects: (currentProjects: Project[]) => Project[],
  ) {
    setProjectItems((currentProjects) => {
      const nextProjects = getNextProjects(currentProjects);

      return saveCurrentMockProjects(currentUser, nextProjects);
    });
  }

  function handleMockDebugLogoClick() {
    if (!import.meta.env.DEV) return;

    mockDebugLogoClickCountRef.current += 1;

    if (mockDebugLogoClickTimerRef.current !== null) {
      window.clearTimeout(mockDebugLogoClickTimerRef.current);
    }

    mockDebugLogoClickTimerRef.current = window.setTimeout(() => {
      mockDebugLogoClickCountRef.current = 0;
      mockDebugLogoClickTimerRef.current = null;
    }, 1200);

    if (mockDebugLogoClickCountRef.current < 3) return;

    mockDebugLogoClickCountRef.current = 0;
    if (mockDebugLogoClickTimerRef.current !== null) {
      window.clearTimeout(mockDebugLogoClickTimerRef.current);
      mockDebugLogoClickTimerRef.current = null;
    }
    setIsMockDebugPanelOpen(true);
  }

  function handleMockDebugLogin(phone: string) {
    const nextUser = loginMockUser(phone);

    applyMockUser(nextUser);
  }

  function handleMockDebugLogout() {
    logoutMockUser();
    applyMockUser(null);
  }

  function handleMockDebugResetMessages() {
    setMessagesByMode(resetMockMessages(currentUser));
    setPendingReadMessageIds(new Set());
    resetExpandedMessages();
  }

  function handleMockDebugResetProjects() {
    setProjectItems(resetMockProjects(currentUser, projects));
    if (projectDetailId !== null) {
      handlePageChange('projects');
    }
  }

  function handleMockDebugResetAccount() {
    const nextAccountData = resetMockAccountData(currentUser, seededAccountData);
    resetMockAgentAccountState(nextAccountData.accounts.map((account) => account.id));
    setAccountData(nextAccountData);
    setSelectedAccountId(nextAccountData.accounts[0]?.id ?? null);
    setAgentDataRefreshKey((currentKey) => currentKey + 1);
  }

  function handleMockDebugAiWorkstationConnectionStatusChange(
    status: MockAiWorkstationConnectionStatus,
  ) {
    const nextUser = updateMockAiWorkstationConnectionStatus(status);

    if (nextUser !== null) {
      applyMockUser(nextUser);
    }
  }

  function handleMockDebugResetAiWorkstationConnectionStatus() {
    const nextUser = resetMockAiWorkstationConnectionStatus();

    if (nextUser !== null) {
      applyMockUser(nextUser);
    }
  }

  function handleAiWorkstationPairComplete() {
    const nextUser = updateMockAiWorkstationConnectionStatus('connected');

    if (nextUser !== null) {
      applyMockUser(nextUser);
    }
  }

  function handleAiWorkstationOverviewClick() {
    setIsAiWorkstationModalOpen(false);
    handlePageChange('account');
  }

  function handleMockDebugAddExtraAccount() {
    const nextAccountData = addMockExtraAccountData(currentUser, seededAccountData);
    const nextSelectedAccount =
      nextAccountData.accounts[nextAccountData.accounts.length - 1] ?? null;
    setAccountData(nextAccountData);
    setSelectedAccountId(nextSelectedAccount?.id ?? null);
  }

  function handleMockDebugResetExtraAccounts() {
    const nextAccountData = resetMockExtraAccountData(currentUser, seededAccountData);
    setAccountData(nextAccountData);
    setSelectedAccountId((currentSelectedAccountId) => {
      if (
        currentSelectedAccountId !== null &&
        nextAccountData.accounts.some(
          (account) => account.id === currentSelectedAccountId,
        )
      ) {
        return currentSelectedAccountId;
      }

      return nextAccountData.accounts[0]?.id ?? null;
    });
  }

  function handleMockDebugPushMessage(targetMessageMode: MessageMode) {
    setMessagesByMode(pushMockMessage(currentUser, targetMessageMode));
    setPendingReadMessageIds(new Set());
  }

  function handleMessageToggle(messageId: string) {
    const willExpand = !currentExpandedMessageIds.has(messageId);

    setExpandedMessageIdsByTab((currentMap) => {
      const currentIds = currentMap[currentMessageStateKey] ?? new Set<string>();
      const nextIds = new Set(currentIds);

      if (nextIds.has(messageId)) {
        nextIds.delete(messageId);
      } else {
        nextIds.add(messageId);
      }

      return {
        ...currentMap,
        [currentMessageStateKey]: nextIds,
      };
    });

    if (willExpand) {
      if (activeTab === '未读' && unreadMessageIds.has(messageId)) {
        setPendingReadMessageIds((currentIds) => {
          const nextIds = new Set(currentIds);

          nextIds.add(messageId);

          return nextIds;
        });
      }

      setMessagesByMode(markMockMessageRead(currentUser, messageMode, messageId));
    }
  }

  return (
    <div className="min-h-screen min-w-[1024px] bg-bg-soft text-text-primary">
      <SideNav
        collapsed={isSidebarCollapsed}
        showCollapsedToggle={showCollapsedToggle}
        activePage={activePage}
        messageUnreadCount={visibleMessageUnreadCount}
        profileAvatarSrc={profileAvatarSrc}
        profileLabel={currentAccountDisplayName}
        profileNickname={profileNickname}
        profilePhone={currentUser?.phone ?? ''}
        aiWorkstationConnectionStatus={
          currentUser?.aiWorkstationConnectionStatus ?? 'not-connected'
        }
        currentAccount={currentAccount}
        accounts={accountData.accounts}
        selectedAccountId={resolvedSelectedAccountId}
        isLoggedIn={isLoggedIn}
        onToggle={() => {
          setShowCollapsedToggle(false);
          setIsSidebarCollapsed((value) => !value);
        }}
        onPageChange={handlePageChange}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onAiWorkstationClick={handleAiWorkstationClick}
        onAccountSelect={setSelectedAccountId}
        onProfileClick={handleOpenProfileModal}
        onPolicyClick={() => handleOpenPolicyModal('privacy')}
        onSupportClick={() => setIsSupportModalOpen(true)}
        onLogout={() => setIsLogoutConfirmModalOpen(true)}
        onLogoClick={handleMockDebugLogoClick}
        onCollapsedMouseEnter={() => setShowCollapsedToggle(true)}
        onCollapsedMouseLeave={() => setShowCollapsedToggle(false)}
      />
      <main
        className={[
          'relative min-h-screen bg-bg-soft transition-[margin-left] duration-200 ease-out',
          isSidebarCollapsed ? 'ml-[52px]' : 'ml-[240px]',
        ].join(' ')}
      >
        <TitleBar
          activePage={activePage}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          messageMode={messageMode}
          notificationMode={notificationMode}
          messagesByMode={messagesByMode}
          messageUnreadCount={visibleMessageUnreadCount}
          messageUnreadCounts={visibleMessageUnreadCounts}
          onMessageModeChange={handleMessageModeChange}
          onCustomAgentClick={() => setIsCustomAgentModalOpen(true)}
          onRechargeClick={handleRechargeClick}
          notificationOpen={isNotificationPopoverOpen}
          onNotificationToggle={() =>
            setIsNotificationPopoverOpen((currentValue) => !currentValue)
          }
          onNotificationClose={() => setIsNotificationPopoverOpen(false)}
          onNotificationModeChange={setNotificationMode}
          onNotificationMessageClick={handleNotificationMessageClick}
          onNotificationMarkAllRead={handleNotificationMarkAllRead}
          onNotificationAllMessagesClick={handleNotificationAllMessagesClick}
          unreadMessageIds={visibleUnreadMessageIds}
          showModeTabs={
            isTitleMenuVisible && !isProjectDetailPage && !isAgentDetailPage
          }
          showDivider={hasPageScrolled}
          sidebarCollapsed={isSidebarCollapsed}
          isLoggedIn={isLoggedIn}
          accountsToShow={accountData.accounts}
          currentAccount={currentAccount}
          selectedAccountId={resolvedSelectedAccountId}
          profileAvatarSrc={profileAvatarSrc}
          profileNickname={profileNickname}
          profilePhone={currentUser?.phone ?? ''}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSwitchAccountClick={() => setIsLoginModalOpen(true)}
          onAccountSelect={setSelectedAccountId}
          onProfileClick={handleOpenProfileModal}
          onSupportClick={() => setIsSupportModalOpen(true)}
          onLogoutClick={() => setIsLogoutConfirmModalOpen(true)}
          projectDetailTitle={isProjectDetailPage ? currentProjectDetail.title : null}
          onProjectDetailBack={handleProjectDetailBack}
          agentDetailTitle={isAgentDetailPage ? currentAgentDetail.title : null}
          onAgentDetailBack={handleAgentDetailBack}
          projectDetailMenuOpen={isProjectDetailPage && isProjectDetailMenuOpen}
          onProjectDetailMenuToggle={() =>
            setIsProjectDetailMenuOpen((currentValue) => !currentValue)
          }
          onProjectDetailMenuClose={() => setIsProjectDetailMenuOpen(false)}
          onProjectDetailRename={
            currentProjectDetail
              ? () => {
                  setIsProjectDetailMenuOpen(false);
                  setRenamingProjectId(currentProjectDetail.id);
                }
              : undefined
          }
          onProjectDetailDelete={
            currentProjectDetail
              ? () => {
                  setIsProjectDetailMenuOpen(false);
                  setDeletingProjectId(currentProjectDetail.id);
                }
              : undefined
          }
        />
        <div
          ref={mainRef}
          className="home-page-scroll relative bg-bg-soft pt-14"
        >
          {isAgentDetailPage ? (
            <AgentDetailPage
              agent={currentAgentDetail}
              currentAccount={currentAccount}
              externalRefreshKey={agentDataRefreshKey}
              profileAvatarSrc={profileAvatarSrc}
              profileLabel={currentAccountDisplayName}
            />
          ) : isProjectDetailPage ? (
            <ProjectDetailView
              mode={projectDetailMode}
              onModeChange={handleProjectDetailModeChange}
              activeTab={activeTab}
              onActiveTabChange={handleActiveTabChange}
              searchValue={searchValue}
              onSearchValueChange={handleSearchValueChange}
              tasksToShow={filteredProjectDetailItems}
              filesToShow={filteredProjectDetailFiles}
              onRenameTask={(item) =>
                setRenamingProjectTaskKey(getProjectTaskKey(item))
              }
              onDeleteTask={(item) =>
                setDeletingProjectTaskKey(getProjectTaskKey(item))
              }
              onRenameFile={(file) =>
                setRenamingProjectFileKey(getProjectFileKey(file))
              }
              onRequestDeleteFiles={setDeletingProjectFileKeys}
            />
          ) : (
            <>
              {activePage === 'home' && <HeroSection />}
              <StickyHeader
                activePage={activePage}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                messageMode={messageMode}
                messageUnreadCounts={visibleMessageUnreadCounts}
                onMessageModeChange={handleMessageModeChange}
                activeTab={activeTab}
                onActiveTabChange={handleActiveTabChange}
                searchValue={searchValue}
                onSearchValueChange={handleSearchValueChange}
                onInvoiceClick={handleInvoiceClick}
                onRechargeClick={handleRechargeClick}
                accountStatsToShow={accountData.stats}
                onMarkAllReadClick={() => handleOpenMarkAllReadModal(messageMode)}
                canMarkAllRead={canMarkAllRead}
                onCreateProjectClick={handleCreateProjectClick}
              />
              <div className="home-sticky-spacer" aria-hidden="true" />
              <div className="home-results-scroll">
                <section className="home-results-content page-section-x">
                  {activePage === 'projects' ? (
                    <ProjectList
                      projectsToShow={filteredProjects}
                      isSearching={searchValue.trim().length > 0}
                      onChooseAgent={() => handlePageChange('home')}
                      onCreateProject={handleCreateProjectClick}
                      onRenameProject={(project) => setRenamingProjectId(project.id)}
                      onDeleteProject={(project) => setDeletingProjectId(project.id)}
                      onOpenProjectDetail={handleOpenProjectDetail}
                    />
                  ) : activePage === 'account' ? (
                    activeTab === '产品账单' ? (
                      <ProductBillingList
                        detailsToShow={filteredProductBillingDetails}
                        isSearching={searchValue.trim().length > 0}
                      />
                    ) : activeTab === '请求明细' ? (
                      <RequestBillingList
                        detailsToShow={filteredRequestBillingDetails}
                        isSearching={searchValue.trim().length > 0}
                      />
                    ) : (
                      <AccountDetailList
                        detailsToShow={filteredBillingDetails}
                        isSearching={searchValue.trim().length > 0}
                      />
                    )
                  ) : activePage === 'messages' ? (
                    <MessageList
                      messagesToShow={filteredMessages}
                      expandedMessageIds={currentExpandedMessageIds}
                      unreadMessageIds={unreadMessageIds}
                      animateCollapse={shouldAnimateMessageCollapse}
                      isSearching={normalizedSearchValue.length > 0}
                      onToggleMessage={handleMessageToggle}
                    />
                  ) : viewMode === 'agents' ? (
                    <CardContainer
                      cardsToShow={filteredCards}
                      currentAccount={currentAccount}
                      externalRefreshKey={agentDataRefreshKey}
                      onAgentDataChange={() => {
                        setAgentDataRefreshKey((currentKey) => currentKey + 1);
                      }}
                      onOpenAgentDetail={handleOpenAgentDetail}
                    />
                  ) : (
                    <WorkflowCardContainer workflowsToShow={filteredWorkflows} />
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </main>
      {isInvoiceModalOpen && (
        <InvoiceModal onClose={() => setIsInvoiceModalOpen(false)} />
      )}
      {isSupportModalOpen && (
        <InvoiceModal
          title="联系客服"
          description="使用微信扫码，联系客服"
          closeLabel="关闭联系客服弹窗"
          onClose={() => setIsSupportModalOpen(false)}
        />
      )}
      {isRechargeModalOpen && (
        <RechargeModal
          onClose={() => setIsRechargeModalOpen(false)}
          onPaymentAgreementClick={() => setIsPaymentAgreementModalOpen(true)}
        />
      )}
      {isPaymentAgreementModalOpen && (
        <PaymentServiceAgreementModal
          onClose={() => setIsPaymentAgreementModalOpen(false)}
        />
      )}
      {isCustomAgentModalOpen && (
        <CustomAgentModal onClose={() => setIsCustomAgentModalOpen(false)} />
      )}
      {isAiWorkstationModalOpen && (
        <AiWorkstationConnectionModal
          status={currentUser?.aiWorkstationConnectionStatus ?? 'not-connected'}
          currentUser={currentUser}
          accountStats={accountData.stats}
          avatarSrc={profileAvatarSrc}
          nickname={profileNickname}
          onPairComplete={handleAiWorkstationPairComplete}
          onOverviewClick={handleAiWorkstationOverviewClick}
          onClose={() => setIsAiWorkstationModalOpen(false)}
        />
      )}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={(phone) => {
            const nextCurrentUser = loginMockUser(phone);
            const nextAccountData = getMockAccountData(
              nextCurrentUser,
              seededAccountData,
            );

            applyMockUser(nextCurrentUser);
            if (
              nextCurrentUser.dataMode !== 'empty-data' &&
              nextAccountData.accounts.length > 1
            ) {
              window.setTimeout(() => {
                setIsLoginAccountSelectionModalOpen(true);
              }, 220);
            }
          }}
          onPrivacyClick={() => handleOpenPolicyModal('privacy')}
          onTermsClick={() => handleOpenPolicyModal('agreement')}
        />
      )}
      {isLoginAccountSelectionModalOpen && (
        <LoginAccountSelectionModal
          accounts={accountData.accounts}
          avatarSrc={profileAvatarSrc}
          nickname={profileNickname}
          phone={currentUser?.phone ?? ''}
          selectedAccountId={resolvedSelectedAccountId}
          onAccountSelect={setSelectedAccountId}
          onClose={() => setIsLoginAccountSelectionModalOpen(false)}
          onConfirm={() => setIsLoginAccountSelectionModalOpen(false)}
        />
      )}
      {isMarkAllReadModalOpen && (
        <MarkAllReadModal
          onClose={() => setIsMarkAllReadModalOpen(false)}
          onConfirm={() => {
            setMessagesByMode(markAllMockMessagesRead(currentUser, markAllReadTargetMode));
            setPendingReadMessageIds(new Set());
          }}
        />
      )}
      {isLogoutConfirmModalOpen && (
        <LogoutConfirmModal
          onClose={() => setIsLogoutConfirmModalOpen(false)}
          onConfirm={() => {
            logoutMockUser();
            applyMockUser(null);
          }}
        />
      )}
      {import.meta.env.DEV && isMockDebugPanelOpen && (
        <MockDebugPanel
          currentUser={currentUser}
          accounts={accountData.accounts}
          selectedAccountId={resolvedSelectedAccountId}
          onClose={() => setIsMockDebugPanelOpen(false)}
          onLoginWithData={() => handleMockDebugLogin('18888888888')}
          onLoginEmptyData={() => handleMockDebugLogin('16666666666')}
          onLogout={handleMockDebugLogout}
          onSelectAccount={setSelectedAccountId}
          onResetMessages={handleMockDebugResetMessages}
          onResetProjects={handleMockDebugResetProjects}
          onResetAccount={handleMockDebugResetAccount}
          onAddExtraAccount={handleMockDebugAddExtraAccount}
          onResetExtraAccounts={handleMockDebugResetExtraAccounts}
          onAiWorkstationConnectionStatusChange={
            handleMockDebugAiWorkstationConnectionStatusChange
          }
          onResetAiWorkstationConnectionStatus={
            handleMockDebugResetAiWorkstationConnectionStatus
          }
          onPushAnnouncement={() => handleMockDebugPushMessage('announcements')}
          onPushActivity={() => handleMockDebugPushMessage('activity')}
        />
      )}
      {isProfileModalOpen && (
        <ProfileModal
          account={currentAccount}
          avatarSrc={
            currentAccount?.type === 'enterprise'
              ? currentAccount.avatarSrc ?? ''
              : profileAvatarSrc
          }
          nickname={
            currentAccount?.type === 'enterprise'
              ? currentAccount.name
              : profileNickname
          }
          presetAvatarSrcs={profilePresetAvatarSrcs}
          onAvatarChange={handleProfileAvatarChange}
          onAvatarPresetSelect={handleProfileAvatarPresetSelect}
          onNicknameChange={handleCurrentAccountProfileNameChange}
          onClose={handleCloseProfileModal}
        />
      )}
      {isPolicyModalOpen && (
        <PolicyModal
          initialTab={initialPolicyTab}
          onClose={() => setIsPolicyModalOpen(false)}
        />
      )}
      {isCreateProjectModalOpen && (
        <ProjectNameModal
          title="新建项目"
          initialValue=""
          placeholder="请输入项目名称"
          focusPlacement="start"
          disableConfirmWhenEmpty={false}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onConfirm={handleCreateProject}
        />
      )}
      {renamingProject && (
        <ProjectNameModal
          title="重命名项目"
          initialValue={renamingProject.title}
          focusPlacement="end"
          onClose={() => setRenamingProjectId(null)}
          onConfirm={(projectName) =>
            handleRenameProject(renamingProject.id, projectName)
          }
        />
      )}
      {deletingProject && (
        <ProjectDeleteModal
          projectTitle={deletingProject.title}
          onClose={() => setDeletingProjectId(null)}
          onConfirm={() => handleDeleteProject(deletingProject.id)}
        />
      )}
      {renamingProjectTask && renamingProjectTaskKey && (
        <ProjectNameModal
          title="重命名任务"
          initialValue={renamingProjectTask.title}
          placeholder="请输入任务名称"
          focusPlacement="end"
          onClose={() => setRenamingProjectTaskKey(null)}
          onConfirm={(taskName) =>
            handleRenameProjectTask(renamingProjectTaskKey, taskName)
          }
        />
      )}
      {deletingProjectTask && deletingProjectTaskKey && (
        <ProjectDeleteModal
          projectTitle={deletingProjectTask.title}
          title="删除任务？"
          description="确定要删除此任务吗？删除后任务将被永久删除，且不可恢复。"
          closeLabel="关闭删除任务弹窗"
          ariaLabel={`删除${deletingProjectTask.title}任务确认`}
          onClose={() => setDeletingProjectTaskKey(null)}
          onConfirm={() => handleDeleteProjectTask(deletingProjectTaskKey)}
        />
      )}
      {renamingProjectFile && renamingProjectFileKey && (
        <ProjectNameModal
          title="修改文件名称"
          initialValue={renamingProjectFile.name}
          placeholder="请输入文件名称"
          focusPlacement="end"
          onClose={() => setRenamingProjectFileKey(null)}
          onConfirm={(fileName) =>
            handleRenameProjectFile(renamingProjectFileKey, fileName)
          }
        />
      )}
      {deletingProjectFileKeys && deletingProjectFiles.length > 0 && (
        <ProjectDeleteModal
          projectTitle={
            deletingProjectFiles.length === 1
              ? deletingProjectFiles[0].name
              : `${deletingProjectFiles.length} 个文件`
          }
          title="删除文件？"
          description={
            deletingProjectFiles.length === 1
              ? `确定要删除「${deletingProjectFiles[0].name}」吗？删除后文件将被永久删除，且不可恢复。`
              : `确定要删除选中的 ${deletingProjectFiles.length} 个文件吗？删除后文件将被永久删除，且不可恢复。`
          }
          closeLabel="关闭删除文件弹窗"
          ariaLabel="删除文件确认"
          onClose={() => setDeletingProjectFileKeys(null)}
          onConfirm={() => handleDeleteProjectFiles(deletingProjectFileKeys)}
        />
      )}
    </div>
  );
}
