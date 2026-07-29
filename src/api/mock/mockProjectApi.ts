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

export type MockProjectFile = {
  name: string;
  type: string;
  date: string;
  size: string;
  icon: string;
};

export type MockProject = {
  id: string;
  title: string;
  count: number;
  createdAt: string;
  items: MockProjectItem[];
  files?: MockProjectFile[];
};

export const mockProjectsChangedEventName = 'hellome-mock-projects-changed';

function normalizeMockProjectFile(file: MockProjectFile) {
  return {
    ...file,
    type: file.type === '网站' ? '链接' : file.type,
  };
}

function cloneMockProjects(projects: MockProject[]) {
  return projects.map((project) => ({
    ...project,
    items: project.items.map((item) => ({ ...item })),
    files: project.files?.map(normalizeMockProjectFile),
  }));
}

function normalizeMockProjectFiles(
  files: MockProjectFile[] | undefined,
  seededProject: MockProject | undefined,
) {
  const sourceFiles = files ?? seededProject?.files ?? [];

  return sourceFiles.map((file) => {
    const normalizedFile = normalizeMockProjectFile(file);
    const seededFile = seededProject?.files?.find(
      (item) => item.name === normalizedFile.name,
    );

    return seededFile === undefined
      ? normalizedFile
      : {
          ...normalizedFile,
          date: seededFile.date,
          size: seededFile.size,
          icon: seededFile.icon,
        };
  });
}

function normalizeMockProjects(
  projects: MockProject[],
  seededProjects: MockProject[],
) {
  return projects.map((project) => {
    const seededProject = seededProjects.find((item) => item.id === project.id);

    return {
      ...project,
      items: project.items.map((item) => ({ ...item })),
      files: normalizeMockProjectFiles(project.files, seededProject),
    };
  });
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

  if (storedProjects !== null) {
    return normalizeMockProjects(storedProjects, seededProjects);
  }

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
