const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({
  origin: '*'
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/songs', express.static(path.join(__dirname, 'songs')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;