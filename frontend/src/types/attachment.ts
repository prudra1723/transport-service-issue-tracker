export interface IssueAttachment {
  id: number;
  originalFilename: string;
  contentType: string | null;
  fileSize: number;
  uploadedById: number;
  uploadedByUsername: string;
  uploadedAt: string;
}
