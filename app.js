const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1/mestodb').then(() => console.log('Успешное подключение к MongoDB')).catch((err) => console.error('Ошибка подключения:', err));

app.use((req, res, next) => {
  req.user = {
    _id: '643ab8febfc6f3eba6567790',
  };

  next();
});

app.use('/users', require('./routes/users'));

app.use('/cards', require('./routes/cards'));

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Данного маршрута не существует' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
