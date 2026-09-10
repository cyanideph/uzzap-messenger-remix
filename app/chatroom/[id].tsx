import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useChatroom } from '@/contexts/ChatroomContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatroomScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { messages, loading, fetchMessages, sendMessage } = useChatroom();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages(id as string);
  }, [id, fetchMessages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(id as string, message.trim());
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageContainerMe : styles.messageContainerOther,
        ]}
      >
        {item.type === 'image' ? (
          <Image
            source={{ uri: item.content }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        ) : (
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextOther,
            ]}
          >
            {item.content}
          </Text>
        )}
        <Text
          style={[
            styles.messageTime,
            isMe ? styles.messageTimeMe : styles.messageTimeOther,
          ]}
        >
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#f2f2f7' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#222' : '#fff',
            borderTopColor: colorScheme === 'dark' ? '#333' : '#ddd',
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colorScheme === 'dark' ? '#fff' : '#000',
              backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: message.trim() ? '#007AFF' : '#ccc',
            },
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
  },
  messageContainerMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  messageContainerOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeOther: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});