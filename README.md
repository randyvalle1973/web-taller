# BlueFix — Taller de reparaciones

Aplicación web para gestionar un taller de reparación de equipos electrónicos. Está construida con React + Vite y se comunica con PocketBase mediante su API REST usando `fetch`, sin instalar el SDK.

## Funcionalidades

- Panel con resumen de órdenes, clientes y etapas.
- Registro y consulta de clientes.
- Registro de órdenes con equipo, problema y hasta 3 fotografías.
- Diagnóstico, mano de obra y lista de piezas.
- Cálculo automático del presupuesto (no se almacena el total).
- Aprobación o rechazo del presupuesto.
- Avance de las órdenes según las transiciones permitidas.
- Historial de cambios de estado.
- Configuración de la URL del servidor desde la sección Conexión.
- Navegación SPA con rutas anidadas, `Outlet`, parámetro `/ordenes/:id` y página 404.

## 1. Requisitos

- Node.js 20.19+ o 22.12+.
- npm.
- PocketBase (versión reciente).

## 2. Instalar y arrancar la web

Desde la carpeta del proyecto:

```bash
npm install
```

Copia `.env.example` a `.env` y ajusta la dirección si PocketBase no está en la máquina local:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

Inicia Vite:

```bash
npm run dev
```

Abre la dirección que indique Vite, normalmente `http://localhost:5173`.

También puedes cambiar la dirección desde **Conexión** en la propia aplicación. Esa dirección se guarda en el navegador.

## 3. Preparar PocketBase

1. Descarga y descomprime PocketBase.
2. Copia la carpeta `pb_migrations` de este repositorio dentro de la carpeta de datos de PocketBase.
3. Copia `pb_hooks/ordenes.pb.js` dentro de `pb_hooks`.
4. Inicia PocketBase desde su carpeta:

```bash
./pocketbase serve
```

En Windows:

```powershell
.\pocketbase.exe serve
```

PocketBase aplica las migraciones pendientes al arrancar. Abre el panel administrativo de PocketBase y comprueba que existen las colecciones `clientes`, `ordenes` y `eventos`.

Si las carpetas `pb_migrations` o `pb_hooks` no existen en el directorio de PocketBase, créalas.

## 4. Reglas de acceso

El sistema no tiene autenticación, de acuerdo con el enunciado. La migración deja lectura y creación públicas para las colecciones necesarias, bloquea la eliminación de órdenes y clientes, y bloquea la modificación/eliminación de eventos.

**Importante:** al no haber autenticación, cualquier persona que pueda alcanzar el servidor podría leer o crear datos. Esto es adecuado únicamente para el entorno académico controlado. No publiques esta configuración en Internet con datos reales.

La regla pública de actualización de `ordenes` permite que el frontend solicite cambios; el hook `pb_hooks/ordenes.pb.js` valida las transiciones y protege el presupuesto. No elimines ese hook.

## 5. Modelo de datos

Los nombres de colecciones y campos respetan el enunciado:

### `clientes`
- `nombre` (texto)
- `telefono` (texto)

### `ordenes`
- `cliente` (relación requerida con `clientes`)
- `equipo` (texto)
- `problema` (texto)
- `estado` (select)
- `diagnostico` (texto)
- `manoObra` (número)
- `piezas` (JSON)
- `fotos` (hasta 3 imágenes)

### `eventos`
- `orden` (relación con `ordenes`)
- `de` (texto)
- `a` (texto)
- `created` (automático de PocketBase)

El total del presupuesto se calcula en el navegador a partir de mano de obra y piezas. No se guarda en PocketBase.

## 6. Datos de prueba

Después de aplicar la migración, puedes crear manualmente desde el panel de PocketBase:

**Clientes**
- Ana Pérez — 555-0101
- Luis Gómez — 555-0102

**Órdenes sugeridas**
- Laptop Lenovo — solicitada
- iPhone 12 — en_diagnostico
- Televisor Samsung — en_reparacion

Para probar el historial, cambia los estados respetando el orden. Los cambios hechos mediante la API también pasan por el hook.

## 7. Compilar para producción

```bash
npm run build
```

Los archivos finales quedan en `dist/`.

## 8. Estructura

```text
taller_react_pocketbase/
├── pb_hooks/
│   └── ordenes.pb.js
├── pb_migrations/
│   └── 1730000000_create_taller_collections.js
├── src/
│   ├── components/
│   ├── lib/
│   │   └── pocketbase.js
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
└── README.md
```

## Notas de implementación

- La capa `src/lib/pocketbase.js` concentra las llamadas HTTP. Si cambia la dirección del servidor, no hay que modificar las pantallas.
- Las rutas comparten un diseño principal mediante `Outlet`.
- El detalle de cada orden usa el parámetro `:id`.
- Las peticiones se realizan con `fetch`.
- El historial se consulta desde `eventos`; la interfaz no crea eventos directamente.
- La aplicación no incorpora autenticación ni roles.