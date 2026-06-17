import { CONTENT_TYPES, projectTypeMeta } from '../lib/projectTypes.ts';
import { type ProjectType } from '../types.ts';

export type AppView =
  | 'home'
  | 'discover'
  | 'collections'
  | 'users'
  | 'dashboard'
  | 'notifications'
  | 'organization'
  | 'profile';

export interface SelectedProject {
  slug: string;
  projectType: ProjectType;
}

export interface SelectedCollection {
  ownerUsername: string;
  slug: string;
}

export function projectFromUrl(): SelectedProject | null {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('project');
  const rawType = params.get('type') ?? projectTypeFromPath();
  if (!slug) return null;

  return {
    slug,
    projectType: isProjectType(rawType) ? rawType : 'mod',
  };
}

export function collectionFromUrl(): SelectedCollection | null {
  const [resource, ownerUsername, slug] = window.location.pathname
    .split('/')
    .filter(Boolean);
  if (resource !== 'collections' || !ownerUsername || !slug) return null;

  return {
    ownerUsername: decodeURIComponent(ownerUsername),
    slug: decodeURIComponent(slug),
  };
}

export function viewFromUrl(): AppView {
  if (window.location.pathname === '/dashboard') return 'dashboard';
  if (window.location.pathname === '/notifications') return 'notifications';
  if (window.location.pathname === '/collections') return 'collections';
  if (window.location.pathname === '/users') return 'users';
  if (collectionFromUrl()) return 'collections';
  if (window.location.pathname === '/organizations') return 'organization';
  if (organizationFromUrl()) return 'organization';
  if (profileFromUrl()) return 'profile';
  if (projectTypeFromPath()) return 'discover';

  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'discover' ? 'discover' : 'home';
}

export function writeHomeToUrl() {
  writeStaticViewToUrl('/');
}

export function writeCollectionsToUrl() {
  writeStaticViewToUrl('/collections');
}

export function writeUsersToUrl() {
  writeStaticViewToUrl('/users');
}

export function writeProfileToUrl(username: string) {
  const url = new URL(window.location.href);
  url.pathname = `/users/${encodeURIComponent(username)}`;
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

export function writeCollectionToUrl(collection: SelectedCollection) {
  const url = new URL(window.location.href);
  url.pathname = `/collections/${encodeURIComponent(
    collection.ownerUsername,
  )}/${encodeURIComponent(collection.slug)}`;
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

export function writeDashboardToUrl() {
  writeStaticViewToUrl('/dashboard');
}

export function writeNotificationsToUrl() {
  writeStaticViewToUrl('/notifications');
}

export function writeOrganizationsToUrl() {
  writeStaticViewToUrl('/organizations');
}

export function writeProjectListToUrl(projectType: ProjectType) {
  const url = new URL(window.location.href);
  url.pathname = `/${projectTypeMeta(projectType).path}`;
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

export function profileFromUrl(): string | null {
  const [resource, username] = window.location.pathname
    .split('/')
    .filter(Boolean);
  if (resource !== 'users' || !username) return null;

  return decodeURIComponent(username);
}

export function organizationFromUrl(): string | null {
  const [resource, slug] = window.location.pathname.split('/').filter(Boolean);
  if (resource !== 'organizations' || !slug) return null;

  return decodeURIComponent(slug);
}

export function writeProjectToUrl(project: SelectedProject | null) {
  const url = new URL(window.location.href);
  if (project) {
    url.pathname = `/${projectTypeMeta(project.projectType).path}`;
    url.searchParams.set('project', project.slug);
    url.searchParams.set('type', project.projectType);
    url.searchParams.delete('view');
  } else {
    url.searchParams.delete('project');
    url.searchParams.delete('type');
    url.searchParams.delete('tab');
  }
  window.history.pushState(null, '', url);
}

export function projectTypeFromPath(): ProjectType | null {
  const segment = window.location.pathname.split('/').find(Boolean);
  const meta = CONTENT_TYPES.find((item) => item.path === segment);

  return meta?.type ?? null;
}

function writeStaticViewToUrl(pathname: string) {
  const url = new URL(window.location.href);
  url.pathname = pathname;
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

function clearProjectSearchParams(url: URL) {
  url.searchParams.delete('project');
  url.searchParams.delete('type');
  url.searchParams.delete('tab');
  url.searchParams.delete('view');
}

function isProjectType(value: string | null): value is ProjectType {
  return (
    value === 'mod' ||
    value === 'resourcepack' ||
    value === 'datapack' ||
    value === 'shader' ||
    value === 'modpack' ||
    value === 'plugin'
  );
}
