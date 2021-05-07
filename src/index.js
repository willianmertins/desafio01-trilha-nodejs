const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (value) => value.username === username
  );

  if (!user){
    return response.status(400).json( {error: "Usuário não encontrado"} );
  }

  request.user = user;
  return next();

}

function checksTodoIdExist(request, response, next){
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find( todo => todo.id === id);

  if (!todo){
    return response.status(401).json( {error: "Todo não encontrado"});
  }

  request.todo = todo;
  return next();

}

app.post('/users', (request, response) => {
  const { name,username } = request.body;

  const user = users.find(
    (user) => user.username === username
  );

  if(user){
    return response.status(400).json( {error: "Usuário já cadastrado"} );
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json({message: "Conta criada com sucesso!"});

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title,deadline } = request.body;

  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json({message: "Criado com sucesso!"});

});

app.put('/todos/:id', checksExistsUserAccount, checksTodoIdExist, (request, response) => {
  const { title,deadline } = request.body;
  const { user, todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).send();

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksTodoIdExist, (request, response) => {
  const { user, todo } = request;

  todo.done = true;

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const idTodo = user.todos.findIndex( todo => todo.id === id);

  if (idTodo === -1){
    return response.status(401).json({ error: "Todo não encontrado"});
  }

  user.todos.splice(idTodo,1);
  
  return response.status(201).send();

});

module.exports = app;