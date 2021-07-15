import {config} from './config';
import {setCredentialsToAccount} from './lib';

const streamlabsAPI = require('streamlabs');

export class StreamlabsUserClient {
  client: any;
  account: any;
  constructor(account) {
    this.account = account;
    this.client = StreamlabsUserClient.createClient();
  }

  static createClient() {
    return new streamlabsAPI({
      clientId: config.streamlabs.client_id,
      clientSecret: config.streamlabs.client_secret,
      redirectUrl: `${config.base_url}/streamlabs/redirect`,
      scopes: 'donations.create',
    });
  }

  static async connect(code) {
    const client = StreamlabsUserClient.createClient();
    return await client.connect(code);
  }

  static authorizationUrl() {
    const client = StreamlabsUserClient.createClient();
    return client.authorizationUrl();
  }

  async handleAccessTokenExpiry() {
    if (
      this.account.streamlabs_expires_at &&
      this.account.streamlabs_expires_at < new Date().getTime() / 1000
    ) {
      const response = await this.client.reconnect(this.account.refresh_token);
      setCredentialsToAccount(
        this.account,
        response.accessToken,
        response.refreshToken,
        response.expiresIn
      );
      await this.account.save();
    }
  }

  async addDonation(
    name: string,
    amount: string,
    currency: string,
    message: string,
    email: string
  ) {
    await this.handleAccessTokenExpiry();
    return this.client.donations.add({
      name: name,
      identifier: email,
      amount: amount,
      currency: currency,
      message: message,
    });
  }
}
