// frontend/src/services/apiConstants.ts

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/token`,
    REGISTER_PATIENT: `${API_BASE_URL}/auth/register/patient`,
    REGISTER_PROFESSIONAL: `${API_BASE_URL}/auth/register/professional`,
    // FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    // RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
};

export const USER_ENDPOINTS = {
    ME: `${API_BASE_URL}/users/me`,
};

// Add other endpoint groups as needed
// export const ITEM_ENDPOINTS = {
//   LIST_CREATE: `${API_BASE_URL}/items/`,
//   DETAIL: (itemId: number) => `${API_BASE_URL}/items/${itemId}`,
// };
