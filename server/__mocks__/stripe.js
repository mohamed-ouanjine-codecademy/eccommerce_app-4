// server/__mocks__/stripe.js
export default () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_mock_123',
      status: 'succeeded',
      client_secret: 'secret_mock_abc'
    })
  }
});