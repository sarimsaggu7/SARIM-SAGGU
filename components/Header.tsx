
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="absolute top-0 left-0 right-0 p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-10">
            <h1 className="text-3xl font-bold text-center text-cyan-300 tracking-widest" style={{ textShadow: '0 0 8px #22d3ee' }}>
                JARVAS
            </h1>
        </header>
    );
};

export default Header;
