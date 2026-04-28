import axios from 'axios';

// API base URL - can be configured via environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls - login doesn't need auth, so use direct axios to avoid preflight
export const authApi = {
  login: (email: string, password: string) =>
    axios.post(`${API_URL}/auth/login`, { email, password }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }),
  logout: () =>
    apiClient.post('/auth/logout'),
  me: () =>
    apiClient.get('/auth/me'),
};

// Users API calls
export const usersApi = {
  getAll: () =>
    apiClient.get('/users'),
  getById: (id: number) =>
    apiClient.get(`/users/${id}`),
  create: (data: any) =>
    apiClient.post('/users', data),
  update: (id: number, data: any) =>
    apiClient.put(`/users/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),
};

// Courses API calls
export const coursesApi = {
  getAll: () =>
    apiClient.get('/courses'),
  getById: (id: number) =>
    apiClient.get(`/courses/${id}`),
  create: (data: any) =>
    apiClient.post('/courses', data),
  update: (id: number, data: any) =>
    apiClient.put(`/courses/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/courses/${id}`),
  getMyCourses: () =>
    apiClient.get('/courses/my-courses'),
  getMyEnrolledCourses: () =>
    apiClient.get('/my-enrolled-courses'),
};

// Enrollments API calls
export const enrollmentsApi = {
  getAll: () =>
    apiClient.get('/enrollments'),
  getById: (id: number) =>
    apiClient.get(`/enrollments/${id}`),
  create: (data: any) =>
    apiClient.post('/enrollments', data),
  delete: (id: number) =>
    apiClient.delete(`/enrollments/${id}`),
  getByCourse: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/enrollments`),
};

// Schedules API calls
export const schedulesApi = {
  getAll: () =>
    apiClient.get('/schedules'),
  getById: (id: number) =>
    apiClient.get(`/schedules/${id}`),
  getByCourse: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/schedules`),
  create: (data: any) =>
    apiClient.post('/schedules', data),
  update: (id: number, data: any) =>
    apiClient.put(`/schedules/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/schedules/${id}`),
};

// Announcements API calls
export const announcementsApi = {
  getAll: () =>
    apiClient.get('/announcements'),
  getById: (id: number) =>
    apiClient.get(`/announcements/${id}`),
  create: (data: any) =>
    apiClient.post('/announcements', data),
  update: (id: number, data: any) =>
    apiClient.put(`/announcements/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/announcements/${id}`),
};

// Notifications API calls
export const notificationsApi = {
  getAll: () =>
    apiClient.get('/notifications'),
  markAsRead: (id: number) =>
    apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () =>
    apiClient.put('/notifications/read-all'),
  clearAll: () =>
    apiClient.delete('/notifications/clear-all'),
};

// Grades API calls
export const gradesApi = {
  getAll: () =>
    apiClient.get('/grades'),
  getByCourse: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/grades`),
  create: (data: any) =>
    apiClient.post('/grades', data),
  update: (id: number, data: any) =>
    apiClient.put(`/grades/${id}`, data),
};

// Modules API calls
export const modulesApi = {
  getByCourse: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/modules`),
  getById: (id: number) =>
    apiClient.get(`/modules/${id}`),
  create: (courseId: number, data: any) =>
    apiClient.post(`/courses/${courseId}/modules`, data),
  update: (id: number, data: any) =>
    apiClient.put(`/modules/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/modules/${id}`),
};

// Module Completions API calls
export const moduleCompletionsApi = {
  create: (data: any) =>
    apiClient.post('/module-completions', data),
  getByEnrollment: (enrollmentId: number) =>
    apiClient.get(`/enrollments/${enrollmentId}/module-completions`),
};

// Discussions API calls
export const discussionsApi = {
  getByModule: (moduleId: number) =>
    apiClient.get(`/modules/${moduleId}/discussions`),
  create: (data: any) =>
    apiClient.post('/discussions', data),
  delete: (id: number) =>
    apiClient.delete(`/discussions/${id}`),
};

// Quiz Results API calls
export const quizResultsApi = {
  create: (data: any) =>
    apiClient.post('/quiz-results', data),
  getByEnrollment: (enrollmentId: number) =>
    apiClient.get(`/enrollments/${enrollmentId}/quiz-results`),
  getById: (id: number) =>
    apiClient.get(`/quiz-results/${id}`),
};

// Progress API calls
export const progressApi = {
  getStudentProgress: (enrollmentId: number) =>
    apiClient.get(`/enrollments/${enrollmentId}/progress`),
  getCourseProgress: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/student-progress`),
};

// Search API calls
export const searchApi = {
  searchCourses: (query: string, status?: string) =>
    apiClient.get(`/search/courses?q=${encodeURIComponent(query)}${status ? `&status=${status}` : ''}`),
  searchStudents: (query: string, courseId?: number) =>
    apiClient.get(`/search/students?q=${encodeURIComponent(query)}${courseId ? `&course_id=${courseId}` : ''}`),
  globalSearch: (query: string) =>
    apiClient.get(`/search?q=${encodeURIComponent(query)}`),
};

// Audit Logs API calls
export const auditLogsApi = {
  getAll: () =>
    apiClient.get('/audit-logs'),
  getByModel: (modelType: string, modelId: number) =>
    apiClient.get(`/audit-logs/${modelType}/${modelId}`),
};

// AI API calls
export const aiApi = {
  chat: (data: { message: string; course_id: number; module_id?: number; history?: any[] }) =>
    apiClient.post('/ai/chat', data),
  insights: () =>
    apiClient.get('/ai/insights'),
  predictRisk: (courseId: number) =>
    apiClient.get(`/ai/predict-risk/${courseId}`),
};

// Messages API calls
export const messagesApi = {
  getAll: () =>
    apiClient.get('/messages'),
  getStudentMessages: (studentId: number) =>
    apiClient.get(`/messages/student/${studentId}`),
  getCourseMessages: (courseId: number) =>
    apiClient.get(`/messages/course/${courseId}`),
  sendToStudent: (recipientId: number, content: string, courseId?: number) =>
    apiClient.post('/messages/send-to-student', {
      recipient_id: recipientId,
      content,
      course_id: courseId,
    }),
  broadcastToCourse: (courseId: number, content: string) =>
    apiClient.post('/messages/broadcast', {
      course_id: courseId,
      content,
    }),
  markAsRead: (messageId: number) =>
    apiClient.put(`/messages/${messageId}/read`, {}),
  delete: (messageId: number) =>
    apiClient.delete(`/messages/${messageId}`),
};

export default apiClient;
