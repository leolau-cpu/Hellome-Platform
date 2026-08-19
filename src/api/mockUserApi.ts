import {
  readMockStorageValue,
  removeMockStorageValue,
  writeMockStorageValue,
} from './mock/mockStorage';

export type MockUserDataMode = 'with-data' | 'empty-data';
export type MockAiWorkstationConnectionStatus =
  | 'not-installed'
  | 'not-connected'
  | 'connected';

export type MockUser = {
  id: string;
  phone: string;
  loginAt: number;
  avatarSrc: string;
  nickname: string;
  dataMode: MockUserDataMode;
  aiWorkstationConnectionStatus: MockAiWorkstationConnectionStatus;
};

export type MockUserProfile = Pick<MockUser, 'avatarSrc' | 'nickname'>;

export const mockUserChangedEventName = 'hellome-mock-user-changed';
export const defaultProfileNickname = '哈啰蜜moleaa';

const legacyLoginSessionStorageKey = 'hellome.loginSession';
const currentMockUserIdStorageKey = 'currentUserId';
const deprecatedMockUserPhones = ['13666666666', '13888888888'];

export const defaultAvatarSrcs = [
  '/assets/avatars/avatar-female-1.png',
  '/assets/avatars/avatar-female-2.png',
  '/assets/avatars/avatar-female-3.png',
  '/assets/avatars/avatar-female-4.png',
  '/assets/avatars/avatar-male-1.png',
  '/assets/avatars/avatar-male-2.png',
  '/assets/avatars/avatar-male-3.png',
  '/assets/avatars/avatar-male-4.png',
] as const;

function getRandomDefaultAvatarSrc() {
  const randomIndex = Math.floor(Math.random() * defaultAvatarSrcs.length);

  return defaultAvatarSrcs[randomIndex];
}

function getMockUserId(phone: string) {
  return `mock-user-${phone}`;
}

function getMockUserDataMode(phone: string): MockUserDataMode {
  if (phone === '16666666666') return 'empty-data';

  return 'with-data';
}

function getMockUserAiWorkstationConnectionStatus(
  phone: string,
): MockAiWorkstationConnectionStatus {
  if (phone === '18888888888') return 'not-connected';

  return 'not-connected';
}

function normalizeMockAiWorkstationConnectionStatus(
  phone: string,
  parsedValue: Partial<MockUser>,
): MockAiWorkstationConnectionStatus {
  if (
    parsedValue.aiWorkstationConnectionStatus === 'not-installed' ||
    parsedValue.aiWorkstationConnectionStatus === 'not-connected' ||
    parsedValue.aiWorkstationConnectionStatus === 'connected'
  ) {
    return parsedValue.aiWorkstationConnectionStatus;
  }

  return getMockUserAiWorkstationConnectionStatus(phone);
}

function getMockUserStorageKey(userId: string) {
  return `users.${userId}.profile`;
}

function removeDeprecatedMockUsers() {
  deprecatedMockUserPhones.forEach((phone) => {
    removeMockStorageValue(getMockUserStorageKey(getMockUserId(phone)));
  });
}

function normalizeMockUser(parsedValue: Partial<MockUser>): MockUser | null {
  if (
    typeof parsedValue.phone !== 'string' ||
    parsedValue.phone.length === 0 ||
    typeof parsedValue.loginAt !== 'number'
  ) {
    return null;
  }

  return {
    id:
      typeof parsedValue.id === 'string' && parsedValue.id.length > 0
        ? parsedValue.id
        : getMockUserId(parsedValue.phone),
    phone: parsedValue.phone,
    loginAt: parsedValue.loginAt,
    avatarSrc:
      typeof parsedValue.avatarSrc === 'string' &&
      parsedValue.avatarSrc.length > 0
        ? parsedValue.avatarSrc
        : getRandomDefaultAvatarSrc(),
    nickname:
      typeof parsedValue.nickname === 'string' &&
      parsedValue.nickname.trim().length > 0
        ? parsedValue.nickname
        : defaultProfileNickname,
    dataMode:
      parsedValue.dataMode === 'empty-data' ||
      parsedValue.dataMode === 'with-data'
        ? parsedValue.dataMode
        : getMockUserDataMode(parsedValue.phone),
    aiWorkstationConnectionStatus: normalizeMockAiWorkstationConnectionStatus(
      parsedValue.phone,
      parsedValue,
    ),
  };
}

