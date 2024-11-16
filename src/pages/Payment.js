import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "./CheckoutPage"; // Adjusted relative import path based on non-Next.js project structure

// Ensure Stripe public key is provided
if (!process.env.REACT_APP_STRIPE_PUBLIC_KEY) {
  throw new Error("REACT_APP_STRIPE_PUBLIC_KEY is not defined");
}

// Load the Stripe public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Payment = () => {
  const location = useLocation();
  const { ad } = location.state || {}; // Get ad details from the passed state
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Check if ad data is valid and fetch payment intent
    if (ad && ad.price) {
      fetch("/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: ad.price * 100 }), // Convert price to sub-currency (e.g., cents for USD)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            console.error("Failed to fetch client secret:", data);
          }
        })
        .catch((error) => console.error("Error fetching payment intent:", error));
    }
  }, [ad]);

  // Render error if no ad details are available
  if (!ad) {
    return (
      <main className="text-center mt-20">
        <h1 className="text-2xl font-bold">No product selected for payment</h1>
        <p>Please go back and select a product to proceed with payment.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-blue-500 to-purple-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2">{ad.title}</h1>
        <h2 className="text-2xl">
          Total Price:{" "}
          <span className="font-bold">{Number(ad.price).toLocaleString()} BDT</span>
        </h2>
      </div>

      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutPage amount={ad.price} />
        </Elements>
      ) : (
        <p>Loading payment details...</p>
      )}
    </main>
  );
};

export default Payment;
