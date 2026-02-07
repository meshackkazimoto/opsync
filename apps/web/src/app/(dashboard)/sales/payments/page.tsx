"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function SalesPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="Track collections" actions={<Button>Record Payment</Button>} />
      <Card>
        <Table>
          <TableElement>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>Payment</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Method</TableHeaderCell>
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
