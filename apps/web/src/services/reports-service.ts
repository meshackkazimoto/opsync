import apiClient from "./api-client";
import { ReportFilter } from "@/types/reports";

export async function getReportSummary(scope: string, filter: ReportFilter) {
  return apiClient.post<unknown>(`/api/v1/reports/${scope}`, filter);
}
