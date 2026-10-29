"""
Bhasa_AI Academic Programming & Technical English Tutor Knowledge Engine
Provides patient, beginner-friendly, structured pedagogical explanations,
code examples, debugging analysis, and practice exercises when Gemini API
is unconfigured, rate-limited, or operating in offline fallback mode.
"""

import re
from typing import List, Optional, Any


def normalize_subject(subject: Optional[str]) -> str:
    """Safely normalizes subject string without silently forcing Python."""
    if not subject:
        return "General"
    s = str(subject).strip().lower()
    if s in ("python", "py"):
        return "Python"
    if s in ("java",):
        return "Java"
    if s in ("c++", "cpp", "c plus plus"):
        return "C++"
    if s in ("english", "technical english", "tech english"):
        return "English"
    if s in ("general", "general concepts", "cs", "computer science"):
        return "General"
    return "General"


# -----------------------------------------------------------------------------
# 1. JAVA KNOWLEDGE REPOSITORY
# -----------------------------------------------------------------------------

JAVA_OOPS_EXPLANATION = """### Understanding Java OOPs in Simple Terms ☕

**Object-Oriented Programming (OOP) in Java** is a way of designing software by modeling real-world entities as **objects** that bundle their own data (attributes) and actions (methods) together.

Instead of writing disorganized scripts, OOP divides complex software into modular, reusable, and maintainable building blocks.

---

### 1. The Core Foundation: Classes and Objects

* **Class (The Blueprint):** A class is a template or specification defining what variables and methods an entity will have. For example, a blueprint for a `Car`.
* **Object (The Real Instance):** An object is the actual concrete instance created in memory from that class. For example, a red sedan parked in your driveway is an object of the `Car` class.

---

### 2. The Four Pillars of OOP

Java OOP is founded upon four core principles:

1. **Encapsulation (Data Protection):**
   * Keeping class fields `private` so external code cannot modify or corrupt them directly.
   * Providing controlled access through public **getters** (to read) and **setters** (to validate before updating).

2. **Inheritance (Code Reuse):**
   * Allowing a child class (subclass) to inherit fields and methods from a parent class (superclass) using the `extends` keyword.
   * Eliminates duplicate code (e.g., `Dog` inherits common traits from `Animal`).

3. **Polymorphism ("Many Forms"):**
   * The ability of a method to perform different behaviors depending on the object invoking it.
   * **Compile-time (Overloading):** Methods sharing the same name but differing parameter lists.
   * **Runtime (Overriding):** A subclass providing its own specific implementation with `@Override`.

4. **Abstraction (Hiding Complexity):**
   * Exposing only the essential interface to the programmer while concealing the internal mechanics.
   * Achieved using `abstract` classes and `interface` contracts.

---

### Step-by-Step Java Example

```java
// 1. Abstraction: Contract defining essential behavior
abstract class Animal {
    // 2. Encapsulation: Private data field
    private String name;

    public Animal(String name) {
        this.name = name;
    }

    // Public getter method
    public String getName() {
        return name;
    }

    // Abstract method: every concrete animal subclass must implement this
    public abstract void makeSound();
}

// 3. Inheritance: Dog inherits state and behavior from Animal
class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    // 4. Polymorphism: Dog supplies its own sound implementation
    @Override
    public void makeSound() {
        System.out.println(getName() + " says: Woof! Woof! 🐕");
    }
}

public class Main {
    public static void main(String[] args) {
        // Instantiating an Object from the Dog class
        Animal myDog = new Dog("Buddy");
        myDog.makeSound(); // Output: Buddy says: Woof! Woof! 🐕
    }
}
```

**Key Takeaway:** OOP organizes code like building with Lego blocks: every object has its own data and responsibilities, making programs clean, modular, and easy to scale!"""


JAVA_INHERITANCE_EXPLANATION = """### Understanding Inheritance in Java ☕

**Inheritance** in Java is an OOP mechanism where a new class (subclass/child) **acquires the fields and methods** of an existing class (superclass/parent) using the `extends` keyword.

It allows you to define a common baseline once and build specialized variations upon it.

---

### 1. Key Terminology

* **Superclass (Parent):** The existing class whose features are inherited.
* **Subclass (Child):** The new class that inherits features and can add its own attributes or override methods.
* **`extends` Keyword:** Establishes the inheritance relationship in Java.
* **`super` Keyword:** Invokes superclass constructors or parent method implementations.

---

### 2. Why Use Inheritance?

1. **Code Reusability:** Write shared logic once in the superclass; all child classes inherit it automatically.
2. **Method Overriding:** Subclasses can adapt inherited methods to fit their specific needs.
3. **IS-A Relationship:** Models natural hierarchies (e.g., a `Car` IS-A `Vehicle`).

---

### Step-by-Step Java Code Example

```java
// Parent Class (Superclass)
class Vehicle {
    protected String brand = "Toyota";

    public void honk() {
        System.out.println("Beep! Beep! 🚗");
    }
}

// Child Class (Subclass) inheriting from Vehicle
class Car extends Vehicle {
    private String modelName = "Corolla";

    public void displayDetails() {
        // Accesses inherited 'brand' and child's own 'modelName'
        System.out.println("Brand: " + brand + ", Model: " + modelName);
    }

    // Method Overriding: customizing parent behavior
    @Override
    public void honk() {
        System.out.println("Custom Car Horn: Honk! Honk! 🚙");
    }
}

public class Main {
    public static void main(String[] args) {
        Car myCar = new Car();
        myCar.displayDetails(); // Output: Brand: Toyota, Model: Corolla
        myCar.honk();           // Output: Custom Car Horn: Honk! Honk! 🚙
    }
}
```

---

### 3. Essential Java Inheritance Rules
* **Single Inheritance:** In Java, a class can directly extend only **one** superclass to prevent ambiguity.
* **Multiple Inheritance via Interfaces:** Java achieves multiple inheritance through `implements InterfaceA, InterfaceB`."""


JAVA_INTERFACES_EXPLANATION = """### Interfaces vs Abstract Classes in Java ☕

In Java, both **Interfaces** and **Abstract Classes** provide abstraction, but they serve different design purposes:

* An **Interface** is a pure contract defining *what* a class can do (100% abstraction).
* An **Abstract Class** is a partially implemented blueprint defining *what* an entity is, sharing code among closely related classes.

---

### Comparison Table

| Feature | Interface | Abstract Class |
| :--- | :--- | :--- |
| **Keyword** | `interface` / `implements` | `abstract class` / `extends` |
| **Inheritance** | Multiple (`implements A, B`) | Single (`extends A` only) |
| **State / Variables**| Only `public static final` constants | Can have instance variables (`private`, `protected`, etc.) |
| **Constructors** | Cannot have constructors | Can have constructors |
| **Default Methods** | Can have `default` & `static` methods (Java 8+) | Can have full concrete methods |

---

### Java Example

```java
// 1. Interface contract
interface Drivable {
    void accelerate(int speed);
    void brake();
}

// 2. Concrete class implementing the contract
class ElectricCar implements Drivable {
    private int currentSpeed = 0;

    @Override
    public void accelerate(int speed) {
        currentSpeed += speed;
        System.out.println("Accelerating to " + currentSpeed + " km/h ⚡");
    }

    @Override
    public void brake() {
        currentSpeed = 0;
        System.out.println("Vehicle stopped smoothly.");
    }
}

public class Main {
    public static void main(String[] args) {
        Drivable vehicle = new ElectricCar();
        vehicle.accelerate(60);
        vehicle.brake();
    }
}
```"""


