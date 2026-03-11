import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { clientsApi } from '../../utils/api';
import { CLIENT_SOURCES } from '../../utils/constants';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useToast } from '../../components/shared/Toast';

const INITIAL_FORM = {
  name: '',
  phone: '',
  email: '',
  address: '',
  source: 'WhatsApp',
  notes: '',
  special_date: '',
  special_date_label: '',
};

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      clientsApi
        .getById(id)
        .then((res) => {
          const client = res.data.data || res.data;
          setForm({
            name: client.name || '',
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
            source: client.source || 'WhatsApp',
            notes: client.notes || '',
            special_date: client.special_date
              ? client.special_date.split('T')[0]
              : '',
            special_date_label: client.special_date_label || '',
          });
        })
        .catch((error) => {
          console.error('Error fetching client:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.phone.trim()) newErrors.phone = 'El telefono es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = { ...form };
      // Clean up empty optional fields - send null instead of empty strings
      if (!payload.email) payload.email = null;
      if (!payload.address) payload.address = null;
      if (!payload.notes) payload.notes = null;
      if (!payload.special_date) {
        payload.special_date = null;
        payload.special_date_label = null;
      }

      if (isEditing) {
        await clientsApi.update(id, payload);
        toast.success('Cliente actualizado');
        navigate(`/clients/${id}`);
      } else {
        const res = await clientsApi.create(payload);
        const newClient = res.data.data || res.data;
        toast.success('Cliente creado');
        navigate(`/clients/${newClient.id}`);
      }
    } catch (error) {
      console.error('Error saving client:', error);
      const msg = error.response?.data?.error || 'Error al guardar el cliente';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
            placeholder="Nombre del cliente"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Telefono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefono <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`input-field ${errors.phone ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
            placeholder="4521234567"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
            placeholder="correo@ejemplo.com"
          />
        </div>

        {/* Direccion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Direccion
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="input-field"
            placeholder="Direccion del cliente"
          />
        </div>

        {/* Fuente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuente
          </label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="input-field"
          >
            {CLIENT_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="input-field"
            placeholder="Notas adicionales..."
          />
        </div>

        {/* Fecha especial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha especial
          </label>
          <input
            type="date"
            name="special_date"
            value={form.special_date}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Etiqueta fecha especial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etiqueta fecha especial
          </label>
          <input
            type="text"
            name="special_date_label"
            value={form.special_date_label}
            onChange={handleChange}
            className="input-field"
            placeholder="Cumpleanos de hijo"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `/clients/${id}` : '/clients')}
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
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
