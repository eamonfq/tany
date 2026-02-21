import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Bell,
  Package,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/quotes', label: 'Cotizaciones', icon: FileText },
  { to: '/invoices', label: 'Facturas', icon: Receipt },
  { to: '/reminders', label: 'Recordatorios', icon: Bell },
  { to: '/items', label: 'Catalogo', icon: Package },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-gray-900">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
        <img
          src="https://eventostany.com/wp-content/uploads/2025/06/logo_eventos_tany.png"
          alt="Eventos Tany"
          className="h-12"
        />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-pink/20 text-brand-pink-light'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
