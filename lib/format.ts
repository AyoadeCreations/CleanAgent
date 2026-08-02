export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

export function formatCompactCurrency(amount: number, currency = "USD"): string {
  if (Math.abs(amount) >= 1_000_000) return `${formatNumber(amount / 1_000_000, 2)}M`;
  if (Math.abs(amount) >= 1_000) return `${formatNumber(amount / 1_000, 1)}K`;
  return formatCurrency(amount, currency);
}

export function formatTokenAmount(amount: number, symbol?: string): string {
  const formatted = formatNumber(amount, amount >= 1000 ? 0 : 2);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
