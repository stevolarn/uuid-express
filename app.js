// app.js

const http = require('http');
const uuidv7 = require('uuidv7');
const uuid = require('uuid');
const express = require('express');

const app = express();
var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Validate
app.post('/uuid/validate', jsonParser, function (req, res) {
  const input = req.body.uuid
  res.json({isuuid:uuid.validate(input)});
});

// Check Version
app.post('/uuid/version', jsonParser, function (req, res) {
  const input = req.body.uuid
  res.json({isuuid:uuid.version(input)});
});

// Get all uuids
app.get('/uuid', (req, res) => {

  res.json({uuid1:uuid.v1(),uuid4:uuid.v4(),uuid7:uuidv7.uuidv7()});
});


// Get all users
app.get('/uuid/:version', (req, res) => {
  // Get all user records from the database
  
  switch (req.params.version) {
    case "v1":
      res.json({uuid:uuid.v1()});    
      break;
    case "v4":
      res.json({uuid:uuid.v4()});    
      break;
    case "v7":
      res.json({uuid:uuidv7.uuidv7()});    
      break;
    default:
      res.status(404).send()
      
  }
});

// // Get a single user by ID
// app.get('/users/:id', (req, res) => {
//   // Get the user record with the specified ID from the database
//   const user = User.findById(req.params.id);

//   res.json(user);
// });

// // Update a user
// app.put('/users/:id', (req, res) => {
//   // Update the user record with the specified ID in the database
//   const user = User.findByIdAndUpdate(req.params.id, req.body);

//   res.json(user);
// });

// // Delete a user
// app.delete('/users/:id', (req, res) => {
//   // Delete the user record with the specified ID from the database
//   User.findByIdAndDelete(req.params.id);

//   res.status(204).send();
// });

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});