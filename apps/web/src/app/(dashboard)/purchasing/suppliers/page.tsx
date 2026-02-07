"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" subtitle="Vendor directory" actions={<Button>New Supplier</Button>} />
      <Card>
        <Table>
          <TableElement>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>Supplier</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
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
