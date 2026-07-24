export type MockUser = {
  id: string;
  phone: string;
  loginAt: number;
  avatarSrc: string;
  nickname: string;
};

export type MockUserProfile = Pick<MockUser, 'avatarSrc' | 'nickname'>;

export const mockUserChangedEventName = 'hellome-mock-user-changed';
export const defaultProfileNickname = '哈啰蜜moleaa';

const mockUserStorageKey = 'hellome.loginSession';

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

function parseMockUser(value: string | null): MockUser | null {
  if (value === null) return null;

  try {
    const parsedValue = JSON.parse(value) as Partial<MockUser>;

    if (
      typeof parsedValue.phone === 'string' &&
      parsedValue.phone.length > 0 &&
      typeof parsedValue.loginAt === 'number'
    ) {
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
      };
    }
  } catch {
    return null;
  }

  return null;
}

function dispatchMockUserChangedEvent() {
  window.dispatchEvent(new Event(mockUserChangedEventName));
}

function saveMockUser(user: MockUser) {
  window.localStorage.setItem(mockUserStorageKey, JSON.stringify(user));
  dispatchMockUserChangedEvent();

  return user;
}

export function getCurrentMockUser() {
  if (typeof window === 'undefined') return null;

  return parseMockUser(window.localStorage.getItem(mockUserStorageKey));
}

export function loginMockUser(phone: string): MockUser {
  return saveMockUser({
    id: getMockUserId(phone),
    phone,
    loginAt: Date.now(),
    avatarSrc: getRandomDefaultAvatarSrc(),
    nickname: defaultProfileNickname,
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

  window.localStorage.removeItem(mockUserStorageKey);
  dispatchMockUserChangedEvent();
}
