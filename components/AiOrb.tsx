
import React from 'react';

interface AiOrbProps {
    isListening: boolean;
    isLoading: boolean;
}

const AiOrb: React.FC<AiOrbProps> = ({ isListening, isLoading }) => {
    const orbStateClasses = isListening 
        ? 'border-yellow-400 animate-pulse-strong' 
        : isLoading 
        ? 'border-red-500 animate-spin-slow' 
        : 'border-cyan-400 animate-pulse';

    return (
        <div className="flex justify-center items-center my-8">
            <div className={`relative w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-500 ${orbStateClasses}`}
                 style={{ borderWidth: '2px', boxShadow: '0 0 20px currentColor, inset 0 0 20px currentColor' }}>
                <div className="absolute w-full h-full rounded-full bg-cyan-500 opacity-10 animate-ping"></div>
                <div className="w-1/2 h-1/2 bg-gray-800 rounded-full shadow-inner"></div>
            </div>
            <style>{`
                @keyframes animate-pulse-strong {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                .animate-pulse-strong {
                    animation: animate-pulse-strong 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes animate-spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: animate-spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default AiOrb;
