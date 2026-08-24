import {
  getMockUserStorageKey,
  readMockStorageValue,
  removeMockStorageValue,
  writeMockStorageValue,
} from './mockStorage';

export type MockAgentStatName = 'like' | 'comments' | 'collect' | 'share';

export type MockAgentStats = Record<MockAgentStatName, string>;

export type MockAgentCommentAction = {
  icon: 'Heart' | 'MessageCircle';
  label: string;
};

export type MockAgentCommentItem = {
  nodeId: string;
  avatarNodeId: string;
  rightNodeId: string;
  authorWrapperNodeId: string;
  authorNodeId: string;
  commentNodeId: string;
  dateNodeId: string;
  interactionsNodeId: string;
  author: string;
  content: string;
  date: string;
  avatarSrc?: string;
  avatarText?: string;
  indent?: boolean;
  heightClassName?: string;
  rightHeightClassName?: string;
  contentHeightClassName?: string;
  actions: MockAgentCommentAction[];
  isLiked?: boolean;
  replies?: MockAgentCommentItem[];
  defaultVisibleReplyCount?: number;
};

export type MockAgentAccountState = {
  likedAgentIds: string[];
  collectedAgentIds: string[];
  likedCommentIds: string[];
  commentsByAgentId: Record<string, MockAgentCommentItem[]>;
  repliesByCommentId: Record<string, MockAgentCommentItem[]>;
};

export type MockAgentDetailData = {
  hasData: boolean;
  stats: MockAgentStats;
  comments: MockAgentCommentItem[];
  accountState: MockAgentAccountState;
};

export type MockAgentReactionType = 'collect' | 'like';

export type MockAgentAuthorInput = {
  author: string;
  avatarSrc?: string;
  avatarText?: string;
};

const emptyMockAgentStats: MockAgentStats = {
  like: '0',
  comments: '0',
  collect: '0',
  share: '0',
};

const emptyMockAgentAccountState: MockAgentAccountState = {
  likedAgentIds: [],
  collectedAgentIds: [],
  likedCommentIds: [],
  commentsByAgentId: {},
  repliesByCommentId: {},
};

