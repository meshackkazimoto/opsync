"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmployee } from "@/services/employee-service";
import { Badge } from "@/components/ui/badge";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data, isLoading } = useEmployee(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Details"
        subtitle="Detailed record"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push(`/employees/${id}/edit`)}>
              Edit
            </Button>
            <Button variant="ghost" onClick={() => router.push("/employees")}>Back</Button>
          </div>
        }
      />

      <Card>
        {isLoading && <p className="text-sm text-muted">Loading...</p>}
        {!isLoading && data && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Name</p>
              <p className="text-lg font-semibold">{data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Status</p>
              <Badge variant={data.status === "active" ? "secondary" : data.status === "on_leave" ? "primary" : "danger"}>
                {data.status.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Email</p>
              <p>{data.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Role</p>
              <p>{data.role}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Department</p>
              <p>{data.department}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Phone</p>
              <p>{data.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Hire Date</p>
              <p>{data.hireDate || "-"}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
