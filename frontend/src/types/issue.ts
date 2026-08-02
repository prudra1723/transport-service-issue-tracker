export type IssueStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IssueCategory =
  | "APPLICATION"
  | "DATABASE"
  | "NETWORK"
  | "ACCESS"
  | "PERFORMANCE"
  | "INTEGRATION"
  | "OTHER";

export type CommentType = "COMMENT" | "INTERNAL_NOTE" | "RESOLUTION_NOTE";

export interface ServiceIssue {
  id: number;
  issueNumber: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;

  reportedById: number;
  reportedByUsername?: string;
  reportedByName?: string;

  assignedToId: number | null;
  assignedToUsername?: string | null;
  assignedToName?: string | null;

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

export interface UpdateIssueRequest {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
}

export interface IssueFilters {
  keyword?: string;
  status?: IssueStatus | "";
  priority?: IssuePriority | "";
  category?: IssueCategory | "";
  assignedToId?: number;
}

export interface AssignIssueRequest {
  assignedToId: number;
}

export interface UpdatePriorityRequest {
  priority: IssuePriority;
}

export interface UpdateStatusRequest {
  status: IssueStatus;
  reason: string;
  changedById: number;
}

export interface ResolveIssueRequest {
  resolutionNotes: string;
  resolvedById: number;
}

export interface IssueComment {
  id: number;
  issueId: number;
  authorId: number;
  authorUsername?: string;
  authorName?: string;
  commentText: string;
  commentType: CommentType;
  createdAt: string;
  updatedAt: string;
}

export interface AddCommentRequest {
  commentText: string;
  commentType: CommentType;
  authorId: number;
}

export interface StatusHistory {
  id: number;
  issueId: number;
  previousStatus: IssueStatus | null;
  newStatus: IssueStatus;
  reason: string | null;
  changedById: number;
  changedByUsername?: string;
  changedByName?: string;
  changedAt: string;
}
