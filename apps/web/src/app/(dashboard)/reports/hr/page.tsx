"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableCell, TableElement, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

export default function HrReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="HR Reports" subtitle="Workforce insights" />
      <Card>
        <Table>
          <TableElement>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>Metric</TableHeaderCell>
                <TableHeaderCell>Value</TableHeaderCell>
                <TableHeaderCell>Trend</TableHeaderCell>
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
