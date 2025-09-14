
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageSender, GroundingSource } from './types';
import { sendMessageToAI, searchWithGoogle, startChat } from './services/geminiService';
import Header from './components/Header';
import AiOrb from './components/AiOrb';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { GenerateContentResponse } from '@google/genai';

// FIX: Add necessary Web Speech API type declarations for TypeScript to fix compilation errors.
interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

// Polyfill for SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isListening, setIsListening] = useState<boolean>(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startChat();
        setMessages([{
            id: 'init',
            text: 'Jarvas system online. How can I assist you?',
            sender: MessageSender.SYSTEM
        }]);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleSpeechResult = useCallback((event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        if (transcript) {
            handleSendMessage(transcript);
        }
    }, []);

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition API not supported in this browser.");
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Can be changed for Urdu, e.g., 'ur-PK'

        recognition.onresult = handleSpeechResult;
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [handleSpeechResult]);

    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };
    
    const processStream = async (stream: AsyncGenerator<GenerateContentResponse>, aiMessageId: string) => {
        let fullText = '';
        let sources: GroundingSource[] = [];

        for await (const chunk of stream) {
            fullText += chunk.text;
             if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                const newSources = chunk.candidates[0].groundingMetadata.groundingChunks
                    .map((c: any) => ({
                        uri: c.web.uri,
                        title: c.web.title,
                    }))
                    .filter((s: GroundingSource) => s.uri && s.title);
                sources = [...new Set([...sources, ...newSources])];
            }
            
            setMessages(prev => prev.map(m => 
                m.id === aiMessageId ? { ...m, text: fullText, sources } : m
            ));
        }
    };


    const handleSendMessage = async (prompt: string) => {
        if (!prompt) return;

        const userMessage: Message = { id: Date.now().toString(), text: prompt, sender: MessageSender.USER };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        
        // Client-side command handling
        const lowerCasePrompt = prompt.toLowerCase();
        if (lowerCasePrompt.includes("what time is it") || lowerCasePrompt.includes("current time")) {
            const time = new Date().toLocaleTimeString();
            const timeMessage: Message = { id: (Date.now() + 1).toString(), text: `The current time is ${time}.`, sender: MessageSender.AI };
            setMessages(prev => [...prev, timeMessage]);
            setIsLoading(false);
            return;
        }

        const aiMessageId = (Date.now() + 1).toString();
        const aiMessagePlaceholder: Message = { id: aiMessageId, text: '', sender: MessageSender.AI, sources: [] };
        setMessages(prev => [...prev, aiMessagePlaceholder]);
        
        try {
            let stream;
            if (lowerCasePrompt.startsWith("search for") || lowerCasePrompt.startsWith("look up")) {
                stream = await searchWithGoogle(prompt);
            } else {
                stream = await sendMessageToAI(prompt);
            }
            await processStream(stream, aiMessageId);
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
            const errorMessage: Message = {
                id: aiMessageId,
                text: "My apologies, I seem to be having trouble connecting to my core systems. Please try again later.",
                sender: MessageSender.AI
            };
            setMessages(prev => prev.map(m => m.id === aiMessageId ? errorMessage : m));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-black">
            <Header />
            <main className="flex-1 flex flex-col items-center pt-20 pb-4 overflow-hidden">
                <AiOrb isListening={isListening} isLoading={isLoading} />
                <div ref={chatContainerRef} className="w-full max-w-4xl flex-1 overflow-y-auto px-4 scroll-smooth">
                    {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                </div>
            </main>
            <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                isListening={isListening} 
                onMicClick={handleMicClick} 
            />
        </div>
    );
};

export default App;
