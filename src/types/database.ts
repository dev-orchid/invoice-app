export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          role: 'admin' | 'user'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'admin' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hsn_catalog: {
        Row: {
          id: string
          hsn_code: string
          product_name: string
          rate: number
          unit: string
          is_active: boolean
          is_deleted: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hsn_code: string
          product_name: string
          rate: number
          unit?: string
          is_active?: boolean
          is_deleted?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hsn_code?: string
          product_name?: string
          rate?: number
          unit?: string
          is_active?: boolean
          is_deleted?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
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
          paid_amount: number
          due_amount: number
          payment_type: 'cash' | 'cheque' | 'credit_card' | 'phone_pe' | 'google_pay' | 'amazon_pay'
          payment_status: 'full' | 'advance' | 'unpaid'
          payment_place: 'india' | 'outside_india'
          eway_bill_no: string | null
          lr_no: string | null
          vehicle_no: string | null
          dispatched_through: string | null
          destination: string | null
          terms_of_delivery: string | null
          payment_terms: string | null
          created_by: string | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number?: number
          gstin?: string | null
          invoice_date: string
          client_name: string
          client_contact?: string | null
          ship_address?: string | null
          sub_total: number
          discount?: number
          gst_amount?: number
          cgst_amount?: number
          sgst_amount?: number
          grand_total?: number
          paid_amount?: number
          due_amount?: number
          payment_type?: 'cash' | 'cheque' | 'credit_card' | 'phone_pe' | 'google_pay' | 'amazon_pay'
          payment_status?: 'full' | 'advance' | 'unpaid'
          payment_place?: 'india' | 'outside_india'
          eway_bill_no?: string | null
          lr_no?: string | null
          vehicle_no?: string | null
          dispatched_through?: string | null
          destination?: string | null
          terms_of_delivery?: string | null
          payment_terms?: string | null
          created_by?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: number
          gstin?: string | null
          invoice_date?: string
          client_name?: string
          client_contact?: string | null
          ship_address?: string | null
          sub_total?: number
          discount?: number
          gst_amount?: number
          cgst_amount?: number
          sgst_amount?: number
          grand_total?: number
          paid_amount?: number
          due_amount?: number
          payment_type?: 'cash' | 'cheque' | 'credit_card' | 'phone_pe' | 'google_pay' | 'amazon_pay'
          payment_status?: 'full' | 'advance' | 'unpaid'
          payment_place?: 'india' | 'outside_india'
          eway_bill_no?: string | null
          lr_no?: string | null
          vehicle_no?: string | null
          dispatched_through?: string | null
          destination?: string | null
          terms_of_delivery?: string | null
          payment_terms?: string | null
          created_by?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_name: string
          description: string | null
          hsn_code: string | null
          rate: number
          quantity: number
          unit: string
          total: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_name: string
          description?: string | null
          hsn_code?: string | null
          rate: number
          quantity: number
          unit?: string
          total: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_name?: string
          description?: string | null
          hsn_code?: string | null
          rate?: number
          quantity?: number
          unit?: string
          total?: number
          sort_order?: number
          created_at?: string
        }
      }
      company_settings: {
        Row: {
          id: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          gstin: string
          address: string
          phone?: string | null
          email?: string | null
          bank_name?: string | null
          account_number?: string | null
          ifsc_code?: string | null
          pan_number?: string | null
          state_name?: string | null
          state_code?: string | null
          account_holder_name?: string | null
          branch_name?: string | null
          declaration?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          gstin?: string
          address?: string
          phone?: string | null
          email?: string | null
          bank_name?: string | null
          account_number?: string | null
          ifsc_code?: string | null
          pan_number?: string | null
          state_name?: string | null
          state_code?: string | null
          account_holder_name?: string | null
          branch_name?: string | null
          declaration?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
