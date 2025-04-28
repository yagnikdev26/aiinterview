'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Dictaphone = () => {
  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    }
  };

  return (
    <div className='flex items-center gap-7'>
      <div className='relative'>
          <div className='w-20 h-20 flex justify-center cursor-pointer' onClick={toggleListening}>
            {isListening ? (
              <DotLottieReact
               src="voice.json" 
               loop 
               autoplay
                />
          ) : (
            <div className='w-20 h-20  cursor-pointer flex justify-center '><Image src="/voice.svg" alt="mic" width={24} height={24} className='cursor-pointer'/></div>
          )}
          </div>
      </div>
    </div>
  );
};

export default Dictaphone;
