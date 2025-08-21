import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Appbar, TextInput, Button, ActivityIndicator, Icon } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import io from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://my-chat-server-h7aa.onrender.com/';

interface Message {
  _id: string;
  sender: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
}

interface DecodedToken {
  id: string;
}

export default function ChatScreen() {
  const { id: recipientId, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const { authState } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  const decodedToken: DecodedToken = jwtDecode(authState.token!);
  const currentUserId = decodedToken.id;

  useEffect(() => {
    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/api/messages/${recipientId}`, config);
            setMessages(response.data);
            socketRef.current?.emit('messages:read', { senderId: recipientId });
        } catch (error) {
            Alert.alert('Error', 'Could not fetch message history.');
        } finally {
            setLoading(false);
        }
    };
    
    socketRef.current = io(API_URL, { query: { userId: currentUserId } });
    fetchMessages();

    socketRef.current.on('message:new', (message: Message) => {
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, message]);
      socketRef.current.emit('messages:read', { senderId: message.sender });
    });
    
    socketRef.current.on('typing:started', () => setIsTyping(true));
    socketRef.current.on('typing:stopped', () => setIsTyping(false));

    socketRef.current.on('messages:read:receipt', ({ readerId }: { readerId: string }) => {
        if (readerId === recipientId) {
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.sender === currentUserId ? { ...msg, status: 'read' } : msg
                )
            );
        }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserId, recipientId]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    const tempId = `temp_${Date.now()}`;
    const messageData = { recipientId, message: newMessage };
    socketRef.current.emit('message:send', messageData);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('typing:stop', { recipientId });

    const sentMessage: Message = {
        _id: tempId,
        sender: currentUserId,
        content: newMessage,
        status: 'sent',
    };
    setMessages((prevMessages) => [...prevMessages, sentMessage]);
    setNewMessage('');
  };
  
  const handleTyping = (text: string) => {
    setNewMessage(text);
    if (!socketRef.current) return;
    socketRef.current.emit('typing:start', { recipientId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing:stop', { recipientId });
    }, 2000);
  };
  
  const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    if (status === 'read') {
        return <Icon source="check-all" size={16} color="blue" />;
    }
    if (status === 'delivered' || status === 'sent') {
        return <Icon source="check" size={16} color="gray" />;
    }
    return null;
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
            title={
                <View>
                    <Text variant="titleMedium">{name || 'Chat'}</Text>
                    {isTyping && <Text variant="bodySmall" style={{ color: 'gray' }}>typing...</Text>}
                </View>
            }
        />
      </Appbar.Header>

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.sender === currentUserId ? styles.myMessage : styles.theirMessage]}>
            <Text style={item.sender === currentUserId ? styles.myMessageText : styles.theirMessageText}>
                {item.content}
            </Text>
            {item.sender === currentUserId && (
                <View style={styles.statusContainer}>
                    <MessageStatus status={item.status} />
                </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={handleTyping}
          placeholder="Type a message..."
        />
        <Button mode="contained" onPress={sendMessage}>
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    messagesContainer: { padding: 10 },
    messageBubble: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 10,
        maxWidth: '80%',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    myMessage: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
    theirMessage: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start' },
    myMessageText: { color: 'white' },
    theirMessageText: { color: 'black' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' },
    input: { flex: 1, marginRight: 10 },
    statusContainer: { marginLeft: 8, marginBottom: 2 },
});