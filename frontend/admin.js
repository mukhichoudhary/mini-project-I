/**
 * Bhasha_AI Enterprise Admin Dashboard Controller
 * Full SPA controller for Dashboard, Students, Quizzes, Courses, Analytics, & Settings.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Session verification
    if (!AdminAPI.requireAuth()) return;

    // Admin state
    let currentUser = AdminAPI.getUser();
    let currentTab = "dashboard";
    let activeTrackSlug = "Python";
    let coursesData = [];
    let pendingDeleteAction = null;

    // Charts references
    let chartActivity = null;
    let chartLanguages = null;
    let chartProficiency = null;
    let chartScoreDist = null;

    // -------------------------------------------------------------------------
    // INITIALIZATION & USER PROFILE
    // -------------------------------------------------------------------------
    function initAdminProfile() {
        if (currentUser) {
            const nameEl = document.getElementById("sidebarAdminName");
            const avatarEl = document.getElementById("sidebarAdminAvatar");
            if (nameEl) nameEl.textContent = currentUser.full_name || "Chief Administrator";
            if (avatarEl) {
                const initials = (currentUser.full_name || "A")
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                avatarEl.textContent = initials;
            }
        }
    }

    function initClock() {
        const clockEl = document.getElementById("systemLiveClock");
        const update = () => {
            const now = new Date();
            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        };
        update();
        setInterval(update, 1000);
    }

    // -------------------------------------------------------------------------
    // NAVIGATION & TAB ROUTING
    // -------------------------------------------------------------------------
    const navButtons = document.querySelectorAll(".nav-link-btn[data-tab]");
    const tabViews = document.querySelectorAll(".tab-view");
    const pageTitleEl = document.getElementById("headerPageTitle");
    const tabBadgeEl = document.getElementById("headerTabBadge");
    const headerQuickAddBtn = document.getElementById("btnHeaderQuickAdd");
    const headerQuickAddText = document.getElementById("btnHeaderQuickAddText");

    const tabTitles = {
        dashboard: { title: "Executive Dashboard", badge: "LIVE METRICS" },
        students: { title: "Student Roster & Profiles", badge: "USER DIRECTORY" },
        quizzes: { title: "Assessment Question Bank", badge: "CURRICULUM EVALUATION" },
        courses: { title: "Curriculum & Roadmap", badge: "SYLLABUS MANAGEMENT" },
        analytics: { title: "Intelligence & Reports", badge: "PERFORMANCE ANALYTICS" },
        settings: { title: "System Configurations", badge: "ADMIN PREFERENCES" },
        logs: { title: "Audit Trail & Security Logs", badge: "SECURITY ARCHIVE" }
    };

    function switchTab(tabId) {
        currentTab = tabId;
        window.location.hash = tabId;

        // Update Nav UI
        navButtons.forEach(btn => {
            if (btn.getAttribute("data-tab") === tabId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Update Views
        tabViews.forEach(view => {
            if (view.id === `view-${tabId}`) {
                view.classList.add("active");
            } else {
                view.classList.remove("active");
            }
        });

        // Update Header
        const info = tabTitles[tabId] || { title: "Admin Portal", badge: "CONSOLE" };
        if (pageTitleEl) pageTitleEl.textContent = info.title;
        if (tabBadgeEl) tabBadgeEl.textContent = info.badge;

        // Quick add button adjustment
        if (headerQuickAddBtn && headerQuickAddText) {
            if (tabId === "quizzes") {
                headerQuickAddText.textContent = "New Question";
                headerQuickAddBtn.style.display = "inline-flex";
            } else if (tabId === "students" || tabId === "dashboard") {
                headerQuickAddText.textContent = "Add Student";
                headerQuickAddBtn.style.display = "inline-flex";
            } else {
                headerQuickAddBtn.style.display = "none";
            }
        }

        // Close mobile sidebar if open
        const sidebar = document.getElementById("adminSidebar");
        if (sidebar) sidebar.classList.remove("mobile-open");

        // Trigger Tab Specific Data Load
        if (tabId === "dashboard") loadDashboard();
        else if (tabId === "students") loadStudents();
        else if (tabId === "quizzes") loadQuizzes();
        else if (tabId === "courses") loadCourses();
        else if (tabId === "analytics") loadAnalytics();
        else if (tabId === "settings") loadSettings();
        else if (tabId === "logs") loadLogs();
    }

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            if (tabId) switchTab(tabId);
        });
    });

    // Check hash on load
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash && tabTitles[initialHash]) {
        switchTab(initialHash);
    } else {
        switchTab("dashboard");
    }

    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.replace("#", "");
        if (hash && tabTitles[hash] && hash !== currentTab) {
            switchTab(hash);
        }
    });

    // -------------------------------------------------------------------------
    // 1. DASHBOARD CONTROLLER
    // -------------------------------------------------------------------------
    async function loadDashboard() {
        try {
            const data = await AdminAPI.getDashboardStats();
            const sum = data.summary || {};

            // Update KPI numbers (all 6 live statistics)
            const kpiStudents = document.getElementById("kpiTotalStudents");
            if (kpiStudents) kpiStudents.textContent = sum.total_students ?? "--";

            const kpiActive = document.getElementById("kpiActiveUsers");
            if (kpiActive) kpiActive.textContent = sum.active_users ?? "--";

            const kpiQuizzes = document.getElementById("kpiTotalQuizzes");
            if (kpiQuizzes) kpiQuizzes.textContent = sum.total_quizzes ?? "--";

            const kpiScore = document.getElementById("kpiAverageScore");
            if (kpiScore) kpiScore.textContent = (sum.average_score != null ? sum.average_score : "--") + "%";

            const kpiRegToday = document.getElementById("kpiRegisteredToday");
            if (kpiRegToday) kpiRegToday.textContent = sum.registered_today ?? "--";

            const kpiCompRate = document.getElementById("kpiCompletionRate");
            if (kpiCompRate) kpiCompRate.textContent = (sum.completion_rate != null ? sum.completion_rate : "--") + "%";

            const sideBadgeStudents = document.getElementById("sidebarBadgeStudents");
            if (sideBadgeStudents) sideBadgeStudents.textContent = sum.total_students ?? "0";

            const sideBadgeQuizzes = document.getElementById("sidebarBadgeQuizzes");
            if (sideBadgeQuizzes) sideBadgeQuizzes.textContent = sum.total_quizzes ?? "0";

            // Render Charts
            renderActivityTimelineChart(data.activity_timeline);
            renderLanguageDistributionChart(data.tracks);
            renderProficiencyChart(data.track_avg_scores);

            // Render recent activity feed
            renderRecentActivityFeed(data.recent_activity || []);
        } catch (err) {
            showToast("Failed to refresh dashboard stats: " + err.message, "error");
        }
    }

    function renderActivityTimelineChart(timeline) {
        const ctx = document.getElementById("chartActivityTimeline")?.getContext("2d");
        if (!ctx) return;

        if (chartActivity) chartActivity.destroy();

        const labels = timeline?.labels || ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
        const submissions = timeline?.submissions || [0, 0, 0, 0, 0, 0, 0];

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.45)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

        chartActivity = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Quiz Assessments",
                    data: submissions,
                    borderColor: "#10b981",
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#34d399",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "rgba(13, 22, 28, 0.95)",
                        titleColor: "#ffffff",
                        bodyColor: "#94a3b8",
                        borderColor: "rgba(16, 185, 129, 0.3)",
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#64748b", font: { family: "Plus Jakarta Sans" } }
                    },
                    y: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#64748b", font: { family: "Plus Jakarta Sans" }, precision: 0 }
                    }
                }
            }
        });
    }

    function renderLanguageDistributionChart(tracks) {
        const ctx = document.getElementById("chartLanguageDistribution")?.getContext("2d");
        if (!ctx) return;

        if (chartLanguages) chartLanguages.destroy();

        const trackList = (tracks && tracks.length > 0) ? tracks : [
            { name: "Python", students_count: 0 },
            { name: "Java", students_count: 0 },
            { name: "C++", students_count: 0 },
            { name: "English", students_count: 0 }
        ];

        const labels = trackList.map(t => t.name);
        const dataValues = trackList.map(t => t.students_count || 0);
        const totalEnrolled = dataValues.reduce((a, b) => a + b, 0);

        const chartLabels = totalEnrolled > 0 ? labels : ["No enrollments yet"];
        const chartValues = totalEnrolled > 0 ? dataValues : [1];
        const chartColors = totalEnrolled > 0 ? [
            "rgba(59, 130, 246, 0.8)",   // Python Blue
            "rgba(239, 68, 68, 0.8)",    // Java Red
            "rgba(168, 85, 247, 0.8)",   // C++ Purple
            "rgba(16, 185, 129, 0.8)"    // English Emerald
        ] : ["rgba(255, 255, 255, 0.08)"];

        chartLanguages = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartValues,
                    backgroundColor: chartColors,
                    borderColor: "#0f172a",
                    borderWidth: 3,
                    hoverOffset: totalEnrolled > 0 ? 6 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#94a3b8",
                            font: { family: "Plus Jakarta Sans", size: 12 },
                            padding: 14,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        padding: 10,
                        callbacks: {
                            label: (context) => {
                                if (totalEnrolled === 0) return "No active students enrolled yet";
                                return `${context.label}: ${context.raw} students`;
                            }
                        }
                    }
                },
                cutout: "68%"
            }
        });
    }

    function renderProficiencyChart(avgScores) {
        const ctx = document.getElementById("chartSubjectProficiency")?.getContext("2d");
        if (!ctx) return;

        if (chartProficiency) chartProficiency.destroy();

        const subjects = ["Python", "Java", "C++", "English"];
        const scores = subjects.map(s => (avgScores && avgScores[s] != null) ? avgScores[s] : 0);

        chartProficiency = new Chart(ctx, {
            type: "bar",
            data: {
                labels: subjects,
                datasets: [{
                    label: "Average Accuracy %",
                    data: scores,
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.7)",
                        "rgba(239, 68, 68, 0.7)",
                        "rgba(168, 85, 247, 0.7)",
                        "rgba(16, 185, 129, 0.7)"
                    ],
                    borderColor: [
                        "#3b82f6",
                        "#ef4444",
                        "#a855f7",
                        "#10b981"
                    ],
                    borderWidth: 1.5,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: "#94a3b8" }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#64748b", callback: v => v + "%" }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: ctx => `Accuracy: ${ctx.parsed.y}%` }
                    }
                }
            }
        });
    }

    function renderRecentActivityFeed(activities) {
        const container = document.getElementById("recentActivityList");
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = `<div class="text-center py-4 text-muted">No recent student submissions logged yet.</div>`;
            return;
        }

        container.innerHTML = activities.map(act => {
            const initials = (act.user_name || "S").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const badgeClass = act.subject === "Python" ? "badge-python" : act.subject === "Java" ? "badge-java" : act.subject === "C++" ? "badge-cpp" : "badge-english";
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="user-avatar-sm" style="width: 32px; height: 32px; font-size: 0.78rem;">${initials}</div>
                        <div>
                            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${escapeHTML(act.user_name)}</div>
                            <div style="font-size: 0.74rem; color: var(--text-muted);">${escapeHTML(act.user_email)}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="lang-badge-pill ${badgeClass}" style="font-size: 0.7rem; padding: 2px 7px;">${act.subject} Lesson ${act.lesson_number}</span>
                        <div style="font-size: 0.72rem; color: var(--emerald); font-weight: 700; margin-top: 2px;">
                            Score: ${act.score}/${act.total_questions} (+${act.xp_earned} XP)
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    document.getElementById("btnRefreshActivityFeed")?.addEventListener("click", loadDashboard);

    // -------------------------------------------------------------------------
    // 2. STUDENT MANAGEMENT CONTROLLER
    // -------------------------------------------------------------------------
    const searchInput = document.getElementById("studentSearchInput");
    const langFilter = document.getElementById("studentLanguageFilter");
    const roleFilter = document.getElementById("studentRoleFilter");
    const studentsTableBody = document.getElementById("studentsTableBody");
    const studentResultCount = document.getElementById("studentResultCount");
    const studentPaginationInfo = document.getElementById("studentPaginationInfo");
    const paginationPageNumbers = document.getElementById("paginationPageNumbers");
    const btnPrevPage = document.getElementById("btnPrevPage");
    const btnNextPage = document.getElementById("btnNextPage");

    let studentCurrentPage = 1;
    const studentPageSize = 8;
    let studentTotalPages = 1;
    let studentTotalCount = 0;
    let studentSearchTimeout = null;

    async function loadStudents(page = 1) {
        if (!studentsTableBody) return;
        studentCurrentPage = page;

        studentsTableBody.innerHTML = `
            <tr><td colspan="9" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span> Loading student roster...</td></tr>
        `;

        try {
            const res = await AdminAPI.getStudents({
                search: searchInput?.value || "",
                language: langFilter?.value || "",
                role: roleFilter?.value || "",
                page: studentCurrentPage,
                limit: studentPageSize
            });

            const students = res.students || [];
            studentTotalCount = res.total ?? students.length;
            studentTotalPages = res.total_pages || Math.max(1, Math.ceil(studentTotalCount / studentPageSize));

            if (studentResultCount) {
                studentResultCount.textContent = `Showing ${students.length} of ${studentTotalCount} students`;
            }

            renderPaginationControls();

            if (students.length === 0) {
                studentsTableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No students matching query criteria.</td></tr>`;
                return;
            }

            studentsTableBody.innerHTML = students.map(s => {
                const initials = (s.full_name || "S").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                const avatarHtml = s.profile_picture 
                    ? `<img src="${escapeHTML(s.profile_picture)}" class="user-avatar-img" alt="${escapeHTML(s.full_name)}" onerror="this.outerHTML='<div class=\\'user-avatar-sm\\'>${initials}</div>'">`
                    : `<div class="user-avatar-sm">${initials}</div>`;
                
                const googlePill = s.google_id
                    ? `<span class="google-id-pill" title="${escapeHTML(s.google_id)}"><i class="bi bi-google"></i> ${escapeHTML(s.google_id.length > 12 ? s.google_id.slice(0, 10) + '...' : s.google_id)}</span>`
                    : `<span class="text-muted" style="font-size: 0.78rem;">Email Auth</span>`;

                const regDate = s.created_at
                    ? new Date(s.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : "--";

                const lastLoginStr = s.last_login
                    ? new Date(s.last_login).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : `<span class="text-muted">Never</span>`;

                const progressPct = s.course_progress ?? 0;

                const roleBadge = s.role === "admin" 
                    ? `<span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">Admin</span>`
                    : s.role === "scholar"
                    ? `<span class="badge bg-purple bg-opacity-25 text-purple border border-purple border-opacity-50" style="color: var(--purple-light);">Scholar</span>`
                    : `<span class="badge bg-secondary bg-opacity-25 text-light">Learner</span>`;

                return `
                    <tr>
                        <td style="text-align: center;">${avatarHtml}</td>
                        <td>
                            <div class="user-details-title" style="font-weight: 700;">${escapeHTML(s.full_name)}</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(s.chosen_language || 'General Track')}</div>
                        </td>
                        <td>
                            <span class="user-details-sub">${escapeHTML(s.email)}</span>
                        </td>
                        <td>${googlePill}</td>
                        <td style="font-size: 0.82rem; color: var(--text-secondary);">${regDate}</td>
                        <td style="font-size: 0.82rem; color: var(--text-secondary);">${lastLoginStr}</td>
                        <td>
                            <div class="progress-cell-wrapper">
                                <div class="progress-bar-track">
                                    <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
                                </div>
                                <span class="progress-pct-label">${progressPct}%</span>
                            </div>
                        </td>
                        <td>${roleBadge}</td>
                        <td style="text-align: right;">
                            <div class="action-btns justify-content-end">
                                <button class="btn-icon-action btn-view-student" data-id="${s.id}" title="View Student Progress Dossier">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn-icon-action btn-edit-student" data-id="${s.id}" title="Edit Profile">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn-icon-action btn-delete btn-delete-student" data-id="${s.id}" data-name="${escapeHTML(s.full_name)}" title="Delete Student">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");

            // Attach listeners to row actions
            document.querySelectorAll(".btn-view-student").forEach(btn => {
                btn.addEventListener("click", () => openViewStudentModal(btn.getAttribute("data-id")));
            });

            document.querySelectorAll(".btn-edit-student").forEach(btn => {
                btn.addEventListener("click", () => openEditStudentModal(btn.getAttribute("data-id")));
            });

            document.querySelectorAll(".btn-delete-student").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const name = btn.getAttribute("data-name");
                    openDeleteConfirm(`Are you sure you want to permanently delete student account "${name}"?`, async () => {
                        try {
                            await AdminAPI.deleteStudent(id);
                            showToast(`Student ${name} deleted successfully.`, "success");
                            loadStudents(studentCurrentPage);
                            loadDashboard();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    });
                });
            });

        } catch (err) {
            studentsTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4 text-danger">
                        <div class="mb-2"><i class="bi bi-exclamation-triangle-fill me-2"></i>Error loading students: ${err.message}</div>
                        <button class="btn btn-sm btn-outline-info" onclick="window.location.reload()">
                            <i class="bi bi-arrow-clockwise me-1"></i> Retry Connection
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    function renderPaginationControls() {
        if (!studentPaginationInfo || !paginationPageNumbers) return;
        studentPaginationInfo.textContent = `Showing Page ${studentCurrentPage} of ${studentTotalPages} (${studentTotalCount} total entries)`;

        if (btnPrevPage) {
            btnPrevPage.disabled = studentCurrentPage <= 1;
        }
        if (btnNextPage) {
            btnNextPage.disabled = studentCurrentPage >= studentTotalPages;
        }

        let pagesHtml = "";
        for (let p = 1; p <= studentTotalPages; p++) {
            if (p === 1 || p === studentTotalPages || (p >= studentCurrentPage - 1 && p <= studentCurrentPage + 1)) {
                pagesHtml += `<button class="btn-page ${p === studentCurrentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
            } else if (p === studentCurrentPage - 2 || p === studentCurrentPage + 2) {
                pagesHtml += `<span style="color: var(--text-muted); padding: 0 4px;">...</span>`;
            }
        }
        paginationPageNumbers.innerHTML = pagesHtml;

        paginationPageNumbers.querySelectorAll(".btn-page").forEach(b => {
            b.addEventListener("click", () => {
                const target = parseInt(b.getAttribute("data-page"), 10);
                if (target && target !== studentCurrentPage) {
                    loadStudents(target);
                }
            });
        });
    }

    btnPrevPage?.addEventListener("click", () => {
        if (studentCurrentPage > 1) loadStudents(studentCurrentPage - 1);
    });

    btnNextPage?.addEventListener("click", () => {
        if (studentCurrentPage < studentTotalPages) loadStudents(studentCurrentPage + 1);
    });

    // Debounced filter listeners
    searchInput?.addEventListener("input", () => {
        clearTimeout(studentSearchTimeout);
        studentSearchTimeout = setTimeout(() => loadStudents(1), 300);
    });
    langFilter?.addEventListener("change", () => loadStudents(1));
    roleFilter?.addEventListener("change", () => loadStudents(1));

    // Modal: View Student Dossier
    async function openViewStudentModal(userId) {
        try {
            const data = await AdminAPI.getStudentDetail(userId);
            const user = data.user || {};
            const stats = data.stats || {};
            const subjectProgress = data.progress_by_subject || {};
            const quizResults = data.quiz_results || [];

            // Avatar & Name
            const initials = (user.full_name || "S").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const avatarContainer = document.getElementById("dossierAvatarContainer");
            if (avatarContainer) {
                if (user.profile_picture) {
                    avatarContainer.innerHTML = `<img src="${escapeHTML(user.profile_picture)}" class="student-dossier-avatar" alt="${escapeHTML(user.full_name)}" onerror="this.outerHTML='<div class=\\'student-dossier-avatar\\' style=\\'display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;background:var(--grad-primary);color:#fff;\\'>${initials}</div>'">`;
                } else {
                    avatarContainer.innerHTML = `<div class="student-dossier-avatar" style="display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; background: var(--grad-primary); color: #fff;">${initials}</div>`;
                }
            }

            document.getElementById("dossierName").textContent = user.full_name || "Student Dossier";
            document.getElementById("dossierEmail").textContent = user.email || "--";
            document.getElementById("dossierGoogleId").textContent = user.google_id || "Not Linked (Email Auth)";

            const roleBadgeEl = document.getElementById("dossierRoleBadge");
            if (roleBadgeEl) {
                roleBadgeEl.textContent = (user.role || "learner").toUpperCase();
                roleBadgeEl.className = user.role === "admin" 
                    ? "badge bg-danger text-light px-2 py-1"
                    : user.role === "scholar"
                    ? "badge bg-purple text-light px-2 py-1"
                    : "badge bg-secondary text-light px-2 py-1";
            }

            // Stats
            document.getElementById("dossierHighestScore").textContent = (stats.highest_score || 0) + "%";
            document.getElementById("dossierTotalAttempts").textContent = stats.total_attempts || 0;
            const minutes = stats.time_spent_learning_mins || stats.time_spent_learning_minutes || 0;
            const hours = Math.floor(minutes / 60);
            const remMins = minutes % 60;
            document.getElementById("dossierTimeSpent").textContent = hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`;
            const overallPct = stats.overall_completion_rate ?? stats.average_quiz_score ?? 0;
            document.getElementById("dossierProgressPercent").textContent = overallPct + "%";
            document.getElementById("dossierRegDate").textContent = user.created_at ? new Date(user.created_at).toLocaleDateString() : "--";
            document.getElementById("dossierLastLogin").textContent = user.last_login ? new Date(user.last_login).toLocaleString() : "Never";

            // Subjects Grid (English, Python, Java, C++)
            const subjectsGrid = document.getElementById("dossierSubjectsGrid");
            if (subjectsGrid) {
                const subjectIcons = {
                    "English": '<i class="bi bi-translate text-success"></i>',
                    "Python": '<i class="bi bi-filetype-py text-primary"></i>',
                    "Java": '<i class="bi bi-cup-hot-fill text-danger"></i>',
                    "C++": '<i class="bi bi-cpu-fill text-purple"></i>'
                };

                const trackKeys = ["English", "Python", "Java", "C++"];
                subjectsGrid.innerHTML = trackKeys.map(track => {
                    const icon = subjectIcons[track] || '<i class="bi bi-book"></i>';
                    const modules = subjectProgress[track] || [];

                    const modulesHtml = modules.map(m => {
                        const modName = m.module_name || m.module || m.module_key || "Module";
                        const compPct = m.completion_percent ?? m.completion_percentage ?? 0;
                        const isDone = m.is_completed ?? m.completed ?? false;
                        const bestScore = m.highest_score ?? 0;
                        const attemptsCount = m.total_attempts ?? m.attempts ?? 0;
                        const spentMins = m.time_spent_mins ?? m.time_spent_minutes ?? 0;

                        return `
                            <div class="module-item-row">
                                <div class="module-item-info">
                                    <span>${escapeHTML(modName)}</span>
                                    <span style="font-weight: 700; color: ${isDone ? 'var(--emerald)' : 'var(--text-secondary)'};">
                                        ${compPct}% ${isDone ? '✓' : ''}
                                    </span>
                                </div>
                                <div class="progress-bar-track" style="height: 6px;">
                                    <div class="progress-bar-fill" style="width: ${compPct}%; background: ${isDone ? 'var(--grad-emerald)' : 'var(--grad-primary)'};"></div>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: var(--text-muted); margin-top: 2px;">
                                    <span>Best: ${bestScore}%</span>
                                    <span>Attempts: ${attemptsCount} • ${spentMins}m</span>
                                </div>
                            </div>
                        `;
                    }).join("");

                    return `
                        <div class="subject-card-box">
                            <div class="subject-card-title">
                                ${icon} <span>${track}</span>
                            </div>
                            <div>
                                ${modulesHtml || '<div class="text-muted" style="font-size: 0.78rem;">No progress recorded yet</div>'}
                            </div>
                        </div>
                    `;
                }).join("");
            }

            // Quiz History Table
            const quizBody = document.getElementById("dossierQuizHistoryBody");
            if (quizBody) {
                const quizList = (data.quiz_history && data.quiz_history.length > 0) ? data.quiz_history : (data.quiz_results || []);
                if (quizList.length === 0) {
                    quizBody.innerHTML = `<tr><td colspan="7" class="text-center py-3 text-muted">No quiz submissions recorded yet.</td></tr>`;
                } else {
                    quizBody.innerHTML = quizList.map(q => {
                        const qTitle = q.title || q.quiz_title || q.module_key || "Quiz Assessment";
                        const qTopic = q.topic || q.course_slug || "--";
                        const pct = Math.round(q.percentage ?? q.score_percentage ?? 0);
                        const passed = q.passed !== undefined ? q.passed : (pct >= 70);
                        const dateStr = (q.completed_at || q.created_at) ? new Date(q.completed_at || q.created_at).toLocaleDateString() : "--";
                        return `
                            <tr>
                                <td style="font-weight: 600;">${escapeHTML(qTitle)}</td>
                                <td><span class="badge bg-secondary bg-opacity-25 text-light">${escapeHTML(qTopic)}</span></td>
                                <td>${q.score ?? 0}/${q.total_questions ?? 0}</td>
                                <td><strong>${pct}%</strong></td>
                                <td>
                                    <span class="badge ${passed ? 'bg-success' : 'bg-danger'} bg-opacity-25 ${passed ? 'text-success' : 'text-danger'} border ${passed ? 'border-success' : 'border-danger'} border-opacity-50">
                                        ${passed ? 'Passed' : 'Failed'}
                                    </span>
                                </td>
                                <td>#${q.attempt_number || 1}</td>
                                <td style="color: var(--text-muted); font-size: 0.78rem;">${dateStr}</td>
                            </tr>
                        `;
                    }).join("");
                }
            }

            // Genuine Curriculum Lessons Table
            const lessonsBody = document.getElementById("dossierLessonsBody");
            if (lessonsBody) {
                const lessonsList = data.lessons || [];
                if (lessonsList.length === 0) {
                    lessonsBody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No completed lessons recorded yet.</td></tr>`;
                } else {
                    lessonsBody.innerHTML = lessonsList.map(l => {
                        const statusBadge = l.completed
                            ? `<span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">Completed</span>`
                            : `<span class="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50">In Progress</span>`;
                        return `
                            <tr>
                                <td style="font-weight: 600;">${escapeHTML(l.subject)}</td>
                                <td>Lesson ${l.lesson_number}</td>
                                <td>${l.score ?? 0}/${l.total_questions || 5}</td>
                                <td><span class="text-warning font-monospace">+${l.xp_earned || 0} XP</span></td>
                                <td>${statusBadge}</td>
                                <td style="color: var(--text-muted); font-size: 0.78rem;">${escapeHTML(l.updated_at || "--")}</td>
                            </tr>
                        `;
                    }).join("");
                }
            }

            // Genuine Saved Projects
            const projectsListEl = document.getElementById("dossierProjectsList");
            if (projectsListEl) {
                const projList = data.projects || [];
                if (projList.length === 0) {
                    projectsListEl.innerHTML = `<div class="text-muted" style="font-size: 0.82rem;">No saved projects.</div>`;
                } else {
                    projectsListEl.innerHTML = projList.map(p => {
                        const isDone = p.is_completed;
                        const pct = p.progress_percent ?? 0;
                        return `
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; font-size: 0.85rem; color: #fff;">${escapeHTML(p.project_id || "Project")}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Progress: ${pct}%</div>
                                </div>
                                <span class="badge ${isDone ? 'bg-success' : 'bg-primary'} bg-opacity-25 ${isDone ? 'text-success' : 'text-primary'} border ${isDone ? 'border-success' : 'border-primary'} border-opacity-50">
                                    ${isDone ? 'Completed' : 'Active'}
                                </span>
                            </div>
                        `;
                    }).join("");
                }
            }

            // Genuine Badges
            const badgesListEl = document.getElementById("dossierBadgesList");
            if (badgesListEl) {
                const badgeList = data.badges || [];
                if (badgeList.length === 0) {
                    badgesListEl.innerHTML = `<div class="text-muted" style="font-size: 0.82rem;">No badges unlocked yet.</div>`;
                } else {
                    badgesListEl.innerHTML = badgeList.map(b => {
                        const badgeName = typeof b === 'string' ? b : (b.name || b.badge_slug || "Badge");
                        return `
                            <span class="badge bg-warning bg-opacity-15 text-warning border border-warning border-opacity-40 py-2 px-3" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem;">
                                <i class="bi bi-award-fill"></i> ${escapeHTML(badgeName)}
                            </span>
                        `;
                    }).join("");
                }
            }

            openModal("modalViewStudent");
        } catch (err) {
            showToast("Failed to load student dossier: " + err.message, "error");
        }
    }

    // Modal: Add Student
    document.getElementById("btnAddNewStudent")?.addEventListener("click", () => {
        document.getElementById("formAddStudent").reset();
        openModal("modalAddStudent");
    });

    document.getElementById("formAddStudent")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            full_name: document.getElementById("addStudentName").value.trim(),
            email: document.getElementById("addStudentEmail").value.trim(),
            google_id: document.getElementById("addStudentGoogleId")?.value.trim() || null,
            profile_picture: document.getElementById("addStudentAvatar")?.value.trim() || null,
            password: document.getElementById("addStudentPassword").value,
            chosen_language: document.getElementById("addStudentLanguage").value,
            role: document.getElementById("addStudentRole").value
        };

        try {
            await AdminAPI.createStudent(payload);
            showToast(`Student account for ${payload.full_name} created successfully!`, "success");
            closeModal("modalAddStudent");
            loadStudents(1);
            loadDashboard();
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // Modal: Edit Student
    async function openEditStudentModal(userId) {
        try {
            const data = await AdminAPI.getStudentDetail(userId);
            const user = data.user;
            const profile = data.profile;

            document.getElementById("editStudentId").value = user.id;
            document.getElementById("editStudentName").value = user.full_name;
            document.getElementById("editStudentEmail").value = user.email;
            const editGoogleId = document.getElementById("editStudentGoogleId");
            if (editGoogleId) editGoogleId.value = user.google_id || "";
            const editAvatar = document.getElementById("editStudentAvatar");
            if (editAvatar) editAvatar.value = user.profile_picture || "";
            document.getElementById("editStudentLanguage").value = profile.chosen_language;
            document.getElementById("editStudentXp").value = profile.total_xp;
            document.getElementById("editStudentStreak").value = profile.streak_days;
            document.getElementById("editStudentRole").value = user.role;
            document.getElementById("editStudentPassword").value = "";

            openModal("modalEditStudent");
        } catch (err) {
            showToast("Failed to fetch student details: " + err.message, "error");
        }
    }

    document.getElementById("formEditStudent")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userId = document.getElementById("editStudentId").value;
        const payload = {
            full_name: document.getElementById("editStudentName").value.trim(),
            email: document.getElementById("editStudentEmail").value.trim(),
            google_id: document.getElementById("editStudentGoogleId")?.value.trim() || null,
            profile_picture: document.getElementById("editStudentAvatar")?.value.trim() || null,
            chosen_language: document.getElementById("editStudentLanguage").value,
            total_xp: parseInt(document.getElementById("editStudentXp").value || "0", 10),
            streak_days: parseInt(document.getElementById("editStudentStreak").value || "0", 10),
            role: document.getElementById("editStudentRole").value
        };

        const pass = document.getElementById("editStudentPassword").value;
        if (pass && pass.trim()) {
            payload.password = pass.trim();
        }

        try {
            await AdminAPI.updateStudent(userId, payload);
            showToast("Student profile updated successfully.", "success");
            closeModal("modalEditStudent");
            loadStudents(studentCurrentPage);
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // ---------------- EXPORT CSV & PDF ACTIONS ----------------
    document.getElementById("btnExportCSV")?.addEventListener("click", () => {
        AdminAPI.downloadStudentsCSV();
    });
    document.getElementById("btnHeaderExportReport")?.addEventListener("click", () => {
        AdminAPI.downloadStudentsCSV();
    });

    async function exportStudentsToPDF() {
        try {
            showToast("Preparing printable student directory...", "info");
            const res = await AdminAPI.getStudents({ limit: 1000 });
            const students = res.students || [];

            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                showToast("Pop-up blocked. Please allow pop-ups to export PDF.", "error");
                return;
            }

            const rowsHtml = students.map((s, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11pt;">
                    <td style="padding: 10px; text-align: center;">${idx + 1}</td>
                    <td style="padding: 10px; font-weight: bold;">${escapeHTML(s.full_name)}</td>
                    <td style="padding: 10px;">${escapeHTML(s.email)}</td>
                    <td style="padding: 10px; font-family: monospace;">${escapeHTML(s.google_id || 'Email/Pass')}</td>
                    <td style="padding: 10px;">${s.chosen_language || 'General'}</td>
                    <td style="padding: 10px; text-align: center;"><strong>${s.course_progress ?? 0}%</strong></td>
                    <td style="padding: 10px; text-transform: capitalize;">${s.role}</td>
                    <td style="padding: 10px;">${s.created_at ? new Date(s.created_at).toLocaleDateString() : '--'}</td>
                </tr>
            `).join("");

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>LingoX - Student Directory Official Report</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 25px; }
                        .title h1 { margin: 0; color: #0f172a; font-size: 22pt; }
                        .title p { margin: 4px 0 0 0; color: #64748b; font-size: 11pt; }
                        .meta { text-align: right; font-size: 10pt; color: #64748b; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th { background: #f8fafc; color: #334155; padding: 10px; text-align: left; font-size: 10pt; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
                        .footer { margin-top: 30px; font-size: 9pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">
                            <h1>LingoX</h1>
                            <p>Official Academic Roster & Student Database Report</p>
                        </div>
                        <div class="meta">
                            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                            <div><strong>Total Students:</strong> ${students.length}</div>
                            <div><strong>Classification:</strong> Confidential Academic Record</div>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="text-align: center; width: 40px;">#</th>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Google ID</th>
                                <th>Track</th>
                                <th style="text-align: center;">Progress</th>
                                <th>Role</th>
                                <th>Registered</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <div class="footer">
                        Generated by LingoX Enterprise Administration Dashboard • &copy; 2026 LingoX System
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                        };
                    </script>
                </body>
                </html>
            `;

            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } catch (err) {
            showToast("Failed to generate PDF: " + err.message, "error");
        }
    }

    document.getElementById("btnExportPDF")?.addEventListener("click", exportStudentsToPDF);

    // -------------------------------------------------------------------------
    // 3. QUIZ MANAGEMENT CONTROLLER
    // -------------------------------------------------------------------------
    const quizTrackFilter = document.getElementById("quizTrackFilter");
    const quizLessonFilter = document.getElementById("quizLessonFilter");
    const quizSearchInput = document.getElementById("quizSearchInput");
    const quizzesCardsContainer = document.getElementById("quizzesCardsContainer");
    const quizResultCount = document.getElementById("quizResultCount");

    let quizSearchTimeout = null;

    async function loadQuizzes() {
        if (!quizzesCardsContainer) return;

        quizzesCardsContainer.innerHTML = `
            <div class="text-center py-5 text-muted" style="grid-column: 1 / -1;">
                <span class="spinner-border spinner-border-sm me-2"></span> Loading quiz bank...
            </div>
        `;

        try {
            const res = await AdminAPI.getQuizzes({
                track: quizTrackFilter?.value || "",
                lessonNumber: quizLessonFilter?.value || "",
                search: quizSearchInput?.value || "",
                skip: 0,
                limit: 60
            });

            const quizzes = res.quizzes || [];
            quizResultCount.textContent = `Showing ${quizzes.length} of ${res.total} questions`;

            if (quizzes.length === 0) {
                quizzesCardsContainer.innerHTML = `
                    <div class="text-center py-5 text-muted" style="grid-column: 1 / -1;">
                        No quiz questions found matching the selected filters.
                    </div>
                `;
                return;
            }

            quizzesCardsContainer.innerHTML = quizzes.map(q => {
                const badgeClass = q.track_slug === "Python" ? "badge-python" : q.track_slug === "Java" ? "badge-java" : q.track_slug === "C++" ? "badge-cpp" : "badge-english";
                
                const optionsHtml = (q.options || []).map((opt, idx) => {
                    const isCorrect = idx === q.answer_index;
                    return `
                        <li class="question-option-item ${isCorrect ? 'correct' : ''}">
                            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-circle'} me-1"></i>
                            <span>${escapeHTML(opt)}</span>
                        </li>
                    `;
                }).join("");

                return `
                    <div class="question-card">
                        <div>
                            <div class="question-header">
                                <span class="lang-badge-pill ${badgeClass}">
                                    ${q.track_slug} • Chapter ${q.lesson_number}
                                </span>
                                <div class="action-btns">
                                    <button class="btn-icon-action btn-edit-quiz" data-id="${q.id}" title="Edit Question">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn-icon-action btn-delete btn-delete-quiz" data-id="${q.id}" title="Delete Question">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <h4 class="question-title">${escapeHTML(q.question_text)}</h4>
                            <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">${escapeHTML(q.description || "")}</p>
                            <ul class="question-options-list">
                                ${optionsHtml}
                            </ul>
                        </div>
                        <div class="question-footer">
                            <span class="explanation-snippet" title="${escapeHTML(q.explanation || '')}">
                                💡 ${escapeHTML(q.explanation || "No explanation attached.")}
                            </span>
                            <span class="badge bg-secondary bg-opacity-20 text-muted" style="font-size: 0.7rem;">ID #${q.id}</span>
                        </div>
                    </div>
                `;
            }).join("");

            // Actions
            document.querySelectorAll(".btn-edit-quiz").forEach(btn => {
                btn.addEventListener("click", () => openEditQuizModal(btn.getAttribute("data-id"), quizzes));
            });

            document.querySelectorAll(".btn-delete-quiz").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    openDeleteConfirm("Are you sure you want to permanently delete this quiz question?", async () => {
                        try {
                            await AdminAPI.deleteQuiz(id);
                            showToast("Question deleted from curriculum bank.", "success");
                            loadQuizzes();
                            loadDashboard();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    });
                });
            });

        } catch (err) {
            quizzesCardsContainer.innerHTML = `<div class="text-danger py-4 text-center" style="grid-column: 1 / -1;">Error loading quizzes: ${err.message}</div>`;
        }
    }

    quizTrackFilter?.addEventListener("change", loadQuizzes);
    quizLessonFilter?.addEventListener("change", loadQuizzes);
    quizSearchInput?.addEventListener("input", () => {
        clearTimeout(quizSearchTimeout);
        quizSearchTimeout = setTimeout(loadQuizzes, 300);
    });

    // Populate dynamic lesson selector for Add Question Modal
    async function populateAddLessonOptions(trackSlug) {
        const selectEl = document.getElementById("addQLessonSelect");
        if (!selectEl) return;
        selectEl.innerHTML = `<option value="">Loading chapters...</option>`;

        try {
            if (coursesData.length === 0) {
                coursesData = await AdminAPI.getCourses();
            }
            const track = coursesData.find(t => t.slug.toLowerCase() === trackSlug.toLowerCase());
            if (track && track.lessons && track.lessons.length > 0) {
                selectEl.innerHTML = track.lessons.map(l => `
                    <option value="${l.id}">Chapter ${l.lesson_number}: ${escapeHTML(l.title)}</option>
                `).join("");
            } else {
                selectEl.innerHTML = `<option value="">No chapters found</option>`;
            }
        } catch (e) {
            selectEl.innerHTML = `<option value="1">Chapter 1</option>`;
        }
    }

    document.getElementById("addQTrackSelect")?.addEventListener("change", (e) => {
        populateAddLessonOptions(e.target.value);
    });

    document.getElementById("btnAddNewQuestion")?.addEventListener("click", () => {
        document.getElementById("formAddQuestion").reset();
        populateAddLessonOptions(document.getElementById("addQTrackSelect").value);
        openModal("modalAddQuestion");
    });

    document.getElementById("formAddQuestion")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const lessonId = parseInt(document.getElementById("addQLessonSelect").value, 10);
        if (!lessonId) {
            showToast("Please select a target chapter.", "error");
            return;
        }

        const selectedAnswer = parseInt(document.querySelector('input[name="addQCorrectOpt"]:checked')?.value || "0", 10);
        const options = [
            document.getElementById("addQOpt0").value.trim(),
            document.getElementById("addQOpt1").value.trim(),
            document.getElementById("addQOpt2").value.trim(),
            document.getElementById("addQOpt3").value.trim()
        ];

        const payload = {
            lesson_id: lessonId,
            question_text: document.getElementById("addQText").value.trim(),
            description: document.getElementById("addQDesc").value.trim(),
            options: options,
            answer_index: selectedAnswer,
            explanation: document.getElementById("addQExplanation").value.trim()
        };

        try {
            await AdminAPI.createQuiz(payload);
            showToast("Quiz question created and published!", "success");
            closeModal("modalAddQuestion");
            loadQuizzes();
            loadDashboard();
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    function openEditQuizModal(questionId, quizzesList) {
        const q = quizzesList.find(item => item.id == questionId);
        if (!q) return;

        document.getElementById("editQId").value = q.id;
        document.getElementById("editQText").value = q.question_text;
        document.getElementById("editQDesc").value = q.description || "";
        
        const opts = q.options || ["", "", "", ""];
        document.getElementById("editQOpt0").value = opts[0] || "";
        document.getElementById("editQOpt1").value = opts[1] || "";
        document.getElementById("editQOpt2").value = opts[2] || "";
        document.getElementById("editQOpt3").value = opts[3] || "";

        const radioEl = document.getElementById(`editQRadio${q.answer_index}`);
        if (radioEl) radioEl.checked = true;

        document.getElementById("editQExplanation").value = q.explanation || "";

        openModal("modalEditQuestion");
    }

    document.getElementById("formEditQuestion")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const qId = document.getElementById("editQId").value;
        const selectedAnswer = parseInt(document.querySelector('input[name="editQCorrectOpt"]:checked')?.value || "0", 10);
        const options = [
            document.getElementById("editQOpt0").value.trim(),
            document.getElementById("editQOpt1").value.trim(),
            document.getElementById("editQOpt2").value.trim(),
            document.getElementById("editQOpt3").value.trim()
        ];

        const payload = {
            question_text: document.getElementById("editQText").value.trim(),
            description: document.getElementById("editQDesc").value.trim(),
            options: options,
            answer_index: selectedAnswer,
            explanation: document.getElementById("editQExplanation").value.trim()
        };

        try {
            await AdminAPI.updateQuiz(qId, payload);
            showToast("Question updated successfully.", "success");
            closeModal("modalEditQuestion");
            loadQuizzes();
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // -------------------------------------------------------------------------
    // 4. COURSE & ROADMAP CONTROLLER
    // -------------------------------------------------------------------------
    async function loadCourses() {
        const trackSelector = document.getElementById("courseTrackSelector");
        const lessonsContainer = document.getElementById("lessonsContainer");
        const summaryText = document.getElementById("selectedTrackSummary");

        try {
            coursesData = await AdminAPI.getCourses();

            // Render track buttons
            if (trackSelector) {
                trackSelector.innerHTML = coursesData.map(t => `
                    <div class="track-select-card ${t.slug.toLowerCase() === activeTrackSlug.toLowerCase() ? 'active' : ''}" data-track="${t.slug}">
                        <div class="track-icon-large">${t.icon || '📚'}</div>
                        <div>
                            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${t.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${t.lessons?.length || 0} Lessons</div>
                        </div>
                    </div>
                `).join("");

                document.querySelectorAll(".track-select-card").forEach(card => {
                    card.addEventListener("click", () => {
                        activeTrackSlug = card.getAttribute("data-track");
                        document.querySelectorAll(".track-select-card").forEach(c => c.classList.remove("active"));
                        card.classList.add("active");
                        renderActiveTrackLessons();
                    });
                });
            }

            renderActiveTrackLessons();
            loadRoadmap();

        } catch (err) {
            if (lessonsContainer) lessonsContainer.innerHTML = `<div class="text-danger py-4 text-center">Error loading courses: ${err.message}</div>`;
        }
    }

    function renderActiveTrackLessons() {
        const lessonsContainer = document.getElementById("lessonsContainer");
        const summaryText = document.getElementById("selectedTrackSummary");
        if (!lessonsContainer) return;

        const track = coursesData.find(t => t.slug.toLowerCase() === activeTrackSlug.toLowerCase());
        if (!track) return;

        if (summaryText) summaryText.textContent = `${track.name}: ${track.description || 'Mastery syllabus'}`;

        const lessons = track.lessons || [];
        if (lessons.length === 0) {
            lessonsContainer.innerHTML = `<div class="text-center py-4 text-muted">No chapters created for this track yet.</div>`;
            return;
        }

        lessonsContainer.innerHTML = lessons.map(l => `
            <div class="lesson-item-card">
                <div class="lesson-info-group">
                    <div class="lesson-num-badge">${l.lesson_number}</div>
                    <div class="lesson-text">
                        <h4>${escapeHTML(l.title)}</h4>
                        <p>${escapeHTML(l.description || 'Core syllabus chapter')}</p>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <span class="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30">
                        ${l.questions_count || 0} Questions
                    </span>
                    <button class="btn btn-sm btn-outline-light btn-edit-lesson" data-id="${l.id}" title="Edit Theory & Content">
                        <i class="bi bi-pencil me-1"></i> Edit Chapter
                    </button>
                </div>
            </div>
        `).join("");

        document.querySelectorAll(".btn-edit-lesson").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const les = lessons.find(x => x.id == id);
                if (les) {
                    document.getElementById("editLessonId").value = les.id;
                    document.getElementById("editLessonTitle").value = les.title;
                    document.getElementById("editLessonDesc").value = les.description || "";
                    document.getElementById("editLessonTheory").value = les.theory || "";
                    openModal("modalEditLesson");
                }
            });
        });
    }

    document.getElementById("formEditLesson")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("editLessonId").value;
        const payload = {
            title: document.getElementById("editLessonTitle").value.trim(),
            description: document.getElementById("editLessonDesc").value.trim(),
            theory: document.getElementById("editLessonTheory").value
        };

        try {
            await AdminAPI.updateLesson(id, payload);
            showToast("Lesson chapter updated successfully.", "success");
            closeModal("modalEditLesson");
            loadCourses();
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    async function loadRoadmap() {
        const container = document.getElementById("roadmapStagesContainer");
        if (!container) return;

        try {
            const stages = await AdminAPI.getRoadmap();
            container.innerHTML = stages.map(s => {
                const milestones = s.milestones || [];
                const milestonesList = milestones.map(m => `
                    <li style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 4px;">
                        <i class="bi bi-check2-circle text-primary"></i> ${escapeHTML(m)}
                    </li>
                `).join("");

                return `
                    <div class="stage-step-card glass-card p-3">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <h4 style="font-size: 1rem; color: var(--text-primary); margin: 0;">${escapeHTML(s.title)}</h4>
                            <span class="badge bg-secondary bg-opacity-30">Tier ${s.stage_number}</span>
                        </div>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">${escapeHTML(s.description || "")}</p>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${milestonesList}
                        </ul>
                    </div>
                `;
            }).join("");
        } catch (err) {
            container.innerHTML = `<div class="text-muted py-2">Could not load roadmap stages.</div>`;
        }
    }

    // -------------------------------------------------------------------------
    // 5. ANALYTICS & REPORTS CONTROLLER
    // -------------------------------------------------------------------------
    async function loadAnalytics() {
        try {
            const data = await AdminAPI.getAnalytics();

            document.getElementById("analyticsPassRate").textContent = `${data.overall_pass_rate}%`;
            document.getElementById("analyticsTotalAttempts").textContent = data.total_attempts;
            document.getElementById("analyticsBadgesCount").textContent = data.total_badges_unlocked;

            // Score Distribution Chart
            renderScoreDistChart(data.score_distribution);

            // Subject Matrix Table
            const matrixBody = document.getElementById("analyticsSubjectMatrixBody");
            if (matrixBody && data.subject_metrics) {
                matrixBody.innerHTML = data.subject_metrics.map(m => {
                    const badgeClass = m.subject === "Python" ? "badge-python" : m.subject === "Java" ? "badge-java" : m.subject === "C++" ? "badge-cpp" : "badge-english";
                    return `
                        <tr>
                            <td><span class="lang-badge-pill ${badgeClass}">${m.subject}</span></td>
                            <td style="font-weight: 700;">${m.attempts}</td>
                            <td>${m.average_score} / 5.0</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="progress" style="height: 6px; width: 80px; background: rgba(255,255,255,0.1);">
                                        <div class="progress-bar bg-success" style="width: ${m.percentage}%;"></div>
                                    </div>
                                    <span style="font-weight: 700; color: var(--emerald);">${m.percentage}%</span>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join("");
            }

        } catch (err) {
            showToast("Failed to load analytics: " + err.message, "error");
        }
    }

    function renderScoreDistChart(scoreCounts) {
        const ctx = document.getElementById("chartScoreDistribution")?.getContext("2d");
        if (!ctx) return;

        if (chartScoreDist) chartScoreDist.destroy();

        const defaultScoreCounts = { "0/5": 0, "1/5": 0, "2/5": 0, "3/5": 0, "4/5": 0, "5/5": 0 };
        const counts = (scoreCounts && Object.keys(scoreCounts).length > 0) ? scoreCounts : defaultScoreCounts;
        const labels = Object.keys(counts);
        const values = Object.values(counts);

        chartScoreDist = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Students",
                    data: values,
                    backgroundColor: "rgba(16, 185, 129, 0.65)",
                    borderColor: "#10b981",
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: "#94a3b8" } },
                    y: {
                        ticks: { color: "#64748b", precision: 0 },
                        grid: { color: "rgba(255, 255, 255, 0.05)" }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Export Buttons
    document.getElementById("btnExportStudentsCSV")?.addEventListener("click", async () => {
        try {
            showToast("Generating Students CSV export...", "info");
            await AdminAPI.downloadStudentsCSV();
            showToast("Students CSV downloaded successfully.", "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    document.getElementById("btnExportQuizzesCSV")?.addEventListener("click", async () => {
        try {
            showToast("Generating Quizzes CSV export...", "info");
            await AdminAPI.downloadQuizzesCSV();
            showToast("Quizzes CSV downloaded successfully.", "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    document.getElementById("btnHeaderExportReport")?.addEventListener("click", () => {
        AdminAPI.downloadStudentsCSV().catch(e => showToast(e.message, "error"));
    });

    document.getElementById("btnExportPDFReport")?.addEventListener("click", () => {
        window.print();
    });

    // -------------------------------------------------------------------------
    // 6. SETTINGS CONTROLLER
    // -------------------------------------------------------------------------
    async function loadSettings() {
        try {
            const s = await AdminAPI.getSettings();
            if (s) {
                if (document.getElementById("settingPlatformName")) document.getElementById("settingPlatformName").value = s.platform_name || "LingoX Royal Academy";
                if (document.getElementById("settingDefaultLanguage")) document.getElementById("settingDefaultLanguage").value = s.default_language || "Python";
                if (document.getElementById("settingPassScore")) document.getElementById("settingPassScore").value = s.min_pass_score || 70;
                if (document.getElementById("settingDailyGoal")) document.getElementById("settingDailyGoal").value = s.daily_goal_minutes || 15;
                if (document.getElementById("settingAiModel")) document.getElementById("settingAiModel").value = s.ai_mentor_model || "gemini-3.6-flash";
                if (document.getElementById("settingAiTemp")) document.getElementById("settingAiTemp").value = s.ai_mentor_temperature || 0.7;
            }
        } catch (err) {
            showToast("Could not load current settings: " + err.message, "error");
        }
    }

    document.getElementById("settingsPlatformForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            platform_name: document.getElementById("settingPlatformName").value.trim(),
            default_language: document.getElementById("settingDefaultLanguage").value,
            min_pass_score: parseInt(document.getElementById("settingPassScore").value, 10),
            daily_goal_minutes: parseInt(document.getElementById("settingDailyGoal").value, 10)
        };
        try {
            await AdminAPI.updateSettings(payload);
            showToast("Platform configurations saved.", "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    document.getElementById("settingsAiForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            ai_mentor_model: document.getElementById("settingAiModel").value,
            ai_mentor_temperature: parseFloat(document.getElementById("settingAiTemp").value)
        };
        try {
            await AdminAPI.updateSettings(payload);
            showToast("AI Mentor tuning parameters updated.", "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    document.getElementById("settingsPasswordForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const cur = document.getElementById("settingCurPass").value;
        const newPass = document.getElementById("settingNewPass").value;

        try {
            await AdminAPI.changePassword(cur, newPass);
            showToast("Master administrator password updated successfully!", "success");
            document.getElementById("settingsPasswordForm").reset();
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // -------------------------------------------------------------------------
    // 7. AUDIT LOGS CONTROLLER
    // -------------------------------------------------------------------------
    async function loadLogs() {
        const tbody = document.getElementById("auditLogsTableBody");
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span> Loading audit logs...</td></tr>`;

        try {
            const data = await AdminAPI.getLogs(100);
            const logs = (data && data.logs) ? data.logs : [];

            if (logs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No audit log entries recorded yet.</td></tr>`;
                return;
            }

            const actionColors = {
                CREATE_STUDENT: "bg-success text-success",
                UPDATE_STUDENT: "bg-info text-info",
                DELETE_STUDENT: "bg-danger text-danger",
                UPDATE_SETTINGS: "bg-warning text-warning",
                CHANGE_PASSWORD: "bg-danger text-danger",
                CREATE_QUESTION: "bg-primary text-primary",
                UPDATE_QUESTION: "bg-info text-info",
                DELETE_QUESTION: "bg-danger text-danger",
                CREATE_LESSON: "bg-primary text-primary",
                UPDATE_LESSON: "bg-info text-info",
                DELETE_LESSON: "bg-danger text-danger",
                SAVE_ROADMAP_STAGE: "bg-purple text-purple",
                DELETE_ROADMAP_STAGE: "bg-danger text-danger"
            };

            tbody.innerHTML = logs.map(l => {
                const colorClass = actionColors[l.action] || "bg-secondary text-light";
                return `
                    <tr>
                        <td style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">${escapeHTML(l.created_at || "--")}</td>
                        <td style="font-weight: 600;">${escapeHTML(l.admin_email || "System Admin")}</td>
                        <td>
                            <span class="badge ${colorClass} bg-opacity-25 border border-opacity-50" style="font-size: 0.75rem; letter-spacing: 0.5px;">
                                ${escapeHTML(l.action)}
                            </span>
                        </td>
                        <td><span class="font-monospace text-light" style="font-size: 0.8rem;">${escapeHTML(l.target_type || "--")}${l.target_id ? ` #${escapeHTML(l.target_id)}` : ''}</span></td>
                        <td style="font-size: 0.85rem; max-width: 320px; word-break: break-word;">${escapeHTML(l.details || "--")}</td>
                        <td style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">${escapeHTML(l.ip_address || "127.0.0.1")}</td>
                    </tr>
                `;
            }).join("");
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to load audit logs: ${escapeHTML(err.message)}</td></tr>`;
            showToast("Failed to fetch audit logs: " + err.message, "error");
        }
    }

    document.getElementById("btnRefreshLogs")?.addEventListener("click", () => {
        loadLogs();
        showToast("Audit logs refreshed", "info");
    });

    // -------------------------------------------------------------------------
    // HEADER ACTIONS & MOBILE TOGGLE
    // -------------------------------------------------------------------------
    headerQuickAddBtn?.addEventListener("click", () => {
        if (currentTab === "quizzes") {
            document.getElementById("formAddQuestion").reset();
            populateAddLessonOptions(document.getElementById("addQTrackSelect").value);
            openModal("modalAddQuestion");
        } else {
            document.getElementById("formAddStudent").reset();
            openModal("modalAddStudent");
        }
    });

    document.getElementById("btnToggleSidebar")?.addEventListener("click", () => {
        document.getElementById("adminSidebar")?.classList.toggle("mobile-open");
    });

    // Logout
    document.getElementById("btnSidebarLogout")?.addEventListener("click", () => {
        openDeleteConfirm("Are you sure you want to end your administrator session and log out?", () => {
            AdminAPI.logout();
        });
    });

    // -------------------------------------------------------------------------
    // MODALS & TOAST HELPERS
    // -------------------------------------------------------------------------
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add("show");
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("show");
    }

    document.querySelectorAll("[data-close-modal]").forEach(btn => {
        btn.addEventListener("click", () => {
            const mId = btn.getAttribute("data-close-modal");
            if (mId) closeModal(mId);
        });
    });

    // Backdrop click close
    document.querySelectorAll(".modal-backdrop-custom").forEach(backdrop => {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) backdrop.classList.remove("show");
        });
    });

    function openDeleteConfirm(message, onConfirm) {
        document.getElementById("deleteConfirmMessage").textContent = message;
        openModal("modalDeleteConfirm");
        pendingDeleteAction = onConfirm;
    }

    document.getElementById("btnConfirmDeleteAction")?.addEventListener("click", () => {
        if (pendingDeleteAction) {
            pendingDeleteAction();
            pendingDeleteAction = null;
        }
        closeModal("modalDeleteConfirm");
    });

    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast-custom toast-${type}`;

        const iconMap = {
            success: '<i class="bi bi-check-circle-fill text-success fs-5"></i>',
            error: '<i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>',
            info: '<i class="bi bi-info-circle-fill text-primary fs-5"></i>'
        };

        toast.innerHTML = `
            ${iconMap[type] || iconMap.info}
            <div style="flex: 1;">${escapeHTML(message)}</div>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3800);
    }

    function escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Start services
    initAdminProfile();
    initClock();
});