JAVA_PRACTICE_QUESTIONS = """### 5 Practice Questions: Java Fundamentals & OOP 🎯

Here are five beginner-to-intermediate coding challenges in Java. Work through them progressively:

---

#### 1. Foundational: The Book Catalog 📚
* **Task:** Create a class named `Book` with attributes `title` (String), `author` (String), and `price` (double).
* Include a constructor to initialize all three fields and a method `displayInfo()` that prints the book details cleanly.
* In `main`, create two `Book` instances and call `displayInfo()` on each.
* **Hint:** Remember constructor syntax: `public Book(String title, String author, double price) { ... }`.

---

#### 2. Encapsulation: The Secure Bank Account 💳
* **Task:** Create a `BankAccount` class with private fields `accountNumber` (String) and `balance` (double).
* Provide a getter for `balance`, but **no direct setter**.
* Add two validated methods:
  * `deposit(double amount)`: Adds to balance only if `amount > 0`.
  * `withdraw(double amount)`: Deducts from balance only if `amount > 0` and `amount <= balance`.
* Test both valid and invalid operations in your `main` method.

---

#### 3. Inheritance & Overriding: Vehicle Fleet 🚗
* **Task:** Create a superclass `Vehicle` with `brand` (String) and method `startEngine()`.
* Create a subclass `ElectricCar` that extends `Vehicle`, adds `batteryCapacity` (int), and overrides `startEngine()` to print a silent start message.
* Use `super` in the constructor to set the brand.

---

#### 4. Polymorphism: Area Calculator 📐
* **Task:** Create an abstract class `Shape` with an abstract method `double calculateArea()`.
* Implement two subclasses: `Circle` (radius) and `Rectangle` (width, height).
* Create an array of `Shape` objects and loop through them, printing the calculated area for each shape polymorphically.

---

#### 5. Real-World Challenge: Student Grade Manager 🎓
* **Task:** Build a `Student` class with `name`, `rollNumber`, and an array of 4 integer exam scores (`int[] scores`).
* Add methods `calculateAverage()` and `getGrade()` (>= 90: 'A', >= 75: 'B', >= 50: 'C', else 'Needs Improvement').
* Instantiate three students, compute their averages, and print the student with the highest performance!"""


# -----------------------------------------------------------------------------
# 2. PYTHON KNOWLEDGE REPOSITORY
# -----------------------------------------------------------------------------

PYTHON_LISTS_EXPLANATION = """### Understanding Python Lists with Examples 🐍

In Python, a **list** is an ordered, mutable (changeable) collection that allows you to store multiple items in a single variable.

Lists are written with square brackets `[]` with items separated by commas.

---

### 1. Key Characteristics of Python Lists

* **Ordered:** Items preserve the sequence in which they were added. The first item is at index `0`.
* **Mutable:** You can add, update, replace, or delete items after the list is created.
* **Allows Duplicates:** Lists can store identical values multiple times.
* **Heterogeneous:** A single list can hold mixed data types (strings, integers, floats, booleans, or other lists).

---

### 2. Common Operations with Code Examples

```python
# 1. Creating a list
fruits = ["apple", "banana", "cherry", "mango"]
print("Original list:", fruits)

# 2. Accessing elements (0-indexed and negative indexing)
print("First fruit:", fruits[0])       # apple
print("Last fruit:", fruits[-1])        # mango

# 3. Slicing lists [start:stop]
print("Slice [1:3]:", fruits[1:3])     # ['banana', 'cherry']

# 4. Modifying items (mutability)
fruits[1] = "blueberry"
print("After modification:", fruits)   # ['apple', 'blueberry', 'cherry', 'mango']

# 5. Adding new items
fruits.append("orange")                # Appends to the end
fruits.insert(1, "kiwi")               # Inserts at index 1
print("After additions:", fruits)

# 6. Removing items
fruits.remove("cherry")                # Removes matching element by value
popped = fruits.pop()                  # Removes and returns last item ('orange')
print("Removed:", popped)
print("Current list:", fruits)

# 7. Iterating through a list with index
print("\\nBasket items:")
for index, fruit in enumerate(fruits, start=1):
    print(f"  {index}. {fruit}")
```

---

### 3. List Comprehensions (Pythonic Pro-Tip)

List comprehensions provide an expressive, single-line way to generate filtered and transformed lists:

```python
numbers = [1, 2, 3, 4, 5, 6]
# Squares of even numbers only
even_squares = [n ** 2 for n in numbers if n % 2 == 0]
print("Even squares:", even_squares)  # Output: [4, 16, 36]
```

**Key Takeaway:** Use lists whenever you need an ordered sequence of data that you can sort, modify, filter, or grow dynamically!"""


PYTHON_BASICS_EXPLANATION = """### Learning Python Basics: A Beginner's Guide 🐍

Python is designed to be readable, expressive, and beginner-friendly. Its clean syntax reads almost like plain English.

---

### 1. Variables and Data Types
In Python, variables are dynamically typed—you do not need to declare their type beforehand:

```python
name = "Harshit"      # String (str)
age = 21             # Integer (int)
gpa = 3.85           # Floating point (float)
is_enrolled = True   # Boolean (bool)

print(f"Student: {name}, Age: {age}, GPA: {gpa}")
```

---

### 2. Control Flow (`if`, `elif`, `else`)

```python
score = 85

if score >= 90:
    print("Grade: A - Outstanding! 🌟")
elif score >= 75:
    print("Grade: B - Great work! 👍")
else:
    print("Keep practicing daily! 📚")
```

---

### 3. Loops (`for` and `while`)

```python
# For loop iterating through a range
for i in range(1, 4):
    print(f"Attempt {i}")

# While loop with counter
countdown = 3
while countdown > 0:
    print(countdown)
    countdown -= 1
print("Launch! 🚀")
```

---

### 4. Writing Functions

```python
def calculate_area(width: float, height: float) -> float:
    \"\"\"Calculates and returns the area of a rectangle.\"\"\"
    return width * height

result = calculate_area(5.0, 3.0)
print(f"Calculated Area: {result}") # Output: 15.0
```

**Next Step:** Try creating a small project, such as a command-line calculator or a grade-tracking script!"""


PYTHON_PRACTICE_QUESTIONS = """### 5 Practice Challenges: Python Masterclass 🐍

Here are five beginner-to-intermediate Python challenges designed to test core programming logic:

---

#### 1. String Manipulation: Palindrome Checker 🔄
* **Task:** Write a function `is_palindrome(text: str) -> bool` that checks whether a word reads the same forwards and backwards, ignoring spaces and capitalization.
* **Test cases:** `"radar"` &rarr; `True`, `"Racecar"` &rarr; `True`, `"python"` &rarr; `False`.
* **Hint:** Convert to lowercase with `.lower()` and clean non-alphanumeric characters.

---

#### 2. List Operations: Unique Items Filter 🧹
* **Task:** Given a list `[1, 2, 2, 3, 4, 4, 4, 5, 1]`, write a function that returns a new list containing only unique items in their original order.
* **Constraint:** Do not use `list(set(...))` if it alters original element order.

---

#### 3. Dictionary Aggregator: Word Frequency Counter 📊
* **Task:** Write a function `count_words(sentence: str) -> dict` that counts how many times each word appears in the given sentence.
* **Example:** `"code learn code practice"` &rarr; `{"code": 2, "learn": 1, "practice": 1}`.
* **Hint:** Use `.split()` and dictionary `.get(word, 0) + 1`.

---

#### 4. Comprehensions: FizzBuzz List ⚡
* **Task:** Using a single list comprehension or concise loop, generate numbers 1 to 20 where multiples of 3 are `"Fizz"`, multiples of 5 are `"Buzz"`, and multiples of both are `"FizzBuzz"`.

---

#### 5. Object-Oriented Logic: Task Manager 📋
* **Task:** Create a `Task` class with `title`, `priority` (High/Medium/Low), and `is_completed` (bool).
* Add methods `mark_done()` and `display()`.
* Create a list of 3 tasks and filter only uncompleted high-priority items!"""


# -----------------------------------------------------------------------------
# 3. C++ KNOWLEDGE REPOSITORY
# -----------------------------------------------------------------------------

