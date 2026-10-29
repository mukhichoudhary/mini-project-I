/* =========================================================
   BHASHA_AI - AI MENTOR CLIENT
   Patient, beginner-friendly Socratic programming companion.
========================================================= */

/* =========================================================
   ELEMENTS
========================================================= */

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const clearChatBtn = document.getElementById("clearChatBtn");

const quickQuestions = document.querySelectorAll(".quick-question");
const subjectOptions = document.querySelectorAll(".subject-option");
const mentorActions = document.querySelectorAll(".mentor-action");

/* =========================================================
   STATE MANAGEMENT & ACTIVE FOCUS PERSISTENCE
========================================================= */

let currentSubject = "General";
let isSubmitting = false;
let lastFailedMessage = null;

const SUPPORTED_FOCUSES = ["General", "Python", "Java", "C++", "English"];

function normalizeFocus(focus) {
    if (!focus) return "General";
    const s = String(focus).trim().toLowerCase();
    if (s === "python" || s === "py") return "Python";
    if (s === "java") return "Java";
    if (s === "c++" || s === "cpp" || s === "c plus plus") return "C++";
    if (s === "english" || s === "technical english") return "English";
    if (s === "general" || s === "general concepts") return "General";
    return "General";
}

function getInitialFocus() {
    // 1. Check URL parameter (?focus= or ?subject= or ?track=)
    try {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get("focus") || params.get("subject") || params.get("track");
        if (fromUrl) {
            const norm = normalizeFocus(fromUrl);
            localStorage.setItem("bhasha_mentor_focus", norm);
            return norm;
        }
    } catch (_) {}

    // 2. Check localStorage mentor focus key
    try {
        const savedFocus = localStorage.getItem("bhasha_mentor_focus");
        if (savedFocus) return normalizeFocus(savedFocus);
    } catch (_) {}

    // 3. Fallback to chosen learning track
    try {
        const chosen = localStorage.getItem("bhasha_chosen_language");
        if (chosen) return normalizeFocus(chosen);
    } catch (_) {}

    return "General";
}

function updateFocusUI(subject) {
    currentSubject = normalizeFocus(subject);
    localStorage.setItem("bhasha_mentor_focus", currentSubject);

    // Update URL parameter without page reload
    try {
        const url = new URL(window.location);
        url.searchParams.set("focus", currentSubject);
        window.history.replaceState({}, "", url);
    } catch (_) {}

    subjectOptions.forEach(option => {
        const optSub = normalizeFocus(option.dataset.subject);
        const statusSpan = option.querySelector(".status");
        if (optSub.toLowerCase() === currentSubject.toLowerCase()) {
            option.classList.add("active");
            if (statusSpan) statusSpan.textContent = "Active";
        } else {
            option.classList.remove("active");
            if (statusSpan) statusSpan.textContent = "Select";
        }
    });
}

/* =========================================================
   MARKDOWN & CODE BLOCK FORMATTER WITH WORKING COPY BUTTON
========================================================= */

