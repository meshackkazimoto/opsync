"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { ConfirmModal } from "@/components/ui/modal";
import { useEmployeesList, useDeleteEmployee } from "@/services/employee-service";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function EmployeesPage() {
  const router = useRouter();
  const { notify } = useToast();
  const { data, isLoading } = useEmployeesList();
  const deleteEmployee = useDeleteEmployee();
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.toLowerCase();
    return data.filter((item) =>
      [item.firstName, item.lastName, item.email, item.department, item.role].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [data, query]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteEmployee.mutateAsync(pendingDelete);
      notify({ title: "Employee deleted", tone: "success" });
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
        title="Employees"
        subtitle="Manage people records"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push("/employees/roles")}>
              Roles
            </Button>
            <Button variant="ghost" onClick={() => router.push("/employees/departments")}>
              Departments
            </Button>
            <Button onClick={() => router.push("/employees/new")}>New Employee</Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by name, email, role"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button variant="ghost">Export</Button>
        </div>
      </Card>

      <Table>
        <TableElement>
          <TableHead sticky>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Department</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Loading employees...</TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No employees found.</TableCell>
              </TableRow>
            )}
            {filtered.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                  <div className="text-xs text-muted">{employee.email}</div>
                </TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <Badge variant={employee.status === "active" ? "secondary" : employee.status === "on_leave" ? "primary" : "danger"}>
                    {employee.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => router.push(`/employees/${employee.id}`)}>
                      View
                    </Button>
                    <Button variant="ghost" onClick={() => router.push(`/employees/${employee.id}/edit`)}>
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => setPendingDelete(employee.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </TableElement>
      </Table>

      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
        <span>Showing {filtered.length} of {data?.length ?? 0}</span>
        <div className="flex gap-2">
          <Button variant="ghost">Prev</Button>
          <Button variant="ghost">Next</Button>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete employee"
        description="This action cannot be undone. The employee record will be removed."        
      />
    </div>
  );
}