CPP_POINTERS_EXPLANATION = """### Pointers and Memory in C++ ⚙️

In C++, a **pointer** is a variable that stores the **memory address** of another variable, rather than holding a direct value.

A **reference**, by contrast, is an alias (another name) for an existing variable that cannot be reseated or be `nullptr`.

---

### 1. Pointer Fundamentals

* `&` (**Address-of operator**): Retrieves the memory address where a variable lives.
* `*` (**Dereference operator**): Reads or modifies the value stored at the memory address the pointer holds.
* `nullptr`: Represents a safe, null memory address in modern C++.

---

### Step-by-Step C++ Code Example

```cpp
#include <iostream>

int main() {
    int score = 42;
    
    // 1. Declare pointer and assign memory address of score
    int* ptr = &score;

    std::cout << "Direct value of score: " << score << std::endl;
    std::cout << "Memory address (&score): " << &score << std::endl;
    std::cout << "Pointer value (ptr):     " << ptr << std::endl;

    // 2. Dereferencing the pointer to read value
    std::cout << "Value via pointer (*ptr): " << *ptr << std::endl;

    // 3. Modifying original variable through pointer
    *ptr = 100;
    std::cout << "New score value: " << score << std::endl; // Now 100!

    // 4. Pointer vs Reference comparison
    int& ref = score; // Reference alias (must be initialized, cannot be null)
    ref = 200;
    std::cout << "Score after ref update: " << score << std::endl; // Now 200!

    return 0;
}
```

---

### 2. Pointer vs Reference Summary

| Feature | Pointer (`int*`) | Reference (`int&`) |
| :--- | :--- | :--- |
| **Nullability** | Can be `nullptr` | Cannot be null |
| **Reassignment** | Can point to different addresses | Bound to one variable permanently |
| **Memory Syntax** | Requires `*ptr` to dereference | Acts directly like the original variable |

---

### 3. Golden Rule: Always Initialize Pointers!
Never leave a pointer uninitialized (`int* p;`), as it points to arbitrary memory (wild pointer). Always initialize with `nullptr` or a valid address:
```cpp
int* safePtr = nullptr;
```"""


CPP_PRACTICE_QUESTIONS = """### 5 Practice Questions: C++ Systems & Memory ⚙️

Here are five progressive C++ challenges focusing on memory management, pointers, and object lifetimes:

---

#### 1. Pointer Basics: Swap Two Integers 🔄
* **Task:** Write a function `void swapNumbers(int* a, int* b)` that swaps the values of two integers using pointers only.
* Test by passing variables with address-of `&x, &y` and printing before/after values.

---

#### 2. Dynamic Memory: Integer Array on the Heap 📦
* **Task:** Dynamically allocate an array of $N$ integers using `new int[N]`.
* Populate it with squares ($0, 1, 4, 9...$), print elements, and safely deallocate memory using `delete[]` to prevent leaks.

---

#### 3. Pointers and Strings: Reverse in Place 🔤
* **Task:** Write a function that takes a `char*` C-string and reverses the characters in place using two pointer iterators (`start` and `end`).

---

#### 4. RAII & Destructors: The Resource Holder 🛡️
* **Task:** Create a class `BufferManager` that allocates a dynamic buffer in its constructor and automatically calls `delete[]` in its destructor `~BufferManager()`.
* Demonstrate that the destructor runs automatically when the object goes out of scope.

---

#### 5. Smart Pointers: Modern C++ Ownership 🧠
* **Task:** Refactor a pointer-based example using `std::unique_ptr<int>` from `#include <memory>`.
* Observe how modern C++ prevents memory leaks without requiring manual `delete` calls!"""


# -----------------------------------------------------------------------------
# 4. TECHNICAL ENGLISH KNOWLEDGE REPOSITORY
# -----------------------------------------------------------------------------

ENGLISH_ACTIVE_PASSIVE_EXPLANATION = """### Active vs Passive Voice in Technical Writing 🇬🇧

In professional software engineering and technical documentation, **active voice** is preferred because it makes the subject (the actor) clear, reduces sentence ambiguity, and improves reading speed.

---

### 1. What is the Difference?

* **Active Voice:** The subject performs the action.
  * *Formula:* `[Actor] + [Verb] + [Target/Object]`
  * *Example:* "The garbage collector frees unused memory."
* **Passive Voice:** The target receives the action; the actor is often obscured or placed at the end.
  * *Formula:* `[Target] + [form of 'to be'] + [Past Participle] + (by [Actor])`
  * *Example:* "Unused memory is freed by the garbage collector."

---

### 2. Side-by-Side Comparisons for Tech Docs

| Weak / Passive Voice ❌ | Strong / Active Voice ✅ | Why It's Better |
| :--- | :--- | :--- |
| "The request was rejected by the API server." | "The API server rejected the request." | Direct and identifies the responsible service immediately. |
| "An authentication token must be provided by the client." | "Clients must provide an authentication token." | Clear instruction for developers. |
| "A NullPointerException was thrown." | "The user service threw a NullPointerException." | Explicitly pinpoints the failure source. |

---

### 3. When is Passive Voice Acceptable in Tech?
* When the actor is completely unknown or irrelevant:
  * *"Data is encrypted at rest using AES-256."* (Focus is on the security state of the data, not who runs the encryption daemon).

### Recap & Action Tip
Whenever writing code comments, PR descriptions, or documentation, ask: **"Who or what is doing this action?"** Place that actor at the beginning of the sentence!"""


ENGLISH_CODE_REVIEW_VOCABULARY = """### Professional English for Code Reviews & PRs 🇬🇧

Giving constructive, polite, and objective code review feedback is an essential software engineering skill. Effective feedback focuses on the **code and design**, never on the author personally.

---

### 1. Constructive Review Patterns

* **Instead of harsh imperatives:** *"Fix this now."* ❌
  * **Use collaborative phrasing:** *"Could we consider extracting this helper method to improve readability?"* ✅
* **Instead of questioning competence:** *"Why did you do this?"* ❌
  * **Ask for rationale politely:** *"What was the rationale behind choosing an array here instead of a set?"* ✅
* **Instead of vague opinions:** *"I don't like this structure."* ❌
  * **Provide concrete alternatives:** *"This loop runs in $O(N^2)$ time. If we use a hash map lookup, we can reduce it to $O(N)$."* ✅

---

### 2. Standard Code Review Prefixes

Modern engineering teams often use standardized prefixes:
* **`nit:` (Nitpick):** Minor stylistic suggestion; does not block PR approval (e.g., *"nit: Consider renaming `x` to `userCount` for clarity."*).
* **`suggestion:`** Proposed improvement with code snippet.
* **`question:`** Seeking context or clarification before approving.
* **`blocking:`** Critical issue (security bug, memory leak) that must be resolved prior to merging.

---

### 3. Helpful Phrasing Bank
* *"Looks solid overall! One small observation on error handling..."*
* *"To prevent potential null reference issues, what do you think about using an Optional here?"*
* *"Great job simplifying this logic! Approved."*"""


ENGLISH_STANDUP_EXPLANATION = """### How to Deliver a Concise Daily Standup in English 🇬🇧

The daily Scrum standup is a quick 1-2 minute update designed to align the team. The standard professional structure uses three clear pillars:

---

### 1. The Three Questions Framework

1. **What did you accomplish yesterday?**
   * Use past tense (`completed`, `shipped`, `refactored`, `resolved`).
   * *Example:* *"Yesterday, I completed the unit tests for the authentication endpoint and merged PR #42."*

2. **What are you focusing on today?**
   * Use present continuous or future intentional phrasing (`working on`, `aiming to`, `plan to`).
   * *Example:* *"Today, I am working on the database indexing migration to reduce query latency."*

3. **Are there any blockers?**
   * Be direct so teammates or leaders can assist immediately.
   * *Example (no blocker):* *"No blockers on my end."*
   * *Example (with blocker):* *"I'm currently blocked waiting for API credentials from the third-party payment team."*

---

### 2. Standup Script Template

> *"Good morning team. Yesterday, I finalized the pagination logic for the user directory. Today, my focus is integrating the search filters. I have no blockers currently."*"""


ENGLISH_PRONUNCIATION_EXPLANATION = """### Clear Technical English Pronunciation Guide 🇬🇧

Technical English contains many loanwords, compound terms, and Greek/Latin roots that developers frequently mispronounce. Here is how to articulate common computing terms with confidence:

---

### Pronunciation Breakdown

| Term | Phonetic Guide | Stress | Meaning / Usage Note |
| :--- | :--- | :--- | :--- |
| **Algorithm** | *AL-guh-rith-um* | First syllable | Say *"AL"*, then soft *"th"*, not *"rhythm"*. |
| **Hierarchy** | *HY-er-ar-kee* | First syllable | Starts with *"HY"*, ends with *"kee"*. |
| **Boolean** | *BOO-lee-un* | First syllable | Say *"BOO"* like the ghost sound, then *"lee-un"*. |
| **Asynchronous**| *ay-SINK-ruh-nus*| Second syllable | Prefix *"ay"*, stress *"SINK"*. Commonly abbreviated as *async* (*AY-sink*). |
| **Parameter** | *puh-RAM-ih-ter* | Second syllable | Stress *"RAM"*, not *"para-meter"*. |
| **Inheritance** | *in-HAIR-ih-tunss*| Second syllable | Stress *"HAIR"*. |

---

### Practical Speaking Exercise
Practice reading this sentence aloud:
> *"The asynchronous algorithm traverses the hierarchy using a boolean parameter."*"""