function escapeHTML(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

window.copyCodeBlock = function (btn) {
    if (!btn) return;
    const block = btn.closest(".mentor-code-block");
    if (!block) return;
    const codeEl = block.querySelector("code");
    if (!codeEl) return;

    const textToCopy = codeEl.innerText || codeEl.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<span>Copied! ✓</span>`;
        btn.classList.add("copied");
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove("copied");
        }, 2000);
    }).catch(err => {
        console.warn("Clipboard write failed:", err);
    });
};

function formatMessage(text) {
    if (!text) return "";

    let source = String(text)
        .replace(/\r\n?/g, "\n")
        .replace(/\\```/g, "```")
        .replace(/\\#/g, "#")
        .replace(/\\</g, "<")
        .replace(/\\>/g, ">");

    const codeBlocks = [];

    // Parse fenced code blocks
    source = source.replace(
        /```([a-zA-Z0-9_+#.-]*)[ \t]*\n?([\s\S]*?)```/g,
        (match, language, code) => {
            let lang = (language || "").trim();
            let body = code || "";

            const joined = body.match(
                /^\s*(cpp|c\+\+|c|python|java|javascript|js|sql|html|css|text)(?=\s*#include\b|\s*<\w|\s*\/\/|\s*\/\*|\s*\n)/i
            );

            if (joined && !body.trimStart().startsWith("\n")) {
                if (!lang) lang = joined[1];
                body = body.trimStart().slice(joined[1].length);
            }

            const langDisplay = lang ? escapeHTML(lang.toUpperCase()) : "CODE";
            const id = `CODEBLOCKPLACEHOLDER_${codeBlocks.length}_END`;

            const blockHtml = `
                <div class="mentor-code-block">
                    <div class="code-header">
                        <span class="code-lang">${langDisplay}</span>
                        <button class="copy-code-btn" type="button" onclick="copyCodeBlock(this)" title="Copy Code to Clipboard">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            <span>Copy</span>
                        </button>
                    </div>
                    <pre><code>${escapeHTML(body.trim())}</code></pre>
                </div>
            `;

            codeBlocks.push(blockHtml);
            return `\n\n${id}\n\n`;
        }
    );

    let html = escapeHTML(source);

    // Headings
    html = html.replace(/^####\s+(.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^###\s+(.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^##\s+(.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^#\s+(.+)$/gm, "<h2>$1</h2>");

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");

    // Horizontal rules
    html = html.replace(/^\s*(?:---+|\*\*\*+)\s*$/gm, "<hr>");

    // Bullet lists
    html = html.replace(
        /(?:^|\n)((?:[ \t]*[-•][ \t]+.+(?:\n|$))+)/g,
        (match, listText) => {
            const items = listText.trim().split("\n").map(line =>
                `<li>${line.replace(/^[ \t]*[-•][ \t]+/, "")}</li>`
            ).join("");
            return `\n<ul>${items}</ul>\n`;
        }
    );

    // Numbered lists
    html = html.replace(
        /(?:^|\n)((?:[ \t]*\d+\.[ \t]+.+(?:\n|$))+)/g,
        (match, listText) => {
            const items = listText.trim().split("\n").map(line =>
                `<li>${line.replace(/^[ \t]*\d+\.[ \t]+/, "")}</li>`
            ).join("");
            return `\n<ol>${items}</ol>\n`;
        }
    );

    // Paragraphs
    html = html
        .split(/\n{2,}/)
        .map(part => {
            const trimmed = part.trim();
            if (!trimmed) return "";
            if (/^(<h[1-6]>|<ul>|<ol>|<pre\b|<hr\b|<div\b|CODEBLOCKPLACEHOLDER)/i.test(trimmed)) {
                return trimmed;
            }
            return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
        })
        .join("\n");

    // Restore saved code blocks
    codeBlocks.forEach((block, index) => {
        html = html.replace(`CODEBLOCKPLACEHOLDER_${index}_END`, block);
    });

    return html;
}

/* =========================================================
   ADD MESSAGE & RENDER
========================================================= */

function addMessage(text, sender = "ai", source = null) {
    const message = document.createElement("div");
    message.className = sender === "user" ? "message user-message" : "message ai-message";
    const avatar = sender === "user" ? "H" : "🌿";

    let sourcePill = "";
    if (sender === "ai") {
        if (source === "google_gemini") {
            sourcePill = '<span class="mentor-source-badge live-gemini" style="font-size: 10px; background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 4px; padding: 2px 6px; margin-left: 8px; font-weight: 600;">⚡ Gemini Live AI</span>';
        } else if (source === "offline_tutor" || source === "offline_engine") {
            sourcePill = '<span class="mentor-source-badge offline-engine" style="font-size: 10px; background: rgba(245, 158, 11, 0.1); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 4px; padding: 2px 6px; margin-left: 8px; font-weight: 600;">🌿 Academic Knowledge Engine</span>';
        }
    }

    message.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-content">
            <div class="message-bubble">
                ${formatMessage(text)}
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span class="message-time">Just now</span>
                ${sourcePill}
            </div>
        </div>
    `;

    chatMessages.appendChild(message);
    scrollToBottom();
}

function addErrorMessage(errorText, originalMessage) {
    lastFailedMessage = originalMessage;
    const message = document.createElement("div");
    message.className = "message ai-message error-message";

    message.innerHTML = `
        <div class="message-avatar" style="background: #FEE2E2; border: 1px solid #FCA5A5; color: #DC2626;">
            ⚠️
        </div>

        <div class="message-content">
            <div class="message-bubble error-bubble">
                <p><strong>Mentor Response Unavailable</strong></p>
                <div class="error-detail">${escapeHTML(errorText)}</div>
                <p style="font-size: 12px; margin-top: 6px;">Your question has not been lost. You can retry safely below:</p>
                <button type="button" class="retry-btn" onclick="retryLastMessage()">
                    🔄 Retry Request
                </button>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span class="message-time">Just now</span>
                <span style="font-size: 10px; color: #DC2626; font-weight: 600;">Delivery Issue</span>
            </div>
        </div>
    `;

    chatMessages.appendChild(message);
    scrollToBottom();
}

window.retryLastMessage = function () {
    if (lastFailedMessage) {
        const msgToRetry = lastFailedMessage;
        lastFailedMessage = null;
        sendMessage(msgToRetry);
    }
};

function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: "smooth"
    });
}

function setSubmittingState(submitting) {
    isSubmitting = submitting;
    if (submitting) {
        sendBtn.disabled = true;
        messageInput.disabled = true;
        messageInput.placeholder = "Sage Mentor is formulating your guidance...";
        typingIndicator.style.display = "flex";
    } else {
        sendBtn.disabled = false;
        messageInput.disabled = false;
        messageInput.placeholder = "Ask your mentor anything about code, errors, or concepts...";
        typingIndicator.style.display = "none";
        messageInput.focus();
    }
}

/* =========================================================
   SEND MESSAGE (REAL BACKEND & HONEST ERROR HANDLING)
========================================================= */

async function sendMessage(customMessage = null) {
    if (isSubmitting) return;

    const message = customMessage !== null ? customMessage.trim() : messageInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage(message, "user");

    // Clear input box
    if (customMessage === null) {
        messageInput.value = "";
        autoResize();
    }

    setSubmittingState(true);
    scrollToBottom();

    // Check if backend API client is available
    if (window.BhashaAPI && window.BhashaAPI.sendMentorMessage) {
        try {
            const data = await window.BhashaAPI.sendMentorMessage(currentSubject, message);
            setSubmittingState(false);

            if (data && data.reply) {
                addMessage(data.reply, "ai", data.source || "offline_tutor");
                if (data.source === "google_gemini") {
                    updateGeminiStatusUI(true, "Gemini Flash Active ⚡");
                } else {
                    updateGeminiStatusUI(false, "Academic Knowledge Engine 🌿");
                }
            } else {
                addErrorMessage("Empty response received from the tutor service.", message);
            }
        } catch (err) {
            setSubmittingState(false);
            console.error("Mentor request error:", err);
            const errMsg = err.message || "Failed to communicate with mentor backend service.";
            addErrorMessage(errMsg, message);
        }
    } else {
        setSubmittingState(false);
        addErrorMessage("BhashaAPI client unavailable in browser window.", message);
    }
}

/* =========================================================
   EVENT LISTENERS: INPUT & BUTTONS
========================================================= */

sendBtn.addEventListener("click", () => sendMessage());

messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

function autoResize() {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
}

messageInput.addEventListener("input", autoResize);

/* =========================================================
   QUICK QUESTIONS PER SUBJECT
========================================================= */

const SUBJECT_QUICK_QUESTIONS = {
    Python: [
        { label: "Python Lists & Slicing", q: "Explain Python lists with examples." },
        { label: "List Comprehensions", q: "How do list comprehensions work in Python?" },
        { label: "Functions & Scope", q: "Explain how functions, return values, and scope work in Python." },
        { label: "Python Practice Challenge", q: "Give me 5 Python practice challenges." }
    ],
    Java: [
        { label: "Explain Java OOPs", q: "Explain Java OOPs in simple terms" },
        { label: "Inheritance in Java", q: "What is inheritance in Java and how does extends work?" },
        { label: "Interfaces vs Abstract", q: "What is the difference between an interface and an abstract class in Java?" },
        { label: "Java Practice Questions", q: "Give me 5 Java class practice questions." }
    ],
    "C++": [
        { label: "Pointers & References", q: "Explain the difference between pointers and references in C++." },
        { label: "Dynamic Memory (new/delete)", q: "How does dynamic memory allocation work in C++ with new and delete?" },
        { label: "RAII & Smart Pointers", q: "Explain the RAII idiom and smart pointers in modern C++." },
        { label: "C++ Practice Questions", q: "Give me 5 C++ memory and pointer practice questions." }
    ],
    English: [
        { label: "Active vs Passive Voice", q: "Explain the difference between active and passive voice in technical documentation with examples." },
        { label: "Code Review Phrases", q: "What are polite and constructive English phrases for code reviews?" },
        { label: "Scrum Standup Update", q: "Help me articulate a concise daily standup update in professional English." },
        { label: "Technical Pronunciation", q: "How do I clearly pronounce technical terms like algorithm, hierarchy, and boolean?" }
    ],
    General: [
        { label: "Explain Java OOPs", q: "Explain Java OOPs in simple terms" },
        { label: "Python Lists", q: "Explain Python lists with an example" },
        { label: "DBMS Primary Key", q: "What is a primary key in DBMS?" },
        { label: "Big-O Notation", q: "Explain Big-O time and space complexity with simple examples." }
    ]
};

function resetChatMessagesToWelcome(subject) {
    const norm = normalizeFocus(subject);
    const questions = SUBJECT_QUICK_QUESTIONS[norm] || SUBJECT_QUICK_QUESTIONS.General;
    const questionsHtml = questions.map(item =>
        `<button class="quick-question" data-question="${escapeHTML(item.q)}">${escapeHTML(item.label)}</button>`
    ).join("");

    chatMessages.innerHTML = `
        <div class="message ai-message">
            <div class="message-avatar">🌿</div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>Welcome back! 👋 I'm your LingoX Code Mentor for <strong>${escapeHTML(norm)}</strong>.</p>
                    <p>${norm === "English"
                        ? "I'm equipped to guide you through technical vocabulary, fluent speaking articulation, professional syntax, and software documentation phrasing."
                        : `I'm equipped to guide you through ${escapeHTML(norm)} concepts, syntax execution, architecture, and debugging.`}</p>
                    <p>What coding or learning challenge would you like to master today?</p>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                    <span class="message-time">Just now</span>
                </div>
            </div>
        </div>

        <div class="quick-question-area">
            <span>Try exploring:</span>
            <div class="quick-questions">
                ${questionsHtml}
            </div>
        </div>
    `;

    chatMessages.querySelectorAll(".quick-question").forEach(button => {
        button.addEventListener("click", () => sendMessage(button.dataset.question));
    });
}

/* =========================================================
   SUBJECT SELECTION & SWITCHING
========================================================= */

subjectOptions.forEach(option => {
    option.addEventListener("click", async () => {
        const selected = option.dataset.subject;
        updateFocusUI(selected);
        await loadConversationHistory(currentSubject);
    });
});

/* =========================================================
   QUICK INQUIRIES ACTIONS
========================================================= */

mentorActions.forEach(action => {
    action.addEventListener("click", () => {
        const actionType = action.dataset.action;
        const typedInput = messageInput.value.trim();

        if (actionType === "Explain a topic") {
            if (typedInput) {
                sendMessage(`Explain ${typedInput} in simple terms with an example and a short recap.`);
            } else {
                // Focus-tailored starter explanation request
                let prompt = "";
                if (currentSubject === "Java") {
                    prompt = "Explain Java OOPs and encapsulation in simple terms with an example and a short recap.";
                } else if (currentSubject === "Python") {
                    prompt = "Explain how functions, return values, and scope work in Python with an example and a short recap.";
                } else if (currentSubject === "C++") {
                    prompt = "Explain pointers and memory addresses in C++ with an example and a short recap.";
                } else if (currentSubject === "English") {
                    prompt = "Explain the difference between active and passive voice in technical writing with examples and a recap.";
                } else {
                    prompt = "Explain Big-O time complexity in simple terms with an example and a short recap.";
                }
                sendMessage(prompt);
            }
        } else if (actionType === "Debug my code") {
            if (typedInput) {
                sendMessage(`Please debug this code and fix the error:\n\n${typedInput}`);
            } else {
                // Guide user to paste snippet
                messageInput.value = `// Paste your ${currentSubject} code and error message here:\n`;
                autoResize();
                messageInput.focus();
                addMessage(
                    `To debug your **${currentSubject}** code accurately, please paste your code snippet and any error message or stack trace into the message box!`,
                    "ai",
                    "offline_tutor"
                );
            }
        } else if (actionType === "Give me practice questions") {
            sendMessage(`Give me 5 practice questions for ${currentSubject}.`);
        } else if (actionType === "Create a study plan for me") {
            sendMessage(`Create a structured 4-week study plan for ${currentSubject}.`);
        } else {
            sendMessage(`Help me with ${currentSubject}.`);
        }
    });
});

