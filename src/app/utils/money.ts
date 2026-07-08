export function parseCurrencyAmount(value: string) {
  return Number.parseInt(value.replace(/\D/g, ""), 10) || 0;
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}
