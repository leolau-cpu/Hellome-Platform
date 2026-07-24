export {
  defaultAvatarSrcs,
  defaultProfileNickname,
  getCurrentMockUser as getStoredLoginSession,
  loginMockUser as createLoginSession,
  logoutMockUser as clearLoginSession,
  mockUserChangedEventName as authChangedEventName,
  updateMockUserProfile as updateStoredLoginProfile,
  type MockUser as LoginSession,
} from './api/mockUserApi';
