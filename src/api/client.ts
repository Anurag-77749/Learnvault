import axios from 'axios';

export const API_BASE = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('neurova_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauth
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshRes = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        const newToken = refreshRes.data.access_token;
        if (newToken) {
          localStorage.setItem('neurova_access_token', newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api(error.config);
        }
      } catch {
        localStorage.removeItem('neurova_access_token');
        localStorage.removeItem('neurova_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service APIs
export const AuthService = {
  resolveInvite: async (token: string) => {
    const res = await api.get(`/invites/${token}`);
    return res.data;
  },
  bindDevice: async (inviteToken: string, deviceFingerprint: string, studentCode: string) => {
    const res = await api.post('/invites/bind', {
      invite_token: inviteToken,
      device_fingerprint: deviceFingerprint,
      student_code: studentCode,
    });
    return res.data;
  },
  studentLookup: async (payload: { school_code?: string; class_code?: string; student_code?: string; device_fingerprint?: string }) => {
    const res = await api.post('/auth/student/lookup', payload);
    return res.data;
  },
  studentLogin: async (payload: { school_code?: string; class_code?: string; student_code?: string; device_fingerprint?: string; pin: string }) => {
    const res = await api.post('/auth/student/login', payload);
    if (res.data.access_token) {
      localStorage.setItem('neurova_access_token', res.data.access_token);
      localStorage.setItem('neurova_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  studentSetPin: async (payload: { school_code?: string; class_code?: string; student_code?: string; device_fingerprint?: string; pin: string; confirm_pin: string }) => {
    const res = await api.post('/auth/student/set-pin', payload);
    if (res.data.access_token) {
      localStorage.setItem('neurova_access_token', res.data.access_token);
      localStorage.setItem('neurova_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  teacherLogin: async (email: string, password: string) => {
    const res = await api.post('/auth/teacher/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('neurova_access_token', res.data.access_token);
      localStorage.setItem('neurova_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('neurova_access_token');
    localStorage.removeItem('neurova_user');
    api.post('/auth/logout').catch(() => {});
  },
  getCurrentUser: () => {
    const data = localStorage.getItem('neurova_user');
    return data ? JSON.parse(data) : null;
  }
};

// Student Learning APIs
export const StudentService = {
  getTodayTasks: async () => {
    const res = await api.get('/student/tasks/today');
    return res.data;
  },
  getMastery: async () => {
    const res = await api.get('/student/mastery');
    return res.data;
  },
  getPresignedUploadUrl: async (filename: string, fileType: string) => {
    const res = await api.post('/student/storage/presigned-url', {
      filename,
      file_type: fileType,
    });
    return res.data;
  },
  submitHomework: async (payload: { task_id: string; image_paths: string[]; audio_path?: string; blur_score?: number }) => {
    const res = await api.post('/student/submissions', payload);
    return res.data;
  },
  getSubmission: async (submissionId: string) => {
    const res = await api.get(`/student/submissions/${submissionId}`);
    return res.data;
  },
  getRemediationByTopic: async (topicId: string) => {
    const res = await api.get(`/student/remediations/topic/${topicId}`);
    return res.data;
  },
  getRemediationWordProblem: async (remediationId: string) => {
    const res = await api.get(`/student/remediations/${remediationId}/word-problem`);
    return res.data;
  },
  attemptWordProblem: async (remediationId: string, answer: string, voiceTranscript?: string) => {
    const res = await api.post(`/student/remediations/${remediationId}/word-problem/attempt`, {
      answer,
      voice_transcript: voiceTranscript,
    });
    return res.data;
  }
};
