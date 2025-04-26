// Replace with your actual API URL
export const API_URL = 'http://127.0.0.1:8000';

// Stripe publishable key (replace with your actual key)
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key';

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'small',
    name: 'Small Community',
    price: 49.99,
    households: 50,
    features: ['50 Households', 'Document Upload/Download', 'AI Policy Assistant', 'Basic Support'],
  },
  {
    id: 'medium',
    name: 'Medium Community',
    price: 99.99,
    households: 100,
    features: ['100 Households', 'Document Upload/Download', 'AI Policy Assistant', 'Priority Support'],
  },
  {
    id: 'large',
    name: 'Large Community',
    price: 149.99,
    households: 150,
    features: ['150 Households', 'Document Upload/Download', 'AI Policy Assistant', 'Premium Support'],
  },
];