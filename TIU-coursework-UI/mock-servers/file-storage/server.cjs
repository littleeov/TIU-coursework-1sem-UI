const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock-servers/file-storage/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Загрузка файла
server.post('/files/upload', (req, res) => {
  const { name, size, date } = req.body;
  const newFile = {
    id: Date.now().toString(),
    name: name || 'unnamed.pdf',
    size: size || '1.0 MB',
    date: date || new Date().toISOString().split('T')[0]
  };

  router.db.get('files').push(newFile).write();
  res.status(201).json(newFile);
});

// Поиск файлов
server.get('/files/search', (req, res) => {
  const { name } = req.query;
  const files = router.db.get('files').value();
  if (name) {
    const results = files.filter(f => f.name.toLowerCase().includes(name.toLowerCase()));
    return res.json(results);
  }
  res.json(files);
});

// Удаление файла
server.delete('/files/:id', (req, res) => {
  const id = req.params.id;
  const files = router.db.get('files').value();
  const fileIndex = files.findIndex(f => f.id === id);
  if (fileIndex !== -1) {
    router.db.get('files').removeById(id).write();
    res.status(200).json({ message: 'Файл успешно удален' });
  } else {
    res.status(404).json({ error: 'Файл не найден' });
  }
});

// Сохранение файла (заглушка)
server.post('/files/:id/save', (req, res) => {
  const id = req.params.id;
  const files = router.db.get('files').value();
  const file = files.find(f => f.id === id);
  if (file) {
    res.status(200).json({ message: 'Файл успешно сохранен' });
  } else {
    res.status(404).json({ error: 'Файл не найден' });
  }
});

server.use(router);
server.listen(3000, () => {
  console.log('File Storage Service Mock запущен на http://localhost:3000');
});