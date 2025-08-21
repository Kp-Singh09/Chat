import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, List, ActivityIndicator, Appbar, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';

const API_URL = 'https://my-chat-server-h7aa.onrender.com/'; 

interface User {
  _id: string;
  name: string;
  email: string;
  onlineStatus: boolean;
  lastMessage?: {
    content: string;
    createdAt: string;
  } | null;
}

interface DecodedToken {
  id: string;
}

const formatTimestamp = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout, authState } = useAuth();
  const router = useRouter();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.token) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${authState.token}` } };
        const response = await axios.get(`${API_URL}/api/users`, config);
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    const decodedToken: DecodedToken = jwtDecode(authState.token);
    const currentUserId = decodedToken.id;
    socketRef.current = io(API_URL, { query: { userId: currentUserId } });

    socketRef.current.on('user:online', ({ userId }: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, onlineStatus: true } : user
        )
      );
    });

    socketRef.current.on('user:offline', ({ userId }: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, onlineStatus: false } : user
        )
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [authState.isAuthenticated, authState.token]);

  const handleLogout = () => {
    logout();
  };

  const startChat = (user: User) => {
    const href = {
      pathname: '/chat/[id]',
      params: { id: user._id, name: user.name },
    };
    router.push(href as any);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Chats" />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            titleStyle={{ color: '#000' }} 
            description={item.lastMessage ? item.lastMessage.content : 'No messages yet'}
            descriptionNumberOfLines={1}
            descriptionStyle={{ color: '#555' }} 
            left={props => (
              // --- CHANGE 2: Applied the new style here ---
              <View style={styles.avatarContainer}>
                <Avatar.Text 
                  {...props} 
                  size={40} 
                  label={item.name[0].toUpperCase()} 
                  style={{ backgroundColor: '#e0e7ff' }}
                  color="#3730a3"
                />
                {item.onlineStatus && <View style={styles.onlineDot} />}
              </View>
            )}
            right={props => item.lastMessage && <Text {...props} style={{ color: '#555', alignSelf: 'center' }}>{formatTimestamp(item.lastMessage.createdAt)}</Text>}
            onPress={() => startChat(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // --- CHANGE 1: Added a new style for the avatar container ---
  avatarContainer: {
    marginLeft: 8, // Adds space from the left edge
    marginRight: 8, // Adds some space between avatar and text
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    borderWidth: 2,
    borderColor: 'white',
  },
});