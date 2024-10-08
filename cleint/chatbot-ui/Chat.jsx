import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Connect to the server
const socket = io('https://chatapp-jt2p.onrender.com');

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(socket.connected);
    const bottomRef = useRef(null);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('prompt_response', (message) => {
            setMessages(msgs => [...msgs, { text: message, sender: 'bot' }]);
        });

        socket.on('error', (errorMessage) => {
            console.error("Socket error:", errorMessage);
            setMessages(msgs => [...msgs, { text: errorMessage, sender: 'bot' }]);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('prompt_response');
            socket.off('error');
        };
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages(msgs => [...msgs, { text: input, sender: 'user' }]);
        socket.emit('send_prompt', input);
        setInput('');
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="border rounded-lg p-3 h-96 overflow-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-2 rounded-lg text-white ${msg.sender === 'user' ? 'bg-blue-500 ml-auto' : 'bg-green-500 mr-auto'}`}>
                        {msg.text}
                    </div>
                ))}
                <div ref={bottomRef}></div>
            </div>
            <div className="mt-4 flex">
                <input
                    type="text"
                    className="flex-grow p-2 border rounded-l-lg"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    disabled={!isConnected}
                />
                <button
                    className={`bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r-lg ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={sendMessage}
                    disabled={!isConnected}
                >
                    Send
                </button>
            </div>
            {!isConnected && <div className="text-red-500">Disconnected from server, trying to reconnect...</div>}
        </div>
    );
}

export default Chat;
