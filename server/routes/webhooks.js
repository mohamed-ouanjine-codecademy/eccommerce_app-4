// /server/routes/webhooks.js
router.post('/stripe', 
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook.bind(webhookController)
);