import React from 'react';

const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);


const Welcome: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-900">
      <MessageIcon />
      <h2 className="text-2xl font-semibold text-gray-300">Welcome to Messenger</h2>
      <p className="text-gray-500 mt-2">Select a contact from the list to start an encrypted conversation.</p>
    </div>
  );
};

export default Welcome;