const hzCanvasComments: MockAgentCommentItem[] = [
  {
    nodeId: '4727:18767',
    avatarNodeId: '4727:19073',
    rightNodeId: '4727:18769',
    authorWrapperNodeId: '4727:19078',
    authorNodeId: '4731:19126',
    commentNodeId: '4727:19079',
    dateNodeId: '4727:18773',
    interactionsNodeId: '4730:19105',
    author: '哈喽咪moleaa',
    content: '真的很好用，适用于手绘、写实、抽象、水彩等多种风格。',
    date: '2026-08-20',
    avatarSrc: '/assets/agents/canvas-comment-avatar-1.png',
    actions: [
      { icon: 'Heart', label: '6' },
      { icon: 'MessageCircle', label: '2' },
    ],
    defaultVisibleReplyCount: 5,
    replies: [
      {
        nodeId: '4740:24596',
        avatarNodeId: '4740:24597',
        rightNodeId: '4740:24599',
        authorWrapperNodeId: '4740:24600',
        authorNodeId: '4740:24601',
        commentNodeId: '4740:24606',
        dateNodeId: '4740:24608',
        interactionsNodeId: '4740:24610',
        author: 'Sakula_fn',
        content: '有案例可以分享看看吗🙃',
        date: '2026-08-20',
        avatarSrc: '/assets/agents/canvas-comment-avatar-2.png',
        indent: true,
        actions: [
          { icon: 'Heart', label: '1' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
      {
        nodeId: '4740:24616',
        avatarNodeId: '4740:24617',
        rightNodeId: '4740:24619',
        authorWrapperNodeId: '4740:24620',
        authorNodeId: '4740:24621',
        commentNodeId: '4740:24626',
        dateNodeId: '4740:24628',
        interactionsNodeId: '4740:24630',
        author: '大古队员',
        content: '回复 Sakula_fn ：并没有！！！',
        date: '2026-08-20',
        avatarSrc: '/assets/agents/canvas-comment-avatar-3.png',
        indent: true,
        actions: [
          { icon: 'Heart', label: '赞' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
      {
        nodeId: '4740:24636',
        avatarNodeId: '4740:24637',
        rightNodeId: '4740:24639',
        authorWrapperNodeId: '4740:24640',
        authorNodeId: '4740:24641',
        commentNodeId: '4740:24646',
        dateNodeId: '4740:24648',
        interactionsNodeId: '4740:24650',
        author: 'Lumos',
        content: '+1求分享',
        date: '2026-08-20',
        avatarSrc: '/assets/agents/canvas-comment-avatar-4.png',
        indent: true,
        actions: [
          { icon: 'Heart', label: '赞' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
      {
        nodeId: '4740:24656',
        avatarNodeId: '4740:24657',
        rightNodeId: '4740:24659',
        authorWrapperNodeId: '4740:24660',
        authorNodeId: '4740:24661',
        commentNodeId: '4740:24666',
        dateNodeId: '4740:24668',
        interactionsNodeId: '4740:24670',
        author: 'Jack89',
        content: '回复 Lumos ：我有类似的，加微信发给你。',
        date: '2026-08-20',
        avatarSrc: '/assets/agents/canvas-comment-avatar-5.png',
        indent: true,
        actions: [
          { icon: 'Heart', label: '赞' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
      {
        nodeId: '4740:24676',
        avatarNodeId: '4740:24677',
        rightNodeId: '4740:24679',
        authorWrapperNodeId: '4740:24680',
        authorNodeId: '4740:24681',
        commentNodeId: '4740:24686',
        dateNodeId: '4740:24688',
        interactionsNodeId: '4740:24690',
        author: '李先生',
        content: '这个无限画布的素材管理能力，做短视频批量生产会很方便。',
        date: '2026-08-20',
        avatarText: '李',
        indent: true,
        actions: [
          { icon: 'Heart', label: '赞' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
      {
        nodeId: '4740:24692',
        avatarNodeId: '4740:24693',
        rightNodeId: '4740:24695',
        authorWrapperNodeId: '4740:24696',
        authorNodeId: '4740:24697',
        commentNodeId: '4740:24702',
        dateNodeId: '4740:24704',
        interactionsNodeId: '4740:24706',
        author: 'Dawn Lane',
        content: '这类视频项目如果能把参考图、脚本和分镜放一起，协作会清楚很多。',
        date: '2026-08-20',
        avatarText: 'D',
        indent: true,
        actions: [
          { icon: 'Heart', label: '赞' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
      {
        nodeId: '4740:24780',
        avatarNodeId: '4740:24781',
        rightNodeId: '4740:24782',
        authorWrapperNodeId: '4740:24783',
        authorNodeId: '4740:24784',
        commentNodeId: '4740:24785',
        dateNodeId: '4740:24786',
        interactionsNodeId: '4740:24787',
        author: 'Jenny Wilson',
        content: '已经用了一周，素材标注和批注很好用。',
        date: '2026-08-20',
        avatarText: 'J',
        indent: true,
        actions: [
          { icon: 'Heart', label: '赞' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
    ],
  },
  {
    nodeId: '4731:19219',
    avatarNodeId: '4731:19241',
    rightNodeId: '4731:19222',
    authorWrapperNodeId: '4731:19223',
    authorNodeId: '4731:19224',
    commentNodeId: '4731:19226',
    dateNodeId: '4731:19228',
    interactionsNodeId: '4731:19230',
    author: '江苏汇智智能数字科技有限公司',
    content:
      '这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。这是技能的详细介绍，文字自适应换行。',
    date: '2026-08-20',
    avatarText: '江',
    heightClassName: 'h-[148px]',
    rightHeightClassName: 'h-[132px]',
    contentHeightClassName: 'h-[60px]',
    actions: [
      { icon: 'Heart', label: '6' },
      { icon: 'MessageCircle', label: '2' },
    ],
    defaultVisibleReplyCount: 5,
    replies: [
      {
        nodeId: '4740:24708',
        avatarNodeId: '4740:24709',
        rightNodeId: '4740:24711',
        authorWrapperNodeId: '4740:24712',
        authorNodeId: '4740:24713',
        commentNodeId: '4740:24718',
        dateNodeId: '4740:24720',
        interactionsNodeId: '4740:24722',
        author: 'Jenny Wilson',
        content: '回复 江苏汇智智能数字科技有限公司：这个流程确实更适合团队内部共用，素材和版本都能一起管理。',
        date: '2026-08-20',
        avatarText: 'J',
        indent: true,
        actions: [
          { icon: 'Heart', label: '赞' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
    ],
  },
  {
    nodeId: '4740:24724',
    avatarNodeId: '4740:24725',
    rightNodeId: '4740:24727',
    authorWrapperNodeId: '4740:24728',
    authorNodeId: '4740:24729',
    commentNodeId: '4740:24734',
    dateNodeId: '4740:24736',
    interactionsNodeId: '4740:24738',
    author: 'Dawn Lane',
    content: '把分镜、参考图和生成结果放在同一张画布里之后，团队沟通会清楚很多，尤其适合需要多轮调整的视频项目。',
    date: '2026-08-19',
    avatarText: 'D',
    actions: [
      { icon: 'Heart', label: '12' },
      { icon: 'MessageCircle', label: '回复' },
    ],
  },
];

const agentDetailSeedData: Record<string, { stats: MockAgentStats; comments: MockAgentCommentItem[] }> = {
  'hz-canvas': {
    stats: {
      like: '210',
      comments: '512',
      collect: '98',
      share: '24',
    },
    comments: hzCanvasComments,
  },
  'moneyprinterturbo-local-hermes': {
    stats: {
      like: '36',
      comments: '1',
      collect: '18',
      share: '7',
    },
    comments: [
      {
        nodeId: 'mock-agent-comment-moneyprinter-1',
        avatarNodeId: 'mock-agent-comment-moneyprinter-1-avatar',
        rightNodeId: 'mock-agent-comment-moneyprinter-1-right',
        authorWrapperNodeId: 'mock-agent-comment-moneyprinter-1-author-wrapper',
        authorNodeId: 'mock-agent-comment-moneyprinter-1-author',
        commentNodeId: 'mock-agent-comment-moneyprinter-1-content',
        dateNodeId: 'mock-agent-comment-moneyprinter-1-date',
        interactionsNodeId: 'mock-agent-comment-moneyprinter-1-interactions',
        author: '视频运营小组',
        content: '混剪节奏比自己手动整理快很多，适合把活动素材快速做成不同版本。',
        date: '2026-08-21',
        avatarText: '视',
        actions: [
          { icon: 'Heart', label: '9' },
          { icon: 'MessageCircle', label: '回复' },
        ],
      },
    ],
  },
};

function cloneMockAgentComment(comment: MockAgentCommentItem): MockAgentCommentItem {
  return {
    ...comment,
    actions: comment.actions.map((action) => ({ ...action })),
    replies: comment.replies?.map(cloneMockAgentComment),
  };
}

function cloneMockAgentAccountState(
  accountState: MockAgentAccountState,
): MockAgentAccountState {
  return {
    likedAgentIds: [...accountState.likedAgentIds],
    collectedAgentIds: [...accountState.collectedAgentIds],
    likedCommentIds: [...accountState.likedCommentIds],
    commentsByAgentId: Object.fromEntries(
      Object.entries(accountState.commentsByAgentId).map(([agentId, comments]) => [
        agentId,
        comments.map(cloneMockAgentComment),
      ]),
    ),
    repliesByCommentId: Object.fromEntries(
      Object.entries(accountState.repliesByCommentId).map(([commentId, replies]) => [
        commentId,
        replies.map(cloneMockAgentComment),
      ]),
    ),
  };
}

function getMockAgentStorageKey(accountId: string) {
  return getMockUserStorageKey(accountId, 'agent');
}

export function resetMockAgentAccountState(accountIds: string[]) {
  accountIds.forEach((accountId) => {
    removeMockStorageValue(getMockAgentStorageKey(accountId));
  });
}

function saveMockAgentAccountState(
  accountId: string,
  accountState: MockAgentAccountState,
) {
  writeMockStorageValue(getMockAgentStorageKey(accountId), accountState);

  return cloneMockAgentAccountState(accountState);
}

function normalizeMockAgentAccountState(
  storedState: Partial<MockAgentAccountState> | null,
): MockAgentAccountState {
  if (storedState === null) return cloneMockAgentAccountState(emptyMockAgentAccountState);

  return {
    likedAgentIds: Array.isArray(storedState.likedAgentIds)
      ? storedState.likedAgentIds
      : [],
    collectedAgentIds: Array.isArray(storedState.collectedAgentIds)
      ? storedState.collectedAgentIds
      : [],
    likedCommentIds: Array.isArray(storedState.likedCommentIds)
      ? storedState.likedCommentIds
      : [],
    commentsByAgentId:
      storedState.commentsByAgentId !== undefined &&
      typeof storedState.commentsByAgentId === 'object'
        ? storedState.commentsByAgentId
        : {},
    repliesByCommentId:
      storedState.repliesByCommentId !== undefined &&
      typeof storedState.repliesByCommentId === 'object'
        ? storedState.repliesByCommentId
        : {},
  };
}

function getMockAgentAccountState(accountId: string | null): MockAgentAccountState {
  if (accountId === null) return cloneMockAgentAccountState(emptyMockAgentAccountState);

  const storedState = readMockStorageValue<Partial<MockAgentAccountState> | null>(
    getMockAgentStorageKey(accountId),
    null,
  );
  const accountState = normalizeMockAgentAccountState(storedState);

  if (storedState === null) {
    writeMockStorageValue(getMockAgentStorageKey(accountId), accountState);
  }

  return cloneMockAgentAccountState(accountState);
}

function formatAdjustedStatValue(value: string, delta: number) {
  const numericValue = Number(value.split(',').join(''));

  if (!Number.isFinite(numericValue)) return value;

  return String(Math.max(0, numericValue + delta));
}

function getAdjustedMockAgentStats(
  agentId: string,
  stats: MockAgentStats,
  accountState: MockAgentAccountState,
  commentDelta = 0,
): MockAgentStats {
  return {
    ...stats,
    comments: formatAdjustedStatValue(stats.comments, commentDelta),
    like: formatAdjustedStatValue(
      stats.like,
      accountState.likedAgentIds.includes(agentId) ? 1 : 0,
    ),
    collect: formatAdjustedStatValue(
      stats.collect,
      accountState.collectedAgentIds.includes(agentId) ? 1 : 0,
    ),
  };
}

function getAccountCommentDelta(
  agentId: string,
  comments: MockAgentCommentItem[],
  accountState: MockAgentAccountState,
) {
  const accountComments = accountState.commentsByAgentId[agentId] ?? [];
  const rootCommentIds = [
    ...comments.map((comment) => comment.nodeId),
    ...accountComments.map((comment) => comment.nodeId),
  ];
  const accountReplyCount = rootCommentIds.reduce(
    (totalCount, commentId) =>
      totalCount + (accountState.repliesByCommentId[commentId]?.length ?? 0),
    0,
  );

  return accountComments.length + accountReplyCount;
}

function mergeAccountComments(
  comments: MockAgentCommentItem[],
  accountState: MockAgentAccountState,
  agentId: string,
) {
  const accountComments = accountState.commentsByAgentId[agentId] ?? [];

  function applyCommentAccountState(comment: MockAgentCommentItem): MockAgentCommentItem {
    const isLiked = accountState.likedCommentIds.includes(comment.nodeId);

    return {
      ...cloneMockAgentComment(comment),
      isLiked,
      actions: comment.actions.map((action) => {
        if (action.icon !== 'Heart') return { ...action };

        return {
          ...action,
          label: isLiked
            ? formatAdjustedStatValue(action.label === '赞' ? '0' : action.label, 1)
            : action.label,
        };
      }),
    };
  }

  return [...accountComments, ...comments].map((comment) => {
    const accountReplies = accountState.repliesByCommentId[comment.nodeId] ?? [];

    return {
      ...applyCommentAccountState(comment),
      replies: [
        ...accountReplies.map((reply) => ({
          ...applyCommentAccountState(reply),
          indent: true,
        })),
        ...(comment.replies ?? []).map(applyCommentAccountState),
      ],
    };
  });
}

export function getMockAgentDetailData(
  agentId: string,
  accountId: string | null,
): MockAgentDetailData {
  const seedData = agentDetailSeedData[agentId];
  const accountState = getMockAgentAccountState(accountId);
  const accountComments = accountState.commentsByAgentId[agentId] ?? [];

  if (seedData === undefined) {
    if (accountComments.length > 0) {
      return {
        hasData: true,
        stats: getAdjustedMockAgentStats(
          agentId,
          {
            ...emptyMockAgentStats,
            comments: '0',
          },
          accountState,
          getAccountCommentDelta(agentId, [], accountState),
        ),
        comments: mergeAccountComments([], accountState, agentId),
        accountState,
      };
    }

    return {
      hasData: false,
      stats: getAdjustedMockAgentStats(
        agentId,
        emptyMockAgentStats,
        accountState,
      ),
      comments: [],
      accountState,
    };
  }

  return {
    hasData: true,
    stats: getAdjustedMockAgentStats(
      agentId,
      seedData.stats,
      accountState,
      getAccountCommentDelta(agentId, seedData.comments, accountState),
    ),
    comments: mergeAccountComments(seedData.comments, accountState, agentId),
    accountState,
  };
}

function createAccountComment(
  content: string,
  authorInput: MockAgentAuthorInput,
  indent = false,
): MockAgentCommentItem {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 8);
  const commentId = `mock-agent-comment-${timestamp}-${randomId}`;

  return {
    nodeId: commentId,
    avatarNodeId: `${commentId}-avatar`,
    rightNodeId: `${commentId}-right`,
    authorWrapperNodeId: `${commentId}-author-wrapper`,
    authorNodeId: `${commentId}-author`,
    commentNodeId: `${commentId}-content`,
    dateNodeId: `${commentId}-date`,
    interactionsNodeId: `${commentId}-interactions`,
    author: authorInput.author,
    content,
    date: new Date().toISOString().slice(0, 10),
    avatarSrc: authorInput.avatarSrc,
    avatarText: authorInput.avatarText,
    indent,
    actions: [
      { icon: 'Heart', label: '赞' },
      { icon: 'MessageCircle', label: '回复' },
    ],
  };
}

export function addMockAgentComment(
  agentId: string,
  accountId: string | null,
  content: string,
  authorInput: MockAgentAuthorInput,
) {
  if (accountId === null) {
    return getMockAgentDetailData(agentId, accountId);
  }

  const accountState = getMockAgentAccountState(accountId);
  const nextComment = createAccountComment(content, authorInput);
  const nextAccountState = saveMockAgentAccountState(accountId, {
    ...accountState,
    commentsByAgentId: {
      ...accountState.commentsByAgentId,
      [agentId]: [
        nextComment,
        ...(accountState.commentsByAgentId[agentId] ?? []).map(cloneMockAgentComment),
      ],
    },
  });
  const seedData = agentDetailSeedData[agentId];

  return {
    hasData: true,
    stats: getAdjustedMockAgentStats(
      agentId,
      seedData?.stats ?? emptyMockAgentStats,
      nextAccountState,
      getAccountCommentDelta(agentId, seedData?.comments ?? [], nextAccountState),
    ),
    comments: mergeAccountComments(seedData?.comments ?? [], nextAccountState, agentId),
    accountState: nextAccountState,
  };
}

export function addMockAgentReply(
  agentId: string,
  accountId: string | null,
  commentId: string,
  content: string,
  authorInput: MockAgentAuthorInput,
) {
  if (accountId === null) {
    return getMockAgentDetailData(agentId, accountId);
  }

  const accountState = getMockAgentAccountState(accountId);
  const nextReply = createAccountComment(content, authorInput, true);
  const nextAccountState = saveMockAgentAccountState(accountId, {
    ...accountState,
    repliesByCommentId: {
      ...accountState.repliesByCommentId,
      [commentId]: [
        nextReply,
        ...(accountState.repliesByCommentId[commentId] ?? []).map(cloneMockAgentComment),
      ],
    },
  });
  const seedData = agentDetailSeedData[agentId];

  return {
    hasData: true,
    stats: getAdjustedMockAgentStats(
      agentId,
      seedData?.stats ?? emptyMockAgentStats,
      nextAccountState,
      getAccountCommentDelta(agentId, seedData?.comments ?? [], nextAccountState),
    ),
    comments: mergeAccountComments(seedData?.comments ?? [], nextAccountState, agentId),
    accountState: nextAccountState,
  };
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [value, ...values];
}

export function toggleMockAgentReaction(
  agentId: string,
  accountId: string | null,
  reactionType: MockAgentReactionType,
) {
  if (accountId === null) {
    return getMockAgentDetailData(agentId, accountId);
  }

  const accountState = getMockAgentAccountState(accountId);
  const nextAccountState = saveMockAgentAccountState(accountId, {
    ...accountState,
    likedAgentIds:
      reactionType === 'like'
        ? toggleValue(accountState.likedAgentIds, agentId)
        : accountState.likedAgentIds,
    collectedAgentIds:
      reactionType === 'collect'
        ? toggleValue(accountState.collectedAgentIds, agentId)
        : accountState.collectedAgentIds,
  });
  const seedData = agentDetailSeedData[agentId];

  return {
    hasData: seedData !== undefined,
    stats: getAdjustedMockAgentStats(
      agentId,
      seedData?.stats ?? emptyMockAgentStats,
      nextAccountState,
      getAccountCommentDelta(agentId, seedData?.comments ?? [], nextAccountState),
    ),
    comments: mergeAccountComments(seedData?.comments ?? [], nextAccountState, agentId),
    accountState: nextAccountState,
  };
}

export function toggleMockAgentCommentLike(
  agentId: string,
  accountId: string | null,
  commentId: string,
) {
  if (accountId === null) {
    return getMockAgentDetailData(agentId, accountId);
  }

  const accountState = getMockAgentAccountState(accountId);
  const nextAccountState = saveMockAgentAccountState(accountId, {
    ...accountState,
    likedCommentIds: toggleValue(accountState.likedCommentIds, commentId),
  });
  const seedData = agentDetailSeedData[agentId];

  return {
    hasData: seedData !== undefined,
    stats: getAdjustedMockAgentStats(
      agentId,
      seedData?.stats ?? emptyMockAgentStats,
      nextAccountState,
      getAccountCommentDelta(agentId, seedData?.comments ?? [], nextAccountState),
    ),
    comments: mergeAccountComments(seedData?.comments ?? [], nextAccountState, agentId),
    accountState: nextAccountState,
  };
}
