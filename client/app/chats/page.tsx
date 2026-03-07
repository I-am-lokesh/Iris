import React from 'react'
import ChatBox from '../components/ChatBox/ChatBox'
import ChatInput from '../components/ChatInput/ChatInput'

const page = () => {
  return ( 
    <div className="flex flex-col h-full max-h-full">
    <ChatBox />   
    <ChatInput /> 
    </div>   
  )
}

export default page