import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, Bot, User as UserIcon } from 'lucide-react-native';
import { mockMessages, mockConversations, addMessage } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { ChatConversation, ChatMessage } from '@/types/database';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    if (!user) return;

    const userConversations = mockConversations.filter(
      (c) => c.user_id === user.id
    );

    if (userConversations.length > 0) {
      const conversation = userConversations[0];
      setConversationId(conversation.id);
      loadMessages(conversation.id);
    } else {
      createNewConversation();
    }
  };

  const createNewConversation = () => {
    if (!user) return;

    const convId = `c${Date.now()}`;
    setConversationId(convId);

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      conversation_id: convId,
      role: 'assistant',
      content:
        'Bonjour ! Je suis votre assistant santé MediConnect. Comment puis-je vous aider aujourd\'hui ?',
      created_at: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const loadMessages = (convId: string) => {
    const convMessages = mockMessages.filter(
      (m) => m.conversation_id === convId
    );

    if (convMessages.length > 0) {
      setMessages(convMessages);
    } else {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        conversation_id: convId,
        role: 'assistant',
        content:
          'Bonjour ! Je suis votre assistant santé MediConnect. Comment puis-je vous aider aujourd\'hui ?',
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !conversationId || loading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setLoading(true);

    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    setTimeout(async () => {
      const aiResponse = await getAIResponse(userMessage);

      const assistantMessage: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      addMessage(tempUserMessage);
      addMessage(assistantMessage);

      setLoading(false);
    }, 500);
  };

  const getAIResponse = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('bonjour') ||
      lowerMessage.includes('salut') ||
      lowerMessage.includes('hello')
    ) {
      return 'Bonjour ! Comment puis-je vous aider aujourd\'hui ? Je peux vous renseigner sur les médicaments, leurs interactions, ou vous orienter vers un professionnel de santé si nécessaire.';
    }

    if (
      lowerMessage.includes('mal de tête') ||
      lowerMessage.includes('migraine')
    ) {
      return 'Pour un mal de tête, vous pouvez prendre du paracétamol (500mg à 1g toutes les 6 heures, maximum 4g par jour). Si les maux de tête persistent ou sont très intenses, consultez un médecin.';
    }

    if (lowerMessage.includes('fièvre')) {
      return 'Pour la fièvre, le paracétamol est recommandé. Hydratez-vous bien. Si la fièvre dépasse 39°C ou persiste plus de 3 jours, consultez un médecin.';
    }

    if (lowerMessage.includes('grippe') || lowerMessage.includes('rhume')) {
      return 'Pour un rhume ou une grippe : repos, hydratation, paracétamol pour la fièvre et les douleurs. Les symptômes durent généralement 7-10 jours. Consultez si les symptômes s\'aggravent.';
    }

    if (lowerMessage.includes('interaction')) {
      return 'Les interactions médicamenteuses peuvent être dangereuses. Je vous recommande de consulter un pharmacien ou votre médecin pour vérifier les interactions entre vos médicaments.';
    }

    if (lowerMessage.includes('ordonnance')) {
      return 'Vous pouvez scanner votre ordonnance via l\'onglet Scanner de l\'application. Cela vous permettra d\'obtenir automatiquement la liste des médicaments et de les commander.';
    }

    if (lowerMessage.includes('pharmacie')) {
      return 'Vous pouvez trouver les pharmacies proches de vous via l\'onglet Accueil de l\'application. Recherchez un médicament pour voir où il est disponible.';
    }

    if (
      lowerMessage.includes('urgence') ||
      lowerMessage.includes('grave') ||
      lowerMessage.includes('douleur intense')
    ) {
      return 'Si vous avez une urgence médicale, contactez immédiatement les services d\'urgence ou rendez-vous à l\'hôpital le plus proche. N\'attendez pas !';
    }

    return 'Je comprends votre question. Pour des conseils médicaux personnalisés, je vous recommande de consulter un professionnel de santé. Je peux vous aider à trouver des pharmacies ou à commander des médicaments prescrits via l\'application.';
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageIcon,
            isUser ? styles.userIcon : styles.assistantIcon,
          ]}
        >
          {isUser ? (
            <UserIcon size={16} color="#ffffff" strokeWidth={2} />
          ) : (
            <Bot size={16} color="#ffffff" strokeWidth={2} />
          )}
        </View>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistant IA</Text>
        <Text style={styles.headerSubtitle}>
          Posez vos questions santé
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Posez votre question..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Send size={20} color="#ffffff" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00A86B',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    backgroundColor: '#00A86B',
    marginLeft: 8,
  },
  assistantIcon: {
    backgroundColor: '#2196F3',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#00A86B',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#1a1a1a',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
