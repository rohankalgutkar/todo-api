const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

var {
  mongoose
} = require('./db/mongoose');
var {
  Todo
} = require('./models/todo');
var {
  User
} = require('./models/user');
var {
  ObjectID
} = require('mongodb');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    })
  }, (e) => {
    res.status(400).send(e);
  });
});

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  // validating the ID
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {
    $set: body
  }, {
    new: true
  }).then((todo) => {
    if (!todo) {
      res.status(404).send();
    }
    res.send({
      todo
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// User Routes
app.post('/users', (req, res) => {

  var body = _.pick(req.body, ['email','password'])
  var user = new User(body);

  user.save().then((user) => {
    res.send(user);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started on Port ${port}`);
});

module.exports = {
  app
};
