const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({
  origin: '*'
}));

app.use('/songs', express.static(path.join(__dirname, 'songs')));

app.get('/songs/:folder/info.json', (req, res) => {
  const folder = req.params.folder;
  res.sendFile(path.join(__dirname, 'songs', folder, 'info.json'));
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

module.exports = app;