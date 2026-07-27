import type { MockUser } from '../mockUserApi';
import {
  getMockUserStorageKey,
  readMockStorageValue,
  writeMockStorageValue,
} from './mockStorage';

export type MockAccountStat = {
  title: string;
  description: string;
  icon: string;
  iconClassName: string;
  actions: string[];
  metrics: string[][];
};

export type MockBillingDetail = {
  id: string;
  date: string;
  amount: string;
  originalAmount: string;
  discount: string;
};

export type MockProductBillingDetail = {
  id: string;
  model: string;
  type: string;
  amount: string;
  icon: string;
};

export type MockRequestBillingDetail = {
  id: string;
  model: string;
  time: string;
  apiKey: string;
  tokens: string;
  originalAmount: string;
  amount: string;
  icon: string;
};

export type MockAccountData = {
  stats: MockAccountStat[];
  billingDetails: MockBillingDetail[];
  productBillingDetails: MockProductBillingDetail[];
  requestBillingDetails: MockRequestBillingDetail[];
};

export const mockAccountChangedEventName = 'hellome-mock-account-changed';

function cloneMockAccountData(accountData: MockAccountData): MockAccountData {
  return {
    stats: accountData.stats.map((stat) => ({
      ...stat,
      actions: [...stat.actions],
      metrics: stat.metrics.map((metric) => [...metric]),
    })),
    billingDetails: accountData.billingDetails.map((detail) => ({ ...detail })),
    productBillingDetails: accountData.productBillingDetails.map((detail) => ({
      ...detail,
    })),
    requestBillingDetails: accountData.requestBillingDetails.map((detail) => ({
      ...detail,
    })),
  };
}

function getEmptyAccountStats(seededStats: MockAccountStat[]) {
  return seededStats.map((stat) => ({
    ...stat,
    actions: [...stat.actions],
    metrics: stat.metrics.map(([label]) => [label, '0']),
  }));
}

function getInitialMockAccountData(
  user: MockUser,
  seededAccountData: MockAccountData,
) {
  if (user.dataMode === 'empty-data') {
    return {
      stats: getEmptyAccountStats(seededAccountData.stats),
      billingDetails: [],
      productBillingDetails: [],
      requestBillingDetails: [],
    };
  }

  return cloneMockAccountData(seededAccountData);
}

function getMockAccountStorageKey(userId: string) {
  return getMockUserStorageKey(userId, 'account');
}

function dispatchMockAccountChangedEvent() {
  window.dispatchEvent(new Event(mockAccountChangedEventName));
}

function saveMockAccountData(userId: string, accountData: MockAccountData) {
  writeMockStorageValue(getMockAccountStorageKey(userId), accountData);
  dispatchMockAccountChangedEvent();

  return accountData;
}

export function getMockAccountData(
  user: MockUser | null,
  seededAccountData: MockAccountData,
) {
  if (user === null) {
    return {
      stats: getEmptyAccountStats(seededAccountData.stats),
      billingDetails: [],
      productBillingDetails: [],
      requestBillingDetails: [],
    };
  }

  const storedAccountData = readMockStorageValue<MockAccountData | null>(
    getMockAccountStorageKey(user.id),
    null,
  );

  if (storedAccountData !== null) return storedAccountData;

  return saveMockAccountData(
    user.id,
    getInitialMockAccountData(user, seededAccountData),
  );
}

export function resetMockAccountData(
  user: MockUser | null,
  seededAccountData: MockAccountData,
) {
  if (user === null) {
    return getMockAccountData(user, seededAccountData);
  }

  return saveMockAccountData(
    user.id,
    getInitialMockAccountData(user, seededAccountData),
  );
}
