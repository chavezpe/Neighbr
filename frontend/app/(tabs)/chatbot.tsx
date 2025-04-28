import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Send, Bot, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { sendQuery } from '@/api/chatbot';
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
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
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
      const response = await sendQuery(userMessage.text, user.communityId);

      const botMessage: Message = {
        id: String(Date.now() + 1),
        text: response.answer || "I'm sorry, I couldn't find an answer to your question.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

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
      <View style={[
        styles.avatarContainer,
        item.sender === 'user' ? styles.userAvatar : styles.botAvatar
      ]}>
        {item.sender === 'user' ? (
          <UserIcon size={18} color={Colors.white} />
        ) : (
          <Bot size={18} color={Colors.white} />
        )}
      </View>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.botMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={styles.timestampText}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
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
          <View style={styles.suggestionsContainer}>
            <SuggestionChip
              text="Pool hours"
              onPress={() => setInputText("What are the pool hours?")}
            />
            <SuggestionChip
              text="Rental policy"
              onPress={() => setInputText("Can I rent out my property?")}
            />
            <SuggestionChip
              text="Guidelines"
              onPress={() => setInputText("What are the architectural guidelines?")}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything about your HOA..."
              value={inputText}
              onChangeText={setInputText}
              multiline={true}
              maxLength={1000}
              autoCapitalize="sentences"
              placeholderTextColor={Colors.neutral[400]}
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
      </Animated.View>
    </View>
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
    backgroundColor: Colors.white,
  },
  messagesList: {
    padding: Layout.spacing.lg,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    backgroundColor: Colors.primary[500],
  },
  botAvatar: {
    backgroundColor: Colors.secondary[500],
  },
  messageBubble: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    maxWidth: '90%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: Colors.primary[500],
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.white,
  },
  botMessageText: {
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
    padding: Layout.spacing.lg,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.md,
  },
  suggestionChip: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.pill,
    paddingVertical: 8,
    paddingHorizontal: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  suggestionChipText: {
    fontSize: 14,
    color: Colors.primary[700],
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    paddingRight: 50,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
    color: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  sendButton: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
});