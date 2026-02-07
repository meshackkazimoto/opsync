import { ReactNode } from "react";
import { Breadcrumb } from "./breadcrumb";

export function PageHeader({ title, actions, subtitle }: { title: string; actions?: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