ENGLISH_PRACTICE_EXERCISES = """### 5 Practice Exercises: Technical English Communication 🎯

Here are five professional communication exercises for software engineers. Complete them to elevate your workplace English:

---

#### 1. Passive to Active Voice Transformation ✍️
* **Prompt:** Rewrite the following passive technical sentence into clean, active voice:
  > *"The payment gateway was timed out by the server because of an invalid payload sent by the frontend."*
* **Goal:** Make the frontend the clear subject of the error.

---

#### 2. Constructive Code Review Phrasing 💬
* **Prompt:** Turn this blunt comment into a polite, constructive review suggestion:
  > *"This function is way too long and confusing. Break it up."*
* **Goal:** Use collaborative phrasing and explain the benefit of modularity.

---

#### 3. Standup Update Drafting 🎙️
* **Prompt:** Imagine you spent yesterday fixing a login bug, today you are drafting API documentation, and you are waiting on design assets from Figma.
* **Goal:** Draft a polished 3-sentence standup update using the standard framework.

---

#### 4. Technical Vocabulary in Context 📖
* **Prompt:** Write two sentences using the words **deprecate** and **idempotent** correctly in an API design context.

---

#### 5. Documentation Clarification 📝
* **Prompt:** A user guide says: *"The system might perhaps fail if user types bad stuff."*
* **Goal:** Rewrite this into professional, clear API documentation specifying validation errors."""


# -----------------------------------------------------------------------------
# 5. GENERAL CONCEPTS KNOWLEDGE REPOSITORY
# -----------------------------------------------------------------------------

DBMS_PRIMARY_KEY_EXPLANATION = """### What is a Primary Key in DBMS? 🗄️

In a **Database Management System (DBMS)**, a **Primary Key** is a specific column (or set of columns) that **uniquely identifies** each individual row (record) in a relational database table.

---

### 1. Real-World Analogy
Think of a national university with thousands of students:
* Multiple students might share the exact same name (e.g., "Rahul Sharma").
* However, each student receives an exclusive **Student ID / Roll Number**. That unique Student ID serves as the student table's **Primary Key**.

---

### 2. The Three Golden Rules of a Primary Key

1. **Uniqueness:** No two rows can share the exact same primary key value.
2. **NOT NULL:** A primary key column **cannot** contain `NULL` (empty or unknown) values. Every record must have an identity.
3. **One Per Table:** A table can have **only one** primary key constraint (though it can comprise multiple columns, known as a *Composite Primary Key*).
4. **Immutability:** Primary key values should ideally never change after creation.

---

### 3. SQL Example

```sql
-- Creating a Students table with StudentID as Primary Key
CREATE TABLE Students (
    StudentID INT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) UNIQUE,
    EnrollmentDate DATE
);

-- Inserting valid records
INSERT INTO Students (StudentID, FullName, Email, EnrollmentDate)
VALUES (101, 'Harshit Sharma', 'harshit@example.com', '2026-01-15');

INSERT INTO Students (StudentID, FullName, Email, EnrollmentDate)
VALUES (102, 'Priya Patel', 'priya@example.com', '2026-01-16');

-- The following insert will FAIL with a duplicate key violation:
-- INSERT INTO Students (StudentID, FullName, Email, EnrollmentDate)
-- VALUES (101, 'Another Person', 'test@example.com', '2026-01-17');
-- ERROR: Duplicate entry '101' for key 'PRIMARY'
```

---

### 4. Primary Key vs Foreign Key

* **Primary Key:** Uniquely identifies a row in **its own table**.
* **Foreign Key:** References the Primary Key of **another table**, creating relational links and enforcing referential integrity."""


BIGO_COMPLEXITY_EXPLANATION = """### Understanding Big-O Notation in Simple Terms 📈

In computer science, **Big-O notation** measures how the runtime or memory requirements of an algorithm grow as the input size ($N$) scales towards infinity.

It describes the **upper bound (worst-case scenario)** of an algorithm's performance.

---

### 1. Common Big-O Complexities from Best to Worst

1. **$O(1)$ - Constant Time:** Execution time remains identical regardless of input size.
   * *Example:* Accessing an array item by index: `items[0]`.
2. **$O(\\log N)$ - Logarithmic Time:** Each step cuts the remaining problem size in half.
   * *Example:* Binary search in a sorted array of 1,000,000 items takes only ~20 checks!
3. **$O(N)$ - Linear Time:** Execution time grows directly in proportion to input size.
   * *Example:* Finding an item by scanning an unsorted list with a single loop.
4. **$O(N \\log N)$ - Linearithmic Time:** Typical performance of efficient sorting algorithms.
   * *Example:* Merge Sort, Quick Sort (average case).
5. **$O(N^2)$ - Quadratic Time:** Nested loops iterating over the same dataset.
   * *Example:* Bubble Sort, comparing every item to every other item.

---

### 2. Step-by-Step Code Comparison

```python
# O(1) - Constant: 1 operation
def get_first(items):
    return items[0]

# O(N) - Linear: N operations
def find_item(items, target):
    for item in items:
        if item == target:
            return True
    return False

# O(N^2) - Quadratic: N * N operations
def print_all_pairs(items):
    for i in items:
        for j in items:
            print(i, j)
```

**Key Takeaway:** When building scalable applications, strive for $O(1)$ or $O(\\log N)$ searches, and avoid $O(N^2)$ operations on large datasets!"""


GENERAL_PRACTICE_QUESTIONS = """### 5 Practice Questions: Computer Science & DBMS Fundamentals 🎯

Here are five foundational CS challenges testing algorithms, complexity analysis, and database architecture:

---

#### 1. Complexity Analysis: Loop Counting ⏱️
* **Task:** What is the Big-O time complexity of a loop that increments by multiplying: `while (i < n) { i *= 2; }`? Explain why in 2 sentences.

---

#### 2. Relational Schema Design: Online Store 🗄️
* **Task:** Design a schema for a simple store with two tables: `Customers` and `Orders`.
* Specify Primary Keys and Foreign Keys, ensuring an order links to a valid customer.

---

#### 3. Data Structure Selection: Browser History 🌐
* **Task:** Which data structure is optimal for implementing the "Back" and "Forward" buttons in a web browser? Explain how push and pop operations enable this behavior.

---

#### 4. Binary Search Implementation 🔍
* **Task:** Given a sorted array `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`, trace the step-by-step binary search checks to locate the number `23`. How many comparisons were needed?

---

#### 5. Database Normalization (1NF to 3NF) 🧩
* **Task:** Explain in plain terms why storing multiple phone numbers in a single comma-separated string `"+1234, +5678"` violates First Normal Form (1NF), and how to fix it."""


# -----------------------------------------------------------------------------
# 6. CODE DEBUGGING ANALYZER
# -----------------------------------------------------------------------------

