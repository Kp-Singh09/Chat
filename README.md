# Real-Time 1:1 Chat Application

This is a full-stack, real-time chat application built with a React Native (Expo) frontend and a Node.js (Express + Socket.IO) backend. The project was created to fulfill all requirements of the university assignment.

-----

## 🚀 Features

  - **User Authentication:** Secure user registration and login using JSON Web Tokens (JWT).
  - **Real-Time Messaging:** Instantaneous 1:1 messaging powered by WebSockets.
  - **Chat List:** A home screen that displays all other users, their online status, and a snippet of the last message exchanged.
  - **Message Persistence:** Chat history is saved to and loaded from a MongoDB database.
  - **Typing Indicator:** A live "typing..." status lets users know when the other person is writing a message.
  - **Message Receipts:** Sent messages display ticks (✓) which turn blue (✓✓) when the recipient has read them.

-----

## 🛠️ Tech Stack

  - **Frontend:** React Native, Expo, TypeScript, Expo Router, React Native Paper, Socket.IO Client, Axios
  - **Backend:** Node.js, Express.js, Socket.IO, MongoDB, Mongoose
  - **Authentication:** JWT, bcrypt.js

-----

## ⚙️ Getting Started

Follow these instructions to get the project running locally.

### Prerequisites

  - Node.js (v18 or later)
  - npm or yarn
  - A MongoDB database instance (e.g., from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
  - A physical device with a development build or an Android/iOS emulator

-----

### 📦 Environment Variables (`.env`)

You will need to create a `.env` file in both the `/server` and `/mobile` directories.

#### **Server (`/server/.env`)**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_and_long_key_for_jwt
```

#### **Frontend (`/mobile/.env`)**

This file is used to store the server's URL.
```
EXPO_PUBLIC_API_URL=http://your_computer_local_ip:3001
```
*(**Note:** For the frontend, you'll need to create a file named `mobile/app.d.ts` and add a process declaration to make TypeScript recognize this variable, as shown in the setup steps below.)*

-----

### 🏃‍♂️ Running the Application

#### **Backend (`/server`)**

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3001`.

#### **Frontend (`/mobile`)**

1.  **Navigate to the mobile directory:**

    ```bash
    cd mobile
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure TypeScript for `.env`:**
    Create a new file at `/mobile/app.d.ts` and add the following code to it. This allows TypeScript to recognize the `EXPO_PUBLIC_API_URL` variable.

    ```typescript
    /// <reference types="react-scripts" />

    declare namespace NodeJS {
      interface ProcessEnv {
        EXPO_PUBLIC_API_URL: string;
      }
    }
    ```

4.  **Update the API URL:**
    In all files that define the `API_URL` constant, replace the hardcoded IP address with `process.env.EXPO_PUBLIC_API_URL`.

    Example change in `login.tsx`:

    ```typescript
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    ```

5.  **Run the app:**

    ```bash
    npx expo start
    ```

    Scan the QR code with your development build or run on an emulator.

-----

### 👥 Sample Users

For easy testing, you can register two or more users with the following credentials.

  - **User 1:**
      - **Email:** `john@example.com`
      - **Password:** `password123`
  - **User 2:**
      - **Email:** `jane@example.com`
      - **Password:** `password456`
