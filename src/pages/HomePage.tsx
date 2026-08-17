import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent, ReactNode, Ref, RefObject } from 'react';
import {
  defaultProfileNickname,
  getCurrentMockUser,
  loginMockUser,
  logoutMockUser,
  mockUserChangedEventName,
  updateMockUserProfile,
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
  updateMockAccountName,
  type MockAccount,
  type MockAccountData,
  type MockAccountStat,
  type MockBillingDetail,
  type MockProductBillingDetail,
  type MockRequestBillingDetail,
} from '../api/mock/mockAccountApi';
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
  ContentModal,
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
    title: 'ACUI桌面悬浮窗',
    description:
      '轻量级桌面展示技能，把客户的产品、数据或品牌内容悬浮在用户桌面右下角。',
    image: '/assets/home/card-acui.png',
  },
  {
    title: 'Airtable数据管理',
    description: '用 RESTAPI 操作 Airtable: 增删改查、筛选、更新插入。',
    image: '/assets/home/card-airtable.png',
  },
  {
    title: 'Apple备忘录',
    description: '用 memoCLI 管理 Apple 备忘录:创建、搜索、编辑。',
    image: '/assets/home/card-apple-notes.png',
  },
  {
    title: 'Apple提醒事项',
    description: '用 remindctl 管理提醒事项:添加、列出、完成。',
    image: '/assets/home/card-reminders.png',
  },
  {
    title: '架构图生成',
    description: '生成深色 SVG 架构/云/基础设施图 (HTML)0',
    image: '/assets/home/card-architecture.png',
  },
  {
    title: 'arXiv 论文检索',
    description: '按关键词/作者/分类/ ID 检索 arXiv 论文。',
    image: '/assets/home/card-arxiv.png',
  },
  {
    title: '字符画生成',
    description: '字符画: pyfiglet、cowsay、boxes、图片转字符。',
    image: '/assets/home/card-ascii.png',
  },
  {
    title: '字符视频生成',
    description: '字符视频:视频/音频转彩色字符 MP4/GIF。',
    image: '/assets/home/card-video.png',
  },
  {
    title: 'AudioCraft音频生成',
    description: 'AudioCraft:MusicGen 文生音乐、AudioGen 文生音效。',
    image: '/assets/home/card-audiocraft.png',
  },
];

type AgentCardData = (typeof cards)[number];

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

