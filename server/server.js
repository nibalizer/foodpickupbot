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
const client = require('twilio')(accountSid, authToken);

// enable parsing of http request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes and api calls
app.use('/health', healthRoutes);
app.use('/swagger', swaggerRoutes);

app.post('/submit-form', (req, res) => {
  const customerName = req.body.name
  const pickupTime = req.body.pickupTime
  const phoneNumber = req.body.phoneNumber
    console.log(`Customer order recieved: the username is ${customerName}`)
    var customerMsg = `Twilio: Hi ${customerName}, your order is recieved. It will be ready at ${pickupTime}`
    console.log("debug: customerMsg", customerMsg)


    client.messages
      .create({
         body: customerMsg,
         from: '+1' + myNumber,
         to: '+1' + phoneNumber
       })
      .then(message => console.log(message.sid));

  res.end()
})

/*
ToCountry: 'US',
ToState: 'MN',
SmsMessageSid: 'SM76144d7c789fc03cde59c17a45d072b6',
NumMedia: '0',
ToCity: 'STAPLES'
FromZip: '92106',
SmsSid: 'SM76144d7c789fc03cde59c17a45d072b6',
FromState: 'CA',
SmsStatus: 'received',
FromCity: 'SAN DIEGO',
Body: 'Test ',
FromCountry: 'US',
To: '+12182969208',
ToZip: '56479',
NumSegments: '1',
MessageSid: 'SM76144d7c789fc03cde59c17a45d072b6',
AccountSid: 'AC59060ed343ba7e3f737692404377fce3',
From: '+16199807820',
ApiVersion: '2010-04-01'
*/

app.post('/twilio/newdata', (req, res) =>{
  console.log(req.body)
  res.send(200)
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
