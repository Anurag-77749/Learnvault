import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface BlurGateModalProps {
  imageFile: File;
  onAccept: (file: File, blurScore: number) => void;
  onRetake: () => void;
}

export const BlurGateModal: React.FC<BlurGateModalProps> = ({ imageFile, onAccept, onRetake }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [variance, setVariance] = useState<number | null>(null);
  const [isBlurry, setIsBlurry] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    // Run Laplacian Variance Check in Web Worker
    const worker = new Worker('/blur-worker.js');
    const img = new Image();
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale down image for ultra-fast processing
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);

      worker.postMessage({ imageData, width, height });
    };

    worker.onmessage = (e) => {
      const { variance: v, isBlurry: blurry } = e.data;
      setVariance(v);
      setIsBlurry(blurry);
      setAnalyzing(false);
      worker.terminate();
    };

    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col items-center">
        {/* Preview Container */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-4">
          {previewUrl && (
            <img src={previewUrl} alt="Notebook Page Preview" className="w-full h-full object-cover" />
          )}

          {/* Quality Badge Overlay */}
          <div className="absolute top-3 right-3">
            {analyzing ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-cyan-300 border border-cyan-500/30">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Analyzing Clarity...
              </span>
            ) : isBlurry ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-500/40">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Blurry ({variance?.toFixed(1)})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Sharp ({variance?.toFixed(1)})
              </span>
            )}
          </div>
        </div>

        {/* Diagnostic Status Box */}
        {analyzing ? (
          <div className="text-center py-2">
            <h4 className="text-sm font-semibold text-slate-200">OpenCV Clarity Check</h4>
            <p className="text-xs text-slate-400 mt-1">Verifying written handwritten steps are legible for AI line audit...</p>
          </div>
        ) : isBlurry ? (
          <div className="text-center py-2">
            <h4 className="text-sm font-bold text-rose-400 flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Camera Shake Detected
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Clarity score <span className="font-mono font-bold text-rose-300">{variance?.toFixed(1)}</span> is below our minimum threshold of <span className="font-mono font-bold text-slate-100">10.0</span>. Retake in steady light so AI can read every step.
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Solution Clear & Legible
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Clarity score <span className="font-mono font-bold text-emerald-300">{variance?.toFixed(1)}</span> exceeds the 10.0 standard. Ready for step audit!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex gap-3 mt-5">
          <button
            onClick={onRetake}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
          >
            Retake Photo
          </button>
          <button
            disabled={analyzing || isBlurry}
            onClick={() => variance !== null && onAccept(imageFile, variance)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
              isBlurry || analyzing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
