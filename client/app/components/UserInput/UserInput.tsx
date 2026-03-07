"use client"
import { MessagesContext, CurrentMessageContext } from '@/app/lib/utils';
import { Message } from '@/app/types/types';
import Link from 'next/link';
import React, { useRef, useState, useContext, useEffect} from 'react'

const UserInput = () => {

  const [isRecording, setIsRecording] = useState(false);   
  const {setMessages} = useContext(MessagesContext)!;
  const {setCurrentMessage} = useContext(CurrentMessageContext)!;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [recordingTime, setRecordingTime] = useState(0); 

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('Disconnected');

   useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setStatus('Disconnected');
    setRecordingTime(0);
    setTranscription('');
    setResponse('');
  };

  const startRecording = async () => {    
    try {
      setStatus('Connecting...');
      
      // Get ephemeral token from your API route
      const tokenResponse = await fetch('/api/session');
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up audio context for playback
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      // Handle incoming audio track
      pc.ontrack = (e) => {
        const remoteStream = e.streams[0];
        const audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        audioEl.srcObject = remoteStream;
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        setStatus('Connected');
        setIsRecording(true);
        
        // Configure session
        const sessionUpdate = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful AI assistant named Iris. Respond naturally to the user.',
            voice: 'marin',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            }
          }
        };
        dc.send(JSON.stringify(sessionUpdate));
      };

      dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        handleRealtimeEvent(event);
      };

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp'
        }
      });

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text()
      };
      await pc.setRemoteDescription(answer);

      // Start recording time
      setRecordingTime(0);
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      // Save interval ID to state or ref if you need to clear it later
      timerRef.current = interval;

    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('Error: ' + (error as Error).message);
    }
  };

  const handleRealtimeEvent = (event: any) => {
    // console.log('Event:', event.type);

    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        // User's speech transcription
        setTranscription(prev => prev + ' ' + event.transcript); 
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: event.transcript,
          timestamp: new Date(),
          duration: recordingTime || undefined,
          language: 'en',
          role: 'user'
        }]);

        break;

      case 'response.audio_transcript.delta':
        // AI response transcription (streaming)
        setResponse(prev => prev + event.delta);
        // setCurrentMessage({
        //   id: Date.now().toString(),
        //   text: response + event.delta,
        //   timestamp: new Date(),
        //   duration: recordingTime || undefined,
        //   language: 'en',
        //   role: 'assistant'
        // });       
        break;

      case 'response.audio_transcript.done':
        // Complete AI response
        setResponse(prev => prev + '\n\n');
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: event.transcript,
          language: 'en',
          timestamp: new Date(),
          role: 'assistant'
        }]);
        setCurrentMessage({
          id: Date.now().toString(),
          text: event.transcript,
          timestamp: new Date(),
          duration: recordingTime || undefined,
          language: 'en',
          role: 'assistant'
        });
        console.log(event.transcript);
        break;

      case 'response.done':
        console.log('Response completed');
        break;

      case 'error':
        console.error('Realtime API error:', event.error);
        setStatus('Error: ' + event.error.message);
        break;
    }
  };

  const stopRecording = () => {
    cleanup();
    setIsRecording(false);
    setStatus('Disconnected');

  };


  // Stop recording
  // const stopRecording = () => {
  //   if (mediaRecorderRef.current && isRecording) {
  //     mediaRecorderRef.current.stop();
  //     setIsRecording(false);
      
  //     if (timerRef.current) {
  //       clearInterval(timerRef.current);
  //     }
  //   }
  //   // console.log(audioChunksRef.current);
  // };

  // Transcribe audio using OpenAI Whisper API
  // const transcribeAudio = async (audioBlob: Blob) => {
  //   setIsProcessing(true);
    
    
  //   try {
  //     const formData = new FormData();
  //     const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
  //     formData.append('file', audioFile); // The key MUST be 'file'
  //     const response = await fetch('/api/transcribe', {
  //       method: 'POST',
  //       body: formData, // Do NOT set 'Content-Type': 'multipart/form-data' header; fetch/axios does this automatically
  //     });      
      
  //     if (!response.ok) {
  //       // If the response is not ok, throw an error with the server's message
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  //     }
  //      const data = await response.json();
  //      console.log('Transcription result:', data.transcription);
  //     // Save transcription with metadata
      
  //     const newTranscription: Message = {
  //       id: Date.now().toString(),
  //       text:data.transcription,
  //       timestamp: new Date(),
  //       duration: recordingTime || undefined,
  //       language: 'en',
  //       role : 'user'
  //     };
      
  //     setMessages(prev => [...prev, newTranscription]);
      
  //     setRecordingTime(0);

  //     generateSpeech(data.transcription);
    
  //   } catch (err) {
  //     setError('Failed to transcribe audio. Please try again.');
  //     console.error('Transcription error:', err);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // const generateSpeech = async (inputText: string) => {   
    
  //   try {
  //     const formData = new FormData();   
  //     formData.append('inputText', inputText);
  //     const response = await fetch('/api/tts', {
  //       method: 'POST',
  //       body: formData, // Do NOT set 'Content-Type': 'multipart/form-data' header; fetch/axios does this automatically
  //     });    
  //     if (!response.ok) {
  //       // Handle API error here
  //       console.error("API failed:", response.statusText);
  //       return;
  //     }  
  //   const data = await response.json();
  //   const { textResponse, audioData } = data;  

  //   const audioBinaryString = atob(audioData);
  //   const len = audioBinaryString.length;
  //   const bytes = new Uint8Array(len);
  //   for (let i = 0; i < len; i++) {
  //       bytes[i] = audioBinaryString.charCodeAt(i);
  //   }

  //   // Create the Blob from the decoded byte array (use 'audio/mp3' as the MIME type)
  //   const audioBlob = new Blob([bytes], { type: 'audio/mp3' }); 

  //   // const audioBlob = await response.blob();
  //   const url = URL.createObjectURL(audioBlob); // Creates the temporary URL
  //   setAudioUrl(url); // Sets the URL in context for the IrisTextBox to use
  //   // const audio = new Audio(url); // Creates a new audio object
  //   // audio.play(); // Plays the audio
  //   // console.log("playing audio...");
  //   const newTranscription: Message = {
  //       id: Date.now().toString(),
  //       text: textResponse,
  //       timestamp: new Date(),
  //       duration: recordingTime || undefined,
  //       language: 'en',
  //       role : 'assistant'
  //     }; 
  //     setCurrentMessage(newTranscription);      
  //     setMessages(prev =>  [...prev, newTranscription]);
        
  //   } catch (err) {
  //     console.error('TTS error:', err);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='flex flex-col justify-center items-center w-full h-[20vh] '>

        <div className='z-20 rounded-full bg-white h-[48px] w-[48px] flex justify-center items-center cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out'
          onClick={isRecording ? stopRecording : startRecording}           
          >
           
            <svg width="16" height="22" viewBox="0 0 24 33" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.75 19.8C10.4924 19.8 9.42799 19.3644 8.55679 18.4932C7.68559 17.622 7.24999 16.5576 7.24999 15.3V4.5C7.24999 3.2424 7.68559 2.178 8.55679 1.3068C9.42799 0.435599 10.4924 0 11.75 0C13.0076 0 14.072 0.435599 14.9432 1.3068C15.8144 2.178 16.25 3.2424 16.25 4.5V15.3C16.25 16.5576 15.8144 17.622 14.9432 18.4932C14.072 19.3644 13.0076 19.8 11.75 19.8ZM10.4 32.85V26.9167C7.42999 26.5774 4.96249 25.3036 2.99749 23.0953C1.03249 20.8867 0.0499878 18.2883 0.0499878 15.3H2.74999C2.74999 17.79 3.62749 19.9125 5.38249 21.6675C7.13749 23.4225 9.25999 24.3 11.75 24.3C14.24 24.3 16.3625 23.4225 18.1175 21.6675C19.8725 19.9125 20.75 17.79 20.75 15.3H23.45C23.45 18.2883 22.4675 20.8867 20.5025 23.0953C18.5375 25.3036 16.07 26.5774 13.1 26.9167V32.85H10.4ZM11.75 17.1C12.26 17.1 12.6875 16.9275 13.0325 16.5825C13.3775 16.2375 13.55 15.81 13.55 15.3V4.5C13.55 3.99 13.3775 3.5625 13.0325 3.2175C12.6875 2.8725 12.26 2.7 11.75 2.7C11.24 2.7 10.8125 2.8725 10.4675 3.2175C10.1225 3.5625 9.94999 3.99 9.94999 4.5V15.3C9.94999 15.81 10.1225 16.2375 10.4675 16.5825C10.8125 16.9275 11.24 17.1 11.75 17.1Z" fill="#260246"/>
            </svg>
        </div>        
        {isRecording && <div className='text-white font-instrument p-2'>Recording... {formatTime(recordingTime)}</div>}
        {status && <div className='text-white font-instrument p-2 underline text-lg'>{status}</div>}
        <div className='text-white font-instrument p-2 underline text-lg'>
            <Link href="/chats">Switch to Chat Mode</Link>
        </div>
        {/* <div className='text-white font-instrument p-2 underline text-lg'>
            Transcription- {transcription && transcription}
            
        </div> */}
          {/* <div className='text-white font-instrument p-2 underline text-lg'>
           
            Response - {response && response}
           
          </div> */}
        {/* <div className='text-white font-instrument p-2 underline text-lg'>
            currentMessage - {currentMessage && currentMessage.text} - {currentMessage && formatDate(currentMessage.timestamp)}
        </div> */}

        {/* <div className='text-white font-instrument p-2 underline text-lg'>
            messages - {messages && messages.map(msg => (
                <div key={msg.id}>
                    {msg.text} - {formatDate(msg.timestamp)} - {msg.role}
                </div>
            ))}
        </div> */}
       
    </div>
  )
}

export default UserInput