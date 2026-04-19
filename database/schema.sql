-- ==============================================================
-- CONFIGURACION DE BASE DE DATOS Y USUARIO (Acorde al .env actual)
-- ==============================================================

-- 1. Crear el usuario (PGUSER=app_ventas y PGPASSWORD=123456)
CREATE USER app_ventas WITH PASSWORD '123456';

-- 2. Asignar los permisos máximos a ese usuario sobre la base de datos (PGDATABASE=postgres)
ALTER DATABASE postgres OWNER TO app_ventas;
GRANT ALL PRIVILEGES ON DATABASE postgres TO app_ventas;

-- ==============================================================
-- INICIO DEL VOLCADO (DUMP) ORIGINAL DE TABLAS
-- ==============================================================

--
-- PostgreSQL database dump
--
\restrict M3XkGqA3tgMUHCRZzFjhhWJGFTEgcKui9eARvHfwzMuduj7jBr2vVvV5RjKEZYk

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cajas; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.cajas (
    id integer NOT NULL,
    comercio_id integer NOT NULL,
    fecha date NOT NULL,
    saldo_inicial numeric(12,2) DEFAULT 0 NOT NULL,
    estado character varying(20) DEFAULT 'abierta'::character varying NOT NULL,
    hora_apertura timestamp without time zone DEFAULT now() NOT NULL,
    hora_cierre timestamp without time zone,
    total_ventas numeric(12,2) DEFAULT 0,
    total_gastos numeric(12,2) DEFAULT 0,
    total_devoluciones numeric(12,2) DEFAULT 0,
    total_resultado numeric(12,2) DEFAULT 0,
    total_cuenta_corriente numeric(12,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cajas OWNER TO app_ventas;

--
-- Name: cajas_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.cajas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cajas_id_seq OWNER TO app_ventas;

--
-- Name: cajas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.cajas_id_seq OWNED BY public.cajas.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    fecha_nacimiento date,
    genero character varying(20),
    telefono character varying(50),
    email character varying(150),
    localidad character varying(150),
    comentarios text,
    comercio_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clientes OWNER TO app_ventas;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO app_ventas;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: comercios; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.comercios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    umbral_stock integer DEFAULT 3
);


ALTER TABLE public.comercios OWNER TO app_ventas;

--
-- Name: comercios_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.comercios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comercios_id_seq OWNER TO app_ventas;

--
-- Name: comercios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.comercios_id_seq OWNED BY public.comercios.id;


--
-- Name: cuenta_corriente_movimientos; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.cuenta_corriente_movimientos (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    comercio_id integer NOT NULL,
    tipo character varying(20) NOT NULL,
    monto numeric(12,2) NOT NULL,
    venta_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cuenta_corriente_movimientos_monto_check CHECK ((monto > (0)::numeric)),
    CONSTRAINT cuenta_corriente_movimientos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['venta'::character varying, 'pago'::character varying])::text[])))
);


ALTER TABLE public.cuenta_corriente_movimientos OWNER TO app_ventas;

--
-- Name: cuenta_corriente_movimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.cuenta_corriente_movimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuenta_corriente_movimientos_id_seq OWNER TO app_ventas;

--
-- Name: cuenta_corriente_movimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.cuenta_corriente_movimientos_id_seq OWNED BY public.cuenta_corriente_movimientos.id;


--
-- Name: devoluciones; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.devoluciones (
    id integer NOT NULL,
    venta_id integer,
    cliente_id integer NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total numeric(12,2) NOT NULL,
    comercio_id integer NOT NULL
);


ALTER TABLE public.devoluciones OWNER TO app_ventas;

--
-- Name: devoluciones_detalle; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.devoluciones_detalle (
    id integer NOT NULL,
    devolucion_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL
);


ALTER TABLE public.devoluciones_detalle OWNER TO app_ventas;

--
-- Name: devoluciones_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.devoluciones_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devoluciones_detalle_id_seq OWNER TO app_ventas;

--
-- Name: devoluciones_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.devoluciones_detalle_id_seq OWNED BY public.devoluciones_detalle.id;


--
-- Name: devoluciones_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.devoluciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devoluciones_id_seq OWNER TO app_ventas;

--
-- Name: devoluciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.devoluciones_id_seq OWNED BY public.devoluciones.id;


--
-- Name: gastos; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.gastos (
    id integer NOT NULL,
    descripcion character varying(200) NOT NULL,
    tipo character varying(50),
    fecha timestamp without time zone NOT NULL,
    importe numeric(14,2) NOT NULL,
    comercio_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT gastos_importe_check CHECK ((importe >= (0)::numeric))
);


ALTER TABLE public.gastos OWNER TO app_ventas;

--
-- Name: gastos_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.gastos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gastos_id_seq OWNER TO app_ventas;

--
-- Name: gastos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.gastos_id_seq OWNED BY public.gastos.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    categoria character varying(100),
    precio numeric(12,2) NOT NULL,
    stock integer DEFAULT 0,
    comercio_id integer NOT NULL,
    codigo_barras character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT productos_precio_check CHECK ((precio >= (0)::numeric)),
    CONSTRAINT productos_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.productos OWNER TO app_ventas;

