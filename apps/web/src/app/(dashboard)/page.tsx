"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { useEmployeesList } from "@/services/employee-service";

export default function DashboardPage() {
  const { data, isLoading } = useEmployeesList();

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle="Live operations snapshot" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Employees" description="Active workforce" />
          {isLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-semibold">{data?.length ?? 0}</p>}
        </Card>
        <Card>
          <CardHeader title="Sales" description="Monthly revenue" />
          <p className="text-3xl font-semibold">$0.00</p>
          <p className="text-xs text-muted">Coming soon</p>
        </Card>
        <Card>
          <CardHeader title="Purchasing" description="Open orders" />
          <p className="text-3xl font-semibold">0</p>
          <p className="text-xs text-muted">Coming soon</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Activity" description="Operational updates" />
        <div className="space-y-3 text-sm text-muted">
          <p>New module integrations will appear here.</p>
          <p>Connect teams, vendors, and finance workflows to unlock activity logs.</p>
        </div>
      </Card>
    </div>
  );
}
