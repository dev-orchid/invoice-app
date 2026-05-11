-- HSN Catalog: simple HSN code -> product name + price lookup used to
-- auto-populate invoice line items when the user enters an HSN code.

CREATE TABLE IF NOT EXISTS public.hsn_catalog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hsn_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'KGS',
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hsn_catalog_hsn_code ON public.hsn_catalog(hsn_code);

ALTER TABLE public.hsn_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hsn_catalog" ON public.hsn_catalog FOR SELECT USING (true);
CREATE POLICY "Admin can insert hsn_catalog" ON public.hsn_catalog FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update hsn_catalog" ON public.hsn_catalog FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete hsn_catalog" ON public.hsn_catalog FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP TRIGGER IF EXISTS update_hsn_catalog_updated_at ON public.hsn_catalog;
CREATE TRIGGER update_hsn_catalog_updated_at BEFORE UPDATE ON public.hsn_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
