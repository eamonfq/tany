# Eventos Tany — Sistema de Gestión

Sistema de gestión para **Eventos Tany**, negocio de renta de brincolines, inflables, mesas, sillas y mobiliario para eventos.

Digitaliza la operación del negocio: cotizaciones, facturas, seguimiento de clientes y recordatorios con integración a WhatsApp.

---

## Módulos

### Dashboard
- Eventos del mes, ingresos, pagos pendientes
- Próximos eventos con fecha y cliente
- Recordatorios pendientes del día
- Actividad reciente y métricas básicas

### Clientes (CRM)
- Registro de clientes con teléfono, origen y notas
- Clasificación por estado: Prospecto, Confirmado, Completado
- Historial de cotizaciones y facturas por cliente
- Fechas especiales para re-contactar (cumpleaños, etc.)
- Botón de WhatsApp directo en cada ficha

### Cotizaciones
- Creación seleccionando artículos del catálogo
- Cálculo automático de totales
- Envío por WhatsApp o descarga en PDF
- Conversión a factura con un click

### Facturas / Notas de Renta
- Versión digital del contrato de renta
- Número consecutivo automático
- Registro de anticipo y restante
- Condiciones del contrato incluidas
- Flujo de estados: Confirmada, En camino, Instalado, Completada
- Exportación a PDF

### Recordatorios
- Automáticos al crear factura: 2 días antes, 1 día antes, post-evento, pago pendiente
- Automáticos al crear cotización: seguimiento a los 3 días
- Fechas especiales del cliente y re-contacto de clientes antiguos
- Cada recordatorio incluye botón de WhatsApp con mensaje listo
- Se marcan como enviado o descartado

### Integración WhatsApp
- Mensajes pre-escritos con datos del cliente y evento
- Plantillas configurables (seguimiento, confirmación, agradecimiento, promo)
- Variables automáticas: nombre, fecha, total, artículos, etc.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend | Node.js + Express |
| Base de datos | SQLite (sql.js) |
| Routing | React Router DOM v6 |
| PDF | html2pdf.js |
| Fechas | date-fns |
| Iconos | Lucide React |

---

## Instalación

Requisitos: Node.js 18+ y npm.

```bash
git clone https://github.com/eamonfq/tany.git
cd tany

npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

npm run dev
```

La base de datos se crea automáticamente con datos de demostración la primera vez que se ejecuta.

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## Estructura

```
eventos-tany/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes por módulo
│   │   ├── pages/           # Vistas
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # API, WhatsApp, formateo, PDF
│   └── package.json
├── server/                  # Backend Express
│   ├── routes/              # Endpoints REST
│   ├── db/                  # Schema, seed, conexión SQLite
│   └── index.js
├── package.json
└── README.md
```

---

## Flujo principal

1. Cliente contacta pidiendo precio
2. Se registra como prospecto
3. Se crea cotización y se envía por WhatsApp
4. Si no responde, el sistema genera recordatorio de seguimiento
5. Cliente acepta y se convierte la cotización en factura
6. Se registra anticipo y se crean recordatorios pre-evento
7. Día del evento: instalación y cobro de restante
8. Post-evento: recordatorio de agradecimiento
9. Fechas especiales: re-contacto automático

---

Desarrollado por **Freddy** — Sistemas de gestión para negocios de servicios.
