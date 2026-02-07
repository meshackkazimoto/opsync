import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";
import { EmployeeRole, EmployeeRoleCreateInput, EmployeeRoleUpdateInput } from "@/types/employee-role";

const listKey = ["employee-roles"] as const;

export async function getEmployeeRoles() {
  return apiClient.get<EmployeeRole[]>("/api/v1/employee-roles");
}

export async function createEmployeeRole(payload: EmployeeRoleCreateInput) {
  return apiClient.post<EmployeeRole>("/api/v1/employee-roles", payload);
}

export async function updateEmployeeRole(id: string, payload: EmployeeRoleUpdateInput) {
  return apiClient.put<EmployeeRole>(`/api/v1/employee-roles/${id}`, payload);
}

export async function removeEmployeeRole(id: string) {
  return apiClient.delete<{ id: string }>(`/api/v1/employee-roles/${id}`);
}

export function useEmployeeRolesList() {
  return useQuery({ queryKey: listKey, queryFn: getEmployeeRoles });
}

export function useCreateEmployeeRole() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createEmployeeRole,
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}

export function useUpdateEmployeeRole() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeRoleUpdateInput }) =>
      updateEmployeeRole(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}

export function useDeleteEmployeeRole() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: removeEmployeeRole,
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}