def analyze_and_debug_code(subject: str, query: str) -> str:
    """
    Examines submitted code snippets or error descriptions, determines the root cause,
    explains why the issue occurs, and provides corrected working code.
    """
    ql = query.lower()
    norm_sub = normalize_subject(subject)

    # 1. Python IndexError
    if "indexerror" in ql or ("list index out of range" in ql) or ("index" in ql and "out of range" in ql):
        return """### Code Debugging Diagnosis 🐞

#### 1. Identified Root Cause
An **`IndexError: list index out of range`** occurred. This error happens when your code attempts to access an index that does not exist in the list.

Remember that Python lists are **0-indexed**: a list with 3 items has valid indices `0`, `1`, and `2`. Attempting to access index `3` triggers an `IndexError`.

---

#### 2. Why It Occurred
Common causes include:
* Using `<=` instead of `<` when looping with an index (`for i in range(len(items) + 1)`).
* Attempting to access elements in an empty list `[]`.
* Off-by-one errors in slice or pointer logic.

---

#### 3. Corrected Code Solution

```python
fruits = ["apple", "banana", "cherry"]

# INCORRECT (Triggers IndexError):
# print(fruits[3]) 

# CORRECTED SOLUTION 1: Check length before accessing
index_to_access = 3
if 0 <= index_to_access < len(fruits):
    print("Found fruit:", fruits[index_to_access])
else:
    print(f"Index {index_to_access} is out of range! Valid indices are 0 to {len(fruits) - 1}.")

# CORRECTED SOLUTION 2: Safe iteration without manual indices
for fruit in fruits:
    print("Item:", fruit)
```

---

#### 4. Key Takeaways & Prevention
* Use `for item in collection:` rather than manual index counters whenever possible.
* If you need the index, use `enumerate(collection)` to guarantee bounds safety!"""

    # 2. Python TypeError (e.g. str + int)
    if "typeerror" in ql or ("can only concatenate" in ql) or ("unsupported operand" in ql):
        return """### Code Debugging Diagnosis 🐞

#### 1. Identified Root Cause
A **`TypeError`** occurred due to mismatched data types in an operation (such as attempting to concatenate a string with an integer or float using `+`).

---

#### 2. Why It Occurred
Python is strongly typed and does not automatically convert numbers to strings during addition:
* `'Score: ' + 100` fails because `+` expects both operands to be strings for concatenation, or both numbers for addition.

---

#### 3. Corrected Code Solution

```python
user_name = "Aria"
score = 95

# INCORRECT:
# message = user_name + " scored: " + score # TypeError!

# CORRECTED OPTION 1: Modern f-strings (Recommended)
message = f"{user_name} scored: {score}"
print(message)

# CORRECTED OPTION 2: Explicit type conversion
message = user_name + " scored: " + str(score)
print(message)
```

---

#### 4. Key Takeaways & Prevention
* Always use **f-strings** (`f"Value: {var}"`) for string interpolation in modern Python."""

    # 3. Java NullPointerException
    if "nullpointer" in ql or "nullpointerexception" in ql or "null pointer" in ql:
        return """### Code Debugging Diagnosis ☕

#### 1. Identified Root Cause
A **`NullPointerException` (NPE)** occurred. This happens when your code attempts to use an object reference that currently points to `null` (unallocated memory).

---

#### 2. Why It Occurred
You invoked a method or accessed a field on a variable before instantiating it with `new`, or a method returned `null` unexpectedly.

---

#### 3. Corrected Code Solution

```java
public class Main {
    public static void main(String[] args) {
        String studentName = null;

        // INCORRECT (Throws NullPointerException):
        // int length = studentName.length();

        // CORRECTED SOLUTION 1: Null-check guard
        if (studentName != null) {
            System.out.println("Length: " + studentName.length());
        } else {
            System.out.println("studentName is null; skipping method call.");
        }

        // CORRECTED SOLUTION 2: Initialize with a default value
        studentName = "Harshit";
        System.out.println("Safe Length: " + studentName.length());
    }
}
```

---

#### 4. Key Takeaways & Prevention
* Always initialize objects when declaring them.
* Use `Optional<T>` or Objects.requireNonNull() to guard parameters in modern Java."""

    # 4. C++ Segmentation Fault / Null Pointer
    if "segmentation fault" in ql or "segfault" in ql or "dangling pointer" in ql:
        return """### Code Debugging Diagnosis ⚙️

#### 1. Identified Root Cause
A **Segmentation Fault (Core Dumped)** occurred. In C++, this fatal crash happens when a program attempts to read or write to a memory location it does not have permission to access.

---

#### 2. Why It Occurred
Common causes:
1. **Dereferencing a `nullptr`:** Calling `*ptr` when `ptr == nullptr`.
2. **Dangling Pointer:** Accessing memory after calling `delete ptr;`.
3. **Buffer Overflow:** Writing past the allocated boundary of an array.

---

#### 3. Corrected Code Solution

```cpp
#include <iostream>
#include <memory>

int main() {
    int* ptr = nullptr;

    // INCORRECT (Causes immediate Segmentation Fault):
    // *ptr = 50; 

    // CORRECTED SOLUTION 1: Always check for nullptr before dereferencing
    if (ptr != nullptr) {
        std::cout << *ptr << std::endl;
    } else {
        std::cout << "Pointer is null; cannot dereference safely." << std::endl;
    }

    // CORRECTED SOLUTION 2: Use modern C++ smart pointers (Automatic memory management)
    auto safePtr = std::make_unique<int>(50);
    std::cout << "Safe smart pointer value: " << *safePtr << std::endl;
    // Memory automatically freed when safePtr goes out of scope!

    return 0;
}
```

---

#### 4. Key Takeaways & Prevention
* Use `std::unique_ptr` and `std::shared_ptr` to eliminate manual `new`/`delete` calls.
* Always compile with debug symbols (`-g -Wall`) and run with AddressSanitizer (`-fsanitize=address`) to catch memory bugs immediately."""

    # 5. General debugging template if specific error couldn't be parsed
    return f"""### Code Debugging Assistant 🐞

Let's debug your **{norm_sub}** code together!

To provide the exact corrected code, please paste:
1. **The Code Snippet:** Paste the lines where the issue occurs.
2. **The Exact Error Message:** Include the terminal or compiler error text (e.g. stack trace, syntax error, wrong output).
3. **Expected vs Actual Behavior:** What did you expect the code to output?

#### Quick Checklist for {norm_sub}:
* **Syntax & Scoping:** Are all braces `{{}}`, parentheses `()`, or colons `:` properly closed?
* **Initialization:** Are all variables initialized before being read?
* **Bounds Safety:** Are loop conditions strictly within array/collection boundaries?

Paste your snippet below and I will pinpoint the exact cause and return the corrected code!"""


# -----------------------------------------------------------------------------
# 7. STUDY PLAN GENERATOR
# -----------------------------------------------------------------------------

