/* =========================================================
   BHASHA_AI - ROADMAP SCRIPT (REAL DATA SYNC)
   Synchronized with FastAPI backend and user lesson progress
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const subjectCards = document.querySelectorAll(".envelope-wrapper, .subject-card");
    const searchInput = document.getElementById("searchInput");
    const continueBtn = document.getElementById("continueBtn");
    const subjectCount = document.getElementById("subjectCount");

    const trackIcons = { Python: "🐍", Java: "☕", "C++": "⚙️", English: "🇬🇧" };
    const tracks = ["Python", "Java", "C++", "English"];

    // 1. Load authenticated user profile
    let profile = null;
    if (window.BhashaAPI) {
        try {
            profile = await window.BhashaAPI.getProfile();
        } catch (e) {
            console.warn("[Roadmap] Backend profile sync failed, falling back to cached profile:", e);
        }
    }

    const name = (profile && profile.full_name) || localStorage.getItem("bhasha_user_name") || "Scholar";
    const xp = (profile && profile.total_xp !== undefined) ? profile.total_xp : parseInt(localStorage.getItem("bhasha_xp") || "0", 10);
    const streak = (profile && profile.streak_days !== undefined) ? profile.streak_days : parseInt(localStorage.getItem("bhasha_streak") || "0", 10);
    const level = (profile && profile.current_level) || Math.max(1, Math.floor(xp / 100) + 1);

    // Resolve active track from URL parameter, BhashaAPI, or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const querySubject = urlParams.get("subject") || urlParams.get("track") || urlParams.get("lang");
    let activeTrack = null;
    if (querySubject && window.BhashaAPI && window.BhashaAPI.normalizeSubject) {
        activeTrack = window.BhashaAPI.normalizeSubject(querySubject, null);
    }
    if (!activeTrack && window.BhashaAPI && window.BhashaAPI.getSelectedSubject) {
        activeTrack = window.BhashaAPI.getSelectedSubject();
    }
    if (!activeTrack) {
        activeTrack = (profile && profile.chosen_language) || localStorage.getItem("bhasha_chosen_language") || "Python";
    }
    if (window.BhashaAPI && window.BhashaAPI.normalizeSubject) {
        activeTrack = window.BhashaAPI.normalizeSubject(activeTrack, "Python");
    }

    // Persist and synchronize navigation links
    if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
        window.BhashaAPI.setSelectedSubject(activeTrack, true);
    } else {
        localStorage.setItem("bhasha_chosen_language", activeTrack);
    }
    if (window.BhashaAPI && window.BhashaAPI.syncNavLinks) {
        window.BhashaAPI.syncNavLinks(activeTrack);
    }

    // Update Topbar & Sidebar Stats
    const topStreak = document.getElementById("topStreak");
    if (topStreak) topStreak.textContent = streak;
    const sidebarStreakText = document.getElementById("sidebarStreakText");
    if (sidebarStreakText) sidebarStreakText.textContent = `${streak} Day Streak`;
    const topXp = document.getElementById("topXp");
    if (topXp) topXp.textContent = xp.toLocaleString();
    const topUserName = document.getElementById("topUserName");
    if (topUserName) topUserName.textContent = name;
    const topUserLevel = document.getElementById("topUserLevel");
    if (topUserLevel) topUserLevel.textContent = `Level ${level}`;
    const topAvatar = document.getElementById("topAvatar");
    if (topAvatar) topAvatar.textContent = (name || "S").charAt(0).toUpperCase();

    // 2. Load authenticated user lesson progress
    let allProgress = [];
    if (window.BhashaAPI) {
        try {
            allProgress = await window.BhashaAPI.getLessonProgress();
        } catch (e) {
            console.warn("[Roadmap] Backend progress sync failed, falling back to local cache:", e);
        }
    }
    if (!allProgress || allProgress.length === 0) {
        if (window.BhashaAPI && window.BhashaAPI.getLocalProgress) {
            allProgress = window.BhashaAPI.getLocalProgress();
        }
    }

    // 3. Compute real progress for each curriculum track against genuine module counts
    const trackTotals = { Python: 8, Java: 8, "C++": 8, English: 8 };
    const totalCurriculumModules = 32; // 8 modules * 4 tracks

    let totalCompletedAll = 0;
    tracks.forEach(track => {
        const normTrack = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(track)
            : track;

        const completedModules = new Set(
            (allProgress || [])
                .filter(p => {
                    const pSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                        ? window.BhashaAPI.normalizeSubject(p.subject)
                        : p.subject;
                    return pSub.toLowerCase() === normTrack.toLowerCase() && Boolean(p.completed);
                })
                .map(p => Number(p.lesson_number))
        );

        const count = completedModules.size;
        totalCompletedAll += count;
        const trackTotal = trackTotals[track] || 8;
        const pct = Math.min(100, Math.round((count / trackTotal) * 100));

        // Update DOM for this track envelope
        const envelopeWrapper = document.querySelector(`.envelope-wrapper[data-subject="${track}"]`);
        if (envelopeWrapper) {
            const progStrong = envelopeWrapper.querySelector(".letter-progress .p-info strong");
            if (progStrong) progStrong.textContent = `${pct}%`;
            const progBar = envelopeWrapper.querySelector(".letter-progress .p-bar div");
            if (progBar) progBar.style.width = `${pct}%`;
        }
    });

    // 4. Compute Overall Mastery across all 25 curriculum modules
    const overallPct = Math.min(100, Math.round((totalCompletedAll / totalCurriculumModules) * 100));
    const overallMasteryPct = document.getElementById("overallMasteryPct");
    if (overallMasteryPct) overallMasteryPct.textContent = `${overallPct}%`;
    const overallMasteryBar = document.getElementById("overallMasteryBar");
    if (overallMasteryBar) overallMasteryBar.style.width = `${overallPct}%`;

    // 5. Update Continue Learning Banner
    const continueTrackIcon = document.getElementById("continueTrackIcon");
    if (continueTrackIcon) continueTrackIcon.textContent = trackIcons[activeTrack] || "🌿";
    const continueTrackTitle = document.getElementById("continueTrackTitle");
    if (continueTrackTitle) continueTrackTitle.textContent = `Continue ${activeTrack} Learning Path`;

    const maxLessons = trackTotals[activeTrack] || 8;
    let nextLesson = 1;
    let isAllCompleted = false;

    if (window.BhashaAPI && window.BhashaAPI.getNextLessonForSubject) {
        const nextInfo = window.BhashaAPI.getNextLessonForSubject(activeTrack, allProgress, maxLessons);
        nextLesson = nextInfo.lessonNumber;
        isAllCompleted = nextInfo.isAllCompleted;
    } else {
        const normActive = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(activeTrack)
            : activeTrack;
        const activeCompleted = new Set(
            (allProgress || [])
                .filter(p => {
                    const pSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                        ? window.BhashaAPI.normalizeSubject(p.subject)
                        : p.subject;
                    return pSub.toLowerCase() === normActive.toLowerCase() && Boolean(p.completed);
                })
                .map(p => Number(p.lesson_number))
        );
        for (let i = 1; i <= maxLessons; i++) {
            if (!activeCompleted.has(i)) {
                nextLesson = i;
                break;
            }
        }
        isAllCompleted = activeCompleted.size >= maxLessons;
        if (isAllCompleted) nextLesson = maxLessons;
    }

    const continueTrackDesc = document.getElementById("continueTrackDesc");
    if (continueTrackDesc) {
        if (isAllCompleted) {
            continueTrackDesc.textContent = `All ${maxLessons} modules completed in ${activeTrack}! Review anytime.`;
        } else {
            continueTrackDesc.textContent = `Pick up right where you left off on Module ${nextLesson}.`;
        }
    }

    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            window.location.href = `lesson.html?subject=${encodeURIComponent(activeTrack)}&lesson=${nextLesson}`;
        });
    }

    // 6. Highlight and automatically unseal the active track envelope
    subjectCards.forEach(card => {
        const rawSubject = card.getAttribute("data-subject") || "Python";
        const normSubject = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(rawSubject, rawSubject)
            : rawSubject;
        if (normSubject && activeTrack && normSubject.toLowerCase() === activeTrack.toLowerCase()) {
            card.classList.add("open");
            card.classList.add("active-track");
            const labelSub = card.querySelector(".envelope-label span");
            if (labelSub) {
                labelSub.textContent = "Selected Active Track • Unsealed";
                labelSub.style.fontWeight = "700";
            }
        }
    });

    /* =====================================================
       ENVELOPE / CARD CLICK & OPEN BUTTON
       ===================================================== */
    subjectCards.forEach(card => {
        const rawSubject = card.getAttribute("data-subject") || "Python";
        const normSubject = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(rawSubject, rawSubject)
            : rawSubject;
        const openBtn = card.querySelector(".open-btn");
        const letter = card.querySelector(".envelope-letter");
        const label = card.querySelector(".envelope-label");

        function openTrack(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
                window.BhashaAPI.setSelectedSubject(normSubject, true);
            } else {
                localStorage.setItem("bhasha_chosen_language", normSubject);
            }
            window.location.href = `subject.html?subject=${encodeURIComponent(normSubject)}`;
        }

        if (openBtn) {
            openBtn.addEventListener("click", openTrack);
        }

        if (letter) {
            letter.addEventListener("click", (e) => {
                if (e.target.closest(".open-btn")) return;
                if (card.classList.contains("open")) {
                    openTrack(e);
                }
            });
        }

        if (label) {
            label.addEventListener("click", (e) => {
                e.stopPropagation();
                if (card.classList.contains("open")) {
                    openTrack(e);
                } else {
                    card.classList.add("open");
                }
            });
        }

        card.addEventListener("dblclick", openTrack);

        card.addEventListener("click", (e) => {
            if (e.target.closest(".open-btn") || e.target.closest(".envelope-label")) return;
            if (card.classList.contains("open") && e.target.closest(".envelope-letter")) {
                openTrack(e);
                return;
            }
            card.classList.toggle("open");
        });
    });

    /* =====================================================
       LIVE FILTERING / SEARCH
       ===================================================== */
    function filterSubjects(term) {
        const query = term.toLowerCase().trim();
        let visibleCount = 0;

        subjectCards.forEach(card => {
            const subject = (card.getAttribute("data-subject") || "").toLowerCase();
            const text = card.textContent.toLowerCase();

            if (query === "" || subject.includes(query) || text.includes(query)) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (subjectCount) {
            subjectCount.textContent = `${visibleCount} Roadmap${visibleCount === 1 ? "" : "s"}`;
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filterSubjects(searchInput.value);
        });

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");
        if (initialQuery) {
            searchInput.value = initialQuery;
            filterSubjects(initialQuery);
        }
    }
});