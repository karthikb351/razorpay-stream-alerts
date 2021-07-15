import {config} from './config';

import crypto from 'crypto';

// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');

const {Gstore} = require('gstore-node');

// Creates a client
export const datastore = new Datastore({namespace: config.environment});

export const gstore = new Gstore();

gstore.connect(datastore);

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const setCredentialsToAccount = (
  account,
  accessToken,
  refreshToken,
  expiresIn
) => {
  account.streamlabs_access_token = accessToken;
  account.streamlabs_refresh_token = refreshToken;
  account.streamlabs_expires_at = new Date().getTime() + expiresIn * 1000;
  return account;
};
