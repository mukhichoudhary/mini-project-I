/* =========================================================
   BHASHA_AI - NATURAL DASHBOARD SCRIPT
   Interactive Progress Road System
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("sidebar");
    const menuButton = document.getElementById("menuButton");
    const logoutButton = document.getElementById("logoutButton");
    const continueLearning = document.getElementById("continueLearning");
    const sidebarContinue = document.getElementById("sidebarContinue");
    const startLesson = document.getElementById("startLesson");
    const notificationButton = document.getElementById("notificationButton");
    const searchInput = document.getElementById("searchInput");
    const learnerName = document.getElementById("learnerName");
    const topLearnerName = document.getElementById("topLearnerName");

    // Track Display
    const currentTrackName = document.getElementById("currentTrackName");
    const currentTrackIcon = document.getElementById("currentTrackIcon");
    let currentActiveTrack = null;

    const trackIcons = { Python: "🐍", Java: "☕", "C++": "⚙️", English: "🇬🇧" };

    const trackLessonTitles = {
        Python: [
            "Python Syntax, Indentation & Scope",
            "Data Types, Numbers & Casting",
            "Operators & String Slicing",
            "Conditionals & Pattern Matching",
            "Loops & Iterators",
            "Functions & Lambda Expressions",
            "Collections: Lists, Sets & Dicts",
            "OOP: Classes & Inheritance"
        ],
        Java: [
            "Java Syntax & JVM Entrypoint",
            "Variables, Data Types & Casting",
            "Operators & String Pool",
            "Decision Making & Switch",
            "Loops & Array Iteration",
            "Methods & Method Overloading",
            "Classes, Objects & 'this'",
            "OOP: Inheritance & Polymorphism"
        ],
        "C++": [
            "C++ Syntax, Streams & Namespaces",
            "Variables, Constants & auto",
            "Operators & Logical Expressions",
            "Conditions & Switch Logic",
            "Loops & Range-based For",
            "Functions & Pass-by-Reference",
            "Pointers & Memory Addresses",
            "Classes, Objects & Constructors"
        ],
        English: [
            "Basic Vocabulary & Syntax",
            "Greetings & Professional Introductions",
            "Numbers, Quantifiers & Data Metrics",
            "Everyday Conversations & Collocations",
            "Grammar Basics: Parts of Speech & Prepositions",
            "Sentence Building & Syntactic Connectors",
            "Tenses Mastery & Temporal Precision",
            "Technical Reading Comprehension & Synthesis"
        ]
    };

    let latestUser = null;
    let latestAllProgress = [];
    let latestCompletedProgress = [];

    async function initDashboardData() {
        let user = null;
        if (window.BhashaAPI) {
            try {
                user = await window.BhashaAPI.getProfile();
            } catch (e) {
                console.warn("[Dashboard] Backend profile sync failed, falling back to local storage:", e);
            }
        }
        latestUser = user;

        // 1. Resolve active subject from URL query param, localStorage, or user profile
        let subjectFromUrl = null;
        try {
            const params = new URLSearchParams(window.location.search);
            const rawParam = params.get("subject") || params.get("track") || params.get("lang");
            if (rawParam && window.BhashaAPI && window.BhashaAPI.normalizeSubject) {
                subjectFromUrl = window.BhashaAPI.normalizeSubject(rawParam, null);
            }
        } catch (_) {}

        let resolvedSubject = subjectFromUrl;
        if (!resolvedSubject && window.BhashaAPI && window.BhashaAPI.getSelectedSubject) {
            resolvedSubject = window.BhashaAPI.getSelectedSubject();
        }
        if (!resolvedSubject) {
            const rawStored = localStorage.getItem("bhasha_chosen_language");
            if (rawStored && window.BhashaAPI && window.BhashaAPI.normalizeSubject) {
                resolvedSubject = window.BhashaAPI.normalizeSubject(rawStored, null);
            }
        }
        if (!resolvedSubject && user && user.chosen_language) {
            if (window.BhashaAPI && window.BhashaAPI.normalizeSubject) {
                resolvedSubject = window.BhashaAPI.normalizeSubject(user.chosen_language, null);
            } else {
                resolvedSubject = user.chosen_language;
            }
        }

        // If no subject has been selected anywhere, use the app's existing subject-selection flow
        if (!resolvedSubject) {
            window.location.href = "index.html";
            return;
        }

        const lang = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(resolvedSubject, resolvedSubject)
            : resolvedSubject;
        currentActiveTrack = lang;

        // Synchronize active subject into localStorage and backend profile
        if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
            window.BhashaAPI.setSelectedSubject(lang, true);
        } else {
            localStorage.setItem("bhasha_chosen_language", lang);
        }

        const name = (user && user.full_name) || localStorage.getItem("bhasha_user_name") || "Scholar";
        const xp = (user && user.total_xp !== undefined) ? user.total_xp : parseInt(localStorage.getItem("bhasha_xp") || "0", 10);
        const streak = (user && user.streak_days !== undefined) ? user.streak_days : parseInt(localStorage.getItem("bhasha_streak") || "0", 10);
        const tier = (user && user.rank_tier) || "Stage 1 • Fundamentals";

        // Update Topbar Stats
        if (learnerName) learnerName.textContent = name;
        if (topLearnerName) topLearnerName.textContent = name;

        const topStreakDisplay = document.getElementById("topStreakDisplay");
        if (topStreakDisplay) topStreakDisplay.textContent = streak;

        const topXpDisplay = document.getElementById("topXpDisplay");
        if (topXpDisplay) topXpDisplay.textContent = xp.toLocaleString();

        const topAvatarDisplay = document.getElementById("topAvatarDisplay");
        if (topAvatarDisplay) topAvatarDisplay.textContent = (name || "S").charAt(0).toUpperCase();

        const topTierDisplay = document.getElementById("topTierDisplay");
        if (topTierDisplay) {
            const shortTier = tier.includes("•") ? tier.split("•")[1].trim() : tier;
            topTierDisplay.textContent = shortTier;
        }

        if (currentTrackName) {
            currentTrackName.textContent = `${lang} Learning Path`;
        }
        if (currentTrackIcon) {
            currentTrackIcon.textContent = trackIcons[lang] || "🌿";
        }

        // Wire Roadmap buttons with active subject
        const trackRoadmapBtn = document.getElementById("trackRoadmapBtn");
        if (trackRoadmapBtn) {
            trackRoadmapBtn.href = `roadmap.html?subject=${encodeURIComponent(lang)}`;
            trackRoadmapBtn.onclick = function (e) {
                e.preventDefault();
                if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
                    window.BhashaAPI.setSelectedSubject(lang, true);
                } else {
                    localStorage.setItem("bhasha_chosen_language", lang);
                }
                window.location.href = `roadmap.html?subject=${encodeURIComponent(lang)}`;
            };
        }

        const cardRoadmapBtn = document.getElementById("cardRoadmapBtn");
        if (cardRoadmapBtn) {
            cardRoadmapBtn.href = `roadmap.html?subject=${encodeURIComponent(lang)}`;
            cardRoadmapBtn.onclick = function (e) {
                e.preventDefault();
                if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
                    window.BhashaAPI.setSelectedSubject(lang, true);
                } else {
                    localStorage.setItem("bhasha_chosen_language", lang);
                }
                window.location.href = `roadmap.html?subject=${encodeURIComponent(lang)}`;
            };
        }

        // Synchronize all navigation links
        if (window.BhashaAPI && window.BhashaAPI.syncNavLinks) {
            window.BhashaAPI.syncNavLinks(lang);
        }

        // Fetch genuine user progress across all tracks
        let allProgress = [];
        if (window.BhashaAPI) {
            try {
                allProgress = await window.BhashaAPI.getLessonProgress();
            } catch (e) {
                console.warn("[Dashboard] Backend progress sync failed, falling back to local cache:", e);
            }
        }
        if (!allProgress || allProgress.length === 0) {
            if (window.BhashaAPI && window.BhashaAPI.getLocalProgress) {
                allProgress = window.BhashaAPI.getLocalProgress();
            }
        }
        latestAllProgress = allProgress || [];
        latestCompletedProgress = latestAllProgress.filter(p => Boolean(p.completed));

        // 1. Calculate overall curriculum progress across all 32 modules
        const totalCompletedAll = latestCompletedProgress.length;
        const calculatedOverallProgress = Math.min(100, Math.round((totalCompletedAll / 32) * 100));
        updateWavyRoad(calculatedOverallProgress);
        if (tierTitle) tierTitle.textContent = `Overall Progress: ${calculatedOverallProgress}%`;
        if (tierCategory) tierCategory.textContent = tier.toUpperCase();
        if (carProgressTag) carProgressTag.textContent = `${calculatedOverallProgress}%`;

        // 2. Up Next Lesson Card
        updateUpNextCard(lang, latestAllProgress);

        // 3. Sprout Streak Weekly Activity
        renderSproutStreak(streak, latestAllProgress);

        // 4. Milestone Badges Preview from real badge API
        renderDashboardBadges();

        // 5. Mini Leaderboard Preview from real leaderboard API
        const curId = (user && (user.user_id || user.id)) || localStorage.getItem("bhasha_user_id");
        renderMiniLeaderboard(curId, name);

        // 6. Next Learning Milestone calculated from track progress
        const trackCompleted = latestCompletedProgress.filter(p => {
            const pSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject) ? window.BhashaAPI.normalizeSubject(p.subject) : p.subject;
            return pSub.toLowerCase() === lang.toLowerCase();
        }).length;
        renderNextMilestone(lang, trackCompleted);

        // 7. AI Assessment Snapshot Strip
        renderAssessmentStrip(user, latestCompletedProgress, lang);

        // 8. English Speaking Assessment Visibility & Session Gating
        if (typeof handleSpeakingSectionVisibility === "function") {
            handleSpeakingSectionVisibility(lang);
        }
    }

    function renderSproutStreak(streak, allProgress) {
        const sproutStreakDays = document.getElementById("sproutStreakDays");
        const sproutWeekDays = document.getElementById("sproutWeekDays");
        const sproutStreakProgress = document.getElementById("sproutStreakProgress");
        const sproutStreakText = document.getElementById("sproutStreakText");

        // Determine days of current week (Monday=0 to Sunday=6) with real activity
        const now = new Date();
        const currentDayOfWeek = (now.getDay() + 6) % 7; // Mon=0, Sun=6
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const activeDays = new Set();
        (allProgress || []).forEach(p => {
            if (p.completed && p.updated_at) {
                const pDate = new Date(p.updated_at);
                if (pDate >= startOfWeek) {
                    const dayIdx = (pDate.getDay() + 6) % 7;
                    activeDays.add(dayIdx);
                }
            }
        });

        // Mark active streak days up to today
        if (streak > 0) {
            for (let i = 0; i < Math.min(streak, currentDayOfWeek + 1); i++) {
                activeDays.add(currentDayOfWeek - i);
            }
        }

        const daysCount = activeDays.size;
        if (sproutStreakDays) {
            sproutStreakDays.textContent = `${daysCount}/7 Days`;
        }
        if (sproutStreakProgress) {
            const pct = Math.min(100, Math.round((daysCount / 7) * 100));
            sproutStreakProgress.style.width = `${pct}%`;
        }
        if (sproutStreakText) {
            if (daysCount === 0) {
                sproutStreakText.textContent = "Complete your first lesson today to start your weekly streak!";
            } else if (activeDays.has(currentDayOfWeek)) {
                sproutStreakText.textContent = `Great discipline! You have practiced ${daysCount} day${daysCount > 1 ? "s" : ""} this week.`;
            } else {
                sproutStreakText.textContent = "Practice today to nurture your streak and advance to the next milestone!";
            }
        }

        if (sproutWeekDays) {
            const labels = ["M", "T", "W", "T", "F", "S", "S"];
            sproutWeekDays.innerHTML = labels.map((lbl, idx) => {
                const isCompleted = activeDays.has(idx);
                const isToday = idx === currentDayOfWeek;
                let dayClass = "day";
                if (isCompleted) dayClass += " completed";
                else if (isToday) dayClass += " today";

                const icon = isCompleted ? "✓" : "•";
                return `<div class="${dayClass}"><span>${lbl}</span><b>${icon}</b></div>`;
            }).join("");
        }
    }

    async function renderDashboardBadges() {
        const container = document.getElementById("dashboardBadgesContainer");
        if (!container) return;

        let data = null;
        if (window.BhashaAPI && window.BhashaAPI.getBadges) {
            try {
                data = await window.BhashaAPI.getBadges();
            } catch (e) {
                console.warn("[Dashboard] Could not fetch badges from backend:", e);
            }
        }

        const badgeList = Array.isArray(data) ? data : (data && Array.isArray(data.badges) ? data.badges : []);

        if (badgeList.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; padding: 18px; text-align: center; color: #94a3b8; font-size: 0.88rem;">
                    <span style="font-size: 1.6rem; display: block; margin-bottom: 4px;">🌱</span>
                    No badges unlocked yet. Complete your first lesson, quiz, or project to earn honors!
                </div>
            `;
            return;
        }

        container.innerHTML = badgeList.map(b => {
            const isUnlocked = Boolean(b.unlocked);
            const pct = isUnlocked ? 100 : (Number(b.progress_percentage) || Number(b.progress_pct) || 0);
            const icon = isUnlocked ? (b.icon || "🏆") : "🔒";
            const lockedClass = isUnlocked ? "" : "locked";
            return `
                <div class="badge ${lockedClass}">
                    <div class="badge-icon">${icon}</div>
                    <div>
                        <strong>${escapeHtml(b.title)}</strong>
                        <div class="mini-bar">
                            <div style="width: ${pct}%;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    async function renderMiniLeaderboard(currentUserId, currentUserName) {
        const container = document.getElementById("miniLeaderboardContainer");
        const topRankDisplay = document.getElementById("topRankDisplay");
        if (!container) return;

        let leaderboard = [];
        if (window.BhashaAPI && window.BhashaAPI.getLeaderboard) {
            try {
                leaderboard = await window.BhashaAPI.getLeaderboard();
            } catch (e) {
                console.warn("[Dashboard] Could not fetch leaderboard:", e);
            }
        }

        if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
            container.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 0.88rem;">
                    Start practicing to take your place on the student leaderboard!
                </div>
            `;
            if (topRankDisplay) topRankDisplay.textContent = "#1";
            return;
        }

        const userEntry = leaderboard.find(e => e.is_current_user || (currentUserName && e.name.toLowerCase() === currentUserName.toLowerCase()));
        if (userEntry && topRankDisplay) {
            topRankDisplay.textContent = `#${userEntry.rank}`;
        }

        // Show top 3 or top 2 + current user if outside top 3
        const top3 = leaderboard.slice(0, 3);
        const inTop3 = top3.some(e => e.is_current_user || (currentUserName && e.name.toLowerCase() === currentUserName.toLowerCase()));
        let displayList = top3;
        if (!inTop3 && userEntry && leaderboard.length > 2) {
            displayList = [leaderboard[0], leaderboard[1], userEntry];
        }

        container.innerHTML = displayList.map(item => {
            const isCur = Boolean(item.is_current_user || (currentUserName && item.name.toLowerCase() === currentUserName.toLowerCase()));
            const rankClass = item.rank === 1 ? "gold" : item.rank === 2 ? "silver" : isCur ? "current-user" : "bronze";
            const avatarLetter = (item.name || "S").charAt(0).toUpperCase();
            const displayName = isCur ? `You (${escapeHtml(item.name)})` : escapeHtml(item.name);
            return `
                <div class="mini-rank-row ${rankClass}">
                    <span class="rank-pos">${item.rank}</span>
                    <div class="rank-avatar">${avatarLetter}</div>
                    <div class="rank-details">
                        <strong>${displayName}</strong>
                        <small>${escapeHtml(item.track || "Python")} • ${(item.xp || 0).toLocaleString()} XP</small>
                    </div>
                    <span class="rank-streak">🔥 ${item.streak || 0}</span>
                </div>
            `;
        }).join("");
    }

    function renderNextMilestone(track, trackCompleted) {
        const milestoneTitle = document.getElementById("milestoneTitle");
        const milestoneDesc = document.getElementById("milestoneDesc");
        const milestoneProgressBar = document.getElementById("milestoneProgressBar");
        const milestoneCount = document.getElementById("milestoneCount");

        let title = "Stage 1: Core Fundamentals";
        let desc = `Complete modules in ${track} to unlock advanced concepts!`;
        let targetPct = 0;
        let countText = "0% Target";

        if (trackCompleted < 2) {
            title = "Stage 1: Core Fundamentals";
            targetPct = Math.round((trackCompleted / 2) * 100);
            desc = `Complete ${2 - trackCompleted} more module(s) in ${track} to unlock Stage 2: Core Architecture!`;
            countText = `${trackCompleted} / 2 Modules (${targetPct}%)`;
        } else if (trackCompleted < 4) {
            title = "Stage 2: Core Architecture";
            targetPct = Math.round(((trackCompleted - 2) / 2) * 100);
            desc = `Complete ${4 - trackCompleted} more module(s) to unlock Stage 3: Advanced Algorithms!`;
            countText = `${trackCompleted} / 4 Modules (${targetPct}%)`;
        } else if (trackCompleted < 6) {
            title = "Stage 3: Advanced Algorithms";
            targetPct = Math.round(((trackCompleted - 4) / 2) * 100);
            desc = `Complete ${6 - trackCompleted} more module(s) to unlock Stage 4: Curriculum Mastery!`;
            countText = `${trackCompleted} / 6 Modules (${targetPct}%)`;
        } else if (trackCompleted < 8) {
            title = "Stage 4: Curriculum Mastery";
            targetPct = Math.round(((trackCompleted - 6) / 2) * 100);
            desc = `Complete ${8 - trackCompleted} more module(s) to achieve full Curriculum Mastery!`;
            countText = `${trackCompleted} / 8 Modules (${targetPct}%)`;
        } else {
            title = "Stage 4: Curriculum Mastered";
            targetPct = 100;
            desc = `All 8 modules completed in ${track}. You have achieved full curriculum mastery!`;
            countText = "8 / 8 Modules (100%)";
        }

        if (milestoneTitle) milestoneTitle.textContent = title;
        if (milestoneDesc) milestoneDesc.textContent = desc;
        if (milestoneProgressBar) milestoneProgressBar.style.width = `${targetPct}%`;
        if (milestoneCount) milestoneCount.textContent = countText;
    }

    function renderAssessmentStrip(user, completedProgress, normLang) {
        const assessmentSnapshotStrip = document.getElementById("assessmentSnapshotStrip");
        const assessmentEmptyState = document.getElementById("assessmentEmptyState");
        const snapOverallScore = document.getElementById("snapOverallScore");
        const snapProficiencyLevel = document.getElementById("snapProficiencyLevel");
        const snapTrackLabel = document.getElementById("snapTrackLabel");
        const snapGrammarScore = document.getElementById("snapGrammarScore");
        const snapGrammarBar = document.getElementById("snapGrammarBar");
        const snapVocabScore = document.getElementById("snapVocabScore");
        const snapVocabBar = document.getElementById("snapVocabBar");
        const snapWritingScore = document.getElementById("snapWritingScore");
        const snapWritingBar = document.getElementById("snapWritingBar");
        const snapReadingScore = document.getElementById("snapReadingScore");
        const snapReadingBar = document.getElementById("snapReadingBar");
        const mentorResultsWrapper = document.getElementById("mentorResultsWrapper");
        const generateBtnText = document.getElementById("generateBtnText");

        const skillMeterLabel1 = document.getElementById("skillMeterLabel1");
        const skillMeterLabel2 = document.getElementById("skillMeterLabel2");
        const skillMeterLabel3 = document.getElementById("skillMeterLabel3");
        const skillMeterLabel4 = document.getElementById("skillMeterLabel4");

        const targetLang = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(normLang, normLang)
            : (normLang || "Python");
        const isEnglishTrack = ["english", "technical english", "tech english", "technical-english", "technical_english"].includes(targetLang.toLowerCase());

        // Dynamically update category labels based on active subject domain
        if (isEnglishTrack) {
            if (skillMeterLabel1) skillMeterLabel1.textContent = "Grammar";
            if (skillMeterLabel2) skillMeterLabel2.textContent = "Vocabulary";
            if (skillMeterLabel3) skillMeterLabel3.textContent = "Writing and Logic";
            if (skillMeterLabel4) skillMeterLabel4.textContent = "Reading and Comprehension";
        } else {
            if (skillMeterLabel1) skillMeterLabel1.textContent = "Programming Syntax";
            if (skillMeterLabel2) skillMeterLabel2.textContent = "Programming Concepts";
            if (skillMeterLabel3) skillMeterLabel3.textContent = "Programming Logic";
            if (skillMeterLabel4) skillMeterLabel4.textContent = "Code Tracing & Output";
        }

        // Strictly isolate progress to the target subject
        const subjectCompleted = (completedProgress || []).filter(p => {
            const pSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                ? window.BhashaAPI.normalizeSubject(p.subject, p.subject)
                : p.subject;
            const isSubEng = ["english", "technical english", "tech english", "technical-english", "technical_english"].includes((pSub || "").toLowerCase());
            if (isEnglishTrack) {
                return isSubEng && Boolean(p.completed);
            }
            return pSub && pSub.toLowerCase() === targetLang.toLowerCase() && Boolean(p.completed);
        });

        if (subjectCompleted.length === 0) {
            if (assessmentSnapshotStrip) assessmentSnapshotStrip.style.display = "none";
            if (assessmentEmptyState) {
                assessmentEmptyState.style.display = "block";
                const emptyDesc = assessmentEmptyState.querySelector("p");
                if (emptyDesc) {
                    emptyDesc.textContent = isEnglishTrack
                        ? "Complete your first English curriculum quiz or communication activity to generate your grammar and vocabulary diagnostics and unlock AI mentor advice."
                        : `Complete your first ${targetLang} curriculum quiz or coding lesson to generate your programming syntax, concepts, and logic diagnostics.`;
                }
            }
            if (mentorResultsWrapper) mentorResultsWrapper.style.display = "none";
            return;
        }

        if (assessmentSnapshotStrip) assessmentSnapshotStrip.style.display = "flex";
        if (assessmentEmptyState) assessmentEmptyState.style.display = "none";

        const totalScore = subjectCompleted.reduce((sum, p) => sum + (Number(p.score) || 0), 0);
        const totalQ = subjectCompleted.reduce((sum, p) => sum + (Number(p.total_questions) || 5), 0);
        const overallAccuracy = Math.round((totalScore / Math.max(1, totalQ)) * 100);

        if (snapOverallScore) snapOverallScore.textContent = `${overallAccuracy}%`;
        const level = overallAccuracy >= 80 ? "Advanced" : overallAccuracy >= 50 ? "Intermediate" : "Novice";
        if (snapProficiencyLevel) snapProficiencyLevel.textContent = level;
        if (snapTrackLabel) snapTrackLabel.textContent = isEnglishTrack ? "Track: English Communication" : `Track: ${targetLang} Masterclass`;

        let meter1Acc, meter2Acc, meter3Acc, meter4Acc;
        if (isEnglishTrack) {
            // English skill diagnostics: Grammar, Vocabulary, Writing & Logic, Reading & Comprehension
            meter1Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 0.95)));
            meter2Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 1.05)));
            meter3Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 0.90)));
            meter4Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 1.02)));
        } else {
            // Programming skill diagnostics: Syntax, Concepts, Logic, Code Tracing & Output
            meter1Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 0.96)));
            meter2Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 1.02)));
            meter3Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 0.92)));
            meter4Acc = Math.min(100, Math.max(10, Math.round(overallAccuracy * 0.98)));
        }

        if (snapGrammarScore) snapGrammarScore.textContent = `${meter1Acc}%`;
        if (snapGrammarBar) snapGrammarBar.style.width = `${meter1Acc}%`;

        if (snapVocabScore) snapVocabScore.textContent = `${meter2Acc}%`;
        if (snapVocabBar) snapVocabBar.style.width = `${meter2Acc}%`;

        if (snapWritingScore) snapWritingScore.textContent = `${meter3Acc}%`;
        if (snapWritingBar) snapWritingBar.style.width = `${meter3Acc}%`;

        if (snapReadingScore) snapReadingScore.textContent = `${meter4Acc}%`;
        if (snapReadingBar) snapReadingBar.style.width = `${meter4Acc}%`;

        // Restore cached AI feedback for the active subject if available
        const cacheKey = `bhasha_ai_mentor_assessment_cache_${targetLang.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                renderAIMentorFeedback(JSON.parse(cached));
                if (generateBtnText) generateBtnText.textContent = "Re-analyze Assessment";
            } catch (_) {}
        } else if (mentorResultsWrapper) {
            mentorResultsWrapper.style.display = "none";
            if (generateBtnText) generateBtnText.textContent = "Analyze Diagnostics";
        }
    }

    async function updateUpNextCard(track, allProgress) {
        const normTrack = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(track)
            : track;

        let nextNum = 1;
        let isAllCompleted = false;

        if (window.BhashaAPI && window.BhashaAPI.getNextLessonForSubject) {
            const nextInfo = window.BhashaAPI.getNextLessonForSubject(normTrack, allProgress);
            nextNum = nextInfo.lessonNumber;
            isAllCompleted = nextInfo.isAllCompleted;
        } else {
            const completedSet = new Set(
                (allProgress || [])
                    .filter(p => {
                        const pSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject) ? window.BhashaAPI.normalizeSubject(p.subject) : p.subject;
                        return pSub.toLowerCase() === normTrack.toLowerCase() && Boolean(p.completed);
                    })
                    .map(p => Number(p.lesson_number))
            );
            for (let i = 1; i <= 8; i++) {
                if (!completedSet.has(i)) {
                    nextNum = i;
                    break;
                }
            }
            if (completedSet.size >= 8) {
                nextNum = 8;
                isAllCompleted = true;
            }
        }

        const titles = trackLessonTitles[normTrack] || trackLessonTitles.Python;
        const nextTitle = titles[nextNum - 1] || `Module ${nextNum} Curriculum`;

        const upNextTrackLabel = document.getElementById("upNextTrackLabel");
        if (upNextTrackLabel) upNextTrackLabel.textContent = `UP NEXT IN ${normTrack.toUpperCase()}`;

        const upNextTitle = document.getElementById("upNextTitle");
        if (upNextTitle) upNextTitle.textContent = nextTitle;

        const upNextSubtitle = document.getElementById("upNextSubtitle");
        if (upNextSubtitle) {
            if (isAllCompleted) {
                upNextSubtitle.textContent = `All 8 modules completed in ${normTrack}! Review anytime.`;
            } else {
                upNextSubtitle.textContent = `Master reusable ${normTrack} functions, parameters, and algorithms.`;
            }
        }

        const upNextDetails = document.getElementById("upNextDetails");
        if (upNextDetails) {
            upNextDetails.innerHTML = `<span>Module ${nextNum}</span><span>•</span><span>5 min</span><span>•</span><span>+50 XP</span>`;
        }

        const btn = document.getElementById("startLesson");
        if (btn) {
            btn.textContent = isAllCompleted ? `Review Module ${nextNum} →` : `Commence Module ${nextNum} →`;
        }
    }

    /* =====================================================
       WAVY ROAD & DIRECT CAR PHOTO LOGIC
       ===================================================== */
    const wavyRoadPath = document.getElementById("wavyRoadPath");
    const wavyRoadProgressFill = document.getElementById("wavyRoadProgressFill");
    const wavyCarAnchor = document.getElementById("wavyCarAnchor");
    const wavyCarRotator = document.getElementById("wavyCarRotator");
    const carPhotoImg = document.getElementById("carPhotoImg");
    const carProgressTag = document.getElementById("carProgressTag");
    const tierTitle = document.getElementById("tierTitle");
    const tierCategory = document.getElementById("tierCategory");
    const tierButtons = document.querySelectorAll(".tier-btn");

    const carPhotos = {
        stage1: "assets/cars/car_stage1.png",
        stage2: "assets/cars/car_stage2.png",
        stage3: "assets/cars/car_stage3.png",
        stage4: "assets/cars/car_stage4.png"
    };

    function updateWavyRoad(progressPercent) {
        const p = Math.max(0, Math.min(100, progressPercent));

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
            const targetP = parseInt(btn.getAttribute("data-progress"), 10) || 47;
            updateWavyRoad(targetP);
        });
    });

    // Initial state
    initDashboardData();

    /* =====================================================
       NAVIGATION & ACTIONS
       ===================================================== */
    async function goToLesson() {
        const activeTrack = currentActiveTrack ||
            ((window.BhashaAPI && window.BhashaAPI.getSelectedSubject) ? window.BhashaAPI.getSelectedSubject() : null) ||
            localStorage.getItem("bhasha_chosen_language") || "Python";

        const normTrack = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(activeTrack)
            : activeTrack;

        let lessonNumber = 1;
        if (window.BhashaAPI && window.BhashaAPI.getNextLessonForSubject) {
            const nextInfo = window.BhashaAPI.getNextLessonForSubject(normTrack, latestAllProgress);
            lessonNumber = nextInfo.lessonNumber;
        } else {
            let progress = latestAllProgress || [];
            if ((!Array.isArray(progress) || progress.length === 0) && window.BhashaAPI && window.BhashaAPI.getLocalProgress) {
                progress = window.BhashaAPI.getLocalProgress(normTrack);
            }
            if (Array.isArray(progress) && progress.length > 0) {
                const completedSet = new Set(
                    progress
                        .filter(item => {
                            const pSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject) ? window.BhashaAPI.normalizeSubject(item.subject) : item.subject;
                            return pSub && pSub.toLowerCase() === normTrack.toLowerCase() && Boolean(item.completed);
                        })
                        .map(item => Number(item.lesson_number))
                );
                for (let i = 1; i <= 8; i++) {
                    if (!completedSet.has(i)) {
                        lessonNumber = i;
                        break;
                    }
                }
                if (completedSet.size >= 8) lessonNumber = 8;
            }
        }

        window.location.href = `lesson.html?subject=${encodeURIComponent(normTrack)}&lesson=${lessonNumber}`;
    }

    if (continueLearning) continueLearning.addEventListener("click", goToLesson);
    if (sidebarContinue) sidebarContinue.addEventListener("click", goToLesson);
    if (startLesson) startLesson.addEventListener("click", goToLesson);

    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */
    if (menuButton && sidebar) {
        menuButton.addEventListener("click", function (e) {
            e.stopPropagation();
            sidebar.classList.toggle("open");
        });
    }

    document.addEventListener("click", function (event) {
        if (window.innerWidth <= 780 && sidebar && sidebar.classList.contains("open")) {
            if (!sidebar.contains(event.target) && event.target !== menuButton) {
                sidebar.classList.remove("open");
            }
        }
    });

    /* =====================================================
       LOGOUT
       ===================================================== */
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            const confirmed = confirm("Are you sure you wish to sign out?");
            if (confirmed) {
                if (window.BhashaAPI) {
                    window.BhashaAPI.logout();
                } else {
                    localStorage.removeItem("bhasha_logged_in");
                }
                window.location.href = "login.html";
            }
        });
    }

    /* =====================================================
       SEARCH
       ===================================================== */
    if (searchInput) {
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                const term = searchInput.value.trim();
                if (term) {
                    const active = currentActiveTrack || ((window.BhashaAPI && window.BhashaAPI.getSelectedSubject) ? window.BhashaAPI.getSelectedSubject() : "Python");
                    window.location.href = `roadmap.html?q=${encodeURIComponent(term)}&subject=${encodeURIComponent(active)}`;
                }
            }
        });
    }

    if (notificationButton) {
        notificationButton.addEventListener("click", function () {
            alert("Forest Academy Reminder: Your daily streak is active. Keep up the great work!");
        });
    }

    /* =====================================================
       AI MENTOR ASSESSMENT & GUIDANCE INTEGRATION
       ===================================================== */
    const generateAIFeedbackBtn = document.getElementById("generateAIFeedbackBtn");
    const generateBtnText = document.getElementById("generateBtnText");
    const mentorLoadingState = document.getElementById("mentorLoadingState");
    const mentorResultsWrapper = document.getElementById("mentorResultsWrapper");
    const mentorOverallFeedback = document.getElementById("mentorOverallFeedback");
    const mentorStrengthsList = document.getElementById("mentorStrengthsList");
    const mentorWeakAreasList = document.getElementById("mentorWeakAreasList");
    const mentorLearningPlanList = document.getElementById("mentorLearningPlanList");
    const mentorRecommendationsList = document.getElementById("mentorRecommendationsList");
    const mentorMotivationalMessage = document.getElementById("mentorMotivationalMessage");
    const snapTrackLabel = document.getElementById("snapTrackLabel");

    function escapeHtml(text) {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function renderAIMentorFeedback(data) {
        if (!data || !mentorResultsWrapper) return;

        if (mentorOverallFeedback) mentorOverallFeedback.textContent = data.overallFeedback || "";

        if (mentorStrengthsList) {
            mentorStrengthsList.innerHTML = (data.strengths || []).map(s => 
                `<span class="pill-tag strength-pill">✓ ${escapeHtml(s)}</span>`
            ).join("");
        }

        if (mentorWeakAreasList) {
            mentorWeakAreasList.innerHTML = (data.weakAreas || []).map(w => 
                `<span class="pill-tag weakness-pill">⚠ ${escapeHtml(w)}</span>`
            ).join("");
        }

        if (mentorLearningPlanList) {
            mentorLearningPlanList.innerHTML = (data.learningPlan || []).map(item => {
                const priorityClass = `priority-${(item.priority || "Medium").toLowerCase()}`;
                return `
                    <div class="plan-card-item">
                        <div class="plan-top-row">
                            <span class="plan-topic-title">${escapeHtml(item.topic)}</span>
                            <span class="priority-tag ${priorityClass}">${escapeHtml(item.priority || "Medium")}</span>
                        </div>
                        <p class="plan-reason">${escapeHtml(item.reason)}</p>
                        <div class="plan-activity">
                            <strong>Recommended Practice:</strong>
                            ${escapeHtml(item.activity)}
                        </div>
                    </div>
                `;
            }).join("");
        }

        if (mentorRecommendationsList) {
            mentorRecommendationsList.innerHTML = (data.recommendations || []).map(r => 
                `<li>${escapeHtml(r)}</li>`
            ).join("");
        }

        if (mentorMotivationalMessage) {
            mentorMotivationalMessage.textContent = data.motivationalMessage || "";
        }

        mentorResultsWrapper.style.display = "flex";
    }

    if (generateAIFeedbackBtn) {
        generateAIFeedbackBtn.addEventListener("click", async function () {
            const chosenLang = currentActiveTrack || ((window.BhashaAPI && window.BhashaAPI.getSelectedSubject) ? window.BhashaAPI.getSelectedSubject() : "Python");
            const normLang = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                ? window.BhashaAPI.normalizeSubject(chosenLang, chosenLang)
                : chosenLang;
            const isEnglishTrack = ["english", "technical english", "tech english", "technical-english", "technical_english"].includes(normLang.toLowerCase());

            // Filter completed progress strictly for the active subject
            const subjectCompleted = (latestCompletedProgress || []).filter(p => {
                const pSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                    ? window.BhashaAPI.normalizeSubject(p.subject, p.subject)
                    : p.subject;
                const isSubEng = ["english", "technical english", "tech english", "technical-english", "technical_english"].includes((pSub || "").toLowerCase());
                if (isEnglishTrack) {
                    return isSubEng && Boolean(p.completed);
                }
                return pSub && pSub.toLowerCase() === normLang.toLowerCase() && Boolean(p.completed);
            });

            if (subjectCompleted.length === 0) {
                alert(`No completed quizzes found for ${normLang} yet. Please complete at least one ${normLang} lesson or quiz before generating diagnostic feedback.`);
                return;
            }

            generateAIFeedbackBtn.disabled = true;
            if (generateBtnText) generateBtnText.textContent = "Analyzing Diagnostics...";
            if (mentorLoadingState) mentorLoadingState.style.display = "flex";
            if (mentorResultsWrapper) mentorResultsWrapper.style.display = "none";

            const studentName = (latestUser && latestUser.full_name) || localStorage.getItem("bhasha_user_name") || "Scholar";
            const studentId = (latestUser && (latestUser.user_id || latestUser.id)) || localStorage.getItem("bhasha_user_id") || "1";

            if (snapTrackLabel) snapTrackLabel.textContent = isEnglishTrack ? "Track: English Communication" : `Track: ${normLang} Masterclass`;

            const totalScore = subjectCompleted.reduce((sum, p) => sum + (Number(p.score) || 0), 0);
            const totalQ = subjectCompleted.reduce((sum, p) => sum + (Number(p.total_questions) || 5), 0);
            const overallAccuracy = Math.round((totalScore / Math.max(1, totalQ)) * 100);
            const profLevel = overallAccuracy >= 80 ? "Advanced" : overallAccuracy >= 50 ? "Intermediate" : "Novice";

            let latestSpeaking = null;
            if (isEnglishTrack && window.BhashaAPI && window.BhashaAPI.getLatestSpeakingAssessment) {
                try {
                    latestSpeaking = await window.BhashaAPI.getLatestSpeakingAssessment();
                } catch (_) {}
            }

            // Strictly bifurcate payload by subject domain
            let assessmentPayload;
            if (isEnglishTrack) {
                assessmentPayload = {
                    subject: normLang,
                    studentId: String(studentId),
                    studentName: studentName,
                    overallScore: overallAccuracy,
                    proficiencyLevel: profLevel,
                    // Linguistic metrics strictly for English track only
                    grammarScore: Math.min(100, Math.round(overallAccuracy * 0.95)),
                    vocabularyScore: Math.min(100, Math.round(overallAccuracy * 1.05)),
                    writingScore: Math.min(100, Math.round(overallAccuracy * 0.90)),
                    readingScore: Math.min(100, Math.round(overallAccuracy * 1.02)),
                    pronunciationScore: null,
                    semanticSimilarityScore: (latestSpeaking && latestSpeaking.transcription_accuracy) ? latestSpeaking.transcription_accuracy : null,
                    strengths: ["Grammar Structure", "Vocabulary Knowledge", "Reading Comprehension"],
                    weakAreas: overallAccuracy < 80 ? ["Grammar Consistency", "Lexical Precision"] : ["Complex Syntactic Structures"],
                    // Programming metrics explicitly omitted
                    programmingLanguage: null,
                    programmingScore: null,
                    syntaxScore: null,
                    conceptsScore: null,
                    logicScore: null,
                    codeTracingScore: null,
                    programmingWeakAreas: []
                };
            } else {
                // Software engineering metrics strictly for programming tracks (Python, Java, C++)
                const syntaxScore = Math.min(100, Math.round(overallAccuracy * 0.96));
                const conceptsScore = Math.min(100, Math.round(overallAccuracy * 1.02));
                const logicScore = Math.min(100, Math.round(overallAccuracy * 0.92));
                const codeTracingScore = Math.min(100, Math.round(overallAccuracy * 0.98));

                assessmentPayload = {
                    subject: normLang,
                    studentId: String(studentId),
                    studentName: studentName,
                    overallScore: overallAccuracy,
                    proficiencyLevel: profLevel,
                    // English linguistic metrics explicitly omitted
                    grammarScore: null,
                    vocabularyScore: null,
                    writingScore: null,
                    readingScore: null,
                    pronunciationScore: null,
                    semanticSimilarityScore: null,
                    strengths: overallAccuracy >= 60 ? [`${normLang} Syntax`, `${normLang} Programming Logic`] : [`${normLang} Core Concepts`],
                    weakAreas: overallAccuracy < 80 ? [`${normLang} Control Flow`, `${normLang} Data Structures`] : [`${normLang} Algorithmic Optimization`],
                    // Programming metrics strictly populated
                    programmingLanguage: normLang,
                    programmingScore: overallAccuracy,
                    syntaxScore: syntaxScore,
                    conceptsScore: conceptsScore,
                    logicScore: logicScore,
                    codeTracingScore: codeTracingScore,
                    programmingWeakAreas: overallAccuracy < 80 ? [`${normLang} Loops & Conditions`, `${normLang} Edge Cases`] : [`${normLang} Time Complexity`]
                };
            }

            try {
                let result = null;
                if (window.BhashaAPI && window.BhashaAPI.getAIMentorFeedback) {
                    result = await window.BhashaAPI.getAIMentorFeedback(assessmentPayload);
                }

                if (!result) {
                    throw new Error("Empty response from AI Mentor");
                }

                const cacheKey = `bhasha_ai_mentor_assessment_cache_${normLang.toLowerCase()}`;
                localStorage.setItem(cacheKey, JSON.stringify(result));
                renderAIMentorFeedback(result);
            } catch (err) {
                console.error("AI Mentor assessment generation failed:", err);
                alert("AI Mentor evaluation could not be completed. Please check your network and backend status.");
            } finally {
                generateAIFeedbackBtn.disabled = false;
                if (generateBtnText) generateBtnText.textContent = "Re-analyze Assessment";
                if (mentorLoadingState) mentorLoadingState.style.display = "none";
            }
        });
    }

    /* =========================================================
       SPOKEN ENGLISH & SPEECH RECOGNITION ASSESSMENT CONTROLLER
       Priority 1: Live STT, Word Error Rate, Speaking Pace,
       Authentic Phonetic Status Disclaimer, Secure Persistence
       ========================================================= */
    const speakingSection = document.getElementById("speakingSection");
    const speechSupportTag = document.getElementById("speechSupportTag");
    const btnToggleSpeakingHistory = document.getElementById("btnToggleSpeakingHistory");
    const speakingAttemptsCount = document.getElementById("speakingAttemptsCount");
    const speakingPromptSelect = document.getElementById("speakingPromptSelect");
    const btnShufflePrompt = document.getElementById("btnShufflePrompt");
    const speakingDifficultyPills = document.querySelectorAll("#speakingDifficultyPills .speaking-filter-pill");
    const speakingTaskPills = document.querySelectorAll("#speakingTaskPills .speaking-filter-pill");
    const promptDifficultyBadge = document.getElementById("promptDifficultyBadge");
    const promptTaskTypeBadge = document.getElementById("promptTaskTypeBadge");
    const promptPaceBadge = document.getElementById("promptPaceBadge");
    const promptGuidanceText = document.getElementById("promptGuidanceText");

    const customPromptRow = document.getElementById("customPromptRow");
    const customPromptInput = document.getElementById("customPromptInput");
    const targetSentenceDisplay = document.getElementById("targetSentenceDisplay");
    const btnListenTarget = document.getElementById("btnListenTarget");

    const micIdleState = document.getElementById("micIdleState");
    const btnStartRecording = document.getElementById("btnStartRecording");
    const micActiveState = document.getElementById("micActiveState");
    const recordingTimer = document.getElementById("recordingTimer");
    const liveTranscriptText = document.getElementById("liveTranscriptText");
    const btnStopRecording = document.getElementById("btnStopRecording");
    const btnCancelRecording = document.getElementById("btnCancelRecording");

    const speakingAlertBox = document.getElementById("speakingAlertBox");
    const speakingAlertTitle = document.getElementById("speakingAlertTitle");
    const speakingAlertMessage = document.getElementById("speakingAlertMessage");
    const btnDismissSpeakingAlert = document.getElementById("btnDismissSpeakingAlert");

    const speakingResultsPanel = document.getElementById("speakingResultsPanel");
    const resAccuracyNum = document.getElementById("resAccuracyNum");
    const resAccuracyGrade = document.getElementById("resAccuracyGrade");
    const resAccuracyBar = document.getElementById("resAccuracyBar");
    const resWpmNum = document.getElementById("resWpmNum");
    const resWpmGrade = document.getElementById("resWpmGrade");
    const resDurationDetail = document.getElementById("resDurationDetail");
    const resWordDiffChips = document.getElementById("resWordDiffChips");
    const resSpokenVerbatim = document.getElementById("resSpokenVerbatim");
    const btnTryAgain = document.getElementById("btnTryAgain");

    const speakingHistoryDrawer = document.getElementById("speakingHistoryDrawer");
    const btnCloseHistoryDrawer = document.getElementById("btnCloseHistoryDrawer");
    const speakingHistoryList = document.getElementById("speakingHistoryList");
    const histStatAttempts = document.getElementById("histStatAttempts");
    const histStatAccuracy = document.getElementById("histStatAccuracy");
    const histStatPace = document.getElementById("histStatPace");
    const histStatTrend = document.getElementById("histStatTrend");

    let speechRecognitionInstance = null;
    let isRecordingActive = false;
    let isEvaluating = false;
    let recordStartTime = 0;
    let recordTimerInterval = null;
    let accumulatedTranscript = "";
    let interimTranscript = "";
    let lastRecognitionError = null;

    let loadedPrompts = [];
    let currentDifficultyFilter = "all";
    let currentTaskFilter = "all";
    let currentSelectedPrompt = null;

    function handleSpeakingSectionVisibility(currentLang) {
        const isEnglish = String(currentLang || "").toLowerCase() === "english";
        if (!speakingSection) return;

        if (isEnglish) {
            speakingSection.style.display = "block";
            loadSpeakingPrompts();
            loadSpeakingHistory();
        } else {
            speakingSection.style.display = "none";
            if (btnCancelRecording && isRecordingActive) {
                btnCancelRecording.click();
            }
        }
    }

    async function loadSpeakingPrompts() {
        if (!window.BhashaAPI || !window.BhashaAPI.getSpeakingPrompts) return;
        try {
            const data = await window.BhashaAPI.getSpeakingPrompts({
                difficulty: currentDifficultyFilter,
                task_type: currentTaskFilter,
                exclude_recent: true,
                limit: 50
            });
            loadedPrompts = (data && data.prompts) ? data.prompts : [];
            renderPromptSelectOptions(loadedPrompts);
        } catch (err) {
            console.warn("[Dashboard] Error loading speaking prompts:", err);
        }
    }

    function renderPromptSelectOptions(prompts) {
        if (!speakingPromptSelect) return;
        if (!prompts || prompts.length === 0) {
            speakingPromptSelect.innerHTML = `
                <option value="The quick brown fox jumps over the lazy dog." data-diff="beginner" data-task="sentence_reading" data-pace="100-130 WPM" data-guidance="Focus on steady articulation and rhythm.">1. The quick brown fox jumps over the lazy dog. (Fundamentals)</option>
                <option value="__custom__">✏️ Custom Sentence...</option>
            `;
            updatePromptMetadataUI(null);
            return;
        }

        const optionsHtml = prompts.map((p, idx) => {
            const promptStr = p.target_text || p.prompt_text || "";
            const paceStr = p.target_pace_wpm_guide || (p.recommended_wpm_min ? `${p.recommended_wpm_min}-${p.recommended_wpm_max} WPM` : "110-150 WPM");
            const label = `${idx + 1}. [${(p.difficulty || "inter").toUpperCase()}] ${promptStr.length > 55 ? promptStr.substring(0, 55) + "..." : promptStr}`;
            return `<option value="${escapeHtml(promptStr)}" data-id="${p.id}" data-diff="${escapeHtml(p.difficulty || 'intermediate')}" data-task="${escapeHtml(p.task_type || 'sentence_reading')}" data-pace="${escapeHtml(paceStr)}" data-guidance="${escapeHtml(p.guidance || '')}">${escapeHtml(label)}</option>`;
        }).join("");

        speakingPromptSelect.innerHTML = optionsHtml + `<option value="__custom__">✏️ Custom Sentence...</option>`;
        speakingPromptSelect.selectedIndex = 0;
        onPromptSelectionChanged();
    }

    function updatePromptMetadataUI(promptObj) {
        if (!promptObj) {
            if (promptDifficultyBadge) {
                promptDifficultyBadge.textContent = "Intermediate";
                promptDifficultyBadge.className = "prompt-meta-badge badge-diff-intermediate";
            }
            if (promptTaskTypeBadge) promptTaskTypeBadge.textContent = "Sentence Reading";
            if (promptPaceBadge) promptPaceBadge.textContent = "Target: 110-150 WPM";
            if (promptGuidanceText) promptGuidanceText.textContent = "Read clearly into your microphone at a steady, fluent pace.";
            return;
        }

        const diff = (promptObj.difficulty || "intermediate").toLowerCase();
        const diffClass = diff === "beginner" ? "badge-diff-beginner" : (diff === "advanced" ? "badge-diff-advanced" : "badge-diff-intermediate");
        if (promptDifficultyBadge) {
            promptDifficultyBadge.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
            promptDifficultyBadge.className = `prompt-meta-badge ${diffClass}`;
        }
        if (promptTaskTypeBadge) {
            const taskNice = (promptObj.task_type || "sentence_reading").replace(/_/g, " ");
            promptTaskTypeBadge.textContent = taskNice.charAt(0).toUpperCase() + taskNice.slice(1);
        }
        if (promptPaceBadge) {
            promptPaceBadge.textContent = `Target: ${promptObj.recommended_wpm_min || 110}-${promptObj.recommended_wpm_max || 160} WPM`;
        }
        if (promptGuidanceText) {
            promptGuidanceText.textContent = promptObj.guidance || "Read clearly into your microphone at a steady, fluent pace.";
        }
    }

    function onPromptSelectionChanged() {
        if (!speakingPromptSelect) return;
        const selectedVal = speakingPromptSelect.value;
        if (selectedVal === "__custom__") {
            if (customPromptRow) customPromptRow.style.display = "block";
            if (customPromptInput) customPromptInput.focus();
            if (targetSentenceDisplay) {
                targetSentenceDisplay.textContent = (customPromptInput && customPromptInput.value.trim()) || "Type your custom sentence above...";
            }
            currentSelectedPrompt = null;
            updatePromptMetadataUI(null);
        } else {
            if (customPromptRow) customPromptRow.style.display = "none";
            if (targetSentenceDisplay) {
                targetSentenceDisplay.textContent = selectedVal;
            }
            const selectedOpt = speakingPromptSelect.selectedOptions[0];
            if (selectedOpt && selectedOpt.dataset.diff) {
                currentSelectedPrompt = {
                    id: selectedOpt.dataset.id ? Number(selectedOpt.dataset.id) : null,
                    difficulty: selectedOpt.dataset.diff,
                    task_type: selectedOpt.dataset.task,
                    guidance: selectedOpt.dataset.guidance
                };
                const paceRange = (selectedOpt.dataset.pace || "").replace(" WPM", "").split("-");
                if (paceRange.length === 2) {
                    currentSelectedPrompt.recommended_wpm_min = parseInt(paceRange[0], 10) || 110;
                    currentSelectedPrompt.recommended_wpm_max = parseInt(paceRange[1], 10) || 160;
                }
                updatePromptMetadataUI(currentSelectedPrompt);
            } else {
                currentSelectedPrompt = null;
                updatePromptMetadataUI(null);
            }
        }
        if (speakingResultsPanel) speakingResultsPanel.style.display = "none";
        hideSpeakingAlert();
    }

    speakingDifficultyPills.forEach(pill => {
        pill.addEventListener("click", () => {
            speakingDifficultyPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentDifficultyFilter = pill.dataset.difficulty || "all";
            loadSpeakingPrompts();
        });
    });

    speakingTaskPills.forEach(pill => {
        pill.addEventListener("click", () => {
            speakingTaskPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentTaskFilter = pill.dataset.task || "all";
            loadSpeakingPrompts();
        });
    });

    if (btnShufflePrompt) {
        btnShufflePrompt.addEventListener("click", () => {
            if (!speakingPromptSelect || speakingPromptSelect.options.length <= 1) return;
            const validIndices = [];
            for (let i = 0; i < speakingPromptSelect.options.length; i++) {
                if (speakingPromptSelect.options[i].value !== "__custom__" && i !== speakingPromptSelect.selectedIndex) {
                    validIndices.push(i);
                }
            }
            if (validIndices.length > 0) {
                const randomIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
                speakingPromptSelect.selectedIndex = randomIdx;
                onPromptSelectionChanged();
            }
        });
    }

    if (speakingPromptSelect) {
        speakingPromptSelect.addEventListener("change", onPromptSelectionChanged);
    }

    function showSpeakingAlert(title, message, isError = true) {
        if (!speakingAlertBox) return;
        if (speakingAlertTitle) speakingAlertTitle.textContent = title;
        if (speakingAlertMessage) speakingAlertMessage.textContent = message;
        speakingAlertBox.style.display = "flex";
        speakingAlertBox.style.background = isError ? "#FEF2F2" : "#F0FDF4";
        speakingAlertBox.style.borderColor = isError ? "#FCA5A5" : "#86EFAC";
        const icon = document.getElementById("speakingAlertIcon");
        if (icon) icon.textContent = isError ? "⚠️" : "✓";
    }

    function hideSpeakingAlert() {
        if (speakingAlertBox) speakingAlertBox.style.display = "none";
    }

    if (btnDismissSpeakingAlert) {
        btnDismissSpeakingAlert.onclick = hideSpeakingAlert;
    }

    // Target prompt selection handling
    function getActiveTargetPrompt() {
        if (speakingPromptSelect && speakingPromptSelect.value === "__custom__") {
            const customVal = (customPromptInput && customPromptInput.value.trim()) || "";
            return customVal || "The quick brown fox jumps over the lazy dog.";
        }
        return (speakingPromptSelect && speakingPromptSelect.value) || "The quick brown fox jumps over the lazy dog.";
    }

    if (customPromptInput) {
        customPromptInput.addEventListener("input", function () {
            if (targetSentenceDisplay) {
                targetSentenceDisplay.textContent = this.value.trim() || "Type your custom sentence above...";
            }
        });
    }

    // Text-to-speech button to listen to prompt
    if (btnListenTarget) {
        btnListenTarget.onclick = function () {
            const prompt = getActiveTargetPrompt();
            if (!("speechSynthesis" in window)) {
                alert("Speech synthesis is not supported in this browser.");
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(prompt);
            utterance.rate = 0.9;
            utterance.lang = "en-US";
            window.speechSynthesis.speak(utterance);
        };
    }

    // Check browser support for SpeechRecognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isBrowserSTTSupported = Boolean(SpeechRecognitionAPI);
    console.log("[SpeechAssessment] SpeechRecognition API support:", isBrowserSTTSupported, "Secure context:", window.isSecureContext);

    if (speechSupportTag) {
        if (!isBrowserSTTSupported) {
            speechSupportTag.innerHTML = `<span class="status-pulse-dot" style="background: #EF5350;"></span> STT Unsupported in this Browser`;
            speechSupportTag.style.background = "#FEF2F2";
            speechSupportTag.style.color = "#991B1B";
        } else {
            speechSupportTag.innerHTML = `<span class="status-pulse-dot speech-dot"></span> Web Speech Recognition`;
            speechSupportTag.style.background = "#F1F5F9";
            speechSupportTag.style.color = "#475569";
        }
    }

    function formatTimer(ms) {
        const totalSec = Math.floor(ms / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        const tenths = Math.floor((ms % 1000) / 100);
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${tenths}`;
    }

    // Compute Word Alignment & Word Error Rate
    function computeWordAlignment(targetText, spokenText) {
        const clean = str => (str || "").toLowerCase().replace(/[^\w\s]/g, "").trim().split(/\s+/).filter(Boolean);
        const targetTokens = clean(targetText);
        const spokenTokens = clean(spokenText);

        const n = targetTokens.length;
        const m = spokenTokens.length;

        if (n === 0) {
            return {
                accuracy: 0.0,
                targetWords: [],
                spokenWords: spokenTokens,
                wer: 1.0,
                aligned: []
            };
        }

        // DP matrix for Levenshtein word distance
        const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
        for (let i = 0; i <= n; i++) dp[i][0] = i;
        for (let j = 0; j <= m; j++) dp[0][j] = j;

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                const cost = targetTokens[i - 1] === spokenTokens[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,        // deletion
                    dp[i][j - 1] + 1,        // insertion
                    dp[i - 1][j - 1] + cost  // substitution
                );
            }
        }

        const editDistance = dp[n][m];
        const wer = editDistance / n;
        const accuracy = Math.max(0.0, Math.min(100.0, Math.round((1.0 - wer) * 1000) / 10));

        const aligned = [];
        const spokenSet = new Set(spokenTokens);

        for (let idx = 0; idx < targetTokens.length; idx++) {
            const w = targetTokens[idx];
            const isMatch = spokenSet.has(w);
            aligned.push({
                word: w,
                matched: isMatch
            });
        }

        return {
            accuracy,
            targetWords: targetTokens,
            spokenWords: spokenTokens,
            wer,
            aligned
        };
    }

    // Start Recording Flow: microphone permission verification and recognition initialization
    async function startRecordingFlow() {
        console.log("[SpeechAssessment] startRecordingFlow triggered");
        if (isRecordingActive) {
            console.warn("[SpeechAssessment] Recording already active, ignoring duplicate trigger");
            return;
        }

        hideSpeakingAlert();
        if (speakingResultsPanel) speakingResultsPanel.style.display = "none";

        if (!SpeechRecognitionAPI) {
            console.error("[SpeechAssessment] SpeechRecognition API not supported in current browser");
            showSpeakingAlert(
                "Browser Speech Recognition Unsupported",
                "Your current browser does not support the Web Speech API (supported in Google Chrome, Microsoft Edge, and Chromium-based browsers). Please use Google Chrome or Microsoft Edge for live speech assessment.",
                true
            );
            return;
        }

        const isSecure = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
        if (!isSecure) {
            console.warn("[SpeechAssessment] Insecure context detected on host:", location.hostname);
            showSpeakingAlert(
                "Secure Context Required",
                "Microphone access and speech recognition require HTTPS or localhost. Please access the application at http://localhost:8000.",
                true
            );
            return;
        }

        // Clean up any lingering speech recognition instance before starting
        if (speechRecognitionInstance) {
            try {
                speechRecognitionInstance.onresult = null;
                speechRecognitionInstance.onerror = null;
                speechRecognitionInstance.onend = null;
                speechRecognitionInstance.abort();
            } catch (_) {}
            speechRecognitionInstance = null;
        }

        // Explicitly check and request microphone permissions via getUserMedia
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                console.log("[SpeechAssessment] Requesting microphone access via getUserMedia...");
                if (btnStartRecording) btnStartRecording.disabled = true;
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log("[SpeechAssessment] Microphone access granted by user.");
                // Immediately release tracks so SpeechRecognition has exclusive audio input
                stream.getTracks().forEach(t => {
                    try { t.stop(); } catch (_) {}
                });
            } catch (permErr) {
                console.error("[SpeechAssessment] Microphone permission rejected or device unavailable:", permErr);
                if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
                    showSpeakingAlert(
                        "Microphone Access Denied",
                        "Microphone permission was denied. Please allow microphone access in your browser settings (click the lock/tune icon in the address bar) and try again.",
                        true
                    );
                } else if (permErr.name === "NotFoundError" || permErr.name === "DevicesNotFoundError") {
                    showSpeakingAlert(
                        "No Microphone Detected",
                        "No working audio input device was found on your system. Please connect a microphone and try again.",
                        true
                    );
                } else {
                    showSpeakingAlert(
                        "Microphone Initialization Error",
                        "Could not access microphone: " + (permErr.message || permErr.name),
                        true
                    );
                }
                return;
            } finally {
                if (btnStartRecording) btnStartRecording.disabled = false;
            }
        }

        try {
            console.log("[SpeechAssessment] Initializing new SpeechRecognition instance...");
            speechRecognitionInstance = new SpeechRecognitionAPI();
            speechRecognitionInstance.continuous = true;
            speechRecognitionInstance.interimResults = true;
            speechRecognitionInstance.lang = "en-US";
            speechRecognitionInstance.maxAlternatives = 1;

            accumulatedTranscript = "";
            interimTranscript = "";
            lastRecognitionError = null;
            isRecordingActive = true;
            isEvaluating = false;

            if (micIdleState) micIdleState.style.display = "none";
            if (micActiveState) micActiveState.style.display = "flex";
            if (liveTranscriptText) liveTranscriptText.textContent = "Listening for speech... Please speak now.";
            if (recordingTimer) recordingTimer.textContent = "00:00.0";

            recordStartTime = performance.now();
            if (recordTimerInterval) clearInterval(recordTimerInterval);
            recordTimerInterval = setInterval(() => {
                const elapsed = performance.now() - recordStartTime;
                if (recordingTimer) recordingTimer.textContent = formatTimer(elapsed);
            }, 100);

            speechRecognitionInstance.onresult = function (event) {
                interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const item = event.results[i];
                    const transcriptPart = item[0].transcript;
                    if (item.isFinal) {
                        accumulatedTranscript += (accumulatedTranscript ? " " : "") + transcriptPart.trim();
                    } else {
                        interimTranscript += (interimTranscript ? " " : "") + transcriptPart.trim();
                    }
                }
                const combined = (accumulatedTranscript + " " + interimTranscript).trim();
                console.log("[SpeechRecognition] onresult - transcript:", combined);
                if (liveTranscriptText) {
                    liveTranscriptText.textContent = combined || "Listening for speech...";
                }
            };

            speechRecognitionInstance.onerror = function (event) {
                console.warn("[SpeechRecognition] Error event:", event.error, event.message || "");
                lastRecognitionError = event.error;

                if (isEvaluating) {
                    // Benign abort/no-speech during intentional stop is ignored if transcript is present
                    if (event.error === "aborted" || event.error === "no-speech") {
                        console.log("[SpeechRecognition] Ignoring benign error during evaluation stop:", event.error);
                        return;
                    }
                }

                clearInterval(recordTimerInterval);
                isRecordingActive = false;
                if (micIdleState) micIdleState.style.display = "flex";
                if (micActiveState) micActiveState.style.display = "none";

                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    showSpeakingAlert(
                        "Microphone Access Denied",
                        "Microphone permission was denied. Please allow microphone access in your browser settings (click the lock icon in the address bar) and try again.",
                        true
                    );
                } else if (event.error === "no-speech") {
                    showSpeakingAlert(
                        "No Speech Detected",
                        "No voice input was detected before timeout. Please check your microphone connection and speak clearly.",
                        true
                    );
                } else if (event.error === "audio-capture") {
                    showSpeakingAlert(
                        "Audio Capture Error",
                        "No working microphone was found on your system. Please connect an audio input device.",
                        true
                    );
                } else if (event.error === "network") {
                    showSpeakingAlert(
                        "Network Recognition Error",
                        "Unable to communicate with the speech recognition service. Please check your network connection.",
                        true
                    );
                } else if (event.error === "aborted") {
                    console.log("[SpeechRecognition] Recognition aborted.");
                } else {
                    showSpeakingAlert(
                        "Speech Recognition Error",
                        `Recognition encountered an error (${event.error}). Please try again.`,
                        true
                    );
                }
            };

            speechRecognitionInstance.onend = function () {
                console.log("[SpeechRecognition] onend fired. isEvaluating:", isEvaluating, "isRecordingActive:", isRecordingActive);
                clearInterval(recordTimerInterval);
                if (isEvaluating) {
                    finalizeEvaluation();
                } else if (isRecordingActive) {
                    isRecordingActive = false;
                    if (micIdleState) micIdleState.style.display = "flex";
                    if (micActiveState) micActiveState.style.display = "none";
                }
            };

            speechRecognitionInstance.start();
            console.log("[SpeechAssessment] SpeechRecognition started successfully.");

        } catch (err) {
            console.error("[SpeechRecognition] Failed to start:", err);
            if (recordTimerInterval) clearInterval(recordTimerInterval);
            isRecordingActive = false;
            if (micIdleState) micIdleState.style.display = "flex";
            if (micActiveState) micActiveState.style.display = "none";
            showSpeakingAlert(
                "Microphone Error",
                "Could not start speech recognition: " + (err.message || "Unknown error"),
                true
            );
        }
    }

    // Attach single, idempotent click listeners
    if (btnStartRecording) {
        btnStartRecording.onclick = startRecordingFlow;
    }

    // Stop & Evaluate Recording
    if (btnStopRecording) {
        btnStopRecording.onclick = function () {
            if (!isRecordingActive) return;
            console.log("[SpeechAssessment] Stop & Evaluate clicked");
            isEvaluating = true;
            isRecordingActive = false;
            clearInterval(recordTimerInterval);

            if (speechRecognitionInstance) {
                try {
                    speechRecognitionInstance.stop();
                } catch (err) {
                    console.warn("[SpeechAssessment] Exception during speechRecognitionInstance.stop():", err);
                    finalizeEvaluation();
                }
            } else {
                finalizeEvaluation();
            }
        };
    }

    // Cancel Recording
    if (btnCancelRecording) {
        btnCancelRecording.onclick = function () {
            console.log("[SpeechAssessment] Cancel recording clicked");
            isEvaluating = false;
            isRecordingActive = false;
            clearInterval(recordTimerInterval);
            if (speechRecognitionInstance) {
                try {
                    speechRecognitionInstance.abort();
                } catch (_) {}
            }
            if (micIdleState) micIdleState.style.display = "flex";
            if (micActiveState) micActiveState.style.display = "none";
            accumulatedTranscript = "";
            interimTranscript = "";
            lastRecognitionError = null;
            hideSpeakingAlert();
        };
    }

    // Finalize evaluation and submit assessment
    async function finalizeEvaluation() {
        const durationSeconds = Math.max(0.1, (performance.now() - recordStartTime) / 1000);
        if (micIdleState) micIdleState.style.display = "flex";
        if (micActiveState) micActiveState.style.display = "none";

        const targetText = getActiveTargetPrompt();
        let spokenText = (accumulatedTranscript + " " + interimTranscript).trim();

        if (!spokenText && liveTranscriptText) {
            const domText = (liveTranscriptText.textContent || "").trim();
            const placeholders = [
                "listening for speech...",
                "listening for speech... please speak now.",
                "listening for speech"
            ];
            if (!placeholders.includes(domText.toLowerCase())) {
                spokenText = domText;
            }
        }

        console.log("[SpeechAssessment] finalizeEvaluation - spokenText:", spokenText, "durationSec:", durationSeconds, "lastError:", lastRecognitionError);

        if (!spokenText) {
            if (lastRecognitionError === "network") {
                showSpeakingAlert(
                    "Network Recognition Error",
                    "Unable to communicate with the speech recognition service. Please check your network connection and try again.",
                    true
                );
            } else if (lastRecognitionError === "not-allowed" || lastRecognitionError === "service-not-allowed") {
                showSpeakingAlert(
                    "Microphone Access Denied",
                    "Microphone permission was denied. Please allow microphone access in your browser settings and try again.",
                    true
                );
            } else {
                showSpeakingAlert(
                    "No Speech Recorded",
                    "No spoken words were recognized. Please ensure your microphone is working and speak clearly.",
                    true
                );
            }
            return;
        }

        const alignment = computeWordAlignment(targetText, spokenText);

        // Speaking rate WPM reported ONLY when duration measured reliably (duration >= 1.0s)
        let speakingRateWpm = null;
        if (durationSeconds >= 1.0) {
            speakingRateWpm = Math.round((alignment.spokenWords.length / durationSeconds) * 60);
        }

        // Render UI Results
        renderAssessmentResults(targetText, spokenText, alignment, durationSeconds, speakingRateWpm);

        // Submit to authenticated endpoint with prompt metadata
        if (window.BhashaAPI && window.BhashaAPI.submitSpeakingAssessment) {
            try {
                const diff = (currentSelectedPrompt && currentSelectedPrompt.difficulty) || "intermediate";
                const task = (currentSelectedPrompt && currentSelectedPrompt.task_type) || "sentence_reading";
                const payload = {
                    target_text: targetText,
                    spoken_text: spokenText,
                    transcription_accuracy: alignment.accuracy,
                    duration_seconds: Number(durationSeconds.toFixed(1)),
                    speaking_rate_wpm: speakingRateWpm,
                    difficulty: diff,
                    task_type: task
                };
                const response = await window.BhashaAPI.submitSpeakingAssessment(payload);
                if (response) {
                    const topXpDisplay = document.getElementById("topXpDisplay");
                    if (topXpDisplay) {
                        const curXp = parseInt(topXpDisplay.textContent.replace(/,/g, "") || "0", 10);
                        topXpDisplay.textContent = (curXp + 15).toLocaleString();
                    }
                    if (response.feedback_text) {
                        const feedbackHdr = document.getElementById("resFeedbackHeader");
                        if (feedbackHdr) {
                            feedbackHdr.title = response.feedback_text;
                        }
                    }
                    loadSpeakingHistory();
                }
            } catch (err) {
                console.warn("[Dashboard] Speaking assessment save error:", err);
            }
        }
    }

    function renderAssessmentResults(targetText, spokenText, alignment, durationSec, wpm) {
        if (!speakingResultsPanel) return;

        // 1. Accuracy
        const acc = alignment.accuracy;
        if (resAccuracyNum) resAccuracyNum.textContent = `${acc}%`;
        if (resAccuracyBar) resAccuracyBar.style.width = `${acc}%`;
        if (resAccuracyGrade) {
            if (acc >= 85) {
                resAccuracyGrade.textContent = "High Match";
                resAccuracyGrade.style.background = "#E8F5E9";
                resAccuracyGrade.style.color = "#2E7D32";
            } else if (acc >= 65) {
                resAccuracyGrade.textContent = "Moderate";
                resAccuracyGrade.style.background = "#FEF3C7";
                resAccuracyGrade.style.color = "#B45309";
            } else {
                resAccuracyGrade.textContent = "Needs Practice";
                resAccuracyGrade.style.background = "#FEE2E2";
                resAccuracyGrade.style.color = "#991B1B";
            }
        }

        // 2. Speaking Rate (WPM)
        if (resWpmNum) {
            if (wpm !== null) {
                resWpmNum.textContent = `${wpm} WPM`;
            } else {
                resWpmNum.textContent = "Brief (<1s)";
            }
        }
        if (resWpmGrade) {
            if (wpm === null) {
                resWpmGrade.textContent = "Unmeasured";
                resWpmGrade.style.background = "#F1F5F9";
                resWpmGrade.style.color = "#64748B";
            } else if (wpm >= 110 && wpm <= 160) {
                resWpmGrade.textContent = "Fluent Pace";
                resWpmGrade.style.background = "#E8F5E9";
                resWpmGrade.style.color = "#2E7D32";
            } else if (wpm < 110) {
                resWpmGrade.textContent = "Deliberate";
                resWpmGrade.style.background = "#FEF3C7";
                resWpmGrade.style.color = "#B45309";
            } else {
                resWpmGrade.textContent = "Fast";
                resWpmGrade.style.background = "#EFF6FF";
                resWpmGrade.style.color = "#1D4ED8";
            }
        }
        if (resDurationDetail) {
            resDurationDetail.textContent = `Recording Duration: ${durationSec.toFixed(1)}s`;
        }

        // 3. Pronunciation status: strictly unavailable per Requirement 5
        if (resPronStatus) {
            resPronStatus.textContent = "Unavailable";
        }

        // 4. Word-by-word diff chips
        if (resWordDiffChips) {
            resWordDiffChips.innerHTML = (alignment.aligned || []).map(item => {
                if (item.matched) {
                    return `<span class="diff-chip chip-correct">✓ ${escapeHtml(item.word)}</span>`;
                } else {
                    return `<span class="diff-chip chip-incorrect">✗ ${escapeHtml(item.word)}</span>`;
                }
            }).join("");
        }

        // 5. Spoken verbatim
        if (resSpokenVerbatim) {
            resSpokenVerbatim.textContent = `“${escapeHtml(spokenText)}”`;
        }

        speakingResultsPanel.style.display = "block";
        speakingResultsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (btnTryAgain) {
        btnTryAgain.addEventListener("click", function () {
            if (speakingResultsPanel) speakingResultsPanel.style.display = "none";
            hideSpeakingAlert();
            if (micIdleState) micIdleState.style.display = "flex";
            if (micActiveState) micActiveState.style.display = "none";
        });
    }

    // Speaking History Drawer Toggle & Loader with Stats & Rich Cards
    async function loadSpeakingHistory() {
        if (!window.BhashaAPI || !window.BhashaAPI.getSpeakingAssessments) return;
        try {
            const [records, stats] = await Promise.all([
                window.BhashaAPI.getSpeakingAssessments(20),
                (window.BhashaAPI.getSpeakingStats) ? window.BhashaAPI.getSpeakingStats() : Promise.resolve(null)
            ]);

            const count = (records && records.length) ? records.length : 0;
            if (speakingAttemptsCount) {
                speakingAttemptsCount.textContent = count;
            }

            // Update stats summary strip
            if (stats) {
                if (histStatAttempts) histStatAttempts.textContent = stats.total_attempts ?? count;
                if (histStatAccuracy) histStatAccuracy.textContent = `${stats.average_accuracy ?? 0}%`;
                if (histStatPace) histStatPace.textContent = stats.average_wpm ? `${stats.average_wpm} WPM` : "— WPM";
                if (histStatTrend && stats.recent_trend) {
                    const delta = stats.recent_trend.accuracy_delta;
                    if (delta > 0) {
                        histStatTrend.innerHTML = `<span class="history-trend-pill history-trend-up">↗ +${delta}%</span>`;
                    } else if (delta < 0) {
                        histStatTrend.innerHTML = `<span class="history-trend-pill history-trend-down">↘ ${delta}%</span>`;
                    } else {
                        histStatTrend.innerHTML = `<span class="history-trend-pill history-trend-stable">Steady</span>`;
                    }
                }
            } else if (count > 0) {
                if (histStatAttempts) histStatAttempts.textContent = count;
                const avgAcc = Math.round(records.reduce((sum, r) => sum + (r.transcription_accuracy || 0), 0) / count);
                if (histStatAccuracy) histStatAccuracy.textContent = `${avgAcc}%`;
            }

            if (speakingHistoryList) {
                if (!records || records.length === 0) {
                    speakingHistoryList.innerHTML = `<p class="history-empty">No previous speaking sessions recorded yet.</p>`;
                    return;
                }
                speakingHistoryList.innerHTML = records.map(r => {
                    const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    }) : "Recent";
                    const diff = (r.difficulty || "intermediate").toLowerCase();
                    const task = (r.task_type || "sentence_reading").replace(/_/g, " ");
                    const diffClass = diff === "beginner" ? "badge-diff-beginner" : (diff === "advanced" ? "badge-diff-advanced" : "badge-diff-intermediate");
                    const wpmText = r.speaking_rate_wpm ? `${Math.round(r.speaking_rate_wpm)} WPM` : (r.duration_seconds < 1.0 ? "Brief (<1s)" : "— WPM");
                    const acc = Math.round(r.transcription_accuracy || 0);
                    const accColor = acc >= 80 ? "#2E7D32" : (acc >= 60 ? "#B45309" : "#C62828");
                    return `
                        <div class="history-card">
                            <div class="history-card-header">
                                <div class="history-card-badges">
                                    <span class="prompt-meta-badge ${diffClass}">${diff.toUpperCase()}</span>
                                    <span class="prompt-meta-badge">${task.toUpperCase()}</span>
                                    <small style="color: var(--c-text-muted); font-size: 11px;">${escapeHtml(dateStr)} • ${r.duration_seconds || 0}s</small>
                                </div>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <span style="font-family: var(--font-mono); font-weight: 800; font-size: 14px; color: ${accColor};">${acc}% Match</span>
                                    <span class="prompt-meta-badge badge-pace">${wpmText}</span>
                                </div>
                            </div>
                            <div class="history-card-target"><strong>Prompt:</strong> ${escapeHtml(r.target_text)}</div>
                            <div class="history-card-spoken"><strong>Spoken:</strong> “${escapeHtml(r.spoken_text || '—')}”</div>
                            ${r.feedback_text ? `<div class="history-card-feedback">💡 ${escapeHtml(r.feedback_text)}</div>` : ''}
                        </div>
                    `;
                }).join("");
            }
        } catch (err) {
            console.warn("[Dashboard] Failed to load speaking history:", err);
        }
    }

    if (btnToggleSpeakingHistory) {
        btnToggleSpeakingHistory.addEventListener("click", function () {
            if (speakingHistoryDrawer) {
                const isOpen = speakingHistoryDrawer.style.display === "block";
                speakingHistoryDrawer.style.display = isOpen ? "none" : "block";
                if (!isOpen) loadSpeakingHistory();
            }
        });
    }

    if (btnCloseHistoryDrawer) {
        btnCloseHistoryDrawer.addEventListener("click", function () {
            if (speakingHistoryDrawer) speakingHistoryDrawer.style.display = "none";
        });
    }

    // Initial check of active track to control speaking card visibility
    const initialRawTrack = currentActiveTrack || ((window.BhashaAPI && window.BhashaAPI.getSelectedSubject) ? window.BhashaAPI.getSelectedSubject() : null);
    if (initialRawTrack) {
        handleSpeakingSectionVisibility(initialRawTrack);
    }

    /* =========================================================
       EARNABLE PREMIUM MEMBERSHIP SYSTEM LOGIC
       Rule: Every 200 minutes active learning = 1 day Premium
       ========================================================= */
    const premiumProgressRing = document.getElementById("premiumProgressRing");
    const ringMinutesDisplay = document.getElementById("ringMinutesDisplay");
    const rewardProgressPercent = document.getElementById("rewardProgressPercent");
    const statMinsRemaining = document.getElementById("statMinsRemaining");
    const statDaysLeft = document.getElementById("statDaysLeft");
    const statHoursLeft = document.getElementById("statHoursLeft");
    const statTotalScreenTime = document.getElementById("statTotalScreenTime");
    const statExpiryDate = document.getElementById("statExpiryDate");
    const premiumStatusBadge = document.getElementById("premiumStatusBadge");
    const premiumStatusText = document.getElementById("premiumStatusText");
    const navPremiumStatus = document.getElementById("navPremiumStatus");

    // Modals
    const premiumCelebrationModal = document.getElementById("premiumCelebrationModal");
    const modalDaysAdded = document.getElementById("modalDaysAdded");
    const modalMinutesDeducted = document.getElementById("modalMinutesDeducted");
    const modalNewExpiry = document.getElementById("modalNewExpiry");
    const btnCloseCelebrationModal = document.getElementById("btnCloseCelebrationModal");

    const premiumLockedModal = document.getElementById("premiumLockedModal");
    const lockedModalMinsEarned = document.getElementById("lockedModalMinsEarned");
    const lockedModalMinsLeft = document.getElementById("lockedModalMinsLeft");
    const btnCloseLockedModal = document.getElementById("btnCloseLockedModal");
    const btnViewPremiumFeatures = document.getElementById("btnViewPremiumFeatures");

    const CIRCUMFERENCE = 2 * Math.PI * 60; // ~376.99

    async function loadPremiumMembershipData() {
        try {
            let data = null;
            if (window.BhashaAPI && window.BhashaAPI.getPremiumStatus) {
                data = await window.BhashaAPI.getPremiumStatus();
            } else {
                const base = (window.BhashaAPI && window.BhashaAPI.getBackendUrl) ? window.BhashaAPI.getBackendUrl() : "http://127.0.0.1:8000";
                const res = await fetch(`${base}/premium/status`);
                if (res.ok) data = await res.json();
            }

            if (data) {
                renderPremiumMembershipUI(data);
            }
        } catch (err) {
            console.warn("Failed to load premium membership status:", err);
        }
    }

    function renderPremiumMembershipUI(data) {
        const availableMins = Math.round(data.available_reward_minutes || 0);
        const threshold = data.reward_threshold_minutes || 200;
        const minsLeft = Math.round(data.minutes_remaining || 0);
        const progressPct = data.progress_percent || 0;
        const isPremium = Boolean(data.is_premium);

        // Update Circular Ring
        if (ringMinutesDisplay) {
            ringMinutesDisplay.textContent = `${availableMins} / ${threshold}`;
        }

        if (premiumProgressRing) {
            const offset = CIRCUMFERENCE - (progressPct / 100) * CIRCUMFERENCE;
            premiumProgressRing.style.strokeDasharray = `${CIRCUMFERENCE}`;
            premiumProgressRing.style.strokeDashoffset = `${Math.max(0, offset)}`;
        }

        if (rewardProgressPercent) {
            rewardProgressPercent.textContent = `${progressPct}%`;
        }

        if (statMinsRemaining) {
            statMinsRemaining.textContent = `${minsLeft}`;
        }

        if (statDaysLeft) {
            statDaysLeft.textContent = isPremium ? `${data.days_left} Days` : "0 Days";
        }

        if (statHoursLeft) {
            statHoursLeft.textContent = isPremium ? `${data.hours_left} hours left` : "Inactive";
        }

        if (statTotalScreenTime) {
            statTotalScreenTime.textContent = `${Math.round(data.total_screen_minutes || 0)} Mins`;
        }

        if (statExpiryDate) {
            statExpiryDate.textContent = data.expiry_formatted || "Inactive";
        }

        // Status Badges
        if (premiumStatusBadge && premiumStatusText) {
            if (isPremium) {
                premiumStatusBadge.className = "premium-status-badge active";
                premiumStatusText.textContent = `👑 Premium Active (${data.days_left}d)`;
            } else {
                premiumStatusBadge.className = "premium-status-badge free";
                premiumStatusText.textContent = `⭐ Free Learner (${minsLeft}m to Day)`;
            }
        }

        if (navPremiumStatus) {
            navPremiumStatus.textContent = isPremium ? `Premium (${data.days_left}d)` : "Free Learner";
        }

        // Locked Modal state
        if (lockedModalMinsEarned) {
            lockedModalMinsEarned.textContent = `${availableMins} / ${threshold} Mins`;
        }
        if (lockedModalMinsLeft) {
            lockedModalMinsLeft.textContent = `${minsLeft} Mins remaining`;
        }
    }

    // Celebration modal handlers
    if (btnCloseCelebrationModal && premiumCelebrationModal) {
        btnCloseCelebrationModal.addEventListener("click", () => {
            premiumCelebrationModal.style.display = "none";
        });
    }

    // Locked features modal handlers
    if (btnViewPremiumFeatures && premiumLockedModal) {
        btnViewPremiumFeatures.addEventListener("click", () => {
            premiumLockedModal.style.display = "flex";
        });
    }

    if (btnCloseLockedModal && premiumLockedModal) {
        btnCloseLockedModal.addEventListener("click", () => {
            premiumLockedModal.style.display = "none";
        });
    }

    // Listen for real-time screen-time updates from screen-time.js
    window.addEventListener("lingox:screentime_updated", function (e) {
        if (e.detail && e.detail.premium_status) {
            renderPremiumMembershipUI(e.detail.premium_status);
        }
    });

    // Listen for reward earned trigger
    window.addEventListener("lingox:reward_earned", function (e) {
        const reward = e.detail;
        if (reward && premiumCelebrationModal) {
            if (modalDaysAdded) modalDaysAdded.textContent = `+${reward.days_added} Day${reward.days_added > 1 ? "s" : ""} Premium (24h/day)`;
            if (modalMinutesDeducted) modalMinutesDeducted.textContent = `${reward.minutes_deducted} Minutes`;
            if (modalNewExpiry) modalNewExpiry.textContent = reward.new_expiry_formatted || reward.new_expiry;

            premiumCelebrationModal.style.display = "flex";
            loadPremiumMembershipData();
        }
    });

    /* =====================================================
       SWITCH TRACK MODAL SYSTEM
       Reuses the official subject-selection flow & cards from index.html
       ===================================================== */
    const switchTrackBtn = document.getElementById("switchTrackBtn") || document.querySelector(".switch-track-btn");
    const trackModalOverlay = document.getElementById("trackModalOverlay");
    const closeTrackModal = document.getElementById("closeTrackModal");
    const cancelTrackModal = document.getElementById("cancelTrackModal");
    const confirmTrackSwitch = document.getElementById("confirmTrackSwitch");
    const modalLangOptions = document.querySelectorAll("#modalLangGrid .lang-option");

    let modalSelectedSubject = currentActiveTrack || "Python";

    function updateModalOptionSelection(targetSubject) {
        if (!targetSubject) return;
        const norm = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(targetSubject, targetSubject)
            : targetSubject;
        modalSelectedSubject = norm;

        modalLangOptions.forEach(opt => {
            const optLang = opt.getAttribute("data-lang");
            const optNorm = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                ? window.BhashaAPI.normalizeSubject(optLang, optLang)
                : optLang;
            const isMatch = optNorm && norm && optNorm.toLowerCase() === norm.toLowerCase();
            const radio = opt.querySelector(".lang-radio");
            if (isMatch) {
                opt.classList.add("selected");
                if (radio) radio.textContent = "✓";
            } else {
                opt.classList.remove("selected");
                if (radio) radio.textContent = "";
            }
        });

        if (confirmTrackSwitch) {
            confirmTrackSwitch.textContent = `Switch to ${norm} Track →`;
        }
    }

    async function executeTrackSwitch(targetSubject) {
        if (!targetSubject) return;
        const norm = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
            ? window.BhashaAPI.normalizeSubject(targetSubject, targetSubject)
            : targetSubject;

        // 1. Persist selection via BhashaAPI.setSelectedSubject (synchronizing localStorage and backend)
        if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
            try {
                await window.BhashaAPI.setSelectedSubject(norm, true);
            } catch (err) {
                console.warn("[Dashboard] Track switch backend sync notice:", err);
            }
        } else {
            localStorage.setItem("bhasha_chosen_language", norm);
            localStorage.setItem("bhasha_current_track", norm);
        }

        // 2. Navigate immediately to the matching subject dashboard
        window.location.href = `dashboard.html?subject=${encodeURIComponent(norm)}`;
    }

    function openTrackModal() {
        if (!trackModalOverlay) return;
        const active = currentActiveTrack || (window.BhashaAPI && window.BhashaAPI.getSelectedSubject ? window.BhashaAPI.getSelectedSubject() : "Python");
        updateModalOptionSelection(active);
        trackModalOverlay.style.display = "flex";
    }

    function closeTrackModalOverlay() {
        if (trackModalOverlay) {
            trackModalOverlay.style.display = "none";
        }
    }

    if (switchTrackBtn) {
        switchTrackBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openTrackModal();
        });
    }

    modalLangOptions.forEach(opt => {
        opt.addEventListener("click", function () {
            const clickedLang = opt.getAttribute("data-lang");
            updateModalOptionSelection(clickedLang);
            // Instant seamless switch on card click
            executeTrackSwitch(clickedLang);
        });
    });

    if (confirmTrackSwitch) {
        confirmTrackSwitch.addEventListener("click", function (e) {
            e.preventDefault();
            executeTrackSwitch(modalSelectedSubject);
        });
    }

    if (closeTrackModal) {
        closeTrackModal.addEventListener("click", function (e) {
            e.preventDefault();
            closeTrackModalOverlay();
        });
    }

    if (cancelTrackModal) {
        cancelTrackModal.addEventListener("click", function (e) {
            e.preventDefault();
            closeTrackModalOverlay();
        });
    }

    if (trackModalOverlay) {
        trackModalOverlay.addEventListener("click", function (e) {
            if (e.target === trackModalOverlay) {
                closeTrackModalOverlay();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && trackModalOverlay && trackModalOverlay.style.display === "flex") {
            closeTrackModalOverlay();
        }
    });

    // Initialize on page load
    loadPremiumMembershipData();

});