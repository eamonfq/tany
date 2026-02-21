import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-10 h-16 bg-white shadow-sm flex items-center px-4 md:px-6">
      {/* Mobile: centered logo */}
      <div className="md:hidden flex-1 flex justify-center">
        <img
          src="https://eventostany.com/wp-content/uploads/2025/06/logo_eventos_tany.png"
          alt="Eventos Tany"
          className="h-8"
        />
      </div>

      {/* Desktop: page title + search */}
      <div className="hidden md:flex items-center justify-between flex-1">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

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
      </div>
    </header>
  );
}
