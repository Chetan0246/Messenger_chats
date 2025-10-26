import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface UserProfileProps {
  profile: UserProfile;
  onSave: (newProfile: UserProfile) => void;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const UserProfileComponent: React.FC<UserProfileProps> = ({ profile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.name);

    useEffect(() => {
        setName(profile.name);
    }, [profile]);

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name: name.trim() });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setName(profile.name);
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-900 p-3 border-t border-gray-700 mt-auto">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center font-bold">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-gray-700 text-white p-1 rounded w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    ) : (
                        <h3 className="font-semibold text-gray-200 truncate">{name}</h3>
                    )}
                </div>
                {isEditing ? (
                    <div className="flex space-x-2">
                        <button onClick={handleSave} className="text-xs text-green-400 hover:underline">Save</button>
                        <button onClick={handleCancel} className="text-xs text-gray-400 hover:underline">Cancel</button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                        title="Edit Profile"
                    >
                        <EditIcon />
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserProfileComponent;
