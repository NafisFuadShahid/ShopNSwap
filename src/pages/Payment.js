import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/react-stripe-js";
import CheckoutPage from "./CheckoutPage";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Payment = () => {
  const location = useLocation();
  const { ad } = location.state || {}; // Ensure ad data is passed via state
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (ad && ad.price) {
      fetch("http://localhost:5000/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: ad.price * 100 }), // Convert price to cents
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            console.error("Failed to fetch client secret:", data);
          }
        })
        .catch((error) =>
          console.error("Error fetching payment intent:", error)
        );
    }
  }, [ad]);

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
          <span className="font-bold">{Number(ad.price).toLocaleString()} USD</span>
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
