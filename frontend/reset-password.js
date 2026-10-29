/**
 * Bhasa_AI - Reset Password Client
 * Validates single-use token and securely sets new user password.
 */

document.addEventListener("DOMContentLoaded", async function () {
    const tokenCheckingBlock = document.getElementById("tokenCheckingBlock");
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const invalidTokenBlock = document.getElementById("invalidTokenBlock");
    const resetAlert = document.getElementById("resetAlert");
    const resetAlertText = document.getElementById("resetAlertText");
    const userEmailBadge = document.getElementById("userEmailBadge");

    const inputNewPassword = document.getElementById("inputNewPassword");
    const inputConfirmPassword = document.getElementById("inputConfirmPassword");
    const btnToggleNewPassword = document.getElementById("btnToggleNewPassword");
    const btnToggleConfirmPassword = document.getElementById("btnToggleConfirmPassword");
    const btnSubmitReset = document.getElementById("btnSubmitReset");
    const btnSubmitResetText = document.getElementById("btnSubmitResetText");
    const resetSuccessOverlay = document.getElementById("resetSuccessOverlay");

    function showAlert(msg, type = "error") {
        if (!resetAlert || !resetAlertText) return;
        resetAlertText.innerHTML = msg;
        resetAlert.className = `auth-alert ${type}`;
        resetAlert.style.display = "flex";
    }

    function hideAlert() {
        if (resetAlert) resetAlert.style.display = "none";
    }

    // Toggle password visibility helpers
    if (btnToggleNewPassword && inputNewPassword) {
        btnToggleNewPassword.addEventListener("click", function () {
            const isPassword = inputNewPassword.type === "password";
            inputNewPassword.type = isPassword ? "text" : "password";
            this.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
        });
    }

    if (btnToggleConfirmPassword && inputConfirmPassword) {
        btnToggleConfirmPassword.addEventListener("click", function () {
            const isPassword = inputConfirmPassword.type === "password";
            inputConfirmPassword.type = isPassword ? "text" : "password";
            this.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
        });
    }

    // Parse token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token || token.trim().length < 10) {
        if (tokenCheckingBlock) tokenCheckingBlock.style.display = "none";
        showAlert("No password reset token was provided in the recovery link. Please request a new reset email.", "error");
        if (invalidTokenBlock) invalidTokenBlock.style.display = "block";
        return;
    }

    // Validate token against backend
    try {
        let verifyRes;
        if (window.BhashaAPI && window.BhashaAPI.verifyResetToken) {
            verifyRes = await window.BhashaAPI.verifyResetToken(token.trim());
        } else {
            const base = (window.BhashaAPI && window.BhashaAPI.getApiBase) ? window.BhashaAPI.getApiBase() : "http://127.0.0.1:8000/api";
            const response = await fetch(`${base}/auth/verify-reset-token?token=${encodeURIComponent(token.trim())}`);
            verifyRes = await response.json();
        }

        if (tokenCheckingBlock) tokenCheckingBlock.style.display = "none";

        if (verifyRes && verifyRes.valid) {
            // Token is active and valid! Show the form
            if (userEmailBadge) userEmailBadge.textContent = verifyRes.email || "Verified Learner";
            if (resetPasswordForm) resetPasswordForm.style.display = "block";
            if (inputNewPassword) inputNewPassword.focus();
        } else {
            const errMsg = (verifyRes && verifyRes.message) ? verifyRes.message : "This password reset token is invalid or has expired.";
            showAlert(errMsg, "error");
            if (invalidTokenBlock) invalidTokenBlock.style.display = "block";
        }
    } catch (err) {
        if (tokenCheckingBlock) tokenCheckingBlock.style.display = "none";
        showAlert("Unable to connect to security server to verify your reset token. Please check your connection.", "error");
        if (invalidTokenBlock) invalidTokenBlock.style.display = "block";
    }

    // Form submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            hideAlert();

            const newPassword = inputNewPassword.value;
            const confirmPassword = inputConfirmPassword.value;

            if (!newPassword || newPassword.length < 6) {
                showAlert("Password must be at least 6 characters long.", "error");
                inputNewPassword.focus();
                return;
            }

            if (newPassword !== confirmPassword) {
                showAlert("Passwords do not match. Please re-enter your password.", "error");
                inputConfirmPassword.focus();
                return;
            }

            btnSubmitReset.disabled = true;
            btnSubmitResetText.textContent = "Updating Password...";

            try {
                let resetRes;
                if (window.BhashaAPI && window.BhashaAPI.resetPassword) {
                    resetRes = await window.BhashaAPI.resetPassword(token.trim(), newPassword);
                } else {
                    const base = (window.BhashaAPI && window.BhashaAPI.getApiBase) ? window.BhashaAPI.getApiBase() : "http://127.0.0.1:8000/api";
                    const response = await fetch(`${base}/auth/reset-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            token: token.trim(),
                            new_password: newPassword
                        })
                    });
                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.detail || "Password reset failed.");
                    }
                    resetRes = await response.json();
                }

                // Show success animation overlay
                if (resetSuccessOverlay) resetSuccessOverlay.style.display = "flex";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1600);

            } catch (err) {
                showAlert(err.message || "Failed to reset password. The link may have expired.", "error");
                btnSubmitReset.disabled = false;
                btnSubmitResetText.textContent = "Set New Password";
            }
        });
    }
});
