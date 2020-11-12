// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from "@react-native-community/async-storage";
import { GiftedChat } from "react-native-gifted-chat";
import { StyleSheet, Text, TextInput, Button, View, LogBox } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';


// This app's firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAkoGo5q8e5Oxa6Vx54VoZoJkMIqwfxc34",
    authDomain: "chat-app-1921f.firebaseapp.com",
    databaseURL: "https://chat-app-1921f.firebaseio.com",
    projectId: "chat-app-1921f",
    storageBucket: "chat-app-1921f.appspot.com",
    messagingSenderId: "35667905206",
    appId: "1:35667905206:web:538b63ab617ad2e0cc3417"
};

// Initialize Firebase with config declared above
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

LogBox.ignoreAllLogs();

const db = firebase.firestore();
const chatsRef = db.collection('chats')


export default function App() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        readUser();

        const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
            const messagesFirestore = querySnapshot
                .docChanges()
                .filter(({ type }) => type === 'added')
                .map(({ doc }) => {
                    const message = doc.data();
                    return { ...message, createdAt: message.createdAt.toDate() }
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            appendMessages(messagesFirestore);
        });

        return () => unsubscribe();
    }, []);


    const appendMessages = useCallback((messages) => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    }, [messages]);


    async function readUser() {
        const user = await AsyncStorage.getItem('user');

        if (user) {
          setUser(JSON.parse(user));
        }
    }

    async function handlePress() {
        // Generate random string
        const _id = Math.random().toString(36).substring(7);
        const user = {_id, name};

        await AsyncStorage.setItem('user', JSON.stringify(user));

        setUser(user);
    }

    async function handleSend(messages) {
        const writes = messages.map(message => chatsRef.add(message));
        await Promise.all(writes);
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                />
                <Button
                    onPress={handlePress}
                    title="Enter the chat"
                />
            </View>
        );
    }

    return (
        <GiftedChat
            messages={messages}
            user={user}
            onSend={handleSend}
            renderUsernameOnMessage={true}
        />
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },

    input: {
      height: 50,
        width: "100%",
        borderWidth: 1,
        padding: 15,
        marginBottom: 20,
        borderColor: 'grey',
    },
});
