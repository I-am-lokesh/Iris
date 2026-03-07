"use client"
import React from 'react'
import { Message} from "./types/types";

import {MessagesContext , CurrentMessageContext} from "./lib/utils";

const Providers = ({ children } : { children: React.ReactNode }) => {
    const [messages, setMessages] = React.useState<Message[]>([]);
      const [currentMessage, setCurrentMessage] = React.useState<Message>({
            id: Date.now().toString(),
            text:"Hi I am Iris. How can I help you today?",
            timestamp: new Date(),
            duration: 0,
            language: 'en',
            role : 'user'
          });
  return (
    <MessagesContext.Provider value={{ messages, setMessages }}>
      <CurrentMessageContext.Provider value={{ currentMessage, setCurrentMessage }}>
      
       {children}
      
      </CurrentMessageContext.Provider>
    </MessagesContext.Provider>
  )
}

export default Providers