import { Message, Sender, Contact, UserProfile } from '../types';
import { encrypt } from './encryptionService';

const API_LATENCY = 400; // ms
const DB_KEY = 'messenger_conversations';
const PROFILE_KEY = 'messenger_user_profile';

const MOCK_CONTACTS_FOR_API: Contact[] = [
    { id: 'contact-1', name: 'Alice', status: 'online' },
    { id: 'contact-2', name: 'Bob', status: 'offline', lastSeen: new Date(Date.now() - 1000 * 60 * 15) },
    { id: 'contact-3', name: 'Charlie', status: 'online' },
];

const createInitialConversations = (contacts: Contact[]): Record<string, Message[]> => {
    const conversations: Record<string, Message[]> = {};
    contacts.forEach(contact => {
        const welcomeText = `This is the beginning of your encrypted conversation with ${contact.name}.`;
        conversations[contact.id] = [
            {
                id: `welcome-${contact.id}`,
                sender: Sender.BOT,
                text: welcomeText,
                encryptedText: encrypt(welcomeText),
                timestamp: new Date(),
                type: 'text',
                read: true,
            }
        ];
    });
    return conversations;
};

const getDb = (): Record<string, Message[]> => {
    const dbString = localStorage.getItem(DB_KEY);
    if (!dbString) return {};
    const db = JSON.parse(dbString);
    Object.keys(db).forEach(contactId => {
        db[contactId] = db[contactId].map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
        }));
    });
    return db;
};

const saveDb = (db: Record<string, Message[]>) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const initApi = (): void => {
    if (!localStorage.getItem(DB_KEY)) {
        console.log("Initializing mock database...");
        const initialData = createInitialConversations(MOCK_CONTACTS_FOR_API);
        saveDb(initialData);
    }
    if (!localStorage.getItem(PROFILE_KEY)) {
        const defaultProfile: UserProfile = { name: 'You' };
        saveUserProfile(defaultProfile);
    }
};

export const fetchMessages = async (contactId: string): Promise<Message[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getDb();
            resolve(db[contactId] || []);
        }, API_LATENCY);
    });
};

type NewMessagePayload = Omit<Message, 'id' | 'timestamp' | 'read'>;

export const postMessage = async (contactId: string, messagePayload: NewMessagePayload): Promise<Message> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getDb();
            const newMessage: Message = {
                ...messagePayload,
                id: Date.now().toString(),
                timestamp: new Date(),
                read: messagePayload.sender === Sender.BOT, 
            };
            if (!db[contactId]) {
                db[contactId] = [];
            }
            db[contactId].push(newMessage);
            saveDb(db);
            resolve(newMessage);
        }, API_LATENCY);
    });
};

export const deleteMessageApi = async (contactId: string, messageId: string): Promise<void> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const db = getDb();
            if (db[contactId]) {
                db[contactId] = db[contactId].map(msg =>
                    msg.id === messageId ? { ...msg, text: '', encryptedText: '', isDeleted: true, type: 'text' } : msg
                );
                saveDb(db);
            }
            resolve();
        }, API_LATENCY);
    });
};

export const editMessageApi = async (contactId: string, messageId: string, newText: string): Promise<Message | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getDb();
            let updatedMessage: Message | null = null;
            if (db[contactId]) {
                db[contactId] = db[contactId].map(msg => {
                    if (msg.id === messageId) {
                        updatedMessage = { ...msg, text: newText, encryptedText: encrypt(newText), isEdited: true };
                        return updatedMessage;
                    }
                    return msg;
                });
                saveDb(db);
            }
            resolve(updatedMessage);
        }, API_LATENCY);
    });
};

export const markAsReadApi = async (contactId: string, messageId: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getDb();
            if (db[contactId]) {
                db[contactId] = db[contactId].map(msg =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                );
                saveDb(db);
            }
            resolve();
        }, API_LATENCY / 2);
    });
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const profileString = localStorage.getItem(PROFILE_KEY);
            if (profileString) {
                resolve(JSON.parse(profileString));
            } else {
                resolve({ name: 'You' });
            }
        }, API_LATENCY / 2);
    });
};

export const saveUserProfile = (profile: UserProfile): void => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};
