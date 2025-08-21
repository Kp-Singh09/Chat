import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'https://my-chat-server-h7aa.onrender.com/'; 

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      await login(response.data.token);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed.';
      Alert.alert('Registration Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Create Account
      </Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.button} />
      ) : (
        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          Register
        </Button>
      )}
      <Button style={styles.linkButton} labelStyle={{ color: '#007AFF' }} onPress={() => router.back()}>
        Already have an account? Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});