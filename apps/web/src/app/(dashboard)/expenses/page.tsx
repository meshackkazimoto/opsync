"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" subtitle="Company spend" actions={<Button>New Expense</Button>} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Monthly Spend" description="Tracked" />
          <p className="text-2xl font-semibold">$0.00</p>
        </Card>
        <Card>
          <CardHeader title="Pending Approvals" description="This week" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
        <Card>
          <CardHeader title="Active Assets" description="Tracked" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Expense Records" description="Coming soon" />
        <Table>
          <TableElement>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>Expense</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
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
