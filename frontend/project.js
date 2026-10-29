/* =========================================================
   BHASHA_AI — PROJECT DETAIL WORKSPACE SCRIPT
   - Real data synchronization with FastAPI backend & SQLite DB
   - Synchronized progress (card & detail page match exactly)
   - 0% and Not Started for unstarted projects
   - Live checklist, notes auto-save, code editor auto-save
   - Interactive progress buttons (0%, 25%, 50%, 75%, 100%)
   - Full responsive support and accessible UI states
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    // ============================================
    // 1. GET PROJECT FROM URL
    // ============================================
    const params = new URLSearchParams(window.location.search);
    const rawProjectId = params.get("id");
    const isNewProject = params.get("new") === "true";

    // Resolve subject for workspace context
    const urlSubject = params.get("subject") || params.get("track");
    let activeSubject = (urlSubject && window.BhashaAPI) 
        ? window.BhashaAPI.normalizeSubject(urlSubject, null)
        : null;

    if (!activeSubject && window.BhashaAPI && typeof window.BhashaAPI.getSelectedSubject === "function") {
        activeSubject = window.BhashaAPI.getSelectedSubject();
    }
    if (!activeSubject) {
        activeSubject = "Python";
    }

    // Custom project templates for all 5 categories
    const customTemplates = {
        Python: {
            title: "Python Custom Project",
            subject: "Python",
            icon: "🐍",
            lesson: "Python • Custom Workspace",
            language: "PYTHON",
            file: "solution.py",
            description: "Build and test your custom Python project. Implement your architecture and solve coding challenges.",
            xp: 100,
            defaultProgress: 0,
            instructions: [
                "Define your module requirements and plan data structures.",
                "Implement your solution with modular functions and clear logic.",
                "Handle edge cases and validate user inputs safely.",
                "Write tests and verify terminal output."
            ],
            requirements: ["Python Functions", "Variables", "Control Flow", "Error Handling"],
            starterCode: "# Python Custom Project\n\ndef main():\n    print('Hello from custom Python project!')\n\nif __name__ == '__main__':\n    main()\n"
        },
        Java: {
            title: "Java Custom Project",
            subject: "Java",
            icon: "☕",
            lesson: "Java • Custom Workspace",
            language: "JAVA",
            file: "Main.java",
            description: "Design an Object-Oriented Java project with structured classes, encapsulation, and clear methods.",
            xp: 120,
            defaultProgress: 0,
            instructions: [
                "Define classes with private fields and public accessors.",
                "Implement constructors and business logic methods.",
                "Instantiate objects in main and verify system behavior."
            ],
            requirements: ["Classes", "Objects", "Encapsulation", "Methods"],
            starterCode: "// Java Custom Project\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Java Custom Project running.\");\n    }\n}\n"
        },
        "C++": {
            title: "C++ Custom Project",
            subject: "C++",
            icon: "⚙️",
            lesson: "C++ • Custom Workspace",
            language: "CPP",
            file: "main.cpp",
            description: "Build high-performance C++ software with memory safety, pointers/references, and algorithmic loops.",
            xp: 110,
            defaultProgress: 0,
            instructions: [
                "Include required standard libraries (<iostream>, etc.).",
                "Define clear functions and memory-efficient data structures.",
                "Test edge cases and ensure correct terminal output."
            ],
            requirements: ["C++ Basics", "Functions", "Pointers", "Memory Safety"],
            starterCode: "// C++ Custom Project\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"C++ Custom Project running.\" << endl;\n    return 0;\n}\n"
        },
        English: {
            title: "Technical Writing & Documentation Project",
            subject: "English",
            icon: "📝",
            lesson: "Technical English • Custom Portfolio",
            language: "MARKDOWN",
            file: "document.md",
            description: "Draft comprehensive technical documentation, executive summaries, vocabulary exercises, or engineering communications.",
            xp: 100,
            defaultProgress: 0,
            instructions: [
                "Draft clear problem and solution statements using active voice.",
                "Use formal technical terminology and structured headings.",
                "Format markdown tables, bullet points, and code snippets."
            ],
            requirements: ["Technical Writing", "Vocabulary", "Clarity & Tone", "Professional Communication"],
            starterCode: "# Technical Writing Project\n\n## 1. Executive Summary\nProvide a concise overview of the technical topic.\n\n## 2. Technical Scope & Architecture\nDescribe the system components and interactions.\n"
        },
        General: {
            title: "Database Schema & Algorithm Design",
            subject: "General",
            icon: "🗄️",
            lesson: "General Concepts • Custom Architecture",
            language: "SQL",
            file: "schema.sql",
            description: "Design normalized database schemas, write analytical queries, or analyze algorithmic trade-offs.",
            xp: 110,
            defaultProgress: 0,
            instructions: [
                "Design normalized tables with primary and foreign key constraints.",
                "Write analytical SELECT queries with JOINs and aggregations.",
                "Analyze asymptotic time and space complexity."
            ],
            requirements: ["DBMS", "SQL", "Big-O Notation", "Normalization"],
            starterCode: "-- General Database Schema / Conceptual Architecture\n\nCREATE TABLE IF NOT EXISTS demo_table (\n    id INTEGER PRIMARY KEY,\n    name VARCHAR(100) NOT NULL\n);\n"
        }
    };

    let projectId = rawProjectId;
    if (isNewProject) {
        projectId = rawProjectId || `custom-${activeSubject.toLowerCase()}-${Date.now().toString(36)}`;
    } else if (!projectId) {
        // Find default project for the active subject
        const subjectDefault = {
            Python: "python-calculator",
            Java: "java-atm",
            "C++": "cpp-task-manager",
            English: "technical-doc-writing",
            General: "dbms-schema-designer"
        };
        projectId = subjectDefault[activeSubject] || "python-calculator";
    }

    // ============================================
    // 2. PROJECT CATALOG DEFINITIONS (ALL 8 DB PROJECTS)
    // ============================================
    const projectData = {
        "python-calculator": {
            title: "Python Terminal Calculator",
            subject: "Python",
            icon: "🐍",
            lesson: "Python • Functions & Operators",
            language: "PYTHON",
            file: "main.py",
            description: "Build a modular calculator supporting arithmetic operations, error checks, and continuous calculation loops.",
            xp: 100,
            defaultProgress: 0,
            instructions: [
                "Create a calculator that accepts arithmetic operators and numeric operands.",
                "Define distinct functions for add, subtract, multiply, and divide.",
                "Safely validate and catch division by zero.",
                "Allow continuous calculation loops until user chooses to exit.",
                "Format results with clean terminal output."
            ],
            requirements: [
                "Variables",
                "Functions",
                "Operators",
                "Conditionals",
                "Error Handling"
            ],
            starterCode: `# Python Terminal Calculator

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        return "Error: Division by zero"
    return a / b

# Implement continuous user calculation loop
def main():
    print("=== Welcome to Bhasa_AI Python Calculator ===")
    num1 = float(input("Enter first number: "))
    operator = input("Enter operator (+, -, *, /): ")
    num2 = float(input("Enter second number: "))
    
    if operator == '+':
        print("Result:", add(num1, num2))
    elif operator == '-':
        print("Result:", subtract(num1, num2))
    elif operator == '*':
        print("Result:", multiply(num1, num2))
    elif operator == '/':
        print("Result:", divide(num1, num2))
    else:
        print("Invalid operator!")

if __name__ == "__main__":
    main()
`
        },

        "java-atm": {
            title: "Java Bank Account Management",
            subject: "Java",
            icon: "☕",
            lesson: "Java • Encapsulation & Classes",
            language: "JAVA",
            file: "Main.java",
            description: "Design an Object-Oriented bank account system with private balance fields, deposit/withdraw methods, and transaction history.",
            xp: 120,
            defaultProgress: 0,
            instructions: [
                "Create a BankAccount class with private balance.",
                "Provide getter and setter methods following strict encapsulation.",
                "Implement deposit and withdraw methods with overdraft validation.",
                "Maintain a transaction audit log for statements."
            ],
            requirements: [
                "Classes",
                "Encapsulation",
                "Constructors",
                "Methods",
                "OOP Principles"
            ],
            starterCode: `// Java Bank Account Management System

class BankAccount {
    private String accountNumber;
    private String accountHolder;
    private double balance;

    public BankAccount(String accountNumber, String accountHolder, double initialDeposit) {
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
        this.balance = Math.max(0, initialDeposit);
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited: $" + amount);
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("Withdrew: $" + amount);
            return true;
        }
        System.out.println("Insufficient funds or invalid amount.");
        return false;
    }

    public double getBalance() {
        return balance;
    }

    public void displayAccountInfo() {
        System.out.println("Account: " + accountNumber + " | Holder: " + accountHolder + " | Balance: $" + balance);
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("BHASHA-101", "Scholar User", 500.0);
        account.displayAccountInfo();
        account.deposit(250.0);
        account.withdraw(100.0);
        account.displayAccountInfo();
    }
}
`
        },

        "cpp-task-manager": {
            title: "C++ High Performance Task Manager",
            subject: "C++",
            icon: "⚙️",
            lesson: "C++ • Structs & Pointers",
            language: "CPP",
            file: "main.cpp",
            description: "Build a command-line task tracker utilizing dynamic memory allocation and pointer-linked structures.",
            xp: 150,
            defaultProgress: 0,
            instructions: [
                "Define a Task struct containing ID, description, and status.",
                "Manage task list with dynamic pointer arrays or linked lists.",
                "Provide functions to insert, view, toggle status, and delete tasks.",
                "Ensure all allocated heap memory is safely freed upon exit."
            ],
            requirements: [
                "Pointers",
                "Structs",
                "Memory Management",
                "Functions",
                "Console I/O"
            ],
            starterCode: `#include <iostream>
#include <string>
#include <vector>

struct Task {
    int id;
    std::string title;
    bool completed;
};

class TaskManager {
private:
    std::vector<Task> tasks;
    int nextId = 1;

public:
    void addTask(const std::string& title) {
        tasks.push_back({nextId++, title, false});
        std::cout << "Task added successfully!\\n";
    }

    void listTasks() const {
        std::cout << "\\n--- Active Tasks ---\\n";
        for (const auto& task : tasks) {
            std::cout << "[" << (task.completed ? "X" : " ") << "] "
                      << task.id << ": " << task.title << "\\n";
        }
    }
};

int main() {
    std::cout << "Bhasha C++ Task Manager Online\\n";
    TaskManager manager;
    manager.addTask("Review OOP concepts");
    manager.addTask("Implement pointer logic");
    manager.listTasks();
    return 0;
}
`
        },

        "student-management": {
            title: "Student Management System",
            subject: "Java",
            icon: "☕",
            lesson: "Java • OOP & Classes",
            language: "JAVA",
            file: "Main.java",
            description: "Create a simple student management system using Java and object-oriented programming concepts.",
            xp: 120,
            defaultProgress: 0,
            instructions: [
                "Create a Student class containing student information.",
                "Add properties such as name, roll number, and marks.",
                "Create constructors to initialize student objects.",
                "Add methods to display student information and grade calculations.",
                "Create multiple Student objects and test your program."
            ],
            requirements: [
                "Classes",
                "Objects",
                "Constructors",
                "Methods",
                "OOP"
            ],
            starterCode: `// Student Management System

class Student {
    private String name;
    private int rollNumber;
    private double marks;

    public Student(String name, int rollNumber, double marks) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.marks = marks;
    }

    public char calculateGrade() {
        if (marks >= 90) return 'A';
        if (marks >= 80) return 'B';
        if (marks >= 70) return 'C';
        if (marks >= 60) return 'D';
        return 'F';
    }

    public void display() {
        System.out.println("Roll No: " + rollNumber + " | Name: " + name + " | Marks: " + marks + " | Grade: " + calculateGrade());
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Aarav", 101, 92.5);
        Student s2 = new Student("Diya", 102, 84.0);
        s1.display();
        s2.display();
    }
}
`
        },

        "number-game": {
            title: "Number Guessing Game",
            subject: "C++",
            icon: "⚙️",
            lesson: "C++ • Conditionals & Loops",
            language: "CPP",
            file: "main.cpp",
            description: "Create an interactive number guessing challenge in C++ using loops and conditional logic.",
            xp: 80,
            defaultProgress: 0,
            instructions: [
                "Generate or choose a target secret number.",
                "Prompt the player to guess the secret value.",
                "Indicate whether the guess is higher or lower than the target.",
                "Track total attempts until the player guesses correctly.",
                "Congratulate the player with performance statistics."
            ],
            requirements: [
                "Variables",
                "Loops",
                "if/else",
                "Input / Output",
                "Random Numbers"
            ],
            starterCode: `#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned int>(std::time(nullptr)));
    int secret = (std::rand() % 100) + 1;
    int guess = 0;
    int attempts = 0;

    std::cout << "=== Bhasa_AI Number Guessing Challenge ===\\n";
    std::cout << "I'm thinking of a number between 1 and 100.\\n";

    while (guess != secret) {
        std::cout << "Enter your guess: ";
        if (!(std::cin >> guess)) break;
        attempts++;

        if (guess < secret) {
            std::cout << "Too low! Try again.\\n";
        } else if (guess > secret) {
            std::cout << "Too high! Try again.\\n";
        } else {
            std::cout << "Bravo! You guessed the number in " << attempts << " attempts!\\n";
        }
    }

    return 0;
}
`
        },

        "my-introduction": {
            title: "Personal Introduction",
            subject: "English",
            icon: "🇬🇧",
            lesson: "English • Vocabulary & Structure",
            language: "TEXT",
            file: "introduction.txt",
            description: "Write a professional self-introduction for interviews using clear grammar and vocabulary.",
            xp: 60,
            defaultProgress: 0,
            instructions: [
                "Write your name and basic introductory background.",
                "Describe your current studies and technical interests.",
                "Mention two notable hobbies or strengths.",
                "Articulate your future career aspirations.",
                "Verify correct grammar, punctuation, and sentence flow."
            ],
            requirements: [
                "Vocabulary",
                "Grammar",
                "Sentence Structure",
                "Clarity",
                "Professional Tone"
            ],
            starterCode: `# Professional Self-Introduction

Hello and warm greetings!

My name is __________________________.
I am currently studying software development with a passion for building AI-assisted tools.

My primary technical interests include Python programming, web development, and problem solving.
In my free time, I enjoy reading technology blogs, contributing to open-source discussions, and learning languages.

My career goal is to become an accomplished software engineer and build products that empower learners worldwide.

Thank you for your time and consideration!
`
        },

        "todo-list": {
            title: "Task Manager CLI",
            subject: "Python",
            icon: "📝",
            lesson: "Python • Lists & Loops",
            language: "PYTHON",
            file: "todo.py",
            description: "Build a command-line to-do list manager using Python lists, dictionaries, and file I/O.",
            xp: 90,
            defaultProgress: 0,
            instructions: [
                "Create a structured list to store pending and completed tasks.",
                "Allow users to add, view, mark complete, and remove tasks.",
                "Implement an interactive terminal menu loop.",
                "Handle invalid choices gracefully with informative feedback."
            ],
            requirements: [
                "Lists",
                "Loops",
                "Functions",
                "Dictionaries",
                "Input Validation"
            ],
            starterCode: `# Bhasa_AI Task Manager CLI

tasks = []

def add_task(title):
    tasks.append({"title": title, "done": False})
    print(f"Task added: '{title}'")

def list_tasks():
    print("\n--- Current Tasks ---")
    if not tasks:
        print("No tasks found.")
        return
    for idx, t in enumerate(tasks, 1):
        status = "✓" if t["done"] else " "
        print(f"[{status}] {idx}. {t['title']}")

def complete_task(index):
    if 0 <= index < len(tasks):
        tasks[index]["done"] = True
        print(f"Completed task: {tasks[index]['title']}")
    else:
        print("Invalid task number.")

# Interactive loop
add_task("Learn Python basics")
add_task("Build terminal calculator")
list_tasks()
`
        },

        "banking-system": {
            title: "Banking Account System",
            subject: "Java",
            icon: "🏦",
            lesson: "Java • Encapsulation",
            language: "JAVA",
            file: "Bank.java",
            description: "Design an OOP banking account system with balance safeguards and deposit/withdraw audit checks.",
            xp: 150,
            defaultProgress: 0,
            instructions: [
                "Create a BankAccount class with private balance fields.",
                "Add deposit and withdraw methods with zero/negative protection.",
                "Create a test harness in main to verify account operations.",
                "Display current balances with formatted output."
            ],
            requirements: [
                "Encapsulation",
                "Methods",
                "Classes",
                "Objects",
                "Security Safeguards"
            ],
            starterCode: `// Java Banking Account System

class BankAccount {
    private String holder;
    private double balance;

    public BankAccount(String holder, double initialDeposit) {
        this.holder = holder;
        this.balance = Math.max(0, initialDeposit);
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.printf("Deposited: $%.2f | New Balance: $%.2f%n", amount, balance);
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.printf("Withdrew: $%.2f | New Balance: $%.2f%n", amount, balance);
            return true;
        }
        System.out.println("Withdrawal rejected: Insufficient funds or invalid amount.");
        return false;
    }

    public double getBalance() {
        return balance;
    }
}

public class Bank {
    public static void main(String[] args) {
        BankAccount acct = new BankAccount("User 16", 1000.0);
        acct.deposit(250.0);
        acct.withdraw(500.0);
    }
}
`
        },
        "technical-doc-writing": {
            title: "API Technical Documentation Guide",
            subject: "English",
            icon: "📝",
            lesson: "Technical English • Technical Writing",
            language: "MARKDOWN",
            file: "api_docs.md",
            description: "Draft comprehensive API technical documentation, endpoint specifications, parameter tables, and integration examples.",
            xp: 90,
            defaultProgress: 0,
            instructions: [
                "Document a RESTful authentication API endpoint with request and response schemas.",
                "Use precise, formal technical vocabulary and active imperative voice.",
                "Format markdown tables for query parameters, request headers, and status codes.",
                "Provide realistic cURL request samples and JSON payload responses.",
                "Include clear error-handling documentation and troubleshooting advice."
            ],
            requirements: [
                "Technical Writing",
                "API Documentation",
                "Clarity & Tone",
                "Markdown",
                "Developer Experience"
            ],
            starterCode: `# API Technical Documentation: User Authentication Service\n\n## 1. Overview\nThe User Authentication Service provides token-based authentication (JWT) for the Bhasa_AI platform.\n\n## 2. Authentication Endpoint\n\`POST /api/auth/token\`\n\n### Request Headers\n| Header | Type | Required | Description |\n|---|---|---|---|\n| Content-Type | string | Yes | application/x-www-form-urlencoded |\n\n### Parameters\n| Field | Type | Required | Description |\n|---|---|---|---|\n| username | string | Yes | Registered user email address |\n| password | string | Yes | Plaintext password |\n\n### Success Response (200 OK)\n\`\`\`json\n{\n  "access_token": "eyJhbGciOi...",\n  "token_type": "bearer"\n}\n\`\`\`\n`
        },

        "pr-code-review-kit": {
            title: "Code Review & PR Communication Guide",
            subject: "English",
            icon: "💬",
            lesson: "Technical English • Professional Communication",
            language: "MARKDOWN",
            file: "pull_request.md",
            description: "Craft professional Pull Request descriptions, architectural change summaries, and constructive code review feedback.",
            xp: 100,
            defaultProgress: 0,
            instructions: [
                "Write a structured pull request description with context, changes, and testing notes.",
                "Draft constructive, professional code review suggestions using empathetic language.",
                "Write concise release notes detailing new features and breaking changes.",
                "Formulate clear incident post-mortem communication for engineering teams."
            ],
            requirements: [
                "Professional Communication",
                "Code Review",
                "Constructive Feedback",
                "Release Notes",
                "Technical Vocabulary"
            ],
            starterCode: `# Pull Request: Implement Subject Isolation in Projects Workspace\n\n## Summary of Changes\nThis pull request refactors the projects catalog and detail workspaces to strictly enforce server-side subject isolation across Python, Java, C++, Technical English, and General Concepts.\n\n### Key Modifications\n1. Server-Side Subject Filtering: Updated /api/content/projects with case-insensitive subject normalization.\n2. Category Isolation: Eliminated cross-subject leakage.\n\n## Testing & Verification\n- [x] Verified all 5 categories return only their respective subject projects.\n- [x] Verified user progress, XP, and streak scores are preserved.\n`
        },

        "dbms-schema-designer": {
            title: "Relational Database Schema & SQL Design",
            subject: "General",
            icon: "🗄️",
            lesson: "General Concepts • Database Management",
            language: "SQL",
            file: "schema.sql",
            description: "Design normalized relational database schemas with primary/foreign keys, indexing strategies, and analytical SQL queries.",
            xp: 110,
            defaultProgress: 0,
            instructions: [
                "Design 3NF normalized tables for a multi-entity database schema.",
                "Define primary keys, foreign key constraints, and cascade delete rules.",
                "Write advanced multi-table SELECT queries with INNER and LEFT JOINs.",
                "Implement aggregations with GROUP BY and HAVING clauses.",
                "Create index definitions to optimize high-frequency search queries."
            ],
            requirements: [
                "DBMS",
                "Normalization",
                "SQL Queries",
                "Foreign Keys",
                "Indexing"
            ],
            starterCode: `-- Relational Database Schema & SQL Query Suite\n\nCREATE TABLE IF NOT EXISTS departments (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    dept_name VARCHAR(100) NOT NULL UNIQUE,\n    building VARCHAR(50) NOT NULL\n);\n\nCREATE TABLE IF NOT EXISTS courses (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    course_code VARCHAR(20) NOT NULL UNIQUE,\n    title VARCHAR(200) NOT NULL,\n    department_id INTEGER NOT NULL,\n    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE\n);\n\nSELECT d.dept_name, COUNT(c.id) AS total_courses\nFROM departments d\nLEFT JOIN courses c ON d.id = c.department_id\nGROUP BY d.id, d.dept_name;\n`
        },

        "algorithm-complexity-analyzer": {
            title: "Algorithm Complexity & Sorting Benchmark",
            subject: "General",
            icon: "📊",
            lesson: "General Concepts • Algorithms & Data Structures",
            language: "PSEUDOCODE",
            file: "analysis.txt",
            description: "Analyze asymptotic time and space complexity (Big-O) across searching, sorting, and tree traversal algorithms.",
            xp: 120,
            defaultProgress: 0,
            instructions: [
                "Derive Big-O asymptotic bounds for linear search, binary search, and bubble sort.",
                "Analyze worst-case, best-case, and average-case behaviors of QuickSort vs MergeSort.",
                "Compare array-based vs linked-list-based queue and stack memory layouts.",
                "Design pseudocode for a divide-and-conquer algorithm with optimal complexity."
            ],
            requirements: [
                "Big-O Notation",
                "Time Complexity",
                "Space Complexity",
                "Data Structures",
                "Algorithm Analysis"
            ],
            starterCode: `==============================================================\nALGORITHM COMPLEXITY & PERFORMANCE BENCHMARK ANALYSIS\n==============================================================\n\n1. ASYMPTOTIC COMPLEXITY SUMMARY\nAlgorithm         Best Case      Average Case    Worst Case     Space\nLinear Search     O(1)           O(n)            O(n)           O(1)\nBinary Search     O(1)           O(log n)        O(log n)       O(1)\nMerge Sort        O(n log n)     O(n log n)      O(n log n)     O(n)\nQuick Sort        O(n log n)     O(n log n)      O(n^2)         O(log n)\n`
        }

    };

    // ============================================
    // 3. DOM ELEMENTS
    // ============================================
    const projectIcon = document.getElementById("projectIcon");
    const subjectBadge = document.getElementById("subjectBadge");
    const statusBadge = document.getElementById("statusBadge");
    const projectTitle = document.getElementById("projectTitle");
    const projectDescription = document.getElementById("projectDescription");
    const projectXP = document.getElementById("projectXP");
    const relatedLesson = document.getElementById("relatedLesson");
    const languageLabel = document.getElementById("languageLabel");
    const fileName = document.getElementById("fileName");
    const codeEditor = document.getElementById("codeEditor");
    const projectNotes = document.getElementById("projectNotes");
    const instructions = document.getElementById("instructions");
    const progressPercent = document.getElementById("progressPercent");
    const progressBar = document.getElementById("progressBar");
    const progressStatusText = document.getElementById("progressStatusText");
    const headerMiniPercent = document.getElementById("headerMiniPercent");
    const headerMiniFill = document.getElementById("headerMiniFill");
    const completeBtn = document.getElementById("completeBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    const saveBtn = document.getElementById("saveBtn");
    const saveStatus = document.getElementById("saveStatus");
    const completionModal = document.getElementById("completionModal");
    const rewardXP = document.getElementById("rewardXP");
    const modalClose = document.getElementById("modalClose");
    const lessonBtn = document.getElementById("lessonBtn");
    const progressButtons = document.querySelectorAll(".progress-btn");
    const checkboxes = document.querySelectorAll(".task-checkbox");

    // ============================================
    // 4. LOAD AUTHENTICATED USER PROFILE (TOPBAR/SIDEBAR)
    // ============================================
    async function loadUserProfile() {
        let profile = null;
        if (window.BhashaAPI) {
            try {
                profile = await window.BhashaAPI.getProfile();
            } catch (err) {
                console.warn("[Project] Profile sync warning:", err);
            }
        }

        const name = (profile && profile.full_name) || localStorage.getItem("bhasha_user_name") || "Scholar";
        const xp = (profile && profile.total_xp !== undefined) ? profile.total_xp : parseInt(localStorage.getItem("bhasha_xp") || "0", 10);
        const streak = (profile && profile.streak_days !== undefined) ? profile.streak_days : parseInt(localStorage.getItem("bhasha_streak") || "0", 10);
        const level = (profile && profile.current_level) || Math.max(1, Math.floor(xp / 300));

        const topStreak = document.getElementById("topStreak");
        if (topStreak) topStreak.textContent = streak;
        const sidebarStreakText = document.getElementById("sidebarStreakText");
        if (sidebarStreakText) sidebarStreakText.textContent = `${streak} Day Streak`;
        const topXp = document.getElementById("topXp");
        if (topXp) topXp.textContent = `${xp.toLocaleString()} XP`;
        const topUserName = document.getElementById("topUserName");
        if (topUserName) topUserName.textContent = name;
        const topUserLevel = document.getElementById("topUserLevel");
        if (topUserLevel) topUserLevel.textContent = `Level ${level}`;
        const topAvatar = document.getElementById("topAvatar");
        if (topAvatar) topAvatar.textContent = (name || "S").charAt(0).toUpperCase();
    }
    loadUserProfile();

    // ============================================
    // 5. PROJECT RESOLUTION & CUSTOM TEMPLATE SETUP
    // ============================================
    let project = null;

    if (isNewProject) {
        const template = customTemplates[activeSubject] || customTemplates.Python;
        project = {
            ...template,
            slug: projectId
        };
        projectData[projectId] = project;
    } else if (projectData[projectId]) {
        project = projectData[projectId];
    } else {
        // Try fetching metadata from backend
        if (window.BhashaAPI && typeof window.BhashaAPI.getProjectDetail === "function") {
            try {
                const backendProj = await window.BhashaAPI.getProjectDetail(projectId);
                if (backendProj) {
                    project = {
                        title: backendProj.title,
                        subject: backendProj.subject,
                        icon: backendProj.icon,
                        lesson: backendProj.lesson,
                        language: backendProj.language,
                        file: backendProj.file,
                        description: backendProj.description,
                        xp: backendProj.xp,
                        defaultProgress: backendProj.defaultProgress || 0,
                        instructions: backendProj.instructions || [],
                        requirements: backendProj.requirements || [],
                        starterCode: backendProj.starter_code || ""
                    };
                    projectData[projectId] = project;
                }
            } catch (_) {}
        }
    }

    // 6. INVALID PROJECT HANDLING
    if (!project) {
        if (projectTitle) projectTitle.textContent = "Project Not Found";
        if (projectDescription) projectDescription.textContent = "The requested project does not exist in the curriculum.";
        if (instructions) instructions.innerHTML = "<p style='color: var(--c-sage); padding: 16px;'>Please select a valid project from the projects catalog.</p>";
        return;
    }

    // ============================================
    // 7. LOAD PROJECT WORKSPACE & REAL BACKEND SYNC
    // ============================================
    await loadProjectWorkspace();

    async function loadProjectWorkspace() {
        // Base catalog metadata
        if (projectIcon) projectIcon.textContent = project.icon;
        if (subjectBadge) subjectBadge.textContent = project.subject;
        if (projectTitle) projectTitle.textContent = project.title;
        if (projectDescription) projectDescription.textContent = project.description;
        if (projectXP) projectXP.textContent = project.xp;
        if (rewardXP) rewardXP.textContent = project.xp;
        if (relatedLesson) relatedLesson.textContent = project.lesson;
        if (languageLabel) languageLabel.textContent = project.language;
        if (fileName) fileName.textContent = project.file;

        // Render Instructions
        if (instructions) {
            instructions.innerHTML = "";
            const intro = document.createElement("p");
            intro.className = "instruction-intro";
            intro.textContent = "Complete the following tasks to finish your project:";
            instructions.appendChild(intro);

            const list = document.createElement("ul");
            list.className = "instruction-list";
            project.instructions.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                list.appendChild(li);
            });
            instructions.appendChild(list);

            const requirements = document.createElement("div");
            requirements.className = "requirements";
            const reqTitle = document.createElement("strong");
            reqTitle.textContent = "CONCEPTS USED";
            requirements.appendChild(reqTitle);

            project.requirements.forEach(item => {
                const span = document.createElement("span");
                span.textContent = item;
                requirements.appendChild(span);
            });
            instructions.appendChild(requirements);
        }

        // Try fetching latest metadata from backend
        if (window.BhashaAPI && typeof window.BhashaAPI.getProjectDetail === "function") {
            try {
                const backendProj = await window.BhashaAPI.getProjectDetail(projectId);
                if (backendProj) {
                    if (backendProj.title) projectTitle.textContent = backendProj.title;
                    if (backendProj.description) projectDescription.textContent = backendProj.description;
                    if (backendProj.xp) {
                        projectXP.textContent = backendProj.xp;
                        rewardXP.textContent = backendProj.xp;
                    }
                    if (backendProj.lesson) relatedLesson.textContent = backendProj.lesson;
                }
            } catch (_) {}
        }

        // ----------------------------------------------------
        // FETCH REAL PROGRESS & SYNC STATE
        // ----------------------------------------------------
        let backendRecord = null;
        if (window.BhashaAPI && typeof window.BhashaAPI.getSavedProjectProgress === "function") {
            try {
                backendRecord = await window.BhashaAPI.getSavedProjectProgress(projectId);
            } catch (err) {
                console.warn("[Project] Backend progress fetch error:", err);
            }
        }

        const localSaved = getSavedProject();

        // Priority 1: Backend record is the single source of truth for completion & official progress
        if (backendRecord) {
            const isDone = Boolean(backendRecord.is_completed || backendRecord.progress_percent >= 100);
            const officialPct = isDone ? 100 : Math.max(0, Math.min(100, Math.round(backendRecord.progress_percent || 0)));

            // Code: prefer saved code from backend or local edits
            codeEditor.value = backendRecord.saved_code || (localSaved && localSaved.code) || project.starterCode;
            projectNotes.value = (localSaved && localSaved.notes) || "";

            setProgress(officialPct);

            if (isDone) {
                showCompletedState(false);
                checkboxes.forEach(cb => { cb.checked = true; });
            } else if (localSaved && Array.isArray(localSaved.checklist)) {
                restoreChecklist(localSaved.checklist);
            } else {
                restoreChecklistByPercent(officialPct);
            }

            // Sync local storage copy with backend record
            saveProjectLocal({
                code: codeEditor.value,
                notes: projectNotes.value,
                progress: officialPct,
                completed: isDone,
                checklist: Array.from(checkboxes).map(c => c.checked)
            });
            return;
        }

        // Priority 2: Unstarted or offline work in localStorage
        if (localSaved) {
            codeEditor.value = localSaved.code || project.starterCode;
            projectNotes.value = localSaved.notes || "";
            const savedPct = Math.max(0, Math.min(100, Math.round(Number(localSaved.progress) || 0)));
            setProgress(savedPct);
            restoreChecklist(localSaved.checklist || []);

            if (localSaved.completed && savedPct >= 100) {
                showCompletedState(false);
            }
            return;
        }

        // Priority 3: Truly unstarted project -> STRICTLY 0%, NOT STARTED
        codeEditor.value = project.starterCode;
        projectNotes.value = "";
        setProgress(0);
        checkboxes.forEach(cb => { cb.checked = false; });
        if (completeBtn) {
            completeBtn.textContent = "✓ Mark Project Complete";
            completeBtn.classList.remove("completed");
        }
    }

    // ============================================
    // 8. STORAGE HELPERS
    // ============================================
    function storageKey() {
        return `bhasha_project_${projectId}`;
    }

    function getSavedProject() {
        try {
            const saved = localStorage.getItem(storageKey());
            return saved ? JSON.parse(saved) : null;
        } catch (_) {
            return null;
        }
    }

    function saveProjectLocal(data) {
        try {
            const existing = getSavedProject() || {};
            const payload = {
                projectId,
                code: data.code !== undefined ? data.code : codeEditor.value,
                notes: data.notes !== undefined ? data.notes : projectNotes.value,
                progress: data.progress !== undefined ? data.progress : getProjectProgressPercent(),
                checklist: data.checklist || Array.from(checkboxes).map(c => c.checked),
                completed: data.completed !== undefined ? data.completed : isProjectCompleted(),
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(storageKey(), JSON.stringify(payload));
        } catch (_) {}
    }

    function getProjectProgressPercent() {
        return Number(progressPercent ? progressPercent.textContent : 0) || 0;
    }

    function isProjectCompleted() {
        const curProgress = getProjectProgressPercent();
        const isMarkedCompleted = completeBtn && completeBtn.classList.contains("completed");
        const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        const hasCode = Boolean(codeEditor && codeEditor.value.trim().length > 0);
        return Boolean(hasCode && curProgress >= 100 && (isMarkedCompleted || allChecked));
    }

    // ============================================
    // 9. PROGRESS UPDATER & UI SYNC
    // ============================================
    function setProgress(value) {
        const val = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

        // Workspace main bar
        if (progressPercent) progressPercent.textContent = val;
        if (progressBar) progressBar.style.width = `${val}%`;

        // Workspace header mini bar
        if (headerMiniPercent) headerMiniPercent.textContent = `${val}%`;
        if (headerMiniFill) headerMiniFill.style.width = `${val}%`;

        // Status badge & text styling
        if (val === 0) {
            if (progressStatusText) progressStatusText.textContent = "Ready to start!";
            if (statusBadge) {
                statusBadge.textContent = "Not Started";
                statusBadge.className = "project-status not-started";
            }
        } else if (val < 100) {
            if (progressStatusText) progressStatusText.textContent = "In Progress 🚀";
            if (statusBadge) {
                statusBadge.textContent = "In Progress";
                statusBadge.className = "project-status in-progress";
            }
        } else {
            if (progressStatusText) progressStatusText.textContent = "Amazing work! 🎉";
            if (statusBadge) {
                statusBadge.textContent = "Completed";
                statusBadge.className = "project-status completed";
            }
        }

        // Active state on progress percentage buttons (0, 25, 50, 75, 100)
        progressButtons.forEach(btn => {
            const btnVal = Number(btn.dataset.progress);
            if (btnVal === val) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (val === 100 && completeBtn) {
            completeBtn.disabled = false;
        }
    }

    // ============================================
    // 10. SAVE PROJECT (LOCAL & BACKEND)
    // ============================================
    let autoSaveTimer = null;

    async function saveProject(showMessage = true) {
        const curProgress = getProjectProgressPercent();
        const completed = isProjectCompleted();
        const codeVal = codeEditor.value;
        const notesVal = projectNotes.value;
        const checklistVals = Array.from(checkboxes).map(c => c.checked);

        // 1. Save to localStorage immediately
        saveProjectLocal({
            code: codeVal,
            notes: notesVal,
            progress: curProgress,
            checklist: checklistVals,
            completed
        });

        // 2. Persist to FastAPI Backend
        if (window.BhashaAPI && typeof window.BhashaAPI.saveProjectProgress === "function") {
            try {
                // If custom project and createProject is supported, ensure project exists in backend
                if (isNewProject && typeof window.BhashaAPI.createProject === "function") {
                    try {
                        await window.BhashaAPI.createProject({
                            slug: projectId,
                            title: project.title,
                            subject: project.subject,
                            icon: project.icon,
                            lesson: project.lesson,
                            language: project.language,
                            file: project.file,
                            description: project.description,
                            xp: project.xp,
                            instructions: project.instructions,
                            requirements: project.requirements,
                            starter_code: codeVal
                        });
                    } catch (_) {}
                }

                await window.BhashaAPI.saveProjectProgress({
                    project_id: projectId,
                    subject: project.subject,
                    saved_code: codeVal,
                    progress_percent: curProgress,
                    is_completed: completed
                });
            } catch (err) {
                console.warn("[Project] Backend save error:", err);
            }
        }

        if (showMessage && saveStatus) {
            saveStatus.textContent = "✓ Saved just now";
            saveStatus.style.color = "var(--c-emerald-light, #86efac)";

            setTimeout(() => {
                saveStatus.textContent = "Saved";
                saveStatus.style.color = "var(--c-sage, #8EA390)";
            }, 2500);
        }
    }

    function triggerAutoSave() {
        if (saveStatus) {
            saveStatus.textContent = "Unsaved changes...";
            saveStatus.style.color = "#E5D48B";
        }
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveProject(true);
        }, 800);
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", () => saveProject(true));
    }

    if (projectNotes) {
        projectNotes.addEventListener("input", triggerAutoSave);
    }

    if (codeEditor) {
        codeEditor.addEventListener("input", triggerAutoSave);
    }

    // ============================================
    // 11. PROGRESS BUTTONS (0%, 25%, 50%, 75%, 100%)
    // ============================================
    progressButtons.forEach(button => {
        button.addEventListener("click", () => {
            const value = Number(button.dataset.progress);
            setProgress(value);

            // Sync checklist items proportionally
            restoreChecklistByPercent(value);

            if (value >= 100) {
                showCompletedState(false);
            } else if (completeBtn && completeBtn.classList.contains("completed")) {
                completeBtn.textContent = "✓ Mark Project Complete";
                completeBtn.classList.remove("completed");
            }

            saveProject(false);
        });
    });

    // ============================================
    // 12. CHECKLIST INTERACTION
    // ============================================
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            updateChecklistProgress();
            saveProject(false);
        });
    });

    function updateChecklistProgress() {
        const total = checkboxes.length;
        if (total === 0) return;

        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const progress = Math.round((checked / total) * 100);

        setProgress(progress);

        if (progress === 100) {
            showCompletedState(false);
        } else if (completeBtn && completeBtn.classList.contains("completed")) {
            completeBtn.textContent = "✓ Mark Project Complete";
            completeBtn.classList.remove("completed");
        }
    }

    function restoreChecklist(savedArr) {
        if (!Array.isArray(savedArr)) return;
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = Boolean(savedArr[index]);
        });
    }

    function restoreChecklistByPercent(pct) {
        const total = checkboxes.length;
        if (total === 0) return;
        const countToCheck = Math.round((pct / 100) * total);
        checkboxes.forEach((cb, idx) => {
            cb.checked = idx < countToCheck;
        });
    }

    // ============================================
    // 13. COMPLETE PROJECT & CELEBRATION MODAL
    // ============================================
    if (completeBtn) {
        completeBtn.addEventListener("click", async () => {
            if (!codeEditor.value || codeEditor.value.trim().length === 0) {
                alert("Please write your project code before completing the project.");
                return;
            }

            const currentProgress = getProjectProgressPercent();
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);

            if (currentProgress < 100 || !allChecked) {
                const confirmComplete = confirm(
                    "Your checklist tasks are not fully checked. Mark all tasks complete and finish the project?"
                );
                if (!confirmComplete) return;
                checkboxes.forEach(cb => { cb.checked = true; });
            }

            setProgress(100);
            showCompletedState(true);
            await saveProject(true);
        });
    }

    function showCompletedState(showModal) {
        if (completeBtn) {
            completeBtn.textContent = "✓ Project Completed";
            completeBtn.classList.add("completed");
        }

        setProgress(100);

        if (showModal && completionModal) {
            completionModal.classList.add("show");
        }
    }

    if (modalClose && completionModal) {
        modalClose.addEventListener("click", () => {
            completionModal.classList.remove("show");
        });

        completionModal.addEventListener("click", event => {
            if (event.target === completionModal) {
                completionModal.classList.remove("show");
            }
        });
    }

    // ============================================
    // 14. DELETE SAVED WORK
    // ============================================
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            const confirmed = confirm(
                "Are you sure you want to reset this project? All saved code, notes, and progress will be cleared."
            );
            if (!confirmed) return;

            // Remove from local storage
            localStorage.removeItem(storageKey());

            // Reset backend state if user is logged in
            if (window.BhashaAPI && typeof window.BhashaAPI.saveProjectProgress === "function") {
                try {
                    await window.BhashaAPI.saveProjectProgress({
                        project_id: projectId || "python-calculator",
                        saved_code: project.starterCode,
                        progress_percent: 0,
                        is_completed: false
                    });
                } catch (e) {
                    console.warn("[Project] Reset backend warning:", e);
                }
            }

            // Reset UI
            codeEditor.value = project.starterCode;
            projectNotes.value = "";
            setProgress(0);
            checkboxes.forEach(cb => { cb.checked = false; });
            if (completeBtn) {
                completeBtn.textContent = "✓ Mark Project Complete";
                completeBtn.classList.remove("completed");
            }
            if (saveStatus) {
                saveStatus.textContent = "Saved work reset";
                saveStatus.style.color = "var(--c-sage)";
            }

            // Redirect back to catalog
            const subjectParam = (project && project.subject) ? project.subject : activeSubject;
            window.location.href = `projects.html?subject=${encodeURIComponent(subjectParam)}`;
        });
    }

    // ============================================
    // 15. BACK TO PROJECTS
    // ============================================
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", async () => {
            try {
                await saveProject(false);
            } catch (_) {}
            const subjectParam = (project && project.subject) ? project.subject : activeSubject;
            window.location.href = `projects.html?subject=${encodeURIComponent(subjectParam)}`;
        });
    }

    // ============================================
    // 16. VIEW RELATED LESSON
    // ============================================
    if (lessonBtn) {
        lessonBtn.addEventListener("click", () => {
            const subjectParam = (project && project.subject) ? project.subject : activeSubject;
            window.location.href = `subject.html?subject=${encodeURIComponent(subjectParam)}`;
        });
    }

});
