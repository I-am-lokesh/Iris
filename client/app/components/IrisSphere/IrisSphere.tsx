import React from 'react'

const IrisSphere = () => {
  return (
    <div className='absolute w-80 h-80 flex items-center justify-center'>
      <div className='rounded-full w-80 h-80 absolute bg-[#e0d4eb] blur-[40px]'>        
      </div>
      <div className='z-1 rounded-full w-72 h-72 absolute bg-radial-[at_50%_50%] from-[#260246]/100 from-[15%] via-[#260246]/51 via-[57%] to-[#e1cce8] to-[88%] 
        shadow-2xl shadow-[#260246]/0'>         
      </div>
    </div>
  )
}

export default IrisSphere