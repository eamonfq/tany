import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, User, ChevronDown } from 'lucide-react';

/**
 * Searchable combobox for selecting clients.
 *
 * Props:
 *   clients     - Array of client objects ({ id, name, phone, status, ... })
 *   value       - Currently selected client_id (string or number)
 *   onChange     - (clientId: string) => void
 *   loading      - Boolean, shows loading state
 *   error        - Error message string (optional)
 *   placeholder  - Placeholder text
 *   disabled     - Disable the input
 */
export default function ClientCombobox({
  clients = [],
  value,
  onChange,
  loading = false,
  error,
  placeholder = 'Buscar cliente por nombre o teléfono...',
  disabled = false,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(
    () => clients.find((c) => String(c.id) === String(value)),
    [clients, value]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }, [clients, query]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length, query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.children[highlightIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex, open]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(client) {
    onChange(String(client.id));
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightIndex]) {
          handleSelect(filtered[highlightIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  const statusDot = (status) => {
    if (!status) return null;
    const colors = {
      Activo: 'bg-green-400',
      Prospecto: 'bg-amber-400',
      Inactivo: 'bg-gray-300',
    };
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status] || 'bg-gray-300'}`}
        title={status}
      />
    );
  };

  if (loading) {
    return (
      <div className="input-field bg-gray-50 text-gray-400 text-sm py-2.5 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
        Cargando clientes...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Selected state — show chip */}
      {selected && !open ? (
        <div
          className={`input-field flex items-center gap-2 cursor-pointer ${
            error ? 'border-red-400 focus-within:ring-red-400' : ''
          } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
          onClick={() => {
            if (!disabled) {
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          <div className="w-7 h-7 rounded-full bg-brand-pink/10 flex items-center justify-center shrink-0">
            <User size={14} className="text-brand-pink" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate block">
              {selected.name}
            </span>
            {selected.phone && (
              <span className="text-xs text-gray-400">{selected.phone}</span>
            )}
          </div>
          {statusDot(selected.status)}
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Cambiar cliente"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`input-field pl-9 pr-9 ${
              error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''
            }`}
          />
          <ChevronDown
            size={16}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
          <ul ref={listRef} role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                {query
                  ? 'No se encontraron clientes'
                  : 'No hay clientes registrados'}
              </li>
            ) : (
              filtered.map((client, index) => (
                <li
                  key={client.id}
                  role="option"
                  aria-selected={String(client.id) === String(value)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    index === highlightIndex
                      ? 'bg-brand-pink/5'
                      : 'hover:bg-gray-50'
                  } ${
                    String(client.id) === String(value)
                      ? 'bg-brand-pink/10'
                      : ''
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => handleSelect(client)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {client.phone || 'Sin teléfono'}
                      {client.email ? ` · ${client.email}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusDot(client.status)}
                    {client.status && (
                      <span className="text-xs text-gray-400">
                        {client.status}
                      </span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
