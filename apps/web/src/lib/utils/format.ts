export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function formatDate(value: string | number | Date) {
  const date = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
