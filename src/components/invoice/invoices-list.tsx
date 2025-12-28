'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Pencil, Printer, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { DeleteInvoiceButton } from '@/components/invoice/delete-invoice-button'

interface Invoice {
  id: string
  invoice_number: number
  invoice_date: string
  client_name: string
  grand_total: number
  paid_amount: number
  due_amount: number
  payment_status: string
  profiles: { username: string } | null
}

interface InvoicesListProps {
  invoices: Invoice[]
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `INV-${String(invoice.invoice_number).padStart(4, '0')}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || invoice.payment_status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchQuery, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'full':
        return <Badge className="bg-green-500">Paid</Badge>
      case 'advance':
        return <Badge className="bg-yellow-500">Advance</Badge>
      default:
        return <Badge variant="destructive">Unpaid</Badge>
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const hasFilters = searchQuery || statusFilter !== 'all'

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by client name or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="full">Paid</SelectItem>
            <SelectItem value="advance">Advance</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredInvoices.length} of {invoices.length} invoices
      </p>

      {filteredInvoices.length > 0 ? (
        <>
          {/* Mobile card view */}
          <div className="block md:hidden divide-y border rounded-lg">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      INV-{String(invoice.invoice_number).padStart(4, '0')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  {getStatusBadge(invoice.payment_status)}
                </div>
                <div>
                  <p className="font-medium">{invoice.client_name}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">
                    Rs. {invoice.grand_total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due:</span>
                  <span className="text-destructive font-medium">
                    Rs. {invoice.due_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                      <Pencil className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/invoice/${invoice.id}`} target="_blank">
                      <Printer className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      INV-{String(invoice.invoice_number).padStart(4, '0')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell className="text-right">
                      Rs. {invoice.grand_total.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      Rs. {invoice.paid_amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      Rs. {invoice.due_amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.payment_status)}</TableCell>
                    <TableCell>{invoice.profiles?.username || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/invoice/${invoice.id}`} target="_blank">
                            <Printer className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteInvoiceButton invoiceId={invoice.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <p className="text-muted-foreground">No invoices found matching your search.</p>
          {hasFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