def generate_study_plan(subject: str) -> str:
    """Generates a structured, practical 4-week roadmap for the active focus."""
    norm_sub = normalize_subject(subject)

    if norm_sub == "Python":
        return """### 4-Week Structured Python Mastery Plan 🗺️

* **Daily Commitment:** 30–45 minutes of hands-on practice.
* **Goal:** Progress from syntax fundamentals to building working algorithmic scripts and OOP projects.

---

#### 📅 Week 1: Foundations & Control Flow
* **Days 1–2:** Variables, dynamic data types, input/output, and operators.
* **Days 3–4:** Conditionals (`if`, `elif`, `else`) and boolean logic.
* **Days 5–7:** Loops (`for`, `while`, `range`, `enumerate`), break/continue, and list fundamentals.
* **Milestone Project:** Build a Command-Line Tip & Bill Splitter Calculator.

---

#### 📅 Week 2: Data Structures & Functions
* **Days 8–10:** Slicing, list comprehensions, and nested lists.
* **Days 11–12:** Dictionaries, sets, and tuples (when to use each).
* **Days 13–14:** Writing functions, return values, default parameters, and variable scope.
* **Milestone Project:** Build an Interactive Flashcard Quiz program.

---

#### 📅 Week 3: Object-Oriented Programming (OOP)
* **Days 15–17:** Classes, objects, `__init__`, and the `self` parameter.
* **Days 18–19:** Encapsulation and class methods vs static methods.
* **Days 20–21:** Inheritance, method overriding, and `super()`.
* **Milestone Project:** Build a Bank Account or Student Record Management System.

---

#### 📅 Week 4: File I/O, Error Handling & Capstone
* **Days 22–24:** Exception handling with `try`, `except`, and `finally`.
* **Days 25–26:** Reading and writing JSON/CSV files.
* **Days 27–28:** Capstone Project integration and code review.
* **Milestone Project:** Build a persistent Personal Task Manager that saves data to disk."""

    elif norm_sub == "Java":
        return """### 4-Week Structured Java Fundamentals Plan 🗺️

* **Daily Commitment:** 30–45 minutes of active coding.
* **Goal:** Master core Java syntax, class architecture, and the 4 pillars of OOP.

---

#### 📅 Week 1: Java Basics & Flow Control
* **Days 1–3:** JVM, JDK vs JRE, `main` entrypoint, primitive types, and type casting.
* **Days 4–5:** Conditionals (`if/else`, `switch`) and relational operators.
* **Days 6–7:** Loops (`for`, enhanced for-each, `while`) and arrays.
* **Milestone Project:** Temperature Converter & Grade Evaluator CLI.

---

#### 📅 Week 2: Classes & Encapsulation
* **Days 8–10:** Class blueprints, instantiating objects with `new`, and constructors.
* **Days 11–12:** Private access modifiers, getters/setters, and the `this` keyword.
* **Days 13–14:** Static fields and utility methods.
* **Milestone Project:** Secure Bank Account Simulator with transaction validation.

---

#### 📅 Week 3: Inheritance & Polymorphism
* **Days 15–17:** Subclasses using `extends`, constructor chaining with `super()`.
* **Days 18–19:** Method overriding (`@Override`) vs method overloading.
* **Days 20–21:** Interfaces (`implements`) vs Abstract Classes.
* **Milestone Project:** Vehicle Fleet Hierarchy with polymorphic behavior.

---

#### 📅 Week 4: Collections, Exceptions & Capstone
* **Days 22–24:** `ArrayList`, `HashMap`, and Java Generics.
* **Days 25–26:** Exception handling (`try-catch-finally`, custom exceptions).
* **Days 27–28:** Final Capstone Project: Library Book Catalog System."""

    elif norm_sub == "C++":
        return """### 4-Week Structured C++ Systems Plan 🗺️

* **Daily Commitment:** 30–45 minutes of hands-on practice.
* **Goal:** Master memory addresses, pointers, references, dynamic allocation, and RAII.

---

#### 📅 Week 1: Syntax & C++ Fundamentals
* **Days 1–3:** Streams (`std::cin`, `std::cout`), primitive types, and namespaces.
* **Days 4–5:** Control flow and function declarations/definitions.
* **Days 6–7:** Pass-by-value vs pass-by-reference (`&`).
* **Milestone Project:** Matrix Math & Vector Calculator.

---

#### 📅 Week 2: Pointers & Memory Architecture
* **Days 8–10:** Memory addresses, address-of (`&`), and dereferencing (`*`).
* **Days 11–12:** Pointer arithmetic and arrays as pointers.
* **Days 13–14:** `nullptr` safety and pointer vs reference design decisions.
* **Milestone Project:** In-Place String Reversal & Tokenizer.

---

#### 📅 Week 3: Dynamic Memory & OOP
* **Days 15–17:** Dynamic allocation (`new`, `delete`, `new[]`, `delete[]`).
* **Days 18–19:** Classes, constructors, and destructors (`~ClassName`).
* **Days 20–21:** Preventing memory leaks and understanding the Rule of Three/Five.
* **Milestone Project:** Custom Dynamic Integer Array (mini `std::vector`).

---

#### 📅 Week 4: Modern C++ & STL
* **Days 22–24:** Smart pointers: `std::unique_ptr` and `std::shared_ptr`.
* **Days 25–26:** STL containers (`std::vector`, `std::string`, `std::map`).
* **Days 27–28:** Capstone: Custom In-Memory Key-Value Store with RAII."""

    elif norm_sub == "English":
        return """### 4-Week Technical English Communication Plan 🗺️

* **Daily Commitment:** 20–30 minutes of speaking, reading, and drafting.
* **Goal:** Speak clearly in meetings, draft professional PRs, and write concise technical docs.

---

#### 📅 Week 1: Articulation & Technical Pronunciation
* **Days 1–3:** Mastering technical syllable stress (algorithm, hierarchy, asynchronous, boolean).
* **Days 4–5:** Speaking naturally during technical introductions.
* **Days 6–7:** Practicing daily standup updates aloud using the 3-question framework.
* **Milestone:** Record a 60-second audio clip of your daily project update.

---

#### 📅 Week 2: Writing for Developers & Code Reviews
* **Days 8–10:** Constructive, polite PR review comments using `nit:`, `suggestion:`.
* **Days 11–12:** Phrasing questions diplomatically without sounding confrontational.
* **Days 13–14:** Writing descriptive Git commit messages in the imperative mood.
* **Milestone:** Draft review feedback for 3 code pull requests.

---

#### 📅 Week 3: Active Voice & Technical Documentation
* **Days 15–17:** Converting passive voice to active voice for concise docs.
* **Days 18–19:** Writing clear README steps and troubleshooting FAQs.
* **Days 20–21:** Eliminating filler words and vague descriptions.
* **Milestone:** Rewrite a confusing 200-word software setup guide into crisp, active documentation.

---

#### 📅 Week 4: Professional Workplace Scenarios
* **Days 22–24:** Client and stakeholder email communication.
* **Days 25–26:** Explaining technical debt and trade-offs to non-technical partners.
* **Days 27–28:** Mock technical interview Q&A and final review."""

    else:
        return """### 4-Week Computer Science Fundamentals Plan 🗺️

* **Daily Commitment:** 30–45 minutes of conceptual learning and problem solving.
* **Goal:** Build strong foundations in Big-O analysis, core data structures, and database architecture.

---

#### 📅 Week 1: Algorithmic Complexity & Big-O
* **Days 1–3:** Understanding time vs space complexity, $O(1)$, $O(\\log N)$, $O(N)$, and $O(N^2)$.
* **Days 4–5:** Identifying nested loops and worst-case scenarios.
* **Days 6–7:** Best, average, and worst-case analysis.
* **Milestone:** Analyze and document time complexities for 5 common algorithms.

---

#### 📅 Week 2: Linear Data Structures
* **Days 8–10:** Arrays vs Dynamic Lists (memory layout, insertion/deletion cost).
* **Days 11–12:** Stacks (LIFO) and Queues (FIFO) real-world applications.
* **Days 13–14:** Singly and Doubly Linked Lists.
* **Milestone:** Implement a Stack-based Undo/Redo simulator.

---

#### 📅 Week 3: Relational Database Architecture (DBMS)
* **Days 15–17:** Relational schema design, Primary Keys, and Foreign Keys.
* **Days 18–19:** Referential integrity and JOIN operations (INNER, LEFT, RIGHT).
* **Days 20–21:** Database Normalization (1NF, 2NF, 3NF).
* **Milestone:** Design a fully normalized 4-table relational database for a hospital or school.

---

#### 📅 Week 4: System Architecture & Web Fundamentals
* **Days 22–24:** Client-Server model, HTTP request/response cycle, REST API principles.
* **Days 25–26:** Status codes (200, 201, 400, 401, 403, 404, 500, 502).
* **Days 27–28:** Capstone: End-to-end Architectural Design of a URL Shortener."""


# -----------------------------------------------------------------------------
# 8. CONVERSATION CONTEXT & FOLLOW-UP RESOLVER
# -----------------------------------------------------------------------------

