import Schema from 'gstore-node/lib/schema';
import {gstore} from '../lib';

/**
 * Create the schema for the Account Model
 */
const accountSchema = new Schema({
  streamlabs_id: {type: String, required: true},
  streamlabs_access_token: {
    type: String,
    required: true,
    excludeFromIndexes: true,
  },
  streamlabs_refresh_token: {
    type: String,
    required: true,
    excludeFromIndexes: true,
  },
  streamlabs_expires_at: {
    type: Number,
    optional: true,
    excludeFromIndexes: true,
  },
  razorpay_webhook_token: {type: String, required: true},
});

export const AccountModel = gstore.model('Account', accountSchema);
