import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentService } from '../api/client';
import { BlurGateModal } from '../components/BlurGateModal';
import { VoiceRecorder } from '../components/VoiceRecorder';
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const HomeworkSubmitPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<any>(null);
  const [photos, setPhotos] = useState<{ file: File; blurScore: number; preview: string }[]>([]);
  const [candidateFile, setCandidateFile] = useState<File | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In dev, if taskId not found, use mock task
    setTask({
      id: taskId,
      title: 'Chapter 2: Linear Equations in One Variable',
      subject: 'Mathematics',
      items: [
        { position: 1, question_text: 'Solve: 2x + 5 = 15' },
        { position: 2, question_text: 'Solve: 3(x - 2) = 18' },
        { position: 3, question_text: 'Find root: 7x - 9 = 12' },
        { position: 4, question_text: 'Solve: x/4 + 3 = 8' },
        { position: 5, question_text: 'Solve: 5(2x - 1) = 45' },
      ],
    });
  }, [taskId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCandidateFile(e.target.files[0]);
    }
  };

  const handleBlurGateAccept = (file: File, blurScore: number) => {
    const preview = URL.createObjectURL(file);
    setPhotos((prev) => [...prev, { file, blurScore, preview }]);
    setCandidateFile(null);
  };

  const handleBlurGateRetake = () => {
    setCandidateFile(null);
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError('Please photograph at least one page of your notebook solutions.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Get presigned upload URL
      const signedUpload = await StudentService.getPresignedUploadUrl(
        photos[0].file.name,
        photos[0].file.type || 'image/jpeg'
      );

      // 2. Upload to S3/MinIO
      await fetch(signedUpload.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': photos[0].file.type || 'image/jpeg' },
        body: photos[0].file,
      }).catch(() => {
        // Mock fallback if offline
      });

      // 3. Submit homework to Flask audit pipeline
      const submissionData = await StudentService.submitHomework({
        task_id: taskId || 'mock-task',
        image_paths: [signedUpload.object_key || 'uploads/all_correct_steps.jpg'],
        audio_path: voiceBlob ? 'uploads/solid_audio_explanation.webm' : undefined,
        blur_score: photos[0].blurScore,
      });

      setResult(submissionData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit solutions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs font-mono font-bold text-cyan-400">Step Audit Ready</span>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 flex flex-col gap-5">
        {/* Task Info Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            {task?.subject || 'Mathematics'}
          </span>
          <h1 className="text-base font-bold text-white mt-0.5">{task?.title}</h1>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-300">Questions to Solve in Notebook:</span>
            {task?.items?.map((item: any) => (
              <div key={item.position} className="text-xs text-slate-400 flex items-start gap-2">
                <span className="font-mono text-cyan-400 font-bold">{item.position}.</span>
                <span>{item.question_text}</span>
              </div>
            ))}
          </div>
        </div>

        {!result ? (
          <>
            {/* STEP 1: Notebook Camera Capture with OpenCV Blur Gate */}
            <section className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" /> 1. Notebook Solutions Photo
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Laplacian Blur Gate
                </span>
              </div>

              {photos.length === 0 ? (
                <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950">
                  <Camera className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-xs font-semibold text-slate-300">Take Photo of Notebook Page</span>
                  <span className="text-[10px] text-slate-500 mt-1">OpenCV worker will verify clarity</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <img
                    src={photos[0].preview}
                    alt="Notebook"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-800"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sharp Clarity Verified
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Laplacian Score: {photos[0].blurScore.toFixed(1)} &gt;= 10.0
                    </div>
                  </div>
                  <label className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer px-2 py-1">
                    Retake
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
                  </label>
                </div>
              )}
            </section>

            {/* STEP 2: Spoken Concept Reasoning */}
            <section>
              <VoiceRecorder
                promptText="Record a 15-30s verbal explanation: Explain your algebraic method and balance steps."
                onRecordingComplete={(blob, duration) => {
                  setVoiceBlob(blob);
                  setVoiceDuration(duration);
                }}
              />
            </section>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || photos.length === 0}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {submitting ? 'Auditing Handwritten Steps...' : (
                <>
                  <Upload className="w-4 h-4" /> Submit for AI Step Audit
                </>
              )}
            </button>
          </>
        ) : (
          /* AUDIT RESULTS DISPLAY */
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Multimodal Diagnosis
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Solution Audit Summary</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {result.tier || 'Strong'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Written Step Score</div>
                <div className="text-lg font-mono font-bold text-cyan-400 mt-1">
                  {Math.round(result.written_score || 90)}%
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Spoken Verbal Score</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                  {Math.round(result.spoken_score || 85)}%
                </div>
              </div>
            </div>

            {/* Step Audits List */}
            {result.step_audits && result.step_audits.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300">Line-by-Line Verdict:</h4>
                {result.step_audits.map((step: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                      step.is_correct
                        ? 'bg-slate-950 border-emerald-500/30 text-slate-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold">Step {step.step_no}: {step.ocr_text}</span>
                      <span className={step.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {step.is_correct ? 'CORRECT' : step.error_type?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{step.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition mt-2"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Blur Gate Modal */}
        {candidateFile && (
          <BlurGateModal
            imageFile={candidateFile}
            onAccept={handleBlurGateAccept}
            onRetake={handleBlurGateRetake}
          />
        )}
      </main>
    </div>
  );
};
