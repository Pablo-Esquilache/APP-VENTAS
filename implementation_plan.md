# Cambio de Tema a "Minimalismo Cálido" (Light Theme / Retail Neutral)

Este plan describe la transformación requerida para pasar la aplicación completa de un tema Oscuro ("Modo Noche Gamer/Tecnológico") a un tema Claro, Profesional y "Retail Neutral", enfocado en excelente lectura diurna e interfaces orgánicas de sistema.

## User Review Required

> [!WARNING]
> Esta actualización modificará masivamente todo el sistema de estilo preexistente en todos los archivos `.css`. Por favor, revisa la paleta de colores propuesta a continuación y avísame si hay algún tono que prefieras ajustar antes de avanzar.

### Paleta de Colores Propuesta (Actual -> Nuevo):
- **Fondos (Paneles y Body)**: Negros (`#1f1f1f`, `#151515`, `#1a1a1a`) → **Gris Perlado muy sutil (`#fafcfc`) y Blanco Puro (`#ffffff`)**
- **Textos Base**: Blancos/Grises Claros (`#f1f1f1`, `#c8c8c8`, `#fff`) → **Gris Plomizo oscuro para máxima legibilidad (`#334155`, `#1e293b`)**
- **Bordes y separadores**: Grises oscuros (`#444`, `#333`, `#222`) → **Gris Plata (`#e2e8f0`, `#cbd5e1`) con ligeras sombras difuminadas.**
- **Color Primario (Botón Principal, Acentos, Links)**: Verde Neón (`#3fd18c`, `#4caf50`) → **Naranja Terracota Cálido (`#e07a5f`)** (*Nota: si prefieres mantener verde pero más profesional, podríamos usar un Verde Oliva `#5b7b4b` o un Teal Marino `#0d9488`. De todas formas usaremos el Terracota acorde a la solicitud del audio 14*).
- **Botones Secundarios**: Grises oscuros (`#333`) → **Botones planos Gris-Plata Pálido (`#f1f5f9` hover `#e2e8f0`) con texto oscuro.**
- **Colores de estado (Rojo, Naranja)**: Se suavizarán ligeramente a tonos corporativos (Rojo Pálido `#ef4444`, Naranja Albaricoque `#f59e0b`).

## Proposed Changes

### Archivos Generales y Core

#### [MODIFY] frontend/css/globals.css
- Cambiar todos los fondos del cuerpo (`body`), la cabecera (`.app-navbar`), tablas y modales de negro a la nueva gama de blancos.
- Invertir color de tipografías primarias.
- Mapear botones (`.app-btn-primary`, `.app-btn-secondary`, `.btn-eliminar`, etc.) con la paleta descrita.
- Ajustar bordes a un gris suave y añadir sombras levísimas en `.app-modal-content` y `.app-tabla-container`.

#### [MODIFY] frontend/css/ajustes.css
- Mapear tarjetas de settings (`#2a2a2a`) a `#ffffff`.
- Actualizar componentes visuales únicos (p. ej. los `switch-ui`) al nuevo fondo y accent color.

### Estilos de Mapeo Directo (Módulos)

Aplicaremos la misma sustitución (negros -> blancos, verde neón -> terracota, gris texto -> oscuro text) sobre estructuras dedicadas.

#### [MODIFY] frontend/css/turnos.css
- Modificar cabeceras de tabla, grilla y badges. 
- Badges de color puro (Ej. libre blanco) necesitarán reajuste en un esquema de blancos.

#### [MODIFY] frontend/css/ventas.css
- Re-tematizar la grilla de productos, el carrito de compras lateral, y el botón cobrar gigante para que destaque en el nuevo color base.

#### [MODIFY] frontend/css/productos.css
- Actualizar grillas y formularios. 

#### [MODIFY] frontend/css/clientes.css
- Revisar consistencia en barra de balance, historial y buscador de clientes.

#### [MODIFY] frontend/css/gastos.css
- Invertir esquema de tarjetas estadísticas de mes/diario.

#### [MODIFY] frontend/css/caja.css
- Modificar estilos de las cajas de resumen ("Entradas", "Salidas", "Total").

## Open Questions

> [!IMPORTANT]
> **Pregunta de diseño:** El color principal sugerido en la Opción 3 para los botones primarios ("Guardar", "Cobrar", etc.) era Terracota (`#e07a5f`). ¿Estás seguro de ir con ese tono cálido o prefieres un Azul Corporativo o mantener verde pero más calmado? ¡Apruébame esto y procedo con el rediseño absoluto de los estilos!

## Verification Plan

### Manual Verification
1. Abriré la aplicación para asegurar que ningún fondo quedó oscuro y que las letras son legibles.
2. Comprobaré que los inputs de todo el sistema se vean como campos de formulario planos bien delimitados.
3. Se invitará al USER a pasear por todas las pestañas comprobando que no queden "restos" del viejo tema oscuro incrustados en un html.
