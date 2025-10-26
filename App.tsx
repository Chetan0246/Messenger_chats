import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message as MessageType, Sender, Contact, UserProfile } from './types';
import { encrypt } from './services/encryptionService';
import { generateSmartReply, generateContactReply } from './services/geminiService';
import * as api from './services/apiService';
import Header from './components/Header';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import ContactList from './components/ContactList';
import Welcome from './components/Welcome';
import CallScreen from './components/CallScreen';

const MOCK_CONTACTS: Contact[] = [
    { id: 'contact-1', name: 'Alice', status: 'online' },
    { id: 'contact-2', name: 'Bob', status: 'offline', lastSeen: new Date(Date.now() - 1000 * 60 * 15) },
    { id: 'contact-3', name: 'Charlie', status: 'online' },
];

type CallState = {
  isActive: boolean;
  contact: Contact | null;
  status: 'ringing' | 'connected' | 'ended';
  startTime: number | null;
};

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'You' });
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    contact: null,
    status: 'ended',
    startTime: null,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find(c => c.id === selectedContactId) || null;
  
  useEffect(() => {
    const initializeApp = async () => {
      api.initApi();
      const profile = await api.fetchUserProfile();
      setUserProfile(profile);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      const fetchAndSetMessages = async () => {
        setIsMessagesLoading(true);
        setCurrentMessages([]);
        const messages = await api.fetchMessages(selectedContactId);
        setCurrentMessages(messages);
        setIsMessagesLoading(false);
      };
      fetchAndSetMessages();
    } else {
      setCurrentMessages([]);
    }
  }, [selectedContactId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setContacts(prevContacts => prevContacts.map(c => {
        if (c.id !== selectedContactId && Math.random() > 0.7) {
          const newStatus = c.status === 'online' ? 'offline' : 'online';
          return { ...c, status: newStatus, lastSeen: newStatus === 'offline' ? new Date() : undefined };
        }
        return c;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContactId]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);
  
  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !selectedContactId || !selectedContact) return;

    const userMessagePayload = {
      sender: Sender.USER,
      text: text,
      encryptedText: encrypt(text),
      type: 'text' as const,
    };
    
    const sentMessage = await api.postMessage(selectedContactId, userMessagePayload);
    const updatedMessages = [...currentMessages, sentMessage];
    setCurrentMessages(updatedMessages);
    
    setIsAiLoading(true);

    setTimeout(async () => {
        const messageToMark = await api.postMessage(selectedContactId, { 
            sender: Sender.BOT, 
            text: '',
            encryptedText: '',
            type: 'text'
        }); // This seems wrong, let's fix it.
        // The bot doesn't mark its own messages as read. The user's client would do that.
        // We simulate the other user reading it.
        await api.markAsReadApi(selectedContactId, sentMessage.id);
        setCurrentMessages(prev => prev.map(msg => msg.id === sentMessage.id ? { ...msg, read: true } : msg));
    }, 2000);

    const replyText = await generateContactReply(updatedMessages, selectedContact.name);
    
    const contactMessagePayload = {
        sender: Sender.BOT,
        text: replyText,
        encryptedText: encrypt(replyText),
        type: 'text' as const,
    };

    const contactMessage = await api.postMessage(selectedContactId, contactMessagePayload);
    setCurrentMessages(prev => [...prev, contactMessage]);
    setIsAiLoading(false);

  }, [selectedContactId, selectedContact, currentMessages]);

  const handleSendFile = useCallback(async (file: File) => {
    if (!selectedContactId || !selectedContact) return;

    const tempId = `uploading-${Date.now()}`;
    const optimisticFileMessage: MessageType = {
        id: tempId,
        sender: Sender.USER,
        text: `File: ${file.name}`,
        encryptedText: encrypt(`File: ${file.name}`),
        timestamp: new Date(),
        type: 'file',
        fileName: file.name,
        read: false,
        uploading: true,
    };
    setCurrentMessages(prev => [...prev, optimisticFileMessage]);

    await new Promise(resolve => setTimeout(resolve, 2500)); 

    const fileMessagePayload = {
        sender: Sender.USER,
        text: `File: ${file.name}`,
        encryptedText: encrypt(`File: ${file.name}`),
        type: 'file' as const,
        fileName: file.name,
    };
    
    const sentFileMessage = await api.postMessage(selectedContactId, fileMessagePayload);
    
    setCurrentMessages(prev => prev.map(msg => msg.id === tempId ? { ...sentFileMessage, uploading: false } : msg));
    
    setTimeout(async () => {
        await api.markAsReadApi(selectedContactId, sentFileMessage.id);
        setCurrentMessages(prev => prev.map(msg => msg.id === sentFileMessage.id ? { ...msg, read: true } : msg));
    }, 1000);
    
    setIsAiLoading(true);
    const replyText = await generateContactReply(currentMessages.filter(m => m.id !== tempId).concat(sentFileMessage), selectedContact.name);
    const contactMessagePayload = {
        sender: Sender.BOT,
        text: replyText,
        encryptedText: encrypt(replyText),
        type: 'text' as const,
    };
    const contactMessage = await api.postMessage(selectedContactId, contactMessagePayload);
    setCurrentMessages(prev => [...prev, contactMessage]);
    setIsAiLoading(false);
    
  }, [selectedContactId, selectedContact, currentMessages]);
  
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!selectedContactId) return;
    await api.deleteMessageApi(selectedContactId, messageId);
    setCurrentMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: '', encryptedText: '', isDeleted: true, type: 'text' } : msg
    ));
  }, [selectedContactId]);

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
     if (!selectedContactId) return;
     const updatedMessage = await api.editMessageApi(selectedContactId, messageId, newText);
     if (updatedMessage) {
        setCurrentMessages(prev => prev.map(msg => 
            msg.id === messageId ? updatedMessage : msg
        ));
     }
  }, [selectedContactId]);

  const handleGenerateSuggestion = useCallback(async (currentInput: string): Promise<string | null> => {
    if (!selectedContactId) return null;
    setIsAiLoading(true);
    try {
      const suggestion = await generateSmartReply(currentMessages, currentInput);
      return suggestion;
    } catch (error) {
      console.error("Failed to generate suggestion:", error);
      return "Sorry, I couldn't generate a suggestion.";
    } finally {
      setIsAiLoading(false);
    }
  }, [selectedContactId, currentMessages]);
  
  const handleUpdateUserProfile = useCallback((newProfile: UserProfile) => {
    setUserProfile(newProfile);
    api.saveUserProfile(newProfile);
  }, []);

  const handleStartCall = useCallback(() => {
    if (!selectedContact) return;
    setCallState({
        isActive: true,
        contact: selectedContact,
        status: 'ringing',
        startTime: null
    });

    setTimeout(() => {
        setCallState(prev => ({ ...prev, status: 'connected', startTime: Date.now() }));
    }, 3000); // Simulate connection time
  }, [selectedContact]);

  const handleEndCall = useCallback(async () => {
    if (!callState.contact || !callState.startTime) {
        setCallState({ isActive: false, contact: null, status: 'ended', startTime: null });
        return;
    };

    const durationInSeconds = Math.floor((Date.now() - callState.startTime) / 1000);

    const callMessagePayload = {
      sender: Sender.BOT, // System message
      text: `Call ended`,
      encryptedText: encrypt(`Call ended`),
      type: 'call' as const,
      callDuration: durationInSeconds,
    };
    
    const sentMessage = await api.postMessage(callState.contact.id, callMessagePayload);
    
    if (selectedContactId === callState.contact.id) {
        setCurrentMessages(prev => [...prev, sentMessage]);
    }

    setCallState({ isActive: false, contact: null, status: 'ended', startTime: null });
  }, [callState, selectedContactId]);

  if (callState.isActive && callState.contact) {
    return (
      <CallScreen 
        contact={callState.contact}
        status={callState.status}
        startTime={callState.startTime}
        onEndCall={handleEndCall}
      />
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
        <ContactList 
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateUserProfile}
        />
        <div className="flex-1 flex flex-col">
            {selectedContact ? (
                 <div className="flex flex-col h-screen">
                    <Header contact={selectedContact} onStartCall={handleStartCall} />
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        {isMessagesLoading && (
                            <div className="flex justify-center items-center h-full">
                                <div className="w-8 h-8 border-4 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                        {!isMessagesLoading && currentMessages.map(msg => (
                            <Message 
                              key={msg.id} 
                              message={msg} 
                              onDelete={handleDeleteMessage}
                              onEdit={handleEditMessage}
                              contact={selectedContact}
                              userProfile={userProfile}
                            />
                        ))}
                        {isAiLoading && (
                        <div className="flex justify-start">
                             <div className="flex flex-row items-end max-w-xs md:max-w-md">
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 mr-3 flex items-center justify-center font-bold">
                                    {selectedContact.name.charAt(0)}
                                </div>
                                <div className="bg-gray-700 rounded-lg p-3 rounded-bl-none">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        onSendFile={handleSendFile}
                        onGenerateSuggestion={handleGenerateSuggestion} 
                        isLoading={isAiLoading}
                        disabled={!selectedContactId || isMessagesLoading}
                        contact={selectedContact}
                    />
                </div>
            ) : (
                <Welcome />
            )}
        </div>
    </div>
  );
};

export default App;
