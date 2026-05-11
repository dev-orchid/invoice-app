import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Indian financial year runs from April 1 to March 31.
export function getFinancialYear(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = d.getMonth() // 0-indexed; 3 = April
  const fyStart = month >= 3 ? year : year - 1
  const fyEnd = fyStart + 1
  return { fyStart, fyEnd }
}

// Returns "YYYY-04-01" and "YYYY-03-31" (next year) as ISO date strings
// for the FY containing the given date.
export function getFinancialYearRange(date: Date | string) {
  const { fyStart, fyEnd } = getFinancialYear(date)
  return {
    start: `${fyStart}-04-01`,
    end: `${fyEnd}-03-31`,
  }
}

// Format: SJMW/01/26-27
export function formatInvoiceNumber(invoiceNumber: number, invoiceDate: Date | string) {
  const { fyStart, fyEnd } = getFinancialYear(invoiceDate)
  const num = String(invoiceNumber).padStart(2, '0')
  const fy = `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`
  return `SJMW/${num}/${fy}`
}
