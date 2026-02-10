import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('token');
            Cookies.remove('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put('/auth/password', data),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
        api.put(`/auth/reset-password/${token}`, { password }),
};

// Jobs API
export const jobsAPI = {
    getAll: (params?: any) => api.get('/jobs', { params }),
    getOne: (id: string) => api.get(`/jobs/${id}`),
    create: (data: any) => api.post('/jobs', data),
    update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
    delete: (id: string) => api.delete(`/jobs/${id}`),
    getMyJobs: () => api.get('/jobs/company/my-jobs'),
    getAllAdmin: (params?: any) => api.get('/jobs/admin/all', { params }),
    updateStatus: (id: string, status: string) => api.put(`/jobs/${id}/status`, { status }),
};

// Companies API
export const companiesAPI = {
    getAll: (params?: any) => api.get('/companies', { params }),
    getOne: (id: string) => api.get(`/companies/${id}`),
    getMyCompany: () => api.get('/companies/me'),
    updateMyCompany: (data: any) => api.put('/companies/me', data),
    getCharts: () => api.get('/companies/charts'),
    getAllAdmin: (params?: any) => api.get('/companies/admin/all', { params }),
    updateStatus: (id: string, status: string) => api.put(`/companies/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/companies/${id}`),
};

// Applications API
export const applicationsAPI = {
    apply: (data: { jobId: string; cvUrl: string; cvPublicId?: string; coverLetter?: string }) =>
        api.post('/applications', data),
    getMyApplications: () => api.get('/applications/my-applications'),
    getJobApplications: (jobId: string, params?: any) =>
        api.get(`/applications/job/${jobId}`, { params }),
    updateStatus: (id: string, status: string, notes?: string) =>
        api.put(`/applications/${id}/status`, { status, notes }),
    getOne: (id: string) => api.get(`/applications/${id}`),
    delete: (id: string) => api.delete(`/applications/${id}`),
};

// Upload API
export const uploadAPI = {
    uploadCV: (file: File) => {
        const formData = new FormData();
        formData.append('cv', file);
        return api.post('/upload/cv', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Reviews API
export const reviewsAPI = {
    getCompanyReviews: (companyId: string, params?: any) =>
        api.get(`/reviews/company/${companyId}`, { params }),
    createReview: (data: {
        companyId: string;
        rating: number;
        title: string;
        comment: string;
        pros?: string;
        cons?: string;
        isAnonymous?: boolean;
    }) => api.post('/reviews', data),
    updateReview: (id: string, data: any) => api.put(`/reviews/${id}`, data),
    deleteReview: (id: string) => api.delete(`/reviews/${id}`),
};

export default api;
