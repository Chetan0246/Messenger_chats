import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import EmojiPicker from './EmojiPicker';

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 17l-4 4 4-4 2.293 2.293a1 1 0 010 1.414L8 23m11-11l2.293 2.293a1 1 0 010 1.414L16 17l-4 4 4-4 2.293 2.293a1 1 0 010 1.414L13 23" />
    </svg>
);

const PaperclipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

const EmojiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onSendFile: (file: File) => void;
    onGenerateSuggestion: (currentInput: string) => Promise<string | null>;
    isLoading: boolean;
    disabled: boolean;
    contact: Contact | null;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendFile, onGenerateSuggestion, isLoading, disabled, contact }) => {
    const [inputValue, setInputValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(inputValue.trim()){
            onSendMessage(inputValue);
            setInputValue('');
        }
    };
    
    const handleSuggestion = async () => {
        const suggestion = await onGenerateSuggestion(inputValue);
        if (suggestion) {
            setInputValue(suggestion);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onSendFile(e.target.files[0]);
            e.target.value = ''; // Reset file input
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleSelectEmoji = (emoji: string) => {
        setInputValue(prev => prev + emoji);
        setShowEmojiPicker(false);
    };
    
    const placeholderText = disabled 
        ? "Select a contact to begin" 
        : `Type an encrypted message to ${contact?.name || '...'}...`;

    return (
        <div className="bg-gray-800 p-4 border-t border-gray-700 relative">
            {showEmojiPicker && (
                <EmojiPicker 
                    onSelectEmoji={handleSelectEmoji} 
                    onClose={() => setShowEmojiPicker(false)} 
                />
            )}
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={handleSuggestion}
                    disabled={isLoading || disabled}
                    className="p-2 text-gray-400 hover:text-purple-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Generate smart reply suggestion"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-gray-500 border-t-purple-400 rounded-full animate-spin"></div>
                    ) : (
                       <SparklesIcon />
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={isLoading || disabled}
                    className="p-2 text-gray-400 hover:text-yellow-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    aria-label="Add emoji"
                    aria-expanded={showEmojiPicker}
                >
                    <EmojiIcon />
                </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={isLoading || disabled}
                    className="p-2 text-gray-400 hover:text-green-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Attach file"
                >
                    <PaperclipIcon />
                </button>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholderText}
                    className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || disabled}
                    aria-label="Message input"
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading || disabled}
                    className="p-2 text-gray-400 hover:text-blue-500 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default ChatInput;