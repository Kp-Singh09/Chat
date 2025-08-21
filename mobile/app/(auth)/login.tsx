import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://192.168.1.4:3001'; // Make sure this IP is correct

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      await login(response.data.token);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed.';
      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Welcome Back!
      </Text>
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
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Login
        </Button>
      )}
      <Link href="/register" asChild>
        <Button style={styles.linkButton} labelStyle={{ color: '#007AFF' }}>
          Don't have an account? Register
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', // Added a light background for better contrast
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#333', // Made title text dark gray
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