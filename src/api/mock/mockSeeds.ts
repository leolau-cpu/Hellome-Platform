import type { MockMessageByMode } from './mockMessageApi';

export const seededMockMessages: MockMessageByMode = {
  announcements: [
    {
      id: 'welcome-points',
      title: '🎁 欢迎加入！1000 积分新人礼已到账',
      time: '2分钟前',
      unread: true,
      content: '恭喜您注册成功！为了助力您的 AI 创作之旅，我们已向您的账户发放了 1000 积分。',
      action: '查看详情',
    },
    {
      id: 'payment-success',
      title: '🎉 支付成功：年度会员订阅通知',
      time: '1小时前',
      unread: true,
      content: '您的年度会员订阅已支付成功，会员权益已经自动生效。',
      action: '查看详情',
    },
    {
      id: 'agent-published',
      title: '恭喜！您的「智能客服助手 Pro」已成功上架',
      time: '3天前',
      unread: true,
      content: '智能体已通过平台审核并成功上架，您可以前往项目中心查看运行情况。',
      action: '查看详情',
    },
    {
      id: 'workflow-paused',
      title: '您的定时工作流已暂停',
      time: '1周前',
      unread: false,
      content:
        '系统检测到工作流触发条件暂不可用，已为您暂停本次定时任务。\n您可以进入项目中心检查触发配置后重新开启。',
    },
    {
      id: 'workflow-success',
      title: '🎉 定时工作流运行成功',
      time: '2月前',
      unread: false,
      content: '您的定时工作流已完成运行，生成结果可在项目中心查看。',
    },
    {
      id: 'points-not-enough',
      title: '由于积分不足，您的定时工作流无法运行',
      time: '2025/06/12',
      unread: false,
      content: '账户积分不足，当前工作流暂时无法运行。充值后可继续执行。',
    },
    {
      id: 'agent-review-failed',
      title: '您的「智能客服助手 Pro」审核未通过！',
      time: '2025/05/20',
      unread: false,
      content: '智能体内容未满足平台发布要求，请调整后重新提交审核。',
    },
  ],
  activity: [
    {
      id: 'team-invite',
      title: '团队成员 Lucy 已加入项目空间',
      time: '刚刚',
      unread: true,
      content: 'Lucy 已通过邀请加入项目空间，现在可以协作查看项目任务和运行记录。',
    },
    {
      id: 'apikey-created',
      title: '新的 APIKey 已创建',
      time: '18分钟前',
      unread: true,
      content: '您刚刚创建了一个新的 APIKey。为了账户安全，请妥善保存并避免公开分享。',
    },
    {
      id: 'project-renamed',
      title: '项目「增长实验」已重命名',
      time: '昨天',
      unread: false,
      content: '项目名称已从「增长实验」更新为「增长实验 07」。相关任务和历史记录不受影响。',
    },
    {
      id: 'storage-cleanup',
      title: '云端空间自动整理完成',
      time: '4天前',
      unread: false,
      content: '系统已完成临时文件整理，为您释放了 128 MB 云端空间。',
    },
    {
      id: 'member-permission',
      title: '成员权限已更新',
      time: '2026/07/02',
      unread: false,
      content: '项目成员 Marvin 的权限已更新为可编辑，可继续参与当前项目协作。',
    },
  ],
};
