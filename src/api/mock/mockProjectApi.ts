import type { MockUser } from '../mockUserApi';
import {
  getMockUserStorageKey,
  readMockStorageValue,
  writeMockStorageValue,
} from './mockStorage';

export type MockProjectItem = {
  title: string;
  project: string;
  time: string;
  task: string;
  image: string;
  status?: string;
};

export type MockProject = {
  id: string;
  title: string;
  count: number;
  createdAt: string;
  items: MockProjectItem[];
};

export const mockProjectsChangedEventName = 'hellome-mock-projects-changed';

function cloneMockProjects(projects: MockProject[]) {
  return projects.map((project) => ({
    ...project,
    items: project.items.map((item) => ({ ...item })),
  }));
}

function getMockProjectsStorageKey(userId: string) {
  return getMockUserStorageKey(userId, 'projects');
}

function dispatchMockProjectsChangedEvent() {
  window.dispatchEvent(new Event(mockProjectsChangedEventName));
}

function saveMockProjects(userId: string, projects: MockProject[]) {
  writeMockStorageValue(getMockProjectsStorageKey(userId), projects);
  dispatchMockProjectsChangedEvent();

  return projects;
}

export function getMockProjects(
  user: MockUser | null,
  seededProjects: MockProject[],
) {
  if (user === null) return [];

  const storedProjects = readMockStorageValue<MockProject[] | null>(
    getMockProjectsStorageKey(user.id),
    null,
  );

  if (storedProjects !== null) return storedProjects;

  const initialProjects =
    user.dataMode === 'empty-data' ? [] : cloneMockProjects(seededProjects);

  return saveMockProjects(user.id, initialProjects);
}

export function saveCurrentMockProjects(
  user: MockUser | null,
  projects: MockProject[],
) {
  if (user === null) return [];

  return saveMockProjects(user.id, projects);
}

export function resetMockProjects(
  user: MockUser | null,
  seededProjects: MockProject[],
) {
  if (user === null) return [];

  const initialProjects =
    user.dataMode === 'empty-data' ? [] : cloneMockProjects(seededProjects);

  return saveMockProjects(user.id, initialProjects);
}
