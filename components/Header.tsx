import React from 'react';
import { Contact } from '../types';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 4V5a1 1 0 112 0v1H9z" clipRule="evenodd" />
        <path d="M6 8v7h8V8H6z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);


interface HeaderProps {
    contact: Contact;
    onStartCall: () => void;
}

const Header: React.FC<HeaderProps> = ({ contact, onStartCall }) => {
    const formatLastSeen = (date?: Date) => {
        if (!date) return 'a long time ago';
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffSeconds < 60) return 'just now';
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <header className="bg-gray-800 shadow-lg p-4 flex items-center justify-between z-10 border-b border-gray-700">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center font-bold">
                        {contact.name.charAt(0)}
                    </div>
                    <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-800 ${contact.status === 'online' ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-100">{contact.name}</h1>
                    <p className="text-xs text-gray-400">
                        {contact.status === 'online' ? 'Online' : `Last seen ${formatLastSeen(contact.lastSeen)}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                    onClick={onStartCall}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={`Call ${contact.name}`}
                >
                    <PhoneIcon />
                </button>
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                    <LockIcon />
                    <span className="text-sm text-green-300 font-medium">Encrypted</span>
                </div>
            </div>
        </header>
    );
};

export default Header;