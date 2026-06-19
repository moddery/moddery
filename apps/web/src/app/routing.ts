import { PROJECT_TYPES } from '@moddery/shared';

import { CONTENT_TYPES, projectTypeMeta } from '../lib/projectTypes.ts';
import { type ProjectType } from '../types.ts';

export type AppView =
  | 'home'
  | 'discover'
  | 'collections'
  | 'users'
  | 'dashboard'
  | 'notifications'
  | 'platform'
  | 'status'
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
  return collectionFromPathname(window.location.pathname);
}

export function viewFromUrl(): AppView {
  const staticView = staticViewFromPathname(window.location.pathname);
  if (staticView) return staticView;

  if (collectionFromUrl()) return 'collections';
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

export function userPath(username: string) {
  return `/users/${encodeURIComponent(username)}`;
}

export function collectionPath(collection: SelectedCollection) {
  return `/collections/${encodeURIComponent(
    collection.ownerUsername,
  )}/${encodeURIComponent(collection.slug)}`;
}

export function organizationPath(slug: string) {
  return `/organizations/${encodeURIComponent(slug)}`;
}

export function projectPath(projectType: ProjectType, slug: string) {
  const meta = projectTypeMeta(projectType);
  return `/${meta.path}?project=${encodeURIComponent(slug)}&type=${encodeURIComponent(meta.type)}`;
}

export function dashboardPath(sectionId?: string) {
  return sectionId === undefined
    ? '/dashboard'
    : `/dashboard#${encodeURIComponent(sectionId)}`;
}

export function writeProfileToUrl(username: string) {
  const url = new URL(window.location.href);
  url.pathname = userPath(username);
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

export function writeCollectionToUrl(collection: SelectedCollection) {
  const url = new URL(window.location.href);
  url.pathname = collectionPath(collection);
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

export function writeDashboardToUrl() {
  writeStaticViewToUrl('/dashboard');
}

export function writeNotificationsToUrl() {
  writeStaticViewToUrl('/notifications');
}

export function writeStatusToUrl() {
  writeStaticViewToUrl('/status');
}

export function writePlatformToUrl() {
  writeStaticViewToUrl('/platform');
}

export function writeOrganizationsToUrl() {
  writeStaticViewToUrl('/organizations');
}

export function writeOrganizationToUrl(slug: string) {
  const url = new URL(window.location.href);
  url.pathname = organizationPath(slug);
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

export function writeProjectListToUrl(projectType: ProjectType) {
  const url = new URL(window.location.href);
  url.pathname = `/${projectTypeMeta(projectType).path}`;
  clearProjectSearchParams(url);

  window.history.pushState(null, '', url);
}

export function profileFromUrl(): string | null {
  return profileFromPathname(window.location.pathname);
}

export function organizationFromUrl(): string | null {
  return organizationFromPathname(window.location.pathname);
}

export function writeProjectToUrl(project: SelectedProject | null) {
  const url = new URL(window.location.href);
  if (project) {
    const nextUrl = new URL(
      projectPath(project.projectType, project.slug),
      url,
    );
    url.pathname = nextUrl.pathname;
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
  return projectTypeFromPathname(window.location.pathname);
}

export function projectFromNavigationUrl(url: URL): SelectedProject | null {
  const slug = url.searchParams.get('project');
  if (!slug) return null;

  return {
    projectType: projectTypeFromNavigationUrl(url) ?? 'mod',
    slug,
  };
}

export function collectionFromNavigationUrl(
  url: URL,
): SelectedCollection | null {
  return collectionFromPathname(url.pathname);
}

export function profileFromNavigationUrl(url: URL): string | null {
  return profileFromPathname(url.pathname);
}

export function organizationFromNavigationUrl(url: URL): string | null {
  return organizationFromPathname(url.pathname);
}

export function projectTypeFromNavigationUrl(url: URL): ProjectType | null {
  const type = url.searchParams.get('type');
  if (type && isProjectType(type)) return type;

  return projectTypeFromPathname(url.pathname);
}

export function staticViewFromNavigationUrl(url: URL): AppView | null {
  return staticViewFromPathname(url.pathname);
}

export function staticNavigationUrl(url: URL): URL | null {
  if (staticViewFromNavigationUrl(url) === null) return null;

  const nextUrl = new URL(url);
  clearProjectSearchParams(nextUrl);

  return nextUrl;
}

function collectionFromPathname(pathname: string): SelectedCollection | null {
  const [resource, ownerUsername, slug] = pathname.split('/').filter(Boolean);
  if (resource !== 'collections' || !ownerUsername || !slug) return null;

  return {
    ownerUsername: decodeURIComponent(ownerUsername),
    slug: decodeURIComponent(slug),
  };
}

function profileFromPathname(pathname: string): string | null {
  const [resource, username] = pathname.split('/').filter(Boolean);
  if (resource !== 'users' || !username) return null;

  return decodeURIComponent(username);
}

function organizationFromPathname(pathname: string): string | null {
  const [resource, slug] = pathname.split('/').filter(Boolean);
  if (resource !== 'organizations' || !slug) return null;

  return decodeURIComponent(slug);
}

function projectTypeFromPathname(pathname: string): ProjectType | null {
  const segment = pathname.split('/').find(Boolean);
  const meta = CONTENT_TYPES.find((item) => item.path === segment);

  return meta?.type ?? null;
}

function staticViewFromPathname(pathname: string): AppView | null {
  switch (pathname) {
    case '/':
      return 'home';
    case '/collections':
      return 'collections';
    case '/dashboard':
      return 'dashboard';
    case '/notifications':
      return 'notifications';
    case '/organizations':
      return 'organization';
    case '/platform':
      return 'platform';
    case '/status':
      return 'status';
    case '/users':
      return 'users';
    default:
      return null;
  }
}

function writeStaticViewToUrl(pathname: string) {
  const url = new URL(window.location.href);
  url.pathname = pathname;
  url.hash = '';
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
  return value !== null && PROJECT_TYPES.includes(value as ProjectType);
}
