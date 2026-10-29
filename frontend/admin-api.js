/**
 * Bhasha_AI - Dedicated Admin API Client
 * Enterprise interface communicating with FastAPI Admin endpoints.
 */

function resolveAdminBackendUrl() {
    if (window.BHASHA_BACKEND_URL) return window.BHASHA_BACKEND_URL;

    // Check query params
    try {
        const params = new URLSearchParams(window.location.search);
        let queryUrl = params.get("backend") || params.get("backend_url") || params.get("server");
        const queryHost = params.get("host") || params.get("ip");
        if (queryHost && !queryUrl) queryUrl = `http://${queryHost}:8000`;
        if (queryUrl) {
            let clean = queryUrl.trim();
            if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
                clean = (window.location.protocol === "https:") ? `https://${clean}` : `http://${clean}`;
            }
            localStorage.setItem("bhasha_backend_url", clean);
            window.BHASHA_BACKEND_URL = clean;
            return clean;
        }
    } catch (_) {}

    try {
        const stored = localStorage.getItem("bhasha_backend_url");
        if (stored && stored.trim() !== "") return stored.trim();
    } catch (_) {}

    // When running in a browser over HTTP or HTTPS (not file://)
    if (window.location.protocol === "https:") {
        return window.location.origin;
    }
    if (window.location.protocol === "http:") {
        const port = window.location.port;
        const host = window.location.hostname;
        if (!port || port === "80" || port === "8000") {
            return window.location.origin;
        }
        if (host === "localhost" || host === "127.0.0.1" || host === "") {
            return `http://${host || "127.0.0.1"}:8000`;
        }
        return window.location.origin;
    }

    const host = (window.location.hostname && window.location.hostname !== "") ? window.location.hostname : "127.0.0.1";
    return `http://${host}:8000`;
}

function resolveAdminApiBase() {
    if (window.BHASHA_ADMIN_API_BASE && window.BHASHA_ADMIN_API_BASE.trim() !== "") {
        return window.BHASHA_ADMIN_API_BASE.trim();
    }
    try {
        const stored = localStorage.getItem("bhasha_admin_api_base");
        if (stored && stored.trim() !== "") return stored.trim();
    } catch (_) {}

    const backendUrl = resolveAdminBackendUrl();

    // When running in a browser over HTTP or HTTPS AND backendUrl matches the current origin,
    // use clean relative path "/api/admin"
    if (
        (window.location.protocol === "http:" || window.location.protocol === "https:") &&
        backendUrl === window.location.origin
    ) {
        return "/api/admin";
    }

    const cleanBackend = backendUrl.replace(/\/+$/, "");
    return `${cleanBackend}/api/admin`;
}