--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO app_ventas;

--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    usuario character varying(50) NOT NULL,
    password text NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    comercio_id integer,
    active_session text,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.usuarios OWNER TO app_ventas;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO app_ventas;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.ventas (
    id integer NOT NULL,
    fecha timestamp without time zone,
    cliente_id integer,
    metodo_pago character varying(50),
    total numeric(14,2) NOT NULL,
    comercio_id integer NOT NULL,
    total_bruto numeric(12,2) DEFAULT 0 NOT NULL,
    descuento_monto numeric(12,2) DEFAULT 0 NOT NULL,
    descuento_porcentaje numeric(5,2) DEFAULT 0 NOT NULL,
    CONSTRAINT ventas_total_check CHECK ((total >= (0)::numeric))
);


ALTER TABLE public.ventas OWNER TO app_ventas;

--
-- Name: ventas_detalle; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.ventas_detalle (
    id integer NOT NULL,
    venta_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    CONSTRAINT ventas_detalle_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.ventas_detalle OWNER TO app_ventas;

--
-- Name: ventas_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.ventas_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ventas_detalle_id_seq OWNER TO app_ventas;

--
-- Name: ventas_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.ventas_detalle_id_seq OWNED BY public.ventas_detalle.id;


--
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ventas_id_seq OWNER TO app_ventas;

--
-- Name: ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.ventas_id_seq OWNED BY public.ventas.id;


--
-- Name: configuracion_sync; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.configuracion_sync (
    id integer NOT NULL,
    comercio_id integer NOT NULL,
    api_token text,
    sync_enabled boolean DEFAULT false,
    api_url character varying(255) DEFAULT 'http://127.0.0.1:3000/api/sync'::character varying
);

ALTER TABLE public.configuracion_sync OWNER TO app_ventas;

--
-- Name: metodos_pago; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.metodos_pago (
    id integer NOT NULL,
    comercio_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);

ALTER TABLE public.metodos_pago OWNER TO app_ventas;

--
-- Name: metodos_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.metodos_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.metodos_pago_id_seq OWNER TO app_ventas;
ALTER SEQUENCE public.metodos_pago_id_seq OWNED BY public.metodos_pago.id;
ALTER TABLE ONLY public.metodos_pago ALTER COLUMN id SET DEFAULT nextval('public.metodos_pago_id_seq'::regclass);

--
-- Name: descuentos_config; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.descuentos_config (
    id integer NOT NULL,
    comercio_id integer NOT NULL,
    porcentaje numeric(5,2) NOT NULL,
    activo boolean DEFAULT true
);

ALTER TABLE public.descuentos_config OWNER TO app_ventas;

--
-- Name: gastos_categorias; Type: TABLE; Schema: public; Owner: app_ventas
--

CREATE TABLE public.gastos_categorias (
    id integer NOT NULL,
    comercio_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);

ALTER TABLE public.gastos_categorias OWNER TO app_ventas;

--
-- Name: gastos_categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.gastos_categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.gastos_categorias_id_seq OWNER TO app_ventas;
ALTER SEQUENCE public.gastos_categorias_id_seq OWNED BY public.gastos_categorias.id;
ALTER TABLE ONLY public.gastos_categorias ALTER COLUMN id SET DEFAULT nextval('public.gastos_categorias_id_seq'::regclass);

--
-- Name: descuentos_config_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.descuentos_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.descuentos_config_id_seq OWNER TO app_ventas;
ALTER SEQUENCE public.descuentos_config_id_seq OWNED BY public.descuentos_config.id;
ALTER TABLE ONLY public.descuentos_config ALTER COLUMN id SET DEFAULT nextval('public.descuentos_config_id_seq'::regclass);



--
-- Name: configuracion_sync_id_seq; Type: SEQUENCE; Schema: public; Owner: app_ventas
--

CREATE SEQUENCE public.configuracion_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracion_sync_id_seq OWNER TO app_ventas;

--
-- Name: configuracion_sync_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_ventas
--

ALTER SEQUENCE public.configuracion_sync_id_seq OWNED BY public.configuracion_sync.id;


--
-- Name: cajas id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.cajas ALTER COLUMN id SET DEFAULT nextval('public.cajas_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: comercios id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.comercios ALTER COLUMN id SET DEFAULT nextval('public.comercios_id_seq'::regclass);


--
-- Name: cuenta_corriente_movimientos id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.cuenta_corriente_movimientos ALTER COLUMN id SET DEFAULT nextval('public.cuenta_corriente_movimientos_id_seq'::regclass);


--
-- Name: devoluciones id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones ALTER COLUMN id SET DEFAULT nextval('public.devoluciones_id_seq'::regclass);


--
-- Name: devoluciones_detalle id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones_detalle ALTER COLUMN id SET DEFAULT nextval('public.devoluciones_detalle_id_seq'::regclass);


--
-- Name: gastos id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.gastos ALTER COLUMN id SET DEFAULT nextval('public.gastos_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: ventas id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.ventas ALTER COLUMN id SET DEFAULT nextval('public.ventas_id_seq'::regclass);


--
-- Name: ventas_detalle id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.ventas_detalle ALTER COLUMN id SET DEFAULT nextval('public.ventas_detalle_id_seq'::regclass);


--
-- Name: configuracion_sync id; Type: DEFAULT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.configuracion_sync ALTER COLUMN id SET DEFAULT nextval('public.configuracion_sync_id_seq'::regclass);


--
-- Name: cajas cajas_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT cajas_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: comercios comercios_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.comercios
    ADD CONSTRAINT comercios_pkey PRIMARY KEY (id);


--
-- Name: cuenta_corriente_movimientos cuenta_corriente_movimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.cuenta_corriente_movimientos
    ADD CONSTRAINT cuenta_corriente_movimientos_pkey PRIMARY KEY (id);


--
-- Name: devoluciones_detalle devoluciones_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones_detalle
    ADD CONSTRAINT devoluciones_detalle_pkey PRIMARY KEY (id);


--
-- Name: devoluciones devoluciones_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones
    ADD CONSTRAINT devoluciones_pkey PRIMARY KEY (id);


--
-- Name: gastos gastos_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.gastos
    ADD CONSTRAINT gastos_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: metodos_pago metodos_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.metodos_pago
    ADD CONSTRAINT metodos_pago_pkey PRIMARY KEY (id);


--
-- Name: descuentos_config descuentos_config_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.descuentos_config
    ADD CONSTRAINT descuentos_config_pkey PRIMARY KEY (id);


--
-- Name: gastos_categorias gastos_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.gastos_categorias
    ADD CONSTRAINT gastos_categorias_pkey PRIMARY KEY (id);



--
-- Name: cajas unica_caja_por_dia; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT unica_caja_por_dia UNIQUE (comercio_id, fecha);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_usuario_key; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_usuario_key UNIQUE (usuario);


--
-- Name: ventas_detalle ventas_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.ventas_detalle
    ADD CONSTRAINT ventas_detalle_pkey PRIMARY KEY (id);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- Name: configuracion_sync configuracion_sync_pkey; Type: CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.configuracion_sync
    ADD CONSTRAINT configuracion_sync_pkey PRIMARY KEY (id);


--
-- Name: idx_cc_cliente; Type: INDEX; Schema: public; Owner: app_ventas
--

CREATE INDEX idx_cc_cliente ON public.cuenta_corriente_movimientos USING btree (cliente_id);


--
-- Name: devoluciones devoluciones_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones
    ADD CONSTRAINT devoluciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: devoluciones_detalle devoluciones_detalle_devolucion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones_detalle
    ADD CONSTRAINT devoluciones_detalle_devolucion_id_fkey FOREIGN KEY (devolucion_id) REFERENCES public.devoluciones(id) ON DELETE CASCADE;


--
-- Name: devoluciones_detalle devoluciones_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones_detalle
    ADD CONSTRAINT devoluciones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: devoluciones devoluciones_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.devoluciones
    ALTER COLUMN venta_id DROP NOT NULL;

ALTER TABLE ONLY public.devoluciones
    ADD CONSTRAINT devoluciones_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON DELETE SET NULL;


--
-- Name: cuenta_corriente_movimientos fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.cuenta_corriente_movimientos
    ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: cuenta_corriente_movimientos fk_comercio; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.cuenta_corriente_movimientos
    ADD CONSTRAINT fk_comercio FOREIGN KEY (comercio_id) REFERENCES public.comercios(id) ON DELETE CASCADE;


--
-- Name: configuracion_sync fk_configuracion_sync_comercio; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.configuracion_sync
    ADD CONSTRAINT fk_configuracion_sync_comercio FOREIGN KEY (comercio_id) REFERENCES public.comercios(id) ON DELETE CASCADE;


--
-- Name: ventas_detalle fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.ventas_detalle
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: ventas_detalle fk_venta; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.ventas_detalle
    ADD CONSTRAINT fk_venta FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON DELETE CASCADE;


--
-- Name: ventas fk_ventas_cliente; Type: FK CONSTRAINT; Schema: public; Owner: app_ventas
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_ventas_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO app_ventas;


--
-- PostgreSQL database dump complete
--

-- Seeder de Primer Usuario Administrador (Usuario: admin | Clave: admin)
INSERT INTO public.comercios (id, nombre) VALUES (1, 'Comercio Principal') ON CONFLICT DO NOTHING;
SELECT setval('public.comercios_id_seq', (SELECT MAX(id) FROM public.comercios));

INSERT INTO public.usuarios (usuario, password, role, comercio_id) VALUES ('pipicucu', '$2b$10$gsALfYT/NkOc2QRqtsQ7tu8q.k3S6Twk4h5BlzNG5WCXL.n0yOh4e', 'admin', 1) ON CONFLICT (usuario) DO NOTHING;

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

\unrestrict M3XkGqA3tgMUHCRZzFjhhWJGFTEgcKui9eARvHfwzMuduj7jBr2vVvV5RjKEZYk
