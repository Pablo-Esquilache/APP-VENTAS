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
    nombre character varying(100) NOT NULL
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
    tipo character varying(20),
    fecha timestamp without time zone NOT NULL,
    importe numeric(14,2) NOT NULL,
    comercio_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT gastos_importe_check CHECK ((importe >= (0)::numeric)),
    CONSTRAINT gastos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['fijo'::character varying, 'variable'::character varying])::text[])))
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

\unrestrict M3XkGqA3tgMUHCRZzFjhhWJGFTEgcKui9eARvHfwzMuduj7jBr2vVvV5RjKEZYk

