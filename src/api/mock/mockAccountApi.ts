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

export type MockAccountType = 'personal' | 'enterprise';

export type MockEnterpriseRole = 'owner' | 'employee';

export type MockAccount = {
  id: string;
  name: string;
  type: MockAccountType;
  enterpriseRole?: MockEnterpriseRole;
  status: string;
  balance: string;
  apiKeyCount: number;
  createdAt: string;
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
  accounts: MockAccount[];
  stats: MockAccountStat[];
  billingDetails: MockBillingDetail[];
  productBillingDetails: MockProductBillingDetail[];
  requestBillingDetails: MockRequestBillingDetail[];
};

export const mockAccountChangedEventName = 'hellome-mock-account-changed';

function cloneMockAccountData(accountData: MockAccountData): MockAccountData {
  return {
    accounts: accountData.accounts.map((account) => ({ ...account })),
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
      accounts: [],
      stats: getEmptyAccountStats(seededAccountData.stats),
      billingDetails: [],
      productBillingDetails: [],
      requestBillingDetails: [],
    };
  }

  return cloneMockAccountData(seededAccountData);
}

function normalizeStoredMockAccountData(
  storedAccountData: MockAccountData,
  initialAccountData: MockAccountData,
) {
  const initialAccountById = new Map(
    initialAccountData.accounts.map((account) => [account.id, account]),
  );
  const storedAccounts = Array.isArray(storedAccountData.accounts)
    ? storedAccountData.accounts.map((account) => ({
        ...account,
        name: initialAccountById.get(account.id)?.name ?? account.name,
      }))
    : initialAccountData.accounts;

  return {
    ...storedAccountData,
    accounts: storedAccounts,
  };
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
      accounts: [],
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

  const initialAccountData = getInitialMockAccountData(user, seededAccountData);

  if (storedAccountData !== null) {
    return normalizeStoredMockAccountData(storedAccountData, initialAccountData);
  }

  return saveMockAccountData(user.id, initialAccountData);
}

export function resetMockAccountData(
  user: MockUser | null,
  seededAccountData: MockAccountData,
) {
  if (user === null) {
    return getMockAccountData(user, seededAccountData);
  }

  const currentAccountData = getMockAccountData(user, seededAccountData);
  const initialAccountData = getInitialMockAccountData(user, seededAccountData);

  return saveMockAccountData(
    user.id,
    {
      ...initialAccountData,
      accounts: currentAccountData.accounts,
    },
  );
}

function getNextExtraAccountIndex(accounts: MockAccount[]) {
  return accounts.reduce((maxIndex, account) => {
    const match = /^mock-extra-account-(\d+)$/.exec(account.id);

    return match ? Math.max(maxIndex, Number(match[1])) : maxIndex;
  }, 0) + 1;
}

export function addMockExtraAccountData(
  user: MockUser | null,
  seededAccountData: MockAccountData,
) {
  if (user === null) {
    return getMockAccountData(user, seededAccountData);
  }

  const accountData = getMockAccountData(user, seededAccountData);
  const nextIndex = getNextExtraAccountIndex(accountData.accounts);
  const isEnterprise = nextIndex % 2 === 0;
  const nextAccount: MockAccount = isEnterprise
    ? {
        id: `mock-extra-account-${nextIndex}`,
        name: `测试企业账户 ${nextIndex}`,
        type: 'enterprise',
        enterpriseRole: nextIndex % 4 === 0 ? 'owner' : 'employee',
        status: '正常',
        balance: nextIndex % 4 === 0 ? '2,048.00' : '企业共享',
        apiKeyCount: nextIndex,
        createdAt: '2026/08/17',
      }
    : {
        id: `mock-extra-account-${nextIndex}`,
        name: `测试个人账户 ${nextIndex}`,
        type: 'personal',
        status: '正常',
        balance: `${128 + nextIndex}.00`,
        apiKeyCount: Math.max(1, nextIndex % 5),
        createdAt: '2026/08/17',
      };

  return saveMockAccountData(user.id, {
    ...accountData,
    accounts: [...accountData.accounts, nextAccount],
  });
}

export function resetMockExtraAccountData(
  user: MockUser | null,
  seededAccountData: MockAccountData,
) {
  if (user === null) {
    return getMockAccountData(user, seededAccountData);
  }

  const accountData = getMockAccountData(user, seededAccountData);

  return saveMockAccountData(user.id, {
    ...accountData,
    accounts: accountData.accounts.filter(
      (account) => !account.id.startsWith('mock-extra-account-'),
    ),
  });
}

export function updateMockAccountName(
  user: MockUser | null,
  seededAccountData: MockAccountData,
  accountId: string,
  name: string,
) {
  if (user === null) {
    return getMockAccountData(user, seededAccountData);
  }

  const accountData = getMockAccountData(user, seededAccountData);

  return saveMockAccountData(user.id, {
    ...accountData,
    accounts: accountData.accounts.map((account) =>
      account.id === accountId ? { ...account, name } : account,
    ),
  });
}
