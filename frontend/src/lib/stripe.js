import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe once and reuse
let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};



/*
This helper initializes Stripe once and reuses the same instance across the app.
*/

