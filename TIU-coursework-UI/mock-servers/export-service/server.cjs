const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock-servers/export-service/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Экспорт таблицы (возвращает blob-заглушку)
server.get('/tables/:id/export', (req, res) => {
  const id = req.params.id;
  // В реальности тут будет генерация Excel-файла, но мы возвращаем JSON
  res.status(200).json({
    message: 'Экспорт таблицы с ID ' + id + ' выполнен успешно',
    id: id
  });
});

server.use(router);
server.listen(3003, () => {
  console.log('Export Service Mock запущен на http://localhost:3003');
});