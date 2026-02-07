"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Operational analytics" actions={<Button variant="ghost">Export</Button>} />

      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="From" type="date" />
          <Input label="To" type="date" />
          <Input label="Department" placeholder="All departments" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Headcount" description="Current" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
        <Card>
          <CardHeader title="Revenue" description="This period" />
          <p className="text-2xl font-semibold">$0.00</p>
        </Card>
        <Card>
          <CardHeader title="Spend" description="This period" />
          <p className="text-2xl font-semibold">$0.00</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Summary" description="Coming soon" />
        <Table>
          <TableElement>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>Metric</TableHeaderCell>
                <TableHeaderCell>Current</TableHeaderCell>
                <TableHeaderCell>Change</TableHeaderCell>
                <TableHeaderCell>Notes</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              <TableRow>
                <TableCell colSpan={4}>Coming soon.</TableCell>
              </TableRow>
            </tbody>
          </TableElement>
        </Table>
      </Card>
    </div>
  );
}
