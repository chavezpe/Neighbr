import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated
} from 'react-native';
import { FileText, Download, Search } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { getDocuments } from '@/api/documents';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Header from '@/components/Header';
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

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDocuments();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      if (user?.communityId) {
        const docs = await getDocuments(user.communityId);
        setDocuments(docs);

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
    console.log('Downloading document:', document.name);
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <TouchableOpacity style={styles.documentCard}>
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
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading documents..." />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
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
            showsVerticalScrollIndicator={false}
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
      </Animated.View>
    </View>
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
    backgroundColor: Colors.white,
  },
  searchContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  categoriesContainer: {
    paddingBottom: Layout.spacing.md,
  },
  categoriesList: {
    paddingHorizontal: Layout.spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
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
    padding: Layout.spacing.lg,
  },
  documentCard: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Layout.borderRadius.md,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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