import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { sendQuery } from '@/api/chatbot';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function ChatbotScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your HOA Policy Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages are added
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user?.communityId) return;

    const userMessage: Message = {
      id: String(Date.now()),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send query to the backend
      const response = await sendQuery(userMessage.text, user.communityId);
      
      // Add bot response
      const botMessage: Message = {
        id: String(Date.now() + 1),
        text: response.answer || "I'm sorry, I couldn't find an answer to your question.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        text: "I'm sorry, there was an error processing your request. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      <View style={styles.avatarContainer}>
        {item.sender === 'user' ? (
          <UserIcon size={20} color={Colors.white} />
        ) : (
          <Bot size={20} color={Colors.white} />
        )}
      </View>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestampText}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Policy Assistant</Text>
        <Text style={styles.subtitle}>Get answers to your HOA policy questions</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
      />
      
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <LoadingSpinner size="small" text="Thinking..." />
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about your HOA..."
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={1000}
            autoCapitalize="sentences"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>Suggested Questions</Text>
        <View style={styles.suggestionsContainer}>
          <SuggestionChip
            text="What are the pool hours?"
            onPress={() => {
              setInputText("What are the pool hours?");
            }}
          />
          <SuggestionChip
            text="Can I rent out my property?"
            onPress={() => {
              setInputText("Can I rent out my property?");
            }}
          />
          <SuggestionChip
            text="What are the architectural guidelines?"
            onPress={() => {
              setInputText("What are the architectural guidelines?");
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SuggestionChip({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.suggestionChip} onPress={onPress}>
      <Text style={styles.suggestionChipText}>{text}</Text>
    </TouchableOpacity>
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
  messagesList: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.md,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: Colors.primary[500],
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  timestampText: {
    fontSize: 10,
    color: Colors.neutral[500],
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  loadingIndicator: {
    alignItems: 'center',
    marginVertical: Layout.spacing.md,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    padding: Layout.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    paddingRight: 40,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40,
  },
  sendButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[400],
  },
  suggestions: {
    backgroundColor: Colors.white,
    padding: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: Layout.spacing.sm,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.pill,
    paddingVertical: 6,
    paddingHorizontal: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  suggestionChipText: {
    fontSize: 14,
    color: Colors.primary[700],
  },
});