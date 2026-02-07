import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";
import { Department, DepartmentCreateInput, DepartmentUpdateInput } from "@/types/department";

const listKey = ["departments"] as const;

export async function getDepartments() {
  return apiClient.get<Department[]>("/api/v1/departments");
}

export async function createDepartment(payload: DepartmentCreateInput) {
  return apiClient.post<Department>("/api/v1/departments", payload);
}

export async function updateDepartment(id: string, payload: DepartmentUpdateInput) {
  return apiClient.put<Department>(`/api/v1/departments/${id}`, payload);
}

export async function removeDepartment(id: string) {
  return apiClient.delete<{ id: string }>(`/api/v1/departments/${id}`);
}

export function useDepartmentsList() {
  return useQuery({ queryKey: listKey, queryFn: getDepartments });
}

export function useCreateDepartment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}

export function useUpdateDepartment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DepartmentUpdateInput }) =>
      updateDepartment(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}

export function useDeleteDepartment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: removeDepartment,
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}
