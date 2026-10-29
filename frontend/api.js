/**
 * Bhasha_AI - Unified Backend API Client
 * Seamlessly interfaces the frontend with the FastAPI SQLite backend.
 */

// Dynamic backend and API URL resolution
function resolveBackendUrl() {
    if (window.BHASHA_BACKEND_URL) return window.BHASHA_BACKEND_URL;

    // 1. Check URL query parameters (e.g., login.html?backend=http://10.87.150.150:8000 or ?host=10.87.150.150)
    try {
        const params = new URLSearchParams(window.location.search);
        let queryUrl = params.get("backend") || params.get("backend_url") || params.get("server");
        const queryHost = params.get("host") || params.get("ip");
        if (queryHost && !queryUrl) {
            queryUrl = `http://${queryHost}:8000`;
        }
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

    // 2. Check localStorage
    try {
        const stored = localStorage.getItem("bhasha_backend_url");
        if (stored && stored.trim() !== "") return stored.trim();
    } catch (_) {}

    // 3. Same-origin resolution: when served over HTTP or HTTPS (not file://), use window.location.origin
    // This preserves HTTPS in production and eliminates Mixed Content errors and hardcoded ports
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        return window.location.origin;
    }

    // 4. Default fallback for local file:// testing
    const host = (window.location.hostname && window.location.hostname !== "") ? window.location.hostname : "127.0.0.1";
    return `http://${host}:8000`;
}

function resolveApiBase() {
    if (window.BHASHA_API_BASE && window.BHASHA_API_BASE.trim() !== "") {
        return window.BHASHA_API_BASE.trim();
    }
    try {
        const stored = localStorage.getItem("bhasha_api_base");
        if (stored && stored.trim() !== "") return stored.trim();
    } catch (_) {}

    const backendUrl = resolveBackendUrl();

    // When running in a browser over HTTP or HTTPS AND backendUrl matches the current origin,
    // use clean relative path "/api" (supports reverse-proxy setups and prevents HTTPS mixed-content blocks)
    if (
        (window.location.protocol === "http:" || window.location.protocol === "https:") &&
        backendUrl === window.location.origin
    ) {
        return "/api";
    }

    // When frontend and backend are hosted on separate domains, or running from local file:// path,
    // construct full target API URL
    const cleanBackend = backendUrl.replace(/\/+$/, "");
    return `${cleanBackend}/api`;
}


