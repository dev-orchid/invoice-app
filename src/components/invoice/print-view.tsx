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
  const taxableAmount = invoice.sub_total - invoice.discount
  const financialYear = new Date(invoice.invoice_date).getFullYear()
  const invoiceNo = `SJMW/${String(invoice.invoice_number).padStart(2, '0')}/${financialYear}-${(financialYear + 1).toString().slice(-2)}`

  return (
    <div className="bg-white min-h-screen">
      <style jsx global>{`
        @media print {
          html, body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          .no-print { display: none !important; }
          .print-container {
            padding: 10mm !important;
            max-width: none !important;
            margin: 0 !important;
          }
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>

      <div className="no-print p-4 bg-gray-100">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Print Invoice
        </button>
      </div>

      <div className="print-container max-w-4xl mx-auto p-8 text-sm">
        {/* Header with GSTIN and ORIGINAL COPY */}
        <div className="flex justify-between items-start mb-2 text-xs">
          <span className="font-medium">GSTIN : 10CEKPP9425G1ZG</span>
          <span className="font-bold">ORIGINAL COPY</span>
        </div>

        {/* Tax Invoice Title */}
        <div className="text-center mb-4">
          <h1 className="text-base mb-1">Tax Invoice</h1>
          <h2 className="text-lg font-bold">Sipahi Jee Metal Works</h2>
          <p className="text-xs">NEW ATWARPUR KURTHAUL, Parsa Bazar</p>
          <p className="text-xs">Patna, Bihar, 804453</p>
        </div>

        {/* Party Details and Invoice Info */}
        <div className="border border-gray-400 mb-4">
          <div className="flex">
            {/* Left - Party Details */}
            <div className="w-1/2 p-3 border-r border-gray-400">
              <p className="font-bold text-base mb-1">Party Details:-</p>
              <p className="font-medium">{invoice.client_name.toUpperCase()}</p>
              {invoice.ship_address && <p className="uppercase">{invoice.ship_address}</p>}
              {invoice.gstin && (
                <p className="mt-2">GSTIN/UN : {invoice.gstin}</p>
              )}
            </div>

            {/* Right - Invoice Details */}
            <div className="w-1/2 p-3 space-y-1">
              <p>Invoice No. : {invoiceNo}</p>
              <p>Dated : {format(new Date(invoice.invoice_date), 'yyyy-MM-dd')}</p>
              <p>Place of Supply : Bihar (10)</p>
              <p>Reverse Charge: N</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-gray-400 mb-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="p-2 text-left font-medium border-r border-gray-400 w-[35%]">Description of Goods</th>
                <th className="p-2 text-left font-medium border-r border-gray-400 w-[15%]">HSN/SAC</th>
                <th className="p-2 text-center font-medium border-r border-gray-400 w-[12%]">Rate</th>
                <th className="p-2 text-center font-medium border-r border-gray-400 w-[12%]">Quantity</th>
                <th className="p-2 text-center font-medium border-r border-gray-400 w-[8%]">Per</th>
                <th className="p-2 text-right font-medium w-[18%]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-2 border-r border-gray-400">
                      {index + 1} .{item.product_name}
                    </td>
                    <td className="p-2 border-r border-gray-400">{item.hsn_code || ''}</td>
                    <td className="p-2 text-center border-r border-gray-400">{item.rate.toFixed(2)}</td>
                    <td className="p-2 text-center border-r border-gray-400">{item.quantity.toFixed(2)}</td>
                    <td className="p-2 text-center border-r border-gray-400">{item.unit}</td>
                    <td className="p-2 text-right">{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}

              {/* Empty rows for spacing */}
              <tr>
                <td className="p-2 border-r border-gray-400">&nbsp;</td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 text-right border-t border-gray-400">{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              {/* CGST Row */}
              <tr>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400 font-medium">CGST</td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 text-right">{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              {/* SGST Row */}
              <tr>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400 font-medium">SGST</td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 text-right">{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              {/* Empty rows for visual spacing */}
              {[...Array(5)].map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="p-2 border-r border-gray-400">&nbsp;</td>
                  <td className="p-2 border-r border-gray-400"></td>
                  <td className="p-2 border-r border-gray-400"></td>
                  <td className="p-2 border-r border-gray-400"></td>
                  <td className="p-2 border-r border-gray-400"></td>
                  <td className="p-2"></td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="border-t border-gray-400">
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400 font-medium">Total:</td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 text-right font-bold">{invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount Chargeable in Words */}
          <div className="border-t border-gray-400 p-2">
            <p className="text-xs">Amount Chargable (in words)</p>
            <p className="font-bold">{numberToWords(invoice.grand_total)}</p>
          </div>
        </div>

        {/* Tax Breakdown Table */}
        <div className="border border-gray-400 mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="p-2 text-left font-medium border-r border-gray-400" rowSpan={2}>Taxable Amount</th>
                <th className="p-2 text-center font-medium border-r border-gray-400" colSpan={2}>CGST</th>
                <th className="p-2 text-center font-medium border-r border-gray-400" colSpan={2}>SGST/UTGST</th>
                <th className="p-2 text-center font-medium" rowSpan={2}>Total</th>
              </tr>
              <tr className="border-b border-gray-400">
                <th className="p-2 text-center font-medium border-r border-gray-400">Rate</th>
                <th className="p-2 text-center font-medium border-r border-gray-400">Amount</th>
                <th className="p-2 text-center font-medium border-r border-gray-400">Rate</th>
                <th className="p-2 text-center font-medium border-r border-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-400">
                <td className="p-2 text-right border-r border-gray-400">{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-center border-r border-gray-400">9%</td>
                <td className="p-2 text-right border-r border-gray-400">{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-center border-r border-gray-400">9%</td>
                <td className="p-2 text-right border-r border-gray-400">{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-right font-medium">{invoice.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="p-2 text-right border-r border-gray-400 font-medium">Total: {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 text-right border-r border-gray-400 font-medium">{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-2 border-r border-gray-400"></td>
                <td className="p-2 text-right border-r border-gray-400 font-medium">{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-2 text-right font-medium">{invoice.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Amount in Words */}
        <p className="text-xs mb-4">
          <span>Tax Amount (in words) </span>
          <span className="font-bold">{numberToWords(invoice.gst_amount)}</span>
        </p>

        {/* Declaration and Signature */}
        <div className="border border-gray-400">
          <div className="flex">
            <div className="w-2/3 p-3 border-r border-gray-400">
              <p className="underline font-medium mb-1">Declaration</p>
              <p className="text-xs">
                We declare that this invoice shows the actual price of the goods described and that all
                the particulars are true correct.
              </p>
            </div>
            <div className="w-1/3 p-3 text-right">
              <p className="font-medium mb-8">For Sipahi Jee Metal Works</p>
              <p className="text-xs">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
