export interface ProjectAnalytics {
  days: ProjectAnalyticsDay[];
  downloadsLast30Days: number;
  projectSlug: string;
  totalDownloads: number;
  totalViews: number;
  viewsLast30Days: number;
}

export interface ProjectAnalyticsDay {
  date: string;
  downloads: number;
  views: number;
}

export interface ProjectAnalyticsQueryData {
  projectAnalytics: ProjectAnalytics | null;
}

export interface ProjectAnalyticsQueryVariables {
  projectSlug: string;
}
