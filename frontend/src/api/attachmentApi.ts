import { apiClient } from "./axios";

import type { IssueAttachment } from "../types/attachment";

export async function getAttachments(
  issueNumber: string,
): Promise<IssueAttachment[]> {
  const response = await apiClient.get<IssueAttachment[]>(
    `/issues/${issueNumber}/attachments`,
  );

  return response.data;
}

export async function uploadAttachment(
  issueNumber: string,
  file: File,
): Promise<IssueAttachment> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post<IssueAttachment>(
    `/issues/${issueNumber}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function downloadAttachment(
  attachment: IssueAttachment,
): Promise<void> {
  const response = await apiClient.get<Blob>(
    `/attachments/${attachment.id}/download`,
    {
      responseType: "blob",
    },
  );

  const objectUrl = URL.createObjectURL(response.data);

  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = attachment.originalFilename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}

export async function deleteAttachment(attachmentId: number): Promise<void> {
  await apiClient.delete(`/attachments/${attachmentId}`);
}
