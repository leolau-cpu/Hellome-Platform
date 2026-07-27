import type { MockUser } from '../mockUserApi';
import { seededMockMessages } from './mockSeeds';
import {
  getMockUserStorageKey,
  readMockStorageValue,
  writeMockStorageValue,
} from './mockStorage';

export type MockMessageMode = 'announcements' | 'activity';

export type MockMessage = {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  content: string;
  action?: string;
};

export type MockMessageByMode = Record<MockMessageMode, MockMessage[]>;

export type MockMessageUnreadCounts = Record<MockMessageMode, number>;

export const mockMessagesChangedEventName = 'hellome-mock-messages-changed';

const messageModes: MockMessageMode[] = ['announcements', 'activity'];
const emptyMockMessages: MockMessageByMode = {
  announcements: [],
  activity: [],
};

function cloneMockMessages(messages: MockMessageByMode): MockMessageByMode {
  return {
    announcements: messages.announcements.map((message) => ({ ...message })),
    activity: messages.activity.map((message) => ({ ...message })),
  };
}

function getInitialMockMessages(user: MockUser): MockMessageByMode {
  if (user.dataMode === 'empty-data') {
    return cloneMockMessages(emptyMockMessages);
  }

  return cloneMockMessages(seededMockMessages);
}

function getMockMessagesStorageKey(userId: string) {
  return getMockUserStorageKey(userId, 'messages');
}

function dispatchMockMessagesChangedEvent() {
  window.dispatchEvent(new Event(mockMessagesChangedEventName));
}

function saveMockMessages(userId: string, messages: MockMessageByMode) {
  writeMockStorageValue(getMockMessagesStorageKey(userId), messages);
  dispatchMockMessagesChangedEvent();

  return messages;
}

export function getMockMessages(user: MockUser | null): MockMessageByMode {
  if (user === null) return cloneMockMessages(emptyMockMessages);

  const storedMessages = readMockStorageValue<MockMessageByMode | null>(
    getMockMessagesStorageKey(user.id),
    null,
  );

  if (storedMessages !== null) return storedMessages;

  return saveMockMessages(user.id, getInitialMockMessages(user));
}

export function getMockMessageUnreadCounts(
  messages: MockMessageByMode,
): MockMessageUnreadCounts {
  return {
    announcements: messages.announcements.filter((message) => message.unread)
      .length,
    activity: messages.activity.filter((message) => message.unread).length,
  };
}

export function getUnreadMockMessageIds(messages: MockMessageByMode) {
  return new Set(
    messageModes.flatMap((messageMode) =>
      messages[messageMode]
        .filter((message) => message.unread)
        .map((message) => message.id),
    ),
  );
}

export function markMockMessageRead(
  user: MockUser | null,
  messageMode: MockMessageMode,
  messageId: string,
) {
  if (user === null) return getMockMessages(user);

  const messages = getMockMessages(user);
  const nextMessages = {
    ...messages,
    [messageMode]: messages[messageMode].map((message) =>
      message.id === messageId ? { ...message, unread: false } : message,
    ),
  };

  return saveMockMessages(user.id, nextMessages);
}

export function markAllMockMessagesRead(
  user: MockUser | null,
  messageMode: MockMessageMode,
) {
  if (user === null) return getMockMessages(user);

  const messages = getMockMessages(user);
  const nextMessages = {
    ...messages,
    [messageMode]: messages[messageMode].map((message) => ({
      ...message,
      unread: false,
    })),
  };

  return saveMockMessages(user.id, nextMessages);
}

export function pushMockMessage(
  user: MockUser | null,
  messageMode: MockMessageMode,
) {
  if (user === null) return getMockMessages(user);

  const messages = getMockMessages(user);
  const nextMessage: MockMessage = {
    id: `${messageMode}-${Date.now()}`,
    title:
      messageMode === 'announcements'
        ? '新的系统公告已推送'
        : '新的动态消息已推送',
    time: '刚刚',
    unread: true,
    content:
      messageMode === 'announcements'
        ? '这是一条用于前端验收的模拟公告消息。'
        : '这是一条用于前端验收的模拟动态消息。',
    action: messageMode === 'announcements' ? '查看详情' : undefined,
  };
  const nextMessages = {
    ...messages,
    [messageMode]: [nextMessage, ...messages[messageMode]],
  };

  return saveMockMessages(user.id, nextMessages);
}

export function resetMockMessages(user: MockUser | null) {
  if (user === null) return cloneMockMessages(emptyMockMessages);

  return saveMockMessages(user.id, getInitialMockMessages(user));
}
