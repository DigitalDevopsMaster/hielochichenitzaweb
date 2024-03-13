
const express = require('express');
const fs = require('fs');
const path = require('path');
const host = '0.0.0.0';
const rootPath = path.join(__dirname, '');

/************************************************************************ */

const app = express();
const port = 3001;

app.use(express.static(rootPath));
app.use(express.static(path.join(__dirname, '../')));
app.get('/api/html-list', (req, res) => {
  const htmlFiles = fs.readdirSync(rootPath).filter(file => path.extname(file) === '.html');
  res.json({ htmlFiles });
});

app.get('*.js', (req, res, next) => {
  res.type('application/javascript'); // Establecer el tipo MIME correcto
  next();
});

app.get(/^\/(?!.*\.js$).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.listen(port, host, () => console.log(`Servidor web local en ejecución en http://${host}:${port}`));

/************************************************************************** */
