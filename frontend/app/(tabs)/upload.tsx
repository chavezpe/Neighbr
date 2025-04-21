import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Upload as UploadIcon, File, X, AlertCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/context/AuthContext';
import { uploadDocument } from '@/api/documents';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function UploadScreen() {
  const { user } = useAuth();
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      // Get the first asset
      const asset = result.assets?.[0];
      if (asset) {
        setSelectedFile(asset);
        setError(null);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      setError('Failed to select document. Please try again.');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  const validateForm = () => {
    if (!documentType.trim()) {
      setError('Please enter a document type');
      return false;
    }
    
    if (!selectedFile) {
      setError('Please select a PDF file to upload');
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
  if (!validateForm() || !user?.communityId || !selectedFile) return;

  setIsLoading(true);
  setError(null);

  try {
    const file = {
      uri: selectedFile.uri,
      name: selectedFile.name || 'document.pdf',
      type: 'application/pdf',
    };

    await uploadDocument(file, user.communityId, documentType);

    // Show success state
    setIsSuccess(true);
    setDocumentType('');
    setSelectedFile(null);

    // Reset success state after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  } catch (err) {
    console.error('Error uploading document:', err);
    setError('Failed to upload document. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  if (!user?.isAdmin) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <AlertCircle size={48} color={Colors.error.main} />
          <Text style={styles.unauthorizedTitle}>Unauthorized Access</Text>
          <Text style={styles.unauthorizedText}>
            You need administrator privileges to access this page.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>Add new documents to your community</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {isSuccess && (
          <Card style={styles.successCard}>
            <Text style={styles.successText}>
              Document uploaded successfully!
            </Text>
          </Card>
        )}
        
        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}
        
        <Text style={styles.sectionTitle}>Document Information</Text>
        
        <Input
          label="Document Type"
          placeholder="E.g., Bylaws, Guidelines, Meeting Minutes"
          value={documentType}
          onChangeText={setDocumentType}
          fullWidth
        />
        
        <Text style={styles.label}>Upload PDF File</Text>
        
        {selectedFile ? (
          <Card style={styles.selectedFileCard}>
            <View style={styles.selectedFileContent}>
              <File size={24} color={Colors.primary[500]} style={styles.fileIcon} />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                  {selectedFile.name || 'document.pdf'}
                </Text>
                <Text style={styles.fileSize}>
                  {selectedFile.size != null
                    ? selectedFile.size >= 1024 * 1024
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : 'Unknown size'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={clearSelectedFile}
              >
                <X size={20} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            <View style={styles.uploadIconContainer}>
              <UploadIcon size={32} color={Colors.primary[500]} />
            </View>
            <Text style={styles.uploadText}>
              Tap to select a PDF file
            </Text>
            <Text style={styles.uploadHint}>
              File size should be less than 10MB
            </Text>
          </TouchableOpacity>
        )}
        
        <Button
          title="Upload Document"
          variant="primary"
          size="lg"
          onPress={handleUpload}
          isLoading={isLoading}
          disabled={!selectedFile || !documentType.trim() || isLoading}
          fullWidth
          style={styles.uploadButton}
        />
        
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Document Guidelines</Text>
          <Text style={styles.infoText}>
            • Upload only PDF documents{'\n'}
            • Maximum file size: 10MB{'\n'}
            • Use descriptive document types{'\n'}
            • Ensure documents are legible and complete
          </Text>
        </Card>
      </ScrollView>
      
      {isLoading && <LoadingSpinner fullScreen text="Uploading document..." />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.primary[500],
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary[100],
    marginTop: 2,
  },
  content: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.sm,
    marginTop: Layout.spacing.md,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: Colors.primary[100],
    borderStyle: 'dashed',
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary[700],
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  selectedFileCard: {
    backgroundColor: Colors.primary[50],
    marginBottom: Layout.spacing.lg,
  },
  selectedFileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: Layout.spacing.md,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[800],
  },
  fileSize: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    marginVertical: Layout.spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.neutral[100],
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  successCard: {
    backgroundColor: Colors.success.light,
    marginBottom: Layout.spacing.lg,
  },
  successText: {
    color: Colors.success.dark,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: Colors.error.light,
    marginBottom: Layout.spacing.lg,
  },
  errorText: {
    color: Colors.error.dark,
    fontWeight: '500',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error.dark,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  unauthorizedText: {
    fontSize: 16,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
});