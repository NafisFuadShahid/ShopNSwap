import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe.js with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// CheckoutForm handles the payment UI and submission
const CheckoutForm = ({ amount, adId, currency = 'BDT' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // 1) Create a PaymentIntent on the server
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, adId }),
    });
    const { clientSecret, error: intentError } = await response.json();
    if (intentError) {
      setMessage(intentError);
      setLoading(false);
      return;
    }

    // 2) Confirm the card payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      setMessage('Payment successful!');
      // TODO: handle post-payment logic (e.g. mark ad sold)
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement options={{ hidePostalCode: true }} />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`}
      </button>
      {message && <p className="text-sm text-red-500">{message}</p>}
    </form>
  );
};

// StripePayment wraps CheckoutForm in Elements
const StripePayment = ({ amount, adId, currency }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm amount={amount} adId={adId} currency={currency} />
  </Elements>
);

export default StripePayment;
