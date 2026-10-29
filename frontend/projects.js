/* =========================================================
   BHASHA_AI - PROJECTS CATALOG SCRIPT (SUBJECT ISOLATION & SYNC)
   Synchronized with FastAPI backend server-side filtering
   Strictly separates: Python, Java, C++, Technical English, General Concepts
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const projectGrid = document.getElementById("projectGrid");
    const searchInput = document.getElementById("projectSearch");
    const emptyState = document.getElementById("emptyState");
    const newProjectBtn = document.getElementById("newProjectBtn");
    const categoryTabs = document.querySelectorAll(".category-tab");
    const filterButtons = document.querySelectorAll(".filter-btn");

    let activeSubject = "Python";
    let currentFilter = "all";
    let catalogProjects = [];
    let userProjectsMap = new Map();

    // 5 Canonical Subject Categories Metadata
    const SUBJECT_METADATA = {
        Python: {
            name: "Python",
            heading: "Python Projects",
            tag: "PYTHON TRACK",
            description: "Build, test, and master Python modules, terminal tools, and problem-solving algorithms.",
            icon: "🐍",
            cssClass: "python",
            sectionTitle: "Python Projects Catalog",
            sectionSubtitle: "Core Python architecture, script development, and problem solving."
        },
        Java: {
            name: "Java",
            heading: "Java Projects",
            tag: "JAVA TRACK",
            description: "Develop enterprise-grade Object-Oriented systems with encapsulation and modular architecture.",
            icon: "☕",
            cssClass: "java",
            sectionTitle: "Java Projects Catalog",
            sectionSubtitle: "Object-oriented design, encapsulation, and Java architectures."
        },
        "C++": {
            name: "C++",
            heading: "C++ Projects",
            tag: "C++ TRACK",
            description: "Construct high-performance systems programs with memory management and algorithmic efficiency.",
            icon: "⚙️",
            cssClass: "cpp",
            sectionTitle: "C++ Projects Catalog",
            sectionSubtitle: "High-performance systems programming, memory safety, and C++ algorithms."
        },
        English: {
            name: "Technical English",
            heading: "Technical English Projects",
            tag: "TECHNICAL ENGLISH",
            description: "Master technical writing, API documentation, vocabulary exercises, grammar practice, and professional communication.",
            icon: "📝",
            cssClass: "english",
            sectionTitle: "Technical English Portfolio",
            sectionSubtitle: "Language-learning activities, technical writing, documentation, and professional communication."
        },
        General: {
            name: "General Concepts",
            heading: "General Concepts Projects",
            tag: "GENERAL CONCEPTS",
            description: "Design relational database schemas, execute advanced SQL queries, and analyze algorithmic complexities.",
            icon: "🗄️",
            cssClass: "general",
            sectionTitle: "General Concepts Portfolio",
            sectionSubtitle: "Database management, schema design, and algorithm complexity analysis."
        }
    };

    // 1. Resolve Active Subject from URL -> BhashaAPI -> localStorage -> default "Python"
    function resolveActiveSubject() {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get("subject") || params.get("track") || params.get("lang");
        if (fromUrl && window.BhashaAPI) {
            const norm = window.BhashaAPI.normalizeSubject(fromUrl, null);
            if (norm) return norm;
        }

        if (window.BhashaAPI && typeof window.BhashaAPI.getSelectedSubject === "function") {
            const fromApi = window.BhashaAPI.getSelectedSubject();
            if (fromApi) return fromApi;
        }

        try {
            const stored = localStorage.getItem("bhasha_chosen_language");
            if (stored && window.BhashaAPI) {
                const norm = window.BhashaAPI.normalizeSubject(stored, null);
                if (norm) return norm;
            }
        } catch (_) {}

        return "Python";
    }

    activeSubject = resolveActiveSubject();

    // 2. Load authenticated user profile for topbar & sidebar
    let profile = null;
    if (window.BhashaAPI) {
        try {
            profile = await window.BhashaAPI.getProfile();
        } catch (e) {
            console.warn("[Projects] Backend profile sync notice:", e);
        }
    }

    const name = (profile && profile.full_name) || localStorage.getItem("bhasha_user_name") || "Scholar";
    const xp = (profile && profile.total_xp !== undefined) ? profile.total_xp : parseInt(localStorage.getItem("bhasha_xp") || "0", 10);
    const streak = (profile && profile.streak_days !== undefined) ? profile.streak_days : parseInt(localStorage.getItem("bhasha_streak") || "0", 10);
    const level = (profile && profile.current_level) || Math.max(1, Math.floor(xp / 300));

    // Update Topbar & Sidebar Stats
    const topStreak = document.getElementById("topStreak");
    if (topStreak) topStreak.textContent = streak;
    const sidebarStreakText = document.getElementById("sidebarStreakText");
    if (sidebarStreakText) sidebarStreakText.textContent = `${streak} Day Streak`;
    const topXp = document.getElementById("topXp");
    if (topXp) topXp.textContent = `${xp.toLocaleString()} XP`;
    const topUserName = document.getElementById("topUserName");
    if (topUserName) topUserName.textContent = name;
    const topUserLevel = document.getElementById("topUserLevel");
    if (topUserLevel) topUserLevel.textContent = `Level ${level}`;
    const topAvatar = document.getElementById("topAvatar");
    if (topAvatar) topAvatar.textContent = (name || "S").charAt(0).toUpperCase();

    // 3. Update Subject Headers & Category Tabs
    function updateSubjectUI(subjectKey) {
        const meta = SUBJECT_METADATA[subjectKey] || SUBJECT_METADATA.Python;

        const tagEl = document.getElementById("pageSubjectTag");
        if (tagEl) tagEl.textContent = meta.tag;

        const headEl = document.getElementById("pageSubjectHeading");
        if (headEl) headEl.textContent = meta.heading;

        const descEl = document.getElementById("pageSubjectDescription");
        if (descEl) descEl.textContent = meta.description;

        const secTitle = document.getElementById("sectionSubjectTitle");
        if (secTitle) secTitle.textContent = meta.sectionTitle;

        const secSubtitle = document.getElementById("sectionSubjectSubtitle");
        if (secSubtitle) secSubtitle.textContent = meta.sectionSubtitle;

        // Update category tab active state
        categoryTabs.forEach(tab => {
            const tabSub = tab.getAttribute("data-subject");
            const normTab = window.BhashaAPI ? window.BhashaAPI.normalizeSubject(tabSub) : tabSub;
            if (normTab === subjectKey) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });
    }

    // 4. Fetch Project Catalog with Server-Side Subject Filtering
    async function loadProjectsWorkspace(subjectKey) {
        updateSubjectUI(subjectKey);

        if (projectGrid) {
            projectGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--c-sage);">
                    Loading ${SUBJECT_METADATA[subjectKey]?.heading || "projects"}...
                </div>
            `;
        }

        if (!window.BhashaAPI) return;

        try {
            // A. Fetch Project Catalog from Backend (Filtered on Server Side)
            const catalog = await window.BhashaAPI.getProjects(subjectKey);

            // Strictly ensure only projects belonging to this subject are admitted
            catalogProjects = Array.isArray(catalog) ? catalog.filter(p => {
                const pSub = window.BhashaAPI ? window.BhashaAPI.normalizeSubject(p.subject) : p.subject;
                return pSub === subjectKey;
            }) : [];

            // B. Fetch Authenticated User's Real Project Records
            let userRecords = [];
            try {
                userRecords = await window.BhashaAPI.getAllProjectProgress();
            } catch (err) {
                console.warn("[Projects] Could not fetch user project progress:", err);
            }

            userProjectsMap.clear();
            if (Array.isArray(userRecords)) {
                userRecords.forEach(rec => {
                    userProjectsMap.set(rec.project_id, rec);
                });
            }

            // Also check localStorage for offline saved progress for this subject
            catalogProjects.forEach(p => {
                if (!userProjectsMap.has(p.slug)) {
                    try {
                        const raw = localStorage.getItem(`bhasha_project_${p.slug}`);
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            userProjectsMap.set(p.slug, {
                                project_id: p.slug,
                                saved_code: parsed.code || null,
                                progress_percent: Number(parsed.progress) || 0,
                                is_completed: Boolean(parsed.completed)
                            });
                        }
                    } catch (_) {}
                }
            });

            // C. Update Workspace Stat Counters
            updateStats();

            // D. Render Genuine Project Cards
            renderProjectCards();

        } catch (e) {
            console.error("[Projects] Error loading workspace:", e);
            if (projectGrid) {
                projectGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--c-coral);">
                        Could not load ${subjectKey} projects. Please verify backend connection.
                    </div>
                `;
            }
        }
    }

    // 5. Update Workspace Stat Counters for this Subject
    function updateStats() {
        const total = catalogProjects.length;
        let inProgressCount = 0;
        let completedCount = 0;
        let totalPossibleXP = 0;
        let earnedXP = 0;

        catalogProjects.forEach(p => {
            const pXp = Number(p.xp) || 100;
            totalPossibleXP += pXp;

            const userRec = userProjectsMap.get(p.slug);
            if (userRec) {
                if (userRec.is_completed || userRec.progress_percent >= 100) {
                    completedCount++;
                    earnedXP += pXp;
                } else if (userRec.progress_percent > 0) {
                    inProgressCount++;
                }
            }
        });

        const activePct = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
        const donePct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const xpPct = totalPossibleXP > 0 ? Math.min(100, Math.round((earnedXP / totalPossibleXP) * 100)) : 0;

        // Total Projects
        const totalEl = document.getElementById("totalProjects");
        if (totalEl) totalEl.textContent = total;
        const totalSub = document.getElementById("totalProjectsSub");
        if (totalSub) totalSub.textContent = `${activeSubject} Catalog`;

        // In Progress
        const progEl = document.getElementById("progressProjects");
        if (progEl) progEl.textContent = inProgressCount;
        const progSub = document.getElementById("progressProjectsSub");
        if (progSub) progSub.textContent = `${activePct}% Active`;
        const progBar = document.getElementById("progressProjectsBar");
        if (progBar) progBar.style.width = `${activePct}%`;

        // Completed
        const compEl = document.getElementById("completedProjects");
        if (compEl) compEl.textContent = completedCount;
        const compSub = document.getElementById("completedProjectsSub");
        if (compSub) compSub.textContent = `${donePct}% Done`;
        const compBar = document.getElementById("completedProjectsBar");
        if (compBar) compBar.style.width = `${donePct}%`;

        // Project XP
        const xpEl = document.getElementById("projectXP");
        if (xpEl) xpEl.textContent = earnedXP.toLocaleString();
        const xpSub = document.getElementById("projectXPSub");
        if (xpSub) xpSub.textContent = `/ ${totalPossibleXP.toLocaleString()} XP`;
        const xpBar = document.getElementById("projectXPBar");
        if (xpBar) xpBar.style.width = `${xpPct}%`;
    }

    // 6. Render Project Cards Dynamically
    function renderProjectCards() {
        if (!projectGrid) return;

        if (catalogProjects.length === 0) {
            projectGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--royal-beige-muted);">
                    <div style="font-size: 36px; margin-bottom: 12px;">📂</div>
                    <h3 style="color: var(--royal-brown-deep); margin-bottom: 8px;">No ${activeSubject} projects found</h3>
                    <p style="font-size: 13px; max-width: 420px; margin: 0 auto 20px;">
                        There are currently no projects in the ${activeSubject} category. You can create your own custom project below.
                    </p>
                    <button class="new-project-btn" onclick="window.location.href='project.html?new=true&subject=${encodeURIComponent(activeSubject)}'">
                        <span>＋</span> Create First ${activeSubject} Project
                    </button>
                </div>
            `;
            if (emptyState) emptyState.style.display = "none";
            return;
        }

        const meta = SUBJECT_METADATA[activeSubject] || SUBJECT_METADATA.Python;

        projectGrid.innerHTML = catalogProjects.map(proj => {
            const userRec = userProjectsMap.get(proj.slug);
            let status = "not-started";
            let pct = 0;
            let btnText = "Start Project →";

            if (userRec) {
                if (userRec.is_completed || userRec.progress_percent >= 100) {
                    status = "completed";
                    pct = 100;
                    btnText = "View Completed →";
                } else if (userRec.progress_percent > 0) {
                    status = "progress";
                    pct = Math.max(0, Math.min(100, Math.round(userRec.progress_percent)));
                    btnText = "Continue Project →";
                }
            }

            const icon = proj.icon || meta.icon || "💻";
            const iconClass = meta.cssClass || "python";
            const lessonTag = proj.lesson || `${proj.subject} • Architecture`;
            const miniClass = status === "completed" ? "completed" : (status === "not-started" ? "not-started" : "");
            const miniPercentLabel = status === "completed" ? "100% ✓" : `${pct}%`;
            const displaySubject = proj.subject === "English" ? "Technical English" : (proj.subject === "General" ? "General Concepts" : proj.subject);

            return `
                <article
                    class="project-card"
                    data-subject="${proj.subject}"
                    data-status="${status}"
                    data-slug="${proj.slug}"
                >
                    <div class="project-top">
                        <div class="project-icon ${iconClass}">
                            ${icon}
                        </div>

                        <div class="project-card-mini-bar ${miniClass}" title="${pct}% Complete">
                            <div class="mini-track">
                                <div class="mini-fill" style="width: ${pct}%;"></div>
                            </div>
                            <span class="mini-percent">${miniPercentLabel}</span>
                        </div>
                    </div>

                    <div class="project-tags-row">
                        <span class="project-subject-badge">${displaySubject}</span>
                        <span class="project-lang-badge">${proj.language || "CODE"}</span>
                    </div>

                    <h3>${proj.title}</h3>

                    <p class="project-description">
                        ${proj.description}
                    </p>

                    <div class="lesson-link">
                        <span>📚</span>
                        ${lessonTag}
                    </div>

                    <div class="progress-area">
                        <div class="progress-info">
                            <span>Progress</span>
                            <strong>${pct}%</strong>
                        </div>
                        <div class="progress-bar">
                            <div style="width: ${pct}%"></div>
                        </div>
                    </div>

                    <div class="project-bottom">
                        <span class="xp">
                            ⭐ ${proj.xp} XP
                        </span>

                        <button
                            class="open-project"
                            data-project="${proj.slug}"
                        >
                            ${btnText}
                        </button>
                    </div>
                </article>
            `;
        }).join("");

        attachCardListeners();
        filterProjects();
    }

    // 7. Attach Card Click & Button Handlers
    function attachCardListeners() {
        const cards = projectGrid.querySelectorAll(".project-card");
        cards.forEach(card => {
            const btn = card.querySelector(".open-project");
            const slug = card.getAttribute("data-slug");

            if (btn) {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    window.location.href = `project.html?id=${encodeURIComponent(slug)}&subject=${encodeURIComponent(activeSubject)}`;
                });
            }

            card.addEventListener("click", (e) => {
                if (e.target.tagName.toLowerCase() === "button") return;
                window.location.href = `project.html?id=${encodeURIComponent(slug)}&subject=${encodeURIComponent(activeSubject)}`;
            });
        });
    }

    // 8. Filter & Search Logic within Active Subject
    function filterProjects() {
        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const cards = projectGrid.querySelectorAll(".project-card");
        let visibleCount = 0;

        cards.forEach(card => {
            const status = (card.getAttribute("data-status") || "").toLowerCase();
            const title = (card.querySelector("h3") ? card.querySelector("h3").textContent : "").toLowerCase();
            const desc = (card.querySelector(".project-description") ? card.querySelector(".project-description").textContent : "").toLowerCase();

            let matchesFilter = false;
            if (currentFilter === "all") {
                matchesFilter = true;
            } else if (currentFilter === "progress") {
                matchesFilter = (status === "progress");
            } else if (currentFilter === "completed") {
                matchesFilter = (status === "completed");
            }

            const matchesSearch = searchText === "" ||
                title.includes(searchText) ||
                desc.includes(searchText);

            if (matchesFilter && matchesSearch) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount === 0 && catalogProjects.length > 0 ? "block" : "none";
        }
    }

    // Status filter buttons handler
    filterButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            filterButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentFilter = this.getAttribute("data-filter") || "all";
            filterProjects();
        });
    });

    // 9. Subject Category Tabs Handler (Interactive Switching)
    categoryTabs.forEach(tab => {
        tab.addEventListener("click", async function () {
            const targetSub = this.getAttribute("data-subject");
            const normSub = window.BhashaAPI ? window.BhashaAPI.normalizeSubject(targetSub) : targetSub;
            if (!normSub || normSub === activeSubject) return;

            activeSubject = normSub;

            // Update URL without page reload
            try {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set("subject", activeSubject);
                window.history.pushState({ subject: activeSubject }, "", newUrl.toString());
            } catch (_) {}

            // Save subject preference
            if (window.BhashaAPI) {
                window.BhashaAPI.setSelectedSubject(activeSubject, false);
            }

            // Reset search and status filter
            if (searchInput) searchInput.value = "";
            currentFilter = "all";
            filterButtons.forEach(b => {
                if (b.getAttribute("data-filter") === "all") {
                    b.classList.add("active");
                } else {
                    b.classList.remove("active");
                }
            });

            // Fetch and render the new subject's projects from backend
            await loadProjectsWorkspace(activeSubject);
        });
    });

    // Live search handler
    if (searchInput) {
        searchInput.addEventListener("input", filterProjects);
    }

    // New Project Button
    if (newProjectBtn) {
        newProjectBtn.addEventListener("click", () => {
            window.location.href = `project.html?new=true&subject=${encodeURIComponent(activeSubject)}`;
        });
    }

    // Initial load
    await loadProjectsWorkspace(activeSubject);

});