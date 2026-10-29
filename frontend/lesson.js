/* =========================================================
   BHASHA_AI - LESSON INTERACTIVE ENGINE
   Theory First -> Practice Questions System
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

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

    if (!subject) {
        window.location.href = "index.html";
        return;
    }

    // Synchronize chosen subject across storage and backend
    if (window.BhashaAPI && window.BhashaAPI.setSelectedSubject) {
        window.BhashaAPI.setSelectedSubject(subject, true);
    } else {
        localStorage.setItem("bhasha_chosen_language", subject);
    }

    let lessonNumber = parseInt(params.get("lesson"), 10);
    if (!lessonNumber || isNaN(lessonNumber) || lessonNumber < 1 || lessonNumber > 8) {
        if (window.BhashaAPI && window.BhashaAPI.getNextLessonForSubject) {
            const nextInfo = window.BhashaAPI.getNextLessonForSubject(subject);
            lessonNumber = nextInfo.lessonNumber;
        } else {
            lessonNumber = 1;
        }
    }

    /* =========================
       CLIENT DATA (FALLBACK)
    ========================= */
    const lessonData = {
  "Python": {
    "icon": "\ud83d\udc0d",
    "lessons": [
      {
        "lesson_number": 1,
        "title": "Python Syntax, Indentation & Variable Scope",
        "description": "Understand lexical scoping, PEP 8 indentation, variable reassignment, and dynamic typing.",
        "theory": "\n<h3>Chapter Overview: Python Syntax, Indentation & Variable Scope</h3>\n<p>Python was designed with an emphasis on code readability. Unlike languages such as C++ or Java that rely on curly braces <code>{}</code> to delimit code blocks, Python uses whitespace <strong>indentation</strong> to enforce clean, readable nesting.</p>\n\n<div class=\"theory-callout\">\n  <strong>Key Rule (PEP 8):</strong> Always use 4 consecutive spaces per indentation level. Never mix hard tabs and spaces in Python 3, as doing so raises an <code>IndentationError: unexpected indent</code> or <code>TabError</code>.\n</div>\n\n<h4>1. Dynamic Typing & Variable Assignment</h4>\n<p>In Python, you do not declare variable types explicitly. The interpreter infers the data type dynamically at runtime based on the value assigned:</p>\n<pre><code class=\"language-python\"># Dynamic typing example\nx = 10           # x is an integer\nx = \"Bhasha AI\"  # x is now re-bound to a string\n\n# Multiple assignment & unpacking\na, b, c = 1, 2, 3\nfirst, *middle, last = [10, 20, 30, 40, 50]\nprint(middle) # Output: [20, 30, 40]</code></pre>\n\n<h4>2. Variable Scope: Local vs Global & The <code>global</code> Keyword</h4>\n<p>Variables declared inside a function have local scope. If you assign to a variable inside a function without declaring it <code>global</code>, Python assumes it is a new local variable, shadowing any outer variable of the same name:</p>\n<pre><code class=\"language-python\">count = 0\n\ndef increment():\n    global count  # Binds 'count' to the global scope\n    count += 1\n\nincrement()\nprint(count) # Output: 1</code></pre>\n\n<h4>3. Object References vs Copies</h4>\n<p>When you assign one variable to another (e.g. <code>b = a</code>), Python creates a new reference pointing to the exact same object in memory. For mutable objects like lists or dictionaries, mutating <code>b</code> also mutates <code>a</code>:</p>\n<pre><code class=\"language-python\">list1 = [1, 2, 3]\nlist2 = list1         # Points to the same list in memory\nlist2.append(4)\nprint(list1)          # Output: [1, 2, 3, 4] (Both changed!)</code></pre>\n",
        "questions": [
          {
            "question": "What is the output of the following code snippet?\n\nx = 10\ndef modify():\n    global x\n    x = 25\n    y = x + 5\nmodify()\nprint(x)",
            "description": "Analyze variable scope and the global keyword.",
            "options": [
              "10",
              "25",
              "30",
              "UnboundLocalError"
            ],
            "answer": 1,
            "explanation": "The global keyword explicitly binds the local variable 'x' inside modify() to the global scope. Reassigning x = 25 alters the global variable, so print(x) prints 25."
          },
          {
            "question": "What will occur when executing this Python statement?\n\na, *b, c = [1, 2, 3, 4, 5]\nprint(b)",
            "description": "Evaluate extended iterable unpacking.",
            "options": [
              "[2, 3, 4]",
              "(2, 3, 4)",
              "[1, 2, 3, 4]",
              "ValueError: too many values to unpack"
            ],
            "answer": 0,
            "explanation": "Extended unpacking captures the first element into 'a' (1), the last element into 'c' (5), and packs all intermediary elements into a list 'b' ([2, 3, 4])."
          },
          {
            "question": "Consider the variable assignment below. What does id(a) == id(b) evaluate to in Python?\n\na = [1, 2, 3]\nb = a\nb.append(4)",
            "description": "Identify object referencing vs copying.",
            "options": [
              "True, because b references the same object in memory as a",
              "False, because appending creates a new object for b",
              "False, because lists are immutable",
              "SyntaxError"
            ],
            "answer": 0,
            "explanation": "In Python, assigning a list to a new variable (b = a) assigns a reference to the existing list object, not a shallow copy. Modifying b mutates the object that both a and b point to."
          },
          {
            "question": "Which of the following causes an IndentationError according to Python PEP 8 standards?",
            "description": "Determine strict Python indentation requirements.",
            "options": [
              "Mixing 4 spaces and hard tabs on indented blocks in Python 3",
              "Using 2 spaces instead of 4 consistently throughout a block",
              "Leaving blank lines inside a function body",
              "Placing a docstring on line 1 of a module"
            ],
            "answer": 0,
            "explanation": "Python 3 disallows mixing tabs and spaces for indentation within the same block, raising an IndentationError (or TabError)."
          },
          {
            "question": "What is the result of evaluating: type(lambda x: x * 2)?",
            "description": "Inspect callable type metadata.",
            "options": [
              "<class 'function'>",
              "<class 'lambda'>",
              "<class 'method'>",
              "<class 'generator'>"
            ],
            "answer": 0,
            "explanation": "In Python, anonymous lambda expressions are instances of the standard first-class 'function' class, identical to functions defined with 'def'."
          }
        ]
      },
      {
        "lesson_number": 2,
        "title": "Data Types, Numbers & Type Casting",
        "description": "Explore floating-point representation, integer truncation, complex numbers, and explicit type conversion.",
        "theory": "\n<h3>Chapter Overview: Data Types, Numbers & Type Casting</h3>\n<p>Python has several built-in numeric data types: integers (<code>int</code>), floating-point numbers (<code>float</code>), and complex numbers (<code>complex</code>). Understanding how Python manages numeric precision and casting is crucial for bug-free algorithms.</p>\n\n<h4>1. Numeric Types & Operators</h4>\n<ul>\n  <li><code>int</code>: Arbitrary-precision integers (no 32-bit or 64-bit overflow limit in Python 3).</li>\n  <li><code>float</code>: 64-bit IEEE 754 floating-point values.</li>\n  <li><code>complex</code>: Numbers with real and imaginary parts denoted by <code>j</code>, e.g. <code>z = 3 + 4j</code>.</li>\n</ul>\n\n<h4>2. Division: True Division (/) vs Floor Division (//)</h4>\n<pre><code class=\"language-python\"># True division always returns a float\nprint(7 / 2)   # 3.5\n\n# Floor division truncates towards negative infinity, returning an int\nprint(7 // 2)  # 3\nprint(-7 // 2) # -4 (rounded down away from zero)\n\n# Modulo operator computes remainder\nprint(7 % 2)   # 1</code></pre>\n\n<h4>3. Explicit Type Casting & Radix Parsing</h4>\n<p>You can cast data types explicitly using constructor functions like <code>int()</code>, <code>float()</code>, and <code>str()</code>. The <code>int()</code> function also accepts a base argument to convert binary, octal, or hex strings:</p>\n<pre><code class=\"language-python\"># Radix casting\nbinary_num = int(\"1010\", 2) # Parsed as base-2 binary: yields 10\nhex_num = int(\"1A\", 16)     # Parsed as base-16 hex: yields 26\n\n# Float casting with infinity\ninf_val = float(\"inf\")\nprint(inf_val > 1e308) # True (inf exceeds all finite numbers)</code></pre>\n\n<div class=\"theory-callout\">\n  <strong>Truthy vs Falsy Values:</strong> In Python, empty collections (<code>[]</code>, <code>()</code>, <code>{}</code>, <code>\"\"</code>), numeric zero (<code>0</code>, <code>0.0</code>), and <code>None</code> evaluate to <code>False</code> in boolean contexts. Everything else evaluates to <code>True</code>!\n</div>\n",
        "questions": [
          {
            "question": "What is the exact result of the following expression in Python 3?\n\nval = 7 // 2 + 7 % 2\nprint(val)",
            "description": "Analyze floor division and modulo arithmetic.",
            "options": [
              "4",
              "4.5",
              "3",
              "3.5"
            ],
            "answer": 0,
            "explanation": "7 // 2 performs floor division yielding integer 3. 7 % 2 calculates remainder 1. 3 + 1 = 4."
          },
          {
            "question": "What does the expression bool([]) == bool([False]) return?",
            "description": "Assess truthy and falsy value conversions.",
            "options": [
              "False, because [] is empty (falsy) while [False] contains an element (truthy)",
              "True, because both evaluate to False",
              "True, because [False] contains a falsy element",
              "TypeError: unhashable type list"
            ],
            "answer": 0,
            "explanation": "In Python, empty collections (like []) evaluate to False in a boolean context, whereas non-empty collections (even containing False) evaluate to True. Thus bool([]) is False and bool([False]) is True."
          },
          {
            "question": "What is the output of converting float('inf') > float('1e308') in Python?",
            "description": "Evaluate special IEEE floating-point representations.",
            "options": [
              "True",
              "False",
              "OverflowError",
              "ValueError"
            ],
            "answer": 0,
            "explanation": "float('inf') represents positive infinity, which is greater than any finite floating-point number, including 1e308."
          },
          {
            "question": "What does int('1010', 2) return?",
            "description": "Understand radix-based integer type casting.",
            "options": [
              "10",
              "1010",
              "12",
              "ValueError"
            ],
            "answer": 0,
            "explanation": "Passing a base argument of 2 to int() parses the string as a binary integer: 1*8 + 0*4 + 1*2 + 0*1 = 10."
          },
          {
            "question": "What is the type of variable 'z' in: z = 3 + 4j?",
            "description": "Identify Python built-in numeric primitives.",
            "options": [
              "complex",
              "float",
              "tuple",
              "imaginary"
            ],
            "answer": 0,
            "explanation": "Python natively supports complex numbers with real and imaginary parts denoted by the 'j' suffix, typed as <class 'complex'>."
          }
        ]
      },
      {
        "lesson_number": 3,
        "title": "Operators, Booleans & Advanced String Slicing",
        "description": "Master slicing steps, identity vs equality, short-circuit operators, and format specifiers.",
        "theory": "\n<h3>Chapter Overview: Operators, Booleans & Advanced String Slicing</h3>\n<p>Strings in Python are ordered sequences of Unicode characters. They are strictly <strong>immutable</strong>\u2014once created, their individual characters cannot be modified in place.</p>\n\n<h4>1. Extended String Slicing (<code>[start:stop:step]</code>)</h4>\n<p>Python slicing syntax allows you to extract sub-sequences using a start index (inclusive), stop index (exclusive), and an optional step (stride):</p>\n<pre><code class=\"language-python\">text = \"BhashaAcademy\"\n\n# [start:stop:step]\nprint(text[1:8:2])  # Indices 1, 3, 5, 7 -> \"hshA\"\n\n# Reversing a string with negative step\nreversed_str = text[::-1]\nprint(reversed_str) # \"ymedacAahsahB\"</code></pre>\n\n<h4>2. Identity (<code>is</code>) vs Equality (<code>==</code>)</h4>\n<ul>\n  <li><code>==</code> compares <strong>values</strong> (whether two objects contain the same data).</li>\n  <li><code>is</code> compares <strong>memory identity</strong> (whether both variables point to the exact same memory address via <code>id()</code>).</li>\n</ul>\n<pre><code class=\"language-python\">a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b) # True (same contents)\nprint(a is b) # False (distinct list instances in memory)</code></pre>\n\n<h4>3. Modern f-Strings & Formatting</h4>\n<pre><code class=\"language-python\">pi = 3.14159265\n# Format float to 2 decimal places\nprint(f\"Approximation: {pi:.2f}\") # Output: \"Approximation: 3.14\"\n\n# Short-circuit logical operators\n# 'or' returns the first truthy operand; 'and' returns the first falsy operand\nres = (0 or \"fallback\") and (\"active\" or \"backup\")\nprint(res) # Output: \"active\"</code></pre>\n",
        "questions": [
          {
            "question": "What is the output of the following string slice?\n\ntext = 'BhashaAcademy'\nprint(text[1:8:2])",
            "description": "Determine stride slicing behavior.",
            "options": [
              "hshA",
              "hsaa",
              "BahA",
              "hshAc"
            ],
            "answer": 0,
            "explanation": "Indices 1 through 7 (stop 8 is exclusive) are: index 1='h', index 3='s', index 5='h', index 7='A'. Result is 'hshA'."
          },
          {
            "question": "What does the expression (0 or 'default') and ('data' or 'backup') evaluate to?",
            "description": "Trace short-circuit logical operators.",
            "options": [
              "'data'",
              "'default'",
              "True",
              "'backup'"
            ],
            "answer": 0,
            "explanation": "0 is falsy, so (0 or 'default') evaluates to 'default'. In ('data' or 'backup'), 'data' is truthy, yielding 'data'. Finally, ('default' and 'data') returns the second operand 'data'."
          },
          {
            "question": "What will this print in Python?\n\ns1 = 'hello world'\ns2 = 'hello world'\nprint(s1 == s2, s1 is s2)",
            "description": "Examine string value equality vs memory identity.",
            "options": [
              "True True (or True False depending on string interning/runtime)",
              "False False always",
              "False True",
              "SyntaxError"
            ],
            "answer": 0,
            "explanation": "s1 == s2 is always True because their contents match. s1 is s2 checks identity; for short compile-time literals without special characters it may be interned, but 'is' should not be used for content equality."
          },
          {
            "question": "How do you format a float pi = 3.1415926 to two decimal places using f-strings?",
            "description": "Utilize modern f-string format specifications.",
            "options": [
              "f'{pi:.2f}'",
              "f'{pi:2d}'",
              "f'{round(pi, 2)}:float'",
              "f'{pi % 2}'"
            ],
            "answer": 0,
            "explanation": "The format specifier ':.2f' specifies floating-point representation rounded to 2 decimal digits."
          },
          {
            "question": "What is the result of 'abc' * 0?",
            "description": "Test string sequence multiplication edge cases.",
            "options": [
              "'' (empty string)",
              "None",
              "'abc'",
              "ValueError"
            ],
            "answer": 0,
            "explanation": "Multiplying a sequence by zero or any negative integer in Python produces an empty sequence of that type, here an empty string ''."
          }
        ]
      },
      {
        "lesson_number": 4,
        "title": "Conditionals & Structural Pattern Matching",
        "description": "Implement branching logic, ternary expressions, and Python 3.10+ match-case patterns.",
        "theory": "\n<h3>Chapter Overview: Conditionals & Structural Pattern Matching</h3>\n<p>Decision making in Python is controlled by <code>if</code>, <code>elif</code>, and <code>else</code> statements, complemented by concise conditional expressions (ternary operators) and modern <code>match...case</code> structural pattern matching.</p>\n\n<h4>1. Short-Hand Conditional Expressions (Ternary Operator)</h4>\n<p>Syntax: <code>value_if_true if condition else value_if_false</code></p>\n<pre><code class=\"language-python\">age = 17\nstatus = \"Adult\" if age >= 18 else \"Minor\" if age >= 13 else \"Child\"\nprint(status) # Output: \"Minor\"</code></pre>\n\n<h4>2. Structural Pattern Matching (Python 3.10+)</h4>\n<p>Python's <code>match...case</code> statement matches values against structured patterns with optional guards:</p>\n<pre><code class=\"language-python\">command = \"start\"\n\nmatch command:\n    case \"start\":\n        print(\"System initialized\")\n    case \"stop\" | \"halt\":\n        print(\"System shutting down\")\n    case _:\n        # Underscore '_' is the wildcard default case\n        print(\"Unknown command\")</code></pre>\n\n<h4>3. Chained Comparisons</h4>\n<p>Python evaluates chained relational operators seamlessly without requiring explicit <code>and</code> operators:</p>\n<pre><code class=\"language-python\">x = 5\n# Evaluates as: (1 < x) and (x < 10) and (10 == 10)\nprint(1 < x < 10 == 10) # True</code></pre>\n",
        "questions": [
          {
            "question": "What is the value of 'status' after executing this line?\n\nage = 17\nstatus = 'Adult' if age >= 18 else 'Minor' if age >= 13 else 'Child'",
            "description": "Trace nested ternary conditional expressions.",
            "options": [
              "'Minor'",
              "'Adult'",
              "'Child'",
              "SyntaxError"
            ],
            "answer": 0,
            "explanation": "age >= 18 is False (17 < 18), so the first 'else' branch executes: 'Minor' if age >= 13 else 'Child'. Since 17 >= 13 is True, it resolves to 'Minor'."
          },
          {
            "question": "In Python 3.10+, which keyword acts as the wildcard catch-all case in a match statement?\n\nmatch command:\n    case 'start': run()\n    case 'stop': halt()\n    case ______: unknown()",
            "description": "Identify wildcard syntax in structural pattern matching.",
            "options": [
              "_",
              "default",
              "*",
              "else"
            ],
            "answer": 0,
            "explanation": "In Python's match-case construct, the underscore '_' is the wildcard pattern that matches any value not matched by preceding cases."
          },
          {
            "question": "What will be printed by the following conditional block?\n\nval = []\nif val:\n    print('A')\nelif val == False:\n    print('B')\nelse:\n    print('C')",
            "description": "Distinguish between falsy evaluation and boolean equality.",
            "options": [
              "'C'",
              "'A'",
              "'B'",
              "'B' and 'C'"
            ],
            "answer": 0,
            "explanation": "bool([]) is False, so 'if val:' does not execute. However, [] == False is False because a list is not equal to a boolean. Hence the 'else' block executes, printing 'C'."
          },
          {
            "question": "What does this chained comparison evaluate to?\n\nprint(1 < 3 > 2 == 2 < 5)",
            "description": "Understand chained relational operators in Python.",
            "options": [
              "True",
              "False",
              "SyntaxError",
              "TypeError"
            ],
            "answer": 0,
            "explanation": "Python expands chained comparisons into conjunctions: (1 < 3) and (3 > 2) and (2 == 2) and (2 < 5). All conditions evaluate to True, so the expression yields True."
          },
          {
            "question": "Which statement about the 'pass' keyword in an if block is correct?",
            "description": "Clarify null-operation syntactic placeholders.",
            "options": [
              "It serves as a syntactic placeholder when a statement is required but no code is to be executed",
              "It terminates the loop containing the if statement",
              "It returns None from the surrounding function immediately",
              "It causes the interpreter to skip evaluating subsequent elif blocks"
            ],
            "answer": 0,
            "explanation": "The 'pass' statement is a null operation; nothing happens when it executes. It is used as a placeholder in compound statements where code is syntactically expected."
          }
        ]
      },
      {
        "lesson_number": 5,
        "title": "Loops, Iterators & Comprehensions",
        "description": "Understand loop else clauses, range boundaries, generator expressions, and iteration control.",
        "theory": "\n<h3>Chapter Overview: Loops, Iterators & Comprehensions</h3>\n<p>Python provides two fundamental loop constructs: <code>for</code> loops (used for iterating over iterables and sequences) and <code>while</code> loops (used for condition-driven iteration).</p>\n\n<h4>1. The <code>for...else</code> and <code>while...else</code> Construct</h4>\n<p>A unique feature in Python is the loop <code>else</code> clause. The <code>else</code> block executes <strong>only if the loop finishes naturally</strong> without hitting a <code>break</code> statement:</p>\n<pre><code class=\"language-python\"># Search with loop-else\nfor item in [1, 3, 5]:\n    if item == 4:\n        print(\"Found 4!\")\n        break\nelse:\n    print(\"4 was not found in the list.\") # Executes!</code></pre>\n\n<h4>2. List Comprehensions & Generator Expressions</h4>\n<p>List comprehensions provide an elegant syntax to transform and filter collections into new lists in a single line:</p>\n<pre><code class=\"language-python\"># List comprehension: constructed immediately in memory\nsquares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares) # [0, 4, 16, 36, 64]\n\n# Generator expression: evaluated lazily on demand\ngen = (x**2 for x in range(1000000))\nprint(next(gen)) # 0 (uses negligible memory!)</code></pre>\n\n<div class=\"theory-callout\">\n  <strong>Pitfall: Modifying a List During Iteration:</strong> Never remove or insert items into a list while iterating over it directly with <code>for item in my_list</code>. Removing shifts indices and causes elements to be skipped. Iterate over a slice copy <code>my_list[:]</code> instead.\n</div>\n",
        "questions": [
          {
            "question": "What does the following loop print?\n\nfor i in range(3):\n    if i == 5:\n        break\nelse:\n    print('Completed')",
            "description": "Analyze the execution rule of the loop 'else' clause.",
            "options": [
              "'Completed'",
              "Nothing",
              "0 1 2 'Completed'",
              "SyntaxError"
            ],
            "answer": 0,
            "explanation": "In Python, the 'else' clause of a for or while loop executes when the loop finishes iterating naturally without being interrupted by a 'break' statement."
          },
          {
            "question": "What is the output of the following list comprehension?\n\nres = [x * 2 for x in range(6) if x % 2 == 0]\nprint(res)",
            "description": "Evaluate filtered list comprehensions.",
            "options": [
              "[0, 4, 8]",
              "[0, 2, 4, 6, 8, 10]",
              "[4, 8]",
              "[0, 2, 4]"
            ],
            "answer": 0,
            "explanation": "range(6) produces 0, 1, 2, 3, 4, 5. Even numbers (x % 2 == 0) are 0, 2, 4. Multiplying by 2 produces [0, 4, 8]."
          },
          {
            "question": "What happens when you modify a list while iterating over it with a for loop?\n\nnums = [1, 2, 3, 4]\nfor n in nums:\n    if n == 2:\n        nums.remove(n)\nprint(nums)",
            "description": "Spot index shifting side effects during in-place list mutation.",
            "options": [
              "[1, 3, 4] but 3 is skipped during iteration",
              "[1, 3, 4] with all elements checked",
              "RuntimeError: list modified during iteration",
              "[1, 2, 4]"
            ],
            "answer": 0,
            "explanation": "Removing an item shifts remaining items left. The iterator's index counter advances to 2, causing it to skip element 3. While it doesn't throw a RuntimeError for lists, it leads to logical bugs."
          },
          {
            "question": "What does list(range(10, 0, -3)) produce?",
            "description": "Verify negative step range sequence generation.",
            "options": [
              "[10, 7, 4, 1]",
              "[10, 7, 4, 1, -2]",
              "[10, 8, 6, 4, 2]",
              "[]"
            ],
            "answer": 0,
            "explanation": "Starting at 10, decrementing by 3 while > 0 yields: 10, 7, 4, 1. The next step would be -2, which falls below the stop bound of 0."
          },
          {
            "question": "What is the primary memory difference between [x for x in range(1000000)] and (x for x in range(1000000))?",
            "description": "Distinguish list comprehensions from generator expressions.",
            "options": [
              "The list allocates all 1,000,000 integers in memory at once, while the generator yields items lazily on-demand",
              "The generator is faster for random access indexing than the list",
              "The list is immutable while the generator is mutable",
              "There is no difference; parentheses create a tuple list"
            ],
            "answer": 0,
            "explanation": "List comprehensions construct the entire list in memory immediately. Generator expressions (in parentheses) produce a generator object that yields elements lazily one by one, using minimal memory."
          }
        ]
      },
      {
        "lesson_number": 6,
        "title": "Functions, *args, **kwargs & Scope",
        "description": "Learn parameter passing, default argument pitfalls, variable arguments, and closures.",
        "theory": "\n<h3>Chapter Overview: Functions, *args, **kwargs & Scope</h3>\n<p>Functions are first-class citizens in Python\u2014they can be passed as arguments, assigned to variables, and returned from other functions.</p>\n\n<h4>1. The Mutable Default Argument Trap</h4>\n<p>Default parameter values are evaluated <strong>once</strong> when the function is defined, not on every call. If you use a mutable default like a list or dictionary, changes persist across calls:</p>\n<pre><code class=\"language-python\"># BAD PRACTICE:\ndef add_item(val, target=[]):\n    target.append(val)\n    return target\n\n# CORRECT IDIOM:\ndef add_item_safe(val, target=None):\n    if target is None:\n        target = []\n    target.append(val)\n    return target</code></pre>\n\n<h4>2. Variable Arguments: <code>*args</code> and <code>**kwargs</code></h4>\n<ul>\n  <li><code>*args</code> packs arbitrary positional arguments into a <strong>tuple</strong>.</li>\n  <li><code>**kwargs</code> packs arbitrary keyword arguments into a <strong>dictionary</strong>.</li>\n</ul>\n<pre><code class=\"language-python\">def report(title, *scores, **metadata):\n    print(\"Title:\", title)\n    print(\"Scores tuple:\", scores)\n    print(\"Metadata dict:\", metadata)\n\nreport(\"Math\", 95, 88, 92, scholar=\"Harshit\", level=4)</code></pre>\n\n<h4>3. Lambda Expressions & Higher-Order Functions</h4>\n<p>Anonymous one-line functions defined with <code>lambda</code> are often used with <code>map()</code>, <code>filter()</code>, and sorting:</p>\n<pre><code class=\"language-python\">nums = [1, 2, 3, 4]\ndoubled = list(map(lambda x: x * 2, nums)) # [2, 4, 6, 8]</code></pre>\n",
        "questions": [
          {
            "question": "What is the classic output of this infamous Python function?\n\ndef append_item(val, target=[]):\n    target.append(val)\n    return target\n\nprint(append_item(1))\nprint(append_item(2))",
            "description": "Identify the mutable default argument trap.",
            "options": [
              "[1] then [1, 2]",
              "[1] then [2]",
              "[1, 2] then [1, 2]",
              "TypeError"
            ],
            "answer": 0,
            "explanation": "Default arguments in Python are evaluated once at function definition time, not every time the function is called. The same list instance 'target' persists across calls."
          },
          {
            "question": "How does Python handle a function defined as:\n\ndef compute(a, b, /, c, *, d):\n    return a + b + c + d",
            "description": "Interpret positional-only (/) and keyword-only (*) parameter markers.",
            "options": [
              "'a' and 'b' must be positional-only; 'd' must be keyword-only",
              "'c' is keyword-only; 'd' is positional-only",
              "'/' denotes division in parameters; '*' denotes multiplication",
              "SyntaxError in Python 3.8+"
            ],
            "answer": 0,
            "explanation": "In Python 3.8+, parameters before '/' are positional-only. Parameters after '*' are keyword-only. Parameters between '/' and '*' can be passed positionally or by keyword."
          },
          {
            "question": "What is the output of the following lambda with map()?\n\nnums = [1, 2, 3, 4]\nres = list(map(lambda x: x**2 if x % 2 == 0 else -x, nums))\nprint(res)",
            "description": "Evaluate higher-order functions combined with lambda expressions.",
            "options": [
              "[-1, 4, -3, 16]",
              "[1, 4, 3, 16]",
              "[-1, -2, -3, -4]",
              "[0, 4, 0, 16]"
            ],
            "answer": 0,
            "explanation": "For 1: odd -> -1. For 2: even -> 2**2 = 4. For 3: odd -> -3. For 4: even -> 4**2 = 16. Result is [-1, 4, -3, 16]."
          },
          {
            "question": "What does *args and **kwargs pack incoming arguments into?",
            "description": "Identify underlying data structures for variable parameters.",
            "options": [
              "*args packs into a tuple, **kwargs packs into a dict",
              "*args packs into a list, **kwargs packs into a tuple",
              "Both pack into dictionaries",
              "Both pack into immutable sets"
            ],
            "answer": 0,
            "explanation": "*args collects excess positional arguments into an immutable tuple. **kwargs collects excess keyword arguments into a standard dictionary."
          },
          {
            "question": "What happens when you return multiple comma-separated values from a Python function: return x, y, z?",
            "description": "Understand implicit tuple packing in returns.",
            "options": [
              "Python packs them into a single tuple (x, y, z)",
              "Only the last value 'z' is returned",
              "A list [x, y, z] is created",
              "A syntax error is raised unless parentheses are included"
            ],
            "answer": 0,
            "explanation": "In Python, comma-separated expressions without enclosing brackets default to tuple packing. Hence 'return x, y, z' returns the tuple '(x, y, z)'."
          }
        ]
      },
      {
        "lesson_number": 7,
        "title": "Collections: Lists, Tuples, Sets & Dictionaries",
        "description": "Examine mutability, hashing, dictionary retrieval methods, and set algebraic operations.",
        "theory": "\n<h3>Chapter Overview: Collections: Lists, Tuples, Sets & Dictionaries</h3>\n<p>Python offers four primary built-in collection data types, each with distinct performance characteristics, mutability rules, and indexing guarantees.</p>\n\n<table>\n  <thead>\n    <tr><th>Collection</th><th>Ordered?</th><th>Mutable?</th><th>Duplicates?</th><th>Lookup Time</th></tr>\n  </thead>\n  <tbody>\n    <tr><td><strong>List</strong> <code>[]</code></td><td>Yes</td><td>Yes</td><td>Allowed</td><td>O(n) search</td></tr>\n    <tr><td><strong>Tuple</strong> <code>()</code></td><td>Yes</td><td>No (Immutable)</td><td>Allowed</td><td>O(n) search</td></tr>\n    <tr><td><strong>Set</strong> <code>{}</code></td><td>No</td><td>Yes</td><td>Unique only</td><td>O(1) average hash lookup</td></tr>\n    <tr><td><strong>Dictionary</strong> <code>{k: v}</code></td><td>Yes (3.7+)</td><td>Yes (Keys immutable)</td><td>Keys unique</td><td>O(1) average hash lookup</td></tr>\n  </tbody>\n</table>\n\n<h4>1. Safe Dictionary Access with <code>.get()</code></h4>\n<pre><code class=\"language-python\">scores = {\"Alice\": 90, \"Bob\": 85}\n# Using [] raises KeyError if key is missing:\n# print(scores[\"Charlie\"]) -> KeyError!\n\n# .get() safely returns a default fallback:\nprint(scores.get(\"Charlie\", 0)) # Output: 0</code></pre>\n\n<h4>2. Set Algebraic Operations</h4>\n<pre><code class=\"language-python\">a = {1, 2, 3}\nb = {3, 4, 5}\nprint(a | b) # Union: {1, 2, 3, 4, 5}\nprint(a & b) # Intersection: {3}\nprint(a - b) # Difference: {1, 2}\nprint(a ^ b) # Symmetric Difference: {1, 2, 4, 5}</code></pre>\n",
        "questions": [
          {
            "question": "What will d.get('key', 'default') do if 'key' does not exist in dictionary d?",
            "description": "Analyze safe dictionary key retrieval.",
            "options": [
              "Returns 'default' without modifying d or raising a KeyError",
              "Raises a KeyError exception",
              "Inserts 'key': 'default' into dictionary d and returns 'default'",
              "Returns None"
            ],
            "answer": 0,
            "explanation": "The dict.get(key, default) method safely retrieves a value. If the key is absent, it returns the provided fallback without mutating the dictionary, unlike dict.setdefault()."
          },
          {
            "question": "Which of the following can be safely used as a dictionary key in Python?",
            "description": "Identify requirements for hashable types.",
            "options": [
              "(1, 2, 'apple')",
              "[1, 2, 'apple']",
              "{'id': 101}",
              "{1, 2, 3}"
            ],
            "answer": 0,
            "explanation": "Dictionary keys must be hashable and immutable. Tuples containing only immutable objects are hashable. Lists, sets, and dicts are mutable and unhashable."
          },
          {
            "question": "What is the result of set union and intersection on sets a = {1, 2, 3} and b = {3, 4, 5}?\n\nprint(a ^ b)",
            "description": "Identify set operators and symmetric difference.",
            "options": [
              "{1, 2, 4, 5}",
              "{3}",
              "{1, 2, 3, 4, 5}",
              "TypeError"
            ],
            "answer": 0,
            "explanation": "The caret '^' operator computes symmetric difference (elements in either set a or set b, but not in both). {1, 2, 3} ^ {3, 4, 5} = {1, 2, 4, 5}."
          },
          {
            "question": "What happens when you run this code?\n\ntup = (1, [2, 3], 4)\ntup[1].append(99)\nprint(tup)",
            "description": "Evaluate tuple immutability containing mutable references.",
            "options": [
              "(1, [2, 3, 99], 4)",
              "TypeError: 'tuple' object does not support item assignment",
              "(1, [2, 3], 4)",
              "SyntaxError"
            ],
            "answer": 0,
            "explanation": "Tuples are immutable in that their references cannot be reassigned. However, mutable objects stored within a tuple (like the list at index 1) can still be mutated in place."
          },
          {
            "question": "What does dict comprehension {x: x**2 for x in (2, 4, 6)} generate?",
            "description": "Test dictionary comprehension generation.",
            "options": [
              "{2: 4, 4: 16, 6: 36}",
              "[(2, 4), (4, 16), (6, 36)]",
              "{4, 16, 36}",
              "{2, 4, 6: 4, 16, 36}"
            ],
            "answer": 0,
            "explanation": "A dictionary comprehension maps each key to its computed value: {2: 4, 4: 16, 6: 36}."
          }
        ]
      },
      {
        "lesson_number": 8,
        "title": "OOP: Classes, Inheritance & Dunder Methods",
        "description": "Master object-oriented programming, class vs instance state, method overriding, and super().",
        "theory": "\n<h3>Chapter Overview: OOP: Classes, Inheritance & Dunder Methods</h3>\n<p>Object-Oriented Programming in Python centers on classes that bundle state (attributes) and behavior (methods) together into reusable blueprints.</p>\n\n<h4>1. The <code>__init__</code> Constructor & The <code>self</code> Parameter</h4>\n<p><code>self</code> represents the specific instance of the class being created or called:</p>\n<pre><code class=\"language-python\">class Scholar:\n    # Class attribute (shared by all instances)\n    academy = \"Royal Academy of Code\"\n\n    def __init__(self, name, track):\n        # Instance attributes (unique to each instance)\n        self.name = name\n        self.track = track\n\n    def __str__(self):\n        # Dunder method invoked by print() and str()\n        return f\"{self.name} mastering {self.track}\"</code></pre>\n\n<h4>2. Inheritance & The <code>super()</code> Method</h4>\n<pre><code class=\"language-python\">class Person:\n    def __init__(self, name):\n        self.name = name\n\n    def get_role(self):\n        return \"Member\"\n\nclass Student(Person):\n    def __init__(self, name, grade):\n        super().__init__(name) # Delegate to parent constructor\n        self.grade = grade\n\n    def get_role(self):\n        return super().get_role() + \" -> Student\"</code></pre>\n\n<div class=\"theory-callout\">\n  <strong>Name Mangling:</strong> Prefixing an attribute with two leading underscores (e.g. <code>self.__secret</code>) causes Python to internally rename it as <code>_ClassName__secret</code> to prevent accidental overrides in derived subclasses.\n</div>\n",
        "questions": [
          {
            "question": "What is the output of the following class hierarchy?\n\nclass Parent:\n    def speak(self):\n        return 'Parent'\n\nclass Child(Parent):\n    def speak(self):\n        return super().speak() + ' -> Child'\n\nc = Child()\nprint(c.speak())",
            "description": "Analyze method resolution and super() dispatch.",
            "options": [
              "Parent -> Child",
              "Child",
              "Parent",
              "AttributeError"
            ],
            "answer": 0,
            "explanation": "Child overrides speak(), calls super().speak() which resolves to Parent's speak() returning 'Parent', and concatenates ' -> Child'."
          },
          {
            "question": "What does a variable declared inside a class body, outside any method, represent?\n\nclass Account:\n    bank_name = 'Royal Academy'",
            "description": "Differentiate class variables from instance variables.",
            "options": [
              "A class variable shared across all instances of Account",
              "A private instance variable unique to each object",
              "A constant that cannot be altered",
              "A local variable inaccessible outside class definition"
            ],
            "answer": 0,
            "explanation": "Variables defined directly in the class body are class attributes (shared by all instances), accessible via Account.bank_name or self.bank_name."
          },
          {
            "question": "How does name mangling work in Python when prefixing an attribute with double underscores, e.g. self.__balance?",
            "description": "Understand Python private variable naming conventions.",
            "options": [
              "Python internally rewrites it as _ClassName__balance to prevent accidental override in subclasses",
              "It makes the variable strictly inaccessible by the operating system kernel",
              "It encrypts the memory address of the variable",
              "It converts the variable into a read-only property"
            ],
            "answer": 0,
            "explanation": "Python does not have true access-modifier enforcement; instead, prefixing with double underscores mangles the name to '_ClassName__attribute' to prevent name collisions in subclasses."
          },
          {
            "question": "What special dunder method is invoked when print(obj) or str(obj) is called on an instance?",
            "description": "Identify string representation dunder methods.",
            "options": [
              "__str__(self)",
              "__repr__(self)",
              "__print__(self)",
              "__display__(self)"
            ],
            "answer": 0,
            "explanation": "__str__(self) is invoked by str() and print() to produce an informal, readable string representation of the object. (__repr__ is the formal fallback)."
          },
          {
            "question": "What will isinstance(True, int) return in Python?",
            "description": "Explore Python's class inheritance tree for primitive booleans.",
            "options": [
              "True, because bool is a direct subclass of int in Python",
              "False, because bool and int are completely separate primitive types",
              "TypeError: invalid class comparison",
              "False, because booleans only store logical values"
            ],
            "answer": 0,
            "explanation": "In Python, bool is historically and structurally a subclass of int. True has the integer value 1, and isinstance(True, int) is True."
          }
        ]
      }
    ]
  },
  "Java": {
    "icon": "\u2615",
    "lessons": [
      {
        "lesson_number": 1,
        "title": "Java Syntax, Output & JVM Entrypoint",
        "description": "Understand public static void main, System.out streams, compilation model, and class structure.",
        "theory": "\n<h3>Chapter Overview: Java Syntax, Output & JVM Entrypoint</h3>\n<p>Java is a statically typed, class-based, object-oriented language. Source code (<code>.java</code>) is compiled by <code>javac</code> into platform-independent bytecode (<code>.class</code>), which is executed by the <strong>Java Virtual Machine (JVM)</strong>.</p>\n\n<h4>1. Anatomy of the Main Method</h4>\n<pre><code class=\"language-java\">public class Main {\n    // JVM entrypoint\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Royal Academy!\");\n    }\n}</code></pre>\n<ul>\n  <li><code>public</code>: Access modifier allowing the JVM to invoke the method from outside the package.</li>\n  <li><code>static</code>: Allows the JVM to call the method without instantiating an object of the class.</li>\n  <li><code>void</code>: The method returns no value upon completion.</li>\n  <li><code>String[] args</code>: Array of command-line arguments passed to the program.</li>\n</ul>\n\n<h4>2. Output Streams: <code>print</code> vs <code>println</code></h4>\n<pre><code class=\"language-java\">System.out.print(\"A\");   // Outputs 'A' without adding a newline\nSystem.out.println(\"B\"); // Outputs 'B' and advances cursor to next line\nSystem.out.print(\"C\");   // Printed on the next line! Output: AB then C</code></pre>\n",
        "questions": [
          {
            "question": "Why must the main method in Java be declared as 'static'?\n\npublic static void main(String[] args)",
            "description": "Analyze JVM bootstrapping and static execution.",
            "options": [
              "To allow the JVM to invoke it without having to instantiate the class first",
              "Because static methods run faster than non-static methods",
              "To prevent the method from being overloaded",
              "Because Java does not support constructors for the entrypoint class"
            ],
            "answer": 0,
            "explanation": "The JVM needs to call main() before any objects of the class are created. Declaring it static allows execution directly via ClassName.main()."
          },
          {
            "question": "What is the output of the following Java print statements?\n\nSystem.out.print(\"A\");\nSystem.out.println(\"B\");\nSystem.out.print(\"C\");",
            "description": "Differentiate System.out.print from System.out.println.",
            "options": [
              "AB on line 1, and C on line 2",
              "A on line 1, B on line 2, C on line 3",
              "A B C on a single line",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "print(\"A\") prints 'A' without a newline. println(\"B\") prints 'B' and appends a newline. Then print(\"C\") prints 'C' on the next line."
          },
          {
            "question": "What is the extension of the compiled bytecode file generated by javac for a class named Academy?",
            "description": "Understand Java source code compilation.",
            "options": [
              ".class",
              ".java",
              ".jvm",
              ".jar"
            ],
            "answer": 0,
            "explanation": "The javac compiler compiles Java source code (.java) into platform-independent bytecode saved as .class files."
          },
          {
            "question": "Which of the following is a valid identifier name in Java?",
            "description": "Verify Java identifier naming rules.",
            "options": [
              "_userCount$2",
              "2userCount",
              "user-count",
              "class"
            ],
            "answer": 0,
            "explanation": "Java identifiers can start with a letter, currency character ($), or underscore (_). They cannot start with a digit, contain hyphens, or match reserved keywords like 'class'."
          },
          {
            "question": "What happens if a Java source file has multiple public classes?",
            "description": "Assess file naming and class visibility constraints.",
            "options": [
              "Compile-time error: a Java file can contain at most one public class, matching the filename",
              "The compiler compiles each into separate directories",
              "Only the first public class is accessible",
              "It compiles successfully if package-private"
            ],
            "answer": 0,
            "explanation": "In Java, each compilation unit (.java file) can contain at most one top-level public class, and the filename must match that public class name."
          }
        ]
      },
      {
        "lesson_number": 2,
        "title": "Variables, Data Types & Type Casting",
        "description": "Explore primitive vs reference types, widening/narrowing casting, and memory boundaries.",
        "theory": "\n<h3>Chapter Overview: Variables, Data Types & Type Casting</h3>\n<p>Java enforces strict static typing. Every variable must have a declared type before it can be used. Java features two data type categories: <strong>8 Primitive Types</strong> and <strong>Reference Types</strong>.</p>\n\n<h4>1. The 8 Primitive Types</h4>\n<ul>\n  <li><code>byte</code> (8 bits, -128 to 127)</li>\n  <li><code>short</code> (16 bits, -32,768 to 32,767)</li>\n  <li><code>int</code> (32 bits, -2^31 to 2^31-1) \u2014 standard integer type</li>\n  <li><code>long</code> (64 bits, suffix with <code>L</code>)</li>\n  <li><code>float</code> (32-bit floating point, suffix with <code>f</code>)</li>\n  <li><code>double</code> (64-bit floating point) \u2014 standard decimal type</li>\n  <li><code>boolean</code> (true or false, defaults to false for instance fields)</li>\n  <li><code>char</code> (16-bit Unicode character, e.g. <code>'A'</code>)</li>\n</ul>\n\n<h4>2. Widening vs Narrowing Casting</h4>\n<pre><code class=\"language-java\">// Widening (Implicit / Automatic): smaller type to larger type\nint myInt = 9;\ndouble myDouble = myInt; // Automatic casting to 9.0\n\n// Narrowing (Explicit / Manual): larger type to smaller type\ndouble d = 9.99;\nint truncated = (int) d; // Truncates decimal part -> 9\n\n// Integer Overflow Wraparound:\nbyte b = 127;\nb++; // Overflows in two's complement -> -128!</code></pre>\n",
        "questions": [
          {
            "question": "What is the result of executing this code in Java?\n\nbyte b = 127;\nb++;\nSystem.out.println(b);",
            "description": "Analyze primitive integer overflow and byte wraparound.",
            "options": [
              "-128",
              "128",
              "Compilation error: type mismatch",
              "ArithmeticException"
            ],
            "answer": 0,
            "explanation": "A signed byte in Java has a range from -128 to 127. Incrementing 127 causes integer overflow, wrapping around to -128 in two's complement representation."
          },
          {
            "question": "What will this expression produce in Java?\n\ndouble d = 9.99;\nint i = (int) d;\nSystem.out.println(i);",
            "description": "Evaluate explicit narrowing type casting.",
            "options": [
              "9 (truncated towards zero)",
              "10 (rounded up)",
              "9.99",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "Explicit narrowing conversion from floating-point to integer truncates the fractional part towards zero, yielding 9."
          },
          {
            "question": "Which of the following is NOT a primitive data type in Java?",
            "description": "Distinguish primitive types from reference types.",
            "options": [
              "String",
              "boolean",
              "float",
              "char"
            ],
            "answer": 0,
            "explanation": "Java has 8 primitive types: byte, short, int, long, float, double, boolean, and char. String is a reference type (a class)."
          },
          {
            "question": "What is the default value of an uninitialized instance variable of type boolean in Java?",
            "description": "Identify default field values.",
            "options": [
              "false",
              "true",
              "null",
              "0"
            ],
            "answer": 0,
            "explanation": "In Java, instance and static fields of boolean type default to false. (Local variables inside methods must be explicitly initialized before use)."
          },
          {
            "question": "What is the size of an int primitive in Java across all operating systems?",
            "description": "Verify Java's 'write once, run anywhere' platform independence.",
            "options": [
              "32 bits (4 bytes)",
              "16 bits on 32-bit OS, 32 bits on 64-bit OS",
              "64 bits (8 bytes)",
              "Varies by JVM vendor"
            ],
            "answer": 0,
            "explanation": "Java defines the size of all primitive types strictly in the language specification: int is always exactly 32 bits (4 bytes), signed, two's complement."
          }
        ]
      },
      {
        "lesson_number": 3,
        "title": "Operators & Strings (Immutability & String Pool)",
        "description": "Master String pool behavior, reference equality vs equals(), and concatenation semantics.",
        "theory": "\n<h3>Chapter Overview: Operators & Strings (Immutability & String Pool)</h3>\n<p>In Java, <code>String</code> is a reference object representing an immutable sequence of characters. Once created, a String cannot be altered in memory.</p>\n\n<h4>1. String Constant Pool vs The Heap</h4>\n<pre><code class=\"language-java\">String s1 = \"Bhasha\";               // Stored in String Constant Pool\nString s2 = \"Bhasha\";               // Reuses cached reference in pool\nString s3 = new String(\"Bhasha\");   // Force-allocates a new object on the heap\n\nSystem.out.println(s1 == s2);       // true (same memory address)\nSystem.out.println(s1 == s3);       // false (different heap instances!)\nSystem.out.println(s1.equals(s3));  // true (compares actual character content)</code></pre>\n\n<h4>2. Operator Precedence in String Concatenation</h4>\n<p>The <code>+</code> operator evaluates left-to-right. If one operand is a String, numeric addition transitions into string concatenation:</p>\n<pre><code class=\"language-java\">System.out.println(10 + 20 + \"Java\"); // \"30Java\" (10+20=30, then string concat)\nSystem.out.println(\"Java\" + 10 + 20); // \"Java1020\" (\"Java\"+10=\"Java10\", then +20)</code></pre>\n\n<div class=\"theory-callout\">\n  <strong>Performance Tip:</strong> For high-frequency string concatenation inside loops, avoid <code>String +</code>. Use <code>StringBuilder</code> (fast, non-thread-safe) or <code>StringBuffer</code> (synchronized, thread-safe).\n</div>\n",
        "questions": [
          {
            "question": "What will be printed by the following code?\n\nString s1 = \"Bhasha\";\nString s2 = new String(\"Bhasha\");\nSystem.out.println((s1 == s2) + \" \" + s1.equals(s2));",
            "description": "Examine the Java String Constant Pool vs heap allocation.",
            "options": [
              "false true",
              "true true",
              "false false",
              "true false"
            ],
            "answer": 0,
            "explanation": "s1 points to the String pool, while s2 explicitly creates a new object on the heap. '==' compares memory references (false), whereas .equals() compares character content (true)."
          },
          {
            "question": "What does the following snippet print?\n\nSystem.out.println(10 + 20 + \"Java\" + 10 + 20);",
            "description": "Trace operator precedence and string concatenation associativity.",
            "options": [
              "30Java1020",
              "1020Java1020",
              "30Java30",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "Evaluation is left-to-right: 10 + 20 = 30 (integer addition). 30 + \"Java\" = \"30Java\" (string concatenation). \"30Java\" + 10 = \"30Java10\". \"30Java10\" + 20 = \"30Java1020\"."
          },
          {
            "question": "Why are String objects immutable in Java?",
            "description": "Analyze architectural design of Java Strings.",
            "options": [
              "For security, synchronization thread-safety, and string pool memory efficiency",
              "Because Java lacks pointer manipulation support",
              "To prevent them from being used in HashMaps",
              "Because all reference types in Java are immutable"
            ],
            "answer": 0,
            "explanation": "String immutability allows String pooling (saving heap memory), provides thread safety without synchronization, and protects sensitive parameters like network ports or file paths."
          },
          {
            "question": "What is the return value of \"Programming\".substring(3, 7)?",
            "description": "Inspect substring index boundaries.",
            "options": [
              "\"gram\"",
              "\"prog\"",
              "\"gramm\"",
              "\"gra\""
            ],
            "answer": 0,
            "explanation": "String.substring(beginIndex, endIndex) includes beginIndex (3) and excludes endIndex (7). Index 3='g', 4='r', 5='a', 6='m', giving 'gram'."
          },
          {
            "question": "Which class should you use if you need thread-safe, mutable character sequences in Java?",
            "description": "Differentiate StringBuffer from StringBuilder.",
            "options": [
              "StringBuffer",
              "StringBuilder",
              "String",
              "CharArray"
            ],
            "answer": 0,
            "explanation": "StringBuffer is synchronized and thread-safe. StringBuilder is unsynchronized (faster, but not thread-safe). String is immutable."
          }
        ]
      },
      {
        "lesson_number": 4,
        "title": "Decision Making: if...else & Switch Statements",
        "description": "Implement multi-branch decision structures, switch fallthrough rules, and pattern matching.",
        "theory": "\n<h3>Chapter Overview: Decision Making: if...else & Switch Statements</h3>\n<p>Decision making enables programs to execute distinct code paths depending on boolean conditions or evaluated integral expressions.</p>\n\n<h4>1. The <code>switch</code> Statement & Fallthrough</h4>\n<p>If a <code>case</code> block does not end with a <code>break</code> statement, execution continues seamlessly into the next case regardless of the condition\u2014this is known as <strong>fallthrough</strong>:</p>\n<pre><code class=\"language-java\">int level = 2;\nswitch (level) {\n    case 1: System.out.print(\"Bronze \");\n    case 2: System.out.print(\"Silver \"); // Matches\n    case 3: System.out.print(\"Gold \");   // Falls through!\n    default: System.out.print(\"Member\"); // Falls through!\n}\n// Output: \"Silver Gold Member\"</code></pre>\n\n<h4>2. Supported Types in Java Switch</h4>\n<p>You can switch on: <code>byte</code>, <code>short</code>, <code>char</code>, <code>int</code>, <code>enum</code> types, and <code>String</code>. You <strong>cannot</strong> switch on floating-point numbers (<code>float</code>, <code>double</code>) or <code>boolean</code>.</p>\n",
        "questions": [
          {
            "question": "What is the output of the following switch snippet?\n\nint code = 2;\nswitch (code) {\n    case 1: System.out.print(\"1 \");\n    case 2: System.out.print(\"2 \");\n    case 3: System.out.print(\"3 \");\n    default: System.out.print(\"D\");\n}",
            "description": "Identify switch fallthrough when break statements are omitted.",
            "options": [
              "2 3 D",
              "2",
              "2 3",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "Because case 2 lacks a 'break' statement, execution falls through all subsequent cases (case 3 and default), printing '2 3 D'."
          },
          {
            "question": "Which of the following types CANNOT be used in a standard Java switch expression?",
            "description": "Identify valid switch expression types.",
            "options": [
              "float / double",
              "int / byte / short / char",
              "String",
              "enum types"
            ],
            "answer": 0,
            "explanation": "Java switch statements do not support floating-point types (float, double) or boolean due to rounding and precision issues. Integral types, String, and enum are supported."
          },
          {
            "question": "What does the ternary expression evaluate to?\n\nint x = 5;\nString out = (x > 3) ? (x < 10 ? \"In Range\" : \"High\") : \"Low\";\nSystem.out.println(out);",
            "description": "Evaluate nested ternary expressions.",
            "options": [
              "\"In Range\"",
              "\"High\"",
              "\"Low\"",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "x > 3 is True (5 > 3), so the first branch (x < 10 ? \"In Range\" : \"High\") evaluates. Since 5 < 10 is True, it returns 'In Range'."
          },
          {
            "question": "What is the consequence of writing 'if (x = true)' instead of 'if (x == true)' in Java when x is boolean?",
            "description": "Spot assignment inside conditional expressions.",
            "options": [
              "It assigns true to x and evaluates the condition to true",
              "It causes a compilation error because assignment cannot be used in an if statement",
              "It checks equality and ignores the assignment",
              "It throws an IllegalArgumentException"
            ],
            "answer": 0,
            "explanation": "In Java, an assignment expression evaluates to the assigned value. Since x is a boolean, (x = true) evaluates to the boolean value 'true', compiling and entering the if block."
          },
          {
            "question": "What is the purpose of the 'default' branch in a switch statement?",
            "description": "Clarify default fallback handling.",
            "options": [
              "It executes when none of the case constants match the evaluated expression",
              "It is mandatory in every switch block or code won't compile",
              "It must always be placed at the very top of the switch block",
              "It resets the switch variable to null"
            ],
            "answer": 0,
            "explanation": "The 'default' label is optional and specifies the code to execute if no explicit case match is found."
          }
        ]
      },
      {
        "lesson_number": 5,
        "title": "Loops: while, do...while, for & for-each",
        "description": "Trace pre/post test loops, enhanced for-each iteration, and labeled break/continue.",
        "theory": "\n<h3>Chapter Overview: Loops: while, do...while, for & for-each</h3>\n<p>Loops repeat a block of code as long as a specified condition remains true.</p>\n\n<h4>1. Pre-test vs Post-test Loops</h4>\n<ul>\n  <li><code>while</code>: Evaluates condition before executing the loop body. If false initially, it executes 0 times.</li>\n  <li><code>do...while</code>: Evaluates condition at the bottom. <strong>Guaranteed to execute at least once!</strong></li>\n</ul>\n\n<h4>2. Enhanced for-each Loop & Fail-Fast Iterators</h4>\n<pre><code class=\"language-java\">int[] scores = {90, 85, 78};\nfor (int s : scores) {\n    System.out.println(s);\n}\n\n// Labeled Break for nested loops:\nouter:\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (i == 1 && j == 1) break outer; // Breaks out of outer loop entirely\n    }\n}</code></pre>\n",
        "questions": [
          {
            "question": "What is guaranteed about a do-while loop compared to a standard while loop in Java?",
            "description": "Differentiate entry-condition vs exit-condition loops.",
            "options": [
              "The body of a do-while loop always executes at least once before testing the condition",
              "A do-while loop runs faster because it bypasses condition checks",
              "A do-while loop cannot use the break keyword",
              "A do-while loop executes only when the condition is initially false"
            ],
            "answer": 0,
            "explanation": "A do-while loop tests its condition at the bottom of the loop; therefore, the loop body is guaranteed to execute at least once."
          },
          {
            "question": "What will be printed by this nested loop with a labeled break?\n\nouter:\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (i == 1 && j == 1) break outer;\n        System.out.print(i + \"\" + j + \" \");\n    }\n}",
            "description": "Trace labeled break statements in nested loops.",
            "options": [
              "00 01 02 10 ",
              "00 01 02 10 11 ",
              "00 01 02 ",
              "00 01 02 10 12 20 21 22 "
            ],
            "answer": 0,
            "explanation": "When i=0: prints 00 01 02. When i=1, j=0: prints 10. When i=1, j=1: 'break outer' breaks entirely out of the outer loop. Result is '00 01 02 10 '."
          },
          {
            "question": "What happens if you attempt to remove an element directly from a list while iterating using an enhanced for-each loop?\n\nfor (String item : list) { list.remove(item); }",
            "description": "Recognize fail-fast iterator behavior.",
            "options": [
              "ConcurrentModificationException is thrown at runtime",
              "The element is removed smoothly",
              "IndexOutOfBoundsException is thrown",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "Enhanced for-each loops use an internal Iterator. Mutating the underlying collection directly causes the fail-fast iterator to throw ConcurrentModificationException."
          },
          {
            "question": "What is the output of the following loop?\n\nint count = 0;\nfor (int i = 0; i < 5; ++i) {\n    count += i;\n}\nSystem.out.println(count);",
            "description": "Compute accumulator sum in standard for loop.",
            "options": [
              "10",
              "15",
              "5",
              "0"
            ],
            "answer": 0,
            "explanation": "i takes values 0, 1, 2, 3, 4. Sum = 0 + 1 + 2 + 3 + 4 = 10."
          },
          {
            "question": "What does a for loop without condition 'for(;;)' represent in Java?",
            "description": "Identify standard infinite loop idioms.",
            "options": [
              "An infinite loop identical to while(true)",
              "A compilation error: empty loop header",
              "A loop that terminates after 1 cycle",
              "A loop that executes zero times"
            ],
            "answer": 0,
            "explanation": "In Java, an omitted condition in a for(;;) statement defaults to true, creating an infinite loop that continues until a break or return statement is encountered."
          }
        ]
      },
      {
        "lesson_number": 6,
        "title": "Methods, Parameters & Method Overloading",
        "description": "Understand Java's strictly pass-by-value model, return types, and compile-time polymorphism.",
        "theory": "\n<h3>Chapter Overview: Methods, Parameters & Method Overloading</h3>\n<p>A method is a block of code that only runs when called. In Java, methods must be declared within a class.</p>\n\n<h4>1. Java is Strictly Pass-by-Value</h4>\n<p>When an argument is passed to a method, Java creates a copy of the value. For object references, a copy of the reference pointer is passed. Reassigning the parameter variable inside the method does not change the caller's reference:</p>\n<pre><code class=\"language-java\">void modify(int x) { x = 50; }\nint n = 10;\nmodify(n);\nSystem.out.println(n); // Output: 10 (unchanged!)</code></pre>\n\n<h4>2. Method Overloading Rules</h4>\n<p>Two methods can share the same name if their parameter lists differ in count or types. Changing only the return type is <strong>not</strong> valid overloading:</p>\n<pre><code class=\"language-java\">int add(int a, int b) { return a + b; }\ndouble add(double a, double b) { return a + b; } // VALID\n// double add(int a, int b) -> COMPILATION ERROR!</code></pre>\n",
        "questions": [
          {
            "question": "Is Java pass-by-value or pass-by-reference when passing object references to methods?",
            "description": "Clarify parameter passing semantics in Java.",
            "options": [
              "Strictly pass-by-value: the reference address itself is copied by value",
              "Pass-by-reference for objects, pass-by-value for primitives",
              "Pass-by-reference for both",
              "Pass-by-name"
            ],
            "answer": 0,
            "explanation": "Java is strictly pass-by-value. When an object is passed, the value of the reference (memory address) is passed by value. Reassigning the parameter inside the method has no effect on the caller's reference."
          },
          {
            "question": "Which pair of methods demonstrates VALID method overloading in Java?",
            "description": "Identify legal method signatures for overloading.",
            "options": [
              "int add(int a, int b) AND double add(int a, double b)",
              "int calculate(int x) AND double calculate(int x)",
              "void show(int a) AND public void show(int a)",
              "static void run() AND void run()"
            ],
            "answer": 0,
            "explanation": "Overloading requires distinct parameter lists (different number or types of parameters). Changing only the return type or access modifier is invalid and causes a compiler error."
          },
          {
            "question": "What happens when you invoke test(10) with these two overloaded methods?\n\nvoid test(long x) { System.out.print(\"L\"); }\nvoid test(Integer x) { System.out.print(\"I\"); }",
            "description": "Understand widening vs boxing preference in method resolution.",
            "options": [
              "Prints 'L' because primitive widening takes precedence over auto-boxing",
              "Prints 'I' because Integer matches the exact 32-bit type",
              "Compilation error: ambiguous method call",
              "Runtime exception"
            ],
            "answer": 0,
            "explanation": "Java's method resolution rules prioritize primitive widening (int -> long) over auto-boxing (int -> Integer). Thus test(long) is selected."
          },
          {
            "question": "What is the varargs syntax in Java and where must it be placed in a method signature?",
            "description": "Verify variable-length arguments specification.",
            "options": [
              "Type... varName and it must be the last parameter in the method signature",
              "...Type varName and it must be the first parameter",
              "Type[]... varName anywhere in the parameter list",
              "*Type varName"
            ],
            "answer": 0,
            "explanation": "Varargs uses the ellipsis 'Type... name' and must always be the final parameter in the method parameter list."
          },
          {
            "question": "What does a method declared with return type 'void' return?",
            "description": "Inspect void return semantics.",
            "options": [
              "It returns no value to the caller",
              "It returns null",
              "It returns 0",
              "It returns an empty Object"
            ],
            "answer": 0,
            "explanation": "The 'void' keyword denotes that the method completes execution without returning any value."
          }
        ]
      },
      {
        "lesson_number": 7,
        "title": "Classes, Objects, Constructors & 'this'",
        "description": "Design object blueprints, constructor chaining with this(), and static vs instance members.",
        "theory": "\n<h3>Chapter Overview: Classes, Objects, Constructors & 'this'</h3>\n<p>A class is a blueprint for objects. Constructors are special methods called automatically when an object is instantiated using the <code>new</code> operator.</p>\n\n<h4>1. Constructor Chaining with <code>this()</code></h4>\n<pre><code class=\"language-java\">public class Scholar {\n    private String name;\n    private int xp;\n\n    public Scholar() {\n        this(\"Guest\", 100); // Must be the FIRST statement in constructor!\n    }\n\n    public Scholar(String name, int xp) {\n        this.name = name;\n        this.xp = xp;\n    }\n}</code></pre>\n\n<h4>2. Static vs Instance Members</h4>\n<p><code>static</code> variables and methods belong to the class itself and are shared across all instances. Static methods cannot reference <code>this</code> or call instance methods directly without an object reference.</p>\n",
        "questions": [
          {
            "question": "What is constructor chaining using 'this(...)' and what rule governs its location?",
            "description": "Examine constructor invocation rules.",
            "options": [
              "It calls an overloaded constructor in the same class, and must be the first statement",
              "It calls the parent class constructor and can appear anywhere",
              "It creates a recursive loop of objects",
              "It is only allowed in static methods"
            ],
            "answer": 0,
            "explanation": "Calling another constructor in the same class uses this(args) and must strictly be the first statement in the constructor body."
          },
          {
            "question": "What happens if a developer defines a parameterized constructor in a Java class but no default constructor?",
            "description": "Understand default constructor suppression.",
            "options": [
              "The compiler does NOT provide an automatic default no-arg constructor",
              "The compiler automatically generates a blank no-arg constructor anyway",
              "Compilation error: default constructor is mandatory",
              "The class becomes abstract automatically"
            ],
            "answer": 0,
            "explanation": "If a class contains no constructors, Java supplies a default no-argument constructor. If any constructor is explicitly declared, the compiler suppresses the automatic default constructor."
          },
          {
            "question": "Can a static method in a class access an instance variable directly via 'this.variable'?",
            "description": "Distinguish class-level state from object-level state.",
            "options": [
              "No, because static methods exist without an instance context ('this' cannot be referenced)",
              "Yes, as long as the variable is public",
              "Yes, but only if marked final",
              "Only if invoked from inside the constructor"
            ],
            "answer": 0,
            "explanation": "Static methods belong to the class itself, not to any particular instance. Hence 'this' is undefined in static context and causes a compile error: non-static variable cannot be referenced from a static context."
          },
          {
            "question": "What is the primary role of a constructor in Java?",
            "description": "Clarify object initialization lifecycle.",
            "options": [
              "To initialize the newly created object's state and allocate instance members",
              "To free memory when an object is destroyed",
              "To compile bytecode at runtime",
              "To create static copies of methods"
            ],
            "answer": 0,
            "explanation": "Constructors are invoked when an object is instantiated with 'new' to initialize instance fields and prepare the object for use."
          },
          {
            "question": "What happens if you mark an instance variable with the 'final' keyword?",
            "description": "Inspect final field immutability constraints.",
            "options": [
              "It can only be assigned once, either at declaration or inside the constructor",
              "It becomes static and shared across all classes",
              "It can be modified only by subclass methods",
              "It must be initialized to 0"
            ],
            "answer": 0,
            "explanation": "A 'final' instance variable is a constant for that object; it must be explicitly initialized exactly once (at declaration or in all constructors), and cannot be reassigned thereafter."
          }
        ]
      },
      {
        "lesson_number": 8,
        "title": "OOP: Encapsulation, Inheritance & Polymorphism",
        "description": "Master access modifiers, method overriding, dynamic dispatch, and abstract classes vs interfaces.",
        "theory": "\n<h3>Chapter Overview: OOP: Encapsulation, Inheritance & Polymorphism</h3>\n<p>The four core pillars of Object-Oriented Programming form the foundation of Java system architecture.</p>\n\n<h4>1. Dynamic Method Dispatch (Runtime Polymorphism)</h4>\n<pre><code class=\"language-java\">class Animal {\n    void sound() { System.out.println(\"Generic Sound\"); }\n}\nclass Dog extends Animal {\n    @Override\n    void sound() { System.out.println(\"Bark!\"); }\n}\n\nAnimal pet = new Dog();\npet.sound(); // Output: \"Bark!\" (Resolved at runtime based on actual object)</code></pre>\n\n<h4>2. Abstract Classes vs Interfaces</h4>\n<ul>\n  <li>An <code>abstract class</code> can declare instance variables and concrete methods with state. A class can extend only one class.</li>\n  <li>An <code>interface</code> defines a behavioral contract. A class can implement multiple interfaces.</li>\n</ul>\n",
        "questions": [
          {
            "question": "What will be printed by this polymorphic code?\n\nclass Animal { void sound() { System.out.print(\"Generic \"); } }\nclass Dog extends Animal { void sound() { System.out.print(\"Bark \"); } }\n\nAnimal a = new Dog();\na.sound();",
            "description": "Analyze dynamic method dispatch (runtime polymorphism).",
            "options": [
              "Bark ",
              "Generic ",
              "Generic Bark ",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "In Java, instance method calls are resolved at runtime based on the actual object instance (Dog), not the reference type (Animal). This is dynamic method dispatch."
          },
          {
            "question": "Which access modifier restricts field visibility strictly to the declaring class itself?",
            "description": "Identify encapsulation access modifiers.",
            "options": [
              "private",
              "protected",
              "public",
              "default (package-private)"
            ],
            "answer": 0,
            "explanation": "'private' restricts visibility strictly to the declaring class. 'default' allows package access. 'protected' allows package and subclass access. 'public' allows universal access."
          },
          {
            "question": "Which keyword prevents a Java class from being subclassed / extended?\n\npublic ______ class SecureSystem { }",
            "description": "Apply the final modifier to class definitions.",
            "options": [
              "final",
              "sealed",
              "abstract",
              "static"
            ],
            "answer": 0,
            "explanation": "Applying 'final' to a class declaration prevents any other class from extending it (e.g., java.lang.String is a final class)."
          },
          {
            "question": "What is the crucial difference between an abstract class and an interface in Java 8+?",
            "description": "Compare abstract classes and interfaces.",
            "options": [
              "A class can implement multiple interfaces but extend only one abstract class; abstract classes can hold mutable state",
              "Interfaces can hold non-static instance variables while abstract classes cannot",
              "Abstract classes cannot declare concrete methods with bodies",
              "There is no difference in Java 8+"
            ],
            "answer": 0,
            "explanation": "Java supports single class inheritance (one abstract class) but multiple interface implementation. Abstract classes can maintain instance state (fields), while interface fields are always public static final."
          },
          {
            "question": "What does the @Override annotation guarantee at compile time?",
            "description": "Verify annotation compile-time enforcement.",
            "options": [
              "The compiler verifies that the annotated method actually overrides a method from a superclass or interface",
              "It forces the JVM to execute the method synchronously",
              "It marks the method as deprecated",
              "It hides the method from package reflection"
            ],
            "answer": 0,
            "explanation": "The @Override annotation causes the compiler to generate an error if the method does not correctly override a method in a superclass or interface (e.g., catching typo errors in method signatures)."
          }
        ]
      }
    ]
  },
  "C++": {
    "icon": "\u2699\ufe0f",
    "lessons": [
      {
        "lesson_number": 1,
        "title": "C++ Syntax, Output (cout) & Input (cin)",
        "description": "Master streams, std::cout, std::endl vs newline, and namespace scope resolution.",
        "theory": "\n<h3>Chapter Overview: C++ Syntax, Output (cout) & Input (cin)</h3>\n<p>C++ is a compiled, general-purpose programming language developed by Bjarne Stroustrup as an extension of the C language. It provides direct memory manipulation, performance efficiency, and high-level object-oriented abstractions.</p>\n\n<h4>1. Standard Streams: <code>std::cout</code> and <code>std::cin</code></h4>\n<pre><code class=\"language-cpp\">#include &lt;iostream&gt;\n\nint main() {\n    // '<<' is the stream insertion operator\n    std::cout &lt;&lt; \"Bhasha Academy\" &lt;&lt; \"\n\";\n\n    int score;\n    // '>>' is the stream extraction operator\n    std::cin &gt;&gt; score; \n    return 0; // 0 indicates successful execution\n}</code></pre>\n\n<h4>2. <code>std::endl</code> vs <code>'\\n'</code></h4>\n<p><code>std::endl</code> outputs a newline AND flushes the internal output stream buffer. Using <code>std::endl</code> repeatedly in high-performance loops causes severe performance penalties due to frequent OS flush calls. Use <code>'\\n'</code> instead for fast output.</p>\n\n<h4>3. Namespace Management</h4>\n<p>Avoid putting <code>using namespace std;</code> in header files (<code>.h</code> / <code>.hpp</code>), because it pollutes the global namespace of every file that includes that header, causing naming collisions.</p>\n",
        "questions": [
          {
            "question": "What is the technical difference between using std::endl and '\\n' in C++ output streams?",
            "description": "Examine I/O buffering and performance.",
            "options": [
              "std::endl inserts a newline character AND explicitly flushes the stream buffer; '\\n' only inserts a newline",
              "std::endl is for strings, '\\n' is only for characters",
              "There is no difference; the compiler optimizes them identically",
              "'\\n' flushes the buffer while std::endl does not"
            ],
            "answer": 0,
            "explanation": "std::endl outputs '\\n' and calls std::flush on the stream buffer. In high-frequency logging or loops, frequent buffer flushing with std::endl creates severe I/O overhead."
          },
          {
            "question": "What will std::cin >> str extract when the user types \"Forest Academy\"?",
            "description": "Understand whitespace tokenization in standard input streams.",
            "options": [
              "\"Forest\" only, because operator>> stops at the first whitespace",
              "\"Forest Academy\" entirely",
              "\"Forest\\nAcademy\"",
              "Input error"
            ],
            "answer": 0,
            "explanation": "The stream extraction operator >> skips leading whitespace and stops at the next whitespace character. To read an entire line with spaces, std::getline(std::cin, str) is required."
          },
          {
            "question": "Why is 'using namespace std;' considered bad practice in header files (.h/.hpp)?",
            "description": "Analyze namespace pollution and symbol collisions.",
            "options": [
              "It pollutes the global namespace of any source file that includes the header, leading to naming collisions",
              "It increases compiled binary size by 50%",
              "It prevents the compiler from optimizing loops",
              "It is prohibited by the C++20 standard"
            ],
            "answer": 0,
            "explanation": "In header files, 'using namespace std;' leaks all standard identifiers into the global namespace of every translation unit including that header, causing ambiguity and collisions."
          },
          {
            "question": "What does the scope resolution operator '::' do when written with no left-hand operand, e.g. ::count?",
            "description": "Identify global namespace qualification.",
            "options": [
              "It explicitly references the symbol in the global namespace",
              "It is a syntax error",
              "It creates an anonymous namespace variable",
              "It accesses the nearest local variable"
            ],
            "answer": 0,
            "explanation": "The unary scope resolution operator (::identifier) explicitly targets an identifier in the global namespace, bypassing any shadowing local variable of the same name."
          },
          {
            "question": "What does main() return by default in C++ if no return statement is specified?",
            "description": "Understand main function standards in ISO C++.",
            "options": [
              "0 (representing successful termination)",
              "Undefined behavior",
              "1 (representing error)",
              "-1"
            ],
            "answer": 0,
            "explanation": "According to the ISO C++ standard, reaching the end of the main() function without a return statement implicitly performs 'return 0;'."
          }
        ]
      },
      {
        "lesson_number": 2,
        "title": "Variables, Data Types, Constants & auto",
        "description": "Explore static typing, sizeof evaluations, const vs constexpr, and auto type deduction.",
        "theory": "\n<h3>Chapter Overview: Variables, Data Types, Constants & auto</h3>\n<p>C++ is statically typed. In modern C++ (C++11 and beyond), the <code>auto</code> keyword enables compile-time type deduction based on the initializer expression.</p>\n\n<h4>1. <code>const</code> vs <code>constexpr</code></h4>\n<ul>\n  <li><code>const</code> promises that an object's value will not be modified after initialization, but the value can be computed at runtime.</li>\n  <li><code>constexpr</code> strictly guarantees that the value is evaluated at <strong>compile time</strong>, allowing it to be used in template parameters or fixed-size array dimensions.</li>\n</ul>\n\n<h4>2. Type Deduction with <code>auto</code></h4>\n<pre><code class=\"language-cpp\">int n = 42;\nconst int& ref = n;\n\nauto a = ref;       // 'a' is deduced as 'int' (const and reference dropped!)\nconst auto& b = ref;// 'b' is deduced as 'const int&' (preserves reference)</code></pre>\n\n<h4>3. Uniform Brace Initialization</h4>\n<pre><code class=\"language-cpp\">// Brace initialization prevents accidental narrowing conversions:\nint x = 3.14;   // Compiles with warning, silently truncates to 3\n// int y{3.14}; // COMPILATION ERROR! Narrowing from double to int prohibited</code></pre>\n",
        "questions": [
          {
            "question": "What is the difference between 'const' and 'constexpr' in modern C++?",
            "description": "Distinguish compile-time evaluation from runtime immutability.",
            "options": [
              "constexpr guarantees evaluation at compile-time; const merely guarantees that an object cannot be mutated after initialization",
              "const variables are compile-time only; constexpr variables are runtime only",
              "constexpr is only for floating-point numbers",
              "There is no difference in C++11 and beyond"
            ],
            "answer": 0,
            "explanation": "constexpr enforces that the value is known and computed at compile-time, allowing it to be used in template parameters or array bounds. const can be initialized with runtime values."
          },
          {
            "question": "What does the 'auto' keyword deduce for variable 'x' in:\n\nint n = 10;\nconst int& ref = n;\nauto x = ref;",
            "description": "Examine auto type deduction rules with references and const qualifiers.",
            "options": [
              "int (top-level const and reference are dropped)",
              "const int&",
              "const int",
              "int&"
            ],
            "answer": 0,
            "explanation": "By default, 'auto' strips top-level const and references during type deduction, resulting in plain 'int'. To preserve them, you must write 'const auto& x = ref;'."
          },
          {
            "question": "What happens when you use uniform initialization to narrow types?\n\nint x{3.14};",
            "description": "Identify compiler behavior with uniform brace initialization.",
            "options": [
              "Compilation error: narrowing conversion from double to int inside braces is prohibited",
              "Compiles and silently truncates x to 3",
              "x becomes 4 due to rounding",
              "Runtime warning"
            ],
            "answer": 0,
            "explanation": "In modern C++, brace initialization ({}) explicitly prohibits narrowing conversions (e.g. converting floating-point to integer or larger integer to smaller integer), raising a compiler error."
          },
          {
            "question": "What does sizeof(char) evaluate to in C++ on any compliant platform?",
            "description": "Verify the fundamental unit of storage in C++.",
            "options": [
              "Always exactly 1",
              "2 bytes",
              "4 bytes",
              "Varies depending on whether system is 32-bit or 64-bit"
            ],
            "answer": 0,
            "explanation": "By C++ standard definition, sizeof(char) is always guaranteed to be exactly 1 byte."
          },
          {
            "question": "What is the value of 'a' after: unsigned int a = -1;?",
            "description": "Understand unsigned integer underflow semantics.",
            "options": [
              "UINT_MAX (the maximum representable unsigned integer value)",
              "-1",
              "0",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "Assigning a negative value to an unsigned integer converts it modulo 2^N, resulting in UINT_MAX (all bits set to 1 in two's complement)."
          }
        ]
      },
      {
        "lesson_number": 3,
        "title": "Operators & Expressions",
        "description": "Analyze integer division truncation, pre vs post increment, precedence, and bitwise logic.",
        "theory": "\n<h3>Chapter Overview: Operators & Expressions</h3>\n<p>Operators in C++ operate directly on memory representations. Understanding evaluation rules and operator precedence prevents subtle logical bugs.</p>\n\n<h4>1. Integer Division Truncation</h4>\n<pre><code class=\"language-cpp\">int a = 5, b = 2;\ndouble res = a / b; // Both operands are int: integer division yields 2!\n// res becomes 2.0, NOT 2.5!\n\n// Fix: cast at least one operand to double\ndouble fixed = static_cast&lt;double&gt;(a) / b; // Yields 2.5</code></pre>\n\n<h4>2. Prefix (<code>++x</code>) vs Postfix (<code>x++</code>)</h4>\n<ul>\n  <li><code>++x</code> (Prefix): Increments the value and returns a reference to the updated object directly. (Faster for complex iterators).</li>\n  <li><code>x++</code> (Postfix): Makes a copy of the old value, increments the original, and returns the copy.</li>\n</ul>\n",
        "questions": [
          {
            "question": "What is the output of the following C++ code?\n\nint a = 5, b = 2;\ndouble result = a / b;\nstd::cout << result;",
            "description": "Trace integer division truncation before floating-point assignment.",
            "options": [
              "2",
              "2.5",
              "2.0",
              "3"
            ],
            "answer": 0,
            "explanation": "Because both 'a' and 'b' are integers, integer division is performed first, yielding 2. That integer is then implicitly converted to double 2.0. Standard cout prints '2'."
          },
          {
            "question": "What is the difference between ++i and i++ in terms of performance and temporary objects?",
            "description": "Compare prefix vs postfix increment.",
            "options": [
              "++i increments in place and returns by reference; i++ creates a temporary copy of the old value before incrementing",
              "i++ is faster because modern CPUs optimize it",
              "There is no difference for non-primitive iterators",
              "++i allocates heap memory"
            ],
            "answer": 0,
            "explanation": "Prefix (++i) increments and returns the reference to the updated object directly. Postfix (i++) must make a copy of the previous state, increment, and return the copy."
          },
          {
            "question": "What does the expression (true || ++x) do if x = 10?",
            "description": "Understand short-circuit evaluation in logical operators.",
            "options": [
              "Returns true and leaves x as 10 (short-circuits)",
              "Returns true and increments x to 11",
              "Compilation error",
              "Returns 11"
            ],
            "answer": 0,
            "explanation": "The logical OR (||) operator short-circuits: since the left operand is true, the right operand (++x) is never evaluated, so x remains 10."
          },
          {
            "question": "What is the result of the bitwise operation 6 & 3 in C++?",
            "description": "Compute binary bitwise AND.",
            "options": [
              "2",
              "7",
              "3",
              "4"
            ],
            "answer": 0,
            "explanation": "In binary: 6 is 110, 3 is 011. Bitwise AND: 110 & 011 = 010, which is decimal 2."
          },
          {
            "question": "What is the associativity of the assignment operator (=) in C++?",
            "description": "Inspect operator associativity.",
            "options": [
              "Right-to-left (e.g. a = b = c assigns c to b first, then to a)",
              "Left-to-right",
              "Non-associative",
              "Varies by compiler"
            ],
            "answer": 0,
            "explanation": "Assignment operators in C++ associate from right to left, allowing chained assignments such as a = (b = (c = 10))."
          }
        ]
      },
      {
        "lesson_number": 4,
        "title": "Conditions & Switch Statements",
        "description": "Evaluate branching constraints, switch type requirements, and init-statement conditionals.",
        "theory": "\n<h3>Chapter Overview: Conditions & Switch Statements</h3>\n<p>Conditionals direct the execution flow based on logical expressions.</p>\n\n<h4>1. C++ Switch Statement Constraints</h4>\n<p>In C++, a <code>switch</code> statement can ONLY evaluate integral or enumeration types (<code>int</code>, <code>char</code>, <code>enum</code>). You <strong>cannot</strong> switch directly on <code>std::string</code> or floating-point numbers.</p>\n\n<h4>2. C++17 'if' with Initializer</h4>\n<p>Modern C++ allows declaring a scoped variable directly within the if condition:</p>\n<pre><code class=\"language-cpp\">if (auto val = calculate(); val &gt; 100) {\n    std::cout &lt;&lt; \"High: \" &lt;&lt; val;\n} // 'val' goes out of scope and memory is cleaned up immediately!</code></pre>\n",
        "questions": [
          {
            "question": "Which of the following types CANNOT be used as the condition in a C++ switch statement?",
            "description": "Identify switch statement type restrictions.",
            "options": [
              "std::string",
              "int",
              "char",
              "enum class"
            ],
            "answer": 0,
            "explanation": "In C++, switch statements only accept integral or enumeration types. std::string is a class and cannot be switched on directly without hashing or if-else ladders."
          },
          {
            "question": "In C++17, what does this new conditional syntax accomplish?\n\nif (auto it = map.find(key); it != map.end()) {\n    use(it->second);\n}",
            "description": "Examine C++17 if-statements with initializers.",
            "options": [
              "Initializes 'it' with scope restricted strictly to the if-else blocks",
              "Creates a global iterator",
              "Runs the condition asynchronously",
              "Syntax error in C++"
            ],
            "answer": 0,
            "explanation": "C++17 introduced 'if with initializer', allowing a variable to be initialized and its scope strictly confined to the if and associated else blocks."
          },
          {
            "question": "What does the [[fallthrough]] attribute signal to the C++ compiler in a switch case?",
            "description": "Utilize standard C++ compiler attributes.",
            "options": [
              "It explicitly indicates intentional fallthrough to suppress compiler warnings about missing break",
              "It forces the switch to break immediately",
              "It restarts the switch statement from case 1",
              "It throws an exception if the case matches"
            ],
            "answer": 0,
            "explanation": "The [[fallthrough]] attribute documents that a fallthrough to the next case label is intentional, silencing compiler warnings about missing break statements."
          },
          {
            "question": "What is the output of evaluating: int x = 0; if (x = 5) { std::cout << \"T\"; } else { std::cout << \"F\"; }?",
            "description": "Spot assignment inside conditional expressions in C++.",
            "options": [
              "T",
              "F",
              "Compilation error",
              "Undefined behavior"
            ],
            "answer": 0,
            "explanation": "The assignment expression (x = 5) assigns 5 to x and evaluates to 5. Any non-zero integer converts to true in a boolean context, printing 'T'."
          },
          {
            "question": "What is the return type of the ternary operator in: (true ? 10 : 3.5)?",
            "description": "Understand common type promotion in ternary expressions.",
            "options": [
              "double (promoted to common type)",
              "int",
              "variant",
              "Compilation error"
            ],
            "answer": 0,
            "explanation": "The ternary operator's second and third expressions must resolve to a common type. 10 (int) is promoted to double to match 3.5, returning double 10.0."
          }
        ]
      },
      {
        "lesson_number": 5,
        "title": "Loops & Iteration (Range-based for)",
        "description": "Trace while, do-while, standard for, and modern range-based for loops with references.",
        "theory": "\n<h3>Chapter Overview: Loops & Iteration (Range-based for)</h3>\n<p>Loops repeat code blocks efficiently. Modern C++ heavily favors <strong>range-based for loops</strong> for safety and readability.</p>\n\n<h4>1. Efficient Range-based For Loops</h4>\n<pre><code class=\"language-cpp\">std::vector&lt;std::string&gt; names = {\"Aarav\", \"Priya\", \"Rohan\"};\n\n// POOR: creates a full copy of each string on every iteration\nfor (auto name : names) { ... }\n\n// BEST PRACTICE: const reference prevents copying, guarantees read-only access\nfor (const auto& name : names) {\n    std::cout &lt;&lt; name &lt;&lt; \"\n\";\n}</code></pre>\n\n<div class=\"theory-callout\">\n  <strong>Iterator Invalidation:</strong> Never add elements (e.g. <code>vec.push_back()</code>) to a <code>std::vector</code> while iterating over it with a range-for loop. Memory reallocation invalidates iterators, leading to undefined behavior or segmentation faults.\n</div>\n",
        "questions": [
          {
            "question": "What is the performance advantage of using 'for (const auto& item : collection)' over 'for (auto item : collection)'?",
            "description": "Analyze reference vs copy semantics in range-based for loops.",
            "options": [
              "It accesses elements by const reference, avoiding costly object copies during each iteration",
              "It parallelizes the loop across CPU cores",
              "It enables the loop to modify collection elements",
              "It prevents index bounds checking"
            ],
            "answer": 0,
            "explanation": "'auto item' creates a copy of each element in the collection on every iteration. 'const auto& item' binds by const reference, avoiding any copying while preventing accidental mutation."
          },
          {
            "question": "What happens if you modify a std::vector's size (e.g. push_back) while iterating over it with a range-based for loop?",
            "description": "Recognize iterator invalidation traps in C++.",
            "options": [
              "Undefined behavior due to iterator invalidation caused by vector reallocation",
              "The vector throws a ConcurrentModificationException",
              "The loop automatically resizes its boundary",
              "The loop terminates safely"
            ],
            "answer": 0,
            "explanation": "Adding elements to a std::vector can trigger memory reallocation, invalidating existing iterators and references. Continuing iteration yields undefined behavior."
          },
          {
            "question": "What is the output of this loop?\n\nint count = 0;\nfor (int i = 0; i < 5; ++i) {\n    if (i % 2 != 0) continue;\n    count += i;\n}\nstd::cout << count;",
            "description": "Trace continue statements and loop accumulators.",
            "options": [
              "6",
              "10",
              "4",
              "0"
            ],
            "answer": 0,
            "explanation": "When i is odd (1, 3), 'continue' skips to the next iteration. For even i (0, 2, 4): count += 0, count += 2, count += 4 -> total is 6."
          },
          {
            "question": "How many times does the loop body execute in:\n\nint x = 10;\ndo {\n    x++;\n} while (x < 5);",
            "description": "Test do-while post-test evaluation.",
            "options": [
              "Exactly 1 time",
              "0 times",
              "5 times",
              "Infinite loop"
            ],
            "answer": 0,
            "explanation": "In a do-while loop, the body executes before the condition is checked. x becomes 11, then the condition (11 < 5) evaluates to false, terminating the loop after 1 execution."
          },
          {
            "question": "What does a range-based for loop expand to internally in C++?",
            "description": "Understand the compiler mechanics behind range-for.",
            "options": [
              "A standard for loop utilizing std::begin() and std::end() iterators",
              "An operating system thread pool",
              "A while loop using index access [i]",
              "A recursive function call"
            ],
            "answer": 0,
            "explanation": "A range-based for loop expands into an iterator loop: for (auto __begin = std::begin(range), __end = std::end(range); __begin != __end; ++__begin)."
          }
        ]
      },
      {
        "lesson_number": 6,
        "title": "Functions, Parameters & Pass-by-Reference",
        "description": "Master pass-by-value vs reference, inline functions, default arguments, and recursion.",
        "theory": "\n<h3>Chapter Overview: Functions, Parameters & Pass-by-Reference</h3>\n<p>C++ allows fine-grained control over how function arguments are passed in memory.</p>\n\n<h4>1. Pass-by-Value vs Pass-by-Reference</h4>\n<pre><code class=\"language-cpp\">// Pass-by-value: copies the argument; caller variable remains untouched\nvoid increment(int x) { x++; }\n\n// Pass-by-reference: binds directly to caller's memory address\nvoid incrementReal(int& x) { x++; }\n\nint val = 10;\nincrement(val);     // val is still 10\nincrementReal(val); // val is now 11!</code></pre>\n\n<h4>2. Pass-by-Const-Reference (<code>const Type&</code>)</h4>\n<p>For large objects, structures, or strings, passing by <code>const Type&</code> avoids deep memory copying while ensuring the function cannot inadvertently mutate the caller's data.</p>\n",
        "questions": [
          {
            "question": "What will be printed by the following code?\n\nvoid swapValues(int& a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\nint x = 10, y = 20;\nswapValues(x, y);\nstd::cout << x << \" \" << y;",
            "description": "Analyze mixed reference and value parameters.",
            "options": [
              "20 20",
              "20 10",
              "10 20",
              "10 10"
            ],
            "answer": 0,
            "explanation": "'a' is passed by reference (modifying 'x' to 20). 'b' is passed by value (a copy of 'y', so 'y' remains unchanged at 20). Output is '20 20'."
          },
          {
            "question": "What is the purpose of declaring a function 'inline' in C++?",
            "description": "Examine the inline keyword and linker behavior.",
            "options": [
              "It suggests to the compiler to substitute the function body at the call site to eliminate call overhead, and allows definition in headers without ODR violations",
              "It forces the function to execute on a separate GPU thread",
              "It prevents the function from being overloaded",
              "It restricts function visibility to the local file"
            ],
            "answer": 0,
            "explanation": "'inline' hints to the compiler to expand the function code directly where called to reduce function call overhead, and permits defining the function in header files without violating the One Definition Rule (ODR)."
          },
          {
            "question": "Where must default arguments be placed in a C++ function parameter list?",
            "description": "Identify syntactic constraints on default arguments.",
            "options": [
              "Trailing at the end of the parameter list (right-most parameters)",
              "At the beginning (left-most parameters)",
              "Anywhere, as long as named",
              "In a separate header only"
            ],
            "answer": 0,
            "explanation": "Default arguments must be specified from right to left; once a parameter has a default value, all subsequent parameters to its right must also have default values."
          },
          {
            "question": "Why should large structures or objects be passed as 'const Type&' instead of 'Type'?",
            "description": "Optimize parameter passing efficiency.",
            "options": [
              "It prevents expensive deep copies while ensuring the function cannot inadvertently mutate the caller's data",
              "It allows the function to reallocate the caller's memory",
              "It converts the struct into a pointer automatically",
              "It makes the object thread-safe"
            ],
            "answer": 0,
            "explanation": "Passing by value copies the entire object (invoking copy constructors). Passing by 'const Type&' passes only a memory address (fast) while compiler-enforcing read-only access."
          },
          {
            "question": "What happens if a recursive function does not define a valid base case?",
            "description": "Identify call stack memory limits.",
            "options": [
              "Stack overflow error due to exhausting the program's call stack memory",
              "Heap corruption",
              "The compiler catches it at compile time and errors",
              "It returns 0 automatically"
            ],
            "answer": 0,
            "explanation": "Infinite recursion continuously pushes stack frames until the thread's call stack memory is exhausted, resulting in a segmentation fault or stack overflow crash."
          }
        ]
      },
      {
        "lesson_number": 7,
        "title": "Pointers, References & Memory Addresses",
        "description": "Deep dive into address-of (&), dereferencing (*), nullptr, pointer arithmetic, and references.",
        "theory": "\n<h3>Chapter Overview: Pointers, References & Memory Addresses</h3>\n<p>Pointers are variables that store the memory address of another variable. References serve as aliases for existing objects.</p>\n\n<h4>1. Pointers vs References</h4>\n<pre><code class=\"language-cpp\">int val = 42;\nint* ptr = &val;  // 'ptr' stores the memory address of 'val'\nint& ref = val;   // 'ref' is an alias for 'val'\n\nstd::cout &lt;&lt; *ptr; // Dereference operator '*' yields 42\nstd::cout &lt;&lt; ref;  // Yields 42\n\n// Difference:\n// 1. References cannot be null; pointers can be nullptr\n// 2. References cannot be reseated to point to another object</code></pre>\n\n<h4>2. Pointer Arithmetic</h4>\n<p>Adding an integer <code>n</code> to a pointer advances it by <code>n * sizeof(Type)</code> bytes:</p>\n<pre><code class=\"language-cpp\">int arr[] = {10, 20, 30, 40};\nint* p = arr;   // Points to arr[0] (10)\np += 2;         // Advances 2 integers: points to arr[2]\nstd::cout &lt;&lt; *p; // Output: 30</code></pre>\n\n<div class=\"theory-callout\">\n  <strong>Dangling Pointer Danger:</strong> Never return a pointer or reference to a local stack variable from a function. When the function returns, its stack frame is destroyed, leaving a dangling pointer pointing to invalid memory!\n</div>\n",
        "questions": [
          {
            "question": "What is the output of the following pointer code?\n\nint arr[] = {10, 20, 30, 40};\nint* ptr = arr;\nptr += 2;\nstd::cout << *ptr;",
            "description": "Trace pointer arithmetic across array elements.",
            "options": [
              "30",
              "20",
              "40",
              "Memory address of arr"
            ],
            "answer": 0,
            "explanation": "'ptr' points to arr[0] (10). 'ptr += 2' advances the pointer by 2 * sizeof(int) bytes to arr[2] (30). Dereferencing (*ptr) yields 30."
          },
          {
            "question": "What is the crucial difference between a pointer and a reference in C++?",
            "description": "Compare pointers and references.",
            "options": [
              "A reference cannot be null, must be initialized at declaration, and cannot be reseated to point to another object",
              "A pointer is always safer than a reference",
              "A reference uses more memory than a pointer",
              "A pointer cannot point to primitive types"
            ],
            "answer": 0,
            "explanation": "References act as an alias for an existing object; they must be bound upon creation, cannot be reassigned to bind to another object, and cannot legally be null."
          },
          {
            "question": "What is the danger of returning a pointer or reference to a local stack variable from a function?\n\nint* getVal() { int x = 42; return &x; }",
            "description": "Recognize dangling pointers and undefined behavior.",
            "options": [
              "Dangling pointer: 'x' is destroyed when the function exits, leaving a pointer to invalid stack memory",
              "Memory leak: x remains permanently allocated on the heap",
              "Double free error",
              "Compile error: cannot return addresses"
            ],
            "answer": 0,
            "explanation": "Local variables have automatic storage duration and are deallocated when their enclosing scope ends. Returning a pointer to 'x' creates a dangling pointer, resulting in undefined behavior when dereferenced."
          },
          {
            "question": "Why is 'nullptr' preferred over 'NULL' or '0' in modern C++?",
            "description": "Clarify type safety of nullptr.",
            "options": [
              "nullptr has type std::nullptr_t, eliminating ambiguities in overloaded functions accepting int vs pointer",
              "NULL is deprecated and removed in C++11",
              "nullptr automatically frees memory",
              "nullptr is 128-bit on 64-bit platforms"
            ],
            "answer": 0,
            "explanation": "NULL is typically defined as 0 or (void*)0. In function overloading (e.g. f(int) vs f(char*)), passing NULL ambiguously binds to int. 'nullptr' is strongly typed as std::nullptr_t."
          },
          {
            "question": "What does (*ptr)++ do versus *ptr++?",
            "description": "Analyze operator precedence between dereference and postfix increment.",
            "options": [
              "(*ptr)++ increments the value pointed to; *ptr++ dereferences the current pointer and then advances the pointer to the next address",
              "Both do the exact same thing",
              "(*ptr)++ advances the pointer; *ptr++ increments the value",
              "Syntax error in (*ptr)++"
            ],
            "answer": 0,
            "explanation": "Postfix ++ has higher precedence than *. (*ptr)++ forces dereferencing first and increments the value pointed to. *ptr++ dereferences the current address, but increments the pointer itself."
          }
        ]
      },
      {
        "lesson_number": 8,
        "title": "Classes, Objects, Constructors & Destructors",
        "description": "Master access specifiers, constructor initializer lists, destructors, and RAII principles.",
        "theory": "\n<h3>Chapter Overview: Classes, Objects, Constructors & Destructors</h3>\n<p>C++ classes embody <strong>RAII (Resource Acquisition Is Initialization)</strong>\u2014managing resources safely through constructor acquisition and automatic destructor cleanup.</p>\n\n<h4>1. Access Specifiers: <code>class</code> vs <code>struct</code></h4>\n<ul>\n  <li>In a <code>class</code>, members and base classes default to <code>private</code>.</li>\n  <li>In a <code>struct</code>, members and base classes default to <code>public</code>.</li>\n</ul>\n\n<h4>2. Member Initializer Lists & Destructors</h4>\n<pre><code class=\"language-cpp\">class FileBuffer {\nprivate:\n    char* buffer;\n    size_t size;\n\npublic:\n    // Member initializer list initializes fields upon creation\n    FileBuffer(size_t s) : size(s), buffer(new char[s]) {\n        std::cout &lt;&lt; \"Memory allocated\n\";\n    }\n\n    // Destructor '~' runs automatically when object is destroyed\n    ~FileBuffer() {\n        delete[] buffer; // Frees heap memory safely!\n        std::cout &lt;&lt; \"Memory freed\n\";\n    }\n};</code></pre>\n\n<h4>3. Virtual Destructors in Polymorphic Base Classes</h4>\n<p>If a class has virtual functions and will be deleted through a base class pointer (<code>Base* b = new Derived(); delete b;</code>), the base class <strong>must</strong> have a virtual destructor (<code>virtual ~Base() = default;</code>) to prevent memory leaks from derived class members.</p>\n",
        "questions": [
          {
            "question": "What is the primary purpose of a destructor (~ClassName()) in C++?",
            "description": "Understand RAII and resource cleanup.",
            "options": [
              "To release resources (heap memory, file handles, sockets) acquired during the object's lifetime",
              "To reset all member variables to zero",
              "To recompile the class at runtime",
              "To delete the class definition from the executable"
            ],
            "answer": 0,
            "explanation": "Destructors are automatically invoked when an object goes out of scope or is deleted, ensuring deterministic cleanup of managed resources under RAII (Resource Acquisition Is Initialization)."
          },
          {
            "question": "Why should constructors prefer member initializer lists over assignment in the constructor body?\n\nPoint(int a, int b) : x(a), y(b) { }",
            "description": "Analyze initialization vs assignment efficiency.",
            "options": [
              "Initializer lists initialize members directly upon creation, avoiding redundant default construction followed by copy assignment",
              "It is the only way to initialize static members",
              "It runs after the constructor body completes",
              "It allocates members on the heap"
            ],
            "answer": 0,
            "explanation": "In the constructor body, members have already been default-constructed, so writing 'x = a' executes an extra assignment. For const members and references, initializer lists are mandatory."
          },
          {
            "question": "What is the default access specifier for members in a 'class' versus a 'struct' in C++?",
            "description": "Distinguish C++ struct from class.",
            "options": [
              "Class members default to 'private'; struct members default to 'public'",
              "Class members default to 'public'; struct members default to 'private'",
              "Both default to 'public'",
              "Both default to 'private'"
            ],
            "answer": 0,
            "explanation": "In C++, the only difference between a class and a struct is default visibility: class members and inheritance default to 'private', while struct members and inheritance default to 'public'."
          },
          {
            "question": "Why should a base class intended for polymorphic deletion always declare a virtual destructor?\n\nclass Base { virtual ~Base() = default; };",
            "description": "Prevent memory leaks and undefined behavior in polymorphism.",
            "options": [
              "To ensure that deleting a derived object through a Base pointer calls the derived destructor first, preventing memory leaks",
              "To make the class abstract",
              "To allow the constructor to be virtual",
              "To prevent derived classes from having destructors"
            ],
            "answer": 0,
            "explanation": "If Base has a non-virtual destructor and you execute 'Base* b = new Derived(); delete b;', only Base::~Base() is called, leaving Derived resources leaked. A virtual destructor ensures the derived destructor runs first."
          },
          {
            "question": "What does the 'this' pointer represent inside a non-static C++ member function?",
            "description": "Understand the implicit 'this' pointer.",
            "options": [
              "A pointer to the specific object instance on which the member function was invoked",
              "A reference to the class metadata",
              "A copy of the object's memory",
              "A global pointer to the main function"
            ],
            "answer": 0,
            "explanation": "'this' is an implicit rvalue pointer passed to all non-static member functions, storing the memory address of the object on which the function is operating."
          }
        ]
      }
    ]
  },
  "English": {
    "icon": "🇬🇧",
    "lessons": [
      {
        "lesson_number": 1,
        "title": "Basic Vocabulary & Syntax",
        "description": "Fundamental parts of speech, vocabulary building, and sentence structuring.",
        "theory": "\n<h3>Chapter Overview: Basic Vocabulary & Syntax</h3>\n<p>Clear communication is foundational for software engineering, documentation, code reviews, and international collaboration. Mastering parts of speech and basic sentence order enables developers to write unambiguous specifications and pull request descriptions.</p>\n\n<div class=\"theory-callout\">\n  <strong>Core Principle:</strong> Standard English declarative sentences adhere to the <strong>Subject - Verb - Object (SVO)</strong> word order. Modifiers such as adverbs and adjectives must link clearly to the words they modify.\n</div>\n\n<h4>1. Subject-Verb Agreement</h4>\n<p>Singular subjects take singular verbs; plural subjects take plural verbs. When prepositional phrases separate the subject and verb, the verb agrees with the true subject, not the object of the preposition:</p>\n<pre><code class=\"language-text\"># Correct: The list (singular) is ready\nThe list of microservice configurations is updated daily.\n\n# Incorrect:\nThe list of microservice configurations are updated daily.</code></pre>\n\n<h4>2. Countable vs Uncountable Quantifiers</h4>\n<p>Use <strong>fewer</strong> with discrete countable nouns (e.g. <em>fewer allocations, fewer bugs, fewer servers</em>) and <strong>less</strong> with uncountable mass quantities (e.g. <em>less latency, less memory, less downtime</em>).</p>\n\n<h4>3. Parts of Speech in Technical Contexts</h4>\n<ul>\n  <li><strong>Noun:</strong> Entity or state (e.g. <em>thread, cluster, database, parameter</em>).</li>\n  <li><strong>Verb:</strong> Action or state of being (e.g. <em>compile, serialize, authenticate, benchmark</em>).</li>\n  <li><strong>Adjective:</strong> Quality or attribute (e.g. <em>asynchronous, immutable, idempotent, recursive</em>).</li>\n  <li><strong>Adverb:</strong> Modifies verbs, adjectives, or other adverbs (e.g. <em>concurrently, efficiently, dynamically</em>).</li>\n</ul>\n",
        "questions": [
          {
            "question": "Which sentence demonstrates correct subject-verb agreement?",
            "description": "Identify third-person singular verb forms.",
            "options": [
              "The list of scholars is updated daily.",
              "The list of scholars are updated daily.",
              "The list of scholars have been update daily.",
              "The list of scholars were update daily."
            ],
            "answer": 0,
            "explanation": "The subject is 'The list' (singular), not 'scholars'. Therefore, the singular verb 'is' is grammatically correct."
          },
          {
            "question": "Which word functions as an adverb in: 'The engineer quickly debugged the code'?",
            "description": "Identify parts of speech modifying actions.",
            "options": [
              "quickly",
              "engineer",
              "debugged",
              "code"
            ],
            "answer": 0,
            "explanation": "'Quickly' is an adverb modifying the action verb 'debugged'."
          },
          {
            "question": "Select the sentence with the correct usage of 'fewer' versus 'less'.",
            "description": "Distinguish countable vs uncountable quantifiers.",
            "options": [
              "The optimized algorithm uses fewer memory allocations and less runtime.",
              "The optimized algorithm uses less memory allocations and fewer runtime.",
              "The algorithm uses fewer runtime and fewer memory.",
              "The algorithm uses less allocations."
            ],
            "answer": 0,
            "explanation": "'Fewer' is used for countable nouns (allocations), while 'less' is used for uncountable quantities (runtime)."
          },
          {
            "question": "Which sentence correctly places the modifier to avoid ambiguity?",
            "description": "Identify proper participial modifier placement.",
            "options": [
              "Having compiled the binary without warnings, the release team deployed the microservice.",
              "Having compiled the binary without warnings, the microservice was deployed by the release team.",
              "The release team deployed having compiled the binary without warnings the microservice.",
              "Having compiled the binary without warnings, deployment was initiated."
            ],
            "answer": 0,
            "explanation": "In participial phrases like 'Having compiled...', the introductory modifier must logically describe the immediate subject of the main clause ('the release team')."
          },
          {
            "question": "Select the sentence with the correct contextual usage of technical terminology:",
            "description": "Distinguish between homophones and technical terms.",
            "options": [
              "The asynchronous queue complements the database by buffering burst ingestion traffic.",
              "The asynchronous queue compliments the database by buffering burst ingestion traffic.",
              "The asynchronous queue implements to the database by buffering burst traffic.",
              "The asynchronous queue complements for the database with buffering traffic."
            ],
            "answer": 0,
            "explanation": "'Complement' (with an 'e') means to enhance or complete something harmoniously, whereas 'compliment' (with an 'i') denotes praise."
          }
        ]
      },
      {
        "lesson_number": 2,
        "title": "Greetings & Professional Introductions",
        "description": "Professional communication, meeting openings, stakeholder updates, and executive presence.",
        "theory": "\n<h3>Chapter Overview: Greetings & Professional Introductions</h3>\n<p>Professional communication in technology organizations requires navigating formal stakeholder relationships, cross-functional team meetings, and asynchronous remote collaboration with clarity and cultural awareness.</p>\n\n<div class=\"theory-callout\">\n  <strong>Key Etiquette:</strong> Avoid 'hello-only' messages in remote chats like Slack or Teams. Provide the greeting, complete context, links, and specific question in your initial message.\n</div>\n\n<h4>1. Formal vs Semi-Formal Salutations</h4>\n<ul>\n  <li><strong>Formal (Executive / External Clients):</strong> <em>\"Dear Dr. Watson,\" \"Dear Mr. Vance,\" \"Good morning, Board Members.\"</em></li>\n  <li><strong>Semi-Formal (Internal Cross-Functional Teams):</strong> <em>\"Hello Team,\" \"Good morning everyone,\" \"Hi Sarah.\"</em></li>\n  <li><strong>Sign-offs:</strong> Use <em>\"Best regards,\" \"Kind regards,\"</em> or <em>\"Sincerely,\"</em>. Avoid slang or abbreviations like <em>\"Thx\"</em> in formal documentation.</li>\n</ul>\n\n<h4>2. The 30-Second Technical Elevator Pitch</h4>\n<p>When introducing yourself in standups or architectural reviews, structure your summary using the <strong>Role + Core Competency + Current Impact</strong> framework:</p>\n<pre><code class=\"language-text\">\"Hello everyone, I am Priya, a backend software engineer specializing in \ndistributed data streaming and low-latency cache synchronization. \nI am currently optimizing our payment settlement pipeline.\"</code></pre>\n\n<h4>3. Setting Professional Boundaries & Polite Declines</h4>\n<p>When declining non-urgent requests during critical incidents, acknowledge the request, state the constraint clearly, and provide an actionable next step:</p>\n<pre><code class=\"language-text\">\"I am currently mitigating a production incident, but I would be glad to \nreview the architecture proposal asynchronously or sync tomorrow at 10:00 AM.\"</code></pre>\n",
        "questions": [
          {
            "question": "In a formal engineering email to cross-functional stakeholders, which opening conveys the highest level of professional clarity and respect?",
            "description": "Select appropriate formal correspondence openings.",
            "options": [
              "I hope this email finds you well. I am writing to provide an update on the Q3 payment gateway migration.",
              "Hey folks, check this out regarding the gateway stuff.",
              "To whom it might concern, I am updating on things.",
              "What's up team, here is the code news you wanted."
            ],
            "answer": 0,
            "explanation": "'I hope this email finds you well. I am writing to provide an update...' establishes professional courtesy, immediately declares the email's objective, and adheres to standard enterprise communication etiquette."
          },
          {
            "question": "During an asynchronous Agile daily standup, which structure most effectively summarizes engineering progress?",
            "description": "Evaluate concise sprint status reporting.",
            "options": [
              "Yesterday I resolved the JWT token expiration bug; today I am authoring integration tests for user registration; I have no blockers.",
              "I was working on some bugs all yesterday, and today I think I will do some testing if nothing crashes.",
              "My tasks were hard yesterday because of the server, but today is hopefully better.",
              "I worked on code yesterday and will write more code today."
            ],
            "answer": 0,
            "explanation": "High-performing Agile standup updates follow the three standard anchors: what was completed, what is scheduled next, and explicit declaration of impediments (blockers)."
          },
          {
            "question": "When introducing a critical system outage to executive leadership, which phrasing maintains executive presence and accountability?",
            "description": "Determine crisis management communication tone.",
            "options": [
              "At 14:15 UTC, Service A encountered elevated latency. We have activated our incident response protocol and routed traffic to our secondary cluster while investigating the root cause.",
              "Everything broke suddenly at 14:15 and we don't know who did it, but we are looking into it.",
              "The system crashed because the database team messed up their deployment.",
              "Don't panic, but Service A is completely broken right now."
            ],
            "answer": 0,
            "explanation": "Executive incident communication should be timestamped, objective, action-oriented, and focused on containment and mitigation rather than speculation or blame."
          },
          {
            "question": "Which sign-off is most appropriate for a formal design proposal sent to external client architects?",
            "description": "Identify professional correspondence closings.",
            "options": [
              "Sincerely, / Best regards,",
              "Cheers,",
              "Later,",
              "Thanks a bunch,"
            ],
            "answer": 0,
            "explanation": "'Sincerely' and 'Best regards' are standard, internationally recognized formal closings suitable for external clients and formal technical proposals."
          },
          {
            "question": "How should a software engineer introduce a constructive disagreement during a technical architectural review?",
            "description": "Navigate collaborative technical disagreement with diplomacy.",
            "options": [
              "I understand the benefits of the proposed caching layer; however, could we evaluate the potential cache invalidation overhead under high write contention?",
              "That design is wrong and will fail under high write load.",
              "You clearly haven't considered cache invalidation problems.",
              "I don't like this approach at all."
            ],
            "answer": 0,
            "explanation": "Phrasing constructive feedback by acknowledging the rationale ('I understand the benefits...') followed by a collaborative inquiry ('however, could we evaluate...') fosters rigorous technical review without provoking defensiveness."
          }
        ]
      },
      {
        "lesson_number": 3,
        "title": "Numbers, Quantifiers & Data Metrics",
        "description": "Quantifying metrics, percentiles, throughput, and numerical precision in engineering.",
        "theory": "\n<h3>Chapter Overview: Numbers, Quantifiers & Data Metrics</h3>\n<p>Software performance benchmarks, SLAs, error budgets, and financial reporting depend on exact mathematical and linguistic precision. Ambiguity in expressing data metrics can misrepresent system health to leadership.</p>\n\n<div class=\"theory-callout\">\n  <strong>Metric Rule:</strong> Use <em>fewer</em> and <em>number of</em> for countable items; use <em>less</em> and <em>amount of</em> for continuous quantities.\n</div>\n\n<h4>1. Quantifiers: Number vs Amount</h4>\n<ul>\n  <li><strong>Number of:</strong> Countable entities (e.g. <em>a high number of HTTP requests, a large number of nodes</em>).</li>\n  <li><strong>Amount of:</strong> Uncountable measures (e.g. <em>a significant amount of network traffic, a minimal amount of jitter</em>).</li>\n</ul>\n\n<h4>2. Percentages & Prepositions: 'By' vs 'To'</h4>\n<pre><code class=\"language-text\"># Initial latency: 200ms -> Final latency: 50ms\nLatency decreased BY 150ms (or BY 75%). # The difference / delta\nLatency decreased TO 50ms (or TO 25% of baseline). # The ending point</code></pre>\n\n<h4>3. Compound Numerical Adjectives</h4>\n<p>When a number and a unit form a compound modifier before a noun, hyphenate the modifier and keep the unit in the singular form:</p>\n<ul>\n  <li><em>A thirty-second timeout</em> (NOT <em>thirty-seconds timeout</em>)</li>\n  <li><em>A four-core processor</em> (NOT <em>four-cores processor</em>)</li>\n  <li><em>A twenty-gigabyte heap allocation</em></li>\n</ul>\n",
        "questions": [
          {
            "question": "Which sentence accurately articulates service latency metrics using standard quantitative terminology?",
            "description": "Express statistical percentiles and metric thresholds.",
            "options": [
              "The p99 latency decreased by 45 milliseconds, ensuring that 99% of user requests complete within 120ms.",
              "The p99 latency decreased at 45 milliseconds, ensuring that 99% of user requests are under 120ms faster.",
              "The p99 latency decreased to 45 milliseconds from 99% users.",
              "The p99 latency grew smaller by 45 milliseconds for almost all requests."
            ],
            "answer": 0,
            "explanation": "'The p99 latency decreased by 45 milliseconds, ensuring that 99% of user requests complete within 120ms' correctly pairs prepositional change ('by 45ms') with the formal statistical definition of the 99th percentile (p99)."
          },
          {
            "question": "Choose the grammatically and quantitatively correct statement regarding server capacity:",
            "description": "Apply quantifiers to countable compute nodes versus continuous load.",
            "options": [
              "Our cluster handles a greater number of requests while utilizing fewer compute instances.",
              "Our cluster handles a greater amount of requests while utilizing fewer compute instances.",
              "Our cluster handles a greater number of requests while utilizing less compute instances.",
              "Our cluster handles greater requests while utilizing less instances."
            ],
            "answer": 0,
            "explanation": "'Number of' is required for plural countable nouns ('requests'), and 'fewer' is required for plural countable nouns ('instances'). 'Amount of' and 'less' apply to uncountable mass nouns."
          },
          {
            "question": "When describing exponential algorithmic complexity, what is the most precise formulation?",
            "description": "Communicate mathematical orders of magnitude.",
            "options": [
              "The execution time scales exponentially as the input size increases by a factor of ten.",
              "The execution time scales exponential when input grows ten times larger.",
              "The execution time multiplies exponential with ten inputs.",
              "The execution time goes up high exponentially by factor ten."
            ],
            "answer": 0,
            "explanation": "'Scales exponentially' correctly uses the adverb 'exponentially' to modify the verb 'scales', and 'by a factor of ten' is the standard mathematical idiom for proportional scaling."
          },
          {
            "question": "Which option correctly uses commas and formatting for large numbers in English technical writing?",
            "description": "Format numerical data and throughput quantities.",
            "options": [
              "The event stream ingested 1,250,000 events per second during peak load.",
              "The event stream ingested 1.250.000 events per second during peak load.",
              "The event stream ingested 1250,000 events per second during peak load.",
              "The event stream ingested 1 250 000,00 events per second during peak load."
            ],
            "answer": 0,
            "explanation": "Standard English formatting uses commas (',') as thousands separators to group digits in triplets (1,250,000) and a period ('.') for decimal fractions."
          },
          {
            "question": "Identify the sentence that correctly distinguishes between 'percentage' and 'percentage points':",
            "description": "Differentiate relative change from absolute metric point shifts.",
            "options": [
              "Cache hit rates improved from 80% to 85%, representing an absolute increase of 5 percentage points.",
              "Cache hit rates improved from 80% to 85%, representing an absolute increase of 5 percent.",
              "Cache hit rates improved from 80% to 85%, representing a percentage increase of 5 percent.",
              "Cache hit rates improved from 80% to 85%, representing an increase of 5 percentage."
            ],
            "answer": 0,
            "explanation": "Moving from 80% to 85% is an absolute gain of 5 'percentage points' (whereas the relative percentage increase is (85-80)/80 = 6.25%). Conflating 'percent' and 'percentage points' creates severe metric ambiguity."
          }
        ]
      },
      {
        "lesson_number": 4,
        "title": "Everyday Conversations & Collocations",
        "description": "Technical collocations, collaborative code review phrasing, and workplace idioms.",
        "theory": "\n<h3>Chapter Overview: Everyday Conversations & Collocations</h3>\n<p>Collocations are natural pairings of words that native speakers instinctively use together. Using established technical collocations makes engineering discussions, documentation, and pull request reviews sound fluent and authoritative.</p>\n\n<div class=\"theory-callout\">\n  <strong>Collocation Distinction:</strong> We <em>throw</em> or <em>raise</em> an exception (never <em>make</em> an exception in code). We <em>meet</em> or <em>miss</em> a deadline (never <em>catch</em> a deadline).\n</div>\n\n<h4>1. Essential Engineering Collocations</h4>\n<ul>\n  <li><strong>Exceptions:</strong> <em>throw an exception, catch an exception, raise an error</em>.</li>\n  <li><strong>System State:</strong> <em>address a bottleneck, mitigate a vulnerability, reproduce a bug, spin up a container</em>.</li>\n  <li><strong>Project Management:</strong> <em>meet a deadline, scope a feature, manage trade-offs, conduct an audit</em>.</li>\n</ul>\n\n<h4>2. Empathy and Constructive Peer Review</h4>\n<p>Code reviews should critique the code, not the author. Frame suggestions collaboratively using open questions:</p>\n<pre><code class=\"language-text\"># Collaborative & Constructive:\n\"Could we consider extracting this nested loop into a helper method to simplify unit testing?\"\n\"What do you think about memoizing this calculation to prevent redundant database round-trips?\"\n\n# Unproductive & Accusatory:\n\"Your code is messy and breaks production.\"</code></pre>\n\n<h4>3. Idiomatic Engineering Terms: Technical Debt</h4>\n<p><strong>Technical debt</strong> refers to the future cost of rework caused by choosing an expedited, suboptimal solution now over a better architectural approach. Teams <em>incur</em> technical debt, <em>manage</em> it, and eventually <em>pay it down</em> through systematic refactoring.</p>\n",
        "questions": [
          {
            "question": "Which phrase is a natural English collocation frequently used in software engineering discussions?",
            "description": "Identify idiomatic technical collocations.",
            "options": [
              "Technical debt",
              "Technical loan",
              "Technical deficit",
              "Technical liability"
            ],
            "answer": 0,
            "explanation": "'Technical debt' (coined by Ward Cunningham) is the universally established industry collocation referring to the implied cost of future refactoring incurred by choosing an expedient solution now."
          },
          {
            "question": "In a code review comment, which collocation provides the most natural and polite phrasing?",
            "description": "Use professional collocations in collaborative code reviews.",
            "options": [
              "Could we take into consideration extracting this loop into a helper function?",
              "Could we take into notice extracting this loop into a helper function?",
              "Could we make into consideration extracting this loop into a helper function?",
              "Could we do consideration of extracting this loop into a helper function?"
            ],
            "answer": 0,
            "explanation": "'Take into consideration' (or 'take into account') is the correct standard idiomatic collocation. 'Take into notice' and 'make into consideration' are non-idiomatic."
          },
          {
            "question": "Select the sentence with the correct prepositional collocation:",
            "description": "Match verbs with their mandatory dependent prepositions.",
            "options": [
              "This microservice adheres to open telemetry standards.",
              "This microservice adheres with open telemetry standards.",
              "This microservice adheres in open telemetry standards.",
              "This microservice adheres towards open telemetry standards."
            ],
            "answer": 0,
            "explanation": "The verb 'adhere' collocates strictly with the preposition 'to' (e.g. 'adhere to standards', 'adhere to guidelines')."
          },
          {
            "question": "Which conversational idiom accurately describes resolving a problem early before it compounds?",
            "description": "Recognize workplace idioms in technical contexts.",
            "options": [
              "Nip the issue in the bud",
              "Cut the issue in the flower",
              "Bite the issue in the root",
              "Stop the issue in the branch"
            ],
            "answer": 0,
            "explanation": "'Nip it in the bud' is a well-established English idiom meaning to suppress or resolve a problem at an early stage before it grows uncontrollable."
          },
          {
            "question": "Choose the correct collocation for expressing that a feature is no longer supported and slated for removal:",
            "description": "Identify software deprecation terminology.",
            "options": [
              "The legacy authentication endpoint has been deprecated.",
              "The legacy authentication endpoint has been depreciated.",
              "The legacy authentication endpoint has been degraded.",
              "The legacy authentication endpoint has been dispensed."
            ],
            "answer": 0,
            "explanation": "In software engineering, 'deprecate' means to declare a software feature obsolete and advise against its use. 'Depreciate' refers to the decline in financial asset value over time."
          }
        ]
      },
      {
        "lesson_number": 5,
        "title": "Grammar Basics: Parts of Speech & Prepositions",
        "description": "Dependent prepositions, possessives vs contractions, and syntactic grammatical accuracy.",
        "theory": "\n<h3>Chapter Overview: Grammar Basics: Parts of Speech & Prepositions</h3>\n<p>Prepositions define temporal, spatial, and logical relationships between system components. Modal auxiliary verbs establish the degree of certainty, obligation, or permission in architectural specifications.</p>\n\n<div class=\"theory-callout\">\n  <strong>Preposition Precision:</strong> Systems are dependent <em>on</em>, compatible <em>with</em>, compliant <em>with</em>, and adhere <em>to</em> standards.\n</div>\n\n<h4>1. Prepositions of Time & Location</h4>\n<ul>\n  <li><strong>At:</strong> Exact times and specific endpoints (<em>at 03:00 UTC, at the root endpoint</em>).</li>\n  <li><strong>On:</strong> Specific days and host systems (<em>on Sunday, deployed on bare-metal servers</em>).</li>\n  <li><strong>In:</strong> Regions, containers, and memory (<em>in the EU-West datacenter, in memory, in SQLite</em>).</li>\n</ul>\n\n<h4>2. Modal Auxiliary Verbs in Standards (IETF RFC 2119)</h4>\n<ul>\n  <li><strong>MUST / REQUIRED:</strong> An absolute mandate for conformance.</li>\n  <li><strong>SHOULD / RECOMMENDED:</strong> A strong recommendation; deviations require documented justification.</li>\n  <li><strong>MAY / OPTIONAL:</strong> A permissible option with no penalty for omission.</li>\n</ul>\n\n<h4>3. Objective vs Subjective Pronouns</h4>\n<p>Ensure correct pronoun cases in compound phrases by testing each pronoun independently:</p>\n<pre><code class=\"language-text\"># Correct: The architect invited Sarah and me (invite me, not invite I)\nThe architect invited Sarah and me to evaluate the GraphQL schema.\n\n# Incorrect:\nThe architect invited Sarah and I to evaluate the GraphQL schema.</code></pre>\n",
        "questions": [
          {
            "question": "Which preposition correctly completes the sentence: 'The newly deployed proxy is fully compatible _____ our legacy TLS cipher suites'?",
            "description": "Select the correct dependent preposition for adjectives.",
            "options": [
              "with",
              "to",
              "for",
              "at"
            ],
            "answer": 0,
            "explanation": "The adjective 'compatible' governs the dependent preposition 'with' ('compatible with')."
          },
          {
            "question": "Identify the sentence that correctly distinguishes between 'its' and 'it's':",
            "description": "Assess possessive determiner vs contracted pronoun + verb.",
            "options": [
              "The background worker lost its database connection because it's configured with a short timeout.",
              "The background worker lost it's database connection because its configured with a short timeout.",
              "The background worker lost its database connection because its configured with a short timeout.",
              "The background worker lost it's database connection because it's configured with a short timeout."
            ],
            "answer": 0,
            "explanation": "'Its' without an apostrophe is the possessive pronoun ('its database connection'). 'It's' with an apostrophe is the contraction for 'it is' ('it is configured...')."
          },
          {
            "question": "Which word functions as a conjunction in the following sentence?\n\n'The microservice throttles incoming requests unless the client supplies a valid API key.'",
            "description": "Identify syntactic function of subordinating conjunctions.",
            "options": [
              "unless",
              "throttles",
              "incoming",
              "valid"
            ],
            "answer": 0,
            "explanation": "'Unless' is a subordinating conjunction connecting the main clause ('The microservice throttles incoming requests') with the dependent conditional clause ('the client supplies a valid API key')."
          },
          {
            "question": "Select the sentence with correct adverbial modification:",
            "description": "Distinguish adjective vs adverb placement.",
            "options": [
              "The data pipeline processes concurrent streams efficiently.",
              "The data pipeline processes concurrent streams efficient.",
              "The data pipeline processes concurrent efficiently streams.",
              "The efficient data pipeline processes stream efficiently fast."
            ],
            "answer": 0,
            "explanation": "'Efficiently' is an adverb correctly modifying the action verb 'processes'. Using the adjective 'efficient' to modify an action verb is grammatically incorrect."
          },
          {
            "question": "Which sentence features correct pronoun-antecedent agreement?",
            "description": "Ensure gender-neutral and singular/plural pronoun agreement.",
            "options": [
              "Each software engineer must submit their pull request before the code freeze.",
              "Each software engineer must submit their pull requests before they're code freeze.",
              "All software engineers must submit his pull request before the code freeze.",
              "Every engineer must submit its pull request before the code freeze."
            ],
            "answer": 0,
            "explanation": "In modern professional English, the singular 'their' is standard and recognized for indefinite singular antecedents like 'Each software engineer'."
          }
        ]
      },
      {
        "lesson_number": 6,
        "title": "Sentence Building & Syntactic Connectors",
        "description": "Conjunctions, relative clauses, avoiding comma splices, and parallel sentence structure.",
        "theory": "\n<h3>Chapter Overview: Sentence Building & Syntactic Connectors</h3>\n<p>Complex engineering proposals and technical documentation require syntactic variety. Connecting clauses logically without falling into comma splices, run-ons, or dangling modifiers ensures effortless readability for reviewers.</p>\n\n<div class=\"theory-callout\">\n  <strong>Fixing Comma Splices:</strong> Never join two independent clauses with only a comma. Use a semicolon (<code>;</code>), a period (<code>.</code>), or a comma followed by a coordinating conjunction (<em>and, but, so, yet</em>).\n</div>\n\n<h4>1. Coordinating Conjunctions (FANBOYS)</h4>\n<p>Join independent clauses of equal grammatical rank: <strong>F</strong>or, <strong>A</strong>nd, <strong>N</strong>or, <strong>B</strong>ut, <strong>O</strong>r, <strong>Y</strong>et, <strong>S</strong>o.</p>\n<pre><code class=\"language-text\">The unit test suite completed in 400ms, BUT the staging database rejected the migration.</code></pre>\n\n<h4>2. Subordinating Conjunctions</h4>\n<p>Subordinating conjunctions introduce condition, contrast, or causality: <em>although, because, whereas, unless, while, since</em>.</p>\n<pre><code class=\"language-text\">The API gateway will drop incoming payloads UNLESS the client includes a valid bearer token.</code></pre>\n\n<h4>3. Restrictive vs Non-Restrictive Relative Clauses</h4>\n<ul>\n  <li><strong>Restrictive (That, no commas):</strong> Essential to identifying the subject: <em>\"The service that processes billing must be PCI-DSS compliant.\"</em></li>\n  <li><strong>Non-Restrictive (Which, with commas):</strong> Adds optional supplementary information: <em>\"The billing service, which was refactored last month, passed the penetration audit.\"</em></li>\n</ul>\n",
        "questions": [
          {
            "question": "Which sentence correctly repairs the comma splice error below?\n\n'The database migration finished successfully, the web application resumed traffic.'",
            "description": "Identify correct coordination and subordination techniques.",
            "options": [
              "The database migration finished successfully; subsequently, the web application resumed traffic.",
              "The database migration finished successfully, however the web application resumed traffic.",
              "The database migration finished successfully, so then the web application resumed traffic.",
              "The database migration finished successfully the web application resumed traffic."
            ],
            "answer": 0,
            "explanation": "Two independent clauses cannot be joined solely by a comma (a comma splice). Using a semicolon followed by a conjunctive adverb ('subsequently') and a comma creates a grammatically sound compound sentence."
          },
          {
            "question": "Which sentence correctly uses a restrictive relative clause with 'that' versus a non-restrictive clause with 'which'?",
            "description": "Distinguish restrictive and non-restrictive relative clauses.",
            "options": [
              "The authentication service that handles biometric tokens was updated yesterday, whereas the legacy service, which will be decommissioned next month, was untouched.",
              "The authentication service which handles biometric tokens was updated yesterday, whereas the legacy service that will be decommissioned next month, was untouched.",
              "The authentication service, that handles biometric tokens, was updated yesterday.",
              "The legacy service which, will be decommissioned, was untouched."
            ],
            "answer": 0,
            "explanation": "'That' introduces restrictive clauses essential to identifying the subject (no commas). 'Which' introduces non-restrictive clauses that provide supplementary non-essential details (set off by commas)."
          },
          {
            "question": "Identify the sentence that contains a dangling modifier:",
            "description": "Detect dangling participial phrases in technical descriptions.",
            "options": [
              "While refactoring the payment module, an unhandled NullPointerException was discovered by Sarah.",
              "While refactoring the payment module, Sarah discovered an unhandled NullPointerException.",
              "While Sarah was refactoring the payment module, she discovered an unhandled NullPointerException.",
              "Sarah discovered an unhandled NullPointerException while refactoring the payment module."
            ],
            "answer": 0,
            "explanation": "In option A, 'While refactoring the payment module' precedes 'an unhandled NullPointerException', implying grammatically that the exception was refactoring the module. Options B, C, and D correctly bind the action to Sarah."
          },
          {
            "question": "What is the function of the transition word 'consequently' in technical discourse?",
            "description": "Analyze logical connectors and cause-and-effect transitions.",
            "options": [
              "It introduces a direct causal result or effect of the preceding statement.",
              "It introduces a contrasting viewpoint.",
              "It enumerates a chronological sequence of unrelated steps.",
              "It emphasizes a concession."
            ],
            "answer": 0,
            "explanation": "'Consequently' is a conjunctive adverb indicating that the upcoming clause is a direct consequence or outcome of what was previously stated."
          },
          {
            "question": "Choose the sentence that maintains parallel grammatical structure in technical documentation:",
            "description": "Enforce parallel structure in bulleted or coordinated technical lists.",
            "options": [
              "The automated pipeline builds the source code, executes unit tests, and deploys the container artifact.",
              "The automated pipeline builds the source code, executing unit tests, and deploys the container artifact.",
              "The automated pipeline builds the source code, executes unit tests, and deployment of container artifacts.",
              "The automated pipeline building source code, executes unit tests, and to deploy artifacts."
            ],
            "answer": 0,
            "explanation": "Parallel structure requires all items in a coordinate series to share the same grammatical form (third-person singular verbs: 'builds', 'executes', 'deploys')."
          }
        ]
      },
      {
        "lesson_number": 7,
        "title": "Tenses Mastery & Temporal Precision",
        "description": "Past perfect sequences in incident reports, conditionals in post-mortems, and roadmap milestones.",
        "theory": "\n<h3>Chapter Overview: Tenses Mastery & Temporal Precision</h3>\n<p>Software incident reports and release summaries communicate timeline sequences. Selecting the appropriate grammatical aspect (simple, continuous, perfect, or conditional) clarifies cause and effect across asynchronous events.</p>\n\n<div class=\"theory-callout\">\n  <strong>Sequence Rule:</strong> Use the <strong>Past Perfect</strong> (<em>had + past participle</em>) to describe an event that concluded before another past event began.\n</div>\n\n<h4>1. Present Perfect vs Simple Past</h4>\n<ul>\n  <li><strong>Simple Past:</strong> Completed at a specific historical point (<em>\"We patched the server yesterday at 22:00.\"</em>).</li>\n  <li><strong>Present Perfect:</strong> Completed at an unspecified time with current relevance or spanning to now (<em>\"We have observed zero connection timeouts this week.\"</em>).</li>\n</ul>\n\n<h4>2. Past Perfect in Incident Timelines</h4>\n<pre><code class=\"language-text\">By the time the site reliability engineer logged into the cluster, \nthe automated watchdog HAD ALREADY TERMINATED the unresponsive container.</code></pre>\n\n<h4>3. The Third Conditional (Unreal Past / Post-Mortems)</h4>\n<p>When analyzing root causes in blameless post-mortems, use the third conditional to evaluate counterfactual scenarios:</p>\n<pre><code class=\"language-text\">Structure: If + [Past Perfect], [would have + Past Participle]\n\n\"If the application had validated the content-length header, \nthe denial-of-service attack would not have overwhelmed the worker threads.\"</code></pre>\n\n<h4>4. Future Perfect: Projecting Completion</h4>\n<p>Use the future perfect to declare milestones that will be completed prior to a designated future date:</p>\n<pre><code class=\"language-text\">\"By Q3, our cloud engineering team will have migrated all monolithic services to Kubernetes.\"</code></pre>\n",
        "questions": [
          {
            "question": "Select the sentence that correctly employs the past perfect tense to describe an incident sequence:",
            "description": "Demonstrate temporal precedence in system post-mortems.",
            "options": [
              "By the time the site reliability engineer logged into the cluster, the automated watchdog had already terminated the hung process.",
              "By the time the site reliability engineer had logged into the cluster, the automated watchdog terminated the hung process.",
              "By the time the site reliability engineer logs into the cluster, the automated watchdog has already terminated the hung process.",
              "By the time the site reliability engineer logged into the cluster, the automated watchdog terminates the hung process."
            ],
            "answer": 0,
            "explanation": "The past perfect ('had already terminated') indicates an action that was finished prior to another past action ('logged into'). The watchdog's termination occurred before the engineer logged in."
          },
          {
            "question": "Which sentence correctly demonstrates the third conditional for root cause analysis in a post-mortem?",
            "description": "Construct unreal past conditional statements.",
            "options": [
              "If the load balancer had validated the payload size, the buffer overflow would not have occurred.",
              "If the load balancer validated the payload size, the buffer overflow will not occur.",
              "If the load balancer would have validated the payload size, the buffer overflow had not occurred.",
              "If the load balancer had validated the payload size, the buffer overflow did not occur."
            ],
            "answer": 0,
            "explanation": "The third conditional (unreal past) follows the pattern: 'If + past perfect, would have + past participle'. It evaluates what would have happened if past circumstances had been different."
          },
          {
            "question": "Choose the sentence that properly distinguishes between the simple past and present perfect:",
            "description": "Differentiate completed historical events from ongoing states.",
            "options": [
              "We released version 2.4 last Tuesday, and our uptime has remained at 99.99% since that deployment.",
              "We have released version 2.4 last Tuesday, and our uptime remained at 99.99% since that deployment.",
              "We released version 2.4 last Tuesday, and our uptime remained at 99.99% since that deployment.",
              "We had released version 2.4 last Tuesday, and our uptime has remained at 99.99% since that deployment."
            ],
            "answer": 0,
            "explanation": "A specific past timestamp ('last Tuesday') requires the simple past ('released'). An ongoing condition starting in the past and continuing to the present ('since that deployment') requires the present perfect ('has remained')."
          },
          {
            "question": "Which sentence accurately uses the future perfect tense to project roadmap completion?",
            "description": "Express milestones completed before a specific future deadline.",
            "options": [
              "By the end of the fourth quarter, our DevOps team will have migrated all monolithic services to containerized pods.",
              "By the end of the fourth quarter, our DevOps team will migrate all monolithic services to containerized pods.",
              "By the end of the fourth quarter, our DevOps team will have been migrating all monolithic services to containerized pods.",
              "By the end of the fourth quarter, our DevOps team has migrated all monolithic services to containerized pods."
            ],
            "answer": 0,
            "explanation": "The future perfect ('will have migrated') expresses that an action will be completed prior to a designated future time ('By the end of the fourth quarter')."
          },
          {
            "question": "Identify the sentence that correctly expresses habitual technical actions using the simple present:",
            "description": "State invariant technical truths and algorithmic facts.",
            "options": [
              "When a node fails health checks, the orchestrator redistributes active worker pods to healthy nodes.",
              "When a node is failing health checks, the orchestrator had redistributed active worker pods.",
              "When a node will fail health checks, the orchestrator redistributes active worker pods.",
              "When a node failed health checks, the orchestrator will redistribute active worker pods."
            ],
            "answer": 0,
            "explanation": "Standard technical specifications and automated state transitions use the zero conditional with simple present verbs in both clauses to declare invariant rules."
          }
        ]
      },
      {
        "lesson_number": 8,
        "title": "Technical Reading Comprehension & Synthesis",
        "description": "Analyzing RFC specifications, architectural decision trade-offs, and failure-isolation patterns.",
        "theory": "\n<h3>Chapter Overview: Technical Reading Comprehension & Synthesis</h3>\n<p>Engineering mastery requires rapidly comprehending API specifications, RFC protocols, architectural decision records (ADRs), and research papers. Synthesizing trade-offs and discerning critical constraints is a hallmark of senior technical leadership.</p>\n\n<div class=\"theory-callout\">\n  <strong>Reading Strategy:</strong> Distinguish foundational architectural guarantees (e.g. idempotency, linearizability) from auxiliary implementation optimizations.\n</div>\n\n<h4>1. Decoding Technical Jargon from Context</h4>\n<ul>\n  <li><strong>Idempotent:</strong> An operation that produces the exact same system side-effect whether executed once or multiple consecutive times (e.g. HTTP PUT vs non-idempotent POST).</li>\n  <li><strong>Ephemeral:</strong> Temporary, short-lived resources (e.g. serverless execution workers that retain no local state across request invocations).</li>\n  <li><strong>Eventual Consistency:</strong> Replicas in a distributed database will converge to the same state given sufficient time, trading immediate consistency for high availability.</li>\n</ul>\n\n<h4>2. Synthesizing Architectural Trade-offs</h4>\n<p>Technical reading requires evaluating trade-offs under theorem constraints (like the CAP theorem). When analyzing architecture documents, extract:</p>\n<ol>\n  <li>The primary problem being resolved.</li>\n  <li>The proposed structural pattern (e.g. circuit breaker, CQRS, event sourcing).</li>\n  <li>The operational trade-offs accepted (e.g. higher latency, increased infrastructure cost, eventual consistency).</li>\n</ol>\n\n<h4>3. The Circuit Breaker Pattern in Action</h4>\n<p>Circuit breakers monitor downstream RPC failures. When error rates exceed a defined threshold, the circuit 'trips' open to fail fast, preserving upstream thread pools while the downstream dependency recovers.</p>\n",
        "questions": [
          {
            "question": "Read the architectural excerpt below:\n\n'In an event-driven microservices architecture, eventual consistency ensures that all storage replicas converge to identical state given sufficient time, trading immediate linearizability for low-latency writes and high partition tolerance.'\n\nAccording to this passage, what fundamental trade-off does eventual consistency accept?",
            "description": "Synthesize distributed systems architectural trade-offs.",
            "options": [
              "It sacrifices immediate linearizability (instantaneous global consistency) to achieve low-latency writes and partition tolerance.",
              "It sacrifices network partition tolerance to guarantee instantaneous ACID transactions across all nodes.",
              "It eliminates network latency completely by avoiding data replication.",
              "It guarantees that all read requests reflect the latest write immediately without delay."
            ],
            "answer": 0,
            "explanation": "The passage explicitly states that eventual consistency trades 'immediate linearizability' in exchange for 'low-latency writes and high partition tolerance' under the CAP theorem."
          },
          {
            "question": "Read the excerpt regarding the Circuit Breaker pattern:\n\n'When downstream remote procedure call (RPC) failure rates exceed a preconfigured threshold, the circuit breaker transitions from CLOSED to OPEN. In the OPEN state, inbound calls fail immediately without attempting network transport, protecting downstream resources from cascade failure.'\n\nWhat is the primary benefit of the OPEN state?",
            "description": "Analyze failure-isolation patterns from technical documentation.",
            "options": [
              "Failing fast to prevent resource exhaustion and stop cascading failures while the downstream service recovers.",
              "Retrying failed network requests indefinitely until the downstream server responds.",
              "Increasing network bandwidth by batching concurrent requests together.",
              "Encrypting payload contents before sending across untrusted boundaries."
            ],
            "answer": 0,
            "explanation": "The circuit breaker's OPEN state prevents thread pool and connection starvation by failing fast immediately, protecting both upstream callers and downstream recovering services."
          },
          {
            "question": "In technical RFC specifications, what does the key requirement word 'MUST NOT' denote according to RFC 2119?",
            "description": "Interpret standards track specification terminology (RFC 2119).",
            "options": [
              "An absolute, inviolable prohibition of the specification.",
              "A suggested practice that may be ignored if convenient.",
              "A deprecated legacy behavior that is optional.",
              "A recommendation subject to individual developer preference."
            ],
            "answer": 0,
            "explanation": "Per RFC 2119, 'MUST NOT' or 'SHALL NOT' means that the definition is an absolute prohibition of the specification for interoperability and compliance."
          },
          {
            "question": "Read the following API documentation snippet:\n\n'An idempotent HTTP method is one where the side-effects of N identical requests are the same as for a single request. PUT and DELETE are idempotent; POST is inherently non-idempotent.'\n\nBased on this definition, what occurs if an identical PUT request is executed five times in sequence?",
            "description": "Deduce side-effects from technical protocol definitions.",
            "options": [
              "The server-side system state remains identical to the state resulting from a single successful request.",
              "Five distinct resource entities are created in the database.",
              "The server returns an HTTP 500 error on the second invocation.",
              "The network connection is permanently closed by the gateway."
            ],
            "answer": 0,
            "explanation": "Idempotence guarantees that repeated identical requests produce the exact same server-side outcome as a single request."
          },
          {
            "question": "Read the database indexing documentation:\n\n'B-Tree indexes maintain sorted key-value pointers, providing O(log N) lookup time for equality and range queries. However, each supplementary secondary index incurs a write penalty on INSERT, UPDATE, and DELETE operations as index pages must be updated and rebalanced.'\n\nWhat synthesis accurately captures the operational trade-off of secondary indexes?",
            "description": "Evaluate operational compromises between query and ingestion velocity.",
            "options": [
              "Secondary indexes accelerate read and range queries at the cost of diminished write and ingestion throughput.",
              "Secondary indexes improve write throughput while slowing down read queries.",
              "Secondary indexes eliminate the need for primary keys on large tables.",
              "Secondary indexes guarantee O(1) constant-time writes for all transactions."
            ],
            "answer": 0,
            "explanation": "The documentation clearly explains that while reads become faster (O(log N)), every write incurs an overhead because the database must update and rebalance the index structures."
          }
        ]
      }
    ]
  }
};

    /* =========================
       DOM ELEMENTS
    ========================= */
    const subjectName = document.getElementById("subjectName");
    const subjectIcon = document.getElementById("subjectIcon");
    const lessonTitle = document.getElementById("lessonTitle");
    const introIcon = document.getElementById("introIcon");
    const introTitle = document.getElementById("introTitle");
    const introText = document.getElementById("introText");
    const lessonTag = document.getElementById("lessonTag");

    // Sections & Mode Tabs
    const tabTheory = document.getElementById("tabTheory");
    const tabQuiz = document.getElementById("tabQuiz");
    const lessonTheory = document.getElementById("lessonTheory");
    const lessonContent = document.getElementById("lessonContent");
    const completion = document.getElementById("completion");
    const theoryContainer = document.getElementById("theoryContainer");
    const startQuizBtn = document.getElementById("startQuizBtn");
    const theoryBackBtn = document.getElementById("theoryBackBtn");
    const reviewTheoryLink = document.getElementById("reviewTheoryLink");

    // Quiz elements
    const questionNumber = document.getElementById("questionNumber");
    const totalQuestions = document.getElementById("totalQuestions");
    const question = document.getElementById("question");
    const questionDescription = document.getElementById("questionDescription");
    const optionsContainer = document.getElementById("options");
    const feedback = document.getElementById("feedback");
    const feedbackIcon = document.getElementById("feedbackIcon");
    const feedbackTitle = document.getElementById("feedbackTitle");
    const feedbackText = document.getElementById("feedbackText");
    const nextBtn = document.getElementById("nextBtn");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const xpElement = document.getElementById("xp");
    const accuracy = document.getElementById("accuracy");
    const backBtn = document.getElementById("backBtn");
    const continueBtn = document.getElementById("continueBtn");
    const nextLessonBtn = document.getElementById("nextLessonBtn");
    const nextLessonLockNotice = document.getElementById("nextLessonLockNotice");
    const nextLessonLockMsg = document.getElementById("nextLessonLockMsg");
    const lockedLessonSection = document.getElementById("lockedLessonSection");
    const lockedSectionMsg = document.getElementById("lockedSectionMsg");
    const btnGoPrereq = document.getElementById("btnGoPrereq");
    const btnGoBackCurriculum = document.getElementById("btnGoBackCurriculum");

    /* =========================
       INITIAL DATA RESOLUTION
    ========================= */
    const subjectInfo = lessonData[subject] || lessonData.Python;
    let currentLesson = (subjectInfo.lessons && subjectInfo.lessons[lessonNumber - 1]) || subjectInfo.lessons[0];
    let questions = currentLesson.questions || [];
    let theoryHtml = currentLesson.theory || "<p>Theory loading...</p>";

    let adaptiveTopic = currentLesson.title;
    let adaptiveDifficulty = "Intermediate";
    let adaptiveRationale = "";
    let adaptiveSuggestions = [];
    let isAdaptiveQuiz = false;

    // Fetch live from FastAPI backend SQLite database if available
    if (window.BhashaAPI) {
        try {
            const apiLesson = await window.BhashaAPI.getLessonDetail(subject, lessonNumber);
            if (apiLesson) {
                if (apiLesson.title) currentLesson.title = apiLesson.title;
                if (apiLesson.theory) theoryHtml = apiLesson.theory;
                if (apiLesson.questions && apiLesson.questions.length > 0) {
                    questions = apiLesson.questions;
                }
            }
        } catch (err) {
            console.info("Loaded local curriculum snapshot:", err.message);
        }

        // Generate AI-powered personalized adaptive quiz if user is authenticated
        if (window.BhashaAPI.isAuthenticated && window.BhashaAPI.isAuthenticated() && window.BhashaAPI.generateAdaptiveQuiz) {
            try {
                const adaptiveData = await window.BhashaAPI.generateAdaptiveQuiz(subject, lessonNumber);
                if (adaptiveData && adaptiveData.questions && adaptiveData.questions.length > 0) {
                    questions = adaptiveData.questions;
                    adaptiveTopic = adaptiveData.topic || currentLesson.title;
                    adaptiveDifficulty = adaptiveData.difficulty || "Intermediate";
                    adaptiveRationale = adaptiveData.adaptation_rationale || "";
                    adaptiveSuggestions = adaptiveData.improvement_suggestions || [];
                    isAdaptiveQuiz = true;

                    // Display adaptive personalization banner
                    const adaptiveBanner = document.getElementById("adaptiveBanner");
                    const adaptiveTitle = document.getElementById("adaptiveTitle");
                    const adaptiveSubtext = document.getElementById("adaptiveSubtext");
                    const adaptiveDiffBadge = document.getElementById("adaptiveDiffBadge");

                    if (adaptiveBanner) {
                        adaptiveBanner.style.display = "flex";
                        if (adaptiveTitle) adaptiveTitle.textContent = `⚡ AI Adaptive Quiz • ${adaptiveTopic}`;
                        if (adaptiveSubtext) adaptiveSubtext.textContent = adaptiveRationale || `Personalized for your ${adaptiveDifficulty} level.`;
                        if (adaptiveDiffBadge) {
                            adaptiveDiffBadge.textContent = adaptiveDifficulty;
                            if (adaptiveDifficulty === "Beginner") {
                                adaptiveDiffBadge.style.background = "rgba(76, 175, 80, 0.2)";
                                adaptiveDiffBadge.style.color = "#4CAF50";
                                adaptiveDiffBadge.style.borderColor = "rgba(76, 175, 80, 0.4)";
                            } else if (adaptiveDifficulty === "Advanced") {
                                adaptiveDiffBadge.style.background = "rgba(156, 39, 176, 0.2)";
                                adaptiveDiffBadge.style.color = "#AB47BC";
                                adaptiveDiffBadge.style.borderColor = "rgba(156, 39, 176, 0.4)";
                            } else {
                                adaptiveDiffBadge.style.background = "rgba(255, 167, 38, 0.2)";
                                adaptiveDiffBadge.style.color = "#FFA726";
                                adaptiveDiffBadge.style.borderColor = "rgba(255, 167, 38, 0.4)";
                            }
                        }
                    }
                }
            } catch (adErr) {
                console.info("Adaptive quiz generation fallback to standard lesson questions:", adErr.message);
            }
        }
    }

    /* Populate Header & Theory Content */
    document.title = `LingoX | ${subject} Learning Path - Lesson ${lessonNumber}`;
    if (subjectName) subjectName.textContent = `${subject} Learning Path`;
    if (subjectIcon) subjectIcon.textContent = subjectInfo.icon || "🌿";
    if (lessonTitle) lessonTitle.textContent = `Lesson ${lessonNumber}`;
    if (introIcon) introIcon.textContent = subjectInfo.icon || "🌿";
    if (introTitle) introTitle.textContent = currentLesson.title;
    if (introText) {
        introText.textContent = `Master the core theory, syntax mechanics, and architectural code rules of ${currentLesson.title}.`;
    }
    if (lessonTag) {
        lessonTag.textContent = `${subject.toUpperCase()} LEARNING PATH • MODULE ${lessonNumber}`;
    }

    // Render Theory Body
    if (theoryContainer) {
        theoryContainer.innerHTML = theoryHtml;
    }

    // Restore saved lesson progress safely from local storage and backend.
    let savedProgress = null;

    if (window.BhashaAPI && window.BhashaAPI.getLocalProgress) {
        const localProg = window.BhashaAPI.getLocalProgress(subject);
        const match = localProg.find(p => Number(p.lesson_number) === lessonNumber && Boolean(p.completed));
        if (match) {
            savedProgress = {
                subject: subject,
                lesson: lessonNumber,
                lesson_number: lessonNumber,
                score: match.score,
                total: match.total_questions || questions.length,
                total_questions: match.total_questions || questions.length,
                xp: match.xp_earned || 50,
                xp_earned: match.xp_earned || 50,
                completed: true
            };
        }
    }

    if (!savedProgress) {
        try {
            savedProgress = JSON.parse(
                localStorage.getItem(`bhasha_${subject}_lesson_${lessonNumber}`) ||
                localStorage.getItem(`bhasha_${subject.toLowerCase()}_lesson_${lessonNumber}`) || "null"
            );
        } catch (error) {
            console.warn("Could not read saved lesson progress:", error);
        }
    }

    // Support the older completion flag too.
    if (!savedProgress && (
        localStorage.getItem(`bhasha_${subject}_lesson_${lessonNumber}_completed`) === "true" ||
        localStorage.getItem(`bhasha_${subject.toLowerCase()}_lesson_${lessonNumber}_completed`) === "true"
    )) {
        savedProgress = { completed: true, score: questions.length, total: questions.length, xp: 50 };
    }

    // If still not restored locally, check backend
    if (!savedProgress && window.BhashaAPI && window.BhashaAPI.getLessonProgress) {
        try {
            const liveProg = await window.BhashaAPI.getLessonProgress(subject);
            const match = liveProg && liveProg.find(p => Number(p.lesson_number) === lessonNumber && Boolean(p.completed));
            if (match) {
                savedProgress = {
                    subject: subject,
                    lesson: lessonNumber,
                    lesson_number: lessonNumber,
                    score: match.score,
                    total: match.total_questions || questions.length,
                    total_questions: match.total_questions || questions.length,
                    xp: match.xp_earned || 50,
                    xp_earned: match.xp_earned || 50,
                    completed: true
                };
            }
        } catch (_) {}
    }

    let lessonAlreadyCompleted = Boolean(savedProgress && savedProgress.completed);

    // Guard: Verify if the requested lesson is unlocked
    if (lessonNumber > 1 && window.BhashaAPI && window.BhashaAPI.isLessonUnlocked) {
        let isCurrentUnlocked = window.BhashaAPI.isLessonUnlocked(subject, lessonNumber);
        if (!isCurrentUnlocked && window.BhashaAPI.getLessonProgress) {
            try {
                const progList = await window.BhashaAPI.getLessonProgress(subject);
                isCurrentUnlocked = window.BhashaAPI.isLessonUnlocked(subject, lessonNumber, progList);
            } catch (_) {}
        }

        if (!isCurrentUnlocked) {
            console.warn(`[lesson.js] Lesson ${lessonNumber} in ${subject} is locked.`);
            if (lockedLessonSection) {
                if (lessonTheory) lessonTheory.classList.add("hidden");
                if (lessonContent) lessonContent.classList.add("hidden");
                if (completion) completion.classList.add("hidden");
                lockedLessonSection.style.display = "block";
                if (lockedSectionMsg) {
                    lockedSectionMsg.textContent = `Chapter ${lessonNumber} is locked. You must complete Chapter ${lessonNumber - 1} first to unlock this lesson.`;
                }
                if (btnGoPrereq) {
                    btnGoPrereq.textContent = `Go to Chapter ${lessonNumber - 1} →`;
                    btnGoPrereq.addEventListener("click", () => {
                        window.location.href = `lesson.html?subject=${encodeURIComponent(subject)}&lesson=${lessonNumber - 1}`;
                    });
                }
                if (btnGoBackCurriculum) {
                    btnGoBackCurriculum.addEventListener("click", () => {
                        window.location.href = `subject.html?subject=${encodeURIComponent(subject)}`;
                    });
                }
                return; // Stop further lesson initialization
            }
        }
    }

    if (totalQuestions) totalQuestions.textContent = questions.length;
    if (progressText) {
        progressText.textContent = lessonAlreadyCompleted
            ? `${questions.length} / ${questions.length}`
            : `0 / ${questions.length}`;
    }
    if (progressFill) {
        progressFill.style.width = lessonAlreadyCompleted ? "100%" : "0%";
    }
    /* =========================
       MODE / TAB SWITCHING
    ========================= */
    function switchMode(mode) {
        if (mode === "theory") {
            if (tabTheory) tabTheory.classList.add("active");
            if (tabQuiz) tabQuiz.classList.remove("active");
            if (lessonTheory) lessonTheory.classList.remove("hidden");
            if (lessonContent) lessonContent.classList.add("hidden");
            if (completion) completion.classList.add("hidden");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (mode === "quiz") {
            if (tabQuiz) tabQuiz.classList.add("active");
            if (tabTheory) tabTheory.classList.remove("active");
            if (lessonTheory) lessonTheory.classList.add("hidden");
            if (lessonAlreadyCompleted) {
                // Show the saved result instead of restarting a completed quiz.
                if (lessonContent) lessonContent.classList.add("hidden");
                if (lessonTheory) lessonTheory.classList.add("hidden");
                if (completion) completion.classList.remove("hidden");
                renderSavedCompletion(savedProgress);
                updateNextLessonButton();
            } else {
                if (lessonContent) lessonContent.classList.remove("hidden");
                if (completion) completion.classList.add("hidden");
                loadQuestion();
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    if (tabTheory) tabTheory.addEventListener("click", () => switchMode("theory"));
    if (tabQuiz) tabQuiz.addEventListener("click", () => switchMode("quiz"));
    if (startQuizBtn) startQuizBtn.addEventListener("click", () => switchMode("quiz"));
    if (reviewTheoryLink) reviewTheoryLink.addEventListener("click", () => switchMode("theory"));

    if (theoryBackBtn) {
        theoryBackBtn.addEventListener("click", () => {
            window.location.href = `subject.html?subject=${encodeURIComponent(subject)}`;
        });
    }

    /* =========================
       QUIZ LOGIC & RENDERING
    ========================= */
    let currentQuestion = 0;
    let score = 0;
    let earnedXP = 0;
    let studentAnswers = [];

    function formatQuestionMarkup(rawText) {
        if (!rawText) return "";
        const escapeHtml = str => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (rawText.includes("\n\n")) {
            const parts = rawText.split("\n\n");
            const heading = escapeHtml(parts[0]);
            const codeBlock = escapeHtml(parts.slice(1).join("\n\n"));
            return `<div class="q-heading">${heading}</div><pre class="question-code-block"><code>${codeBlock}</code></pre>`;
        }
        return escapeHtml(rawText);
    }

    function loadQuestion() {
        const current = questions[currentQuestion];
        if (!current) return;

        if (questionNumber) questionNumber.textContent = currentQuestion + 1;
        if (question) question.innerHTML = formatQuestionMarkup(current.question);
        if (questionDescription) {
            questionDescription.textContent = current.description || "Analyze the code and choose the correct answer.";
        }

        if (progressText) progressText.textContent = `${currentQuestion} / ${questions.length}`;
        const progress = (currentQuestion / questions.length) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;

        if (optionsContainer) {
            optionsContainer.innerHTML = "";
            current.options.forEach((optionText, index) => {
                const button = document.createElement("button");
                button.className = "option";
                button.textContent = optionText;
                button.addEventListener("click", () => selectAnswer(index, button));
                optionsContainer.appendChild(button);
            });
        }

        if (feedback) feedback.classList.add("hidden");
        if (nextBtn) nextBtn.classList.add("hidden");
    }

    function selectAnswer(index, button) {
        studentAnswers[currentQuestion] = index;
        const current = questions[currentQuestion];
        const allOptions = document.querySelectorAll(".option");

        allOptions.forEach(opt => opt.classList.add("disabled"));

        if (index === current.answer) {
            button.classList.add("correct");
            score++;
            earnedXP += 10;
            if (feedbackIcon) feedbackIcon.textContent = "✓";
            if (feedbackTitle) feedbackTitle.textContent = "Brilliant! Correct Analysis 🎉";
            if (feedbackText) feedbackText.textContent = current.explanation || "Accurate understanding of language mechanics.";
        } else {
            button.classList.add("wrong");
            if (allOptions[current.answer]) {
                allOptions[current.answer].classList.add("correct");
            }
            if (feedbackIcon) feedbackIcon.textContent = "✕";
            if (feedbackTitle) feedbackTitle.textContent = "Not quite right!";
            if (feedbackText) feedbackText.textContent = current.explanation || "Review the concept rules above.";
        }

        if (xpElement) xpElement.textContent = earnedXP;
        if (feedback) feedback.classList.remove("hidden");
        if (nextBtn) nextBtn.classList.remove("hidden");
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentQuestion++;
            if (currentQuestion >= questions.length) {
                showCompletion();
            } else {
                loadQuestion();
            }
        });
    }

    function renderSavedCompletion(progressData) {
        const total = Number(progressData?.total) || questions.length;
        const savedScore = Number(progressData?.score) || 0;
        const savedXP = Number(progressData?.xp) || 0;
        const percentage = total > 0 ? Math.round((savedScore / total) * 100) : 0;

        if (accuracy) accuracy.textContent = `${percentage}%`;
        if (progressText) progressText.textContent = `${questions.length} / ${questions.length}`;
        if (progressFill) progressFill.style.width = "100%";
        if (xpElement) xpElement.textContent = savedXP;
        const earnedXpDisplay = document.getElementById("earnedXpDisplay");
        if (earnedXpDisplay) earnedXpDisplay.textContent = `+${savedXP} XP`;
    }

    async function showCompletion() {
        if (lessonContent) lessonContent.classList.add("hidden");
        if (lessonTheory) lessonTheory.classList.add("hidden");
        if (completion) completion.classList.remove("hidden");

        const isPassed = (score / Math.max(1, questions.length)) >= 0.6;
        const progressData = {
            subject: subject,
            lesson: lessonNumber,
            lesson_number: lessonNumber,
            score: score,
            total: questions.length,
            total_questions: questions.length,
            xp: earnedXP,
            xp_earned: earnedXP,
            completed: isPassed
        };
        savedProgress = progressData;
        lessonAlreadyCompleted = Boolean(progressData.completed);

        // 1. Immediately save locally to prevent any progress loss & unlock next lesson instantly
        if (window.BhashaAPI && window.BhashaAPI.saveLocalProgress) {
            window.BhashaAPI.saveLocalProgress(progressData);
        }
        try {
            localStorage.setItem(`bhasha_${subject}_lesson_${lessonNumber}`, JSON.stringify(progressData));
            if (progressData.completed) {
                localStorage.setItem(`bhasha_${subject}_lesson_${lessonNumber}_completed`, "true");
            }
        } catch (_) {}

        renderSavedCompletion(progressData);
        updateNextLessonButton();

        // 2. If user is authenticated, submit to Adaptive Quiz endpoint for server-side evaluation & logging
        if (window.BhashaAPI && window.BhashaAPI.submitAdaptiveQuiz && window.BhashaAPI.isAuthenticated && window.BhashaAPI.isAuthenticated()) {
            try {
                const adaptivePayload = {
                    subject: subject,
                    topic: adaptiveTopic || currentLesson.title,
                    difficulty: adaptiveDifficulty || "Intermediate",
                    lesson_number: lessonNumber,
                    answers: studentAnswers,
                    questions: questions
                };
                const adaptiveResult = await window.BhashaAPI.submitAdaptiveQuiz(adaptivePayload);
                if (adaptiveResult) {
                    if (adaptiveResult.score !== undefined) {
                        score = adaptiveResult.score;
                        progressData.score = score;
                    }
                    if (adaptiveResult.passed !== undefined) {
                        progressData.completed = Boolean(adaptiveResult.passed);
                        lessonAlreadyCompleted = Boolean(progressData.completed);
                    }
                    if (adaptiveResult.xp_earned !== undefined) {
                        earnedXP = adaptiveResult.xp_earned;
                        progressData.xp = earnedXP;
                        progressData.xp_earned = earnedXP;
                    }
                    const feedbackCard = document.getElementById("adaptiveFeedbackCard");
                    const feedbackText = document.getElementById("adaptiveFeedbackText");
                    const nextRecText = document.getElementById("adaptiveNextRec");
                    if (feedbackCard && feedbackText) {
                        feedbackCard.style.display = "block";
                        feedbackText.textContent = adaptiveResult.feedback || "Great performance!";
                        if (nextRecText) {
                            nextRecText.textContent = `⚡ Next Adaptive Level: ${adaptiveResult.next_recommended_difficulty || "Intermediate"}`;
                        }
                    }
                    // Re-sync local storage with server verified scores
                    if (window.BhashaAPI && window.BhashaAPI.saveLocalProgress) {
                        window.BhashaAPI.saveLocalProgress(progressData);
                    }
                    try {
                        localStorage.setItem(`bhasha_${subject}_lesson_${lessonNumber}`, JSON.stringify(progressData));
                        if (progressData.completed) {
                            localStorage.setItem(`bhasha_${subject}_lesson_${lessonNumber}_completed`, "true");
                        }
                    } catch (_) {}
                    renderSavedCompletion(progressData);
                    updateNextLessonButton();
                }
            } catch (adSubmitErr) {
                console.warn("[lesson.js] Adaptive submission note:", adSubmitErr.message);
            }
        }

        // 3. Persist to standard lesson progress backend for lesson unlocking & achievements
        if (window.BhashaAPI && window.BhashaAPI.submitLessonProgress) {
            try {
                await window.BhashaAPI.submitLessonProgress(progressData);
            } catch (e) {
                console.warn("[lesson.js] Could not sync completion to backend:", e.message);
            }
        }

        // Final UI refresh
        updateNextLessonButton();
    }

    /* Next Lesson Button & Navigation */
    const totalLessonsForTrack = (subjectInfo.lessons && subjectInfo.lessons.length) || 8;

    function updateNextLessonButton() {
        if (!nextLessonBtn) return;
        const nextChapter = lessonNumber + 1;

        if (lessonNumber >= totalLessonsForTrack) {
            nextLessonBtn.style.display = "inline-block";
            nextLessonBtn.textContent = "Track Completed! View Curriculum →";
            nextLessonBtn.disabled = false;
            if (nextLessonLockNotice) nextLessonLockNotice.style.display = "none";
            return;
        }

        // Check unlock status for next lesson
        const isCurrentCompleted = Boolean(savedProgress && savedProgress.completed);
        let isNextUnlocked = isCurrentCompleted;
        if (window.BhashaAPI && window.BhashaAPI.isLessonUnlocked) {
            isNextUnlocked = isNextUnlocked || window.BhashaAPI.isLessonUnlocked(subject, nextChapter);
        }

        nextLessonBtn.style.display = "inline-block";
        nextLessonBtn.textContent = `Next Lesson (Chapter ${nextChapter}) →`;

        if (isNextUnlocked) {
            if (nextLessonLockNotice) nextLessonLockNotice.style.display = "none";
            nextLessonBtn.style.background = "linear-gradient(135deg, #1B5E20, #2E7D32)";
            nextLessonBtn.style.color = "#ffffff";
            nextLessonBtn.style.borderColor = "#1B5E20";
            nextLessonBtn.style.cursor = "pointer";
            nextLessonBtn.disabled = false;
        } else {
            nextLessonBtn.style.background = "rgba(100, 116, 139, 0.15)";
            nextLessonBtn.style.color = "#64748b";
            nextLessonBtn.style.borderColor = "rgba(100, 116, 139, 0.3)";
            nextLessonBtn.style.cursor = "not-allowed";
            if (nextLessonLockNotice && nextLessonLockMsg) {
                nextLessonLockNotice.style.display = "block";
                nextLessonLockMsg.textContent = ` Chapter ${nextChapter} is locked. Score at least 60% on Chapter ${lessonNumber} to unlock it.`;
            }
        }
    }
    updateNextLessonButton();

    if (nextLessonBtn) {
        nextLessonBtn.addEventListener("click", (e) => {
            if (e && e.preventDefault) e.preventDefault();
            const nextChapter = lessonNumber + 1;

            if (lessonNumber >= totalLessonsForTrack) {
                window.location.href = `subject.html?subject=${encodeURIComponent(subject)}`;
                return;
            }

            const isCurrentCompleted = Boolean(savedProgress && savedProgress.completed);
            let isNextUnlocked = isCurrentCompleted;
            if (window.BhashaAPI && window.BhashaAPI.isLessonUnlocked) {
                isNextUnlocked = isNextUnlocked || window.BhashaAPI.isLessonUnlocked(subject, nextChapter);
            }

            if (isNextUnlocked) {
                window.location.href = `lesson.html?subject=${encodeURIComponent(subject)}&lesson=${nextChapter}`;
            } else {
                if (nextLessonLockNotice && nextLessonLockMsg) {
                    nextLessonLockNotice.style.display = "block";
                    nextLessonLockMsg.textContent = ` Chapter ${nextChapter} is locked. Score at least 60% on Chapter ${lessonNumber} to unlock it.`;
                    if (nextLessonLockNotice.scrollIntoView) {
                        nextLessonLockNotice.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                } else {
                    alert(`Chapter ${nextChapter} is locked. Please complete Chapter ${lessonNumber} first.`);
                }
            }
        });
    }

    /* Navigation */
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            window.location.href = `subject.html?subject=${encodeURIComponent(subject)}`;
        });
    }

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = `subject.html?subject=${encodeURIComponent(subject)}`;
        });
    }

});
