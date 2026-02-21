import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Receipt,
  Edit,
  PlusCircle,
  DollarSign,
  Calendar,
  Bell,
  Save,
} from 'lucide-react';
import { clientsApi } from '../../utils/api';
import {
  formatCurrency,
  formatDate,
  formatDateRelative,
  getStatusColor,
  getReminderTypeLabel,
  getReminderTypeIcon,
} from '../../utils/formatters';
import { formatPhoneDisplay } from '../../utils/whatsapp';
import StatusBadge from '../../components/shared/StatusBadge';
import WhatsAppButton from '../../components/shared/WhatsAppButton';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [history, setHistory] = useState({ quotes: [], invoices: [], reminders: [] });
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesDirty, setNotesDirty] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [clientRes, historyRes] = await Promise.all([
          clientsApi.getById(id),
          clientsApi.getHistory(id),
        ]);
        const clientData = clientRes.data.data || clientRes.data;
        const historyData = historyRes.data.data || historyRes.data;
        setClient(clientData);
        setHistory(historyData);
        setNotes(clientData.notes || '');
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await clientsApi.update(id, { notes });
      setNotesDirty(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
        <button onClick={() => navigate('/clients')} className="btn-primary mt-4">
          Volver a Clientes
        </button>
      </div>
    );
  }

  // Compute stats from history
  const totalSpent = (history.invoices || []).reduce(
    (sum, inv) => sum + (inv.total || 0),
    0
  );
  const totalEvents = (history.invoices || []).length;
  const lastEvent =
    (history.invoices || []).length > 0
      ? [...history.invoices].sort(
          (a, b) => new Date(b.event_date || b.created_at) - new Date(a.event_date || a.created_at)
        )[0]
      : null;

  // Interleaved timeline: quotes + invoices sorted by date desc
  const timelineItems = [
    ...(history.quotes || []).map((q) => ({ ...q, _type: 'quote' })),
    ...(history.invoices || []).map((i) => ({ ...i, _type: 'invoice' })),
  ].sort(
    (a, b) =>
      new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
  );

  // Active reminders
  const activeReminders = (history.reminders || []).filter(
    (r) => r.status === 'Pendiente'
  );

  const sourceLabels = {
    WhatsApp: 'WhatsApp',
    Facebook: 'Facebook',
    Instagram: 'Instagram',
    Referido: 'Referido',
    Otro: 'Otro',
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/clients')}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Clientes
      </button>

      {/* Client Header Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-500">{formatPhoneDisplay(client.phone)}</p>
            {client.source && (
              <p className="text-xs text-gray-400 mt-1">
                Fuente: {sourceLabels[client.source] || client.source}
              </p>
            )}
          </div>
          <StatusBadge status={client.status} className="text-sm px-3 py-1" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <WhatsAppButton phone={client.phone} size="md" label="WhatsApp" />
          <button
            onClick={() => navigate(`/quotes/new?client_id=${client.id}`)}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <PlusCircle size={16} />
            Nueva cotizacion
          </button>
          <button
            onClick={() => navigate(`/clients/${client.id}/edit`)}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Edit size={16} />
            Editar
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Informacion</h2>

        {client.email && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Email</label>
            <p className="text-sm text-gray-700">{client.email}</p>
          </div>
        )}

        {client.address && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Direccion</label>
            <p className="text-sm text-gray-700">{client.address}</p>
          </div>
        )}

        {/* Special Date */}
        {client.special_date && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Fecha especial</label>
            <p className="text-sm text-amber-600">
              {'\uD83C\uDF82'} {client.special_date_label || 'Fecha especial'} -{' '}
              {formatDate(client.special_date)}
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setNotesDirty(true);
            }}
            rows={3}
            className="input-field mt-1"
            placeholder="Agregar notas sobre el cliente..."
          />
          {notesDirty && (
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="btn-primary flex items-center gap-1.5 text-sm mt-2"
            >
              <Save size={14} />
              {savingNotes ? 'Guardando...' : 'Guardar notas'}
            </button>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Resumen</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign size={18} className="text-green-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-gray-400">Total gastado</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar size={18} className="text-blue-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">{totalEvents}</p>
            <p className="text-xs text-gray-400"># de eventos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar size={18} className="text-purple-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {lastEvent
                ? formatDateRelative(lastEvent.event_date || lastEvent.created_at)
                : '-'}
            </p>
            <p className="text-xs text-gray-400">Ultimo evento</p>
          </div>
        </div>
      </div>

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bell size={18} className="text-amber-500" />
            Recordatorios activos
          </h2>
          <div className="space-y-2">
            {activeReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg"
              >
                <span className="text-lg">{getReminderTypeIcon(reminder.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {reminder.message || getReminderTypeLabel(reminder.type)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(reminder.due_date)}
                  </p>
                </div>
                <StatusBadge status={reminder.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Timeline */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Historial</h2>

        {timelineItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Sin historial de cotizaciones o facturas
          </p>
        ) : (
          <div className="space-y-3">
            {timelineItems.map((item) => {
              const isQuote = item.type === 'quote';
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() =>
                    navigate(
                      isQuote
                        ? `/quotes/${item.id}`
                        : `/invoices/${item.id}`
                    )
                  }
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isQuote ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {isQuote ? <FileText size={18} /> : <Receipt size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {isQuote ? `Cotizacion ${item.quote_number || ''}` : `Factura ${item.invoice_number || ''}`}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDateRelative(item.created_at || item.date)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
