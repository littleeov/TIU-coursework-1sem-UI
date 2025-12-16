const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock-servers/table-storage/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Загрузка таблицы
server.post('/tables/upload', (req, res) => {
  const { name, size, date } = req.body;
  const newTable = {
    id: Date.now().toString(),
    name: name || 'unnamed.xlsx',
    size: size || '1.0 MB',
    date: date || new Date().toISOString().split('T')[0]
  };

  router.db.get('tables').push(newTable).write();
  res.status(201).json(newTable);
});

// Поиск таблиц
server.get('/tables/search', (req, res) => {
  const { name } = req.query;
  const tables = router.db.get('tables').value();
  if (name) {
    const results = tables.filter(t => t.name.toLowerCase().includes(name.toLowerCase()));
    return res.json(results);
  }
  res.json(tables);
});

// Удаление таблицы
server.delete('/tables/:id', (req, res) => {
  const id = req.params.id;
  const tables = router.db.get('tables').value();
  const tableIndex = tables.findIndex(t => t.id === id);
  if (tableIndex !== -1) {
    router.db.get('tables').removeById(id).write();
    res.status(200).json({ message: 'Таблица успешно удалена' });
  } else {
    res.status(404).json({ error: 'Таблица не найдена' });
  }
});

// Экспорт таблицы (заглушка)
server.get('/tables/:id/export', (req, res) => {
  const id = req.params.id;
  const tables = router.db.get('tables').value();
  const table = tables.find(t => t.id === id);
  if (table) {
    res.status(200).json({ message: 'Файл экспортирован', name: table.name });
  } else {
    res.status(404).json({ error: 'Таблица не найдена' });
  }
});

server.use(router);
server.listen(3001, () => {
  console.log('Table Storage Service Mock запущен на http://localhost:3001');
});