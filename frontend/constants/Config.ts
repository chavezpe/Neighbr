// Replace with your actual API URL
export const API_URL = 'https://api.neighbr.example.com';

// Stripe publishable key (replace with your actual key)
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key';

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'small',
    name: 'Small Community',
    price: 9.99,
    households: 25,
    features: ['25 Households', 'Document Upload/Download', 'AI Policy Assistant', 'Basic Support'],
  },
  {
    id: 'medium',
    name: 'Medium Community',
    price: 19.99,
    households: 100,
    features: ['100 Households', 'Document Upload/Download', 'AI Policy Assistant', 'Priority Support'],
  },
  {
    id: 'large',
    name: 'Large Community',
    price: 49.99,
    households: 500,
    features: ['500 Households', 'Document Upload/Download', 'AI Policy Assistant', 'Premium Support'],
  },
];