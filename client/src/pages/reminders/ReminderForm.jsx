import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Bell,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { remindersApi, clientsApi, templatesApi, quotesApi, invoicesApi } from '../../utils/api';
import { REMINDER_TYPES, PRIORITY_OPTIONS } from '../../utils/constants';
import { getReminderTypeIcon } from '../../utils/formatters';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClientCombobox from '../../components/shared/ClientCombobox';

const INITIAL_FORM = {
  client_id: '',
  type: 'follow_up_quote',
  reminder_date: '',
  priority: 'Normal',
  message_template: '',
  template_id: '',
  quote_id: '',
  invoice_id: '',
};

export default function ReminderFormPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Reference data
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clientQuotes, setClientQuotes] = useState([]);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // ---------- Load reference data ----------

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await clientsApi.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setClients(data);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoadingClients(false);
      }
    }

    async function loadTemplates() {
      try {
        const res = await templatesApi.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    }

    loadClients();
    loadTemplates();
  }, []);

  // ---------- Load quotes/invoices when client changes ----------

  useEffect(() => {
    if (!form.client_id) {
      setClientQuotes([]);
      setClientInvoices([]);
      return;
    }

    async function loadRelated() {
      setLoadingRelated(true);
      try {
        const [quotesRes, invoicesRes] = await Promise.all([
          quotesApi.getAll({ client_id: form.client_id }),
          invoicesApi.getAll({ client_id: form.client_id }),
        ]);
        const quotes = Array.isArray(quotesRes.data)
          ? quotesRes.data
          : quotesRes.data.data || [];
        const invoices = Array.isArray(invoicesRes.data)
          ? invoicesRes.data
          : invoicesRes.data.data || [];
        setClientQuotes(quotes);
        setClientInvoices(invoices);
      } catch (error) {
        console.error('Error loading related data:', error);
      } finally {
        setLoadingRelated(false);
      }
    }

    loadRelated();
  }, [form.client_id]);

  // ---------- Handlers ----------

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function handleTemplateSelect(e) {
    const templateId = e.target.value;
    setForm((prev) => ({ ...prev, template_id: templateId }));

    if (templateId) {
      const selected = templates.find(
        (t) => String(t.id) === String(templateId)
      );
      if (selected) {
        // Fill the message textarea with the template body
        const body = selected.body || selected.message || selected.content || '';
        setForm((prev) => ({ ...prev, message_template: body }));
      }
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.client_id) newErrors.client_id = 'Selecciona un cliente';
    if (!form.type) newErrors.type = 'Selecciona un tipo';
    if (!form.reminder_date) newErrors.reminder_date = 'Selecciona una fecha';
    if (!form.message_template.trim())
      newErrors.message_template = 'Escribe un mensaje';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        client_id: form.client_id,
        type: form.type,
        reminder_date: form.reminder_date,
        priority: form.priority,
        message_template: form.message_template,
      };
      if (form.quote_id) payload.quote_id = form.quote_id;
      if (form.invoice_id) payload.invoice_id = form.invoice_id;

      await remindersApi.create(payload);
      navigate('/reminders');
    } catch (error) {
      console.error('Error creating reminder:', error);
    } finally {
      setSaving(false);
    }
  }

  // ---------- Render ----------

  const selectedClient = clients.find(
    (c) => String(c.id) === String(form.client_id)
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-pink/10">
          <Bell size={20} className="text-brand-pink" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nuevo Recordatorio
          </h1>
          <p className="text-sm text-gray-500">
            Programa un recordatorio para dar seguimiento a un cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* ---- Client selector ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User size={14} className="inline mr-1 -mt-0.5" />
            Cliente <span className="text-red-500">*</span>
          </label>
          <ClientCombobox
            clients={clients}
            value={form.client_id}
            onChange={(id) => setForm((prev) => ({ ...prev, client_id: id }))}
            loading={loadingClients}
            error={errors.client_id}
          />
          {errors.client_id && (
            <p className="text-xs text-red-500 mt-1">{errors.client_id}</p>
          )}
        </div>

        {/* ---- Type + Priority row ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de recordatorio <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={`input-field ${
                errors.type
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                  : ''
              }`}
            >
              {REMINDER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {getReminderTypeIcon(t.value)} {t.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs text-red-500 mt-1">{errors.type}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="input-field"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---- Date ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar size={14} className="inline mr-1 -mt-0.5" />
            Fecha del recordatorio <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="reminder_date"
            value={form.reminder_date}
            onChange={handleChange}
            className={`input-field ${
              errors.reminder_date
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : ''
            }`}
          />
          {errors.reminder_date && (
            <p className="text-xs text-red-500 mt-1">{errors.reminder_date}</p>
          )}
        </div>

        {/* ---- Template selector ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Sparkles size={14} className="inline mr-1 -mt-0.5" />
            Plantilla de mensaje
          </label>
          {loadingTemplates ? (
            <div className="input-field bg-gray-50 text-gray-400 text-sm py-2.5">
              Cargando plantillas...
            </div>
          ) : (
            <select
              name="template_id"
              value={form.template_id}
              onChange={handleTemplateSelect}
              className="input-field"
            >
              <option value="">Sin plantilla (escribir manualmente)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.title || `Plantilla ${t.id}`}
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Selecciona una plantilla para llenar automaticamente el mensaje, o escribe uno personalizado.
          </p>
        </div>

        {/* ---- Message textarea ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MessageSquare size={14} className="inline mr-1 -mt-0.5" />
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message_template"
            value={form.message_template}
            onChange={handleChange}
            rows={8}
            className={`input-field whitespace-pre-wrap ${
              errors.message_template
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : ''
            }`}
            placeholder="Escribe el mensaje que se enviara por WhatsApp al cliente..."
          />
          {errors.message_template && (
            <p className="text-xs text-red-500 mt-1">
              {errors.message_template}
            </p>
          )}
          {form.message_template && (
            <p className="text-xs text-gray-400 mt-1">
              {form.message_template.length} caracteres
            </p>
          )}
        </div>

        {/* ---- Associated quote / invoice ---- */}
        {form.client_id && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quote */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText size={14} className="inline mr-1 -mt-0.5" />
                Cotizacion asociada
              </label>
              {loadingRelated ? (
                <div className="input-field bg-gray-50 text-gray-400 text-sm py-2.5">
                  Cargando...
                </div>
              ) : (
                <select
                  name="quote_id"
                  value={form.quote_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Ninguna</option>
                  {clientQuotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quote_number || `COT-${q.id}`} &mdash;{' '}
                      {q.status}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Invoice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText size={14} className="inline mr-1 -mt-0.5" />
                Contrato asociado
              </label>
              {loadingRelated ? (
                <div className="input-field bg-gray-50 text-gray-400 text-sm py-2.5">
                  Cargando...
                </div>
              ) : (
                <select
                  name="invoice_id"
                  value={form.invoice_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Ninguno</option>
                  {clientInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number || `INV-${inv.id}`} &mdash;{' '}
                      {inv.status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* ---- Preview card ---- */}
        {form.message_template && selectedClient && (
          <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Vista previa
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {getReminderTypeIcon(form.type)}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {selectedClient.name}
              </span>
              {form.priority && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    form.priority === 'Alta'
                      ? 'bg-red-500'
                      : form.priority === 'Normal'
                      ? 'bg-yellow-400'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 max-h-32 overflow-auto">
              {form.message_template}
            </div>
          </div>
        )}

        {/* ---- Buttons ---- */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/reminders')}
            className="btn-secondary flex items-center gap-1.5"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-1.5"
          >
            <Save size={16} />
            {saving ? 'Creando...' : 'Crear Recordatorio'}
          </button>
        </div>
      </form>
    </div>
  );
}