const BhashaAPI = {
    get BACKEND_URL() {
        return resolveBackendUrl();
    },
    get API_BASE() {
        return resolveApiBase();
    },

    getBackendUrl() {
        return resolveBackendUrl();
    },

    getApiBase() {
        return resolveApiBase();
    },

    setBackendUrl(url) {
        if (!url) return;
        let clean = url.trim();
        if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
            clean = (window.location.protocol === "https:") ? `https://${clean}` : `http://${clean}`;
        }
        // Only append default port 8000 if it is a bare local hostname or IP without port
        const isLocalHostOrIp = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i.test(clean);
        if (isLocalHostOrIp) {
            clean = `${clean}:8000`;
        }
        localStorage.setItem("bhasha_backend_url", clean);
        window.BHASHA_BACKEND_URL = clean;
        return clean;
    },

    resetBackendUrl() {
        localStorage.removeItem("bhasha_backend_url");
        delete window.BHASHA_BACKEND_URL;
        return resolveBackendUrl();
    },

    getToken() {
        return localStorage.getItem("bhasha_token");
    },

    isAuthenticated() {
        const token = this.getToken();
        return Boolean(token && token.trim() !== "");
    },

    setSession(token, user) {
        if (token) localStorage.setItem("bhasha_token", token);
        if (user) {
            localStorage.setItem("bhasha_logged_in", "true");
            localStorage.setItem("bhasha_user_id", (user.user_id || user.id || "").toString());
            localStorage.setItem("bhasha_user_name", user.full_name || "");
            localStorage.setItem("bhasha_user_email", user.email || "");

            // Preserve an actively chosen subject from localStorage if valid
            const currentStored = this.normalizeSubject ? this.normalizeSubject(localStorage.getItem("bhasha_chosen_language"), null) : null;
            const userLang = this.normalizeSubject ? this.normalizeSubject(user.chosen_language, null) : user.chosen_language;

            if (currentStored) {
                // Keep the active choice and sync to backend if needed
                localStorage.setItem("bhasha_chosen_language", currentStored);
                if (userLang && currentStored !== userLang && this.isAuthenticated()) {
                    this.updateSettings({ chosen_language: currentStored }).catch(() => {});
                }
            } else if (userLang) {
                localStorage.setItem("bhasha_chosen_language", userLang);
            }

            localStorage.setItem("bhasha_daily_goal", (user.daily_goal || 15).toString());
            localStorage.setItem("bhasha_xp", (user.total_xp || 0).toString());
            localStorage.setItem("bhasha_streak", (user.streak_days || 1).toString());
            localStorage.setItem("bhasha_rank_tier", user.rank_tier || "Stage 1 • Fundamentals");
        }
    },

    logout() {
        localStorage.removeItem("bhasha_token");
        localStorage.removeItem("bhasha_logged_in");
        localStorage.removeItem("bhasha_user_id");
        localStorage.removeItem("bhasha_user_name");
        localStorage.removeItem("bhasha_user_email");
        localStorage.removeItem("bhasha_chosen_language");
        localStorage.removeItem("bhasha_daily_goal");
        localStorage.removeItem("bhasha_xp");
        localStorage.removeItem("bhasha_streak");
        localStorage.removeItem("bhasha_rank_tier");
        localStorage.removeItem("bhasha_current_track");
        try {
            sessionStorage.clear();
        } catch (_) {}
    },

    async request(endpoint, options = {}) {
        const url = `${this.getApiBase()}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutMs = options.timeout || 35000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: options.signal || controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("bhasha_token");
                    localStorage.removeItem("bhasha_user");
                }
                let errorMsg = `HTTP Error ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData.detail) {
                        if (Array.isArray(errData.detail)) {
                            errorMsg = errData.detail.map(d => (d.msg ? `${d.loc ? d.loc.slice(-1) + ': ' : ''}${d.msg}` : JSON.stringify(d))).join(", ");
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
                        errorMsg = `API endpoint not found: ${endpoint}`;
                    } else if (response.status === 500) {
                        errorMsg = "Internal server error. Please check FastAPI backend logs.";
                    }
                }
                throw new Error(errorMsg);
            }

            return await response.json();
        } catch (err) {
            clearTimeout(timeoutId);

            if (err.name === "AbortError") {
                const timeoutErr = new Error(`Request timed out while connecting to ${url}. Please verify backend server is responding.`);
                console.warn(`[BhashaAPI] Timeout error:`, timeoutErr.message);
                throw timeoutErr;
            }

            if (err.name === "TypeError" && (err.message === "Failed to fetch" || err.message.toLowerCase().includes("fetch") || err.message.toLowerCase().includes("network"))) {
                const connErr = new Error(`Unable to connect to backend server at ${this.getBackendUrl()}. Please ensure the FastAPI backend is running with 'python backend/run.py' and CORS is enabled.`);
                console.warn(`[BhashaAPI] Connection error:`, connErr.message);
                throw connErr;
            }

            console.warn(`[BhashaAPI] Request to ${endpoint} failed:`, err.message);
            throw err;
        }
    },

    async getAuthConfig() {
        return await this.request("/auth/config");
    },

    async checkHealth() {
        return await this.request("/health", { timeout: 5000 });
    },

    async getNetworkInfo() {
        return await this.request("/system/network-info", { timeout: 5000 });
    },

    // Auth endpoints
    async register(userData) {
        const data = await this.request("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData)
        });
        if (data && data.access_token) {
            this.setSession(data.access_token, data.user);
        }
        return data;
    },

    async login(credentials) {
        const data = await this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials)
        });
        if (data && data.access_token) {
            this.setSession(data.access_token, data.user);
        }
        return data;
    },


    async verifyOTP(email, otp, tempToken = null) {
        const data = await this.request("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email, otp, temp_token: tempToken })
        });
        if (data && data.access_token) {
            this.setSession(data.access_token, data.user);
        }
        return data;
    },

    async resendOTP(email, name = "Scholar") {
        return await this.request("/auth/resend-otp", {
            method: "POST",
            body: JSON.stringify({ email, name })
        });
    },

    async forgotPassword(email) {
        return await this.request("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email: email.trim() })
        });
    },

    async verifyResetToken(token) {
        return await this.request(`/auth/verify-reset-token?token=${encodeURIComponent(token.trim())}`);
    },

    async resetPassword(token, newPassword) {
        return await this.request("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({
                token: token.trim(),
                new_password: newPassword
            })
        });
    },

    async logoutServer() {
        try {
            await this.request("/auth/logout", { method: "POST" });
        } catch (_) {}
        this.logout();
    },

    // ---------------- EARNED PREMIUM MEMBERSHIP ----------------
    async getPremiumStatus(userId = null) {
        const query = userId ? `?user_id=${userId}` : "";
        return await this.request(`/premium/status${query}`);
    },

    async getPremiumHistory(userId = null) {
        const query = userId ? `?user_id=${userId}` : "";
        return await this.request(`/premium/history${query}`);
    },

    async startScreenTime(pageName = "learning", userId = null) {
        return await this.request("/screen-time/start", {
            method: "POST",
            body: JSON.stringify({ page_name: pageName, user_id: userId })
        });
    },

    async updateScreenTime(activeSeconds = 30.0, sessionId = null, pageName = "learning", userId = null) {
        return await this.request("/screen-time/update", {
            method: "POST",
            body: JSON.stringify({
                active_seconds: activeSeconds,
                session_id: sessionId,
                page_name: pageName,
                user_id: userId
            })
        });
    },

    async endScreenTime(sessionId, userId = null) {
        return await this.request("/screen-time/end", {
            method: "POST",
            body: JSON.stringify({ session_id: sessionId, user_id: userId })
        });
    },

    async getProfile() {
        if (!this.isAuthenticated()) {
            return null;
        }
        try {
            const profile = await this.request("/users/profile");
            this.setSession(null, profile);
            return profile;
        } catch (e) {
            if (!this.isAuthenticated()) {
                return null;
            }
            // Fallback to local storage only if session token exists
            const storedName = localStorage.getItem("bhasha_user_name");
            if (!storedName) return null;
            return {
                full_name: storedName,
                chosen_language: this.getSelectedSubject() || localStorage.getItem("bhasha_chosen_language") || "Python",
                daily_goal: parseInt(localStorage.getItem("bhasha_daily_goal") || "15", 10),
                total_xp: parseInt(localStorage.getItem("bhasha_xp") || "0", 10),
                streak_days: parseInt(localStorage.getItem("bhasha_streak") || "0", 10),
                rank_tier: localStorage.getItem("bhasha_rank_tier") || "Stage 1 • Fundamentals"
            };
        }
    },

    async updateSettings(settings) {
        try {
            const updated = await this.request("/users/settings", {
                method: "PUT",
                body: JSON.stringify(settings)
            });
            this.setSession(null, updated);
            return updated;
        } catch (e) {
            // Fallback to local storage
            if (settings.full_name) localStorage.setItem("bhasha_user_name", settings.full_name);
            if (settings.chosen_language) localStorage.setItem("bhasha_chosen_language", settings.chosen_language);
            if (settings.daily_goal) localStorage.setItem("bhasha_daily_goal", settings.daily_goal.toString());
            return settings;
        }
    },

    async resetProgress() {
        try {
            return await this.request("/users/reset", { method: "POST" });
        } catch (e) {
            return { status: "local_only" };
        }
    },

    // ---------------- CONTENT ENDPOINTS ----------------
    async getTracks() {
        return await this.request("/content/tracks");
    },

    async getLessonsForTrack(subject) {
        const normSubject = this.normalizeSubject ? this.normalizeSubject(subject, "Python") : (subject || "Python");
        const encoded = encodeURIComponent(normSubject);
        return await this.request(`/content/lessons/${encoded}`);
    },

    async getLessonsForSubject(subject) {
        return await this.getLessonsForTrack(subject);
    },

    async getLessonDetail(subject, lessonNumber) {
        const normSubject = this.normalizeSubject ? this.normalizeSubject(subject, "Python") : (subject || "Python");
        return await this.request(`/content/lessons/${encodeURIComponent(normSubject)}/${lessonNumber}`);
    },
    // ---------------- PROGRESS & LESSON SYNC ----------------
    SUPPORTED_SUBJECTS: ["Python", "Java", "C++", "English", "General"],

    isValidSubject(subject) {
        if (!subject) return false;
        const norm = this.normalizeSubject(subject, null);
        return Boolean(norm && this.SUPPORTED_SUBJECTS.includes(norm));
    },

    normalizeSubject(subject, fallback = null) {
        if (!subject) return fallback;
        const strVal = String(subject);
        const lowerWithPluses = strVal.replace(/\s/g, "+").toLowerCase().trim();
        const s = strVal.trim();
        if (!s) return fallback;
        const lower = s.toLowerCase();
        if (lower === "python" || lower === "py") return "Python";
        if (lower === "java") return "Java";
        if (lower === "c++" || lower === "cpp" || lowerWithPluses === "c++" || lower === "cplusplus") return "C++";
        if (lower === "english" || lower === "technical english" || lower === "tech english" || lower === "technical-english") return "English";
        if (lower === "general" || lower === "general concepts" || lower === "general-concepts" || lower === "cs" || lower === "computer science" || lower === "dbms" || lower === "algorithms") return "General";
        for (const sup of this.SUPPORTED_SUBJECTS) {
            if (sup.toLowerCase() === lower) return sup;
        }
        return fallback;
    },

    getSelectedSubject() {
        // 1. Check URL query parameters (subject, track, or lang)
        try {
            if (typeof window !== "undefined" && window.location && window.location.search) {
                const params = new URLSearchParams(window.location.search);
                const fromUrl = params.get("subject") || params.get("track") || params.get("lang");
                const normUrl = this.normalizeSubject(fromUrl, null);
                if (normUrl) {
                    localStorage.setItem("bhasha_chosen_language", normUrl);
                    return normUrl;
                }
            }
        } catch (_) {}

        // 2. Check localStorage
        try {
            const stored = localStorage.getItem("bhasha_chosen_language");
            const normStored = this.normalizeSubject(stored, null);
            if (normStored) return normStored;
        } catch (_) {}

        // 3. Check legacy track key if any
        try {
            const legacy = localStorage.getItem("bhasha_current_track");
            const normLegacy = this.normalizeSubject(legacy, null);
            if (normLegacy) {
                localStorage.setItem("bhasha_chosen_language", normLegacy);
                return normLegacy;
            }
        } catch (_) {}

        return null;
    },

    async setSelectedSubject(subject, syncBackend = true) {
        const norm = this.normalizeSubject(subject, null);
        if (!norm) return null;

        localStorage.setItem("bhasha_chosen_language", norm);
        localStorage.setItem("bhasha_current_track", norm);

        if (syncBackend && this.isAuthenticated()) {
            try {
                await this.updateSettings({ chosen_language: norm });
            } catch (err) {
                console.warn("[BhashaAPI] Backend subject sync notice:", err.message);
            }
        }
        if (typeof document !== "undefined") {
            this.syncNavLinks(norm);
        }
        return norm;
    },

    syncNavLinks(activeSubject) {
        if (!activeSubject || typeof document === "undefined") return;
        const norm = this.normalizeSubject(activeSubject, activeSubject);
        if (!norm) return;
        try {
            const links = document.querySelectorAll("a[href]");
            links.forEach(a => {
                const rawHref = a.getAttribute("href");
                if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("http://") || rawHref.startsWith("https://")) return;
                const [base, query] = rawHref.split("?");
                const targetPages = [
                    "roadmap.html", "dashboard.html", "lesson.html",
                    "projects.html", "AiMentor.html", "settings.html",
                    "subject.html", "achievements.html", "leaderboard.html"
                ];
                if (targetPages.includes(base)) {
                    const params = new URLSearchParams(query || "");
                    params.set("subject", norm);
                    a.setAttribute("href", `${base}?${params.toString()}`);
                }
            });
        } catch (_) {}
    },

    getNextLessonForSubject(subject, progressList = null, totalLessons = null) {
        const normSubject = this.normalizeSubject(subject, "Python");
        let list = progressList;
        if (!Array.isArray(list) || list.length === 0) {
            list = this.getLocalProgress(normSubject);
        }

        const total = (typeof totalLessons === "number" && totalLessons > 0)
            ? totalLessons
            : 8;

        const completedSet = new Set(
            (list || [])
                .filter(p => {
                    const pSub = this.normalizeSubject(p.subject, null);
                    return pSub && pSub.toLowerCase() === normSubject.toLowerCase() && Boolean(p.completed);
                })
                .map(p => Number(p.lesson_number))
        );

        let nextLesson = 1;
        for (let i = 1; i <= total; i++) {
            if (!completedSet.has(i)) {
                nextLesson = i;
                break;
            }
        }
        const isAllCompleted = completedSet.size >= total;
        if (isAllCompleted) {
            nextLesson = total;
        }

        const remainingCount = Math.max(0, total - completedSet.size);
        const percent = total > 0 ? Math.min(100, Math.round((completedSet.size / total) * 100)) : 0;

        return {
            subject: normSubject,
            lessonNumber: nextLesson,
            completedCount: completedSet.size,
            remainingCount,
            isAllCompleted,
            totalLessons: total,
            percent
        };
    },

    getLocalProgress(subject = null) {
        const normSubject = subject ? this.normalizeSubject(subject) : null;
        const results = [];
        const seen = new Set();

        // 1. Check unified bhasha_progress object
        try {
            const unified = JSON.parse(localStorage.getItem("bhasha_progress") || "{}");
            const subjectsToCheck = normSubject ? [normSubject] : Object.keys(unified);
            subjectsToCheck.forEach(sKey => {
                const subjNorm = this.normalizeSubject(sKey);
                const sObj = unified[sKey] || {};
                Object.keys(sObj).forEach(lNumStr => {
                    const lNum = parseInt(lNumStr, 10);
                    if (Number.isFinite(lNum)) {
                        const item = sObj[lNumStr];
                        const key = `${subjNorm}_${lNum}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            results.push({
                                subject: subjNorm,
                                lesson_number: lNum,
                                score: Number(item.score) || 0,
                                total_questions: Number(item.total_questions || item.total) || 5,
                                xp_earned: Number(item.xp_earned || item.xp) || 0,
                                completed: Boolean(item.completed)
                            });
                        }
                    }
                });
            });
        } catch (_) {}

        // 2. Check legacy per-lesson keys: bhasha_${subject}_lesson_${lessonNumber}
        const subjectsList = normSubject ? [normSubject] : ["Python", "Java", "C++", "English"];
        subjectsList.forEach(s => {
            const sNorm = this.normalizeSubject(s);
            for (let l = 1; l <= 12; l++) {
                const key = `${sNorm}_${l}`;
                if (seen.has(key)) continue;

                // Check multiple casing variants for robustness
                const variants = [
                    `bhasha_${sNorm}_lesson_${l}`,
                    `bhasha_${sNorm.toLowerCase()}_lesson_${l}`
                ];
                let foundData = null;
                for (const v of variants) {
                    try {
                        const raw = localStorage.getItem(v);
                        if (raw) {
                            foundData = JSON.parse(raw);
                            break;
                        }
                    } catch (_) {}
                }

                const completedFlag = 
                    localStorage.getItem(`bhasha_${sNorm}_lesson_${l}_completed`) === "true" ||
                    localStorage.getItem(`bhasha_${sNorm.toLowerCase()}_lesson_${l}_completed`) === "true";

                if (foundData || completedFlag) {
                    seen.add(key);
                    results.push({
                        subject: sNorm,
                        lesson_number: l,
                        score: Number(foundData?.score) || 0,
                        total_questions: Number(foundData?.total_questions || foundData?.total) || 5,
                        xp_earned: Number(foundData?.xp_earned || foundData?.xp) || 0,
                        completed: Boolean(foundData?.completed || completedFlag)
                    });
                }
            }
        });

        return results.sort((a, b) => a.lesson_number - b.lesson_number);
    },

    saveLocalProgress(progressData) {
        if (!progressData) return;
        const normSubject = this.normalizeSubject(progressData.subject);
        const lNum = Number(progressData.lesson_number || progressData.lesson);
        if (!Number.isFinite(lNum) || lNum < 1) return;

        const isCompleted = Boolean(progressData.completed !== false);
        const record = {
            subject: normSubject,
            lesson_number: lNum,
            score: Number(progressData.score) || 0,
            total_questions: Number(progressData.total_questions || progressData.total) || 5,
            xp_earned: Number(progressData.xp_earned || progressData.xp) || 0,
            completed: isCompleted
        };

        // Update unified bhasha_progress object
        try {
            const unified = JSON.parse(localStorage.getItem("bhasha_progress") || "{}");
            if (!unified[normSubject]) unified[normSubject] = {};
            unified[normSubject][lNum] = record;
            localStorage.setItem("bhasha_progress", JSON.stringify(unified));
        } catch (_) {}

        // Update legacy keys for complete backwards compatibility
        try {
            localStorage.setItem(`bhasha_${normSubject}_lesson_${lNum}`, JSON.stringify(record));
            if (isCompleted) {
                localStorage.setItem(`bhasha_${normSubject}_lesson_${lNum}_completed`, "true");
            }
        } catch (_) {}

        return record;
    },

    isLessonUnlocked(subject, lessonNumber, progressList = null) {
        const lNum = Number(lessonNumber);
        if (lNum <= 1) return true; // Lesson 1 is always unlocked

        const normSubject = this.normalizeSubject(subject);
        const prereqLesson = lNum - 1;

        // Check supplied list first
        if (Array.isArray(progressList)) {
            const prereq = progressList.find(p => 
                this.normalizeSubject(p.subject) === normSubject &&
                Number(p.lesson_number) === prereqLesson &&
                Boolean(p.completed)
            );
            if (prereq) return true;
        }

        // Check local storage records
        const localList = this.getLocalProgress(normSubject);
        const localPrereq = localList.find(p =>
            Number(p.lesson_number) === prereqLesson &&
            Boolean(p.completed)
        );
        return Boolean(localPrereq);
    },

    async getLessonProgress(subject = null) {
        const normSubject = subject ? this.normalizeSubject(subject) : null;
        let backendProgress = null;

        try {
            const query = normSubject ? `?subject=${encodeURIComponent(normSubject)}` : "";
            const res = await this.request(`/users/progress${query}`);
            if (Array.isArray(res)) {
                backendProgress = res;
                // Hydrate local cache
                backendProgress.forEach(item => {
                    this.saveLocalProgress(item);
                });
            }
        } catch (e) {
            console.warn("[BhashaAPI] Backend progress unavailable, falling back to local:", e.message);
        }

        const localItems = this.getLocalProgress(normSubject);
        if (!backendProgress || backendProgress.length === 0) {
            return localItems;
        }

        // Merge: combine backend and local completed records
        const progressMap = new Map();
        localItems.forEach(item => {
            const key = `${this.normalizeSubject(item.subject)}_${item.lesson_number}`;
            progressMap.set(key, item);
        });
        backendProgress.forEach(item => {
            const key = `${this.normalizeSubject(item.subject)}_${item.lesson_number}`;
            const existing = progressMap.get(key);
            progressMap.set(key, {
                ...item,
                completed: Boolean(item.completed || (existing && existing.completed))
            });
        });

        return Array.from(progressMap.values()).sort((a, b) => a.lesson_number - b.lesson_number);
    },

    async submitLessonProgress(progressData) {
        const normSubject = this.normalizeSubject(progressData.subject);
        const lNum = Number(progressData.lesson_number || progressData.lesson);
        const payload = {
            subject: normSubject,
            lesson_number: lNum,
            score: Number(progressData.score) || 0,
            total_questions: Number(progressData.total_questions || progressData.total) || 5,
            xp_earned: Number(progressData.xp_earned || progressData.xp) || 0,
            completed: Boolean(progressData.completed !== false)
        };

        // 1. Immediately save locally so completion is NEVER lost
        this.saveLocalProgress(payload);

        // Update local stored XP
        if (payload.xp_earned) {
            const cur = parseInt(localStorage.getItem("bhasha_xp") || "0", 10);
            localStorage.setItem("bhasha_xp", (cur + payload.xp_earned).toString());
        }

        // 2. Persist to backend
        try {
            const res = await this.request("/users/progress", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            if (res) {
                this.saveLocalProgress(res);
                return res;
            }
        } catch (e) {
            console.warn("[BhashaAPI] Could not sync progress with backend, saved locally:", e.message);
        }

        return payload;
    },

    async getProjects(subject = null) {
        const norm = subject ? this.normalizeSubject(subject, subject) : null;
        const query = norm ? `?subject=${encodeURIComponent(norm)}` : "";
        return await this.request(`/content/projects${query}`);
    },

    async createProject(projectData) {
        return await this.request("/content/projects", {
            method: "POST",
            body: JSON.stringify(projectData)
        });
    },

    async getProjectDetail(slug) {
        return await this.request(`/content/projects/${encodeURIComponent(slug)}`);
    },

    async saveProjectProgress(projectData) {
        return await this.request("/users/projects", {
            method: "POST",
            body: JSON.stringify(projectData)
        });
    },

    async getSavedProjectProgress(projectId) {
        try {
            return await this.request(`/users/projects/${encodeURIComponent(projectId)}`);
        } catch (e) {
            return null;
        }
    },

    async getAllProjectProgress() {
        try {
            return await this.request("/users/projects");
        } catch (e) {
            return [];
        }
    },

    async getBadges() {
        return await this.request("/content/badges");
    },

    async getAchievementsOverview() {
        return await this.request("/content/achievements/overview");
    },

    async getLeaderboard(track = null) {
        const query = track && track !== "all" ? `?track=${encodeURIComponent(track)}` : "";
        return await this.request(`/leaderboard${query}`);
    },

    // ---------------- AI MENTOR ----------------
    async sendMentorMessage(subject, message) {
        return await this.request("/mentor/chat", {
            method: "POST",
            body: JSON.stringify({ subject, message })
        });
    },

    async getMentorStatus() {
        return await this.request("/mentor/status");
    },

    async getMentorHistory(subject = null) {
        const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
        return await this.request(`/mentor/history${query}`);
    },

    async clearMentorHistory(subject = null) {
        const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
        return await this.request(`/mentor/history${query}`, {
            method: "DELETE"
        });
    },

    // ---------------- AI MENTOR ASSESSMENT EVALUATION ----------------
    async getAIMentorFeedback(assessmentData) {
        return await this.request("/ai-mentor", {
            method: "POST",
            body: JSON.stringify(assessmentData)
        });
    },

    // ---------------- AI-POWERED ADAPTIVE QUIZ SYSTEM ----------------
    async getAdaptiveAnalytics(subject) {
        return await this.request(`/adaptive-quiz/analytics/${encodeURIComponent(this.normalizeSubject(subject))}`);
    },

    async generateAdaptiveQuiz(subject, lessonNumber = null, targetTopic = null) {
        const payload = {
            subject: this.normalizeSubject(subject),
            lesson_number: lessonNumber ? Number(lessonNumber) : null,
            target_topic: targetTopic || null
        };
        return await this.request("/adaptive-quiz/generate", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    async submitAdaptiveQuiz(payload) {
        return await this.request("/adaptive-quiz/submit", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    async getAdaptiveHistory(subject, limit = 20) {
        return await this.request(`/adaptive-quiz/history/${encodeURIComponent(this.normalizeSubject(subject))}?limit=${limit}`);
    },

    async getSpeakingPrompts(options = {}) {
        const params = new URLSearchParams();
        if (options.difficulty && options.difficulty !== "all") params.append("difficulty", options.difficulty);
        if (options.task_type && options.task_type !== "all") params.append("task_type", options.task_type);
        if (options.exclude_recent !== undefined) params.append("exclude_recent", options.exclude_recent);
        if (options.limit) params.append("limit", options.limit);
        const qs = params.toString() ? `?${params.toString()}` : "";
        return await this.request(`/content/speaking-prompts${qs}`);
    },

    async submitSpeakingAssessment(payload) {
        return await this.request("/users/speaking-assessment", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    async getSpeakingAssessments(limit = 10) {
        return await this.request(`/users/speaking-assessment?limit=${limit}`);
    },

    async getLatestSpeakingAssessment() {
        return await this.request("/users/speaking-assessment/latest");
    },

    async getSpeakingStats() {
        return await this.request("/users/speaking-assessment/stats");
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            const current = window.location.pathname.split("/").pop() || "dashboard.html";
            window.location.replace(`login.html?redirect=${encodeURIComponent(current)}`);
            return false;
        }
        return true;
    }
};

// Global handlers for Sign Out and Protected Page Authentication Guards
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        // Universal Sign-Out click listener across all sidebars and headers
        document.querySelectorAll("a[href*='login.html'], .signout-link, .logout-button, #logoutButton, #btnSidebarLogout").forEach(el => {
            if (el.classList.contains("signout-link") || el.classList.contains("logout-button") || el.id === "logoutButton" || el.id === "btnSidebarLogout" || (el.textContent && el.textContent.toLowerCase().includes("sign out"))) {
                el.addEventListener("click", function () {
                    BhashaAPI.logout();
                });
            }
        });

        // Enforce authentication guard on protected pages
        const currentPath = window.location.pathname.toLowerCase();
        const currentPage = currentPath.split("/").pop();
        const protectedPages = [
            "dashboard.html",
            "settings.html",
            "achievements.html",
            "roadmap.html",
            "projects.html",
            "project.html",
            "leaderboard.html"
        ];
        if (protectedPages.includes(currentPage)) {
            if (!BhashaAPI.isAuthenticated()) {
                window.location.replace(`login.html?redirect=${encodeURIComponent(currentPage)}`);
            }
        }

        // Synchronize all navigation links with active subject
        const currentSubj = BhashaAPI.getSelectedSubject();
        if (currentSubj) {
            BhashaAPI.syncNavLinks(currentSubj);
        }
    });
}

window.BhashaAPI = BhashaAPI;
