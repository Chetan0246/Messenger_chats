import React, { useState, useRef, useEffect } from 'react';
import { Message as MessageType, Sender, Contact, UserProfile } from '../types';

const LockIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 4V5a1 1 0 112 0v1H9z" clipRule="evenodd" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.02 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const PhoneMissedCallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2 2m-2-2v5.5a2.5 2.5 0 01-2.5 2.5h-1.372c-.311 0-.618-.053-.91-.151a11.042 11.042 0 01-5.516-5.516C5.053 8.488 5 8.18 5 7.872V6.5A2.5 2.5 0 017.5 4H9" />
    </svg>
);


const ReadReceiptIcon = ({ read }: { read?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${read ? 'text-blue-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      {read && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />}
    </svg>
);

const DotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

interface MessageProps {
  message: MessageType;
  onDelete: (messageId: string) => void;
  onEdit: (messageId: string, newText: string) => void;
  contact: Contact;
  userProfile: UserProfile;
}

const Message: React.FC<MessageProps> = ({ message, onDelete, onEdit, contact, userProfile }) => {
  const [isEncryptedVisible, setIsEncryptedVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [showActions, setShowActions] = useState(false);
  const isUser = message.sender === Sender.USER;

  const toggleVisibility = () => setIsEncryptedVisible(!isEncryptedVisible);

  const handleEdit = () => {
    if (editedText.trim()) {
      onEdit(message.id, editedText);
      setIsEditing(false);
    }
  };
  
  const messageAlignment = isUser ? 'items-end' : 'items-start';
  const messageBubbleColor = isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200';
  const messageContainerFlexDirection = isUser ? 'flex-row-reverse' : 'flex-row';
  
  const displayedText = isEncryptedVisible ? message.encryptedText : message.text;
  const lockIconColor = isEncryptedVisible ? 'text-yellow-400' : 'text-green-400';

  if (message.type === 'call') {
    const formatDuration = (seconds: number) => {
      if (!seconds || seconds < 1) return 'less than a second';
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      let durationString = '';
      if (m > 0) durationString += `${m}m `;
      if (s > 0) durationString += `${s}s`;
      return durationString.trim();
    };
    return (
      <div className="flex justify-center items-center my-2">
        <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full flex items-center space-x-2">
           <PhoneMissedCallIcon />
           <span>Call ended</span>
           <span className="font-semibold">{formatDuration(message.callDuration || 0)}</span>
        </div>
      </div>
    );
  }

  if (message.isDeleted) {
    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="italic text-gray-500 text-sm">This message was deleted</div>
        </div>
    );
  }
  
  if (message.type === 'file' && message.uploading) {
    return (
      <div className={`flex flex-col ${messageAlignment}`}>
          <div className={`relative ${messageBubbleColor} rounded-lg px-3 py-2 transition-all duration-300 ${isUser ? 'rounded-br-none' : 'rounded-bl-none'} max-w-xs md:max-w-md`}>
              <div className="flex items-center text-sm">
                <FileIcon />
                <div className="flex-1 overflow-hidden">
                    <span className="font-medium truncate block">{message.fileName}</span>
                    <div className="w-full bg-gray-500/30 rounded-full h-1 mt-1.5">
                        <div className="bg-blue-400 h-1 rounded-full animate-pulse w-full"></div>
                    </div>
                </div>
              </div>
              <div className="flex items-center justify-end mt-1 opacity-80">
                 <span className="text-xs ml-1">Uploading...</span>
              </div>
          </div>
      </div>
    )
  }

  return (
    <div 
        className={`flex flex-col ${messageAlignment} group`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${messageContainerFlexDirection} items-end max-w-xs md:max-w-md`}>
         {!isUser && (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 mr-3 flex items-center justify-center font-bold">
                {contact.name.charAt(0)}
            </div>
        )}
        
        <div className="flex items-center order-2">
            {isUser && showActions && !isEditing && (
                <div className="flex items-center mr-2">
                    <button 
                        onClick={() => { setIsEditing(true); setShowActions(false);}} 
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700" 
                        title="Edit message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button 
                        onClick={() => onDelete(message.id)} 
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700" 
                        title="Delete message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            )}
            <div className={`relative ${messageBubbleColor} rounded-lg px-3 py-2 transition-all duration-300 ${isUser ? 'rounded-br-none' : 'rounded-bl-none'} order-1`}>
              {isEditing ? (
                  <div>
                      <input 
                          type="text" 
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="bg-blue-700 text-white p-1 rounded w-full text-sm focus:outline-none"
                          autoFocus
                      />
                      <div className="flex justify-end space-x-2 mt-1">
                          <button onClick={() => setIsEditing(false)} className="text-xs hover:underline">Cancel</button>
                          <button onClick={handleEdit} className="text-xs font-bold hover:underline">Save</button>
                      </div>
                  </div>
              ) : (
                <>
                    {message.type === 'file' ? (
                        <div className="flex items-center text-sm">
                          <FileIcon />
                          <span className="font-medium truncate">{message.fileName}</span>
                        </div>
                    ) : (
                       <p className="text-sm font-mono tracking-tighter" style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>
                            {displayedText}
                        </p>
                    )}
                    
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button onClick={toggleVisibility} className="p-1 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-colors" title={isEncryptedVisible ? "Show decrypted text" : "Show encrypted text"}>
                            <EyeIcon />
                        </button>
                    </div>

                    <div className="flex items-center justify-end mt-2 opacity-80">
                       <div className="transition-transform duration-200 ease-in-out group-hover:scale-110">
                            <LockIcon className={lockIconColor} />
                        </div>
                        {message.isEdited && <span className="text-xs ml-1 italic">edited</span>}
                        <span className="text-xs ml-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isUser && <ReadReceiptIcon read={message.read} />}
                    </div>
                </>
              )}
            </div>
        </div>

        {isUser && (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 ml-3 flex items-center justify-center font-bold order-1">
                {userProfile.name.charAt(0)}
            </div>
        )}
      </div>
    </div>
  );
};

export default Message;
