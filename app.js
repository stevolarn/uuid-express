// app.js

const http = require('http');
const uuidv7 = require('uuidv7');
const uuid = require('uuid');
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const pg = require('pg');
const morgan = require('morgan')

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  reconnectTimeoutMillis: 1000, // Retry after 1 second
});

const app = express();

var bodyParser = require('body-parser')

// Create a router
const petsRouter = express.Router();

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(jsonParser);
app.use(morgan('dev'))

// Create route
app.post('/storejson', jsonParser, async (req, res) => {
  const json_field = req.body;

  const id = uuidv7.uuidv7()  

  const query = `INSERT INTO json_data_table (id, json_field ) VALUES ($1, $2)`;
  const values = [id, json_field];

  const client = await pool.connect();
  await client.query(query, values);
  client.release();

  res.status(201).json({id:id, success:true});
});

// Read route
app.get('/storejson', async (req, res) => {
  

  const query = `SELECT * FROM json_data_table`;

  const client = await pool.connect();
  const data = await client.query(query);
  client.release();


  res.send(data.rows);
});

// Read route
app.get('/storejson/:uuid', async (req, res) => {
  
  try{

    const uuid = req.params.uuid

    const query = `SELECT * FROM json_data_table WHERE id = '${uuid}'`;

    const client = await pool.connect();
    const data = await client.query(query);
    client.release();

    res.send(data.rows);

  } catch (error){
    console.error(error)
  }

});

const postPetMiddleware = async (req, res, next) => {
  // Get the JSON data from the request body
  
  try{

  const petData = req.body;

  // Make a POST request to the Petstore REST API to create a new pet
  const response = await fetch('https://petstore.swagger.io/v2/pet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });

  // Check the response status code
  if (response.status !== 200) {
    throw new Error(`Failed to create pet in Petstore REST API: ${response.status}`);
  }

  } catch (error){
    //const errorBody = await error.response.text();
    console.error(`Error body: ${error}`);
  }

  // Next middleware
  next();
};

app.post('/petstore', postPetMiddleware, function (req, res) {
  // Send a success response to the client
  res.status(200).send('Pet created successfully!');
});

// // Define a route handler that uses Fetch to make a POST request to an external API
// app.post('/pets', jsonParser, async (req, res) => {
//   // Get the JSON data from the request body
//   const petData = req.body;

//   // Make a POST request to the Petstore REST API to create a new pet
//   const response = await fetch('https://petstore.swagger.io/v2/pet', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(petData),
//   });

//   // Check the response status code
//   if (response.status !== 200) {
//     throw new Error(`Failed to create pet in Petstore REST API: ${response.status}`);
//   }

//   // Send a success response to the client
//   res.status(201).send('Pet created successfully!');
// });

const getPetsMiddleware =  async (req, res, next) => {

  try{

    const id = req.params.id;

    // Make a request to the Petstore REST API to get all pets
    const response = await fetch(`https://petstore.swagger.io/v2/pet/${id}`);

    // Check the response status code
    if (response.status !== 200) {
      throw new Error(`Failed to get pets from Petstore REST API: ${response.status}`);
    }

    // Parse the response body
    const pets = await response.json();

    // Attach the pets data to the request object
    req.pets = pets;

  } catch (error){
    //const errorBody = await error.response.text();
    console.error(`Error body: ${error}`);
  }

  // Next middleware
  next();
};

//app.use(getPetsMiddleware);

app.get('/petstore/:id', getPetsMiddleware, function (req, res) {
  // Get the pets data from the request object
  const pets = req.pets;

  // Send the pets data to the client
  res.send(pets);
});

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