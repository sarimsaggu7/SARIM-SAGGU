
import React from 'react';
import { Message, MessageSender, GroundingSource } from '../types';

interface ChatMessageProps {
    message: Message;
}

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AiIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const SystemIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);


const SourceList: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => (
    <div className="mt-4 border-t border-cyan-700 pt-2">
        <h4 className="text-xs text-cyan-200 font-semibold mb-2">Sources:</h4>
        <ul className="space-y-1">
            {sources.map((source, index) => (
                <li key={index} className="truncate">
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline hover:text-cyan-200 transition-colors">
                        {index + 1}. {source.title}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.sender === MessageSender.USER;
    const isAI = message.sender === MessageSender.AI;
    const isSystem = message.sender === MessageSender.SYSTEM;

    if (isSystem) {
        return (
            <div className="flex justify-center items-center my-4 space-x-3 px-4">
                <SystemIcon />
                <p className="text-sm text-center text-gray-400 italic">{message.text}</p>
            </div>
        )
    }

    const containerClasses = isUser ? 'justify-end' : 'justify-start';
    const bubbleClasses = isUser
        ? 'bg-cyan-800 text-white rounded-br-none'
        : 'bg-gray-700 text-gray-200 rounded-bl-none';
    const icon = isUser ? <UserIcon /> : <AiIcon />;

    return (
        <div className={`flex items-start my-4 mx-2 space-x-4 ${containerClasses}`}>
            {!isUser && <div className="flex-shrink-0">{icon}</div>}
            <div className={`max-w-md md:max-w-2xl px-4 py-3 rounded-lg shadow-md ${bubbleClasses}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.sources && message.sources.length > 0 && <SourceList sources={message.sources} />}
            </div>
            {isUser && <div className="flex-shrink-0">{icon}</div>}
        </div>
    );
};

export default ChatMessage;
