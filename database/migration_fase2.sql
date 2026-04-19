CREATE TABLE IF NOT EXISTS public.gastos_categorias (
    id SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true
);

ALTER TABLE public.gastos DROP CONSTRAINT IF EXISTS gastos_tipo_check;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comercios' AND column_name='umbral_stock') THEN 
        ALTER TABLE public.comercios ADD COLUMN umbral_stock INTEGER DEFAULT 3;
    END IF;
END $$;
