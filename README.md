# Real-Time 1:1 Chat Application

This is a full-stack, real-time chat application built for a university assignment. It features a mobile frontend using React Native (Expo) and a backend service using Node.js, Express, and Socket.IO.

## 🚀 Features

-   **User Authentication:** Secure user registration and login using JSON Web Tokens (JWT).
-   **Real-Time Messaging:** Instantaneous 1:1 messaging powered by WebSockets.
-   **Chat List:** A home screen that displays all other users, their online status, and a snippet of the last message exchanged.
-   **Message Persistence:** Chat history is saved to a MongoDB database and loaded when a chat is opened.
-   **Typing Indicator:** A live "typing..." status lets users know when the other person is writing a message.
-   **Message Receipts:** Sent messages display ticks (✓) which turn blue (✓✓) when the recipient has read them.

## 🛠️ Tech Stack

-   **Frontend:** React Native, Expo, TypeScript, Expo Router, React Native Paper, Socket.IO Client, Axios
-   **Backend:** Node.js, Express.js, Socket.IO, MongoDB, Mongoose
-   **Authentication:** JWT, bcrypt.js

## ⚙️ Setup and Installation

Follow these instructions to get the project running locally for development and testing.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   A MongoDB database instance (local or from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
-   A physical device with the Expo Go app or an Android/iOS emulator

---

### Backend (`/server`)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create an environment file:**
    Create a file named `.env` in the `/server` directory and add the following variables.
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_and_long_key
    ```
4.  **Run the server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3001`.

---

### Frontend (`/mobile`)

1.  **Navigate to the mobile directory:**
    ```bash
    cd mobile
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Update the API URL:**
    This is a crucial step. In all files that define the `API_URL` constant (e.g., `login.tsx`, `index.tsx`, `chat/[id].tsx`), you **must** replace the placeholder IP address with your computer's local network IP address.
    
    * **Windows:** Run `ipconfig` in Command Prompt.
    * **Mac/Linux:** Run `ifconfig` in the terminal.
    
    Example: `const API_URL = 'http://192.168.1.10:3001';`

4.  **Run the app:**
    ```bash
    npx expo start
    ```
    Scan the QR code with the Expo Go app or run on an emulator. For best results, use a development build as created during the tutorial.