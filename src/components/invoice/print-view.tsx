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

  let result = 'Indian Rupees ' + convert(rupees)
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
  eway_bill_no: string | null
  lr_no: string | null
  vehicle_no: string | null
  dispatched_through: string | null
  destination: string | null
  terms_of_delivery: string | null
  payment_terms: string | null
  invoice_items: InvoiceItem[]
}

interface CompanySettings {
  company_name: string
  gstin: string
  address: string
  phone: string | null
  email: string | null
  bank_name: string | null
  account_number: string | null
  ifsc_code: string | null
  pan_number: string | null
  state_name: string | null
  state_code: string | null
  account_holder_name: string | null
  branch_name: string | null
  declaration: string | null
}

interface PrintViewProps {
  invoice: Invoice
  companySettings: CompanySettings
}

interface HSNSummary {
  hsn_code: string
  taxable_value: number
  cgst_rate: number
  cgst_amount: number
  sgst_rate: number
  sgst_amount: number
  total_tax: number
}

export function PrintView({ invoice, companySettings }: PrintViewProps) {
  const taxableAmount = invoice.sub_total - invoice.discount
  const financialYear = new Date(invoice.invoice_date).getFullYear()
  const month = new Date(invoice.invoice_date).getMonth()
  // Financial year starts in April
  const fyStart = month >= 3 ? financialYear : financialYear - 1
  const fyEnd = fyStart + 1
  // Format: SJMW/81/25-26 (invoice_number/short_year_start-short_year_end)
  const invoiceNo = `SJMW/${invoice.invoice_number}/${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`

  // Calculate round off
  const exactTotal = taxableAmount + invoice.gst_amount
  const roundedTotal = Math.round(exactTotal)
  const roundOff = roundedTotal - exactTotal

  // Group items by HSN code for HSN summary
  const hsnSummaryMap = new Map<string, HSNSummary>()
  invoice.invoice_items.forEach(item => {
    const hsn = item.hsn_code || 'N/A'
    const existing = hsnSummaryMap.get(hsn)
    const itemTaxable = item.total
    const cgstRate = 9
    const sgstRate = 9
    const cgstAmount = itemTaxable * 0.09
    const sgstAmount = itemTaxable * 0.09

    if (existing) {
      existing.taxable_value += itemTaxable
      existing.cgst_amount += cgstAmount
      existing.sgst_amount += sgstAmount
      existing.total_tax += cgstAmount + sgstAmount
    } else {
      hsnSummaryMap.set(hsn, {
        hsn_code: hsn,
        taxable_value: itemTaxable,
        cgst_rate: cgstRate,
        cgst_amount: cgstAmount,
        sgst_rate: sgstRate,
        sgst_amount: sgstAmount,
        total_tax: cgstAmount + sgstAmount,
      })
    }
  })
  const hsnSummary = Array.from(hsnSummaryMap.values())

  const stateName = companySettings.state_name || 'Bihar'
  const stateCode = companySettings.state_code || '10'

  return (
    <div className="bg-white min-h-screen overflow-auto">
      <style jsx global>{`
        html, body {
          overflow: auto !important;
          height: auto !important;
        }
        @media print {
          html, body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            overflow: visible !important;
            height: auto !important;
          }
          .no-print { display: none !important; }
          .invoice-page {
            page-break-after: auto;
            page-break-inside: auto;
          }
          .eway-page {
            page-break-before: always;
          }
        }
        @page {
          size: A4;
          margin: 10mm;
        }
      `}</style>

      <div className="no-print p-4 bg-gray-100 sticky top-0 z-10">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Print Invoice
        </button>
      </div>

      <div className="invoice-page max-w-4xl mx-auto px-6 py-4 text-[11px] leading-tight font-sans">
        {/* Main Invoice Container */}
        <div className="border border-gray-400">
          {/* Company Header */}
          <div className="text-center py-2 px-3 border-b border-gray-400">
            <h1 className="text-xl font-bold">{companySettings.company_name}</h1>
            <p className="text-[10px] mt-0.5">{companySettings.address}</p>
            {companySettings.phone && <p className="text-[10px]">Contact: {companySettings.phone}</p>}
            <p className="text-[10px]">
              <strong>GSTIN:</strong> {companySettings.gstin} &nbsp;&nbsp;&nbsp; <strong>State:</strong> {stateName} ({stateCode})
            </p>
          </div>

          {/* Tax Invoice Title */}
          <div className="text-center py-1 border-b border-gray-400">
            <h2 className="text-sm font-bold">TAX INVOICE</h2>
          </div>

          {/* Two Column Layout - Consignee/Buyer and Invoice Details */}
          <div className="flex border-b border-gray-400">
            {/* Left Column - Consignee and Buyer */}
            <div className="w-1/2 border-r border-gray-400 text-[10px]">
              {/* Consignee */}
              <div className="p-2 border-b border-gray-400">
                <p className="font-bold">Consignee (Ship to)</p>
                <p className="font-semibold">{invoice.client_name}</p>
                {invoice.ship_address && <p>{invoice.ship_address}</p>}
                {invoice.gstin && <p><strong>GSTIN/UIN:</strong> {invoice.gstin}</p>}
                <p><strong>State Name:</strong> {stateName}, <strong>Code:</strong> {stateCode}</p>
                {invoice.client_contact && <p><strong>Contact:</strong> {invoice.client_contact}</p>}
              </div>
              {/* Buyer */}
              <div className="p-2">
                <p className="font-bold">Buyer (Bill to)</p>
                <p className="font-semibold">{invoice.client_name}</p>
                {invoice.ship_address && <p>{invoice.ship_address}</p>}
                {invoice.gstin && <p><strong>GSTIN/UIN:</strong> {invoice.gstin}</p>}
                <p><strong>State Name:</strong> {stateName}, <strong>Code:</strong> {stateCode}</p>
                {invoice.client_contact && <p><strong>Contact:</strong> {invoice.client_contact}</p>}
              </div>
            </div>

            {/* Right Column - Invoice Details */}
            <div className="w-1/2 text-[10px]">
              <table className="w-full h-full">
                <tbody>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 font-semibold w-1/2">Invoice No.</td>
                    <td className="p-1.5">{invoiceNo}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 font-semibold">Dated</td>
                    <td className="p-1.5">{format(new Date(invoice.invoice_date), 'dd-MMM-yyyy')}</td>
                  </tr>
                  {invoice.eway_bill_no && (
                    <tr className="border-b border-gray-400">
                      <td className="p-1.5 border-r border-gray-400 font-semibold">e-Way Bill No.</td>
                      <td className="p-1.5">{invoice.eway_bill_no}</td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 font-semibold">Mode/Terms of Payment</td>
                    <td className="p-1.5">{invoice.payment_terms || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 font-semibold">Dispatched through</td>
                    <td className="p-1.5">{invoice.dispatched_through || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 font-semibold">Destination</td>
                    <td className="p-1.5">{invoice.destination || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 font-semibold">LR No.</td>
                    <td className="p-1.5">{invoice.lr_no || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 font-semibold">Vehicle No.</td>
                    <td className="p-1.5">{invoice.vehicle_no || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border-r border-gray-400 font-semibold">Terms of Delivery</td>
                    <td className="p-1.5">{invoice.terms_of_delivery || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Products Table */}
          <table className="w-full border-b border-gray-400 text-[10px]">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-50">
                <th className="p-1.5 text-center border-r border-gray-400 w-[6%] font-semibold">Sl</th>
                <th className="p-1.5 text-left border-r border-gray-400 font-semibold">Description of Goods</th>
                <th className="p-1.5 text-center border-r border-gray-400 w-[12%] font-semibold">HSN/SAC</th>
                <th className="p-1.5 text-right border-r border-gray-400 w-[10%] font-semibold">Qty</th>
                <th className="p-1.5 text-right border-r border-gray-400 w-[10%] font-semibold">Rate</th>
                <th className="p-1.5 text-center border-r border-gray-400 w-[6%] font-semibold">per</th>
                <th className="p-1.5 text-right w-[14%] font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-400">
                    <td className="p-1.5 text-center border-r border-gray-400">{index + 1}</td>
                    <td className="p-1.5 border-r border-gray-400">{item.product_name}</td>
                    <td className="p-1.5 text-center border-r border-gray-400">{item.hsn_code || ''}</td>
                    <td className="p-1.5 text-right border-r border-gray-400">{item.quantity.toFixed(2)}</td>
                    <td className="p-1.5 text-right border-r border-gray-400">{item.rate.toFixed(2)}</td>
                    <td className="p-1.5 text-center border-r border-gray-400">{item.unit}</td>
                    <td className="p-1.5 text-right">{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}

              {/* Sub Total */}
              <tr className="border-b border-gray-400">
                <td className="p-1.5 border-r border-gray-400"></td>
                <td className="p-1.5 border-r border-gray-400 text-right font-semibold" colSpan={5}>Sub Total</td>
                <td className="p-1.5 text-right">{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              {/* CGST */}
              <tr className="border-b border-gray-400">
                <td className="p-1.5 border-r border-gray-400"></td>
                <td className="p-1.5 border-r border-gray-400 text-right" colSpan={5}>CGST @ 9%</td>
                <td className="p-1.5 text-right">{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              {/* SGST */}
              <tr className="border-b border-gray-400">
                <td className="p-1.5 border-r border-gray-400"></td>
                <td className="p-1.5 border-r border-gray-400 text-right" colSpan={5}>SGST @ 9%</td>
                <td className="p-1.5 text-right">{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>

              {/* Round Off */}
              {roundOff !== 0 && (
                <tr className="border-b border-gray-400">
                  <td className="p-1.5 border-r border-gray-400"></td>
                  <td className="p-1.5 border-r border-gray-400 text-right" colSpan={5}>Round Off</td>
                  <td className="p-1.5 text-right">{roundOff >= 0 ? '+' : ''}{roundOff.toFixed(2)}</td>
                </tr>
              )}

              {/* Total */}
              <tr className="border-b border-gray-400">
                <td className="p-1.5 border-r border-gray-400"></td>
                <td className="p-1.5 border-r border-gray-400 text-right font-bold" colSpan={5}>Total</td>
                <td className="p-1.5 text-right font-bold">&#x20B9; {roundedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in Words */}
          <div className="p-2 border-b border-gray-400 text-[10px]">
            <p><strong>Amount Chargeable (in words):</strong></p>
            <p className="font-bold">{numberToWords(roundedTotal)}</p>
          </div>

          {/* HSN Summary Table */}
          <table className="w-full border-b border-gray-400 text-[9px]">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="p-1 text-left border-r border-gray-400 font-semibold" rowSpan={2}>HSN/SAC</th>
                <th className="p-1 text-right border-r border-gray-400 font-semibold" rowSpan={2}>Taxable Value</th>
                <th className="p-1 text-center border-r border-gray-400 font-semibold" colSpan={2}>CGST</th>
                <th className="p-1 text-center border-r border-gray-400 font-semibold" colSpan={2}>SGST</th>
                <th className="p-1 text-right font-semibold" rowSpan={2}>Total Tax Amount</th>
              </tr>
              <tr className="border-b border-gray-400">
                <th className="p-1 text-center border-r border-gray-400 font-semibold">Rate</th>
                <th className="p-1 text-right border-r border-gray-400 font-semibold">Amount</th>
                <th className="p-1 text-center border-r border-gray-400 font-semibold">Rate</th>
                <th className="p-1 text-right border-r border-gray-400 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {hsnSummary.map((hsn, index) => (
                <tr key={index} className="border-b border-gray-400">
                  <td className="p-1 border-r border-gray-400">{hsn.hsn_code}</td>
                  <td className="p-1 text-right border-r border-gray-400">{hsn.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-1 text-center border-r border-gray-400">{hsn.cgst_rate}%</td>
                  <td className="p-1 text-right border-r border-gray-400">{hsn.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-1 text-center border-r border-gray-400">{hsn.sgst_rate}%</td>
                  <td className="p-1 text-right border-r border-gray-400">{hsn.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-1 text-right">{hsn.total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr>
                <td className="p-1 border-r border-gray-400 font-bold">Total</td>
                <td className="p-1 text-right border-r border-gray-400 font-bold">{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-1 border-r border-gray-400"></td>
                <td className="p-1 text-right border-r border-gray-400 font-bold">{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-1 border-r border-gray-400"></td>
                <td className="p-1 text-right border-r border-gray-400 font-bold">{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-1 text-right font-bold">{invoice.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Tax Amount in Words */}
          <div className="p-1.5 border-b border-gray-400 text-[9px]">
            <p><strong>Tax Amount (in words):</strong> {numberToWords(invoice.gst_amount)}</p>
          </div>

          {/* Footer - Three Columns */}
          <div className="flex text-[9px]">
            {/* Remarks */}
            <div className="w-1/3 p-2 border-r border-gray-400">
              <p className="font-bold">Remarks:</p>
              <p>Invoice No: {invoiceNo}</p>
            </div>

            {/* Declaration */}
            <div className="w-1/3 p-2 border-r border-gray-400">
              <p className="font-bold underline">Declaration</p>
              <p className="text-[8px]">
                {companySettings.declaration || 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.'}
              </p>
            </div>

            {/* Bank Details and Signature */}
            <div className="w-1/3 p-2">
              <p className="font-bold">Company&apos;s Bank Details</p>
              {companySettings.account_holder_name && (
                <p className="text-[8px]"><strong>A/c Holder:</strong> {companySettings.account_holder_name}</p>
              )}
              {companySettings.bank_name && (
                <p className="text-[8px]"><strong>Bank:</strong> {companySettings.bank_name}</p>
              )}
              {companySettings.account_number && (
                <p className="text-[8px]"><strong>A/c No.:</strong> {companySettings.account_number}</p>
              )}
              {(companySettings.branch_name || companySettings.ifsc_code) && (
                <p className="text-[8px]"><strong>Branch & IFSC:</strong> {companySettings.branch_name}{companySettings.branch_name && companySettings.ifsc_code ? ' & ' : ''}{companySettings.ifsc_code}</p>
              )}

              <div className="mt-4 text-right">
                <p className="font-bold text-[8px]">For {companySettings.company_name}</p>
                <div className="h-8"></div>
                <p>Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text outside box */}
        <div className="text-center mt-2 text-[8px] text-gray-500">
          <p>SUBJECT TO {stateName.toUpperCase()} JURISDICTION</p>
          <p>This is a Computer Generated Invoice</p>
        </div>

      </div>

      {/* e-Way Bill Page - Only shown when e-Way Bill number exists */}
      {invoice.eway_bill_no && (
        <div className="eway-page max-w-4xl mx-auto px-6 py-4 text-[11px] leading-tight font-sans">
          {/* e-Way Bill Header */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-xl font-bold">e-Way Bill</h1>
            <span className="text-sm font-semibold">e-Way Bill</span>
          </div>

          {/* Document Info */}
          <div className="mb-4 text-sm">
            <p><strong>Doc No.:</strong> Tax Invoice - {invoiceNo}</p>
            <p><strong>Date:</strong> {format(new Date(invoice.invoice_date), 'dd-MMM-yyyy')}</p>
          </div>

          <hr className="border-gray-400 my-4" />

          {/* 1. e-Way Bill Details */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">1. e-Way Bill Details</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>e-Way Bill No.:</strong> {invoice.eway_bill_no}</p>
                <p><strong>Mode:</strong> {invoice.dispatched_through ? `1 - ${invoice.dispatched_through}` : '-'}</p>
              </div>
              <div>
                <p><strong>Generated Date:</strong> {format(new Date(invoice.invoice_date), 'dd-MMM-yyyy')}</p>
              </div>
              <div>
                <p><strong>Valid Upto:</strong> -</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-400 my-4" />

          {/* 2. Address Details */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">2. Address Details</h2>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-semibold mb-2">From</p>
                <p>{companySettings.company_name}</p>
                <p>GSTIN: {companySettings.gstin}</p>
                <p>{stateName}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">To</p>
                <p>{invoice.client_name}</p>
                {invoice.gstin && <p>GSTIN: {invoice.gstin}</p>}
                <p>{stateName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm mt-4">
              <div>
                <p className="font-semibold mb-2">Dispatch From</p>
                <p>{companySettings.address}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Ship To</p>
                <p>{invoice.ship_address || companySettings.address}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-400 my-4" />

          {/* 3. Goods Details */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">3. Goods Details</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="text-left p-2">HSN Code</th>
                  <th className="text-left p-2">Product Name & Desc</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Taxable Amt</th>
                  <th className="text-right p-2">Tax Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_items
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">{item.hsn_code || '-'}</td>
                      <td className="p-2">{item.product_name}</td>
                      <td className="p-2 text-right">{item.quantity} {item.unit}</td>
                      <td className="p-2 text-right">{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-right">18</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <hr className="border-gray-400 my-4" />

          {/* Summary */}
          <div className="flex justify-between text-sm mb-6">
            <div>
              <p><strong>Tot. Taxable Amt:</strong> {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p><strong>CGST Amt:</strong> {invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p><strong>SGST Amt:</strong> {invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p><strong>Other Amt:</strong> {roundOff !== 0 ? roundOff.toFixed(2) : '0.00'}</p>
            </div>
            <div className="text-right">
              <p><strong>Total Inv Amt:</strong> {roundedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <hr className="border-gray-400 my-4" />

          {/* 4. Transportation Details */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">4. Transportation Details</h2>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p><strong>Transporter Name:</strong> {invoice.dispatched_through || '-'}</p>
              </div>
              <div>
                <p><strong>Doc No.:</strong> {invoice.lr_no || '-'}</p>
                <p><strong>Date:</strong> {format(new Date(invoice.invoice_date), 'dd-MMM-yyyy')}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-400 my-4" />

          {/* 5. Vehicle Details */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">5. Vehicle Details</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Vehicle No.:</strong> {invoice.vehicle_no || '-'}</p>
              </div>
              <div>
                <p><strong>From:</strong> {invoice.destination || '-'}</p>
              </div>
              <div>
                <p><strong>CEWB No.:</strong> -</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