/* =========================================================
   CLEAR CHAT (SUBJECT ISOLATED)
========================================================= */

clearChatBtn.addEventListener("click", async () => {
    const confirmed = confirm(`Clear your ${currentSubject} conversation history?`);
    if (!confirmed) return;

    if (window.BhashaAPI && window.BhashaAPI.clearMentorHistory) {
        try {
            await window.BhashaAPI.clearMentorHistory(currentSubject);
        } catch (e) {
            console.warn("Could not clear remote history:", e);
        }
    }

    resetChatMessagesToWelcome(currentSubject);
    scrollToBottom();
});

/* =========================================================
   GEMINI API STATUS MANAGEMENT
========================================================= */

function updateGeminiStatusUI(isConfigured, labelText = null) {
    const badge = document.getElementById("geminiStatusBadge");
    const statusText = document.getElementById("geminiStatusText");
    const sidebarStatus = document.getElementById("sidebarGeminiStatus");
    const sidebarModel = document.getElementById("sidebarGeminiModel");

    if (isConfigured) {
        if (badge) {
            badge.classList.remove("fallback-mode");
            badge.title = "Connected to Google Gemini generative intelligence";
        }
        if (statusText) statusText.textContent = labelText || "Gemini Flash Active ⚡";
        if (sidebarStatus) {
            sidebarStatus.textContent = "Active (Live Gemini)";
            sidebarStatus.style.color = "var(--c-leaf)";
        }
        if (sidebarModel) sidebarModel.textContent = "gemini-1.5-flash";
    } else {
        if (badge) {
            badge.classList.add("fallback-mode");
            badge.title = "Operating in Academic Knowledge Engine mode. Backend GEMINI_API_KEY unconfigured.";
        }
        if (statusText) statusText.textContent = labelText || "Academic Knowledge Engine";
        if (sidebarStatus) {
            sidebarStatus.textContent = "Academic Knowledge Engine";
            sidebarStatus.style.color = "#B26A00";
        }
        if (sidebarModel) sidebarModel.textContent = "Built-in Tutor Engine";
    }
}

