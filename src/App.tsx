import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { HomeworkSubmitPage } from './pages/HomeworkSubmitPage';
import { RemediationPage } from './pages/RemediationPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route path="/student/submit/:taskId" element={<HomeworkSubmitPage />} />
        <Route path="/student/remediation/:topicId" element={<RemediationPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
