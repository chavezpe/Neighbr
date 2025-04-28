import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { Upload as UploadIcon, File, X, CircleAlert as AlertCircle, ChevronDown } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/context/AuthContext';
import { uploadDocument } from '@/api/documents';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

const DOCUMENT_TYPES = [
  { id: 'bylaws', label: 'Bylaws & CC&Rs', description: 'Core governing documents' },
  { id: 'architectural', label: 'Architectural Guidelines', description: 'Home modification rules' },
  { id: 'rules', label: 'Community Rules', description: 'General rules and regulations' },
  { id: 'minutes', label: 'Meeting Minutes', description: 'Board meeting records' },
  { id: 'financial', label: 'Financial Reports', description: 'Budget and financial statements' },
  { id: 'forms', label: 'Forms & Applications', description: 'Request and approval forms' },
  { id: 'newsletters', label: 'Newsletters', description: 'Community updates and news' },
  { id: 'policies', label: 'Policies', description: 'Specific policy documents' },
  { id: 'maintenance', label: 'Maintenance Guidelines', description: 'Property maintenance standards' },
  { id: 'amenities', label: 'Amenity Rules', description: 'Pool, gym, and facility rules' }
];

export default function UploadScreen() {
  const { user } = useAuth();
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const selectedTypeLabel = DOCUMENT_TYPES.find(type => type.id === documentType)?.label || 'Select document type';

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

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
    if (!documentType) {
      setError('Please select a document type');
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

      setIsSuccess(true);
      setDocumentType('');
      setSelectedFile(null);

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
      <View style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <AlertCircle size={48} color={Colors.error.main} />
          <Text style={styles.unauthorizedTitle}>Unauthorized Access</Text>
          <Text style={styles.unauthorizedText}>
            You need administrator privileges to access this page.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

          <TouchableOpacity
            style={styles.typeSelector}
            onPress={() => setShowTypeModal(true)}
          >
            <View style={styles.typeSelectorContent}>
              <Text style={[
                styles.typeSelectorText,
                !documentType && styles.typeSelectorPlaceholder
              ]}>
                {selectedTypeLabel}
              </Text>
              <ChevronDown size={20} color={Colors.neutral[500]} />
            </View>
          </TouchableOpacity>

          {selectedFile ? (
            <TouchableOpacity style={styles.selectedFileCard} onPress={clearSelectedFile}>
              <View style={styles.selectedFileContent}>
                <View style={styles.fileIconContainer}>
                  <File size={24} color={Colors.primary[500]} />
                </View>
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
                <View style={styles.removeButton}>
                  <X size={20} color={Colors.neutral[600]} />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.uploadArea} onPress={pickDocument} activeOpacity={0.7}>
              <View style={styles.uploadIconContainer}>
                <UploadIcon size={32} color={Colors.primary[500]} />
              </View>
              <Text style={styles.uploadText}>
                Tap to select a PDF file
              </Text>
              <Text style={styles.uploadHint}>
                Maximum file size: 10MB
              </Text>
            </TouchableOpacity>
          )}

          <Button
            title="Upload Document"
            variant="primary"
            size="lg"
            onPress={handleUpload}
            isLoading={isLoading}
            disabled={!selectedFile || !documentType || isLoading}
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

        <Modal
          visible={showTypeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTypeModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTypeModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Document Type</Text>
              <ScrollView>
                {DOCUMENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      type.id === documentType && styles.typeOptionSelected
                    ]}
                    onPress={() => {
                      setDocumentType(type.id);
                      setShowTypeModal(false);
                    }}
                  >
                    <View>
                      <Text style={[
                        styles.typeOptionLabel,
                        type.id === documentType && styles.typeOptionLabelSelected
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.typeOptionDescription}>
                        {type.description}
                      </Text>
                    </View>
                    {type.id === documentType && (
                      <View style={styles.typeOptionCheck} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {isLoading && <LoadingSpinner fullScreen text="Uploading document..." />}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xl,
  },
  typeSelector: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.lg,
  },
  typeSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
  },
  typeSelectorText: {
    fontSize: 16,
    color: Colors.neutral[900],
  },
  typeSelectorPlaceholder: {
    color: Colors.neutral[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: Layout.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary[50],
  },
  typeOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  typeOptionLabelSelected: {
    color: Colors.primary[700],
  },
  typeOptionDescription: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  typeOptionCheck: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: Colors.primary[100],
    borderStyle: 'dashed',
    borderRadius: Layout.borderRadius.lg,
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
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Layout.spacing.lg,
  },
  selectedFileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    marginVertical: Layout.spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
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
    borderWidth: 1,
    borderColor: Colors.success.main,
  },
  successText: {
    color: Colors.success.dark,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: Colors.error.light,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error.main,
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