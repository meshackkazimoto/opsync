"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeRoleSchema, type EmployeeRoleSchema } from "@/schemas/employee-meta.schema";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import {
  useEmployeeRolesList,
  useCreateEmployeeRole,
  useDeleteEmployeeRole,
} from "@/services/employee-role-service";

export default function EmployeeRolesPage() {
  const router = useRouter();
  const { notify } = useToast();
  const { data, isLoading } = useEmployeeRolesList();
  const createRole = useCreateEmployeeRole();
  const deleteRole = useDeleteEmployeeRole();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeRoleSchema>({
    resolver: zodResolver(employeeRoleSchema),
  });

  const onSubmit = async (values: EmployeeRoleSchema) => {
    try {
      await createRole.mutateAsync(values);
      notify({ title: "Role created", tone: "success" });
      reset();
    } catch (error) {
      notify({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Try again",
        tone: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRole.mutateAsync(pendingDelete);
      notify({ title: "Role deleted", tone: "success" });
    } catch (error) {
      notify({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Try again",
        tone: "error",
      });
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Roles"
        subtitle="Create and manage role options"
        actions={
          <Button variant="ghost" onClick={() => router.push("/employees")}>
            Back to Employees
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
          <Input label="Role name" error={errors.name?.message} {...register("name")} />
          <Input label="Description" error={errors.description?.message} {...register("description")} />
          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving" : "Add Role"}
            </Button>
          </div>
        </form>
      </Card>

      <Table>
        <TableElement>
          <TableHead sticky>
            <TableRow>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>Loading roles...</TableCell>
              </TableRow>
            )}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={3}>No roles yet.</TableCell>
              </TableRow>
            )}
            {data?.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description || "-"}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => setPendingDelete(role.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </TableElement>
      </Table>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete role"
        description="This action cannot be undone. Employees using this role will keep the stored name."
      />
    </div>
  );
}
