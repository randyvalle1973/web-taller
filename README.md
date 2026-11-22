# BlueFix – Sistema de Gestión de Taller Técnico

BlueFix es una aplicación web desarrollada con **React, Vite y PocketBase**, diseñada para gestionar las operaciones de un taller de reparación técnica.

El sistema permite administrar clientes, registrar órdenes de reparación, controlar el estado de los trabajos y consultar el historial de eventos de cada orden.

## Tecnologías utilizadas

### Frontend
- React
- JavaScript
- Vite
- React Router
- CSS
- Fetch API para las peticiones HTTP

### Backend
- PocketBase
- JavaScript para las migraciones y hooks
- Base de datos SQLite integrada en PocketBase

## Funcionalidades principales

### Gestión de clientes
- Registrar nuevos clientes.
- Consultar los clientes registrados.
- Asociar órdenes de reparación a cada cliente.
- Consultar las órdenes relacionadas con un cliente.

### Gestión de órdenes
- Crear órdenes de reparación.
- Registrar el equipo y el problema reportado.
- Adjuntar fotografías del equipo.
- Consultar el detalle de cada orden.
- Consultar el historial de cambios de estado.

### Seguimiento de reparaciones

Las órdenes siguen un flujo de estados controlado:

1. Solicitada.
2. En diagnóstico.
3. Presupuestada.
4. Aprobada o rechazada.
5. En reparación.
6. Lista para entregar.
7. Entregada.

También se permite cancelar una orden mientras se encuentra en estado solicitada.

### Presupuestos
- Registrar el diagnóstico técnico.
- Establecer el costo de mano de obra.
- Registrar las piezas necesarias y sus precios.
- Calcular automáticamente el total del presupuesto.

El total se calcula mediante la suma de la mano de obra y el costo de las piezas según sus cantidades.

### Historial de eventos
- Registrar los cambios de estado de las órdenes.
- Guardar el estado anterior y el nuevo.
- Consultar la evolución de cada reparación.

## Estructura del proyecto

```text
taller_react_pocketbase/
│
├── servidor/
│   ├── pb_hooks/
│   ├── pb_migrations/
│   └── pocketbase.exe
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Requisitos

- Node.js y npm.
- PocketBase.
- Navegador web moderno.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd taller_react_pocketbase
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar PocketBase

Descargar PocketBase desde su página oficial:

https://pocketbase.io/docs/

Colocar el ejecutable correspondiente dentro de la carpeta `servidor` y ejecutar:

```powershell
cd servidor
.\pocketbase.exe serve
```

PocketBase estará disponible por defecto en:

```text
http://127.0.0.1:8090
```

El panel de administración se encuentra en:

```text
http://127.0.0.1:8090/_/
```

Las migraciones del proyecto se encuentran en `servidor/pb_migrations`. Al iniciar PocketBase, este puede aplicarlas automáticamente.

### 4. Iniciar React

Abrir otra terminal, regresar a la raíz del proyecto y ejecutar:

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173/
```

## Configuración

La aplicación utiliza PocketBase como backend y realiza las peticiones HTTP mediante la Fetch API.

La dirección del servidor puede configurarse mediante la variable de entorno:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## Consideraciones

- PocketBase debe estar ejecutándose para utilizar las funcionalidades de la aplicación.
- La carpeta `servidor/pb_data` contiene los datos locales de PocketBase y no se incluye en el repositorio.
- El ejecutable de PocketBase debe descargarse por separado.
- Las migraciones y hooks forman parte del código del backend.
- No se utiliza un SDK de PocketBase; las comunicaciones se realizan mediante solicitudes HTTP con `fetch`.

## Autor

Proyecto académico desarrollado como parte de una asignatura de desarrollo web.

## Licencia

Proyecto de carácter académico y educativo.
