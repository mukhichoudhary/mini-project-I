/* =========================================================
   BHASHA_AI - LEADERBOARD SCRIPT (REAL DATA SYNC)
   Synchronized with FastAPI backend and SQLite database
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const filterBtns = document.querySelectorAll(".filter-btn");
    const searchInput = document.getElementById("searchLearner");
    const tbody = document.getElementById("rankingTableBody");

    const trackIcons = { Python: "🐍", Java: "☕", "C++": "⚙️", English: "🇬🇧" };
    let currentFilter = "all";
    let allEntries = [];
    let currentUserProfile = null;
    let currentUserStats = {
        xp: "0 XP",
        streak: "0 Days",
        level: "Level 1",
        accuracy: "—",
        lessons: "0 Lessons",
        rank: "Unranked"
    };

    // 1. Load authenticated user profile
    if (window.BhashaAPI) {
        try {
            currentUserProfile = await window.BhashaAPI.getProfile();
        } catch (e) {
            console.warn("[Leaderboard] Backend profile sync failed:", e);
        }
    }

    const name = (currentUserProfile && currentUserProfile.full_name) || localStorage.getItem("bhasha_user_name") || "Scholar";
    const xp = (currentUserProfile && currentUserProfile.total_xp !== undefined) ? currentUserProfile.total_xp : parseInt(localStorage.getItem("bhasha_xp") || "0", 10);
    const streak = (currentUserProfile && currentUserProfile.streak_days !== undefined) ? currentUserProfile.streak_days : parseInt(localStorage.getItem("bhasha_streak") || "0", 10);
    const level = (currentUserProfile && currentUserProfile.current_level) || Math.max(1, Math.floor(xp / 300));

    // Update Topbar Stats
    const topStreak = document.getElementById("topStreak");
    if (topStreak) topStreak.textContent = streak;
    const sidebarStreakText = document.getElementById("sidebarStreakText");
    if (sidebarStreakText) sidebarStreakText.textContent = `${streak} Day Streak`;
    const topXp = document.getElementById("topXp");
    if (topXp) topXp.textContent = `${xp.toLocaleString()} XP`;
    const topAvatar = document.getElementById("topAvatar");
    if (topAvatar) topAvatar.textContent = (name || "S").charAt(0).toUpperCase();
    const learnerName = document.getElementById("learnerName");
    if (learnerName) learnerName.textContent = name;

    // Load user's lesson progress for honest personal accuracy & lesson counts
    let myProgress = [];
    if (window.BhashaAPI) {
        try {
            myProgress = await window.BhashaAPI.getLessonProgress();
        } catch (_) {}
    }
    const myCompletedLessons = (myProgress || []).filter(p => Boolean(p.completed)).length;
    let myTotalScore = 0;
    let myTotalQuestions = 0;
    (myProgress || []).forEach(p => {
        if (p.total_questions && p.total_questions > 0) {
            myTotalScore += (p.score || 0);
            myTotalQuestions += p.total_questions;
        }
    });
    const myAccuracy = myTotalQuestions > 0 ? `${Math.round((myTotalScore / myTotalQuestions) * 100)}%` : "—";

    currentUserStats = {
        xp: `${xp.toLocaleString()} XP`,
        streak: `${streak} Days`,
        level: `Level ${level}`,
        accuracy: myAccuracy,
        lessons: `${myCompletedLessons} Lessons`,
        rank: "Unranked"
    };

    // 2. Fetch and render genuine leaderboard
    async function loadLeaderboard(trackFilter = "all") {
        if (!window.BhashaAPI) return;
        try {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--c-sage);">
                        Loading authentic rankings...
                    </td>
                </tr>
            `;

            const data = await window.BhashaAPI.getLeaderboard(trackFilter);
            allEntries = Array.isArray(data) ? data : [];

            // Update user standing in header & status pill
            const myEntry = allEntries.find(e => e.is_current_user);
            const learnerRankDesc = document.getElementById("learnerRankDesc");
            const leagueUserStatus = document.getElementById("leagueUserStatus");

            if (myEntry) {
                currentUserStats.rank = `Rank #${myEntry.rank}`;
                currentUserStats.xp = `${myEntry.xp.toLocaleString()} XP`;
                currentUserStats.streak = `${myEntry.streak} Days`;
                currentUserStats.level = `Level ${myEntry.level}`;
                if (myEntry.accuracy !== null && myEntry.accuracy !== undefined) {
                    currentUserStats.accuracy = `${myEntry.accuracy}%`;
                }
                if (myEntry.completed_lessons !== undefined) {
                    currentUserStats.lessons = `${myEntry.completed_lessons} Lessons`;
                }

                if (learnerRankDesc) learnerRankDesc.textContent = `Rank #${myEntry.rank} • Premier Division`;
                if (leagueUserStatus) {
                    leagueUserStatus.textContent = myEntry.rank <= 5
                        ? `Promotion Zone (Rank #${myEntry.rank})`
                        : `Division Standing (Rank #${myEntry.rank})`;
                }
            } else {
                if (learnerRankDesc) learnerRankDesc.textContent = `Rank — • Premier Division`;
                if (leagueUserStatus) leagueUserStatus.textContent = `Unranked Scholar`;
            }

            renderPodium(allEntries);
            renderTable(allEntries);
        } catch (e) {
            console.error("[Leaderboard] Error fetching leaderboard:", e);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--c-coral);">
                        Could not load leaderboard data. Please check your connection.
                    </td>
                </tr>
            `;
            renderPodium([]);
        }
    }

    // 3. Render Top-3 Podium from genuine rankings
    function renderPodium(entries) {
        const top1 = entries[0] || null;
        const top2 = entries[1] || null;
        const top3 = entries[2] || null;

        // Slot 1 (Gold / First)
        populatePodiumSlot("First", 1, top1);
        // Slot 2 (Silver / Second)
        populatePodiumSlot("Second", 2, top2);
        // Slot 3 (Bronze / Third)
        populatePodiumSlot("Third", 3, top3);
    }

    function populatePodiumSlot(suffix, rankNum, entry) {
        const avatarEl = document.getElementById(`podiumAvatar${rankNum}`);
        const nameEl = document.getElementById(`podiumName${rankNum}`);
        const trackEl = document.getElementById(`podiumTrack${rankNum}`);
        const xpEl = document.getElementById(`podiumXp${rankNum}`);
        const tagEl = document.getElementById(`podiumTag${rankNum}`);
        const cardEl = document.getElementById(`podiumCard${suffix}`);

        if (!entry) {
            if (avatarEl) avatarEl.textContent = "—";
            if (nameEl) nameEl.textContent = "Awaiting Scholar";
            if (trackEl) trackEl.textContent = "—";
            if (xpEl) xpEl.textContent = "0 XP";
            if (tagEl) tagEl.textContent = `Rank #${rankNum}`;
            if (cardEl) cardEl.style.opacity = "0.5";
            return;
        }

        if (cardEl) cardEl.style.opacity = "1";
        if (avatarEl) avatarEl.textContent = (entry.name || "S").charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = entry.name + (entry.is_current_user ? " (You)" : "");
        if (trackEl) trackEl.textContent = `${trackIcons[entry.track] || "🌿"} ${entry.track} Track`;
        if (xpEl) xpEl.textContent = `⚡ ${entry.xp.toLocaleString()} XP`;
        if (tagEl) {
            const accText = entry.accuracy !== null && entry.accuracy !== undefined ? ` • ${entry.accuracy}% Acc` : "";
            tagEl.textContent = `Level ${entry.level}${accText}`;
        }
    }

    // 4. Render Table Rows from genuine rankings
    function renderTable(entries) {
        if (!entries || entries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 48px; color: var(--c-sage);">
                        No scholars registered in this division yet. Start learning to lead the leaderboard!
                    </td>
                </tr>
            `;
            return;
        }

        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const filtered = entries.filter(item => {
            if (!query) return true;
            return item.name.toLowerCase().includes(query) || item.track.toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--c-sage);">
                        No scholars match "${query}".
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map((item, index) => {
            const icon = trackIcons[item.track] || "🌿";
            const isMe = Boolean(item.is_current_user);
            const rowClass = isMe ? "user-row highlight" : "";
            const avatarLetter = (item.name || "S").charAt(0).toUpperCase();
            let rankDisplay = `#${item.rank}`;
            if (item.rank === 1) rankDisplay = `<span class="medal-icon">🥇</span> 1`;
            else if (item.rank === 2) rankDisplay = `<span class="medal-icon">🥈</span> 2`;
            else if (item.rank === 3) rankDisplay = `<span class="medal-icon">🥉</span> 3`;

            const accuracyDisplay = (item.accuracy !== null && item.accuracy !== undefined)
                ? `${item.accuracy}%`
                : "—";

            return `
                <tr class="${rowClass}" data-track="${item.track.toLowerCase()}" data-name="${item.name.toLowerCase()}">
                    <td class="rank-col">${rankDisplay}</td>
                    <td>
                        <div class="learner-cell">
                            <div class="learner-avatar ${isMe ? 'current-user-avatar' : ''}">${avatarLetter}</div>
                            <div class="learner-name">
                                <strong>${item.name} ${isMe ? "(You)" : ""}</strong>
                                <small>Level ${item.level} Scholar</small>
                            </div>
                        </div>
                    </td>
                    <td><span class="track-badge">${icon} ${item.track}</span></td>
                    <td class="xp-cell">${item.xp.toLocaleString()} XP</td>
                    <td class="streak-cell">🔥 ${item.streak} Days</td>
                    <td><span class="vehicle-cell">⚡ Level ${item.level}</span></td>
                    <td class="accuracy-cell">${accuracyDisplay}</td>
                    <td class="action-cell">
                        ${isMe
                            ? '<span class="you-tag">Your Standing</span>'
                            : `<button class="compare-btn" data-rank="${item.rank}">Compare</button>`}
                    </td>
                </tr>
            `;
        }).join("");

        // Attach compare button click handlers
        tbody.querySelectorAll(".compare-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const rank = Number(btn.getAttribute("data-rank"));
                const peer = allEntries.find(e => e.rank === rank);
                if (peer) {
                    openCompareModalWithPeer(peer);
                }
            });
        });
    }

    // 5. Head-to-Head Compare Modal with Real Data
    function openCompareModalWithPeer(peer) {
        const overlay = document.getElementById("compareModalOverlay");
        if (!overlay) return;

        // Current User (YOU)
        const modalMyAvatar = document.getElementById("modalMyAvatar");
        if (modalMyAvatar) modalMyAvatar.textContent = (name || "S").charAt(0).toUpperCase();
        const modalMyName = document.getElementById("modalMyName");
        if (modalMyName) modalMyName.textContent = `${name} (You)`;
        const modalMyRank = document.getElementById("modalMyRank");
        if (modalMyRank) modalMyRank.textContent = `${currentUserStats.rank} • Level ${level}`;

        const myMetricXP = document.getElementById("myMetricXP");
        if (myMetricXP) myMetricXP.textContent = currentUserStats.xp;
        const myMetricStreak = document.getElementById("myMetricStreak");
        if (myMetricStreak) myMetricStreak.textContent = currentUserStats.streak;
        const myMetricVehicle = document.getElementById("myMetricVehicle");
        if (myMetricVehicle) myMetricVehicle.textContent = currentUserStats.level;
        const myMetricAccuracy = document.getElementById("myMetricAccuracy");
        if (myMetricAccuracy) myMetricAccuracy.textContent = currentUserStats.accuracy;
        const myMetricLessons = document.getElementById("myMetricLessons");
        if (myMetricLessons) myMetricLessons.textContent = currentUserStats.lessons;

        // Target Peer
        const modalPeerAvatar = document.getElementById("modalPeerAvatar");
        if (modalPeerAvatar) modalPeerAvatar.textContent = (peer.name || "S").charAt(0).toUpperCase();
        const modalPeerName = document.getElementById("modalPeerName");
        if (modalPeerName) modalPeerName.textContent = peer.name;
        const modalPeerRank = document.getElementById("modalPeerRank");
        if (modalPeerRank) modalPeerRank.textContent = `Rank #${peer.rank} • ${peer.track} Track`;

        const peerMetricXP = document.getElementById("peerMetricXP");
        if (peerMetricXP) peerMetricXP.textContent = `${peer.xp.toLocaleString()} XP`;
        const peerMetricStreak = document.getElementById("peerMetricStreak");
        if (peerMetricStreak) peerMetricStreak.textContent = `${peer.streak} Days`;
        const peerMetricVehicle = document.getElementById("peerMetricVehicle");
        if (peerMetricVehicle) peerMetricVehicle.textContent = `Level ${peer.level}`;
        const peerMetricAccuracy = document.getElementById("peerMetricAccuracy");
        if (peerMetricAccuracy) {
            peerMetricAccuracy.textContent = (peer.accuracy !== null && peer.accuracy !== undefined)
                ? `${peer.accuracy}%`
                : "—";
        }
        const peerMetricLessons = document.getElementById("peerMetricLessons");
        if (peerMetricLessons) {
            peerMetricLessons.textContent = `${peer.completed_lessons} Lessons`;
        }

        overlay.classList.add("open");
    }

    window.closeCompareModal = function() {
        const overlay = document.getElementById("compareModalOverlay");
        if (overlay) overlay.classList.remove("open");
    };

    // Filter Buttons Click
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter") || "all";
            loadLeaderboard(currentFilter);
        });
    });

    // Live search input
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderTable(allEntries);
        });
    }

    // Modal background click close
    document.addEventListener("click", (e) => {
        const overlay = document.getElementById("compareModalOverlay");
        if (overlay && e.target === overlay) {
            window.closeCompareModal();
        }
    });

    // Initial load
    loadLeaderboard("all");

});