def resolve_follow_up(subject: str, query: str, history_records: Optional[List[Any]]) -> Optional[str]:
    """
    Detects follow-up questions (e.g. 'can you show an example?', 'why?', 'explain line by line')
    and references the previous assistant or user message to maintain context.
    """
    ql = query.lower().strip()
    if not history_records or len(history_records) == 0:
        return None

    # If query explicitly specifies a topic/language, it is a standalone topic query, not an ambiguous follow-up
    has_specific_topic = any(term in ql for term in [
        "python", "java", "c++", "cpp", "dbms", "sql", "primary key", "foreign key",
        "pointer", "reference", "active voice", "passive voice", "lists", "tuples",
        "dictionar", "classes", "recursion", "big-o", "complexity"
    ])
    if has_specific_topic and ("line by line" not in ql and "step by step trace" not in ql):
        return None

    # Genuine follow-up indicators
    followup_phrases = [
        "line by line", "step by step trace", "explain that", "why does that", "why is that",
        "how does that work", "simplify that", "give another example", "show another example",
        "can you give another example", "give an example of that", "show an example of that",
        "can you show an example of this", "what does that mean", "why does this occur"
    ]
    # Or if query is very short and asks for example/why/elaboration (e.g. "why?", "show an example", "can you clarify?")
    is_short_followup = len(ql.split()) <= 6 and any(p in ql for p in ["example", "why", "how so", "elaborate", "clarify", "line by line"])
    is_explicit_followup = any(p in ql for p in followup_phrases)

    if not (is_short_followup or is_explicit_followup):
        return None

    # Inspect last assistant reply or user question from history
    last_text = ""
    for h in reversed(history_records):
        content = getattr(h, "content", None) or (h.get("content") if isinstance(h, dict) else "")
        if content:
            last_text = content.lower()
            break

    if not last_text:
        return None

    # Context 1: Java OOP / Inheritance / Polymorphism follow-up
    if "java" in last_text or "oops" in last_text or "inheritance" in last_text:
        if "line by line" in ql or "explain" in ql:
            return """### Line-by-Line Breakdown of the Java Example ☕

Let's trace how the previous Java code works step by step:

1. **`abstract class Animal`**: Declares an abstract parent class. The `abstract` keyword ensures nobody can instantiate a generic `Animal` directly (`new Animal()` is illegal).
2. **`private String name;`**: Applies **Encapsulation**. The variable `name` cannot be altered from outside without validation.
3. **`public Animal(String name)`**: The constructor sets up the initial state when a child object is created.
4. **`class Dog extends Animal`**: Applies **Inheritance**. `Dog` receives all capabilities of `Animal` without duplicate code.
5. **`super(name)`**: Calls the parent `Animal` constructor from inside `Dog`, passing the name parameter up the hierarchy.
6. **`@Override public void makeSound()`**: Applies **Polymorphism**. `Dog` replaces the abstract sound method with its own barking logic.
7. **`Animal myDog = new Dog("Buddy");`**: Declares a variable of type `Animal` pointing to a `Dog` instance. When `myDog.makeSound()` runs, Java dynamically calls `Dog`'s version at runtime!"""
        elif "example" in ql:
            return """### Another Practical Java OOP Example: Bank Account ☕

Here is another real-world demonstration focusing on **Encapsulation** and **Inheritance**:

```java
// Superclass: Standard Account
class BankAccount {
    private String accountNumber;
    protected double balance; // Protected so subclasses can read

    public BankAccount(String accountNumber, double initialBalance) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited: ₹" + amount + " | Current Balance: ₹" + balance);
        }
    }
}

// Subclass: Savings Account earning interest
class SavingsAccount extends BankAccount {
    private double interestRate = 0.05; // 5% annual interest

    public SavingsAccount(String accNum, double balance) {
        super(accNum, balance);
    }

    public void applyInterest() {
        double interest = balance * interestRate;
        balance += interest;
        System.out.println("Applied ₹" + interest + " interest! New Balance: ₹" + balance);
    }
}

public class Main {
    public static void main(String[] args) {
        SavingsAccount myAcc = new SavingsAccount("SB-10492", 10000);
        myAcc.deposit(5000);
        myAcc.applyInterest();
    }
}
```"""

    # Context 2: Python Lists / Comprehensions follow-up
    if "python" in last_text or "list" in last_text:
        return """### Step-by-Step Python Trace & Additional Example 🐍

Building upon our previous discussion of Python collections, here is a practical trace:

```python
# Real-world scenario: Filtering user scores
raw_scores = [45, 88, 92, 59, 76, 100, 34]

# Step 1: List comprehension filtering passing grades (>= 60)
passing_scores = [score for score in raw_scores if score >= 60]
print("Passing scores:", passing_scores) # [88, 92, 76, 100]

# Step 2: Transforming scores by adding a 5% curve
curved_scores = [min(100, round(score * 1.05)) for score in passing_scores]
print("Curved scores:", curved_scores)   # [92, 97, 80, 100]

# Step 3: Finding highest and lowest with built-ins
print("Top performer:", max(curved_scores))
print("Lowest passing:", min(curved_scores))
```

Notice how clean and readable this is compared to writing nested loops!"""

    # Context 3: C++ Pointers / References follow-up
    if "pointer" in last_text or "c++" in last_text:
        return """### Line-by-Line Memory Trace in C++ ⚙️

Here is what happens inside the computer's RAM during pointer operations:

1. **`int score = 42;`**: The operating system allocates 4 bytes on the Stack (e.g., at memory address `0x7ffee4b28abc`) and stores the binary value for `42`.
2. **`int* ptr = &score;`**: Allocates 8 bytes for a pointer variable `ptr` and stores the hexadecimal address `0x7ffee4b28abc`.
3. **`*ptr = 100;`**: The CPU looks up the address stored inside `ptr` and directly overwrites the 4 bytes at that address with `100`.
4. Therefore, when you inspect `score`, its value has changed to `100` without touching the variable name `score` directly!

This direct memory control is why C++ is used in operating systems, game engines, and high-frequency trading."""

    # Context 4: Technical English follow-up
    if "english" in last_text or "voice" in last_text or "standup" in last_text:
        return """### Practical Application & Additional English Example 🇬🇧

Let's see how to apply the principles we just discussed in an everyday workplace scenario:

**Before (Passive & Wordy):**
> *"It has been decided by the engineering leads that tests must be written by developers prior to PR submission."*

**After (Active, Professional & Direct):**
> *"Engineering leads now require all developers to submit unit tests with their pull requests."*

Notice how the second version is 40% shorter, immediately answers **who** made the decision, and gives clear instructions!"""

    return None


# -----------------------------------------------------------------------------
# 9. MAIN TUTOR DISPATCH FUNCTION
# -----------------------------------------------------------------------------

