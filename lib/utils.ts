import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(amount: number | string) {
  const num = Number(amount || 0)
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDateTime(date: string | number | Date | null | undefined, includeTime = true) {
  if (!date) return "N/A"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "Invalid Date"
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
    options.hour12 = true
  }
  return new Intl.DateTimeFormat("en-GB", options).format(d)
}
