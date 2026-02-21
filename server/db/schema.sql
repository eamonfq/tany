-- Items
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit_price REAL NOT NULL,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'Prospecto',
  source TEXT,
  notes TEXT,
  last_contact_date DATE,
  next_follow_up DATE,
  special_date DATE,
  special_date_label TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_next_follow_up ON clients(next_follow_up);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_number TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL,
  event_date DATE,
  event_time TEXT,
  event_address TEXT,
  event_type TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  discount_percent REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Borrador',
  valid_until DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Quote Items
CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  item_id INTEGER,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  notes TEXT,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  quote_id INTEGER,
  client_id INTEGER NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  event_address TEXT NOT NULL,
  event_type TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  discount_percent REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  advance_payment REAL DEFAULT 0,
  remaining_payment REAL DEFAULT 0,
  payment_status TEXT DEFAULT 'Pendiente',
  status TEXT NOT NULL DEFAULT 'Confirmada',
  notes TEXT,
  client_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  item_id INTEGER,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  notes TEXT,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  invoice_id INTEGER,
  quote_id INTEGER,
  type TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  message_template TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  sent_at DATETIME,
  notes TEXT,
  priority TEXT DEFAULT 'Normal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_client ON reminders(client_id);

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  template TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
