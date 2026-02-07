"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, type DepartmentSchema } from "@/schemas/employee-meta.schema";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import {
  useDepartmentsList,
  useCreateDepartment,
  useDeleteDepartment,
} from "@/services/department-service";

export default function DepartmentsPage() {
  const router = useRouter();
  const { notify } = useToast();
  const { data, isLoading } = useDepartmentsList();
  const createDepartment = useCreateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentSchema>({
    resolver: zodResolver(departmentSchema),
  });

  const onSubmit = async (values: DepartmentSchema) => {
    try {
      await createDepartment.mutateAsync(values);
      notify({ title: "Department created", tone: "success" });
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
      await deleteDepartment.mutateAsync(pendingDelete);
      notify({ title: "Department deleted", tone: "success" });
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
        title="Departments"
        subtitle="Create and manage department options"
        actions={
          <Button variant="ghost" onClick={() => router.push("/employees")}>
            Back to Employees
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
          <Input label="Department name" error={errors.name?.message} {...register("name")} />
          <Input label="Description" error={errors.description?.message} {...register("description")} />
          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving" : "Add Department"}
            </Button>
          </div>
        </form>
      </Card>

      <Table>
        <TableElement>
          <TableHead sticky>
            <TableRow>
              <TableHeaderCell>Department</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>Loading departments...</TableCell>
              </TableRow>
            )}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={3}>No departments yet.</TableCell>
              </TableRow>
            )}
            {data?.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>{department.description || "-"}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => setPendingDelete(department.id)}>
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
        title="Delete department"
        description="This action cannot be undone. Employees using this department will keep the stored name."
      />
    </div>
  );
}
