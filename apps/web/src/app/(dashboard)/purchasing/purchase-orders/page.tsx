"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Purchase Orders" subtitle="Track orders" actions={<Button>New Order</Button>} />
      <Card>
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
