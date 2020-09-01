// import dependencies and initialize express
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config()
const MessagingResponse = require('twilio').twiml.MessagingResponse;


const twiml = new MessagingResponse();

const healthRoutes = require('./routes/health-route');
const swaggerRoutes = require('./routes/swagger-route');

const app = express();

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const myNumber = process.env.MY_NUMBER
const restaurantNumber = process.env.RESTAURANT_NUMBER
const client = require('twilio')(accountSid, authToken);


var customers = [];

// enable parsing of http request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes and api calls
app.use('/health', healthRoutes);
app.use('/swagger', swaggerRoutes);

app.post('/submit-form', (req, res) => {
  const customerName = req.body.name
  const pickupTime = req.body.pickupTime
  const meal = req.body.meal
  const phoneNumber = "+1" + req.body.phoneNumber
    customers.push({
      customerName: customerName,
      pickupTime: pickupTime,
      meal: meal,
      phoneNumber: phoneNumber,
    })

    console.log(`Customer order received: the username is ${customerName}`)
    var customerMsg = `Twilio: Hi ${customerName}, your order is received. It will be ready at ${pickupTime}`
    console.log("debug: customerMsg", customerMsg)


    client.messages
      .create({
         body: customerMsg,
         from: '+1' + myNumber,
         to: phoneNumber
       })
      .then(message => console.log(message.sid));

  res.end()
})

app.post('/twilio/newdata', (req, res) =>{
  console.log(req.body)

  // tell the restaurant that we're in parking space 4
  var textMessage = req.body.Body
  var parkingSpace = parseInt(textMessage)
  if (0 < parkingSpace && parkingSpace < 10) {
    var fromNumber = req.body.From
    var customer = customers.find(e => e.phoneNumber == fromNumber)
    console.log("DEBUG customer:", customer)
    var msg = `Bring out ${customer.meal} for ${customer.customerName} in parking space ${parkingSpace}`
    console.log("DEBUG msg:", msg)
    client.messages
      .create({
         body: msg,
         from: '+1' + myNumber,
         to: '+1' + restaurantNumber,
       })
      .then(message => console.log(message.sid));
  }



  res.send("We'll be right out")
})


// default path to serve up index.html (single page application)
app.all('', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../public', 'index.html'));
});


// start node server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App UI available http://localhost:${port}`);
  console.log(`Swagger UI available http://localhost:${port}/swagger/api-docs`);
});

// error handler for unmatched routes or api calls
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../public', '404.html'));
});

module.exports = app;
