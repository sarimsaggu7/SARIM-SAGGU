
import React, { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isListening: boolean;
    onMicClick: () => void;
}

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const MicIcon: React.FC<{ isListening: boolean }> = ({ isListening }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'text-red-500 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4M5 8v3a7 7 0 0014 0V8M12 18h.01" />
    </svg>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isListening, onMicClick }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-900 bg-opacity-70 backdrop-blur-sm sticky bottom-0 border-t border-cyan-700">
            <div className="flex items-center bg-gray-800 rounded-lg p-2 shadow-inner">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "Type your command or query..."}
                    className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none px-2 h-12"
                    disabled={isLoading || isListening}
                    rows={1}
                />
                <button
                    type="button"
                    onClick={onMicClick}
                    disabled={isLoading}
                    className="p-2 text-cyan-300 hover:text-cyan-100 disabled:text-gray-600 transition-colors"
                    aria-label="Use microphone"
                >
                    <MicIcon isListening={isListening} />
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 disabled:bg-gray-600 transition-colors"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
