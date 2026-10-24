import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, Check } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, durationSeconds: number) => void;
  promptText?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  promptText = 'Explain your reasoning aloud: How did you isolate the variable and balance both sides of the equation?'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob, seconds);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to record your spoken explanation.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
    setIsPlaying(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-start gap-3 mb-4">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Voice Concept Explanation</h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{promptText}</p>
        </div>
      </div>

      {/* Recording Visualizer Container */}
      <div className="w-full py-6 rounded-xl bg-slate-950 border border-slate-850 flex flex-col items-center justify-center relative overflow-hidden">
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40 pointer-events-none">
            {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95].map((height, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-cyan-400 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="text-2xl font-mono font-bold text-slate-100 z-10">
          {formatTime(seconds)}
        </div>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1 z-10">
          {isRecording ? 'Listening & Auditing...' : audioUrl ? 'Voice Reason Captured' : 'Ready to Record'}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4 mt-5">
        {!audioUrl ? (
          !isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Mic className="w-4 h-4" /> Start Voice Explanation
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm shadow-lg shadow-rose-600/30 transition animate-bounce active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" /> Stop Recording
            </button>
          )
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-sm font-medium transition"
            >
              <Play className={`w-4 h-4 ${isPlaying ? 'fill-current' : ''}`} />
              {isPlaying ? 'Pause' : 'Play Back'}
            </button>
            <button
              onClick={resetRecording}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-sm transition"
              title="Record again"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Check className="w-3.5 h-3.5" /> Attached
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
