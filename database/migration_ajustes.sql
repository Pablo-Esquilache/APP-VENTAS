CREATE TABLE IF NOT EXISTS public.metodos_pago (
    id SERIAL PRIMARY KEY,
    comercio_id integer NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.descuentos_config (
    id SERIAL PRIMARY KEY,
    comercio_id integer NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
    porcentaje numeric(5,2) NOT NULL,
    activo boolean DEFAULT true
);

-- Insert defaults for existing comercios
DO $$
DECLARE
    cid INT;
BEGIN
    FOR cid IN SELECT id FROM public.comercios LOOP
        IF NOT EXISTS (SELECT 1 FROM public.metodos_pago WHERE comercio_id = cid) THEN
            INSERT INTO public.metodos_pago (comercio_id, nombre) VALUES 
            (cid, 'Efectivo'), (cid, 'Débito'), (cid, 'QR'), (cid, 'Transferencia'), (cid, 'Cuenta Corriente');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.descuentos_config WHERE comercio_id = cid) THEN
            INSERT INTO public.descuentos_config (comercio_id, porcentaje) VALUES 
            (cid, 0), (cid, 5), (cid, 10), (cid, 15), (cid, 20);
        END IF;
    END LOOP;
END $$;
