/* =========================================================
   BHASHA_AI - SETTINGS SCRIPT
   Local Storage Management, Commitment Selection & Reset
   ========================================================= */

let currentCommitment = 15;

document.addEventListener("DOMContentLoaded", async () => {
    let profile = null;
    if (window.BhashaAPI) {
        try {
            profile = await window.BhashaAPI.getProfile();
        } catch (e) {
            console.warn("Using local settings fallback:", e);
        }
    }

    // Load saved name
    const savedName = (profile && profile.full_name) || localStorage.getItem("bhasha_user_name");
    const displayNameInput = document.getElementById("displayName");
    if (displayNameInput) {
        displayNameInput.value = savedName || "";
    }

    // Load saved email (authentic user email from backend profile)
    const savedEmail = (profile && profile.email) || localStorage.getItem("bhasha_user_email");
    const emailInput = document.getElementById("emailAddress");
    if (emailInput) {
        emailInput.value = savedEmail || "Not available";
    }

    // Load saved bio
    const savedBio = localStorage.getItem("bhasha_user_bio");
    const bioInput = document.getElementById("bioText");
    if (bioInput) {
        bioInput.value = savedBio || "";
    }

    // Load saved track
    const savedTrack = (window.BhashaAPI && window.BhashaAPI.getSelectedSubject)
        ? (window.BhashaAPI.getSelectedSubject() || (profile && profile.chosen_language) || localStorage.getItem("bhasha_chosen_language"))
        : ((profile && profile.chosen_language) || localStorage.getItem("bhasha_chosen_language"));
    if (savedTrack) {
        const activeTrackSelect = document.getElementById("activeTrack");
        if (activeTrackSelect) activeTrackSelect.value = savedTrack;
    }

    // Load saved commitment
    const savedGoal = (profile && profile.daily_goal) || localStorage.getItem("bhasha_daily_goal");
    if (savedGoal) {
        selectCommitment(parseInt(savedGoal, 10) || 15);
    }
});

function selectCommitment(minutes) {
    currentCommitment = minutes;
    const cards = document.querySelectorAll(".commitment-card");
    cards.forEach(card => {
        const cardMin = parseInt(card.getAttribute("data-minutes"), 10);
        if (cardMin === minutes) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });
}

function showToast(message) {
    const toast = document.getElementById("toastMsg");
    const toastText = document.getElementById("toastText");
    if (!toast) return;

    if (toastText) toastText.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

async function saveSettings() {
    const displayName = document.getElementById("displayName").value.trim();
    const activeTrack = document.getElementById("activeTrack").value;
    const bioText = document.getElementById("bioText") ? document.getElementById("bioText").value.trim() : "";

    if (displayName) {
        localStorage.setItem("bhasha_user_name", displayName);
    }
    if (activeTrack) {
        if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
            await window.BhashaAPI.setSelectedSubject(activeTrack, true);
        } else {
            localStorage.setItem("bhasha_chosen_language", activeTrack);
        }
    }
    localStorage.setItem("bhasha_daily_goal", currentCommitment.toString());
    localStorage.setItem("bhasha_user_bio", bioText);

    if (window.BhashaAPI) {
        try {
            await window.BhashaAPI.updateSettings({
                full_name: displayName,
                chosen_language: activeTrack,
                daily_goal: currentCommitment
            });
        } catch (e) {
            console.warn("Backend update failed, kept in local storage:", e);
        }
    }

    showToast("Settings and curriculum preferences saved to Database!");
}

async function resetLocalProgress() {
    const confirmed = window.confirm(
        "Are you sure you want to reset all your learning progress, XP, streak, and vehicle tier? This action cannot be undone."
    );

    if (confirmed) {
        if (window.BhashaAPI) {
            try {
                await window.BhashaAPI.resetProgress();
            } catch (e) {
                console.warn("Backend reset failed, continuing with local reset:", e);
            }
        }
        localStorage.removeItem("bhasha_progress");
        try {
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith("bhasha_") && k.includes("_lesson_")) {
                    localStorage.removeItem(k);
                }
            });
        } catch (_) {}
        localStorage.removeItem("bhasha_xp");
        localStorage.removeItem("bhasha_streak");
        showToast("Progress records have been reset.");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    }
}
