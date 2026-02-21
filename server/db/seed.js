function seedDatabase(db) {
  // Items (18 items)
  const items = [
    { name: 'Brincol\u00edn Castillo', category: 'Brincolines', unit_price: 350, description: 'Brincol\u00edn inflable tipo castillo, 4x3m' },
    { name: 'Brincol\u00edn Dinosaurio', category: 'Brincolines', unit_price: 400, description: 'Brincol\u00edn inflable con forma de dinosaurio, 5x4m' },
    { name: 'Brincol\u00edn Acu\u00e1tico', category: 'Brincolines', unit_price: 500, description: 'Brincol\u00edn con resbaladilla y alberca, 6x4m' },
    { name: 'Brincol\u00edn Princesas', category: 'Brincolines', unit_price: 380, description: 'Brincol\u00edn tem\u00e1tico princesas, 4x3m' },
    { name: 'Resbaladilla Inflable', category: 'Brincolines', unit_price: 450, description: 'Resbaladilla inflable doble, 5m altura' },
    { name: 'Mesa Rectangular', category: 'Mesas', unit_price: 50, description: 'Mesa rectangular plegable, 1.8m, para 8 personas' },
    { name: 'Mesa Redonda', category: 'Mesas', unit_price: 60, description: 'Mesa redonda plegable, 1.5m di\u00e1metro, para 10 personas' },
    { name: 'Mesa Infantil', category: 'Mesas', unit_price: 35, description: 'Mesa infantil rectangular, 1.2m' },
    { name: 'Silla Plegable Adulto', category: 'Sillas', unit_price: 8, description: 'Silla plegable met\u00e1lica con asiento acojinado' },
    { name: 'Silla Infantil', category: 'Sillas', unit_price: 6, description: 'Silla infantil plegable' },
    { name: 'Silla Tiffany', category: 'Sillas', unit_price: 25, description: 'Silla Tiffany elegante, blanca o dorada' },
    { name: 'Mantel Rectangular', category: 'Manteles', unit_price: 30, description: 'Mantel de tela, varios colores, para mesa rectangular' },
    { name: 'Mantel Redondo', category: 'Manteles', unit_price: 35, description: 'Mantel de tela, varios colores, para mesa redonda' },
    { name: 'CubreMantel', category: 'CubreManteles', unit_price: 20, description: 'Cubremantel decorativo de organza' },
    { name: 'Rockola con Bocina', category: 'Otros', unit_price: 250, description: 'Rockola con pantalla y bocina amplificada' },
    { name: 'M\u00e1quina de Palomitas', category: 'Otros', unit_price: 150, description: 'M\u00e1quina de palomitas con carrito' },
    { name: 'Algod\u00f3n de Az\u00facar', category: 'Otros', unit_price: 180, description: 'M\u00e1quina de algod\u00f3n de az\u00facar' },
    { name: 'Iluminaci\u00f3n LED', category: 'Otros', unit_price: 200, description: 'Set de iluminaci\u00f3n LED ambiental' },
  ];

  items.forEach(item => {
    db.prepare('INSERT INTO items (name, category, unit_price, description) VALUES (?, ?, ?, ?)').run([item.name, item.category, item.unit_price, item.description]);
  });

  // Clients (10)
  const clients = [
    { name: 'Fernanda Estrada', phone: '4521235725', status: 'Completado', source: 'WhatsApp', notes: 'Cliente frecuente, siempre renta brincol\u00edn + mesas', special_date: '2025-08-15', special_date_label: 'Cumplea\u00f1os de su hija', last_contact_date: '2025-02-15' },
    { name: 'Esmeralda P\u00e9rez', phone: '4521670459', status: 'Confirmado', source: 'Facebook', notes: 'Evento en Sol Naciente, dej\u00f3 anticipo', last_contact_date: '2025-02-18' },
    { name: 'Roberto S\u00e1nchez', phone: '4521889034', status: 'Prospecto', source: 'Instagram', notes: 'Pregunt\u00f3 por paquete XV a\u00f1os, solo pidi\u00f3 precios', last_contact_date: '2025-02-10' },
    { name: 'Mar\u00eda L\u00f3pez Torres', phone: '4521456789', status: 'Completado', source: 'Referido', notes: 'Referida por Fernanda', special_date: '2025-05-20', special_date_label: 'Cumplea\u00f1os de gemelos', last_contact_date: '2025-01-28' },
    { name: 'Juan Carlos Moreno', phone: '4521998877', status: 'Cotizado', source: 'WhatsApp', notes: 'Se le envi\u00f3 cotizaci\u00f3n para evento corporativo, no ha confirmado ni dejado anticipo', last_contact_date: '2025-02-17' },
    { name: 'Ana Gabriela R\u00edos', phone: '4521334455', status: 'Cotizado', source: 'Facebook', notes: 'Cotiz\u00f3 para bautizo, se le envi\u00f3 cotizaci\u00f3n con fecha, comparando precios', last_contact_date: '2025-02-16' },
    { name: 'Pedro Hern\u00e1ndez', phone: '4521776655', status: 'Completado', source: 'WhatsApp', notes: 'Buen cliente, paga puntual', special_date: '2025-11-10', special_date_label: 'Cumplea\u00f1os de hijo', last_contact_date: '2025-02-01' },
    { name: 'Laura Mart\u00ednez', phone: '4521223344', status: 'Prospecto', source: 'Instagram', notes: 'Pregunt\u00f3 precios por DM, no ha pedido cotizaci\u00f3n formal', last_contact_date: '2025-02-12' },
    { name: 'Carlos Ram\u00edrez', phone: '4521665544', status: 'Completado', source: 'Referido', notes: 'Renta cada a\u00f1o para el cumple de su ni\u00f1a', last_contact_date: '2025-01-20' },
    { name: 'Sof\u00eda Guti\u00e9rrez', phone: '4521887766', status: 'Confirmado', source: 'WhatsApp', notes: 'Evento de comuni\u00f3n, ya dej\u00f3 anticipo', last_contact_date: '2025-02-19' },
  ];

  clients.forEach(c => {
    db.prepare('INSERT INTO clients (name, phone, status, source, notes, special_date, special_date_label, last_contact_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run([c.name, c.phone, c.status, c.source, c.notes, c.special_date || null, c.special_date_label || null, c.last_contact_date || null]);
  });

  // Quotes (6)
  const quotes = [
    { quote_number: 'COT-2025-0001', client_id: 1, event_date: '2025-02-20', event_time: '8:00 AM', event_address: 'Hidalgo 364, Col. Morelos', event_type: 'Cumplea\u00f1os', subtotal: 832, discount_percent: 5, discount_amount: 41.60, total: 790.40, status: 'Convertida', valid_until: '2025-02-10' },
    { quote_number: 'COT-2025-0002', client_id: 5, event_date: '2025-03-08', event_time: '10:00 AM', event_address: 'Blvd. Industrial 200, Zona Norte', event_type: 'Otro', subtotal: 1200, discount_percent: 0, discount_amount: 0, total: 1200, status: 'Enviada', valid_until: '2025-03-01' },
    { quote_number: 'COT-2025-0003', client_id: 6, event_date: '2025-03-15', event_time: '12:00 PM', event_address: 'Parroquia San Jos\u00e9, Centro', event_type: 'Bautizo', subtotal: 650, discount_percent: 10, discount_amount: 65, total: 585, status: 'Enviada', valid_until: '2025-03-08' },
    { quote_number: 'COT-2025-0004', client_id: 3, event_date: '2025-04-12', event_time: '4:00 PM', event_address: 'Sal\u00f3n Las Fuentes, Av. Principal', event_type: 'XV A\u00f1os', subtotal: 2100, discount_percent: 5, discount_amount: 105, total: 1995, status: 'Borrador', valid_until: '2025-03-20' },
    { quote_number: 'COT-2025-0005', client_id: 2, event_date: '2025-02-22', event_time: '2:00 PM', event_address: 'Col. Sol Naciente, Calle 5 #123', event_type: 'Cumplea\u00f1os', subtotal: 980, discount_percent: 0, discount_amount: 0, total: 980, status: 'Convertida', valid_until: '2025-02-15' },
    { quote_number: 'COT-2025-0006', client_id: 10, event_date: '2025-03-01', event_time: '11:00 AM', event_address: 'Iglesia del Carmen, Col. Centro', event_type: 'Comuni\u00f3n', subtotal: 870, discount_percent: 0, discount_amount: 0, total: 870, status: 'Convertida', valid_until: '2025-02-22' },
  ];

  quotes.forEach(q => {
    db.prepare('INSERT INTO quotes (quote_number, client_id, event_date, event_time, event_address, event_type, subtotal, discount_percent, discount_amount, total, status, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run([q.quote_number, q.client_id, q.event_date, q.event_time, q.event_address, q.event_type, q.subtotal, q.discount_percent, q.discount_amount, q.total, q.status, q.valid_until]);
  });

  // Quote Items
  const quoteItems = [
    // COT-0001 (Fernanda - cumplea\u00f1os)
    { quote_id: 1, item_id: 2, description: 'Brincol\u00edn Dinosaurio', quantity: 1, unit_price: 400, line_total: 400 },
    { quote_id: 1, item_id: 6, description: 'Mesa Rectangular', quantity: 3, unit_price: 50, line_total: 150 },
    { quote_id: 1, item_id: 9, description: 'Silla Plegable Adulto', quantity: 24, unit_price: 8, line_total: 192 },
    { quote_id: 1, item_id: 12, description: 'Mantel Rectangular', quantity: 3, unit_price: 30, line_total: 90 },
    // COT-0002 (Juan Carlos - corporativo)
    { quote_id: 2, item_id: 6, description: 'Mesa Rectangular', quantity: 10, unit_price: 50, line_total: 500 },
    { quote_id: 2, item_id: 9, description: 'Silla Plegable Adulto', quantity: 50, unit_price: 8, line_total: 400 },
    { quote_id: 2, item_id: 12, description: 'Mantel Rectangular', quantity: 10, unit_price: 30, line_total: 300 },
    // COT-0003 (Ana - bautizo)
    { quote_id: 3, item_id: 1, description: 'Brincol\u00edn Castillo', quantity: 1, unit_price: 350, line_total: 350 },
    { quote_id: 3, item_id: 6, description: 'Mesa Rectangular', quantity: 2, unit_price: 50, line_total: 100 },
    { quote_id: 3, item_id: 9, description: 'Silla Plegable Adulto', quantity: 16, unit_price: 8, line_total: 128 },
    { quote_id: 3, item_id: 14, description: 'CubreMantel', quantity: 2, unit_price: 20, line_total: 40 },
    { quote_id: 3, item_id: 12, description: 'Mantel Rectangular', quantity: 2, unit_price: 30, line_total: 60 },
    // COT-0004 (Roberto - XV a\u00f1os)
    { quote_id: 4, item_id: 3, description: 'Brincol\u00edn Acu\u00e1tico', quantity: 1, unit_price: 500, line_total: 500 },
    { quote_id: 4, item_id: 5, description: 'Resbaladilla Inflable', quantity: 1, unit_price: 450, line_total: 450 },
    { quote_id: 4, item_id: 7, description: 'Mesa Redonda', quantity: 8, unit_price: 60, line_total: 480 },
    { quote_id: 4, item_id: 11, description: 'Silla Tiffany', quantity: 60, unit_price: 25, line_total: 1500 },
    // COT-0005 (Esmeralda - cumplea\u00f1os)
    { quote_id: 5, item_id: 4, description: 'Brincol\u00edn Princesas', quantity: 1, unit_price: 380, line_total: 380 },
    { quote_id: 5, item_id: 6, description: 'Mesa Rectangular', quantity: 4, unit_price: 50, line_total: 200 },
    { quote_id: 5, item_id: 9, description: 'Silla Plegable Adulto', quantity: 30, unit_price: 8, line_total: 240 },
    { quote_id: 5, item_id: 16, description: 'M\u00e1quina de Palomitas', quantity: 1, unit_price: 150, line_total: 150 },
    // COT-0006 (Sof\u00eda - comuni\u00f3n)
    { quote_id: 6, item_id: 1, description: 'Brincol\u00edn Castillo', quantity: 1, unit_price: 350, line_total: 350 },
    { quote_id: 6, item_id: 6, description: 'Mesa Rectangular', quantity: 5, unit_price: 50, line_total: 250 },
    { quote_id: 6, item_id: 9, description: 'Silla Plegable Adulto', quantity: 40, unit_price: 8, line_total: 320 },
  ];

  quoteItems.forEach(qi => {
    db.prepare('INSERT INTO quote_items (quote_id, item_id, description, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)').run([qi.quote_id, qi.item_id, qi.description, qi.quantity, qi.unit_price, qi.line_total]);
  });

  // Invoices (8)
  const invoices = [
    // NOTA 0333 - Fernanda (from COT-0001)
    { invoice_number: 'NOTA-0333', quote_id: 1, client_id: 1, event_date: '2025-02-20', event_time: '8:00 AM', event_address: 'Hidalgo 364, Col. Morelos, Ganader\u00eda', event_type: 'Cumplea\u00f1os', subtotal: 510, discount_percent: 0, discount_amount: 0, total: 510, advance_payment: 150, remaining_payment: 360, payment_status: 'Anticipo', status: 'Confirmada' },
    // NOTA 0415 - Esmeralda
    { invoice_number: 'NOTA-0415', quote_id: 5, client_id: 2, event_date: '2025-02-22', event_time: '2:00 PM', event_address: 'Col. Sol Naciente, Calle 5 #123', event_type: 'Cumplea\u00f1os', subtotal: 130, discount_percent: 0, discount_amount: 0, total: 130, advance_payment: 0, remaining_payment: 130, payment_status: 'Pendiente', status: 'Confirmada' },
    // NOTA 0416 - Sof\u00eda (from COT-0006)
    { invoice_number: 'NOTA-0416', quote_id: 6, client_id: 10, event_date: '2025-03-01', event_time: '11:00 AM', event_address: 'Iglesia del Carmen, Col. Centro', event_type: 'Comuni\u00f3n', subtotal: 870, discount_percent: 0, discount_amount: 0, total: 870, advance_payment: 300, remaining_payment: 570, payment_status: 'Anticipo', status: 'Confirmada' },
    // NOTA 0330 - Mar\u00eda L\u00f3pez (completada)
    { invoice_number: 'NOTA-0330', quote_id: null, client_id: 4, event_date: '2025-01-25', event_time: '3:00 PM', event_address: 'Av. Constituci\u00f3n 45, Col. Centro', event_type: 'Cumplea\u00f1os', subtotal: 720, discount_percent: 0, discount_amount: 0, total: 720, advance_payment: 720, remaining_payment: 0, payment_status: 'Pagado', status: 'Completada' },
    // NOTA 0325 - Pedro (completada)
    { invoice_number: 'NOTA-0325', quote_id: null, client_id: 7, event_date: '2025-01-18', event_time: '10:00 AM', event_address: 'Jard\u00edn Las Rosas, Col. Jardines', event_type: 'Cumplea\u00f1os', subtotal: 550, discount_percent: 0, discount_amount: 0, total: 550, advance_payment: 550, remaining_payment: 0, payment_status: 'Pagado', status: 'Completada' },
    // NOTA 0320 - Carlos (completada)
    { invoice_number: 'NOTA-0320', quote_id: null, client_id: 9, event_date: '2025-01-12', event_time: '4:00 PM', event_address: 'Priv. Magnolias 8, Fracc. Los \u00c1lamos', event_type: 'Cumplea\u00f1os', subtotal: 480, discount_percent: 0, discount_amount: 0, total: 480, advance_payment: 480, remaining_payment: 0, payment_status: 'Pagado', status: 'Completada' },
    // NOTA 0335 - Fernanda (completada, older event)
    { invoice_number: 'NOTA-0335', quote_id: null, client_id: 1, event_date: '2025-02-01', event_time: '12:00 PM', event_address: 'Hidalgo 364, Col. Morelos', event_type: 'Cumplea\u00f1os', subtotal: 380, discount_percent: 0, discount_amount: 0, total: 380, advance_payment: 380, remaining_payment: 0, payment_status: 'Pagado', status: 'Completada' },
    // NOTA 0417 - Roberto (prospecto who actually booked direct)
    { invoice_number: 'NOTA-0417', quote_id: null, client_id: 3, event_date: '2025-03-10', event_time: '5:00 PM', event_address: 'Sal\u00f3n Las Fuentes, Av. Principal', event_type: 'XV A\u00f1os', subtotal: 1800, discount_percent: 0, discount_amount: 0, total: 1800, advance_payment: 500, remaining_payment: 1300, payment_status: 'Anticipo', status: 'Confirmada' },
  ];

  invoices.forEach(inv => {
    db.prepare('INSERT INTO invoices (invoice_number, quote_id, client_id, event_date, event_time, event_address, event_type, subtotal, discount_percent, discount_amount, total, advance_payment, remaining_payment, payment_status, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run([inv.invoice_number, inv.quote_id, inv.client_id, inv.event_date, inv.event_time, inv.event_address, inv.event_type, inv.subtotal, inv.discount_percent, inv.discount_amount, inv.total, inv.advance_payment, inv.remaining_payment, inv.payment_status, inv.status]);
  });

  // Invoice Items
  const invoiceItems = [
    // NOTA-0333
    { invoice_id: 1, item_id: 2, description: 'Brincol\u00edn Dinosaurio', quantity: 1, unit_price: 430, line_total: 430 },
    { invoice_id: 1, item_id: 6, description: 'Mesa Rectangular', quantity: 3, unit_price: 0, line_total: 0 },
    { invoice_id: 1, item_id: 9, description: 'Silla Plegable Adulto', quantity: 24, unit_price: 3.33, line_total: 80 },
    // NOTA-0415
    { invoice_id: 2, item_id: 6, description: 'Mesa Rectangular', quantity: 1, unit_price: 50, line_total: 50 },
    { invoice_id: 2, item_id: 9, description: 'Silla Plegable Adulto', quantity: 10, unit_price: 8, line_total: 80 },
    // NOTA-0416
    { invoice_id: 3, item_id: 1, description: 'Brincol\u00edn Castillo', quantity: 1, unit_price: 350, line_total: 350 },
    { invoice_id: 3, item_id: 6, description: 'Mesa Rectangular', quantity: 5, unit_price: 50, line_total: 250 },
    { invoice_id: 3, item_id: 9, description: 'Silla Plegable Adulto', quantity: 40, unit_price: 8, line_total: 320 },
    // NOTA-0330
    { invoice_id: 4, item_id: 4, description: 'Brincol\u00edn Princesas', quantity: 1, unit_price: 380, line_total: 380 },
    { invoice_id: 4, item_id: 6, description: 'Mesa Rectangular', quantity: 2, unit_price: 50, line_total: 100 },
    { invoice_id: 4, item_id: 9, description: 'Silla Plegable Adulto', quantity: 20, unit_price: 8, line_total: 160 },
    { invoice_id: 4, item_id: 12, description: 'Mantel Rectangular', quantity: 2, unit_price: 30, line_total: 60 },
    { invoice_id: 4, item_id: 14, description: 'CubreMantel', quantity: 1, unit_price: 20, line_total: 20 },
    // NOTA-0325
    { invoice_id: 5, item_id: 1, description: 'Brincol\u00edn Castillo', quantity: 1, unit_price: 350, line_total: 350 },
    { invoice_id: 5, item_id: 6, description: 'Mesa Rectangular', quantity: 2, unit_price: 50, line_total: 100 },
    { invoice_id: 5, item_id: 9, description: 'Silla Plegable Adulto', quantity: 12, unit_price: 8, line_total: 96 },
    // NOTA-0320
    { invoice_id: 6, item_id: 2, description: 'Brincol\u00edn Dinosaurio', quantity: 1, unit_price: 400, line_total: 400 },
    { invoice_id: 6, item_id: 9, description: 'Silla Plegable Adulto', quantity: 10, unit_price: 8, line_total: 80 },
    // NOTA-0335
    { invoice_id: 7, item_id: 4, description: 'Brincol\u00edn Princesas', quantity: 1, unit_price: 380, line_total: 380 },
    // NOTA-0417
    { invoice_id: 8, item_id: 3, description: 'Brincol\u00edn Acu\u00e1tico', quantity: 1, unit_price: 500, line_total: 500 },
    { invoice_id: 8, item_id: 5, description: 'Resbaladilla Inflable', quantity: 1, unit_price: 450, line_total: 450 },
    { invoice_id: 8, item_id: 7, description: 'Mesa Redonda', quantity: 5, unit_price: 60, line_total: 300 },
    { invoice_id: 8, item_id: 11, description: 'Silla Tiffany', quantity: 40, unit_price: 25, line_total: 1000 },
    { invoice_id: 8, item_id: 15, description: 'Rockola con Bocina', quantity: 1, unit_price: 250, line_total: 250 },
  ];

  invoiceItems.forEach(ii => {
    db.prepare('INSERT INTO invoice_items (invoice_id, item_id, description, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)').run([ii.invoice_id, ii.item_id, ii.description, ii.quantity, ii.unit_price, ii.line_total]);
  });

  // Use today-relative dates for reminders (makes the demo always look current)
  const today = new Date().toISOString().split('T')[0];
  const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const tomorrow = addDays(today, 1);
  const in2Days = addDays(today, 2);
  const in3Days = addDays(today, 3);
  const in5Days = addDays(today, 5);
  const in7Days = addDays(today, 7);
  const in10Days = addDays(today, 10);
  const in14Days = addDays(today, 14);

  // Reminders (20)
  const reminders = [
    // Pre-event (5)
    { client_id: 1, invoice_id: 1, type: 'pre_event', reminder_date: today, message_template: 'Hola Fernanda! \ud83c\udf89 \u00a1Ma\u00f1ana es el gran d\u00eda! Estaremos llegando a Hidalgo 364 a las 8:00 AM para dejar todo listo.\n\n\u00a1Que lo disfruten mucho! \ud83c\udf88\ud83c\udf8a', status: 'Pendiente', priority: 'Alta' },
    { client_id: 2, invoice_id: 2, type: 'pre_event', reminder_date: tomorrow, message_template: 'Hola Esmeralda! \ud83d\udcc5 Te recuerdo que tu evento es pasado ma\u00f1ana. Estaremos llegando a las 2:00 PM para instalar todo en Col. Sol Naciente.\n\n\u00bfTodo bien para ese d\u00eda? \ud83d\udc4d', status: 'Pendiente', priority: 'Alta' },
    { client_id: 10, invoice_id: 3, type: 'pre_event', reminder_date: in5Days, message_template: 'Hola Sof\u00eda! \ud83d\udcc5 Te recuerdo que tu evento es este fin de semana. Estaremos llegando a las 11:00 AM para instalar todo en Iglesia del Carmen.\n\n\u00bfTodo confirmado? \ud83d\udc4d', status: 'Pendiente', priority: 'Normal' },
    { client_id: 1, invoice_id: 1, type: 'pre_event', reminder_date: yesterday, message_template: 'Hola Fernanda! \ud83d\udcc5 Te recuerdo que tu evento es pasado ma\u00f1ana (20 Feb). Estaremos llegando a las 8:00 AM para instalar todo en Hidalgo 364.\n\n\u00bfTodo bien para ese d\u00eda? \ud83d\udc4d', status: 'Enviado', priority: 'Alta' },
    { client_id: 3, invoice_id: 8, type: 'pre_event', reminder_date: in7Days, message_template: 'Hola Roberto! \ud83d\udcc5 Tu evento de XV A\u00f1os se acerca. Estaremos llegando a Sal\u00f3n Las Fuentes a las 5:00 PM.\n\n\u00bfTodo confirmado? \ud83d\udc4d', status: 'Pendiente', priority: 'Normal' },

    // Follow up quote (3)
    { client_id: 5, quote_id: 2, type: 'follow_up_quote', reminder_date: today, message_template: 'Hola Juan Carlos! \ud83d\udc4b Soy de Eventos Tany. Te mandamos una cotizaci\u00f3n hace unos d\u00edas para tu evento del 8 de Marzo. \u00bfTuviste oportunidad de revisarla? Si tienes alguna duda con gusto te ayudo. \ud83d\ude0a', status: 'Pendiente', priority: 'Normal' },
    { client_id: 6, quote_id: 3, type: 'follow_up_quote', reminder_date: yesterday, message_template: 'Hola Ana Gabriela! \ud83d\udc4b Soy de Eventos Tany. Te mandamos una cotizaci\u00f3n para el bautizo del 15 de Marzo. \u00bfTuviste oportunidad de revisarla? \ud83d\ude0a', status: 'Pendiente', priority: 'Normal' },
    { client_id: 6, quote_id: 3, type: 'follow_up_quote', reminder_date: in3Days, message_template: 'Hola Ana Gabriela! \ud83d\udc4b \u00bfYa tuviste chance de revisar la cotizaci\u00f3n para el bautizo? Si necesitas alg\u00fan cambio con gusto la ajustamos. \ud83d\ude0a', status: 'Pendiente', priority: 'Normal' },

    // Follow up prospect (3)
    { client_id: 3, type: 'follow_up_prospect', reminder_date: today, message_template: 'Hola Roberto! \ud83d\udc4b \u00bfQu\u00e9 tal? Te hab\u00edas acercado para preguntar sobre renta de brincolines para XV a\u00f1os. \u00bfYa tienes fecha para tu evento? Con gusto te cotizo sin compromiso. \ud83d\ude0a\ud83c\udf89', status: 'Pendiente', priority: 'Normal' },
    { client_id: 8, type: 'follow_up_prospect', reminder_date: in2Days, message_template: 'Hola Laura! \ud83d\udc4b \u00bfQu\u00e9 tal? Te hab\u00edas acercado para preguntar sobre renta de brincolines/mobiliario. \u00bfYa tienes fecha para tu evento? Con gusto te cotizo sin compromiso. \ud83d\ude0a\ud83c\udf89', status: 'Pendiente', priority: 'Normal' },
    { client_id: 8, type: 'follow_up_prospect', reminder_date: twoDaysAgo, message_template: 'Hola Laura! Somos Eventos Tany. Vi que preguntaste por precios. \u00bfTe gustar\u00eda una cotizaci\u00f3n formal? \ud83d\ude0a', status: 'Enviado', priority: 'Normal' },

    // Post event (2)
    { client_id: 4, invoice_id: 4, type: 'post_event', reminder_date: twoDaysAgo, message_template: 'Hola Mar\u00eda! \ud83d\ude0a Esperamos que hayan disfrutado mucho el evento de los gemelos. Fue un gusto atenderlos.\n\nSi nos pueden regalar una rese\u00f1a en nuestra p\u00e1gina se los agradecer\u00edamos mucho.\n\n\u00a1Para su pr\u00f3ximo evento ya saben que aqu\u00ed estamos! \ud83c\udf89', status: 'Enviado', priority: 'Normal' },
    { client_id: 7, invoice_id: 5, type: 'post_event', reminder_date: yesterday, message_template: 'Hola Pedro! \ud83d\ude0a Esperamos que hayan disfrutado mucho el evento. Fue un gusto atenderlos.\n\n\u00a1Para su pr\u00f3ximo evento ya saben que aqu\u00ed estamos! \ud83c\udf89', status: 'Pendiente', priority: 'Baja' },

    // Payment (2)
    { client_id: 1, invoice_id: 1, type: 'payment', reminder_date: today, message_template: 'Hola Fernanda! \ud83d\udccb Te recuerdo que para tu evento del 20 de Febrero queda un restante de $360.00 que se liquida al momento de la instalaci\u00f3n.\n\n\u00bfTodo confirmado para ese d\u00eda? \ud83d\udc4d', status: 'Pendiente', priority: 'Alta' },
    { client_id: 3, invoice_id: 8, type: 'payment', reminder_date: in5Days, message_template: 'Hola Roberto! \ud83d\udccb Te recuerdo que para tu evento del 10 de Marzo queda un restante de $1,300.00 que se liquida al momento de la instalaci\u00f3n.\n\n\u00bfTodo confirmado para ese d\u00eda? \ud83d\udc4d', status: 'Pendiente', priority: 'Normal' },

    // Special date (2)
    { client_id: 4, type: 'special_date', reminder_date: in10Days, message_template: 'Hola Mar\u00eda! \ud83c\udf82 Se acerca el Cumplea\u00f1os de gemelos y queremos ofrecerte un descuento especial para que lo festejen a lo grande con Eventos Tany.\n\n\ud83c\udf88 10% de descuento en renta de brincolines y mobiliario.\n\n\u00bfTe gustar\u00eda que te mande una cotizaci\u00f3n? \ud83d\ude0a', status: 'Pendiente', priority: 'Normal' },
    { client_id: 1, type: 'special_date', reminder_date: in14Days, message_template: 'Hola Fernanda! \ud83c\udf82 Se acerca el Cumplea\u00f1os de su hija y queremos ofrecerte un descuento especial para que lo festejen a lo grande con Eventos Tany.\n\n\ud83c\udf88 10% de descuento en renta de brincolines y mobiliario.\n\n\u00bfTe gustar\u00eda que te mande una cotizaci\u00f3n? \ud83d\ude0a', status: 'Pendiente', priority: 'Normal' },

    // Recontact (1)
    { client_id: 9, type: 'recontact', reminder_date: in7Days, message_template: 'Hola Carlos! \ud83d\udc4b Soy de Eventos Tany. \u00bfC\u00f3mo est\u00e1n? Hace tiempo que no sabemos de ustedes.\n\nTenemos brincolines nuevos y promociones especiales este mes. Si tienen alg\u00fan evento pr\u00f3ximo con gusto les cotizo. \ud83c\udf89', status: 'Pendiente', priority: 'Baja' },

    // Custom (1)
    { client_id: 2, type: 'custom', reminder_date: tomorrow, message_template: 'Confirmar con Esmeralda direcci\u00f3n exacta y acceso para la camioneta de entrega.', status: 'Pendiente', priority: 'Alta' },
  ];

  reminders.forEach(r => {
    db.prepare('INSERT INTO reminders (client_id, invoice_id, quote_id, type, reminder_date, message_template, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run([r.client_id, r.invoice_id || null, r.quote_id || null, r.type, r.reminder_date, r.message_template, r.status, r.priority]);
  });

  // Message Templates (10)
  const templates = [
    { name: 'Seguimiento de cotizaci\u00f3n', type: 'follow_up_quote', template: 'Hola {nombre}! \ud83d\udc4b Soy de Eventos Tany. Te mandamos una cotizaci\u00f3n hace unos d\u00edas para tu evento del {fecha_evento}. \u00bfTuviste oportunidad de revisarla? Si tienes alguna duda con gusto te ayudo. \ud83d\ude0a' },
    { name: 'Confirmaci\u00f3n de reserva', type: 'pre_event', template: 'Hola {nombre}! \ud83c\udf89 Te confirmo tu reservaci\u00f3n para el {fecha_evento}:\n\n{articulos}\n\nTotal: ${total}\nAnticipo: ${anticipo}\nRestante: ${restante}\n\nDirecci\u00f3n de entrega: {direccion}\nHorario: {horario}\n\n\u00a1Nos vemos el d\u00eda del evento! \ud83c\udf88' },
    { name: 'Recordatorio 2 d\u00edas antes', type: 'pre_event', template: 'Hola {nombre}! \ud83d\udcc5 Te recuerdo que tu evento es pasado ma\u00f1ana ({fecha_evento}). Estaremos llegando a las {horario} para instalar todo en {direccion}.\n\n{pendiente_pago}\n\n\u00bfTodo bien para ese d\u00eda? \ud83d\udc4d' },
    { name: 'Recordatorio d\u00eda anterior', type: 'pre_event', template: 'Hola {nombre}! \ud83c\udf89 \u00a1Ma\u00f1ana es el gran d\u00eda! Estaremos llegando a {direccion} a las {horario} para dejar todo listo.\n\n{pendiente_pago}\n\n\u00a1Que lo disfruten mucho! \ud83c\udf88\ud83c\udf8a' },
    { name: 'Agradecimiento post-evento', type: 'post_event', template: 'Hola {nombre}! \ud83d\ude0a Esperamos que hayan disfrutado mucho el evento. Fue un gusto atenderlos.\n\nSi nos pueden regalar una rese\u00f1a en nuestra p\u00e1gina se los agradecer\u00edamos mucho.\n\n\u00a1Para su pr\u00f3ximo evento ya saben que aqu\u00ed estamos! \ud83c\udf89' },
    { name: 'Fecha especial', type: 'special_date', template: 'Hola {nombre}! \ud83c\udf82 Se acerca el {special_date_label} y queremos ofrecerte un descuento especial para que lo festejen a lo grande con Eventos Tany.\n\n\ud83c\udf88 10% de descuento en renta de brincolines y mobiliario.\n\n\u00bfTe gustar\u00eda que te mande una cotizaci\u00f3n? \ud83d\ude0a' },
    { name: 'Re-contactar cliente antiguo', type: 'recontact', template: 'Hola {nombre}! \ud83d\udc4b Soy de Eventos Tany. \u00bfC\u00f3mo est\u00e1n? Hace tiempo que no sabemos de ustedes.\n\nTenemos brincolines nuevos y promociones especiales este mes. Si tienen alg\u00fan evento pr\u00f3ximo con gusto les cotizo. \ud83c\udf89' },
    { name: 'Recordatorio de pago restante', type: 'payment', template: 'Hola {nombre}! \ud83d\udccb Te recuerdo que para tu evento del {fecha_evento} queda un restante de ${restante} que se liquida al momento de la instalaci\u00f3n.\n\n\u00bfTodo confirmado para ese d\u00eda? \ud83d\udc4d' },
    { name: 'Cotizaci\u00f3n inicial', type: 'follow_up_prospect', template: 'Hola {nombre}! \ud83d\ude0a Gracias por tu inter\u00e9s en Eventos Tany. Te paso la cotizaci\u00f3n para tu evento:\n\n{articulos}\n\nTotal: ${total}\n\nEl anticipo es de ${anticipo_sugerido} para apartar la fecha. \u00bfTe gustar\u00eda reservar? \ud83c\udf88' },
    { name: 'Seguimiento a prospecto', type: 'follow_up_prospect', template: 'Hola {nombre}! \ud83d\udc4b \u00bfQu\u00e9 tal? Te hab\u00edas acercado para preguntar sobre renta de brincolines/mobiliario. \u00bfYa tienes fecha para tu evento? Con gusto te cotizo sin compromiso. \ud83d\ude0a\ud83c\udf89' },
  ];

  templates.forEach(t => {
    db.prepare('INSERT INTO message_templates (name, type, template) VALUES (?, ?, ?)').run([t.name, t.type, t.template]);
  });
}

module.exports = { seedDatabase };
