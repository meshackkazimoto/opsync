import { cn } from "@/lib/utils/cn";
import { ReactNode, type ThHTMLAttributes, type TdHTMLAttributes, type HTMLAttributes } from "react";

export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("overflow-x-auto border border-border", className)}>{children}</div>;
}

export function TableElement({ className, children }: { className?: string; children: ReactNode }) {
  return <table className={cn("min-w-full border-collapse text-sm", className)}>{children}</table>;
}

export function TableHead({ className, sticky, children }: { className?: string; sticky?: boolean; children: ReactNode }) {
  return (
    <thead className={cn(sticky && "sticky top-0 z-10 bg-surface", className)}>{children}</thead>
  );
}

export function TableRow({
  className,
  children,
  ...props
}: { className?: string; children: ReactNode } & HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-border", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  className,
  children,
  ...props
}: { className?: string; children: ReactNode } & ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-muted", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  ...props
}: { className?: string; children: ReactNode } & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-sm", className)} {...props}>
      {children}
    </td>
  );
}
