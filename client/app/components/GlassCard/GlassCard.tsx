import React from 'react'

const GlassCard = ({ children} : { children: React.ReactNode }) => {
  return (
     
    <div className="m-2 w-96 min-h-16 rounded-lg shadow-xl   bg-gradient-to-br from-[#FFFFFF]/30 to-[#FFFFFF]/1  backdrop-blur-[30] border border-white/10  p-4 flex flex-col justify-center items-center
      before:content-[''] before:absolute before:inset-0 before:border-white/20 ">   
      {children}
    </div>
    
  )
}

export default GlassCard