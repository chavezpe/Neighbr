import axios from 'axios';
import { API_URL } from '@/constants/Config';

// Create a FormData object for form submissions
const createFormData = (data: Record<string, string>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

export const loginUser = async (email: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Login failed');
    }
    throw new Error('Network error. Please try again later.');
  }
};


export const signupUser = async (name: string, email: string, password: string, hoaCode: string) => {
  try {
    const formData = createFormData({ name, email, password, hoa_code: hoaCode });
    const response = await axios.post(`${API_URL}/auth/signup`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Signup failed');
    }
    throw new Error('Network error. Please try again later.');
  }
};

export const createCommunity = async (
  name: string,
  maxHouseholds: number,
  adminName: string,
  adminEmail: string,
  adminPassword: string
) => {
  try {
    const response = await axios.post(
      `${API_URL}/admin/create_community`,
      {
        name,
        max_households: maxHouseholds,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Create community error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Failed to create community');
    }
    throw new Error('Network error. Please try again later.');
  }
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    await axios.get(`${API_URL}/query/answer_query`, {
      params: {
        query: 'test',
        hoa_code: 'test',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};