function parseMockUser(value: string | null): MockUser | null {
  if (value === null) return null;

  try {
    const parsedValue = JSON.parse(value) as Partial<MockUser>;

    return normalizeMockUser(parsedValue);
  } catch {
    return null;
  }
}

function dispatchMockUserChangedEvent() {
  window.dispatchEvent(new Event(mockUserChangedEventName));
}

function saveMockUser(user: MockUser) {
  writeMockStorageValue(getMockUserStorageKey(user.id), user);
  writeMockStorageValue(currentMockUserIdStorageKey, user.id);
  dispatchMockUserChangedEvent();

  return user;
}

function getMockUserById(userId: string) {
  const storedUser = readMockStorageValue<Partial<MockUser> | null>(
    getMockUserStorageKey(userId),
    null,
  );

  if (storedUser === null) return null;

  return normalizeMockUser(storedUser);
}

function getLegacyMockUser() {
  if (typeof window === 'undefined') return null;

  return parseMockUser(window.localStorage.getItem(legacyLoginSessionStorageKey));
}

export function getCurrentMockUser() {
  if (typeof window === 'undefined') return null;

  removeDeprecatedMockUsers();

  const currentUserId = readMockStorageValue<string | null>(
    currentMockUserIdStorageKey,
    null,
  );

  if (
    currentUserId !== null &&
    deprecatedMockUserPhones.some((phone) => currentUserId === getMockUserId(phone))
  ) {
    removeMockStorageValue(currentMockUserIdStorageKey);

    return null;
  }

  if (currentUserId !== null) {
    return getMockUserById(currentUserId);
  }

  const legacyUser = getLegacyMockUser();

  if (legacyUser === null) return null;

  saveMockUser(legacyUser);
  window.localStorage.removeItem(legacyLoginSessionStorageKey);

  return legacyUser;
}

export function loginMockUser(phone: string): MockUser {
  const userId = getMockUserId(phone);
  const storedUser = getMockUserById(userId);

  if (storedUser !== null) {
    return saveMockUser({
      ...storedUser,
      loginAt: Date.now(),
    });
  }

  return saveMockUser({
    id: userId,
    phone,
    loginAt: Date.now(),
    avatarSrc: getRandomDefaultAvatarSrc(),
    nickname: defaultProfileNickname,
    dataMode: getMockUserDataMode(phone),
    aiWorkstationConnectionStatus:
      getMockUserAiWorkstationConnectionStatus(phone),
  });
}

export function updateMockAiWorkstationConnectionStatus(
  status: MockAiWorkstationConnectionStatus,
) {
  if (typeof window === 'undefined') return null;

  const currentUser = getCurrentMockUser();

  if (currentUser === null) return null;

  return saveMockUser({
    ...currentUser,
    aiWorkstationConnectionStatus: status,
  });
}

export function resetMockAiWorkstationConnectionStatus() {
  if (typeof window === 'undefined') return null;

  const currentUser = getCurrentMockUser();

  if (currentUser === null) return null;

  return saveMockUser({
    ...currentUser,
    aiWorkstationConnectionStatus: getMockUserAiWorkstationConnectionStatus(
      currentUser.phone,
    ),
  });
}

export function updateMockUserProfile(profile: Partial<MockUserProfile>) {
  if (typeof window === 'undefined') return null;

  const currentUser = getCurrentMockUser();

  if (currentUser === null) return null;

  return saveMockUser({
    ...currentUser,
    ...profile,
  });
}

export function logoutMockUser() {
  if (typeof window === 'undefined') return;

  removeMockStorageValue(currentMockUserIdStorageKey);
  window.localStorage.removeItem(legacyLoginSessionStorageKey);
  dispatchMockUserChangedEvent();
}