async function checkGeminiStatus() {
    if (window.BhashaAPI && window.BhashaAPI.getMentorStatus) {
        try {
            const status = await window.BhashaAPI.getMentorStatus();
            updateGeminiStatusUI(
                status.gemini_configured,
                status.gemini_configured ? "Gemini Flash Active ⚡" : "Academic Knowledge Engine"
            );
        } catch (e) {
            console.warn("Could not check Gemini status:", e);
            updateGeminiStatusUI(false);
        }
    } else {
        updateGeminiStatusUI(false);
    }
}

/* =========================================================
   LOAD CONVERSATION HISTORY (SUBJECT ISOLATED)
========================================================= */

async function loadConversationHistory(subject = currentSubject) {
    const norm = normalizeFocus(subject);
    resetChatMessagesToWelcome(norm);

    if (!window.BhashaAPI || !window.BhashaAPI.isAuthenticated()) {
        scrollToBottom();
        return;
    }

    try {
        const history = await window.BhashaAPI.getMentorHistory(norm);
        if (history && history.length > 0) {
            history.forEach(item => {
                addMessage(item.content, item.role === "user" ? "user" : "ai", item.source || "offline_tutor");
            });
        }
    } catch (e) {
        console.warn("Could not load subject-specific history:", e);
    }
    scrollToBottom();
}

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    autoResize();
    scrollToBottom();
    checkGeminiStatus();

    // 1. Resolve initial focus with priority order
    const initialFocus = getInitialFocus();
    updateFocusUI(initialFocus);

    // 2. Load conversation history for the resolved active focus
    await loadConversationHistory(currentSubject);
});