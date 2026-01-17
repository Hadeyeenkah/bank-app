// config.js - API Configuration
// This file centralizes all API endpoint configuration

// Determine API URL based on environment
const getApiUrl = () => {
  // Production: use explicit backend domain
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://aurora-bank-backend.vercel.app';
  }
  // Development: allow override or use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5001';
};

export const API_URL = getApiUrl();

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    apiUrl: API_URL,
    env: process.env.NODE_ENV,
    reactAppApiUrl: process.env.REACT_APP_API_URL
  });
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  SIGNUP: `${API_URL}/api/auth/signup`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  VERIFY_OTP: `${API_URL}/api/auth/verify-otp`,
  RESET_PASSWORD: `${API_URL}/api/auth/reset-password`,
  
  // Transactions
  TRANSACTIONS: `${API_URL}/api/transactions`,
  TRANSACTION_DETAIL: (id) => `${API_URL}/api/transactions/${id}`,
  
  // Transfers
  TRANSFERS: `${API_URL}/api/transfers`,
  
  // Bills
  BILLS: `${API_URL}/api/bills`,
  
  // Accounts
  ACCOUNTS: `${API_URL}/api/accounts`,
  
  // Notifications
  NOTIFICATIONS: `${API_URL}/api/notifications`,
  
  // Health check
  HEALTH: `${API_URL}/api/health`,
};

export default API_URL;
