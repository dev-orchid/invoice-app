'use client'

import { format } from 'date-fns'

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (num === 0) return 'Zero'

  const convertLessThanThousand = (n: number): string => {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '')
  }

  const convert = (n: number): string => {
    if (n < 1000) return convertLessThanThousand(n)
    if (n < 100000) return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertLessThanThousand(n % 1000) : '')
    if (n < 10000000) return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '')
    return convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '')
  }

  const rupees = Math.floor(num)
  const paise = Math.round((num - rupees) * 100)

  let result = convert(rupees) + ' Rupees'
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise'
  }
  return result + ' Only'
}

interface InvoiceItem {
  id: string
  product_name: string
  hsn_code: string | null
  rate: number
  quantity: number
  unit: string
  total: number
  sort_order: number
}

interface Invoice {
  id: string
  invoice_number: number
  gstin: string | null
  invoice_date: string
  client_name: string
  client_contact: string | null
  ship_address: string | null
  sub_total: number
  discount: number
  gst_amount: number
  cgst_amount: number
  sgst_amount: number
  grand_total: number
  invoice_items: InvoiceItem[]
}

interface PrintViewProps {
  invoice: Invoice
}

export function PrintView({ invoice }: PrintViewProps) {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
      <style jsx global>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <button
        onClick={() => window.print()}
        className="no-print mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Print Invoice
      </button>

      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        <p className="text-xs">GSTIN: 10CEKPP9425G1ZG</p>
        <h1 className="text-2xl font-bold mt-2">Tax Invoice</h1>
        <h2 className="text-xl font-semibold">Sipahi Jee Metal Works</h2>
        <p className="text-sm text-gray-600">
          NEW ATWARPUR KURTHAUL, Parsa Bazar, Patna, Bihar, 804453
        </p>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{invoice.client_name}</p>
          {invoice.ship_address && <p className="text-sm">{invoice.ship_address}</p>}
          {invoice.gstin && <p className="text-sm">GSTIN: {invoice.gstin}</p>}
          {invoice.client_contact && <p className="text-sm">Contact: {invoice.client_contact}</p>}
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Invoice No:</span> INV-{String(invoice.invoice_number).padStart(4, '0')}</p>
          <p><span className="font-semibold">Date:</span> {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</p>
          <p><span className="font-semibold">Place of Supply:</span> Bihar (10)</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">#</th>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2 text-left">HSN/SAC</th>
            <th className="border p-2 text-right">Rate</th>
            <th className="border p-2 text-right">Qty</th>
            <th className="border p-2 text-left">Per</th>
            <th className="border p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoice_items
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item, index) => (
              <tr key={item.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2">{item.hsn_code || '-'}</td>
                <td className="border p-2 text-right">{item.rate.toFixed(2)}</td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2">{item.unit}</td>
                <td className="border p-2 text-right">{item.total.toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-6">
        <div className="w-72">
          <div className="flex justify-between py-1">
            <span>Sub Total:</span>
            <span>Rs. {invoice.sub_total.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1">
              <span>Discount:</span>
              <span>- Rs. {invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span>CGST (9%):</span>
            <span>Rs. {invoice.cgst_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>SGST (9%):</span>
            <span>Rs. {invoice.sgst_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t font-bold text-lg">
            <span>Grand Total:</span>
            <span>Rs. {invoice.grand_total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mb-6 p-3 bg-gray-50 border">
        <span className="font-semibold">Amount in Words: </span>
        <span>{numberToWords(invoice.grand_total)}</span>
      </div>

      {/* Tax Summary */}
      <table className="w-full border-collapse border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Taxable Amount</th>
            <th className="border p-2">CGST Rate</th>
            <th className="border p-2">CGST Amount</th>
            <th className="border p-2">SGST Rate</th>
            <th className="border p-2">SGST Amount</th>
            <th className="border p-2">Total Tax</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td className="border p-2">{(invoice.sub_total - invoice.discount).toFixed(2)}</td>
            <td className="border p-2">9%</td>
            <td className="border p-2">{invoice.cgst_amount.toFixed(2)}</td>
            <td className="border p-2">9%</td>
            <td className="border p-2">{invoice.sgst_amount.toFixed(2)}</td>
            <td className="border p-2">{invoice.gst_amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Declaration and Signature */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h4 className="font-semibold mb-2">Declaration</h4>
          <p className="text-sm text-gray-600">
            We declare that this invoice shows the actual price of the goods described
            and that all particulars are true and correct.
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">For Sipahi Jee Metal Works</p>
          <div className="h-16"></div>
          <p className="border-t pt-2">Authorized Signatory</p>
        </div>
      </div>
    </div>
  )
}
