// Types
export interface User {
  id: number;
  phone: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    user?: User;
    access_token: string;
    id?: number;
    fullName?: string;
    phone?: string;
    role?: string;
  };
}

const BASE_URL = 'https://file-managment-javz.onrender.com';

// API endpoints
const API_ROUTES = {
  signup: `${BASE_URL}/api/auth/signup`,
  login: `${BASE_URL}/api/auth/login`,
  logout: `${BASE_URL}/api/auth/logout`,
} as const;

// Use fetch for signup, but use the user's login/token logic for login
export const auth = {
  async signup(phone: string, password: string, fullName: string, firebase_token: string): Promise<AuthResponse> {
    const response = await fetch(API_ROUTES.signup, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password, fullName, firebase_token: 'STR' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  async login(phone: string, password: string, firebaseToken: string) {
    try {
      const response = await fetch(API_ROUTES.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password, firebase_token: 'STR' }),
      });
      const data = await response.json();
      if (response.status === 200 || response.status === 201) {
        if (data.data && data.data.accessToken) {
          return storeToken(data.data.accessToken);
        } else if (data.token) {
          return storeToken(data.token);
        }
        throw data.error || 'Login response did not contain a token';
      }
      throw data.error || 'Login failed';
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },

  async logout(userId: number, firebase_token: string): Promise<void> {
    const response = await fetch(API_ROUTES.logout, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, firebase_token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }
  },
};

export const storeToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}; 