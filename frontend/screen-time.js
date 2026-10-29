/**
 * LingoX - Active Learning Screen Time Tracker
 * AI-Based Natural & Programming Language Proficiency System
 * 
 * Rules:
 * - Only counts verified active learning time
 * - Pauses on tab inactive / window blur
 * - Pauses on 60 seconds of no user input
 * - Syncs progress to FastAPI backend every 30 seconds
 * - Dispatches 'lingox:reward_earned' on earning 200-minute Premium rewards
 */

(function () {
    "use strict";

    class ScreenTimeTracker {
        constructor() {
            this.sessionId = null;
            this.pageName = this.detectPageName();
            this.isActive = false;
            this.isIdle = false;
            this.lastActivityTime = Date.now();
            this.idleThresholdMs = 60 * 1000; // 60 seconds
            this.heartbeatIntervalMs = 30 * 1000; // 30 seconds
            this.accumulatedActiveSeconds = 0;
            this.tickInterval = null;
            this.heartbeatTimer = null;

            this.init();
        }

        detectPageName() {
            const path = window.location.pathname;
            const filename = path.split("/").pop() || "index.html";
            return filename.replace(".html", "") || "learning_workspace";
        }

        init() {
            // Bind user activity listeners
            const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
            const onUserActivity = () => this.recordActivity();
            
            activityEvents.forEach(evt => {
                window.addEventListener(evt, onUserActivity, { passive: true });
            });

            // Visibility & blur listeners
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    this.pause();
                } else {
                    this.resume();
                }
            });

            window.addEventListener("blur", () => this.pause());
            window.addEventListener("focus", () => this.resume());

            // Page leave flush
            window.addEventListener("beforeunload", () => this.flushAndEnd());
            window.addEventListener("pagehide", () => this.flushAndEnd());

            // Start backend tracking session
            this.startSession();

            // Start 1-second active ticker
            this.tickInterval = setInterval(() => this.tick(), 1000);

            // Start 30-second sync heartbeat
            this.heartbeatTimer = setInterval(() => this.syncHeartbeat(), this.heartbeatIntervalMs);

            this.resume();
        }

        recordActivity() {
            this.lastActivityTime = Date.now();
            if (this.isIdle) {
                this.isIdle = false;
            }
        }

        tick() {
            if (document.hidden) return;

            // Check 60-second idle threshold
            const timeSinceLastActivity = Date.now() - this.lastActivityTime;
            if (timeSinceLastActivity >= this.idleThresholdMs) {
                this.isIdle = true;
                return;
            }

            // User is actively interacting
            this.accumulatedActiveSeconds += 1;
        }

        pause() {
            this.isActive = false;
        }

        resume() {
            this.isActive = true;
            this.recordActivity();
        }

        async startSession() {
            try {
                if (window.BhashaAPI && window.BhashaAPI.startScreenTime) {
                    const res = await window.BhashaAPI.startScreenTime(this.pageName);
                    if (res && res.session_id) {
                        this.sessionId = res.session_id;
                    }
                } else {
                    const base = (window.BhashaAPI && window.BhashaAPI.getBackendUrl) ? window.BhashaAPI.getBackendUrl() : "http://127.0.0.1:8000";
                    const res = await fetch(`${base}/screen-time/start`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ page_name: this.pageName })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        this.sessionId = data.session_id;
                    }
                }
            } catch (_) {
                // Silently handled in background
            }
        }

        async syncHeartbeat() {
            const secondsToSend = Math.round(this.accumulatedActiveSeconds);
            if (secondsToSend <= 0) return;

            // Reset local accumulator
            this.accumulatedActiveSeconds = 0;

            try {
                let data = null;
                if (window.BhashaAPI && window.BhashaAPI.updateScreenTime) {
                    data = await window.BhashaAPI.updateScreenTime(secondsToSend, this.sessionId, this.pageName);
                } else {
                    const base = (window.BhashaAPI && window.BhashaAPI.getBackendUrl) ? window.BhashaAPI.getBackendUrl() : "http://127.0.0.1:8000";
                    const res = await fetch(`${base}/screen-time/update`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            session_id: this.sessionId,
                            active_seconds: secondsToSend,
                            page_name: this.pageName
                        })
                    });
                    if (res.ok) data = await res.json();
                }

                if (data) {
                    // Update any live UI listeners
                    window.dispatchEvent(new CustomEvent("lingox:screentime_updated", { detail: data }));

                    // Trigger celebration popup if a reward was just earned!
                    if (data.reward && data.reward.reward_earned) {
                        window.dispatchEvent(new CustomEvent("lingox:reward_earned", { detail: data.reward }));
                    }
                }
            } catch (err) {
                // If network fails, add seconds back
                this.accumulatedActiveSeconds += secondsToSend;
            }
        }

        flushAndEnd() {
            const secondsToSend = Math.round(this.accumulatedActiveSeconds);
            this.accumulatedActiveSeconds = 0;

            const payload = JSON.stringify({
                session_id: this.sessionId,
                active_seconds: secondsToSend,
                page_name: this.pageName
            });

            if (navigator.sendBeacon) {
                const base = (window.BhashaAPI && window.BhashaAPI.getBackendUrl) ? window.BhashaAPI.getBackendUrl() : ((window.location.hostname) ? `http://${window.location.hostname}:8000` : "http://127.0.0.1:8000");
                navigator.sendBeacon(`${base}/screen-time/update`, payload);
            }
        }
    }

    // Auto-initialize tracker when DOM loads
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            window.lingoxScreenTracker = new ScreenTimeTracker();
        });
    } else {
        window.lingoxScreenTracker = new ScreenTimeTracker();
    }
})();
