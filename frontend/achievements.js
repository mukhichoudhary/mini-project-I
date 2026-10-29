/* =========================================================
   BHASHA_AI - ACHIEVEMENTS SCRIPT (DATA-DRIVEN)
   Interactive Progress Road, Real Badges & Verified Curriculum
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("searchInput");
    const learnerName = document.getElementById("learnerName");
    const learnerSubtitle = document.getElementById("learnerSubtitle");
    const topAvatar = document.getElementById("topAvatar");
    const topStreak = document.getElementById("topStreak");
    const topXp = document.getElementById("topXp");
    const sidebarStreak = document.getElementById("sidebarStreak");

    const levelNum = document.getElementById("levelNum");
    const levelXp = document.getElementById("levelXp");
    const levelProgressBar = document.getElementById("levelProgressBar");
    const levelXpSubtext = document.getElementById("levelXpSubtext");

    const statLessonsCompleted = document.getElementById("statLessonsCompleted");
    const statLessonsTotal = document.getElementById("statLessonsTotal");
    const statCoursesCompleted = document.getElementById("statCoursesCompleted");
    const statCoursesTotal = document.getElementById("statCoursesTotal");
    const statTotalXp = document.getElementById("statTotalXp");
    const statLongestStreak = document.getElementById("statLongestStreak");

    const courseGrid = document.getElementById("courseGrid");
    const badgeGrid = document.getElementById("badgeGrid");
    const badgeCount = document.getElementById("badgeCount");

    const errorBanner = document.getElementById("errorBanner");
    const guestBanner = document.getElementById("guestBanner");

    const wavyRoadPath = document.getElementById("wavyRoadPath");
    const wavyRoadProgressFill = document.getElementById("wavyRoadProgressFill");
    const wavyCarAnchor = document.getElementById("wavyCarAnchor");
    const wavyCarRotator = document.getElementById("wavyCarRotator");
    const carPhotoImg = document.getElementById("carPhotoImg");
    const carProgressTag = document.getElementById("carProgressTag");
    const tierTitle = document.getElementById("tierTitle");
    const tierCategory = document.getElementById("tierCategory");
    const tierButtons = document.querySelectorAll(".tier-btn");
    const btnMyProgress = document.getElementById("btnMyProgress");

    const carPhotos = {
        stage1: "assets/cars/car_stage1.png",
        stage2: "assets/cars/car_stage2.png",
        stage3: "assets/cars/car_stage3.png",
        stage4: "assets/cars/car_stage4.png"
    };

    let userRealProgress = 0;

    /* =====================================================
       UTILITY HELPERS
       ===================================================== */
    function escapeHtml(text) {
        if (text === null || text === undefined) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(isoString) {
        if (!isoString) return "";
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        } catch (_) {
            return "";
        }
    }

    /* =====================================================
       WAVY ROAD & DIRECT CAR PHOTO LOGIC
       ===================================================== */
    function updateWavyRoad(progressPercent) {
        const p = Math.max(0, Math.min(100, Math.round(progressPercent)));

        if (!wavyRoadPath) return;

        const totalLen = wavyRoadPath.getTotalLength();
        const curLen = (p / 100) * totalLen;

        // 1. Update SVG Progress Fill Stroke
        if (wavyRoadProgressFill) {
            wavyRoadProgressFill.style.strokeDasharray = `${totalLen}`;
            wavyRoadProgressFill.style.strokeDashoffset = `${totalLen - curLen}`;
        }

        // 2. Position Pins along the wavy curve
        [0, 25, 50, 75, 100].forEach(pct => {
            const pin = document.getElementById(`pin${pct}`);
            if (pin) {
                const pinLen = (pct / 100) * totalLen;
                const pt = wavyRoadPath.getPointAtLength(pinLen);
                pin.style.left = `${(pt.x / 1000) * 100}%`;
                pin.style.top = `${(pt.y / 160) * 100}%`;
            }
        });

        // 3. Position and Rotate Car along the Wavy Curve
        if (wavyCarAnchor && wavyCarRotator) {
            const pt = wavyRoadPath.getPointAtLength(curLen);
            const ptAhead = wavyRoadPath.getPointAtLength(Math.min(totalLen, curLen + 5));
            const ptBehind = wavyRoadPath.getPointAtLength(Math.max(0, curLen - 5));
            const angle = Math.atan2(ptAhead.y - ptBehind.y, ptAhead.x - ptBehind.x) * (180 / Math.PI);

            wavyCarAnchor.style.left = `${(pt.x / 1000) * 100}%`;
            wavyCarAnchor.style.top = `${(pt.y / 160) * 100}%`;
            wavyCarRotator.style.transform = `rotate(${angle.toFixed(1)}deg)`;
        }

        // 4. Update Direct Car Photo & Info
        let catText = "STAGE 1 • FUNDAMENTALS & BASICS";
        let photoSrc = carPhotos.stage1;

        if (p >= 75) {
            catText = "STAGE 4 • CURRICULUM MASTERY";
            photoSrc = carPhotos.stage4;
        } else if (p >= 50) {
            catText = "STAGE 3 • ADVANCED ALGORITHMS";
            photoSrc = carPhotos.stage3;
        } else if (p >= 25) {
            catText = "STAGE 2 • CORE ARCHITECTURE";
            photoSrc = carPhotos.stage2;
        }

        if (carPhotoImg) {
            carPhotoImg.src = photoSrc;
        }
        if (carProgressTag) {
            carProgressTag.textContent = `Progress: ${p}%`;
        }
        if (tierCategory) tierCategory.textContent = catText;
        if (tierTitle) tierTitle.textContent = `Overall Progress: ${p}%`;
    }

    // Evolution preview tier buttons
    tierButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tierButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const targetP = parseInt(btn.getAttribute("data-progress"), 10);
            updateWavyRoad(Number.isFinite(targetP) ? targetP : userRealProgress);
        });
    });

    /* =====================================================
       CARD RENDERING TEMPLATES
       ===================================================== */
    function renderCourseCards(tracks) {
        if (!courseGrid) return;
        if (!Array.isArray(tracks) || tracks.length === 0) {
            courseGrid.innerHTML = `<div class="achievements-loading">No courses available.</div>`;
            return;
        }

        courseGrid.innerHTML = tracks.map(t => {
            const isCompleted = t.status && t.status.includes("✓");
            const statusClass = isCompleted ? "course-status completed" : "course-status";
            return `
                <div class="course-card" data-name="${escapeHtml(t.name.toLowerCase())}">
                    <div class="course-icon">${escapeHtml(t.icon)}</div>
                    <div class="course-info">
                        <div class="course-title">
                            <h3>${escapeHtml(t.name)}</h3>
                            <strong>${Number(t.progress_percent) || 0}%</strong>
                        </div>
                        <p>${Number(t.completed_lessons) || 0} of ${Number(t.total_lessons) || 8} lessons completed</p>
                        <div class="course-progress">
                            <div style="width: ${Number(t.progress_percent) || 0}%;"></div>
                        </div>
                    </div>
                    <span class="${statusClass}">${escapeHtml(t.status || "In Progress")}</span>
                </div>
            `;
        }).join("");
    }

    function renderBadgeCards(badges) {
        if (!badgeGrid) return;
        if (!Array.isArray(badges) || badges.length === 0) {
            badgeGrid.innerHTML = `<div class="achievements-loading">No badges found.</div>`;
            return;
        }

        badgeGrid.innerHTML = badges.map(b => {
            const isUnlocked = Boolean(b.unlocked);
            const cardClass = isUnlocked ? "badge-card unlocked" : "badge-card locked";

            let tagText = "Locked";
            if (isUnlocked) {
                tagText = "Unlocked";
            } else if ((b.current_progress || 0) > 0) {
                tagText = "In Progress";
            }

            const earnedDate = (isUnlocked && b.unlocked_at) ? formatDate(b.unlocked_at) : "";
            const earnedDateHtml = earnedDate
                ? `<span class="badge-earned-date" title="Unlocked on ${escapeHtml(earnedDate)}">🏆 Earned ${escapeHtml(earnedDate)}</span>`
                : "";

            const pct = Math.min(100, Math.max(0, Number(b.progress_percentage) || 0));
            const label = b.progress_label || `Progress: ${b.current_progress || 0} / ${b.target_progress || 1}`;

            return `
                <div class="${cardClass}" data-slug="${escapeHtml(b.slug)}" data-name="${escapeHtml(b.title.toLowerCase())}">
                    <div class="badge-top-row">
                        <div class="badge-icon-box">${escapeHtml(b.icon || "🏅")}</div>
                        <span class="badge-tier-tag">${tagText}</span>
                    </div>
                    <h3>${escapeHtml(b.title)}</h3>
                    <p>${escapeHtml(b.description)}</p>
                    ${earnedDateHtml}
                    <div class="badge-progress-container">
                        <div class="badge-progress-header">
                            <span>${escapeHtml(label)}</span>
                            <strong>${pct}%</strong>
                        </div>
                        <div class="badge-progress-track">
                            <div class="badge-progress-fill" style="width: ${pct}%;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Attach click interactions to newly rendered badges
        bindBadgeInteractions();
    }

    function bindBadgeInteractions() {
        const badgeCards = document.querySelectorAll(".badge-card");
        badgeCards.forEach(card => {
            card.addEventListener("click", () => {
                card.classList.add("badge-highlight");
                setTimeout(() => {
                    card.classList.remove("badge-highlight");
                }, 500);
            });
        });
    }

    /* =====================================================
       SEARCH FILTER
       ===================================================== */
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase().trim();

            const bCards = document.querySelectorAll(".badge-card");
            bCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? "" : "none";
            });

            const cCards = document.querySelectorAll(".course-card");
            cCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? "" : "none";
            });
        });
    }

    /* =====================================================
       DATA-DRIVEN INITIALIZATION & SYNC
       ===================================================== */
    async function loadAchievementsData() {
        if (!window.BhashaAPI) {
            console.error("[Achievements] BhashaAPI client is not loaded.");
            if (errorBanner) {
                errorBanner.innerHTML = `
                    <div><strong>API Error:</strong> BhashaAPI client failed to initialize. Please reload the page.</div>
                    <button class="retry-btn" onclick="location.reload()">Retry</button>
                `;
                errorBanner.style.display = "flex";
            }
            return;
        }

        try {
            const data = await window.BhashaAPI.getAchievementsOverview();

            if (!data) {
                throw new Error("Received empty achievements payload from backend.");
            }

            // 1. Authentication Status & Banners
            if (!data.user_authenticated) {
                if (guestBanner) {
                    guestBanner.innerHTML = `
                        <div>🌱 <strong>Guest Mode:</strong> You are currently browsing as a guest. Sign in to record lesson completions and unlock honors!</div>
                        <a href="login.html" class="guest-banner-btn">Sign In / Register →</a>
                    `;
                    guestBanner.style.display = "flex";
                }
            } else {
                if (guestBanner) guestBanner.style.display = "none";
            }
            if (errorBanner) errorBanner.style.display = "none";

            // 2. Profile & Header Elements
            if (learnerName) learnerName.textContent = data.learner_name || "Scholar";
            if (topAvatar) topAvatar.textContent = data.learner_avatar || "S";
            if (learnerSubtitle) learnerSubtitle.textContent = `Level ${data.current_level} Scholar`;

            const streakVal = Number(data.streak_days) || 0;
            if (topStreak) topStreak.textContent = streakVal;
            if (sidebarStreak) sidebarStreak.textContent = `${streakVal} Day Streak`;

            const xpVal = Number(data.total_xp) || 0;
            if (topXp) topXp.textContent = `${xpVal.toLocaleString()} XP`;

            // 3. Level Card
            if (levelNum) levelNum.textContent = data.current_level || 1;
            if (levelXp) levelXp.textContent = `${xpVal.toLocaleString()} XP`;
            if (levelProgressBar) {
                levelProgressBar.style.width = `${Math.min(100, Math.max(0, data.level_progress_percent || 0))}%`;
            }
            if (levelXpSubtext) {
                levelXpSubtext.textContent = `${(data.xp_to_next_level || 0).toLocaleString()} XP to Level ${data.next_level || 2}`;
            }

            // 4. Stats Grid
            if (statLessonsCompleted) statLessonsCompleted.textContent = data.total_lessons_completed || 0;
            if (statLessonsTotal) statLessonsTotal.textContent = `of ${data.total_curriculum_lessons || 32} lessons total`;
            if (statCoursesCompleted) statCoursesCompleted.textContent = data.total_courses_completed || 0;
            if (statCoursesTotal) statCoursesTotal.textContent = `of ${data.total_curriculum_courses || 4} courses`;
            if (statTotalXp) statTotalXp.textContent = xpVal.toLocaleString();
            if (statLongestStreak) statLongestStreak.textContent = streakVal;

            // 5. Curriculum Mastery Cards
            renderCourseCards(data.tracks || []);

            // 6. Badges Grid
            if (badgeCount) {
                badgeCount.textContent = `${data.unlocked_badges_count || 0} / ${data.total_badges_count || 10} Unlocked`;
            }
            renderBadgeCards(data.badges || []);

            // 7. Wavy Road & Car Position
            userRealProgress = Math.min(100, Math.max(0, Math.round(data.overall_progress_percent || 0)));
            if (tierCategory) tierCategory.textContent = data.rank_tier || "STAGE 1 • FUNDAMENTALS & BASICS";
            if (tierTitle) tierTitle.textContent = `Overall Progress: ${userRealProgress}%`;

            if (btnMyProgress) {
                btnMyProgress.setAttribute("data-progress", userRealProgress);
                btnMyProgress.textContent = `🎯 My Progress (${userRealProgress}%)`;
            }

            // Initialize car on wavy road with real user progress
            setTimeout(() => {
                updateWavyRoad(userRealProgress);
            }, 60);

        } catch (err) {
            console.error("[Achievements] Failed to fetch data from backend:", err);

            // Display honest error banner - never fake data when API fails!
            if (errorBanner) {
                errorBanner.innerHTML = `
                    <div><strong>Server Connection Error:</strong> Unable to connect to Bhasha_AI backend service (${escapeHtml(err.message)}). Please check that the server is active.</div>
                    <button class="retry-btn" onclick="location.reload()">Retry Connection</button>
                `;
                errorBanner.style.display = "flex";
            }

            if (courseGrid) {
                courseGrid.innerHTML = `
                    <div class="achievements-loading" style="color: #c62828;">
                        <span>⚠ Curriculum mastery data is unavailable while the backend server is offline.</span>
                    </div>
                `;
            }

            if (badgeGrid) {
                badgeGrid.innerHTML = `
                    <div class="achievements-loading" style="color: #c62828;">
                        <span>⚠ Achievement honors cannot be verified while the backend server is offline.</span>
                    </div>
                `;
            }

            // Reset placeholders to clean empty states rather than fake data
            if (statLessonsCompleted) statLessonsCompleted.textContent = "—";
            if (statCoursesCompleted) statCoursesCompleted.textContent = "—";
            if (statTotalXp) statTotalXp.textContent = "—";
            if (statLongestStreak) statLongestStreak.textContent = "—";
            if (badgeCount) badgeCount.textContent = "Offline";
            if (tierTitle) tierTitle.textContent = "Status: Server Offline";
        }
    }

    loadAchievementsData();

});