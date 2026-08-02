export interface DashboardSummary {
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
  averageResolutionHours: number;
}

export interface DashboardCount {
  label: string;
  count: number;
}
export interface MonthlyTrend {
  month: string;
  count: number;
}
