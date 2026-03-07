"use client"
import React, { useContext, useState } from 'react'
import { Message } from '@/app/types/types'
import { MessagesContext } from '@/app/lib/utils'

interface ChatInputProps {
    // In a real application, this would hook into the MessagesContext's addMessage function.
    onSendMessage?: (text: string) => void; 
}

const ChatInput = ({ onSendMessage = (text) => console.log('Message Sent:', text) }: ChatInputProps) => {

  const {setMessages} = useContext(MessagesContext)!;

  const [inputValue, setInputValue] = useState('');
  const handleSend = async () => {
        const messageText = inputValue.trim();
        if (messageText) {
            onSendMessage(messageText);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: messageText,
              timestamp: new Date(),
              duration: undefined,
              language: 'en',
              role: 'user'
            }]);
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });
            const data = await response.json();
            console.log('API Response:', data);
            setInputValue('');
        }
        
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const isInputValid = inputValue.trim().length > 0;

  return (
    <div className='mt-4 w-full rounded-2xl flex items-center shadow-xl backdrop-blur-sm border border-white/40 bg-white/10'>
        <input  value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown} 
                className='flex-grow p-4 bg-transparent outline-none text-[#FFFFFF] placeholder-[#FFFFFF] text-base'
                placeholder='Type your message...'  
        />
        <button
                onClick={handleSend}
                disabled={!isInputValid}
                className={`p-4 transition duration-200 rounded-r-2xl 
                            ${isInputValid ? 'text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100' : 'text-gray-400 cursor-not-allowed'}`}
                aria-label="Send message"
            >
                {/* Send Icon (using inline SVG for reliability) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                    <path d="m22 2-7 20-4-9-5-2Z" />
                    <path d="M22 2 11 13" />
                </svg>
            </button>
    </div>
  )
}

export default ChatInput
