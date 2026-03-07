import React from 'react'
import IrisSphere from '../IrisSphere/IrisSphere'
import IrisTextBox from '../IrisTextBox/IrisTextBox'
const VoiceBox = () => {
  return (
    <div className=' flex justify-center items-center w-full h-[60vh] '>
        <IrisSphere />
        <IrisTextBox />
    </div>
  )
}

export default VoiceBox