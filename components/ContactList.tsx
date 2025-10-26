import React from 'react';
import { Contact, UserProfile } from '../types';
import UserProfileComponent from './UserProfile';

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  userProfile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, selectedContactId, onSelectContact, userProfile, onUpdateProfile }) => {
  return (
    <div className="w-full max-w-xs bg-gray-800 border-r border-gray-700 flex flex-col">
      <header className="bg-gray-800 shadow-md p-4 flex items-center space-x-3 z-10 border-b border-gray-700 flex-shrink-0">
         <img src="https://www.gstatic.com/images/branding/product/2x/chat_48dp.png" alt="Messenger Logo" className="h-8 w-8"/>
         <h1 className="text-xl font-bold text-gray-100">Messenger</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        <h2 className="p-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Contacts</h2>
        <ul>
          {contacts.map((contact) => (
            <li
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={`flex items-center p-3 cursor-pointer transition-colors ${
                selectedContactId === contact.id
                  ? 'bg-gray-700'
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="relative w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 mr-3 flex items-center justify-center font-bold">
                  {contact.name.charAt(0)}
                  <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-800 ${contact.status === 'online' ? 'bg-green-400' : 'bg-gray-500'}`}></span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">{contact.name}</h3>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <UserProfileComponent profile={userProfile} onSave={onUpdateProfile} />
    </div>
  );
};

export default ContactList;
