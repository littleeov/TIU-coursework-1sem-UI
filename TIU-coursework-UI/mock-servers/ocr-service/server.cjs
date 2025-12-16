const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock-servers/ocr-service/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Распознавание текста
server.post('/ocr/recognize', (req, res) => {
  const { file } = req.body;
  // В реальности тут будет обработка файла, но мы возвращаем фиктивный результат
  const recognizedText = `Результат распознавания текста из файла ${file?.name || 'unknown.pdf'}:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;

  const result = {
    id: Date.now().toString(),
    text: recognizedText
  };

  router.db.get('ocr_results').push(result).write();
  res.status(200).json({ text: recognizedText });
});

server.use(router);
server.listen(3002, () => {
  console.log('OCR Service Mock запущен на http://localhost:3002');
});