"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeSchema } from "@/schemas/employees.schema";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEmployee, useUpdateEmployee } from "@/services/employee-service";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { useEmployeeRolesList } from "@/services/employee-role-service";
import { useDepartmentsList } from "@/services/department-service";

export default function EditEmployeePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { notify } = useToast();
  const { data } = useEmployee(id);
  const updateEmployee = useUpdateEmployee(id);
  const { data: roles } = useEmployeeRolesList();
  const { data: departments } = useDepartmentsList();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeSchema>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: "active" },
  });

  useEffect(() => {
    if (data) {
      reset({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        department: data.department,
        status: data.status,
        phone: data.phone,
        hireDate: data.hireDate,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: EmployeeSchema) => {
    try {
      await updateEmployee.mutateAsync(values);
      notify({ title: "Employee updated", tone: "success" });
      router.replace(`/employees/${id}`);
    } catch (error) {
      notify({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Try again",
        tone: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Employee" subtitle="Update profile details" />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input label="First name" error={errors.firstName?.message} {...register("firstName")} />
          <Input label="Last name" error={errors.lastName?.message} {...register("lastName")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Select label="Role" error={errors.role?.message} {...register("role")}>
            <option value="">Select role</option>
            {roles?.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </Select>
          <Select label="Department" error={errors.department?.message} {...register("department")}>
            <option value="">Select department</option>
            {departments?.map((department) => (
              <option key={department.id} value={department.name}>
                {department.name}
              </option>
            ))}
          </Select>
          <Select label="Status" error={errors.status?.message} {...register("status")}>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
          <Input label="Hire date" type="date" error={errors.hireDate?.message} {...register("hireDate")} />
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving" : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
