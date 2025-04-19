import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Search } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { getDocuments } from '@/api/documents';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type Document = {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
};

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      if (user?.communityId) {
        const docs = await getDocuments(user.communityId);
        setDocuments(docs);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(docs.map(doc => doc.type))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? doc.type === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (document: Document) => {
    // In a real app, you would implement document download here
    console.log('Downloading document:', document.name);
    // For web, you might redirect to document.url
    // For mobile, you might use FileSystem from Expo to save the file
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <Card style={styles.documentCard}>
      <View style={styles.documentContent}>
        <View style={styles.documentIconContainer}>
          <FileText size={24} color={Colors.primary[500]} />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{item.name}</Text>
          <Text style={styles.documentMeta}>
            {item.type} • {item.uploadDate}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => handleDownload(item)}
        >
          <Download size={20} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading documents..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.subtitle}>Access your community documents</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          rightIcon={<Search size={20} color={Colors.neutral[400]} />}
          fullWidth
          containerStyle={styles.searchInputContainer}
        />
      </View>
      
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <ScrollableCategories 
            categories={categories} 
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </View>
      )}
      
      {filteredDocuments.length > 0 ? (
        <FlatList
          data={filteredDocuments}
          renderItem={renderDocumentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.documentsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <FileText size={48} color={Colors.neutral[300]} />
          <Text style={styles.emptyStateText}>
            {searchQuery
              ? 'No documents found matching your search'
              : 'No documents available'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function ScrollableCategories({ 
  categories, 
  activeCategory, 
  onSelectCategory 
}: {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}) {
  return (
    <View>
      <FlatList
        horizontal
        data={['All', ...categories]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              (item === 'All' && activeCategory === null) || item === activeCategory
                ? styles.activeCategoryChip
                : null
            ]}
            onPress={() => onSelectCategory(item === 'All' ? null : item)}
          >
            <Text
              style={[
                styles.categoryText,
                (item === 'All' && activeCategory === null) || item === activeCategory
                  ? styles.activeCategoryText
                  : null
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
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
  searchContainer: {
    padding: Layout.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  categoriesContainer: {
    backgroundColor: Colors.white,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  categoriesList: {
    paddingHorizontal: Layout.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 6,
    borderRadius: Layout.borderRadius.pill,
    backgroundColor: Colors.neutral[100],
    marginRight: Layout.spacing.sm,
  },
  activeCategoryChip: {
    backgroundColor: Colors.primary[500],
  },
  categoryText: {
    fontSize: 14,
    color: Colors.neutral[700],
  },
  activeCategoryText: {
    color: Colors.white,
    fontWeight: '500',
  },
  documentsList: {
    padding: Layout.spacing.md,
  },
  documentCard: {
    marginBottom: Layout.spacing.md,
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
});