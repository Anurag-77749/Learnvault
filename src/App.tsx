import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { ScreenId } from './components/Navigation';
import { Cylindrical3DDisplay } from './components/Cylindrical3DDisplay';
import { WastedDaysScreen } from './components/WastedDaysScreen';
import { CloudSyncModal } from './components/CloudSyncModal';
import { cloudSyncService, SyncState } from './services/cloudSyncService';
import { cleanupSampleProjects } from './services/projectService';
import { X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('today');
  const [timerTopic, setTimerTopic] = useState<string | undefined>(undefined);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getState());

  useEffect(() => {
    cloudSyncService.init();
    cleanupSampleProjects();
    return cloudSyncService.subscribe((state) => setSyncState(state));
  }, []);

  // Compute live stats for header
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) || [];
  const totalStudyMinutes = allLogs.reduce((acc, l) => acc + (l.studyMinutes || 0), 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  
  const streakCount = Math.max(1, allLogs.filter((l) => (l.studyMinutes || 0) > 0 || (l.questionsCount || 0) > 0).length);
  const wastedDaysCount = useLiveQuery(() => db.wastedDays.count()) || 0;

  const handleStartTimerWithTopic = (topicTitle?: string) => {
    if (topicTitle) {
      setTimerTopic(topicTitle);
    }
    setActiveScreen('timer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#EEF2FB] to-[#DFE7F6] text-[#0F172A] flex flex-col antialiased selection:bg-[#3B82F6] selection:text-white">
      {/* 3D Cylindrical Display Rotunda Experience */}
      <Cylindrical3DDisplay
        activeScreen={activeScreen === 'wasted' ? 'today' : activeScreen}
        onSelectScreen={(screen) => setActiveScreen(screen)}
        streakCount={streakCount}
        totalStudyHours={totalStudyHours}
        wastedDaysCount={wastedDaysCount}
        syncState={syncState}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onStartTimerWithTopic={handleStartTimerWithTopic}
      />

      {/* Wasted Days Modal Overlay (when clicked from header) */}
      <AnimatePresence>
        {activeScreen === 'wasted' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 border-2 border-white shadow-2xl p-4 sm:p-7"
            >
              <button
                onClick={() => setActiveScreen('today')}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <WastedDaysScreen />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};

export default App;
