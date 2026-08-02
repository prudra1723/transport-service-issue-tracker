import { apiClient } from "./axios";

import type {
  AddCommentRequest,
  AssignIssueRequest,
  CreateIssueRequest,
  IssueComment,
  IssueFilters,
  IssuePriority,
  ResolveIssueRequest,
  ServiceIssue,
  StatusHistory,
  UpdateIssueRequest,
  UpdateStatusRequest,
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

export async function updateIssue(
  issueNumber: string,
  request: UpdateIssueRequest,
): Promise<ServiceIssue> {
  const response = await apiClient.put<ServiceIssue>(
    `/issues/${issueNumber}`,
    request,
  );

  return response.data;
}

export async function deleteIssue(issueNumber: string): Promise<void> {
  await apiClient.delete(`/issues/${issueNumber}`);
}

export async function assignIssue(
  issueNumber: string,
  assignedToId: number,
): Promise<ServiceIssue> {
  const request: AssignIssueRequest = {
    assignedToId,
  };

  const response = await apiClient.patch<ServiceIssue>(
    `/issues/${issueNumber}/assignment`,
    request,
  );

  return response.data;
}

export async function updateIssuePriority(
  issueNumber: string,
  priority: IssuePriority,
): Promise<ServiceIssue> {
  const response = await apiClient.patch<ServiceIssue>(
    `/issues/${issueNumber}/priority`,
    { priority },
  );

  return response.data;
}

export async function updateIssueStatus(
  issueNumber: string,
  request: UpdateStatusRequest,
): Promise<ServiceIssue> {
  const response = await apiClient.patch<ServiceIssue>(
    `/issues/${issueNumber}/status`,
    request,
  );

  return response.data;
}

export async function resolveIssue(
  issueNumber: string,
  request: ResolveIssueRequest,
): Promise<ServiceIssue> {
  const response = await apiClient.patch<ServiceIssue>(
    `/issues/${issueNumber}/resolution`,
    request,
  );

  return response.data;
}

export async function getIssueComments(
  issueNumber: string,
): Promise<IssueComment[]> {
  const response = await apiClient.get<IssueComment[]>(
    `/issues/${issueNumber}/comments`,
  );

  return response.data;
}

export async function addIssueComment(
  issueNumber: string,
  request: AddCommentRequest,
): Promise<IssueComment> {
  const response = await apiClient.post<IssueComment>(
    `/issues/${issueNumber}/comments`,
    request,
  );

  return response.data;
}

export async function getIssueHistory(
  issueNumber: string,
): Promise<StatusHistory[]> {
  const response = await apiClient.get<StatusHistory[]>(
    `/issues/${issueNumber}/history`,
  );

  return response.data;
}
