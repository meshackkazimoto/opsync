import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";
import { Employee, EmployeeCreateInput, EmployeeUpdateInput } from "@/types/employee";

const listKey = ["employees"] as const;

export async function getList() {
  return apiClient.get<Employee[]>("/api/v1/employees");
}

export async function getById(id: string) {
  return apiClient.get<Employee>(`/api/v1/employees/${id}`);
}

export async function create(payload: EmployeeCreateInput) {
  return apiClient.post<Employee>("/api/v1/employees", payload);
}

export async function update(id: string, payload: EmployeeUpdateInput) {
  return apiClient.put<Employee>(`/api/v1/employees/${id}`, payload);
}

export async function remove(id: string) {
  return apiClient.delete<{ id: string }>(`/api/v1/employees/${id}`);
}

export function useEmployeesList() {
  return useQuery({ queryKey: listKey, queryFn: getList });
}

export function useEmployee(id: string) {
  return useQuery({ queryKey: [...listKey, id], queryFn: () => getById(id), enabled: Boolean(id) });
}

export function useCreateEmployee() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: create,
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}

export function useUpdateEmployee(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeUpdateInput) => update(id, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: listKey });
      client.invalidateQueries({ queryKey: [...listKey, id] });
    },
  });
}

export function useDeleteEmployee() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: remove,
    onSuccess: () => client.invalidateQueries({ queryKey: listKey }),
  });
}
