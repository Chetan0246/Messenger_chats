import React, { useRef, useEffect } from 'react';

const EMOJIS = [
  '😀', '😂', '😍', '🤔', '😎', '😭', '😡', '👍',
  '👎', '❤️', '🔥', '🎉', '🚀', '💯', '🙏', '🙌',
  '😊', '🥳', '🤯', '😴', '👋', '👀', '✨', '💀',
];

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Focus the first emoji button when the picker opens
    const firstEmojiButton = pickerRef.current?.querySelector('button');
    firstEmojiButton?.focus();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-3 bg-gray-700 border border-gray-600 rounded-xl p-3 shadow-lg w-64 z-20"
      style={{ left: '5rem' }}
      role="dialog"
      aria-label="Emoji picker"
    >
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelectEmoji(emoji)}
            className="text-2xl rounded-lg p-1 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Select emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;