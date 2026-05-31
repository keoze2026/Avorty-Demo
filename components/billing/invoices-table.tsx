"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { MOCK_INVOICES } from "@/lib/mock/billing";
import type { InvoiceStatus } from "@/lib/types";

const STATUS_VARIANT: Record<InvoiceStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  paid: "success",
  open: "warning",
  void: "outline",
  uncollectible: "destructive",
};
const STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: "Paid",
  open: "Open",
  void: "Void",
  uncollectible: "Failed",
};

export function InvoicesTable() {
  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(0);
  React.useEffect(() => {
    setPage(0);
  }, [pageSize]);
  const visible = MOCK_INVOICES.slice(page * pageSize, page * pageSize + pageSize);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-accent" />
          Invoices
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => toast.success("Invoices exported")}>
          <Download className="h-3 w-3" /> Export all
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="text-left">Invoice</TableHead>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.22 }}
                  className="border-b border-border/60 transition-colors hover:bg-secondary/20"
                >
                  <TableCell className="font-mono text-xs">{inv.number}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs">{inv.description}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatCurrency(inv.amount, true)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Open invoice"
                      onClick={() => toast.success(`Downloaded ${inv.number}.pdf`)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
        {MOCK_INVOICES.length > pageSize && (
          <div className="border-t border-border/60 px-4 py-3">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={MOCK_INVOICES.length}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
