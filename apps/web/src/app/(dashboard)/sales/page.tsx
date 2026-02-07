"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        subtitle="Revenue operations"
        actions={<Button variant="ghost">New Invoice</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Total Revenue" description="This month" />
          <p className="text-2xl font-semibold">$0.00</p>
        </Card>
        <Card>
          <CardHeader title="Open Invoices" description="Awaiting payment" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
        <Card>
          <CardHeader title="Receipts" description="Processed" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Pipeline" description="Coming soon" />
        <Table>
          <TableElement>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Invoice</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
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
