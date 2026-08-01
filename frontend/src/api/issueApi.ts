import { apiClient } from "./axios";

import type {
  CreateIssueRequest,
  IssueFilters,
  ServiceIssue,
} from "../types/issue";

export async function getIssues(
  filters: IssueFilters = {},
): Promise<ServiceIssue[]> {
  const response = await apiClient.get<ServiceIssue[]>("/issues", {
    params: {
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      category: filters.category || undefined,
      assignedToId: filters.assignedToId || undefined,
    },
  });

  return response.data;
}

export async function getIssue(issueNumber: string): Promise<ServiceIssue> {
  const response = await apiClient.get<ServiceIssue>(`/issues/${issueNumber}`);

  return response.data;
}

export async function createIssue(
  request: CreateIssueRequest,
): Promise<ServiceIssue> {
  const response = await apiClient.post<ServiceIssue>("/issues", request);

  return response.data;
}
