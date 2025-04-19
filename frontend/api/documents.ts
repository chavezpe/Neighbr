import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/Config';

export const uploadDocument = async (
  file: { uri: string; name: string; type: string },
  hoaCode: string,
  documentType: string
) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    formData.append('hoa_code', hoaCode);
    formData.append('document_type', documentType);

    const response = await axios.post(`${API_URL}/upload/upload_pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload document error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Upload failed');
    }
    throw new Error('Network error. Please try again later.');
  }
};

// In a real app, you'd have endpoints to list and download documents
// This is a placeholder for demonstration purposes
export const getDocuments = async (hoaCode: string) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // This is a mock response since we don't have an actual endpoint
    // In a real app, you would make an API call here
    return [
      {
        id: '1',
        name: 'HOA Bylaws',
        type: 'bylaws',
        uploadDate: '2023-10-15',
        url: 'https://example.com/bylaws.pdf',
      },
      {
        id: '2',
        name: 'Community Guidelines',
        type: 'guidelines',
        uploadDate: '2023-09-01',
        url: 'https://example.com/guidelines.pdf',
      },
      {
        id: '3',
        name: 'Architectural Standards',
        type: 'standards',
        uploadDate: '2023-08-20',
        url: 'https://example.com/standards.pdf',
      },
    ];
  } catch (error) {
    console.error('Get documents error:', error);
    throw new Error('Failed to fetch documents');
  }
};