import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, FileText, Receipt, Bell } from 'lucide-react';
import { dashboardApi } from '../utils/api';
import { formatDate } from '../utils/formatters';
import StatsCards from '../components/dashboard/StatsCards';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import RemindersToday from '../components/dashboard/RemindersToday';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsRes, eventsRes, remindersRes, activityRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getUpcomingEvents(),
        dashboardApi.getRemindersToday(),
        dashboardApi.getRecentActivity(),
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      setReminders(remindersRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias ☀️';
    if (hour < 18) return 'Buenas tardes 🌤️';
    return 'Buenas noches 🌙';
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}</h1>
          <p className="text-gray-500">{formatDate(new Date())}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/clients/new" className="btn-primary inline-flex items-center gap-1.5 text-sm py-2 px-3">
            <UserPlus size={16} />
            Nuevo Cliente
          </Link>
          <Link to="/quotes/new" className="btn-secondary inline-flex items-center gap-1.5 text-sm py-2 px-3">
            <FileText size={16} />
            Nueva Cotizacion
          </Link>
          <Link to="/invoices/new" className="btn-secondary inline-flex items-center gap-1.5 text-sm py-2 px-3">
            <Receipt size={16} />
            Nueva Factura
          </Link>
          <Link to="/reminders/new" className="btn-secondary inline-flex items-center gap-1.5 text-sm py-2 px-3">
            <Bell size={16} />
            Nuevo Recordatorio
          </Link>
        </div>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingEvents events={events} />
          <RecentActivity activity={activity} />
        </div>
        <div>
          <RemindersToday reminders={reminders} onUpdate={loadData} />
        </div>
      </div>
    </div>
  );
}
