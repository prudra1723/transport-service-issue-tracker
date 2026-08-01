export type IssueStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IssueCategory =
  | "APPLICATION"
  | "HARDWARE"
  | "NETWORK"
  | "SECURITY"
  | "OTHER";

export interface ServiceIssue {
  id: number;
  issueNumber: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  reportedById: number;
  assignedToId: number | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  reportedById: number;
}

export interface IssueFilters {
  keyword?: string;
  status?: IssueStatus | "";
  priority?: IssuePriority | "";
  category?: IssueCategory | "";
  assignedToId?: number;
}
