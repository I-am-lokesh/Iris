import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <nav className = "flex justify-center items-center min-h-24 bg-transparent text-white">
      
         <div className="font-mono">
          <Link href="/">IRIS</Link>
         </div>
         
     
    </nav>
  )
}

export default Navbar