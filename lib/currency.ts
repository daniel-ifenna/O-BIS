export function formatNaira(value: any): string {
  const num = Number(String(value).replace(/[^0-9.]/g, "")) || 0
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(num)
  } catch {
    return `₦${num.toLocaleString("en-NG")}`
  }
}
