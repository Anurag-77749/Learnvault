import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrbitalLogo } from '../components/OrbitalLogo';
import { AuthService } from '../api/client';
import { KeyRound, School, UserCheck, ShieldAlert, Sparkles, QrCode } from 'lucide-react';

export const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode: 'code' or 'invite'
  const [mode, setMode] = useState<'code' | 'invite'>('code');

  // Form Fields
  const [schoolCode, setSchoolCode] = useState('DEMO01');
  const [classCode, setClassCode] = useState('080101');
  const [inviteToken, setInviteToken] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Two-step confirmation state
  const [lookupData, setLookupData] = useState<{
    first_name: string;
    class_no: number;
    section_label: string;
    roll_no: number;
    pin_set: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Step 1: Lookup Student
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'invite') {
        const inviteInfo = await AuthService.resolveInvite(inviteToken);
        const bindInfo = await AuthService.bindDevice(inviteToken, 'web-device-client-01', classCode);
        setLookupData({
          first_name: bindInfo.first_name,
          class_no: bindInfo.class_level,
          section_label: bindInfo.section_label,
          roll_no: bindInfo.roll_no,
          pin_set: bindInfo.pin_set,
        });
      } else {
        const data = await AuthService.studentLookup({
          school_code: schoolCode.trim().toUpperCase(),
          class_code: classCode.trim(),
        });
        setLookupData(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Student not found. Please check your school and class code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Login or Set PIN
  const handleLoginOrSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (lookupData && !lookupData.pin_set) {
        // Set PIN flow
        await AuthService.studentSetPin({
          school_code: schoolCode,
          class_code: classCode,
          pin,
          confirm_pin: confirmPin,
        });
        navigate('/student/dashboard');
      } else {
        // Login flow
        await AuthService.studentLogin({
          school_code: schoolCode,
          class_code: classCode,
          pin,
        });
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      if (err.response?.status === 423) {
        setLockoutSeconds(err.response.data.seconds_remaining || 900);
        setError(`Account locked due to multiple failed PIN attempts.`);
      } else {
        setError(err.response?.data?.message || 'Invalid 4-digit PIN.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Animated Brand Header */}
        <OrbitalLogo size={56} showText={true} className="mb-6" />

        <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
          {/* Mode Switcher */}
          {!lookupData && (
            <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('code')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  mode === 'code' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Class Code
              </button>
              <button
                type="button"
                onClick={() => setMode('invite')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  mode === 'invite' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Invite Link / QR
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Student Lookup Form */}
          {!lookupData ? (
            <form onSubmit={handleLookup} className="flex flex-col gap-4">
              {mode === 'code' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional School Code</label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                        placeholder="e.g. DEMO01"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm uppercase focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      6-Digit Student Code <span className="text-[11px] font-normal text-slate-500">(Class + Sec + Roll)</span>
                    </label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="e.g. 080101 (Class 8A Roll 01)"
                      maxLength={6}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm tracking-widest focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Classroom Invite Code / QR String</label>
                    <div className="relative">
                      <QrCode className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={inviteToken}
                        onChange={(e) => setInviteToken(e.target.value)}
                        placeholder="Paste invite token..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll / Code</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="e.g. 080101"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition mt-2"
              >
                {loading ? 'Locating Student...' : 'Continue to Verification'}
              </button>
            </form>
          ) : (
            /* STEP 2: Identity Confirmation Card & PIN Entry */
            <form onSubmit={handleLoginOrSetPin} className="flex flex-col gap-4">
              <div className="rounded-2xl bg-slate-950 border border-indigo-500/30 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-2">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Is this {lookupData.first_name}?
                </h3>
                <p className="text-xs text-cyan-300 font-medium mt-0.5">
                  Class {lookupData.class_no}{lookupData.section_label} • Roll #{lookupData.roll_no}
                </p>
              </div>

              {!lookupData.pin_set ? (
                <>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>First-time setup: Create a 4-digit secret PIN.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Create 4-Digit PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-lg tracking-widest text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm 4-Digit PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-lg tracking-widest text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Your 4-Digit PIN</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-lg tracking-widest text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setLookupData(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Not Me
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                >
                  {loading ? 'Verifying...' : lookupData.pin_set ? 'Enter Learning App' : 'Set PIN & Enter'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer switch for teachers */}
        <p className="text-xs text-slate-500 mt-6">
          Are you a teacher?{' '}
          <a href="/teacher/login" className="text-indigo-400 font-semibold hover:underline">
            Teacher Console
          </a>
        </p>
      </div>
    </div>
  );
};
