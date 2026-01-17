-- Migration: Add transport fields to invoices and additional fields to company_settings
-- Run this manually in your Supabase SQL Editor

-- Add new columns to invoices table for transport/delivery details
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS eway_bill_no VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lr_no VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vehicle_no VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS dispatched_through VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS destination VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS terms_of_delivery TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50);

-- Add new columns to company_settings table
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS pan_number VARCHAR(15);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS state_name VARCHAR(50) DEFAULT 'Bihar';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS state_code VARCHAR(5) DEFAULT '10';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(100);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS declaration TEXT;

-- Update existing company_settings row with default declaration if exists
UPDATE company_settings
SET declaration = 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.'
WHERE declaration IS NULL;
