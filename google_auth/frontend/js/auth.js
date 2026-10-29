/**
 * Google Authentication Client Controller
 * Interfaces with Google Identity Services (GSI) and FastAPI Backend.
 *
 * Modified to enforce explicit account selection:
 * - auto_select: false
 * - prompt: "select_account"
 * - Disables silent reuse of previously logged-in accounts
 * - Forces Google account picker to show all available accounts
 */

const API_BASE = (window.location.protocol !== "file:" && window.location.port === "8000")
    ? "/api"
    : "http://127.0.0.1:8000/api";

const DEMO_ACCOUNTS = [
    {
        name: "Dr. Sarah Jenkins",
        email: "scholar.demo@bhasha.ai",
        role: "Research Scholar",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    {
        name: "Alex Rivera",
        email: "alex.student@bhasha.ai",
        role: "Student",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
    },
    {
        name: "Prof. Priya Sharma",
        email: "priya.linguist@bhasha.ai",
        role: "AI Evaluator / Admin",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    }
];

const AuthApp = {
    tokenKey: "google_auth_token",
    userKey: "google_auth_user",
    googleClientId: "",

    init() {
        this.bindEvents();
        this.fetchConfigAndInitGSI();
        // REQUIREMENT: Do NOT silently reuse the last logged-in account on page load.
        // Always present the login view so the user explicitly selects an account.
    },

    bindEvents() {
        // Logout button
        document.getElementById("btnLogout")?.addEventListener("click", () => this.logout());

        // Instant Google Auth Tester: Shows the account picker instead of silent auto-login
        document.getElementById("btnDemoGoogle")?.addEventListener("click", () => {
            this.openAccountPickerModal();
        });

        // Modal close / cancel
        document.getElementById("btnCloseAccountPicker")?.addEventListener("click", () => {
            this.closeAccountPickerModal();
        });

        // "Use another account" toggle in modal
        document.getElementById("btnUseAnotherAccount")?.addEventListener("click", () => {
            const form = document.getElementById("customAccountForm");
            if (form) {
                form.style.display = (form.style.display === "none" || !form.style.display) ? "block" : "none";
            }
        });

        // Submit custom account in modal
        document.getElementById("btnSubmitCustomAccount")?.addEventListener("click", () => {
            const nameInput = document.getElementById("customAccountName");
            const emailInput = document.getElementById("customAccountEmail");
            const name = nameInput?.value.trim() || "Google Scholar";
            const email = emailInput?.value.trim();

            if (!email || !email.includes("@")) {
                this.showToast("Please enter a valid Google email address.", "error");
                return;
            }

            this.closeAccountPickerModal();
            this.handleCredentialResponse({
                credential: `demo_test_token_:${email}:${name}`
            });
        });
    },

    async fetchConfigAndInitGSI() {
        try {
            const res = await fetch(`${API_BASE}/auth/config`);
            if (res.ok) {
                const data = await res.json();
                this.googleClientId = data.google_client_id || "";
                this.initGoogleIdentityServices(this.googleClientId);
            }
        } catch (err) {
            console.warn("[AuthApp] Could not fetch server config:", err.message);
            // Fallback initialization
            this.initGoogleIdentityServices("");
        }
    },

    initGoogleIdentityServices(clientId) {
        if (typeof google === "undefined" || !google.accounts || !google.accounts.id) {
            console.log("[AuthApp] Waiting for Google Identity Services SDK...");
            setTimeout(() => this.initGoogleIdentityServices(clientId), 300);
            return;
        }

        // Default or configured Client ID
        const targetClientId = clientId || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

        try {
            // 1. Immediately disable automatic selection in Google Identity Services cookies
            google.accounts.id.disableAutoSelect();

            // 2. Initialize with explicit parameters:
            //    - auto_select: false  -> Disables automatic sign-in
            //    - prompt: "select_account" -> Forces Google account selection picker
            google.accounts.id.initialize({
                client_id: targetClientId,
                callback: (response) => this.handleCredentialResponse(response),
                auto_select: false,
                prompt: "select_account",
                cancel_on_tap_outside: true
            });

            // 3. Confirm disableAutoSelect state to prevent any automatic sign-in loop
            google.accounts.id.disableAutoSelect();

            // 4. Render the official Google Sign-In button
            const btnContainer = document.getElementById("googleButtonDiv");
            if (btnContainer) {
                btnContainer.innerHTML = "";
                google.accounts.id.renderButton(btnContainer, {
                    theme: "filled_black",
                    size: "large",
                    shape: "pill",
                    text: "signin_with",
                    logo_alignment: "left",
                    width: 320
                });
            }

            // 5. Bind custom "Sign in with Google" button to force account selection
            const customBtn = document.getElementById("btnCustomGoogle");
            if (customBtn) {
                // Clone button to remove any stale event listeners
                const newBtn = customBtn.cloneNode(true);
                customBtn.parentNode.replaceChild(newBtn, customBtn);

                newBtn.addEventListener("click", () => {
                    // Always disable auto-select before triggering sign-in prompt
                    google.accounts.id.disableAutoSelect();

                    if (!targetClientId || targetClientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
                        // In local dev/testing without Google Client ID: show account picker modal
                        this.openAccountPickerModal();
                    } else {
                        // Display Google prompt with account selection forced
                        google.accounts.id.prompt((notification) => {
                            if (notification.isNotDisplayed()) {
                                console.warn("[AuthApp] Prompt not displayed:", notification.getNotDisplayedReason?.());
                            }
                        });
                    }
                });
            }

        } catch (e) {
            console.error("[AuthApp] GSI initialization error:", e);
        }
    },

    openAccountPickerModal() {
        const modal = document.getElementById("accountPickerModal");
        const listContainer = document.getElementById("accountPickerList");
        if (!modal || !listContainer) return;

        // Render available accounts
        listContainer.innerHTML = DEMO_ACCOUNTS.map(acc => `
            <div class="account-picker-item" data-email="${escapeHTML(acc.email)}" data-name="${escapeHTML(acc.name)}">
                <img class="account-picker-avatar" src="${escapeHTML(acc.avatar)}" alt="${escapeHTML(acc.name)}">
                <div class="account-picker-info">
                    <div class="account-picker-name">${escapeHTML(acc.name)}</div>
                    <div class="account-picker-email">${escapeHTML(acc.email)}</div>
                </div>
                <span class="account-picker-role">${escapeHTML(acc.role)}</span>
            </div>
        `).join("");

        // Attach click listener to each account
        listContainer.querySelectorAll(".account-picker-item").forEach(el => {
            el.addEventListener("click", () => {
                const email = el.getAttribute("data-email");
                const name = el.getAttribute("data-name");
                this.closeAccountPickerModal();
                this.handleCredentialResponse({
                    credential: `demo_test_token_:${email}:${name}`
                });
            });
        });

        // Reset custom input form
        const form = document.getElementById("customAccountForm");
        if (form) form.style.display = "none";

        modal.style.display = "flex";
    },

    closeAccountPickerModal() {
        const modal = document.getElementById("accountPickerModal");
        if (modal) modal.style.display = "none";
    },

    async handleCredentialResponse(response) {
        const idToken = response.credential;
        if (!idToken) {
            this.showToast("No Google credential returned.", "error");
            return;
        }

        this.setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: idToken })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Authentication verification failed.");
            }

            // Save JWT session token and user info for the active session
            localStorage.setItem(this.tokenKey, data.access_token);
            localStorage.setItem(this.userKey, JSON.stringify(data.user));

            this.showToast(data.message || "Signed in with Google successfully!", "success");
            this.renderUserProfile(data.user);

        } catch (err) {
            this.showToast(err.message || "Failed to authenticate with Google.", "error");
        } finally {
            this.setLoading(false);
        }
    },

    renderUserProfile(user) {
        document.getElementById("loginView").style.display = "none";
        const profileView = document.getElementById("profileView");
        profileView.style.display = "block";

        document.getElementById("userAvatar").src = user.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        document.getElementById("userName").textContent = user.full_name || "Scholar";
        document.getElementById("userEmail").textContent = user.email || "";
        document.getElementById("userRoleTag").textContent = (user.role || "student").toUpperCase();
        document.getElementById("metaGoogleId").textContent = user.google_id ? `${user.google_id.slice(0, 14)}...` : "--";
        document.getElementById("metaRole").textContent = (user.role || "student").toUpperCase();
        document.getElementById("metaLastLogin").textContent = user.last_login ? new Date(user.last_login).toLocaleString() : "Just now";
        document.getElementById("metaCreatedAt").textContent = user.created_at ? new Date(user.created_at).toLocaleDateString() : "--";
    },

    async logout() {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } catch (_) {}
        }

        this.clearSession();

        // Disable automatic sign-in in Google Identity Services so the next login presents account choice
        if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }

        document.getElementById("profileView").style.display = "none";
        document.getElementById("loginView").style.display = "block";
        this.showToast("Signed out successfully. Account selection required for next login.", "info");
    },

    clearSession() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    },

    setLoading(isLoading) {
        const overlay = document.getElementById("loadingOverlay");
        if (overlay) overlay.style.display = isLoading ? "flex" : "none";
    },

    showToast(message, type = "info") {
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
        }, 3600);
    }
};

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", () => AuthApp.init());
