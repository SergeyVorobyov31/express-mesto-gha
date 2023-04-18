const Card = require('../models/card');

module.exports.getCard = (req, res) => {
  Card.find({})
  .populate(['name', 'link'])
  .then(card => res.status(200).send({data: card}))
  .catch(err => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Карточка с таким id не найдена."});
    } else if (err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.createCard = (req, res) => {
  const owner = req.user._id;
  const {name, link} = req.body;
  Card.create({name, link, owner})
  .then((newCard) => {
    res.status(200).send(newCard);
  })
  .catch((err) => {
    if(err.name === 'NotFound') {
      res.status(404).send({message: "Карточка с таким id не найдена."});
    } else if (err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Введены некоректные данные."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
};

module.exports.deleteCard = (req, res) => {
  const cardId = req.params.cardId
  Card.findByIdAndRemove(cardId)
  .then((card) => {
    if(!card) {
      res.status(400).send({message: "Карточка не найдена"});
      return
    }
    res.status(200).send(card);
    console.log("Карточка успешно удалена");
  })
  .catch(err => {
    if(err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Данная карточка не найдена."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.likeCard = (req, res) => {
  const { cardId }  = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
  .populate('owner')
  .then((like) => {
    if(!like) {
      res.status(400).send({message: "Данная карточка не найдена"});
      return
    }
    res.status(200).send(like);
  })
  .catch(err => {
    if(err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Данная карточка не найдена."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}

module.exports.dislikeCard = (req, res) => {
  const { cardId }  = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
  .populate('owner')
  .then((like) => {
    if(!like) {
      res.status(400).send({message: "Данная карточка не найдена"});
      return
    }
    res.status(200).send(like);
  })
  .catch(err => {
    if(err.name === "CastError" || "ValidatorError") {
      res.status(400).send({message: "Данная карточка не найдена."});
    } else {
      res.status(500).send({message: "Ошибка на сервере."});
    }
  });
}