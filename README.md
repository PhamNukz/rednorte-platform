# Plataforma de Gestión de Listas de Espera — RedNorte

**DSY1106 Desarrollo Fullstack III | DuocUC 2025**
Integrantes: Benjamin Aravena · Francisco Gomez

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE CLIENTES                      │
│  React (Portal Paciente)  │  React (Panel Admin)         │
└────────────────┬───────────────────────────┬────────────┘
                 │        HTTPS / REST        │
┌────────────────▼───────────────────────────▼────────────┐
│              API GATEWAY — Nginx :80                     │
│     JWT Auth · Rate Limit · Load Balancer               │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │
:3001      :3002      :3003      :3004      :3005/:3006
ms-lista  ms-reasig  ms-pacien  ms-agenda  ms-notif / ms-rep
espera    acion      tes        -medica    icaciones   ortes
   │          │          │          │
   ▼          ▼          ▼          ▼
 DB-Espera DB-Reasig DB-Pacien DB-Dispon
(PostgreSQL por servicio — Database per Service)
         │     ▲
         ▼     │
    ┌──────────────┐
    │   RabbitMQ   │  ← Bus de eventos asíncrono
    └──────────────┘
```

## Patrones implementados

| Patrón | Dónde |
|--------|-------|
| **Repository Pattern** | `src/repositories/` en todos los MS |
| **Factory Method** | `ms-lista-espera/src/factories/solicitudFactory.js` |
| **Circuit Breaker** | `shared/middleware/circuitBreaker.js` → usado en `ms-reasignacion` |
| **Event-Driven** | RabbitMQ en `shared/events/rabbitmq.js` |
| **CQRS** | `ms-lista-espera` (command/query separados) · `ms-reportes` (solo lectura) |
| **Database per Service** | Cada microservicio tiene su propia instancia PostgreSQL |
| **API Gateway** | Nginx con enrutamiento, JWT y rate limiting |

## Microservicios

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| ms-lista-espera | 3001 | Registro, priorización y gestión de solicitudes |
| ms-reasignacion | 3002 | Reasignación automática ante cancelaciones |
| ms-pacientes | 3003 | Perfil, historial y notificaciones de pacientes |
| ms-agenda-medica | 3004 | Disponibilidad horaria de médicos |
| ms-notificaciones | 3005 | Envío de alertas email/push/SMS |
| ms-reportes | 3006 | Dashboards e indicadores (CQRS read-only) |

## Flujo de reasignación automática

```
1. Médico/Paciente cancela cita
      ↓
2. ms-lista-espera publica evento 'cita.cancelada' en RabbitMQ
      ↓
3. ms-reasignacion consume el evento
      ↓
4. Circuit Breaker → consulta ms-lista-espera por siguiente elegible
      ↓
5. Circuit Breaker → consulta ms-agenda-medica por hora disponible
      ↓
6. Reserva la hora y publica 'cita.reasignada' + 'notificacion.requerida'
      ↓
7. ms-lista-espera actualiza estado de solicitud
8. ms-pacientes registra en historial
9. ms-notificaciones envía email/push al paciente
```

## Inicio rápido

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Editar .env con tus valores (JWT_SECRET obligatorio)

# 3. Levantar todo
docker-compose up --build

# 4. Acceder
#   Portal paciente: http://localhost
#   RabbitMQ admin:  http://localhost:15672  (admin/admin123)
```

## Estructura del proyecto

```
rednorte-platform/
├── docker-compose.yml
├── .env.example
├── nginx/nginx.conf
├── shared/
│   ├── middleware/auth.js          ← JWT + RBAC
│   ├── middleware/circuitBreaker.js
│   └── events/rabbitmq.js          ← Bus de eventos
├── services/
│   ├── ms-lista-espera/
│   ├── ms-reasignacion/
│   ├── ms-pacientes/
│   ├── ms-agenda-medica/
│   ├── ms-notificaciones/
│   └── ms-reportes/
└── frontend/                       ← React.js
    └── src/
        ├── pages/Login.jsx
        ├── pages/PortalPaciente.jsx
        └── pages/PanelAdmin.jsx
```

## Roles y accesos

| Rol | Acceso |
|-----|--------|
| `paciente` | Portal paciente — ve sus solicitudes, historial y notificaciones |
| `medico` | Panel admin — gestiona lista, agenda y reportes |
| `admin` | Panel admin — acceso completo |

## Seguridad

- JWT (15 min access token + 7 días refresh token)
- HTTPS/TLS en el API Gateway (Nginx)
- Rate limiting: 30 req/s por IP
- Validación de inputs en cada microservicio
- Red Docker privada entre servicios
- Headers de seguridad (Helmet.js + Nginx)
