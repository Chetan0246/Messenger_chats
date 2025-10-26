import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

const EndCallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 17.657A10 10 0 015.343 5.343m12.314 12.314A10 10 0 005.343 5.343" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const MuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const UnmuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25H4.51c-.88 0-1.704.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75m0 0l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72" />
    </svg>
);

const KeypadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.375c-1.036 0-1.875.84-1.875 1.875v1.5c0 1.036.84 1.875 1.875 1.875H9v-5.25zm0 7.5H6.375c-1.036 0-1.875.84-1.875 1.875v1.5c0 1.036.84 1.875 1.875 1.875H9v-5.25zm4.5-7.5h-1.5v5.25h1.5v-5.25zm0 7.5h-1.5v5.25h1.5v-5.25zM18.375 9H15v-5.25h3.375c1.035 0 1.875.84 1.875 1.875v1.5c0 1.036-.84 1.875-1.875 1.875zM18.375 16.5H15v-5.25h3.375c1.035 0 1.875.84 1.875 1.875v1.5c0 1.036-.84 1.875-1.875 1.875z" />
    </svg>
);

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51-2.222m2.51 2.222l2.222-2.51m-2.222 2.51l2.222 2.51M3 10.5a8.25 8.25 0 0113.828-5.898l-3.58 3.582a4.5 4.5 0 00-5.65 5.65l-3.582 3.58A8.25 8.25 0 013 10.5z" />
    </svg>
);

const AVATAR_COLORS = [
    { bg: 'bg-blue-500', border: 'border-blue-400', shadowRgba: 'rgba(96, 165, 250, 0.4)' },
    { bg: 'bg-red-500', border: 'border-red-400', shadowRgba: 'rgba(239, 68, 68, 0.4)' },
    { bg: 'bg-green-500', border: 'border-green-400', shadowRgba: 'rgba(34, 197, 94, 0.4)' },
    { bg: 'bg-purple-500', border: 'border-purple-400', shadowRgba: 'rgba(168, 85, 247, 0.4)' },
    { bg: 'bg-yellow-500', border: 'border-yellow-400', shadowRgba: 'rgba(234, 179, 8, 0.4)' },
    { bg: 'bg-indigo-500', border: 'border-indigo-400', shadowRgba: 'rgba(129, 140, 248, 0.4)'},
];

const getAvatarColor = (name: string) => {
    if (!name || name.length === 0) return AVATAR_COLORS[0];
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
};

interface CallScreenProps {
    contact: Contact;
    status: 'ringing' | 'connected';
    startTime: number | null;
    onEndCall: () => void;
}

const CallControl: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
    ariaLabel: string;
}> = ({ icon, label, onClick, isActive, ariaLabel }) => (
    <div className="flex flex-col items-center space-y-2">
        <button
            onClick={onClick}
            className={`rounded-full w-16 h-16 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isActive ? 'bg-white/90 text-gray-800' : 'bg-white/20 hover:bg-white/30'
            }`}
            aria-label={ariaLabel}
            aria-pressed={isActive}
        >
            {icon}
        </button>
        <span className="text-sm font-medium text-gray-200">{label}</span>
    </div>
);


const CallScreen: React.FC<CallScreenProps> = ({ contact, status, startTime, onEndCall }) => {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);

    const color = getAvatarColor(contact.name);

    useEffect(() => {
        if (status === 'connected' && startTime) {
            const interval = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status, startTime]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const ringingAnimationClass = status === 'ringing' ? 'animate-pulsate-ring' : '';

    return (
        <div
            className="fixed inset-0 bg-gray-800 text-white z-50 flex flex-col justify-between items-center py-16 px-6"
            style={{ '--pulsate-color': color.shadowRgba } as React.CSSProperties}
        >
            <style>
                {`
                @keyframes pulsate-ring {
                    0% { box-shadow: 0 0 0 0px var(--pulsate-color, rgba(96, 165, 250, 0.4)); }
                    100% { box-shadow: 0 0 0 30px rgba(96, 165, 250, 0); }
                }
                .animate-pulsate-ring {
                    animation: pulsate-ring 1.5s infinite;
                }
                `}
            </style>
            <div className={`absolute inset-0 ${color.bg} opacity-20 blur-3xl`}></div>
            
            <div className="flex flex-col items-center text-center">
                <div 
                    className={`relative mb-6 w-32 h-32 rounded-full ${color.bg} flex items-center justify-center font-bold text-6xl border-4 ${color.border} ${ringingAnimationClass}`}
                >
                    {contact.name.charAt(0)}
                </div>
                <h1 className="text-4xl font-bold">{contact.name}</h1>
                <p className="text-gray-300 mt-2 text-lg">
                    {status === 'ringing' && 'Ringing...'}
                    {status === 'connected' && formatDuration(duration)}
                </p>
            </div>
            
            <div className="flex flex-col items-center w-full space-y-10">
                 <div className="grid grid-cols-3 gap-x-12 gap-y-8">
                    <CallControl 
                        icon={isMuted ? <MuteIcon /> : <UnmuteIcon />} 
                        label="Mute" 
                        onClick={() => setIsMuted(!isMuted)} 
                        isActive={isMuted}
                        ariaLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    />
                    <CallControl 
                        icon={<KeypadIcon />} 
                        label="Keypad" 
                        ariaLabel="Show keypad"
                    />
                    <CallControl 
                        icon={<SpeakerIcon />} 
                        label="Speaker" 
                        onClick={() => setIsSpeaker(!isSpeaker)} 
                        isActive={isSpeaker}
                        ariaLabel={isSpeaker ? 'Use earpiece' : 'Use speakerphone'}
                    />
                </div>
                <button
                    onClick={onEndCall}
                    className="bg-red-600 hover:bg-red-700 rounded-full w-20 h-20 flex items-center justify-center transition-colors shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="End Call"
                >
                    <EndCallIcon />
                </button>
            </div>
        </div>
    );
};

export default CallScreen;