const previewCards = [...cards, ...cards, ...cards];
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
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClassName =
    size === 'sm' ? 'h-4 w-4 text-xxs' : size === 'lg' ? 'h-9 w-9 text-sm' : 'h-8 w-8 text-sm';

  if (account?.type === 'enterprise') {
    return (
      <span
        className={[
          'flex shrink-0 items-center justify-center rounded-pill bg-bg-black font-medium leading-5 text-text-inverse',
          sizeClassName,
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
      <img className="h-full w-full object-cover" src={avatarSrc} alt="" />
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
      const availableBelow = Math.max(196, viewportHeight - preferredTop - 48);
      const naturalHeight =
        (scrollArea?.scrollHeight ?? 0) + (footer?.scrollHeight ?? 0) + 16;
      const nextHeight = Math.min(naturalHeight, Math.max(196, viewportHeight - 96));

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
      className={`${className} z-50 flex min-h-[196px] flex-col overflow-hidden`}
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
  currentAccount,
  accounts,
  selectedAccountId,
  isLoggedIn,
  onToggle,
  onPageChange,
  onLoginClick,
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
  currentAccount: MockAccount | null;
  accounts: MockAccount[];
  selectedAccountId: string | null;
  isLoggedIn: boolean;
  onToggle: () => void;
  onPageChange: (value: PageMode) => void;
  onLoginClick: () => void;
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
          aria-label={collapsed ? '链接Hz-Hermes' : undefined}
          title={collapsed ? '链接Hz-Hermes' : undefined}
        >
          <span
            className={[
              sidebarMenuBaseClassName,
              'text-accent-teal hover:bg-bg-strong',
              collapsed
                ? sidebarMenuCollapsedClassName
                : sidebarMenuExpandedClassName,
            ].join(' ')}
          >
            <img
              className="h-4 w-4 shrink-0"
              src="/assets/home/link-me-logo.svg"
              alt=""
            />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 whitespace-nowrap text-left">
                  链接Hz-Hermes
                </span>
                <Icon name="ArrowUpRight" />
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
  projectDetailMenuOpen?: boolean;
  onProjectDetailMenuToggle?: () => void;
  onProjectDetailMenuClose?: () => void;
  onProjectDetailRename?: () => void;
  onProjectDetailDelete?: () => void;
}) {
  const showLeftContent = showModeTabs || Boolean(projectDetailTitle);
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
          {projectDetailTitle ? (
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
        className={[
          'flex h-14 items-center',
          isLoggedIn ? 'w-[184px]' : '',
        ].join(' ')}
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
            className="w-[90px] whitespace-nowrap px-3.5 pr-4"
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
          {isEnterpriseProfile ? (
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-pill bg-bg-black text-2xl font-medium leading-8 text-text-inverse shadow-avatar-border">
                {getAccountInitial(draftNickname)}
              </div>
              <p className="text-center text-xs leading-4 text-text-hint">
                企业账号标识
              </p>
            </div>
          ) : (
            <>
              <div className="flex w-full flex-col items-center gap-2">
                <button
                  className="group relative h-24 w-24 shrink-0 rounded-pill outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected"
                  type="button"
                  aria-label="修改头像"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-pill shadow-avatar-border">
                    <img
                      className="h-full w-full rounded-pill object-cover"
                      src={avatarSrc}
                      alt=""
                    />
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
                {presetAvatarSrcs.map((presetAvatarSrc) => {
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
                })}
              </div>
            </>
          )}

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

function RechargeModal({ onClose }: { onClose: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [qrExpiresIn, setQrExpiresIn] = useState(60);
  const [qrRefreshVersion, setQrRefreshVersion] = useState(0);
  const isQrExpired = qrExpiresIn === 0;

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
      bodyClassName="h-full"
      onClose={onClose}
    >
      {({ close }) => (
      <div className="relative flex h-full items-start overflow-hidden">
        <div className="relative flex h-full min-w-0 flex-1 flex-col items-center gap-6 overflow-hidden p-10">
          <div className="pointer-events-none absolute left-0 top-0 h-[152px] w-[680px] overflow-hidden">
            <img
              className="h-full w-full object-cover object-top"
              src="/assets/home/recharge-bg.png"
              alt=""
            />
          </div>
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
        <div className="flex h-full w-[280px] shrink-0 flex-col items-center justify-center gap-4 bg-bg-soft px-6 py-14">
          <div className="flex w-full items-start justify-center gap-1 text-accent-error">
            <span className="flex h-[45px] w-2.5 items-end pb-1 text-lg font-medium leading-7">
              ¥
            </span>
            <span className="text-4xl font-semibold leading-[45px]">
              {selectedAmount.toFixed(1)}
            </span>
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
            <p className="text-accent-link">《付费服务协议》</p>
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
          <span className="flex h-4 w-4 items-center justify-center rounded-pill text-text-hint">
            <Icon name="Info" size="2xs" />
          </span>
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
  title,
  description,
  image,
  onOpenDetail,
}: AgentCardData & {
  onOpenDetail: () => void;
}) {
  return (
    <InteractiveCard
      heightClassName="h-[248px]"
      image={image}
      contentHeightClassName="h-[88px]"
      contentHoverHeightClassName="group-hover:h-[136px]"
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
        <div className="flex h-14 flex-col gap-1">
          <h3 className="truncate text-sm font-medium text-text-primary">
            {title}
          </h3>
          <p className="line-clamp-2 text-xs text-text-hint">{description}</p>
        </div>
    </InteractiveCard>
  );
}

function AgentDetailModal({
  agent,
  onClose,
}: {
  agent: AgentCardData;
  onClose: () => void;
}) {
  return (
    <ContentModal
      ariaLabel={`${agent.title}详情`}
      bodyPadding={false}
      panelClassName="relative py-8"
      bodyClassName="overflow-y-auto"
      showCloseButton={false}
      header={({ close }) => (
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-end gap-2 pb-2 pl-6 pr-4 pt-4">
          <ModalCloseButton aria-label="关闭智能体详情弹窗" onClick={close} />
        </div>
      )}
      onClose={onClose}
    >
      <div className="flex w-full flex-col items-center">
        <section className="flex w-full flex-col items-start gap-4 px-12 pt-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-bg-black/5">
            <img className="h-full w-full object-cover" src={agent.image} alt="" />
          </div>
          <div className="flex w-full items-center justify-center gap-6">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <h2 className="w-full text-lg font-medium leading-7 text-text-primary">
                {agent.title}
              </h2>
              <p className="w-full text-xs leading-4 text-text-hint">
                {agent.description}
              </p>
            </div>
            <Button
              className="shrink-0 px-[18px]"
              size="lg"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              使用智能体
            </Button>
          </div>
        </section>

        <section className="flex w-full flex-col items-start justify-center px-12 pb-6 pt-4">
          <p className="w-full text-justify text-sm leading-5 text-text-primary">
            这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。
          </p>
        </section>

        <section className="flex w-full flex-col items-start px-12 pt-6">
          <div className="flex w-full flex-col items-start pb-4 shadow-border-bottom-subtle">
            <h3 className="text-sm font-medium leading-5 text-text-primary">信息</h3>
          </div>
        </section>

        <section className="flex w-full flex-col items-start gap-2 px-12 py-4 text-left text-sm leading-5">
          <div className="flex w-full items-center gap-2">
            <span className="w-32 shrink-0 text-text-hint">开发者</span>
            <span className="shrink-0 whitespace-nowrap text-text-primary">HelloMe</span>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="w-32 shrink-0 text-text-hint">类别</span>
            <span className="shrink-0 whitespace-nowrap text-text-primary">开发者工具</span>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="w-32 shrink-0 text-text-hint">版本</span>
            <span className="shrink-0 whitespace-nowrap text-text-primary">v1.0.2</span>
          </div>
        </section>
      </div>
    </ContentModal>
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
  onOpenAgentDetail,
}: {
  cardsToShow: typeof cards;
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
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-default text-text-primary transition-[opacity,background-color]',
        checked || indeterminate ? 'bg-bg-medium' : 'bg-transparent',
        alwaysVisible || checked || indeterminate
          ? 'opacity-100'
          : 'opacity-0 group-hover/project-file-row:opacity-100',
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
      {checked && <Icon name="Check" size="xs" strokeWidth={3} />}
      {indeterminate && !checked && (
        <Icon name="Minus" size="xs" strokeWidth={3} />
      )}
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
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedAgentDetail, setSelectedAgentDetail] =
    useState<AgentCardData | null>(null);
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

  const handleProfileAvatarChange = useCallback((file: File) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        return;
      }

      setProfileAvatarSrc(reader.result);
      updateMockUserProfile({ avatarSrc: reader.result });
    });

    reader.readAsDataURL(file);
  }, []);

  const handleProfileAvatarPresetSelect = useCallback((avatarSrc: string) => {
    setProfileAvatarSrc(avatarSrc);
    updateMockUserProfile({ avatarSrc });
  }, []);

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
    isProjectDetailPage
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
    isProjectDetailPage
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

      setCurrentPathname(nextPathname);
      setActivePage(nextPage);
      setSearchValue('');
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
      } else {
        setProjectDetailMode(projectDetailModeTabs[0]);
        setActiveTab(getDefaultActiveTab(nextPage, viewMode));
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
    setAccountData(nextAccountData);
    setSelectedAccountId(nextAccountData.accounts[0]?.id ?? null);
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
          showModeTabs={isTitleMenuVisible && !isProjectDetailPage}
          showDivider={isTitleMenuVisible || isProjectDetailPage}
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
          {isProjectDetailPage ? (
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
                      onOpenAgentDetail={setSelectedAgentDetail}
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
        <RechargeModal onClose={() => setIsRechargeModalOpen(false)} />
      )}
      {selectedAgentDetail && (
        <AgentDetailModal
          agent={selectedAgentDetail}
          onClose={() => setSelectedAgentDetail(null)}
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
          onPushAnnouncement={() => handleMockDebugPushMessage('announcements')}
          onPushActivity={() => handleMockDebugPushMessage('activity')}
        />
      )}
      {isProfileModalOpen && (
        <ProfileModal
          account={currentAccount}
          avatarSrc={profileAvatarSrc}
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
