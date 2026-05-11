-- Products, brands and categories are no longer used. Inventory and pricing
-- are now managed via the hsn_catalog table. Drop the tables along with
-- their indexes, triggers, and RLS policies.

DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
