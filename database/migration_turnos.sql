-- ==============================================================
-- MIGRACIÓN DE SISTEMA DE TURNOS
-- ==============================================================

-- 1. Tabla de Preferencias de Turnos
CREATE TABLE IF NOT EXISTS public.turnos_config (
    id SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL UNIQUE,
    modulo_habilitado BOOLEAN DEFAULT true,
    hora_inicio_laboral TIME DEFAULT '08:00:00',
    hora_fin_laboral TIME DEFAULT '20:00:00',
    intervalo_minutos INTEGER DEFAULT 30,
    permitir_solapamiento BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.turnos_config OWNER TO app_ventas;

-- 2. Tabla Principal de Turnos
CREATE TABLE IF NOT EXISTS public.turnos (
    id SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    servicio_motivo CHARACTER VARYING(255),
    estado CHARACTER VARYING(50) DEFAULT 'reservado'::character varying NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT turnos_estado_check CHECK (((estado)::text = ANY ((ARRAY['reservado'::character varying, 'completado'::character varying, 'cancelado'::character varying, 'ausente'::character varying])::text[])))
);

ALTER TABLE public.turnos OWNER TO app_ventas;
