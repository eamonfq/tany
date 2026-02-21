import { useState, useEffect } from 'react';
import { itemsApi } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import { ITEM_CATEGORIES } from '../../utils/constants';
import { Package, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmModal from '../../components/shared/ConfirmModal';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Brincolines', description: '', unit_price: '' });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const res = await itemsApi.getAll();
      setItems(res.data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = activeCategory === 'Todos'
    ? items
    : items.filter(i => i.category === activeCategory);

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  function openForm(item = null) {
    if (item) {
      setEditingItem(item);
      setForm({ name: item.name, category: item.category, description: item.description || '', unit_price: item.unit_price });
    } else {
      setEditingItem(null);
      setForm({ name: '', category: 'Brincolines', description: '', unit_price: '' });
    }
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = { ...form, unit_price: Number(form.unit_price) };
      if (editingItem) {
        await itemsApi.update(editingItem.id, data);
      } else {
        await itemsApi.create(data);
      }
      setShowForm(false);
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }

  async function handleDelete(id) {
    try {
      await itemsApi.delete(id);
      setDeleteConfirm(null);
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  function getCategoryIcon(cat) {
    const icons = { 'Brincolines': '🎪', 'Mesas': '🪑', 'Sillas': '💺', 'Manteles': '🎨', 'CubreManteles': '✨', 'Otros': '🎉' };
    return icons[cat] || '📦';
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Artículos</h1>
          <p className="text-gray-500">{items.length} artículos activos</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo Artículo
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['Todos', ...ITEM_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-brand-pink text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat !== 'Todos' && getCategoryIcon(cat)} {cat}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState icon={Package} title="Sin artículos" description="Agrega artículos al catálogo para comenzar" actionLabel="Agregar artículo" onAction={() => openForm()} />
      ) : (
        Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {getCategoryIcon(category)} {category} <span className="text-sm font-normal text-gray-400">({categoryItems.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryItems.map(item => (
                <div key={item.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <span className="text-lg font-bold text-brand-pink ml-3">{formatCurrency(item.unit_price)}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => openForm(item)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Edit2 size={14} /> Editar
                    </button>
                    <button onClick={() => setDeleteConfirm(item)} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editingItem ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                  {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario *</label>
                <input type="number" step="0.01" min="0" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} className="input-field" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={16} /> Guardar
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?.id)}
        title="Eliminar artículo"
        message={`¿Seguro que deseas eliminar "${deleteConfirm?.name}"?`}
      />
    </div>
  );
}
