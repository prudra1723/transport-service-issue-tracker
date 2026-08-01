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

export interface IssueComment {
  id: number;
  issueId: number;
  authorId: number;
  commentText: string;
  commentType: CommentType;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: number;
  issueId: number;
  previousStatus: IssueStatus | null;
  newStatus: IssueStatus;
  reason: string | null;
  changedById: number;
  changedAt: string;
}

export interface AddCommentRequest {
  commentText: string;
  commentType: CommentType;
  authorId: number;
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
