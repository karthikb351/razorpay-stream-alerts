import express from 'express';
import {config} from './config';
import {generateRandomToken, setCredentialsToAccount} from './lib';
import {logger} from './logger';
import {AccountModel} from './model/Account';
import {StreamlabsUserClient} from './streamlabs';

const mustacheExpress = require('mustache-express');

const app = express();

// Register '.mst' extension with The Mustache Express
app.engine('mst', mustacheExpress());

app.set('view engine', 'mst');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
  res.send("We're running!");
});

app.get('/streamlabs', (req, res) => {
  res.redirect(StreamlabsUserClient.authorizationUrl());
});

app.get('/streamlabs/redirect', async (req, res) => {
  const {code} = req.query;

  const response = await StreamlabsUserClient.connect(code);

  const {accessToken, refreshToken, expiresIn} = response;

  let account;
  try {
    account = await AccountModel.findOne({
      streamlabs_id: response.user.streamlabs.id.toString(),
    });
  } catch (e) {
    logger.info(
      'No account found for this streamlabs user, creating a new one'
    );
  }
  if (!account) {
    account = new AccountModel();
    account.streamlabs_id = response.user.streamlabs.id.toString();
    account.razorpay_webhook_token = generateRandomToken();
  }

  setCredentialsToAccount(account, accessToken, refreshToken, expiresIn);

  try {
    await account.save();
  } catch (e) {
    logger.error(e);
    logger.info("we shouldn't be here");
  }
  // Return back to the user that endpoint they should setup on razorpay
  res.render('setup', {
    name: response.user.username,
    razorpay_webhook_url: `${config.base_url}/razorpay/webhook/${account.razorpay_webhook_token}`,
  });
});

app.post('/razorpay/webhook/:webhook_token', async (req, res) => {
  const data = req.body;
  if (data?.event !== 'payment.captured') {
    logger.info('Unrelated event type, ignoring.');
    res.send('ok!');
    return;
  }

  const {name, email, message} = data.payload.payment.entity.notes;

  if (!name || !email || !message) {
    logger.info('Invalid notes in razorpay payment object, ignoring');
    res.send('ok');
    return;
  }
  let account;
  try {
    account = await AccountModel.findOne({
      razorpay_webhook_token: req.params.webhook_token,
    });
  } catch (e) {
    logger.info('No account found for this razorpay webhook token. Ignoring.');
    res.send('ok');
    return;
  }
  const amount = (data.payload.payment.entity.amount / 100).toFixed(2);
  const currency = data.payload.payment.entity.currency;

  const streamlabsClient = new StreamlabsUserClient(account);

  await streamlabsClient.addDonation(name, amount, currency, message, email);

  // Razorpay will call us when there is a payment made
  // We lookup streamlabs credentials for this razorpay account
  // Trigger a donation with the information from razorpay's payment object
  res.send('ok!');
});

exports.rzpalerts = app;
