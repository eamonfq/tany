import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/shared/LoadingSpinner';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClientList = lazy(() => import('./pages/clients/ClientList'));
const ClientForm = lazy(() => import('./pages/clients/ClientForm'));
const ClientDetail = lazy(() => import('./pages/clients/ClientDetail'));
const QuoteList = lazy(() => import('./pages/quotes/QuoteList'));
const QuoteForm = lazy(() => import('./pages/quotes/QuoteForm'));
const QuoteDetail = lazy(() => import('./pages/quotes/QuoteDetail'));
const InvoiceList = lazy(() => import('./pages/invoices/InvoiceList'));
const InvoiceForm = lazy(() => import('./pages/invoices/InvoiceForm'));
const InvoiceDetail = lazy(() => import('./pages/invoices/InvoiceDetail'));
const ReminderList = lazy(() => import('./pages/reminders/ReminderList'));
const ReminderForm = lazy(() => import('./pages/reminders/ReminderForm'));
const ItemList = lazy(() => import('./pages/items/ItemList'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />
          <Route path="/quotes" element={<QuoteList />} />
          <Route path="/quotes/new" element={<QuoteForm />} />
          <Route path="/quotes/:id" element={<QuoteDetail />} />
          <Route path="/quotes/:id/edit" element={<QuoteForm />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/new" element={<InvoiceForm />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
          <Route path="/reminders" element={<ReminderList />} />
          <Route path="/reminders/new" element={<ReminderForm />} />
          <Route path="/items" element={<ItemList />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
