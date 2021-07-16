# Razorpay Stream Alerts

Get donation alerts to via Streamlabs, using your own Razorpay account



# To Do
- [x] Setup a streamlabs application with credentials
- [x] Implement the OAuth flow for a streamslab account
- [x] Setup templating with mustache
- [x] Setup ORM on datastore to store streamlab credentials and account information
- [x] Provide a webhook endpoint for the user to setup on Razorpay
- [x] Consume webhook and call the donation API on streamlabs
- [x] Configure deployment and build steps for production
- [ ] Write wiki/readme on how to configure Razorpay's payment pages (with the required fields, etc.)
- [ ] Get LordOfSarcasm to use this on his stream!
- [ ] Setup build step what copies templates and runs typescript compiler (with --watch mode)
- [x] Explore setting up a custom domain for this cloud function (requires a load balancer, which is expensive, so parking this for now)
- [ ] File issue for google's deploy action not showing an error when cloud build API isn't enabled

