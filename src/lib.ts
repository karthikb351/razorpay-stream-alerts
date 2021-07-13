import { config } from "./config";

let streamlabsAPI = require('streamlabs');

export const streamlabsClient = new streamlabsAPI({
    clientId: config.streamlabs.client_id,
    clientSecret: config.streamlabs.client_secret,
    redirectUrl: `${config.base_url}/streamlabs/redirect`,
    scopes: 'donations.create',
})