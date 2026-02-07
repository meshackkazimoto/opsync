"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

export default function PurchasingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Purchasing" subtitle="Control vendor orders" actions={<Button>New Purchase Order</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Open Orders" description="Pending approvals" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
        <Card>
          <CardHeader title="Suppliers" description="Active" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
        <Card>
          <CardHeader title="Receiving" description="This week" />
          <p className="text-2xl font-semibold">0</p>
        </Card>
      </div>
      <Card>
        <CardHeader title="Purchase Orders" description="Coming soon" />
        <Table>
          <TableElement>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Supplier</TableHeaderCell>
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
