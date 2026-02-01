
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mentor } from '../types';
import { decode, decodeAudioData, createPcmBlob } from '../services/audioUtils';

interface LiveSessionProps {
  mentor: Mentor;
  onClose: () => void;
}

const LiveSession: React.FC<LiveSessionProps> = ({ mentor, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContexts = useRef<{
    input: AudioContext;
    output: AudioContext;
  } | null>(null);
  
  const nextStartTime = useRef(0);
  const activeSources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContexts.current = { input: inputCtx, output: outputCtx };

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setIsActive(true);
            setIsConnecting(false);

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputCtx;
              nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                activeSources.current.delete(source);
              });

              source.start(nextStartTime.current);
              nextStartTime.current += buffer.duration;
              activeSources.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              activeSources.current.forEach(s => s.stop());
              activeSources.current.clear();
              nextStartTime.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            setError('Connection lost. Please try again.');
            setIsActive(false);
          },
          onclose: () => {
            console.log('Live session closed');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: mentor.voiceName } }
          },
          systemInstruction: mentor.systemInstruction
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start session');
      setIsConnecting(false);
    }
  }, [mentor]);

  const stopSession = () => {
    if (sessionRef.current) {
      // In a real implementation, we would call session.close() if available
      // For this SDK, we'll rely on the object being disposed
      sessionRef.current = null;
    }
    audioContexts.current?.input.close();
    audioContexts.current?.output.close();
    setIsActive(false);
    onClose();
  };

  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-between p-8">
      <div className="w-full flex justify-between items-center">
        <button onClick={stopSession} className="p-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Live Mentor</span>
        <div className="w-8" />
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className={`w-48 h-48 rounded-full ${mentor.bgColor} flex items-center justify-center text-7xl shadow-xl border-8 border-white animate-pulse`}>
          {mentor.avatar}
        </div>
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${mentor.color}`}>{mentor.name}</h2>
          <p className="text-slate-500 font-medium">{isActive ? 'Listening...' : (isConnecting ? 'Connecting...' : 'Starting Session...')}</p>
        </div>
        
        {isActive && (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`w-2 h-8 ${mentor.bgColor} rounded-full animate-bounce`} 
                style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="w-full space-y-4">
        <p className="text-center text-slate-400 text-sm px-8 leading-relaxed">
          Talk freely with {mentor.name}! Your mentor is here to help you learn and grow.
        </p>
        <button
          onClick={stopSession}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default LiveSession;
