import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { HomeworkSubmitPage } from './pages/HomeworkSubmitPage';
import { RemediationPage } from './pages/RemediationPage';
import { TeacherLoginPage } from './pages/teacher/TeacherLoginPage';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { TaskComposerPage } from './pages/teacher/TaskComposerPage';
import { SlipTestEditorPage } from './pages/teacher/SlipTestEditorPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
        {/* Student App Routes */}
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route path="/student/submit/:taskId" element={<HomeworkSubmitPage />} />
        <Route path="/student/remediation/:topicId" element={<RemediationPage />} />

        {/* Teacher Console Routes */}
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/tasks/create" element={<TaskComposerPage />} />
        <Route path="/teacher/slip-tests/upload" element={<SlipTestEditorPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
