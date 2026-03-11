import { useLocation } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/clients': 'Clientes',
  '/clients/new': 'Nuevo Cliente',
  '/quotes': 'Cotizaciones',
  '/quotes/new': 'Nueva Cotizacion',
  '/invoices': 'Facturas',
  '/invoices/new': 'Nueva Factura',
  '/reminders': 'Recordatorios',
  '/items': 'Catalogo',
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (/^\/clients\/\d+\/edit$/.test(pathname)) return 'Editar Cliente';
  if (/^\/clients\/\d+$/.test(pathname)) return 'Detalle de Cliente';
  if (/^\/quotes\/\d+\/edit$/.test(pathname)) return 'Editar Cotizacion';
  if (/^\/quotes\/\d+$/.test(pathname)) return 'Detalle de Cotizacion';
  if (/^\/invoices\/\d+\/edit$/.test(pathname)) return 'Editar Factura';
  if (/^\/invoices\/\d+$/.test(pathname)) return 'Detalle de Factura';
  return 'Eventos Tany';
}

export default function Header() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 h-16 bg-white shadow-sm flex items-center px-4 md:px-6">
      {/* Mobile: logo + user */}
      <div className="md:hidden flex-1 flex items-center justify-between">
        <img
          src="https://eventostany.com/wp-content/uploads/2025/06/logo_eventos_tany.png"
          alt="Eventos Tany"
          className="h-8"
        />
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span className="text-xs">{user?.displayName}</span>
          <LogOut size={16} />
        </button>
      </div>

      {/* Desktop: page title + user info */}
      <div className="hidden md:flex items-center justify-between flex-1">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="input-field pl-10 py-1.5 text-sm"
              readOnly
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{user?.displayName}</span>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Cerrar sesion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
