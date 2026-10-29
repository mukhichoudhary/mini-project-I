document.addEventListener("DOMContentLoaded", async () => {

    /* =========================================================
       GET SUBJECT FROM URL & NORMALIZE
       ========================================================= */
    const params = new URLSearchParams(window.location.search);
    const rawParam = params.get("subject") || params.get("track") || params.get("lang");
    let subject = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
        ? window.BhashaAPI.normalizeSubject(rawParam, null)
        : null;

    if (!subject && window.BhashaAPI && window.BhashaAPI.getSelectedSubject) {
        subject = window.BhashaAPI.getSelectedSubject();
    }
    if (!subject) {
        const stored = localStorage.getItem("bhasha_chosen_language");
        if (stored && window.BhashaAPI && window.BhashaAPI.normalizeSubject) {
            subject = window.BhashaAPI.normalizeSubject(stored, null);
        }
    }

    // If no subject has been selected, direct to subject selection flow
    if (!subject) {
        window.location.href = "index.html";
        return;
    }

    // Synchronize chosen language across localStorage and backend
    if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
        window.BhashaAPI.setSelectedSubject(subject, true);
    } else {
        localStorage.setItem("bhasha_chosen_language", subject);
    }

    /* =========================================================
       FALLBACK CURRICULUM DATA
       ========================================================= */
    const subjectData = {
        English: {
            icon: "🇬🇧",
            description: "Master professional English communication, precise syntax, engineering metrics, and technical synthesis.",
            lessons: [
                ["Basic Vocabulary & Syntax", "Fundamental parts of speech, vocabulary building, and sentence structuring."],
                ["Greetings & Professional Introductions", "Professional communication, meeting openings, stakeholder updates, and executive presence."],
                ["Numbers, Quantifiers & Data Metrics", "Quantifying metrics, percentiles, throughput, and numerical precision in engineering."],
                ["Everyday Conversations & Collocations", "Technical collocations, collaborative code review phrasing, and workplace idioms."],
                ["Grammar Basics: Parts of Speech & Prepositions", "Dependent prepositions, possessives vs contractions, and syntactic grammatical accuracy."],
                ["Sentence Building & Syntactic Connectors", "Conjunctions, relative clauses, avoiding comma splices, and parallel sentence structure."],
                ["Tenses Mastery & Temporal Precision", "Past perfect sequences in incident reports, conditionals in post-mortems, and roadmap milestones."],
                ["Technical Reading Comprehension & Synthesis", "Analyzing RFC specifications, architectural decision trade-offs, and failure-isolation patterns."]
            ]
        },

        Python: {
            icon: "🐍",
            description: "Master Python from syntax fundamentals to advanced data structures and OOP architecture.",
            lessons: [
                ["Python Syntax, Indentation & Scope", "Master PEP 8 indentation, variable reassignment, and scope."],
                ["Data Types, Numbers & Casting", "Explore numeric types, floor division, and explicit type casting."],
                ["Operators & String Slicing", "Practice operators, formatting, and stride string slicing."],
                ["Conditionals & Pattern Matching", "Learn branching logic, ternary expressions, and match-case."],
                ["Loops & Iterators", "Deep dive into for, while, range, and loop-else clauses."],
                ["Functions & Lambda Expressions", "Build modular functions, *args, **kwargs, and lambda mappings."],
                ["Collections: Lists, Sets & Dicts", "Master mutability, list comprehensions, and dictionary lookups."],
                ["OOP: Classes & Inheritance", "Understand class blueprints, self, dunder methods, and super()."]
            ]
        },

        Java: {
            icon: "☕",
            description: "Master enterprise Java programming, JVM internals, strong typing, and OOP paradigms.",
            lessons: [
                ["Java Syntax & JVM Entrypoint", "Understand class structure, main() method, and console output."],
                ["Variables, Data Types & Casting", "Explore primitive types, memory, and widening vs narrowing."],
                ["Operators & String Pool", "Master Java operators, String immutability, and pool behavior."],
                ["Decision Making & Switch", "Implement conditional branches and switch statement logic."],
                ["Loops & Array Iteration", "Practice while, do-while, standard for, and enhanced for-each loops."],
                ["Methods & Method Overloading", "Learn parameter passing, return values, and signature overloading."],
                ["Classes, Objects & 'this'", "Design classes, instantiate objects, and utilize constructors."],
                ["OOP: Inheritance & Polymorphism", "Master encapsulation, superclass extension, and dynamic dispatch."]
            ]
        },

        "C++": {
            icon: "⚙️",
            description: "Master high-performance systems programming, memory management, pointers, and object architecture.",
            lessons: [
                ["C++ Syntax, Streams & Namespaces", "Master std::cout, std::cin, streams, and namespace management."],
                ["Variables, Constants & auto", "Explore strong typing, const vs constexpr, and auto type deduction."],
                ["Operators & Logical Expressions", "Understand arithmetic truncation, precedence, and bitwise logic."],
                ["Conditions & Switch Logic", "Implement decision branching, switch constraints, and ternary logic."],
                ["Loops & Range-based For", "Work with while, for, and modern C++ range-based for loops."],
                ["Functions & Pass-by-Reference", "Master parameter passing, references (&), and default parameters."],
                ["Pointers & Memory Addresses", "Deep dive into address-of (&), dereferencing (*), and nullptr."],
                ["Classes, Objects & Constructors", "Build classes with access specifiers, constructors, and destructors."]
            ]
        }
    };

    const data = subjectData[subject] || subjectData.Python;

    /* =========================================================
       PROMINENT HEADINGS & SUBJECT METADATA
       ========================================================= */
    document.title = `LingoX | ${subject} Learning Path`;

    const introTitle = document.getElementById("introTitle");
    const royalTag = document.getElementById("royalTag");
    const subjectName = document.getElementById("subjectName");
    const subjectIcon = document.getElementById("subjectIcon");
    const introText = document.getElementById("introText");
    const lessonCount = document.getElementById("lessonCount");
    const userBadge = document.querySelector(".user-badge");
    const summaryHeading = document.getElementById("summaryHeading");
    const curriculumHeaderTitle = document.getElementById("curriculumHeaderTitle");

    // 1. Clear subject headings that always match the selected subject
    if (introTitle) introTitle.textContent = `${subject} Learning Path`;
    if (royalTag) royalTag.textContent = `${subject.toUpperCase()} LEARNING PATH`;
    if (summaryHeading) summaryHeading.textContent = `${subject} Learning Path Progress`;
    if (curriculumHeaderTitle) curriculumHeaderTitle.textContent = `${subject} Modules & Lesson Plan`;
    if (subjectName) subjectName.textContent = subject;
    if (subjectIcon) subjectIcon.textContent = data.icon;
    if (introText) introText.textContent = data.description;
    if (userBadge) {
        const streak = localStorage.getItem("bhasha_streak") || "7";
        userBadge.innerHTML = `🔥 <strong>${streak}</strong> Day Streak`;
    }

    /* =========================================================
       RETRIEVE ACTUAL CURRICULUM LESSONS
       ========================================================= */
    let currentLessons = data.lessons.map((arr, i) => ({
        lessonNumber: i + 1,
        title: arr[0],
        description: arr[1]
    }));

    if (lessonCount) {
        lessonCount.textContent = `${currentLessons.length} Lessons`;
    }

    /* =========================================================
       PROGRESS SUMMARY CARD UPDATE
       ========================================================= */
    const summaryProgressBar = document.getElementById("summaryProgressBar");
    const summaryBadgePct = document.getElementById("summaryBadgePct");
    const metricTotalLessons = document.getElementById("metricTotalLessons");
    const metricCompletedLessons = document.getElementById("metricCompletedLessons");
    const metricRemainingLessons = document.getElementById("metricRemainingLessons");
    const metricCompletionPct = document.getElementById("metricCompletionPct");

    function updateProgressSummary(completedCount, totalLessons) {
        const total = totalLessons || currentLessons.length;
        const completed = Math.min(total, Math.max(0, completedCount));
        const remaining = Math.max(0, total - completed);
        const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

        if (metricTotalLessons) metricTotalLessons.textContent = total;
        if (metricCompletedLessons) metricCompletedLessons.textContent = completed;
        if (metricRemainingLessons) metricRemainingLessons.textContent = remaining;
        if (metricCompletionPct) metricCompletionPct.textContent = `${percent}%`;
        if (summaryBadgePct) summaryBadgePct.textContent = `${percent}%`;
        if (summaryProgressBar) summaryProgressBar.style.width = `${percent}%`;
    }

    /* =========================================================
       DYNAMIC LESSON CARDS RENDERING (4-STATE STATUS)
       ========================================================= */
    const container = document.getElementById("lessonContainer");
    if (!container) {
        console.error("lessonContainer was not found.");
        return;
    }

    function renderLessons(progressList = []) {
        container.innerHTML = "";

        // Build a lookup set of strictly completed lesson numbers for this specific subject
        const completedLessons = new Set();
        if (Array.isArray(progressList)) {
            progressList.forEach(item => {
                const itemSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                    ? window.BhashaAPI.normalizeSubject(item.subject, null)
                    : item.subject;
                if (itemSub && itemSub.toLowerCase() === subject.toLowerCase() && Boolean(item.completed)) {
                    completedLessons.add(Number(item.lesson_number));
                }
            });
        }

        // Also merge local storage progress if available
        if (window.BhashaAPI && window.BhashaAPI.getLocalProgress) {
            const localProg = window.BhashaAPI.getLocalProgress(subject);
            localProg.forEach(item => {
                const itemSub = (window.BhashaAPI && window.BhashaAPI.normalizeSubject)
                    ? window.BhashaAPI.normalizeSubject(item.subject, null)
                    : item.subject;
                if (itemSub && itemSub.toLowerCase() === subject.toLowerCase() && Boolean(item.completed)) {
                    completedLessons.add(Number(item.lesson_number));
                }
            });
        }

        const totalLessons = currentLessons.length;
        const completedCount = completedLessons.size;

        // Update the Visible Progress Summary with genuine numbers
        updateProgressSummary(completedCount, totalLessons);

        // Identify the exact next incomplete lesson to continue
        let nextIncompleteLesson = 1;
        for (let i = 1; i <= totalLessons; i++) {
            if (!completedLessons.has(i)) {
                nextIncompleteLesson = i;
                break;
            }
        }
        const isAllCompleted = completedCount >= totalLessons;

        currentLessons.forEach((lesson, index) => {
            const lessonNumber = lesson.lessonNumber || (index + 1);
            const isCompleted = completedLessons.has(lessonNumber);

            // Progression rule:
            // Lesson 1 is always unlocked.
            // Lesson N is unlocked if Lesson N-1 is completed, or if Lesson N was already completed previously.
            const isPreviousCompleted = (lessonNumber === 1) || completedLessons.has(lessonNumber - 1);
            const isUnlocked = (lessonNumber === 1) || isCompleted || isPreviousCompleted;

            // Determine exact status (Completed, In Progress, Not Started, or Locked)
            let statusName = "Locked";
            let statusText = "Locked";
            let statusClass = "locked";
            let cardClass = "lesson-card locked";
            let numberDisplay = "🔒";
            let buttonLabel = "Locked";
            let buttonClass = "lesson-btn locked";
            let isButtonDisabled = true;
            let nextUpPillHtml = "";

            if (isCompleted) {
                statusName = "Completed";
                statusText = "Completed ✓";
                statusClass = "completed";
                cardClass = "lesson-card completed";
                numberDisplay = "✓";
                buttonLabel = "Review →";
                buttonClass = "lesson-btn completed";
                isButtonDisabled = false;
            } else if (lessonNumber === nextIncompleteLesson && isUnlocked) {
                statusName = "In Progress";
                statusText = "In Progress";
                statusClass = "in-progress";
                cardClass = "lesson-card in-progress next-up available";
                numberDisplay = lessonNumber;
                nextUpPillHtml = `<span class="next-up-pill">🎯 Next to Continue</span>`;
                buttonLabel = (completedCount === 0 && lessonNumber === 1) ? "Start →" : "Continue →";
                buttonClass = "lesson-btn active in-progress-btn";
                isButtonDisabled = false;
            } else if (isUnlocked) {
                statusName = "Not Started";
                statusText = "Not Started";
                statusClass = "not-started";
                cardClass = "lesson-card not-started available";
                numberDisplay = lessonNumber;
                buttonLabel = "Start →";
                buttonClass = "lesson-btn available";
                isButtonDisabled = false;
            } else {
                statusName = "Locked";
                statusText = "Locked";
                statusClass = "locked";
                cardClass = "lesson-card locked";
                numberDisplay = "🔒";
                buttonLabel = "Locked";
                buttonClass = "lesson-btn locked";
                isButtonDisabled = true;
            }

            const card = document.createElement("div");
            card.className = cardClass;
            card.setAttribute("data-lesson-number", lessonNumber);
            card.setAttribute("data-status", statusName);

            card.innerHTML = `
                <div class="lesson-number">
                    ${numberDisplay}
                </div>

                <div class="lesson-info">
                    <h3>
                        ${lesson.title}
                        ${nextUpPillHtml}
                    </h3>
                    <p>${lesson.description}</p>
                </div>

                <div class="lesson-status">
                    <span class="status-badge-label ${statusClass}">${statusText}</span>
                    <button class="${buttonClass}" ${isButtonDisabled ? "disabled" : ""}>
                        ${buttonLabel}
                    </button>
                </div>
            `;

            const button = card.querySelector(".lesson-btn");
            if (isUnlocked && button) {
                button.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    window.location.href = `lesson.html?subject=${encodeURIComponent(subject)}&lesson=${lessonNumber}`;
                });
                card.style.cursor = "pointer";
                card.addEventListener("click", () => {
                    window.location.href = `lesson.html?subject=${encodeURIComponent(subject)}&lesson=${lessonNumber}`;
                });
            }

            container.appendChild(card);
        });
    }

    // 1. Initial fast synchronous render using local storage cache
    const initialProgress = (window.BhashaAPI && window.BhashaAPI.getLocalProgress)
        ? window.BhashaAPI.getLocalProgress(subject)
        : [];
    renderLessons(initialProgress);

    // 2. Fetch live curriculum and asynchronous backend progress refresh
    try {
        if (window.BhashaAPI && window.BhashaAPI.getLessonsForTrack) {
            const apiLessons = await window.BhashaAPI.getLessonsForTrack(subject);
            if (Array.isArray(apiLessons) && apiLessons.length > 0) {
                currentLessons = apiLessons.map(l => ({
                    lessonNumber: l.lesson_number,
                    title: l.title,
                    description: l.description
                }));
                if (lessonCount) lessonCount.textContent = `${currentLessons.length} Lessons`;
            }
        }
    } catch (e) {
        console.warn("[subject.js] Live curriculum sync notice:", e.message);
    }

    if (window.BhashaAPI && window.BhashaAPI.getLessonProgress) {
        try {
            const liveProgress = await window.BhashaAPI.getLessonProgress(subject);
            if (Array.isArray(liveProgress)) {
                renderLessons(liveProgress);
            }
        } catch (err) {
            console.warn("[subject.js] Live progress sync notice:", err.message);
        }
    }

    /* =========================================================
       BACK BUTTON
       ========================================================= */
    const backButton = document.querySelector(".back-btn");
    if (backButton) {
        backButton.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = `roadmap.html?subject=${encodeURIComponent(subject)}`;
        });
    }

    if (window.BhashaAPI && window.BhashaAPI.syncNavLinks) {
        window.BhashaAPI.syncNavLinks(subject);
    }

});