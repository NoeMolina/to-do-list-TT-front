# Listo — To-Do List Frontend

Interfaz web para la gestión de tareas y subtareas, con autenticación JWT y vistas diferenciadas por rol (admin / usuario).

## Stack

- **Angular 21** (standalone components, Signals, zoneless)
- **PrimeNG 21** — librería de componentes
- **Tailwind CSS v4** — estilos utility-first
- **pnpm** — gestor de paquetes

## Requisitos previos

- Node.js compatible con Angular 21
- pnpm
- Backend corriendo en `http://localhost:8080` (ver README del backend)

## Instalación

```bash
pnpm install
```

## Ejecutar en desarrollo

```bash
pnpm start
```

La app queda disponible en `http://localhost:4200`.

## Estructura del proyecto

```
src/app/
├── models/          → Interfaces TypeScript (equivalentes a los DTOs del backend)
├── services/        → Llamadas HTTP a la API (uno por recurso)
├── guards/          → authGuard, protege rutas que requieren sesión iniciada
├── interceptors/     → authInterceptor, agrega el JWT a cada request
├── layout/          → Layout base con navbar (usuario actual, logout)
├── pages/           → Pantallas de la app (login, task-list)
├── app.config.ts
├── app.routes.ts
└── app.ts
```

## Autenticación

- El login (`/login`) es la única pantalla pública. No existe registro público: los usuarios nuevos los crea un admin desde el backend (`POST /auth/register`).
- El estado de sesión (token, username, rol) se maneja con **Signals** en `AuthService`, persistido en `localStorage`.
- El rol (`ADMIN`/`USER`) se extrae directamente del JWT decodificado en el cliente, solo para efectos de mostrar/ocultar UI — el backend siempre revalida permisos en cada request.

## Funcionalidad principal

- **Tablero tipo Kanban** con 3 columnas: Pendientes, En progreso, Finalizadas (Completadas + Canceladas).
- Botones de transición de estatus según el ciclo de vida válido (mismo definido en el backend).
- Creación de tareas con categoría y fecha de vencimiento.
- Gestión de subtareas por tarea (crear, listar, cambiar estatus) desde un modal.
- **Vista de administrador:**
  - Ve todas las tareas del sistema, no solo las propias.
  - Puede asignar una tarea nueva a cualquier usuario.
  - Cada tarjeta distingue visualmente tareas propias (borde teal) de las de otros usuarios (borde gris), mostrando el username correspondiente.

## Notas de configuración

- El tema de PrimeNG está forzado a modo claro (`darkModeSelector: false` en `app.config.ts`) para evitar inconsistencias con el modo oscuro del sistema operativo.
- Los overlays de PrimeNG dentro de modales (datepicker, selects) usan `appendTo="body"` para evitar que se recorten visualmente.
- La URL base de la API se configura en `src/environments/environment.ts` / `environment.development.ts` (`apiUrl`).
