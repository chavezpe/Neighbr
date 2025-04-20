import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/Config';

export const sendQuery = async (query: string, hoaCode: string) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.post(
      `${API_URL}/query/answer_query`,
      {},
      {
        params: {
          query,
          hoa_code: hoaCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Chatbot query error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Query failed');
    }
    throw new Error('Network error. Please try again later.');
  }
};