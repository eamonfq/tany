import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Receipt, Bell } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/quotes', label: 'Cotizar', icon: FileText },
  { to: '/invoices', label: 'Facturas', icon: Receipt },
  { to: '/reminders', label: 'Recordar', icon: Bell },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-pink' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
