import { apiClient } from "./axios";

import type {
  DashboardCount,
  DashboardSummary,
  MonthlyTrend,
} from "../types/dashboard";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>("/dashboard/summary");

  return response.data;
}

export async function getIssuesByPriority(): Promise<DashboardCount[]> {
  const response = await apiClient.get<DashboardCount[]>(
    "/dashboard/by-priority",
  );

  return response.data;
}

export async function getIssuesByCategory(): Promise<DashboardCount[]> {
  const response = await apiClient.get<DashboardCount[]>(
    "/dashboard/by-category",
  );

  return response.data;
}

export async function getMonthlyTrend(): Promise<MonthlyTrend[]> {
  const response = await apiClient.get<MonthlyTrend[]>(
    "/dashboard/monthly-trend",
  );

  return response.data;
}