const AdminAPI = {
    get ADMIN_API_BASE() {
        return resolveAdminApiBase();
    },
    getAdminApiBase() {
        return resolveAdminApiBase();
    },

    getBackendUrl() {
        return resolveAdminBackendUrl();
    },

    // ---------------- AUTHENTICATION & SESSION ----------------
    getToken() {
        return localStorage.getItem("bhasha_admin_token");
    },

    getUser() {
        try {
            return JSON.parse(localStorage.getItem("bhasha_admin_user") || "null");
        } catch (_) {
            return null;
        }
    },

    setSession(token, user) {
        if (token) {
            localStorage.setItem("bhasha_admin_token", token);
            localStorage.setItem("bhasha_token", token);
        }
        if (user) {
            localStorage.setItem("bhasha_admin_user", JSON.stringify(user));
            localStorage.setItem("bhasha_user", JSON.stringify(user));
        }
    },

    logout() {
        localStorage.removeItem("bhasha_admin_token");
        localStorage.removeItem("bhasha_admin_user");
        window.location.href = "admin-login.html";
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = "admin-login.html";
            return false;
        }
        const user = this.getUser();
        if (!user || user.role !== "admin") {
            this.logout();
            return false;
        }
        return true;
    },

    async request(endpoint, options = {}) {
        const url = `${this.getAdminApiBase()}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401 || response.status === 403) {
                // For login endpoint, 401/403 are credential or permission errors, NOT an expired session!
                if (endpoint === "/login") {
                    let loginErrorMsg = "Invalid administrator credentials. Please check email and password.";
                    try {
                        const errData = await response.json();
                        if (errData && errData.detail) {
                            if (Array.isArray(errData.detail)) {
                                loginErrorMsg = errData.detail.map(d => d.msg || JSON.stringify(d)).join(", ");
                            } else if (typeof errData.detail === "string") {
                                loginErrorMsg = errData.detail;
                            } else {
                                loginErrorMsg = JSON.stringify(errData.detail);
                            }
                        } else if (errData && errData.message) {
                            loginErrorMsg = errData.message;
                        }
                    } catch (_) {}
                    throw new Error(loginErrorMsg);
                }

                // Unauthorized or non-admin access on protected endpoint
                console.warn("[AdminAPI] Session invalid or forbidden. Redirecting to login...");
                this.logout();
                throw new Error("Session expired or administrator privileges required.");
            }

            if (!response.ok) {
                let errorMsg = `HTTP Error ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData.detail) {
                        if (Array.isArray(errData.detail)) {
                            errorMsg = errData.detail.map(d => d.msg || JSON.stringify(d)).join(", ");
                        } else if (typeof errData.detail === "string") {
                            errorMsg = errData.detail;
                        } else {
                            errorMsg = JSON.stringify(errData.detail);
                        }
                    } else if (errData.message) {
                        errorMsg = errData.message;
                    }
                } catch (_) {
                    if (response.status === 404) {
                        errorMsg = `Admin endpoint not found: ${endpoint}`;
                    } else if (response.status === 500) {
                        errorMsg = "Internal server error. Please check backend logs.";
                    }
                }
                throw new Error(errorMsg);
            }

            return await response.json();
        } catch (err) {
            if (err.name === "TypeError" && (err.message === "Failed to fetch" || err.message.toLowerCase().includes("fetch") || err.message.toLowerCase().includes("network"))) {
                throw new Error(`Unable to connect to admin backend at ${this.getBackendUrl()}. Please verify the FastAPI server is running with 'python backend/run.py' and CORS is allowed.`);
            }
            console.error(`[AdminAPI] ${options.method || 'GET'} ${endpoint} failed:`, err.message);
            throw err;
        }
    },

    // ---------------- AUTH ENDPOINTS ----------------
    async login(email, password) {
        const res = await this.request("/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        if (res && res.access_token) {
            this.setSession(res.access_token, res.user);
        }
        return res;
    },

    // ---------------- DASHBOARD METRICS ----------------
    async getDashboardStats() {
        return await this.request("/dashboard/stats");
    },

    // ---------------- STUDENT MANAGEMENT ----------------
    async getStudents({ search = "", language = "", role = "", statusFilter = "", page = 1, limit = 10, skip = null } = {}) {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (language && language !== "all") params.append("language", language);
        if (role && role !== "all") params.append("role", role);
        if (statusFilter && statusFilter !== "all") params.append("status_filter", statusFilter);
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);
        if (skip !== null && skip !== undefined) params.append("skip", skip);

        return await this.request(`/students?${params.toString()}`);
    },

    async createStudent(studentData) {
        return await this.request("/students", {
            method: "POST",
            body: JSON.stringify(studentData)
        });
    },

    async getStudentDetail(userId) {
        return await this.request(`/students/${userId}`);
    },

    async updateStudent(userId, updateData) {
        return await this.request(`/students/${userId}`, {
            method: "PUT",
            body: JSON.stringify(updateData)
        });
    },

    async deleteStudent(userId) {
        return await this.request(`/students/${userId}`, {
            method: "DELETE"
        });
    },

    async getLogs(limit = 50) {
        return await this.request(`/logs?limit=${limit}`);
    },

    // ---------------- QUIZ MANAGEMENT ----------------
    async getQuizzes({ track = "", lessonNumber = "", search = "", skip = 0, limit = 50 } = {}) {
        const params = new URLSearchParams();
        if (track && track !== "all") params.append("track", track);
        if (lessonNumber) params.append("lesson_number", lessonNumber);
        if (search) params.append("search", search);
        params.append("skip", skip);
        params.append("limit", limit);

        return await this.request(`/quizzes?${params.toString()}`);
    },

    async createQuiz(quizData) {
        return await this.request("/quizzes", {
            method: "POST",
            body: JSON.stringify(quizData)
        });
    },

    async updateQuiz(questionId, updateData) {
        return await this.request(`/quizzes/${questionId}`, {
            method: "PUT",
            body: JSON.stringify(updateData)
        });
    },

    async deleteQuiz(questionId) {
        return await this.request(`/quizzes/${questionId}`, {
            method: "DELETE"
        });
    },

    // ---------------- COURSES & ROADMAP ----------------
    async getCourses() {
        return await this.request("/courses");
    },

    async createLesson(lessonData) {
        return await this.request("/courses/lessons", {
            method: "POST",
            body: JSON.stringify(lessonData)
        });
    },

    async updateLesson(lessonId, lessonData) {
        return await this.request(`/courses/lessons/${lessonId}`, {
            method: "PUT",
            body: JSON.stringify(lessonData)
        });
    },

    async deleteLesson(lessonId) {
        return await this.request(`/courses/lessons/${lessonId}`, {
            method: "DELETE"
        });
    },

    async getRoadmap() {
        return await this.request("/roadmap");
    },

    async saveRoadmapStage(stageData) {
        return await this.request("/roadmap", {
            method: "POST",
            body: JSON.stringify(stageData)
        });
    },

    async deleteRoadmapStage(stageId) {
        return await this.request(`/roadmap/${stageId}`, {
            method: "DELETE"
        });
    },

    // ---------------- ANALYTICS & EXPORT ----------------
    async getAnalytics() {
        return await this.request("/analytics/overview");
    },

    async downloadStudentsCSV() {
        const token = this.getToken();
        const response = await fetch(`${ADMIN_API_BASE}/reports/students.csv`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error("Failed to download students report.");
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `bhasha_students_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
    },

    async downloadQuizzesCSV() {
        const token = this.getToken();
        const response = await fetch(`${ADMIN_API_BASE}/reports/quizzes.csv`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error("Failed to download quizzes report.");
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `bhasha_quizzes_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
    },

    // ---------------- SETTINGS ----------------
    async getSettings() {
        return await this.request("/settings");
    },

    async updateSettings(settingsData) {
        return await this.request("/settings", {
            method: "PUT",
            body: JSON.stringify(settingsData)
        });
    },

    async changePassword(currentPassword, newPassword) {
        return await this.request("/change-password", {
            method: "POST",
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
    }
};

window.AdminAPI = AdminAPI;
