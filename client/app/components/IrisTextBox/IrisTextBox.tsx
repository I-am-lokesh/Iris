"use client"
import React, { useContext, useState, useEffect } from 'react'
import { CurrentMessageContext } from '@/app/lib/utils'

interface IrisTextBoxProps {
  wordsPerMinute?: number; // Alternative: specify WPM (default: 180)
  delayBetweenWords?: number; // Or directly specify delay in ms
  animationDuration?: number; // How long each word takes to fade in (ms)
}

const IrisTextBox = ({ 
  wordsPerMinute = 600, 
  delayBetweenWords,
  animationDuration = 300 
}: IrisTextBoxProps) => {
  const { currentMessage } = useContext(CurrentMessageContext)!;
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate delay based on WPM or use custom delay
  const delay = delayBetweenWords ?? (60000 / wordsPerMinute);

  useEffect(() => {
    // Reset when message changes
    setDisplayedWords([]);
    setCurrentIndex(0);
  }, [currentMessage?.text]);

  useEffect(() => {
    if (!currentMessage?.text) return;

    const words = currentMessage.text.split(' ');
    
    if (currentIndex < words.length) {
      const timer = setTimeout(() => {
        setDisplayedWords(prev => [...prev, words[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentMessage?.text, delay]);

  return (
    <div className='z-10 font-instrument text-6xl text-white p-4  max-w-[80%] min-h-[100px] flex items-center justify-center text-center'>
      {displayedWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className='inline-block mr-2 animate-fadeIn'
          style={{
            animation: `fadeIn ${animationDuration}ms ease-in`,
          }}
        >
          {word}
        </span>
      ))}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default IrisTextBox