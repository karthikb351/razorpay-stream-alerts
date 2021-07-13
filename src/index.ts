import express from "express";
import { read } from "fs";
import { streamlabsClient } from "./lib";

var mustacheExpress = require('mustache-express');

let app = express();


// Register '.mst' extension with The Mustache Express
app.engine('mst', mustacheExpress());

app.set('view engine', 'mst');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
  res.send("We're running!");
});

app.get('/streamlabs', (req, res) => {
  res.redirect(streamlabsClient.authorizationUrl())
})

app.get('/donate', async (req, res) => {
  res.render('donate');
})

app.post('/donate/submit', async (req, res) => {
  try {
    const name = req.body['name'];
    const amount = req.body['amount'];
    const message = req.body['message'];
    await streamlabsClient.donations.add({
      name: name,
      identifier: 'anon@mous.com',
      amount: amount,
      currency: 'INR',
      message: message
    });
  } catch (e) {
    res.send("whoops.")
  }
})


app.get('/streamlabs/redirect', async (req, res) => {

  let { code } = req.query;

  let response = await streamlabsClient.connect(code);

  // save streamlabs credentials to database, generate a unique webhook token for this account
  let webhook_token = "somerandomvalue";

  // Return back to the user that endpoint they should setup on razorpay
  res.render('setup', { name: response.user.username, razorpay_webhook_url: `https://karthikb351-razorpay-stream-alerts-94jg9x6cxpxr-8080.githubpreview.dev/razorpay/webhook/${webhook_token}` })
});

app.post('/razorpay/webhook/:webhook_token', async (req, res) => {

  const data = req.body;
  if (data?.event !== "payment.captured") {
    console.log("Unrelated event type, ignoring.")
    res.send("ok!")
    return;
  }

  let { name, email, message } = data.payload.payment.entity.notes;
  let amount = (data.payload.payment.entity.amount / 100).toFixed(2);
  let currency = data.payload.payment.entity.currency;
  await streamlabsClient.donations.add({
    name: name,
    identifier: email,
    amount: amount,
    currency: currency,
    message: message
  });

  // Razorpay will call us when there is a payment made
  // We lookup streamlabs credentials for this razorpay account
  // Trigger a donation with the information from razorpay's payment object
  res.send("ok!")
})

exports.rzpalerts = app;
