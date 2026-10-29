/**
 * LingoX - Authentication System Client
 * AI-Based Natural & Programming Language Proficiency System
 * Email & Password Authentication + 6-Digit Email OTP 2FA Verification
 */

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // DOM ELEMENTS
    // =========================================
    const authCard = document.getElementById("authCard");
    const loginViewContainer = document.getElementById("loginViewContainer");
    const otpViewContainer = document.getElementById("otpViewContainer");
    const otpSuccessOverlay = document.getElementById("otpSuccessOverlay");

    // Login View Elements
    const tabSignIn = document.getElementById("tabSignIn");
    const tabSignUp = document.getElementById("tabSignUp");
    const authMainTitle = document.getElementById("authMainTitle");
    const authSubTitle = document.getElementById("authSubTitle");
    const loginAlert = document.getElementById("loginAlert");
    const loginAlertText = document.getElementById("loginAlertText");
    const emailLoginForm = document.getElementById("emailLoginForm");
    const groupFullName = document.getElementById("groupFullName");
    const inputFullName = document.getElementById("inputFullName");
    const inputEmail = document.getElementById("inputEmail");
    const inputPassword = document.getElementById("inputPassword");
    const btnTogglePassword = document.getElementById("btnTogglePassword");
    const btnSubmitEmail = document.getElementById("btnSubmitEmail");
    const btnSubmitText = document.getElementById("btnSubmitText");
    const linkForgotPassword = document.getElementById("linkForgotPassword");
    const linkSwitchMode = document.getElementById("linkSwitchMode");
    const footerToggleText = document.getElementById("footerToggleText");


    // OTP Verification View Elements
    const otpTargetEmail = document.getElementById("otpTargetEmail");
    const otpAvatar = document.getElementById("otpAvatar");
    const btnBackToLogin = document.getElementById("btnBackToLogin");
    const otpAlert = document.getElementById("otpAlert");
    const otpAlertText = document.getElementById("otpAlertText");
    const otpBoxesGrid = document.getElementById("otpBoxesGrid");
    const otpInputs = Array.from(document.querySelectorAll(".otp-digit-input"));
    const otpTimerBadge = document.getElementById("otpTimerBadge");
    const otpTimerText = document.getElementById("otpTimerText");
    const btnResendOtp = document.getElementById("btnResendOtp");
    const resendText = document.getElementById("resendText");
    const resendCooldown = document.getElementById("resendCooldown");
    const btnVerifyOtp = document.getElementById("btnVerifyOtp");
    const btnVerifyText = document.getElementById("btnVerifyText");

    // State Variables
    let isSignUpMode = false;
    let currentAuthSession = {
        email: "",
        fullName: "",
        picture: "",
        tempToken: null
    };

    let otpExpiryTimer = null;
    let otpSecondsRemaining = 300; // 5 minutes
    let resendCooldownTimer = null;
    let resendSecondsRemaining = 60;


    // Check if redirected after sign out or with subject parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedLangParam = urlParams.get("lang") || urlParams.get("subject") || urlParams.get("track");
    let initialSubject = null;
    if (window.BhashaAPI && window.BhashaAPI.normalizeSubject) {
        initialSubject = window.BhashaAPI.normalizeSubject(selectedLangParam, null);
    }
    if (initialSubject) {
        localStorage.setItem("bhasha_chosen_language", initialSubject);
    }

    if (urlParams.get("logout") === "true") {
        if (window.BhashaAPI) window.BhashaAPI.logout();
        showAlert(loginAlert, loginAlertText, "You have been signed out successfully.", "success");
    }

    // Check if password reset token was provided on login page
    if (urlParams.get("token")) {
        window.location.replace(`reset-password.html?token=${encodeURIComponent(urlParams.get("token"))}`);
        return;
    }


    // =========================================
    // AUTH TAB SWITCHING (SIGN IN / SIGN UP)
    // =========================================
    function setAuthMode(signUp) {
        isSignUpMode = signUp;
        hideAlert(loginAlert);

        if (isSignUpMode) {
            tabSignIn.classList.remove("active");
            tabSignUp.classList.add("active");
            authMainTitle.textContent = "Create Account";
            authSubTitle.textContent = "Start your adaptive AI language & coding journey.";
            groupFullName.style.display = "block";
            btnSubmitText.textContent = "Create Academy Account";
            footerToggleText.innerHTML = 'Already have an account? <a href="#" id="linkSwitchToSignIn">Sign in here</a>';
        } else {
            tabSignUp.classList.remove("active");
            tabSignIn.classList.add("active");
            authMainTitle.textContent = "Welcome Back";
            authSubTitle.textContent = "Sign in to your personalized AI learning workspace.";
            groupFullName.style.display = "none";
            btnSubmitText.textContent = "Enter Academy";
            footerToggleText.innerHTML = 'New to LingoX? <a href="#" id="linkSwitchToSignUp">Create an account</a>';
        }

        // Reattach dynamic link listeners
        const linkSignIn = document.getElementById("linkSwitchToSignIn");
        if (linkSignIn) linkSignIn.addEventListener("click", (e) => { e.preventDefault(); setAuthMode(false); });

        const linkSignUp = document.getElementById("linkSwitchToSignUp");
        if (linkSignUp) linkSignUp.addEventListener("click", (e) => { e.preventDefault(); setAuthMode(true); });
    }

    tabSignIn.addEventListener("click", () => setAuthMode(false));
    tabSignUp.addEventListener("click", () => setAuthMode(true));
    linkSwitchMode.addEventListener("click", (e) => {
        e.preventDefault();
        setAuthMode(!isSignUpMode);
    });

    // Toggle Password Visibility
    btnTogglePassword.addEventListener("click", function () {
        const isPassword = inputPassword.type === "password";
        inputPassword.type = isPassword ? "text" : "password";
        this.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    });

    // Forgot Password
    linkForgotPassword.addEventListener("click", async function (e) {
        e.preventDefault();
        hideAlert(loginAlert);
        const email = inputEmail.value.trim();
        if (!email || !email.includes("@")) {
            showAlert(loginAlert, loginAlertText, "Please enter your email address in the field below to request password assistance.", "error");
            inputEmail.focus();
            return;
        }

        linkForgotPassword.style.pointerEvents = "none";
        const origText = linkForgotPassword.textContent;
        linkForgotPassword.textContent = "Checking...";

        try {
            let res;
            if (window.BhashaAPI && window.BhashaAPI.forgotPassword) {
                res = await window.BhashaAPI.forgotPassword(email);
            } else {
                const base = (window.BhashaAPI && window.BhashaAPI.getApiBase) ? window.BhashaAPI.getApiBase() : "http://127.0.0.1:8000/api";
                const response = await fetch(`${base}/auth/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                res = await response.json();
            }

            if (res && res.status === "unavailable") {
                showAlert(loginAlert, loginAlertText, `<i class="bi bi-info-circle-fill" style="margin-right: 6px;"></i> ${res.message}`, "error");
            } else if (res && res.status === "success") {
                showAlert(loginAlert, loginAlertText, `<i class="bi bi-check-circle-fill" style="margin-right: 6px;"></i> ${res.message}`, "success");
            } else if (res && (res.status === "rate_limited" || res.status === "error")) {
                showAlert(loginAlert, loginAlertText, `<i class="bi bi-exclamation-triangle-fill" style="margin-right: 6px;"></i> ${res.message}`, "error");
            } else {
                showAlert(loginAlert, loginAlertText, (res && res.message) ? res.message : "Password recovery request processed.", "info");
            }
        } catch (err) {
            showAlert(loginAlert, loginAlertText, formatErrorMessage(err, "Could not process password recovery request."), "error");
        } finally {
            linkForgotPassword.style.pointerEvents = "auto";
            linkForgotPassword.textContent = origText;
        }
    });


    // =========================================
    // STANDARD EMAIL/PASSWORD SUBMIT
    // =========================================
    emailLoginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        hideAlert(loginAlert);

        const email = inputEmail.value.trim();
        const password = inputPassword.value;
        const fullName = inputFullName.value.trim();

        if (!email) {
            showAlert(loginAlert, loginAlertText, "Please enter your email address.", "error");
            inputEmail.focus();
            return;
        }

        if (!password) {
            showAlert(loginAlert, loginAlertText, "Please enter your password.", "error");
            inputPassword.focus();
            return;
        }

        if (isSignUpMode) {
            if (password.length < 6) {
                showAlert(loginAlert, loginAlertText, "Password must be at least 6 characters long.", "error");
                inputPassword.focus();
                return;
            }
            if (!fullName) {
                showAlert(loginAlert, loginAlertText, "Please enter your full name.", "error");
                inputFullName.focus();
                return;
            }
        }

        btnSubmitEmail.disabled = true;
        btnSubmitText.textContent = isSignUpMode ? "Creating Account..." : "Signing in...";

        try {
            const chosenLang = initialSubject ||
                (window.BhashaAPI && window.BhashaAPI.getSelectedSubject ? window.BhashaAPI.getSelectedSubject() : null) ||
                localStorage.getItem("bhasha_chosen_language") || "Python";

            if (isSignUpMode) {
                await window.BhashaAPI.register({
                    email,
                    password,
                    full_name: fullName,
                    chosen_language: chosenLang,
                    daily_goal: 15
                });
                showAlert(loginAlert, loginAlertText, "Account created successfully! Launching workspace...", "success");
            } else {
                const loginRes = await window.BhashaAPI.login({ email, password });

                // If authenticated account is an administrator, store admin session and redirect to admin dashboard
                if (loginRes && loginRes.user && loginRes.user.role === "admin") {
                    if (loginRes.access_token) {
                        localStorage.setItem("bhasha_admin_token", loginRes.access_token);
                    }
                    localStorage.setItem("bhasha_admin_user", JSON.stringify(loginRes.user));
                    showAlert(loginAlert, loginAlertText, "Administrator verified! Launching Admin Control Center...", "success");
                    setTimeout(() => {
                        window.location.href = "admin.html";
                    }, 800);
                    return;
                }

                const targetSubject = chosenLang || (loginRes && loginRes.user && loginRes.user.chosen_language) || "Python";
                if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
                    await window.BhashaAPI.setSelectedSubject(targetSubject, true);
                }
                showAlert(loginAlert, loginAlertText, "Login successful! Launching workspace...", "success");
            }

            setTimeout(() => {
                const redirectParam = urlParams.get("redirect");
                const currentSubj = (window.BhashaAPI && window.BhashaAPI.getSelectedSubject)
                    ? window.BhashaAPI.getSelectedSubject()
                    : (localStorage.getItem("bhasha_chosen_language") || "Python");
                if (redirectParam) {
                    window.location.href = redirectParam;
                } else {
                    window.location.href = `dashboard.html?subject=${encodeURIComponent(currentSubj)}`;
                }
            }, 800);

        } catch (err) {
            showAlert(loginAlert, loginAlertText, formatErrorMessage(err, isSignUpMode ? "Registration failed." : "Authentication failed."), "error");
            btnSubmitEmail.disabled = false;
            btnSubmitText.textContent = isSignUpMode ? "Create Academy Account" : "Enter Academy";
        }
    });

    // =========================================
    // TRANSITION TO OTP VERIFICATION VIEW
    // =========================================
    function transitionToOTPView(data) {
        loginViewContainer.style.display = "none";
        otpViewContainer.style.display = "block";

        otpTargetEmail.textContent = currentAuthSession.email;
        otpAvatar.src = currentAuthSession.picture;

        // Reset inputs
        clearOtpBoxes();
        hideAlert(otpAlert);

        // Start 5-minute expiry countdown
        startOtpExpiryCountdown(data.expires_in_seconds || 300);

        // Start 60s resend cooldown
        startResendCooldown();

        // Show dev OTP preview if present (unconfigured SMTP dev environment)
        const devOtpBox = document.getElementById("devOtpBox");
        const devOtpCode = document.getElementById("devOtpCode");
        if (data && data.dev_otp_preview && devOtpBox && devOtpCode) {
            devOtpBox.style.display = "block";
            devOtpCode.textContent = data.dev_otp_preview;
        } else if (devOtpBox) {
            devOtpBox.style.display = "none";
        }

        // Focus first box
        setTimeout(() => otpInputs[0].focus(), 150);
    }

    // Switch account / back to login
    btnBackToLogin.addEventListener("click", function () {
        clearInterval(otpExpiryTimer);
        clearInterval(resendCooldownTimer);
        otpViewContainer.style.display = "none";
        loginViewContainer.style.display = "block";
    });

    // =========================================
    // 6-DIGIT OTP INPUT BEHAVIOR (BOXES)
    // =========================================
    otpInputs.forEach((input, index) => {

        // Auto-focus next box on typing a single digit
        input.addEventListener("input", function (e) {
            const val = this.value.replace(/[^0-9]/g, "");
            this.value = val ? val[val.length - 1] : "";

            if (this.value) {
                this.classList.add("filled");
                this.classList.remove("error");

                // Advance to next box
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                } else {
                    // Last box filled: auto-submit verification
                    const completeCode = getEnteredOtp();
                    if (completeCode.length === 6) {
                        verifyEnteredOTP();
                    }
                }
            } else {
                this.classList.remove("filled");
            }
        });

        // Keydown navigation (Backspace, Left/Right arrows)
        input.addEventListener("keydown", function (e) {
            if (e.key === "Backspace") {
                if (!this.value && index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].value = "";
                    otpInputs[index - 1].classList.remove("filled");
                } else {
                    this.value = "";
                    this.classList.remove("filled");
                }
            } else if (e.key === "ArrowLeft" && index > 0) {
                e.preventDefault();
                otpInputs[index - 1].focus();
            } else if (e.key === "ArrowRight" && index < otpInputs.length - 1) {
                e.preventDefault();
                otpInputs[index + 1].focus();
            }
        });

        // Full Paste Support: user pastes 6 digits into any box
        input.addEventListener("paste", function (e) {
            e.preventDefault();
            const clipboardData = (e.clipboardData || window.clipboardData).getData("text");
            const cleanDigits = clipboardData.replace(/[^0-9]/g, "").slice(0, 6);

            if (cleanDigits.length > 0) {
                fillOtpBoxes(cleanDigits);

                // If complete 6 digits pasted, automatically verify!
                if (cleanDigits.length === 6) {
                    verifyEnteredOTP();
                } else {
                    // Focus next unfilled box
                    const nextIdx = Math.min(cleanDigits.length, 5);
                    otpInputs[nextIdx].focus();
                }
            }
        });

        // Clear error style on focus
        input.addEventListener("focus", function () {
            this.classList.remove("error");
            this.select();
        });
    });

    function fillOtpBoxes(code) {
        clearOtpBoxes();
        for (let i = 0; i < code.length && i < 6; i++) {
            otpInputs[i].value = code[i];
            otpInputs[i].classList.add("filled");
        }
    }

    function clearOtpBoxes() {
        otpInputs.forEach(inp => {
            inp.value = "";
            inp.classList.remove("filled", "error");
            inp.disabled = false;
        });
    }

    function getEnteredOtp() {
        return otpInputs.map(inp => inp.value.trim()).join("");
    }

    // =========================================
    // COUNTDOWN TIMER (05:00)
    // =========================================
    function startOtpExpiryCountdown(seconds) {
        clearInterval(otpExpiryTimer);
        otpSecondsRemaining = seconds;

        updateTimerDisplay();

        otpExpiryTimer = setInterval(() => {
            otpSecondsRemaining--;
            updateTimerDisplay();

            if (otpSecondsRemaining <= 0) {
                clearInterval(otpExpiryTimer);
                handleOtpExpired();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const mins = Math.floor(otpSecondsRemaining / 60);
        const secs = otpSecondsRemaining % 60;
        const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        otpTimerText.textContent = formatted;

        if (otpSecondsRemaining <= 60 && otpSecondsRemaining > 0) {
            otpTimerBadge.classList.add("warning");
            otpTimerBadge.classList.remove("expired");
        } else if (otpSecondsRemaining <= 0) {
            otpTimerBadge.classList.remove("warning");
            otpTimerBadge.classList.add("expired");
        } else {
            otpTimerBadge.classList.remove("warning", "expired");
        }
    }

    function handleOtpExpired() {
        otpTimerText.textContent = "Expired";
        showAlert(otpAlert, otpAlertText, "OTP code has expired. Please click Resend Code to obtain a new OTP.", "error");
        otpInputs.forEach(inp => inp.disabled = true);
        btnVerifyOtp.disabled = true;
    }

    // =========================================
    // RESEND OTP BUTTON & COOLDOWN
    // =========================================
    function startResendCooldown() {
        clearInterval(resendCooldownTimer);
        resendSecondsRemaining = 60;
        btnResendOtp.disabled = true;

        updateResendDisplay();

        resendCooldownTimer = setInterval(() => {
            resendSecondsRemaining--;
            updateResendDisplay();

            if (resendSecondsRemaining <= 0) {
                clearInterval(resendCooldownTimer);
                btnResendOtp.disabled = false;
                resendText.textContent = "Resend Code";
            }
        }, 1000);
    }

    function updateResendDisplay() {
        if (resendSecondsRemaining > 0) {
            resendText.innerHTML = `Resend (<span id="resendCooldown">${resendSecondsRemaining}s</span>)`;
        }
    }

    btnResendOtp.addEventListener("click", async function () {
        if (btnResendOtp.disabled) return;

        btnResendOtp.disabled = true;
        resendText.textContent = "Sending...";
        hideAlert(otpAlert);

        try {
            let res;
            if (window.BhashaAPI && window.BhashaAPI.resendOTP) {
                res = await window.BhashaAPI.resendOTP(currentAuthSession.email, currentAuthSession.fullName);
            } else {
                const base = (window.BhashaAPI && window.BhashaAPI.getApiBase) ? window.BhashaAPI.getApiBase() : "http://127.0.0.1:8000/api";
                const response = await fetch(`${base}/auth/resend-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentAuthSession.email, name: currentAuthSession.fullName })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || "Failed to resend verification code.");
                }
                res = await response.json();
            }

            showAlert(otpAlert, otpAlertText, "A new 6-digit code has been dispatched to your email!", "success");

            if (res && res.dev_otp_preview) {
                const devOtpBox = document.getElementById("devOtpBox");
                const devOtpCode = document.getElementById("devOtpCode");
                if (devOtpBox && devOtpCode) {
                    devOtpBox.style.display = "block";
                    devOtpCode.textContent = res.dev_otp_preview;
                }
            }

            clearOtpBoxes();
            btnVerifyOtp.disabled = false;
            startOtpExpiryCountdown(res.expires_in_seconds || 300);
            startResendCooldown();
            otpInputs[0].focus();

        } catch (err) {
            showAlert(otpAlert, otpAlertText, formatErrorMessage(err, "Failed to resend OTP."), "error");
            btnResendOtp.disabled = false;
            resendText.textContent = "Resend Code";
        }
    });

    // =========================================
    // VERIFY OTP SUBMISSION
    // =========================================
    btnVerifyOtp.addEventListener("click", verifyEnteredOTP);

    async function verifyEnteredOTP() {
        const otp = getEnteredOtp();

        if (otp.length < 6) {
            showAlert(otpAlert, otpAlertText, "Please enter all 6 digits of your verification code.", "error");
            highlightBoxErrors();
            return;
        }

        btnVerifyOtp.disabled = true;
        btnVerifyText.innerHTML = `
            <span class="spinner-border-sm"></span>
            <span>Verifying...</span>
        `;
        hideAlert(otpAlert);

        try {
            let data;
            if (window.BhashaAPI && window.BhashaAPI.verifyOTP) {
                data = await window.BhashaAPI.verifyOTP(currentAuthSession.email, otp, currentAuthSession.tempToken);
            } else {
                const base = (window.BhashaAPI && window.BhashaAPI.getApiBase) ? window.BhashaAPI.getApiBase() : "http://127.0.0.1:8000/api";
                const response = await fetch(`${base}/auth/verify-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: currentAuthSession.email,
                        otp: otp,
                        temp_token: currentAuthSession.tempToken
                    })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || "Invalid verification code.");
                }
                data = await response.json();
                if (data.access_token && window.BhashaAPI) {
                    window.BhashaAPI.setSession(data.access_token, data.user);
                }
            }

            // SUCCESS!
            clearInterval(otpExpiryTimer);
            clearInterval(resendCooldownTimer);

            // Display Success Animation Overlay
            otpSuccessOverlay.style.display = "flex";

            // Redirect to dashboard after 1.2s
            setTimeout(() => {
                const currentSubj = (window.BhashaAPI && window.BhashaAPI.getSelectedSubject)
                    ? window.BhashaAPI.getSelectedSubject()
                    : (localStorage.getItem("bhasha_chosen_language") || "Python");
                if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
                    window.BhashaAPI.setSelectedSubject(currentSubj, true);
                }
                const redirectParam = urlParams.get("redirect") || `dashboard.html?subject=${encodeURIComponent(currentSubj)}`;
                window.location.href = redirectParam;
            }, 1200);

        } catch (err) {
            showAlert(otpAlert, otpAlertText, formatErrorMessage(err, "Verification failed."), "error");
            highlightBoxErrors();
            clearOtpBoxes();
            otpInputs[0].focus();
        } finally {
            btnVerifyOtp.disabled = false;
            btnVerifyText.innerHTML = `
                <span>Verify & Continue</span>
                <i class="bi bi-shield-check"></i>
            `;
        }
    }

    function highlightBoxErrors() {
        otpInputs.forEach(inp => inp.classList.add("error"));
        setTimeout(() => {
            otpInputs.forEach(inp => inp.classList.remove("error"));
        }, 1200);
    }

    // =========================================
    // ALERT & ERROR UTILITIES
    // =========================================
    function formatErrorMessage(err, defaultMsg = "Authentication failed.") {
        if (!err) return defaultMsg;
        const msg = err.message || "";
        if (err.name === "TypeError" || msg === "Failed to fetch" || msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
            const backendUrl = (window.BhashaAPI && window.BhashaAPI.getBackendUrl) ? window.BhashaAPI.getBackendUrl() : "http://127.0.0.1:8000";
            return `Cannot connect to server at ${backendUrl}. Ensure FastAPI backend is running ('python backend/run.py'). <a href="#" class="alert-config-link" style="color: #6ee7b7; font-weight: 700; text-decoration: underline; display: inline-block; margin-top: 4px;">Open Multi-Device & Server Setup &rarr;</a>`;
        }
        if (err.name === "AbortError" || msg.toLowerCase().includes("timeout")) {
            return "Request timed out. Please check if the backend server is responding.";
        }
        return msg || defaultMsg;
    }

    function showAlert(alertEl, textEl, message, type = "error") {
        if (!alertEl || !textEl) return;
        textEl.innerHTML = message;
        alertEl.className = `auth-alert ${type}`;
        alertEl.style.display = "flex";

        const configLink = textEl.querySelector(".alert-config-link");
        if (configLink && btnOpenServerModal) {
            configLink.addEventListener("click", (e) => {
                e.preventDefault();
                btnOpenServerModal.click();
            });
        }
    }

    function hideAlert(alertEl) {
        if (alertEl) alertEl.style.display = "none";
    }

    // =========================================
    // MULTI-DEVICE & SERVER CONNECTION LOGIC
    // =========================================
    const serverStatusBar = document.getElementById("serverStatusBar");
    const serverStatusDot = document.getElementById("serverStatusDot");
    const serverStatusText = document.getElementById("serverStatusText");
    const btnOpenServerModal = document.getElementById("btnOpenServerModal");

    const serverModal = document.getElementById("serverModal");
    const btnCloseServerModal = document.getElementById("btnCloseServerModal");
    const modalServerStatus = document.getElementById("modalServerStatus");
    const modalPingBadge = document.getElementById("modalPingBadge");
    const lanUrlDisplay = document.getElementById("lanUrlDisplay");
    const btnCopyLanUrl = document.getElementById("btnCopyLanUrl");
    const inputBackendUrl = document.getElementById("inputBackendUrl");
    const btnSaveBackendUrl = document.getElementById("btnSaveBackendUrl");
    const btnSetLocalhost = document.getElementById("btnSetLocalhost");
    const btnSetLanIp = document.getElementById("btnSetLanIp");

    let detectedLanIp = "10.87.150.150";

    async function checkBackendStatus() {
        if (!serverStatusBar) return;
        const currentUrl = (window.BhashaAPI && window.BhashaAPI.getBackendUrl) ? window.BhashaAPI.getBackendUrl() : "http://127.0.0.1:8000";
        if (inputBackendUrl) inputBackendUrl.value = currentUrl;

        const startTime = performance.now();
        try {
            if (window.BhashaAPI && window.BhashaAPI.checkHealth) {
                const health = await window.BhashaAPI.checkHealth();
                const latency = Math.round(performance.now() - startTime);

                serverStatusBar.className = "server-status-bar online";
                if (serverStatusDot) serverStatusDot.className = "status-indicator-dot online";
                if (serverStatusText) serverStatusText.textContent = `Connected (${currentUrl.replace(/^https?:\/\//, '')})`;

                if (modalServerStatus) {
                    modalServerStatus.textContent = "🟢 Online & Operational";
                    modalServerStatus.style.color = "#34d399";
                }
                if (modalPingBadge) modalPingBadge.textContent = `${latency}ms latency`;

                if (health.lan_ip) {
                    detectedLanIp = health.lan_ip;
                    if (lanUrlDisplay) lanUrlDisplay.textContent = `http://${detectedLanIp}:8000/login.html`;
                }

                try {
                    const net = await window.BhashaAPI.getNetworkInfo();
                    if (net && net.login_url && lanUrlDisplay) {
                        lanUrlDisplay.textContent = net.login_url;
                        detectedLanIp = net.lan_ip || detectedLanIp;
                    }
                } catch (_) {}
            }
        } catch (_) {
            serverStatusBar.className = "server-status-bar offline";
            if (serverStatusDot) serverStatusDot.className = "status-indicator-dot offline";
            if (serverStatusText) serverStatusText.textContent = "Backend Offline (Click to configure)";

            if (modalServerStatus) {
                modalServerStatus.textContent = "🔴 Offline / Cannot Connect";
                modalServerStatus.style.color = "#ef4444";
            }
            if (modalPingBadge) modalPingBadge.textContent = "Unreachable";
        }
    }

    if (btnOpenServerModal) {
        btnOpenServerModal.addEventListener("click", () => {
            if (serverModal) serverModal.style.display = "flex";
            checkBackendStatus();
        });
    }

    if (btnCloseServerModal) {
        btnCloseServerModal.addEventListener("click", () => {
            if (serverModal) serverModal.style.display = "none";
        });
    }

    if (serverModal) {
        serverModal.addEventListener("click", (e) => {
            if (e.target === serverModal) serverModal.style.display = "none";
        });
    }

    if (btnCopyLanUrl) {
        btnCopyLanUrl.addEventListener("click", async () => {
            const url = lanUrlDisplay ? lanUrlDisplay.textContent.trim() : `http://${detectedLanIp}:8000/login.html`;
            try {
                await navigator.clipboard.writeText(url);
                btnCopyLanUrl.innerHTML = '<i class="bi bi-check2"></i> Copied!';
                btnCopyLanUrl.style.background = "#059669";
                setTimeout(() => {
                    btnCopyLanUrl.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
                    btnCopyLanUrl.style.background = "#10b981";
                }, 2000);
            } catch (_) {
                prompt("Copy this URL for your phone/tablet:", url);
            }
        });
    }

    if (btnSaveBackendUrl && inputBackendUrl) {
        btnSaveBackendUrl.addEventListener("click", async () => {
            const rawVal = inputBackendUrl.value.trim();
            if (!rawVal) return;
            btnSaveBackendUrl.textContent = "Testing...";
            btnSaveBackendUrl.disabled = true;

            if (window.BhashaAPI && window.BhashaAPI.setBackendUrl) {
                window.BhashaAPI.setBackendUrl(rawVal);
            }

            await checkBackendStatus();

            btnSaveBackendUrl.textContent = "Saved!";
            setTimeout(() => {
                btnSaveBackendUrl.textContent = "Save & Test";
                btnSaveBackendUrl.disabled = false;
            }, 1200);
        });
    }

    if (btnSetLocalhost && inputBackendUrl) {
        btnSetLocalhost.addEventListener("click", () => {
            inputBackendUrl.value = "http://127.0.0.1:8000";
            if (btnSaveBackendUrl) btnSaveBackendUrl.click();
        });
    }

    if (btnSetLanIp && inputBackendUrl) {
        btnSetLanIp.addEventListener("click", () => {
            inputBackendUrl.value = `http://${detectedLanIp}:8000`;
            if (btnSaveBackendUrl) btnSaveBackendUrl.click();
        });
    }

    // Run initial health check on load
    checkBackendStatus();

    // =========================================
    // FORGOT PASSWORD MODAL & RECOVERY FLOW
    // =========================================
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const btnCloseForgotModal = document.getElementById("btnCloseForgotModal");
    const forgotAlert = document.getElementById("forgotAlert");
    const forgotAlertText = document.getElementById("forgotAlertText");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const inputForgotEmail = document.getElementById("inputForgotEmail");
    const btnSubmitForgot = document.getElementById("btnSubmitForgot");
    const btnSubmitForgotText = document.getElementById("btnSubmitForgotText");

    if (linkForgotPassword && forgotPasswordModal) {
        linkForgotPassword.addEventListener("click", (e) => {
            e.preventDefault();
            if (inputEmail && inputEmail.value.trim() && inputForgotEmail) {
                inputForgotEmail.value = inputEmail.value.trim();
            }
            if (forgotAlert) forgotAlert.style.display = "none";
            forgotPasswordModal.style.display = "flex";
            if (inputForgotEmail) {
                setTimeout(() => inputForgotEmail.focus(), 150);
            }
        });
    }

    if (btnCloseForgotModal && forgotPasswordModal) {
        btnCloseForgotModal.addEventListener("click", () => {
            forgotPasswordModal.style.display = "none";
        });
    }

    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener("click", (e) => {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.style.display = "none";
            }
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = (inputForgotEmail ? inputForgotEmail.value : "").trim();
            if (!email) {
                showAlert(forgotAlert, forgotAlertText, "Please enter your email address.", "error");
                if (inputForgotEmail) inputForgotEmail.focus();
                return;
            }

            btnSubmitForgot.disabled = true;
            btnSubmitForgotText.textContent = "Sending Request...";
            hideAlert(forgotAlert);

            try {
                let res;
                if (window.BhashaAPI && window.BhashaAPI.forgotPassword) {
                    res = await window.BhashaAPI.forgotPassword(email);
                } else {
                    const base = (window.BhashaAPI && window.BhashaAPI.getApiBase) ? window.BhashaAPI.getApiBase() : "http://127.0.0.1:8000/api";
                    const response = await fetch(`${base}/auth/forgot-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email })
                    });
                    res = await response.json();
                    if (!response.ok) {
                        throw new Error(res.detail || "Password recovery request failed.");
                    }
                }

                if (res.status === "unavailable") {
                    showAlert(forgotAlert, forgotAlertText, res.message, "warning");
                } else if (res.status === "success") {
                    showAlert(forgotAlert, forgotAlertText, res.message, "success");
                    if (inputForgotEmail) inputForgotEmail.value = "";
                } else {
                    showAlert(forgotAlert, forgotAlertText, res.message || "Request completed.", "info");
                }
            } catch (err) {
                showAlert(forgotAlert, forgotAlertText, formatErrorMessage(err, "Failed to submit password recovery request."), "error");
            } finally {
                btnSubmitForgot.disabled = false;
                btnSubmitForgotText.textContent = "Send Recovery Link";
            }
        });
    }

});