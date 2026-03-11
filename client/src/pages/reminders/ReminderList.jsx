import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CalendarDays,
  CalendarRange,
  Phone,
  MessageCircle,
  Filter,
} from 'lucide-react';
import { remindersApi } from '../../utils/api';
import {
  formatDate,
  formatDateDay,
  formatDateRelative,
  getReminderTypeLabel,
  getReminderTypeIcon,
  getStatusColor,
  isPast,
  isToday,
  isFuture,
} from '../../utils/formatters';
import { openWhatsApp, formatPhoneDisplay } from '../../utils/whatsapp';
import { REMINDER_TYPES, PRIORITY_OPTIONS } from '../../utils/constants';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { useToast } from '../../components/shared/Toast';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function startOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function weekLabel(dateStr) {
  const ws = startOfWeek(dateStr);
  const we = addDays(ws, 6);
  const fmt = (d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };
  return `Semana del ${fmt(ws)} al ${fmt(we)}`;
}

function groupByDay(reminders) {
  const groups = {};
  reminders.forEach((r) => {
    const key = r.reminder_date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function groupByWeek(reminders) {
  const groups = {};
  reminders.forEach((r) => {
    const ws = startOfWeek(r.reminder_date);
    if (!groups[ws]) groups[ws] = [];
    groups[ws].push(r);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ws, items]) => ({
      label: weekLabel(ws),
      items: items.sort((a, b) => a.reminder_date.localeCompare(b.reminder_date)),
    }));
}

function getPriorityDot(priority) {
  switch (priority) {
    case 'Alta':
      return 'bg-red-500';
    case 'Normal':
      return 'bg-yellow-400';
    case 'Baja':
      return 'bg-gray-300';
    default:
      return 'bg-yellow-400';
  }
}

function getBorderColor(reminderDate) {
  if (isPast(reminderDate)) return 'border-l-red-500';
  if (isToday(reminderDate)) return 'border-l-amber-400';
  return 'border-l-blue-400';
}

// ---------------------------------------------------------------------------
// STATUS FILTER TABS
// ---------------------------------------------------------------------------

const STATUS_TABS = [
  { key: 'Pendiente', label: 'Pendientes' },
  { key: 'Enviado', label: 'Enviados' },
  { key: 'all', label: 'Todos' },
];

// ---------------------------------------------------------------------------
// ReminderCard Component
// ---------------------------------------------------------------------------

function ReminderCard({ reminder, onStatusUpdate, updatingId }) {
  const [expanded, setExpanded] = useState(false);
  const overdue = isPast(reminder.reminder_date);
  const today = isToday(reminder.reminder_date);
  const borderColor = getBorderColor(reminder.reminder_date);
  const isSent = reminder.status === 'Enviado';
  const isDiscarded = reminder.status === 'Descartado';
  const isDone = isSent || isDiscarded;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-all ${
        isDone ? 'opacity-50' : ''
      }`}
    >
      <div className="p-4">
        {/* Top row: type icon + label + badges */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">
              {getReminderTypeIcon(reminder.type)}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {getReminderTypeLabel(reminder.type)}
            </span>
            {/* Priority dot */}
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(reminder.priority)}`}
              title={`Prioridad: ${reminder.priority || 'Normal'}`}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {overdue && !isDone && (
              <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                <AlertTriangle size={10} />
                Atrasado
              </span>
            )}
            {today && !overdue && !isDone && (
              <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1">
                <Clock size={10} />
                Hoy
              </span>
            )}
            {isSent && (
              <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle size={10} />
                Enviado
              </span>
            )}
            {isDiscarded && (
              <span className="badge bg-gray-100 text-gray-500 flex items-center gap-1">
                <XCircle size={10} />
                Descartado
              </span>
            )}
          </div>
        </div>

        {/* Client name + phone */}
        <div className="mb-2">
          <p className="font-semibold text-gray-900 text-sm">
            {reminder.client_name}
          </p>
          {reminder.client_phone && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone size={11} className="text-gray-400" />
              {formatPhoneDisplay(reminder.client_phone)}
            </p>
          )}
        </div>

        {/* Related quote/invoice reference */}
        {(reminder.quote_number || reminder.invoice_number) && (
          <p className="text-xs text-blue-600 mb-2">
            {reminder.quote_number && `Cotizacion ${reminder.quote_number}`}
            {reminder.quote_number && reminder.invoice_number && ' | '}
            {reminder.invoice_number && `Contrato ${reminder.invoice_number}`}
          </p>
        )}

        {/* Date for non-today cards */}
        {!today && !overdue && (
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <CalendarDays size={11} />
            {formatDate(reminder.reminder_date)} &middot; {formatDateRelative(reminder.reminder_date)}
          </p>
        )}
        {overdue && (
          <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
            <CalendarDays size={11} />
            {formatDate(reminder.reminder_date)} &middot; {formatDateRelative(reminder.reminder_date)}
          </p>
        )}

        {/* Message template preview */}
        {reminder.message_template && (
          <div className="mb-3">
            <div
              className={`bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap ${
                !expanded ? 'max-h-24 overflow-hidden relative' : ''
              }`}
            >
              {reminder.message_template}
              {!expanded && reminder.message_template.length > 150 && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
              )}
            </div>
            {reminder.message_template.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-brand-pink hover:text-brand-pink-dark font-medium mt-1 flex items-center gap-0.5"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} /> ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} /> ver mas
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!isDone && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => openWhatsApp(reminder.client_phone, reminder.message_template || '')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
            <button
              onClick={() => onStatusUpdate(reminder.id, 'Enviado')}
              disabled={updatingId === reminder.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle size={14} />
              {updatingId === reminder.id ? 'Guardando...' : 'Enviado'}
            </button>
            <button
              onClick={() => onStatusUpdate(reminder.id, 'Descartado')}
              disabled={updatingId === reminder.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle size={14} />
              Descartar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Header Component
// ---------------------------------------------------------------------------

function SectionHeader({ icon: Icon, title, count, color, dateLabel }) {
  return (
    <div className={`flex items-center gap-3 mb-4 mt-8 first:mt-0`}>
      <div className={`flex items-center gap-2 ${color}`}>
        <Icon size={20} strokeWidth={2.5} />
        <h2 className="text-lg font-bold">{title}</h2>
        {dateLabel && (
          <span className="text-sm font-normal opacity-80 ml-1">
            &mdash; {dateLabel}
          </span>
        )}
      </div>
      {count > 0 && (
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            color.includes('red')
              ? 'bg-red-100 text-red-700'
              : color.includes('amber')
              ? 'bg-amber-100 text-amber-700'
              : color.includes('blue')
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RemindersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [allReminders, setAllReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('Pendiente');
  const [clientSearch, setClientSearch] = useState('');

  // ---------- Data loading ----------

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await remindersApi.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setAllReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  // ---------- Status update ----------

  async function handleStatusUpdate(id, status) {
    setUpdatingId(id);
    try {
      await remindersApi.updateStatus(id, status);
      await loadReminders();
      toast.success(status === 'Enviado' ? 'Marcado como enviado' : 'Recordatorio descartado');
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast.error('Error al actualizar el recordatorio');
    } finally {
      setUpdatingId(null);
    }
  }

  // ---------- Filtering ----------

  const filtered = allReminders.filter((r) => {
    // Status filter
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    // Type filter
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    // Client search
    if (clientSearch) {
      const term = clientSearch.toLowerCase();
      const matchName = (r.client_name || '').toLowerCase().includes(term);
      const matchPhone = (r.client_phone || '').includes(term);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  // ---------- Categorization ----------

  const today = todayStr();
  const weekEnd = addDays(today, 7);

  const todayAndOverdue = filtered
    .filter(
      (r) =>
        r.reminder_date <= today &&
        r.status === 'Pendiente'
    )
    .sort((a, b) => a.reminder_date.localeCompare(b.reminder_date));

  const thisWeek = filtered
    .filter(
      (r) =>
        r.reminder_date > today &&
        r.reminder_date <= weekEnd &&
        r.status === 'Pendiente'
    )
    .sort((a, b) => a.reminder_date.localeCompare(b.reminder_date));

  const upcoming = filtered
    .filter(
      (r) =>
        r.reminder_date > weekEnd &&
        r.status === 'Pendiente'
    )
    .sort((a, b) => a.reminder_date.localeCompare(b.reminder_date));

  // For "Enviados" / "Todos" view, show a flat sorted list
  const nonPendingView = statusFilter !== 'Pendiente';
  const flatList = nonPendingView
    ? filtered.sort((a, b) => b.reminder_date.localeCompare(a.reminder_date))
    : [];

  const totalPending = todayAndOverdue.length + thisWeek.length + upcoming.length;

  // ---------- Render ----------

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Recordatorios
            <span className="text-2xl">🔔</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            El corazon de tu CRM &mdash;{' '}
            {loading
              ? 'cargando...'
              : `${totalPending} pendiente${totalPending !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/reminders/new')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Recordatorio
        </button>
      </div>

      {/* ===== Filters Row ===== */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Type filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field pl-8 pr-8 py-2 text-sm min-w-[180px]"
          >
            <option value="all">Todos los tipos</option>
            {REMINDER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Client search */}
        <div className="relative flex-1 min-w-[180px]">
          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar cliente o telefono..."
            className="input-field pl-8 py-2 text-sm"
          />
        </div>
      </div>

      {/* ===== Content ===== */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No hay recordatorios"
          description={
            statusFilter !== 'all' || typeFilter !== 'all' || clientSearch
              ? 'No se encontraron recordatorios con los filtros seleccionados.'
              : 'Crea tu primer recordatorio para comenzar a darle seguimiento a tus clientes.'
          }
          actionLabel="Nuevo Recordatorio"
          onAction={() => navigate('/reminders/new')}
        />
      ) : nonPendingView ? (
        /* ---------- Flat list for Enviados / Todos ---------- */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {flatList.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onStatusUpdate={handleStatusUpdate}
              updatingId={updatingId}
            />
          ))}
        </div>
      ) : (
        /* ---------- Sectioned Pending view ---------- */
        <div>
          {/* ---- SECTION 1: HOY + ATRASADOS ---- */}
          {todayAndOverdue.length > 0 && (
            <section>
              <div className="bg-gradient-to-r from-red-50 via-amber-50 to-transparent rounded-xl p-4 mb-4 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Hoy &mdash; {formatDate(today)}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {todayAndOverdue.length} recordatorio{todayAndOverdue.length !== 1 ? 's' : ''} pendiente{todayAndOverdue.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="ml-auto bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {todayAndOverdue.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {todayAndOverdue.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    onStatusUpdate={handleStatusUpdate}
                    updatingId={updatingId}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ---- SECTION 2: ESTA SEMANA ---- */}
          {thisWeek.length > 0 && (
            <section>
              <SectionHeader
                icon={CalendarDays}
                title="Esta Semana"
                count={thisWeek.length}
                color="text-blue-600"
              />
              {groupByDay(thisWeek).map(([date, items]) => (
                <div key={date} className="mb-5">
                  <p className="text-sm font-semibold text-blue-700 mb-2 capitalize flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {formatDateDay(date)}
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map((r) => (
                      <ReminderCard
                        key={r.id}
                        reminder={r}
                        onStatusUpdate={handleStatusUpdate}
                        updatingId={updatingId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ---- SECTION 3: PROXIMAMENTE ---- */}
          {upcoming.length > 0 && (
            <section>
              <SectionHeader
                icon={CalendarRange}
                title="Proximamente"
                count={upcoming.length}
                color="text-gray-600"
              />
              {groupByWeek(upcoming).map((group) => (
                <div key={group.label} className="mb-5">
                  <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                    <CalendarRange size={14} />
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {group.items.map((r) => (
                      <ReminderCard
                        key={r.id}
                        reminder={r}
                        onStatusUpdate={handleStatusUpdate}
                        updatingId={updatingId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* If all sections empty in pending view */}
          {todayAndOverdue.length === 0 &&
            thisWeek.length === 0 &&
            upcoming.length === 0 && (
              <EmptyState
                icon={Bell}
                title="Sin recordatorios pendientes"
                description="Todos al dia! No hay recordatorios pendientes por enviar."
              />
            )}
        </div>
      )}
    </div>
  );
}