def generate_patient_tutor_reply(
    subject: str,
    query: str,
    history_records: Optional[List[Any]] = None
) -> str:
    """
    Intelligently analyzes the user's question, active learning focus,
    and conversation history to return a patient, beginner-friendly,
    structured pedagogical explanation.
    """
    q = query.strip()
    ql = q.lower()
    norm_sub = normalize_subject(subject)

    # 1. Check for contextual follow-up questions referencing previous messages
    follow_up_reply = resolve_follow_up(norm_sub, q, history_records)
    if follow_up_reply:
        return follow_up_reply

    # 2. Check for debugging requests / code snippets with errors
    is_debug = any(k in ql for k in [
        "debug", "error", "exception", "traceback", "fix my code",
        "wrong output", "segfault", "segmentation fault", "nullpointer",
        "indexerror", "typeerror", "indentationerror"
    ])
    if is_debug or ("```" in q and ("fix" in ql or "error" in ql or "why" in ql or "bug" in ql)):
        return analyze_and_debug_code(norm_sub, q)

    # 3. Check for practice questions / coding challenge requests
    is_practice = any(k in ql for k in ["practice", "questions", "challenge", "exercise", "problems"])
    if is_practice:
        if norm_sub == "Java" or ("java" in ql and norm_sub != "Python" and norm_sub != "C++"):
            return JAVA_PRACTICE_QUESTIONS
        elif norm_sub == "Python" or ("python" in ql and norm_sub != "Java" and norm_sub != "C++"):
            return PYTHON_PRACTICE_QUESTIONS
        elif norm_sub == "C++" or "c++" in ql or "cpp" in ql:
            return CPP_PRACTICE_QUESTIONS
        elif norm_sub == "English" or "english" in ql:
            return ENGLISH_PRACTICE_EXERCISES
        else:
            return GENERAL_PRACTICE_QUESTIONS

    # 4. Check for study plan / roadmap requests
    is_study_plan = any(k in ql for k in ["study plan", "roadmap", "curriculum", "learning path", "schedule"])
    if is_study_plan:
        return generate_study_plan(norm_sub)

    # -------------------------------------------------------------------------
    # 5. SUBJECT-SPECIFIC & CROSS-DOMAIN CORE TOPICS
    # -------------------------------------------------------------------------

    # --- TECHNICAL ENGLISH TRACK ---
    if norm_sub == "English" or ("english" in ql and not any(k in ql for k in ["java", "python", "c++", "cpp"])):
        if "active" in ql or "passive" in ql or "voice" in ql:
            return ENGLISH_ACTIVE_PASSIVE_EXPLANATION
        if "review" in ql or "pr" in ql or "comment" in ql or "pull request" in ql:
            return ENGLISH_CODE_REVIEW_VOCABULARY
        if "standup" in ql or "scrum" in ql or "update" in ql:
            return ENGLISH_STANDUP_EXPLANATION
        if "pronounce" in ql or "pronunciation" in ql or "say" in ql or "phonetic" in ql:
            return ENGLISH_PRONUNCIATION_EXPLANATION
        if "grammar" in ql or "vocabulary" in ql or "phrasing" in ql:
            return ENGLISH_ACTIVE_PASSIVE_EXPLANATION
        # General Technical English inquiry (NEVER return programming code)
        return f"""### Technical English & Communication Guide 🇬🇧

In professional software development, clear English communication is just as vital as writing clean code.

#### Key Principles for Technical Communication:
1. **Be Direct & Concise:** State the core message in the very first sentence.
2. **Use Active Voice:** Make the actor explicit (e.g. *"The service validates incoming payloads"* rather than *"Payloads are validated by the service"*).
3. **Use Collaborative Phrasing:** In code reviews, frame suggestions politely (*"Could we consider..."*, *"What are your thoughts on..."*).
4. **Clarify Jargon:** Always explain acronyms or project-specific terminology when collaborating across teams.

Would you like to practice drafting a standup update, reviewing a pull request, or converting passive sentences into active documentation?"""

    # --- JAVA TRACK OR JAVA QUESTIONS ---
    if norm_sub == "Java" or "java" in ql:
        if "oop" in ql or "object oriented" in ql or "object-oriented" in ql or "four pillars" in ql or "4 pillars" in ql:
            return JAVA_OOPS_EXPLANATION
        if "inheritance" in ql or "extends" in ql or "superclass" in ql:
            return JAVA_INHERITANCE_EXPLANATION
        if "interface" in ql or "abstract" in ql:
            return JAVA_INTERFACES_EXPLANATION
        if "polymorphism" in ql or "overriding" in ql or "overloading" in ql:
            return """### Polymorphism in Java: Compile-Time vs Runtime ☕

**Polymorphism** in Java means "many forms" (poly = many, morph = form). It allows a single method name or action to behave differently depending on the context.

---

#### 1. Compile-Time Polymorphism (Method Overloading)
Multiple methods in the **same class** share the exact same name, but have different parameter lists (different types, number, or order of arguments).

```java
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c) { return a + b + c; }
}
```

---

#### 2. Runtime Polymorphism (Method Overriding)
A **subclass** provides its own specific implementation of a method already defined in its parent class using the `@Override` annotation.

```java
class Shape {
    void draw() { System.out.println("Drawing a shape"); }
}

class Circle extends Shape {
    @Override
    void draw() { System.out.println("Drawing a Circle ⭕"); }
}
```

**Key Takeaway:** Overloading happens at compile time within one class; overriding happens at runtime across parent-child class hierarchies!"""

        if "encapsulation" in ql or "getter" in ql or "setter" in ql:
            return """### Encapsulation in Java ☕

**Encapsulation** is the practice of bundling data (fields) and methods together inside a class while restricting direct external access to component variables (data hiding).

---

#### How to Implement Encapsulation in Java:
1. Declare instance variables as `private`.
2. Provide `public` getter and setter methods to inspect and modify them with validation rules.

```java
public class UserAccount {
    // 1. Private field cannot be tampered with directly
    private int age;

    // 2. Public Getter
    public int getAge() {
        return age;
    }

    // 3. Public Setter with validation logic
    public void setAge(int age) {
        if (age > 0 && age < 120) {
            this.age = age;
        } else {
            System.out.println("Invalid age provided!");
        }
    }
}
```"""

        # General Java question fallback
        if ql.startswith("explain") or "how" in ql or "what" in ql:
            return JAVA_OOPS_EXPLANATION

    # --- PYTHON TRACK OR PYTHON QUESTIONS ---
    if norm_sub == "Python" or "python" in ql:
        if "list" in ql:
            return PYTHON_LISTS_EXPLANATION
        if "basic" in ql or "start" in ql or "learn" in ql or "beginner" in ql:
            return PYTHON_BASICS_EXPLANATION
        if "dict" in ql or "dictionary" in ql:
            return """### Understanding Python Dictionaries 🐍

In Python, a **dictionary** is an ordered (Python 3.7+), mutable collection of **key-value pairs**.

Keys must be unique and immutable (such as strings or integers), while values can hold any data type.

```python
# Creating a dictionary
student = {
    "name": "Harshit",
    "track": "Python Masterclass",
    "level": 4,
    "completed_lessons": [1, 2, 3]
}

# Accessing values
print("Student Name:", student["name"])           # Harshit
print("XP:", student.get("xp", 100))              # Safe access with fallback

# Adding and updating pairs
student["mentor"] = "Sage AI"
student["level"] = 5

# Iterating over key-value pairs
for key, value in student.items():
    print(f"  {key}: {value}")
```"""
        if "oop" in ql or "class" in ql:
            return """### Object-Oriented Programming in Python 🐍

Python supports Object-Oriented Programming, allowing you to bundle attributes and behaviors into **classes** and **objects**.

```python
class Student:
    def __init__(self, name: str, track: str):
        self.name = name          # Instance attribute
        self.track = track

    def introduce(self) -> str:   # Instance method
        return f"Hi! I am {self.name} and I am studying {self.track}."

# Instantiating an object
student1 = Student("Aria", "Python Masterclass")
print(student1.introduce())
```

* **`__init__`**: Constructor method called automatically when creating a new object.
* **`self`**: Explicit reference to the specific instance being operated upon."""

    # --- C++ TRACK OR C++ QUESTIONS ---
    if norm_sub == "C++" or "c++" in ql or "cpp" in ql:
        if "pointer" in ql or "reference" in ql or "memory" in ql or "address" in ql:
            return CPP_POINTERS_EXPLANATION
        if "dynamic" in ql or "new" in ql or "delete" in ql:
            return """### Dynamic Memory in C++: `new` and `delete` ⚙️

In C++, **dynamic memory allocation** allocates memory on the **Heap** at runtime rather than on the Stack.

Whenever you allocate memory using `new`, you are responsible for freeing it with `delete` to prevent memory leaks.

```cpp
#include <iostream>

int main() {
    // 1. Allocate a single integer on the Heap
    int* pVal = new int(42);
    std::cout << "Heap value: " << *pVal << std::endl;

    // Free the allocated memory
    delete pVal;
    pVal = nullptr; // Prevent dangling pointer

    // 2. Allocate an array on the Heap
    int size = 5;
    int* arr = new int[size];

    for (int i = 0; i < size; ++i) {
        arr[i] = (i + 1) * 10;
    }

    // Always free dynamic arrays with delete[]
    delete[] arr;
    arr = nullptr;

    return 0;
}
```"""
        # General C++ question fallback
        return CPP_POINTERS_EXPLANATION

    # --- GENERAL CONCEPTS TRACK OR GENERAL INQUIRIES ---
    if "primary key" in ql or ("primary" in ql and "key" in ql):
        return DBMS_PRIMARY_KEY_EXPLANATION
    if "big-o" in ql or "complexity" in ql or "time complexity" in ql:
        return BIGO_COMPLEXITY_EXPLANATION

    # Greetings
    if any(greet in ql for greet in ["hello", "hi", "hey", "greetings", "good morning", "good evening"]):
        return (
            f"Greetings, scholar! 🌿 I am your Bhasa_AI Natural Code Mentor. "
            f"Your active focus is currently set to **{norm_sub}**. "
            f"What concept, algorithm, or debugging challenge would you like to explore today?"
        )

    # Conceptual inquiries fallback: structured, direct, and pedagogical
    return f"""### Bhasa_AI Learning Mentor 🌿

Here is a clear conceptual breakdown regarding **{q}** in **{norm_sub}**:

1. **Core Concept:**
   * This topic addresses how programs structure data, execute logic, or communicate clearly.
   * In {norm_sub}, it serves as a foundational building block for clean architecture.

2. **Step-by-Step Approach:**
   * **Identify the Purpose:** What specific problem or requirement does this solve?
   * **Write a Minimal Example:** Implement a short 5-line proof of concept in your lesson editor.
   * **Verify Edge Cases:** Check what happens with boundary values, empty inputs, or null conditions.

Would you like to see a practical code example, debug a snippet, or try a practice exercise on this topic?"""
