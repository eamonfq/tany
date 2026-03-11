import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Trash2, Save, Send, Package } from 'lucide-react';
import { quotesApi, clientsApi, itemsApi } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import { EVENT_TYPES } from '../../utils/constants';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClientCombobox from '../../components/shared/ClientCombobox';
import { useToast } from '../../components/shared/Toast';

const emptyItem = () => ({
  item_id: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  line_total: 0,
});

export default function QuoteFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);

  const [form, setForm] = useState({
    client_id: searchParams.get('client_id') || '',
    event_date: '',
    event_time: '',
    event_address: '',
    event_type: '',
    discount_percent: 0,
    notes: '',
  });

  const [items, setItems] = useState([emptyItem()]);

  // Computed totals
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.line_total || 0), 0),
    [items]
  );
  const discountAmount = useMemo(
    () => (subtotal * (form.discount_percent || 0)) / 100,
    [subtotal, form.discount_percent]
  );
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  // Group catalog items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    catalogItems.forEach((item) => {
      const cat = item.category || 'Otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [catalogItems]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [clientsRes, itemsRes] = await Promise.all([
        clientsApi.getAll(),
        itemsApi.getAll(),
      ]);
      setClients(clientsRes.data);
      setCatalogItems(itemsRes.data);

      if (isEditing) {
        const quoteRes = await quotesApi.getById(id);
        const quote = quoteRes.data;
        setForm({
          client_id: quote.client_id || '',
          event_date: quote.event_date || '',
          event_time: quote.event_time || '',
          event_address: quote.event_address || '',
          event_type: quote.event_type || '',
          discount_percent: quote.discount_percent || 0,
          notes: quote.notes || '',
        });
        if (quote.items && quote.items.length > 0) {
          setItems(
            quote.items.map((i) => ({
              item_id: i.item_id || '',
              description: i.description || '',
              quantity: i.quantity || 1,
              unit_price: i.unit_price || 0,
              line_total: (i.quantity || 1) * (i.unit_price || 0),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleItemChange(index, field, value) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate line total when quantity or unit_price changes
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Number(value) : Number(updated[index].quantity);
        const price = field === 'unit_price' ? Number(value) : Number(updated[index].unit_price);
        updated[index].line_total = qty * price;
      }

      return updated;
    });
  }

  function handleItemSelect(index, itemId) {
    if (!itemId) {
      // Custom item - clear fields
      handleItemChange(index, 'item_id', '');
      return;
    }

    const catalogItem = catalogItems.find((i) => String(i.id) === String(itemId));
    if (catalogItem) {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = {
          item_id: catalogItem.id,
          description: catalogItem.name,
          quantity: updated[index].quantity || 1,
          unit_price: updated[index].unit_price || 0,
          line_total: (updated[index].quantity || 1) * (updated[index].unit_price || 0),
        };
        return updated;
      });
    }
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index) {
    setItems((prev) => {
      if (prev.length <= 1) return [emptyItem()];
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSave(sendAfterSave = false) {
    if (!form.client_id) {
      toast.warning('Por favor selecciona un cliente');
      return;
    }

    const validItems = items.filter((i) => i.description);
    if (validItems.length === 0) {
      toast.warning('Agrega al menos un articulo con descripcion');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        discount_percent: Number(form.discount_percent) || 0,
        items: validItems.map((i) => ({
          item_id: i.item_id || null,
          description: i.description,
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
        })),
      };

      let savedQuote;
      if (isEditing) {
        savedQuote = await quotesApi.update(id, payload);
      } else {
        savedQuote = await quotesApi.create(payload);
      }

      const quoteId = savedQuote.data.id || id;

      if (sendAfterSave) {
        await quotesApi.updateStatus(quoteId, 'Enviada');
      }

      toast.success(sendAfterSave ? 'Cotizacion guardada y enviada' : 'Cotizacion guardada');
      navigate(`/quotes/${quoteId}`);
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Error al guardar la cotizacion');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Cotización' : 'Nueva Cotización'}
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Client Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <ClientCombobox
                clients={clients}
                value={form.client_id}
                onChange={(id) => handleFormChange('client_id', id)}
              />
            </div>
            <button
              onClick={() => navigate('/clients/new')}
              className="btn-secondary inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={16} />
              Crear cliente
            </button>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Evento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del evento
              </label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => handleFormChange('event_date', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={form.event_time}
                onChange={(e) => handleFormChange('event_time', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección del evento
              </label>
              <input
                type="text"
                value={form.event_address}
                onChange={(e) => handleFormChange('event_address', e.target.value)}
                placeholder="Calle, colonia, ciudad..."
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de evento
              </label>
              <select
                value={form.event_type}
                onChange={(e) => handleFormChange('event_type', e.target.value)}
                className="input-field w-full"
              >
                <option value="">Seleccionar tipo...</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Artículos</h2>
            <button
              onClick={addItem}
              className="btn-secondary inline-flex items-center gap-1.5 text-sm"
            >
              <Plus size={16} />
              Agregar artículo
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
              >
                {/* Item selector */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Artículo
                    </label>
                    <select
                      value={item.item_id || ''}
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                      className="input-field w-full text-sm"
                    >
                      <option value="">-- Artículo personalizado --</option>
                      {Object.entries(groupedItems).map(([category, catItems]) => (
                        <optgroup key={category} label={category}>
                          {catItems.map((ci) => (
                            <option key={ci.id} value={ci.id}>
                              {ci.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Descripción del artículo"
                      className="input-field w-full text-sm"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cant.</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="input-field w-full text-sm text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Precio unit.
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="input-field w-full text-sm pl-6"
                      />
                    </div>
                  </div>
                </div>

                {/* Line total + remove */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    Total: {formatCurrency(item.line_total)}
                  </span>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar artículo"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Descuento</span>
                <div className="relative w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount_percent}
                    onChange={(e) => handleFormChange('discount_percent', e.target.value)}
                    className="input-field w-full text-sm text-center pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    %
                  </span>
                </div>
              </div>
              <span className="font-medium text-red-500">
                {discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : '$0'}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-brand-pink">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>
          <textarea
            value={form.notes}
            onChange={(e) => handleFormChange('notes', e.target.value)}
            placeholder="Notas adicionales, instrucciones especiales..."
            rows={3}
            className="input-field w-full resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-secondary inline-flex items-center justify-center gap-2 flex-1"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-primary inline-flex items-center justify-center gap-2 flex-1"
          >
            <Send size={18} />
            {saving ? 'Guardando...' : 'Guardar y Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
