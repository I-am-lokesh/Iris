"use client"
import React, {useContext, Fragment, useRef, useEffect} from 'react'
import GlassCard from '../GlassCard/GlassCard'

import { MessagesContext } from '@/app/lib/utils'

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: linear-gradient(to right, 
                transparent 3.5px, 
                #FFFFFF 3.5px, 
                #FFFFFF 4.5px, 
                transparent 4.5px); /* Creates a 1px white line in the center (3.5px to 4.5px) */
    border-radius: 10px;   
  }

  /* Handle (the moving bar) */
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #FFFFFF; 
    border-radius: 50px;   
    border: 2px solid transparent; 
  }

  /* Handle on hover */
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #78716c;
  }
`;

const ChatBox = () => {
  const {messages} = useContext(MessagesContext)!;
  // Ref for auto-scrolling to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Tailwind Class Map for alignment and color coding
  const getMessageClasses = (sender: 'user' | 'assistant' | undefined) => {
    if(!sender) return { alignment: 'justify-start', cardClasses: 'bg-gray-200 text-gray-800' };
    if (sender === 'user') {
      return {
        alignment: 'justify-end', // Aligns the message bubble to the right
        cardClasses: 'bg-indigo-500 text-white', // User message color
      };
    }
    // Assumes 'system' or 'assistant' role for left alignment
    return {
      alignment: 'justify-start', // Aligns the message bubble to the left
      cardClasses: 'bg-gray-200 text-gray-800', // System message color
    };
  };

  return (
    <div className="w-[56vw] h-[64vh] flex flex-col justify-center items-center backdrop-blur-[10] rounded-xl">
      {/* Inject custom scrollbar styles for webkit browsers (Chrome, Safari, Edge) */}
      <style>{customScrollbarStyles}</style>
      <div className="w-full flex flex-col space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar">
      {messages.length === 0 ? (
        <div className="w-full h-full flex justify-center items-center">
          <GlassCard>
            No messages yet. Start the conversation!
          </GlassCard>
        </div>
      ) : (
        <Fragment>
          {messages.map((msg) => {
            const { alignment, cardClasses } = getMessageClasses(msg?.role);

            return(  
              <div 
                  key={msg.id} 
                  className={`flex w-full ${alignment}`}
                >
                  <GlassCard key={msg.id}>
                    {msg.text}
                  </GlassCard>
            </div>
          )})}
           <div ref={messagesEndRef} />
        </Fragment>
      )}
      </div>
    </div>
  )
}

export default ChatBox