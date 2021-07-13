
export interface Account {
    id: string;
    streamlabs: {
        id: string; // Account id on streamlabs (used for lookup)
        access_token: string;
        refresh_token: string;
        expires_at: number;
    }
    razorpay: {
        webhook_token: string; // Randomly generated unique value (used for lookup)
    }
}