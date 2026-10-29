"""
Comprehensive W3Schools-aligned curriculum data for Python, Java, and C++.
Each track has 8 structured chapters/lessons with 5 high-level, code-analytical questions.
"""

CURRICULUM = {
    "Python": {
        "icon": "🐍",
        "description": "Master Python from foundational syntax to object-oriented architecture and advanced data structures.",
        "lessons": [
            {
                "lesson_number": 1,
                "title": "Python Syntax, Indentation & Variable Scope",
                "description": "Understand lexical scoping, PEP 8 indentation, variable reassignment, and dynamic typing.",
                "questions": [
                    {
                        "question_text": "What is the output of the following code snippet?\n\nx = 10\ndef modify():\n    global x\n    x = 25\n    y = x + 5\nmodify()\nprint(x)",
                        "description": "Analyze variable scope and the global keyword.",
                        "options": ["10", "25", "30", "UnboundLocalError"],
                        "answer_index": 1,
                        "explanation": "The global keyword explicitly binds the local variable 'x' inside modify() to the global scope. Reassigning x = 25 alters the global variable, so print(x) prints 25."
                    },
                    {
                        "question_text": "What will occur when executing this Python statement?\n\na, *b, c = [1, 2, 3, 4, 5]\nprint(b)",
                        "description": "Evaluate extended iterable unpacking.",
                        "options": ["[2, 3, 4]", "(2, 3, 4)", "[1, 2, 3, 4]", "ValueError: too many values to unpack"],
                        "answer_index": 0,
                        "explanation": "Extended unpacking captures the first element into 'a' (1), the last element into 'c' (5), and packs all intermediary elements into a list 'b' ([2, 3, 4])."
                    },
                    {
                        "question_text": "Consider the variable assignment below. What does id(a) == id(b) evaluate to in Python?\n\na = [1, 2, 3]\nb = a\nb.append(4)",
                        "description": "Identify object referencing vs copying.",
                        "options": ["True, because b references the same object in memory as a", "False, because appending creates a new object for b", "False, because lists are immutable", "SyntaxError"],
                        "answer_index": 0,
                        "explanation": "In Python, assigning a list to a new variable (b = a) assigns a reference to the existing list object, not a shallow copy. Modifying b mutates the object that both a and b point to."
                    },
                    {
                        "question_text": "Which of the following causes an IndentationError according to Python PEP 8 standards?",
                        "description": "Determine strict Python indentation requirements.",
                        "options": [
                            "Mixing 4 spaces and hard tabs on indented blocks in Python 3",
                            "Using 2 spaces instead of 4 consistently throughout a block",
                            "Leaving blank lines inside a function body",
                            "Placing a docstring on line 1 of a module"
                        ],
                        "answer_index": 0,
                        "explanation": "Python 3 disallows mixing tabs and spaces for indentation within the same block, raising an IndentationError (or TabError)."
                    },
                    {
                        "question_text": "What is the result of evaluating: type(lambda x: x * 2)?",
                        "description": "Inspect callable type metadata.",
                        "options": ["<class 'function'>", "<class 'lambda'>", "<class 'method'>", "<class 'generator'>"],
                        "answer_index": 0,
                        "explanation": "In Python, anonymous lambda expressions are instances of the standard first-class 'function' class, identical to functions defined with 'def'."
                    }
                ]
            },
            {
                "lesson_number": 2,
                "title": "Data Types, Numbers & Type Casting",
                "description": "Explore floating-point representation, integer truncation, complex numbers, and explicit type conversion.",
                "questions": [
                    {
                        "question_text": "What is the exact result of the following expression in Python 3?\n\nval = 7 // 2 + 7 % 2\nprint(val)",
                        "description": "Analyze floor division and modulo arithmetic.",
                        "options": ["4", "4.5", "3", "3.5"],
                        "answer_index": 0,
                        "explanation": "7 // 2 performs floor division yielding integer 3. 7 % 2 calculates remainder 1. 3 + 1 = 4."
                    },
                    {
                        "question_text": "What does the expression bool([]) == bool([False]) return?",
                        "description": "Assess truthy and falsy value conversions.",
                        "options": [
                            "False, because [] is empty (falsy) while [False] contains an element (truthy)",
                            "True, because both evaluate to False",
                            "True, because [False] contains a falsy element",
                            "TypeError: unhashable type list"
                        ],
                        "answer_index": 0,
                        "explanation": "In Python, empty collections (like []) evaluate to False in a boolean context, whereas non-empty collections (even containing False) evaluate to True. Thus bool([]) is False and bool([False]) is True."
                    },
                    {
                        "question_text": "What is the output of converting float('inf') > float('1e308') in Python?",
                        "description": "Evaluate special IEEE floating-point representations.",
                        "options": ["True", "False", "OverflowError", "ValueError"],
                        "answer_index": 0,
                        "explanation": "float('inf') represents positive infinity, which is greater than any finite floating-point number, including 1e308."
                    },
                    {
                        "question_text": "What does int('1010', 2) return?",
                        "description": "Understand radix-based integer type casting.",
                        "options": ["10", "1010", "12", "ValueError"],
                        "answer_index": 0,
                        "explanation": "Passing a base argument of 2 to int() parses the string as a binary integer: 1*8 + 0*4 + 1*2 + 0*1 = 10."
                    },
                    {
                        "question_text": "What is the type of variable 'z' in: z = 3 + 4j?",
                        "description": "Identify Python built-in numeric primitives.",
                        "options": ["complex", "float", "tuple", "imaginary"],
                        "answer_index": 0,
                        "explanation": "Python natively supports complex numbers with real and imaginary parts denoted by the 'j' suffix, typed as <class 'complex'>."
                    }
                ]
            },
            {
                "lesson_number": 3,
                "title": "Operators, Booleans & Advanced String Slicing",
                "description": "Master slicing steps, identity vs equality, short-circuit operators, and format specifiers.",
                "questions": [
                    {
                        "question_text": "What is the output of the following string slice?\n\ntext = 'BhashaAcademy'\nprint(text[1:8:2])",
                        "description": "Determine stride slicing behavior.",
                        "options": ["hshA", "hsaa", "BahA", "hshAc"],
                        "answer_index": 0,
                        "explanation": "Indices 1 through 7 (stop 8 is exclusive) are: index 1='h', index 3='s', index 5='h', index 7='A'. Result is 'hshA'."
                    },
                    {
                        "question_text": "What does the expression (0 or 'default') and ('data' or 'backup') evaluate to?",
                        "description": "Trace short-circuit logical operators.",
                        "options": ["'data'", "'default'", "True", "'backup'"],
                        "answer_index": 0,
                        "explanation": "0 is falsy, so (0 or 'default') evaluates to 'default'. In ('data' or 'backup'), 'data' is truthy, yielding 'data'. Finally, ('default' and 'data') returns the second operand 'data'."
                    },
                    {
                        "question_text": "What will this print in Python?\n\ns1 = 'hello world'\ns2 = 'hello world'\nprint(s1 == s2, s1 is s2)",
                        "description": "Examine string value equality vs memory identity.",
                        "options": [
                            "True True (or True False depending on string interning/runtime)",
                            "False False always",
                            "False True",
                            "SyntaxError"
                        ],
                        "answer_index": 0,
                        "explanation": "s1 == s2 is always True because their contents match. s1 is s2 checks identity; for short compile-time literals without special characters it may be interned, but 'is' should not be used for content equality."
                    },
                    {
                        "question_text": "How do you format a float pi = 3.1415926 to two decimal places using f-strings?",
                        "description": "Utilize modern f-string format specifications.",
                        "options": ["f'{pi:.2f}'", "f'{pi:2d}'", "f'{round(pi, 2)}:float'", "f'{pi % 2}'"],
                        "answer_index": 0,
                        "explanation": "The format specifier ':.2f' specifies floating-point representation rounded to 2 decimal digits."
                    },
                    {
                        "question_text": "What is the result of 'abc' * 0?",
                        "description": "Test string sequence multiplication edge cases.",
                        "options": ["'' (empty string)", "None", "'abc'", "ValueError"],
                        "answer_index": 0,
                        "explanation": "Multiplying a sequence by zero or any negative integer in Python produces an empty sequence of that type, here an empty string ''."
                    }
                ]
            },
            {
                "lesson_number": 4,
                "title": "Conditionals & Structural Pattern Matching",
                "description": "Implement branching logic, ternary expressions, and Python 3.10+ match-case patterns.",
                "questions": [
                    {
                        "question_text": "What is the value of 'status' after executing this line?\n\nage = 17\nstatus = 'Adult' if age >= 18 else 'Minor' if age >= 13 else 'Child'",
                        "description": "Trace nested ternary conditional expressions.",
                        "options": ["'Minor'", "'Adult'", "'Child'", "SyntaxError"],
                        "answer_index": 0,
                        "explanation": "age >= 18 is False (17 < 18), so the first 'else' branch executes: 'Minor' if age >= 13 else 'Child'. Since 17 >= 13 is True, it resolves to 'Minor'."
                    },
                    {
                        "question_text": "In Python 3.10+, which keyword acts as the wildcard catch-all case in a match statement?\n\nmatch command:\n    case 'start': run()\n    case 'stop': halt()\n    case ______: unknown()",
                        "description": "Identify wildcard syntax in structural pattern matching.",
                        "options": ["_", "default", "*", "else"],
                        "answer_index": 0,
                        "explanation": "In Python's match-case construct, the underscore '_' is the wildcard pattern that matches any value not matched by preceding cases."
                    },
                    {
                        "question_text": "What will be printed by the following conditional block?\n\nval = []\nif val:\n    print('A')\nelif val == False:\n    print('B')\nelse:\n    print('C')",
                        "description": "Distinguish between falsy evaluation and boolean equality.",
                        "options": ["'C'", "'A'", "'B'", "'B' and 'C'"],
                        "answer_index": 0,
                        "explanation": "bool([]) is False, so 'if val:' does not execute. However, [] == False is False because a list is not equal to a boolean. Hence the 'else' block executes, printing 'C'."
                    },
                    {
                        "question_text": "What does this chained comparison evaluate to?\n\nprint(1 < 3 > 2 == 2 < 5)",
                        "description": "Understand chained relational operators in Python.",
                        "options": ["True", "False", "SyntaxError", "TypeError"],
                        "answer_index": 0,
                        "explanation": "Python expands chained comparisons into conjunctions: (1 < 3) and (3 > 2) and (2 == 2) and (2 < 5). All conditions evaluate to True, so the expression yields True."
                    },
                    {
                        "question_text": "Which statement about the 'pass' keyword in an if block is correct?",
                        "description": "Clarify null-operation syntactic placeholders.",
                        "options": [
                            "It serves as a syntactic placeholder when a statement is required but no code is to be executed",
                            "It terminates the loop containing the if statement",
                            "It returns None from the surrounding function immediately",
                            "It causes the interpreter to skip evaluating subsequent elif blocks"
                        ],
                        "answer_index": 0,
                        "explanation": "The 'pass' statement is a null operation; nothing happens when it executes. It is used as a placeholder in compound statements where code is syntactically expected."
                    }
                ]
            },
            {
                "lesson_number": 5,
                "title": "Loops, Iterators & Comprehensions",
                "description": "Understand loop else clauses, range boundaries, generator expressions, and iteration control.",
                "questions": [
                    {
                        "question_text": "What does the following loop print?\n\nfor i in range(3):\n    if i == 5:\n        break\nelse:\n    print('Completed')",
                        "description": "Analyze the execution rule of the loop 'else' clause.",
                        "options": ["'Completed'", "Nothing", "0 1 2 'Completed'", "SyntaxError"],
                        "answer_index": 0,
                        "explanation": "In Python, the 'else' clause of a for or while loop executes when the loop finishes iterating naturally without being interrupted by a 'break' statement."
                    },
                    {
                        "question_text": "What is the output of the following list comprehension?\n\nres = [x * 2 for x in range(6) if x % 2 == 0]\nprint(res)",
                        "description": "Evaluate filtered list comprehensions.",
                        "options": ["[0, 4, 8]", "[0, 2, 4, 6, 8, 10]", "[4, 8]", "[0, 2, 4]"],
                        "answer_index": 0,
                        "explanation": "range(6) produces 0, 1, 2, 3, 4, 5. Even numbers (x % 2 == 0) are 0, 2, 4. Multiplying by 2 produces [0, 4, 8]."
                    },
                    {
                        "question_text": "What happens when you modify a list while iterating over it with a for loop?\n\nnums = [1, 2, 3, 4]\nfor n in nums:\n    if n == 2:\n        nums.remove(n)\nprint(nums)",
                        "description": "Spot index shifting side effects during in-place list mutation.",
                        "options": ["[1, 3, 4] but 3 is skipped during iteration", "[1, 3, 4] with all elements checked", "RuntimeError: list modified during iteration", "[1, 2, 4]"],
                        "answer_index": 0,
                        "explanation": "Removing an item shifts remaining items left. The iterator's index counter advances to 2, causing it to skip element 3. While it doesn't throw a RuntimeError for lists, it leads to logical bugs."
                    },
                    {
                        "question_text": "What does list(range(10, 0, -3)) produce?",
                        "description": "Verify negative step range sequence generation.",
                        "options": ["[10, 7, 4, 1]", "[10, 7, 4, 1, -2]", "[10, 8, 6, 4, 2]", "[]"],
                        "answer_index": 0,
                        "explanation": "Starting at 10, decrementing by 3 while > 0 yields: 10, 7, 4, 1. The next step would be -2, which falls below the stop bound of 0."
                    },
                    {
                        "question_text": "What is the primary memory difference between [x for x in range(1000000)] and (x for x in range(1000000))?",
                        "description": "Distinguish list comprehensions from generator expressions.",
                        "options": [
                            "The list allocates all 1,000,000 integers in memory at once, while the generator yields items lazily on-demand",
                            "The generator is faster for random access indexing than the list",
                            "The list is immutable while the generator is mutable",
                            "There is no difference; parentheses create a tuple list"
                        ],
                        "answer_index": 0,
                        "explanation": "List comprehensions construct the entire list in memory immediately. Generator expressions (in parentheses) produce a generator object that yields elements lazily one by one, using minimal memory."
                    }
                ]
            },
            {
                "lesson_number": 6,
                "title": "Functions, *args, **kwargs & Scope",
                "description": "Learn parameter passing, default argument pitfalls, variable arguments, and closures.",
                "questions": [
                    {
                        "question_text": "What is the classic output of this infamous Python function?\n\ndef append_item(val, target=[]):\n    target.append(val)\n    return target\n\nprint(append_item(1))\nprint(append_item(2))",
                        "description": "Identify the mutable default argument trap.",
                        "options": ["[1] then [1, 2]", "[1] then [2]", "[1, 2] then [1, 2]", "TypeError"],
                        "answer_index": 0,
                        "explanation": "Default arguments in Python are evaluated once at function definition time, not every time the function is called. The same list instance 'target' persists across calls."
                    },
                    {
                        "question_text": "How does Python handle a function defined as:\n\ndef compute(a, b, /, c, *, d):\n    return a + b + c + d",
                        "description": "Interpret positional-only (/) and keyword-only (*) parameter markers.",
                        "options": [
                            "'a' and 'b' must be positional-only; 'd' must be keyword-only",
                            "'c' is keyword-only; 'd' is positional-only",
                            "'/' denotes division in parameters; '*' denotes multiplication",
                            "SyntaxError in Python 3.8+"
                        ],
                        "answer_index": 0,
                        "explanation": "In Python 3.8+, parameters before '/' are positional-only. Parameters after '*' are keyword-only. Parameters between '/' and '*' can be passed positionally or by keyword."
                    },
                    {
                        "question_text": "What is the output of the following lambda with map()?\n\nnums = [1, 2, 3, 4]\nres = list(map(lambda x: x**2 if x % 2 == 0 else -x, nums))\nprint(res)",
                        "description": "Evaluate higher-order functions combined with lambda expressions.",
                        "options": ["[-1, 4, -3, 16]", "[1, 4, 3, 16]", "[-1, -2, -3, -4]", "[0, 4, 0, 16]"],
                        "answer_index": 0,
                        "explanation": "For 1: odd -> -1. For 2: even -> 2**2 = 4. For 3: odd -> -3. For 4: even -> 4**2 = 16. Result is [-1, 4, -3, 16]."
                    },
                    {
                        "question_text": "What does *args and **kwargs pack incoming arguments into?",
                        "description": "Identify underlying data structures for variable parameters.",
                        "options": [
                            "*args packs into a tuple, **kwargs packs into a dict",
                            "*args packs into a list, **kwargs packs into a tuple",
                            "Both pack into dictionaries",
                            "Both pack into immutable sets"
                        ],
                        "answer_index": 0,
                        "explanation": "*args collects excess positional arguments into an immutable tuple. **kwargs collects excess keyword arguments into a standard dictionary."
                    },
                    {
                        "question_text": "What happens when you return multiple comma-separated values from a Python function: return x, y, z?",
                        "description": "Understand implicit tuple packing in returns.",
                        "options": [
                            "Python packs them into a single tuple (x, y, z)",
                            "Only the last value 'z' is returned",
                            "A list [x, y, z] is created",
                            "A syntax error is raised unless parentheses are included"
                        ],
                        "answer_index": 0,
                        "explanation": "In Python, comma-separated expressions without enclosing brackets default to tuple packing. Hence 'return x, y, z' returns the tuple '(x, y, z)'."
                    }
                ]
            },
            {
                "lesson_number": 7,
                "title": "Collections: Lists, Tuples, Sets & Dictionaries",
                "description": "Examine mutability, hashing, dictionary retrieval methods, and set algebraic operations.",
                "questions": [
                    {
                        "question_text": "What will d.get('key', 'default') do if 'key' does not exist in dictionary d?",
                        "description": "Analyze safe dictionary key retrieval.",
                        "options": [
                            "Returns 'default' without modifying d or raising a KeyError",
                            "Raises a KeyError exception",
                            "Inserts 'key': 'default' into dictionary d and returns 'default'",
                            "Returns None"
                        ],
                        "answer_index": 0,
                        "explanation": "The dict.get(key, default) method safely retrieves a value. If the key is absent, it returns the provided fallback without mutating the dictionary, unlike dict.setdefault()."
                    },
                    {
                        "question_text": "Which of the following can be safely used as a dictionary key in Python?",
                        "description": "Identify requirements for hashable types.",
                        "options": [
                            "(1, 2, 'apple')",
                            "[1, 2, 'apple']",
                            "{'id': 101}",
                            "{1, 2, 3}"
                        ],
                        "answer_index": 0,
                        "explanation": "Dictionary keys must be hashable and immutable. Tuples containing only immutable objects are hashable. Lists, sets, and dicts are mutable and unhashable."
                    },
                    {
                        "question_text": "What is the result of set union and intersection on sets a = {1, 2, 3} and b = {3, 4, 5}?\n\nprint(a ^ b)",
                        "description": "Identify set operators and symmetric difference.",
                        "options": ["{1, 2, 4, 5}", "{3}", "{1, 2, 3, 4, 5}", "TypeError"],
                        "answer_index": 0,
                        "explanation": "The caret '^' operator computes symmetric difference (elements in either set a or set b, but not in both). {1, 2, 3} ^ {3, 4, 5} = {1, 2, 4, 5}."
                    },
                    {
                        "question_text": "What happens when you run this code?\n\ntup = (1, [2, 3], 4)\ntup[1].append(99)\nprint(tup)",
                        "description": "Evaluate tuple immutability containing mutable references.",
                        "options": [
                            "(1, [2, 3, 99], 4)",
                            "TypeError: 'tuple' object does not support item assignment",
                            "(1, [2, 3], 4)",
                            "SyntaxError"
                        ],
                        "answer_index": 0,
                        "explanation": "Tuples are immutable in that their references cannot be reassigned. However, mutable objects stored within a tuple (like the list at index 1) can still be mutated in place."
                    },
                    {
                        "question_text": "What does dict comprehension {x: x**2 for x in (2, 4, 6)} generate?",
                        "description": "Test dictionary comprehension generation.",
                        "options": ["{2: 4, 4: 16, 6: 36}", "[(2, 4), (4, 16), (6, 36)]", "{4, 16, 36}", "{2, 4, 6: 4, 16, 36}"],
                        "answer_index": 0,
                        "explanation": "A dictionary comprehension maps each key to its computed value: {2: 4, 4: 16, 6: 36}."
                    }
                ]
            },
            {
                "lesson_number": 8,
                "title": "OOP: Classes, Inheritance & Dunder Methods",
                "description": "Master object-oriented programming, class vs instance state, method overriding, and super().",
                "questions": [
                    {
                        "question_text": "What is the output of the following class hierarchy?\n\nclass Parent:\n    def speak(self):\n        return 'Parent'\n\nclass Child(Parent):\n    def speak(self):\n        return super().speak() + ' -> Child'\n\nc = Child()\nprint(c.speak())",
                        "description": "Analyze method resolution and super() dispatch.",
                        "options": ["Parent -> Child", "Child", "Parent", "AttributeError"],
                        "answer_index": 0,
                        "explanation": "Child overrides speak(), calls super().speak() which resolves to Parent's speak() returning 'Parent', and concatenates ' -> Child'."
                    },
                    {
                        "question_text": "What does a variable declared inside a class body, outside any method, represent?\n\nclass Account:\n    bank_name = 'Royal Academy'",
                        "description": "Differentiate class variables from instance variables.",
                        "options": [
                            "A class variable shared across all instances of Account",
                            "A private instance variable unique to each object",
                            "A constant that cannot be altered",
                            "A local variable inaccessible outside class definition"
                        ],
                        "answer_index": 0,
                        "explanation": "Variables defined directly in the class body are class attributes (shared by all instances), accessible via Account.bank_name or self.bank_name."
                    },
                    {
                        "question_text": "How does name mangling work in Python when prefixing an attribute with double underscores, e.g. self.__balance?",
                        "description": "Understand Python private variable naming conventions.",
                        "options": [
                            "Python internally rewrites it as _ClassName__balance to prevent accidental override in subclasses",
                            "It makes the variable strictly inaccessible by the operating system kernel",
                            "It encrypts the memory address of the variable",
                            "It converts the variable into a read-only property"
                        ],
                        "answer_index": 0,
                        "explanation": "Python does not have true access-modifier enforcement; instead, prefixing with double underscores mangles the name to '_ClassName__attribute' to prevent name collisions in subclasses."
                    },
                    {
                        "question_text": "What special dunder method is invoked when print(obj) or str(obj) is called on an instance?",
                        "description": "Identify string representation dunder methods.",
                        "options": ["__str__(self)", "__repr__(self)", "__print__(self)", "__display__(self)"],
                        "answer_index": 0,
                        "explanation": "__str__(self) is invoked by str() and print() to produce an informal, readable string representation of the object. (__repr__ is the formal fallback)."
                    },
                    {
                        "question_text": "What will isinstance(True, int) return in Python?",
                        "description": "Explore Python's class inheritance tree for primitive booleans.",
                        "options": [
                            "True, because bool is a direct subclass of int in Python",
                            "False, because bool and int are completely separate primitive types",
                            "TypeError: invalid class comparison",
                            "False, because booleans only store logical values"
                        ],
                        "answer_index": 0,
                        "explanation": "In Python, bool is historically and structurally a subclass of int. True has the integer value 1, and isinstance(True, int) is True."
                    }
                ]
            }
        ]
    },

    "Java": {
        "icon": "☕",
        "description": "Master enterprise Java programming, strong static typing, JVM execution, and OOP paradigms.",
        "lessons": [
            {
                "lesson_number": 1,
                "title": "Java Syntax, Output & JVM Entrypoint",
                "description": "Understand public static void main, System.out streams, compilation model, and class structure.",
                "questions": [
                    {
                        "question_text": "Why must the main method in Java be declared as 'static'?\n\npublic static void main(String[] args)",
                        "description": "Analyze JVM bootstrapping and static execution.",
                        "options": [
                            "To allow the JVM to invoke it without having to instantiate the class first",
                            "Because static methods run faster than non-static methods",
                            "To prevent the method from being overloaded",
                            "Because Java does not support constructors for the entrypoint class"
                        ],
                        "answer_index": 0,
                        "explanation": "The JVM needs to call main() before any objects of the class are created. Declaring it static allows execution directly via ClassName.main()."
                    },
                    {
                        "question_text": "What is the output of the following Java print statements?\n\nSystem.out.print(\"A\");\nSystem.out.println(\"B\");\nSystem.out.print(\"C\");",
                        "description": "Differentiate System.out.print from System.out.println.",
                        "options": [
                            "AB on line 1, and C on line 2",
                            "A on line 1, B on line 2, C on line 3",
                            "A B C on a single line",
                            "Compilation error"
                        ],
                        "answer_index": 0,
                        "explanation": "print(\"A\") prints 'A' without a newline. println(\"B\") prints 'B' and appends a newline. Then print(\"C\") prints 'C' on the next line."
                    },
                    {
                        "question_text": "What is the extension of the compiled bytecode file generated by javac for a class named Academy?",
                        "description": "Understand Java source code compilation.",
                        "options": [".class", ".java", ".jvm", ".jar"],
                        "answer_index": 0,
                        "explanation": "The javac compiler compiles Java source code (.java) into platform-independent bytecode saved as .class files."
                    },
                    {
                        "question_text": "Which of the following is a valid identifier name in Java?",
                        "description": "Verify Java identifier naming rules.",
                        "options": ["_userCount$2", "2userCount", "user-count", "class"],
                        "answer_index": 0,
                        "explanation": "Java identifiers can start with a letter, currency character ($), or underscore (_). They cannot start with a digit, contain hyphens, or match reserved keywords like 'class'."
                    },
                    {
                        "question_text": "What happens if a Java source file has multiple public classes?",
                        "description": "Assess file naming and class visibility constraints.",
                        "options": [
                            "Compile-time error: a Java file can contain at most one public class, matching the filename",
                            "The compiler compiles each into separate directories",
                            "Only the first public class is accessible",
                            "It compiles successfully if package-private"
                        ],
                        "answer_index": 0,
                        "explanation": "In Java, each compilation unit (.java file) can contain at most one top-level public class, and the filename must match that public class name."
                    }
                ]
            },
            {
                "lesson_number": 2,
                "title": "Variables, Data Types & Type Casting",
                "description": "Explore primitive vs reference types, widening/narrowing casting, and memory boundaries.",
                "questions": [
                    {
                        "question_text": "What is the result of executing this code in Java?\n\nbyte b = 127;\nb++;\nSystem.out.println(b);",
                        "description": "Analyze primitive integer overflow and byte wraparound.",
                        "options": ["-128", "128", "Compilation error: type mismatch", "ArithmeticException"],
                        "answer_index": 0,
                        "explanation": "A signed byte in Java has a range from -128 to 127. Incrementing 127 causes integer overflow, wrapping around to -128 in two's complement representation."
                    },
                    {
                        "question_text": "What will this expression produce in Java?\n\ndouble d = 9.99;\nint i = (int) d;\nSystem.out.println(i);",
                        "description": "Evaluate explicit narrowing type casting.",
                        "options": ["9 (truncated towards zero)", "10 (rounded up)", "9.99", "Compilation error"],
                        "answer_index": 0,
                        "explanation": "Explicit narrowing conversion from floating-point to integer truncates the fractional part towards zero, yielding 9."
                    },
                    {
                        "question_text": "Which of the following is NOT a primitive data type in Java?",
                        "description": "Distinguish primitive types from reference types.",
                        "options": ["String", "boolean", "float", "char"],
                        "answer_index": 0,
                        "explanation": "Java has 8 primitive types: byte, short, int, long, float, double, boolean, and char. String is a reference type (a class)."
                    },
                    {
                        "question_text": "What is the default value of an uninitialized instance variable of type boolean in Java?",
                        "description": "Identify default field values.",
                        "options": ["false", "true", "null", "0"],
                        "answer_index": 0,
                        "explanation": "In Java, instance and static fields of boolean type default to false. (Local variables inside methods must be explicitly initialized before use)."
                    },
                    {
                        "question_text": "What is the size of an int primitive in Java across all operating systems?",
                        "description": "Verify Java's 'write once, run anywhere' platform independence.",
                        "options": ["32 bits (4 bytes)", "16 bits on 32-bit OS, 32 bits on 64-bit OS", "64 bits (8 bytes)", "Varies by JVM vendor"],
                        "answer_index": 0,
                        "explanation": "Java defines the size of all primitive types strictly in the language specification: int is always exactly 32 bits (4 bytes), signed, two's complement."
                    }
                ]
            },
            {
                "lesson_number": 3,
                "title": "Operators & Strings (Immutability & String Pool)",
                "description": "Master String pool behavior, reference equality vs equals(), and concatenation semantics.",
                "questions": [
                    {
                        "question_text": "What will be printed by the following code?\n\nString s1 = \"Bhasha\";\nString s2 = new String(\"Bhasha\");\nSystem.out.println((s1 == s2) + \" \" + s1.equals(s2));",
                        "description": "Examine the Java String Constant Pool vs heap allocation.",
                        "options": ["false true", "true true", "false false", "true false"],
                        "answer_index": 0,
                        "explanation": "s1 points to the String pool, while s2 explicitly creates a new object on the heap. '==' compares memory references (false), whereas .equals() compares character content (true)."
                    },
                    {
                        "question_text": "What does the following snippet print?\n\nSystem.out.println(10 + 20 + \"Java\" + 10 + 20);",
                        "description": "Trace operator precedence and string concatenation associativity.",
                        "options": ["30Java1020", "1020Java1020", "30Java30", "Compilation error"],
                        "answer_index": 0,
                        "explanation": "Evaluation is left-to-right: 10 + 20 = 30 (integer addition). 30 + \"Java\" = \"30Java\" (string concatenation). \"30Java\" + 10 = \"30Java10\". \"30Java10\" + 20 = \"30Java1020\"."
                    },
                    {
                        "question_text": "Why are String objects immutable in Java?",
                        "description": "Analyze architectural design of Java Strings.",
                        "options": [
                            "For security, synchronization thread-safety, and string pool memory efficiency",
                            "Because Java lacks pointer manipulation support",
                            "To prevent them from being used in HashMaps",
                            "Because all reference types in Java are immutable"
                        ],
                        "answer_index": 0,
                        "explanation": "String immutability allows String pooling (saving heap memory), provides thread safety without synchronization, and protects sensitive parameters like network ports or file paths."
                    },
                    {
                        "question_text": "What is the return value of \"Programming\".substring(3, 7)?",
                        "description": "Inspect substring index boundaries.",
                        "options": ["\"gram\"", "\"prog\"", "\"gramm\"", "\"gra\""],
                        "answer_index": 0,
                        "explanation": "String.substring(beginIndex, endIndex) includes beginIndex (3) and excludes endIndex (7). Index 3='g', 4='r', 5='a', 6='m', giving 'gram'."
                    },
                    {
                        "question_text": "Which class should you use if you need thread-safe, mutable character sequences in Java?",
                        "description": "Differentiate StringBuffer from StringBuilder.",
                        "options": ["StringBuffer", "StringBuilder", "String", "CharArray"],
                        "answer_index": 0,
                        "explanation": "StringBuffer is synchronized and thread-safe. StringBuilder is unsynchronized (faster, but not thread-safe). String is immutable."
                    }
                ]
            },
            {
                "lesson_number": 4,
                "title": "Decision Making: if...else & Switch Statements",
                "description": "Implement multi-branch decision structures, switch fallthrough rules, and pattern matching.",
                "questions": [
                    {
                        "question_text": "What is the output of the following switch snippet?\n\nint code = 2;\nswitch (code) {\n    case 1: System.out.print(\"1 \");\n    case 2: System.out.print(\"2 \");\n    case 3: System.out.print(\"3 \");\n    default: System.out.print(\"D\");\n}",
                        "description": "Identify switch fallthrough when break statements are omitted.",
                        "options": ["2 3 D", "2", "2 3", "Compilation error"],
                        "answer_index": 0,
                        "explanation": "Because case 2 lacks a 'break' statement, execution falls through all subsequent cases (case 3 and default), printing '2 3 D'."
                    },
                    {
                        "question_text": "Which of the following types CANNOT be used in a standard Java switch expression?",
                        "description": "Identify valid switch expression types.",
                        "options": ["float / double", "int / byte / short / char", "String", "enum types"],
                        "answer_index": 0,
                        "explanation": "Java switch statements do not support floating-point types (float, double) or boolean due to rounding and precision issues. Integral types, String, and enum are supported."
                    },
                    {
                        "question_text": "What does the ternary expression evaluate to?\n\nint x = 5;\nString out = (x > 3) ? (x < 10 ? \"In Range\" : \"High\") : \"Low\";\nSystem.out.println(out);",
                        "description": "Evaluate nested ternary expressions.",
                        "options": ["\"In Range\"", "\"High\"", "\"Low\"", "Compilation error"],
                        "answer_index": 0,
                        "explanation": "x > 3 is True (5 > 3), so the first branch (x < 10 ? \"In Range\" : \"High\") evaluates. Since 5 < 10 is True, it returns 'In Range'."
                    },
                    {
                        "question_text": "What is the consequence of writing 'if (x = true)' instead of 'if (x == true)' in Java when x is boolean?",
                        "description": "Spot assignment inside conditional expressions.",
                        "options": [
                            "It assigns true to x and evaluates the condition to true",
                            "It causes a compilation error because assignment cannot be used in an if statement",
                            "It checks equality and ignores the assignment",
                            "It throws an IllegalArgumentException"
                        ],
                        "answer_index": 0,
                        "explanation": "In Java, an assignment expression evaluates to the assigned value. Since x is a boolean, (x = true) evaluates to the boolean value 'true', compiling and entering the if block."
                    },
                    {
                        "question_text": "What is the purpose of the 'default' branch in a switch statement?",
                        "description": "Clarify default fallback handling.",
                        "options": [
                            "It executes when none of the case constants match the evaluated expression",
                            "It is mandatory in every switch block or code won't compile",
                            "It must always be placed at the very top of the switch block",
                            "It resets the switch variable to null"
                        ],
                        "answer_index": 0,
                        "explanation": "The 'default' label is optional and specifies the code to execute if no explicit case match is found."
                    }
                ]
            },
            {
                "lesson_number": 5,
                "title": "Loops: while, do...while, for & for-each",
                "description": "Trace pre/post test loops, enhanced for-each iteration, and labeled break/continue.",
                "questions": [
                    {
                        "question_text": "What is guaranteed about a do-while loop compared to a standard while loop in Java?",
                        "description": "Differentiate entry-condition vs exit-condition loops.",
                        "options": [
                            "The body of a do-while loop always executes at least once before testing the condition",
                            "A do-while loop runs faster because it bypasses condition checks",
                            "A do-while loop cannot use the break keyword",
                            "A do-while loop executes only when the condition is initially false"
                        ],
                        "answer_index": 0,
                        "explanation": "A do-while loop tests its condition at the bottom of the loop; therefore, the loop body is guaranteed to execute at least once."
                    },
                    {
                        "question_text": "What will be printed by this nested loop with a labeled break?\n\nouter:\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (i == 1 && j == 1) break outer;\n        System.out.print(i + \"\" + j + \" \");\n    }\n}",
                        "description": "Trace labeled break statements in nested loops.",
                        "options": ["00 01 02 10 ", "00 01 02 10 11 ", "00 01 02 ", "00 01 02 10 12 20 21 22 "],
                        "answer_index": 0,
                        "explanation": "When i=0: prints 00 01 02. When i=1, j=0: prints 10. When i=1, j=1: 'break outer' breaks entirely out of the outer loop. Result is '00 01 02 10 '."
                    },
                    {
                        "question_text": "What happens if you attempt to remove an element directly from a list while iterating using an enhanced for-each loop?\n\nfor (String item : list) { list.remove(item); }",
                        "description": "Recognize fail-fast iterator behavior.",
                        "options": [
                            "ConcurrentModificationException is thrown at runtime",
                            "The element is removed smoothly",
                            "IndexOutOfBoundsException is thrown",
                            "Compilation error"
                        ],
                        "answer_index": 0,
                        "explanation": "Enhanced for-each loops use an internal Iterator. Mutating the underlying collection directly causes the fail-fast iterator to throw ConcurrentModificationException."
                    },
                    {
                        "question_text": "What is the output of the following loop?\n\nint count = 0;\nfor (int i = 0; i < 5; ++i) {\n    count += i;\n}\nSystem.out.println(count);",
                        "description": "Compute accumulator sum in standard for loop.",
                        "options": ["10", "15", "5", "0"],
                        "answer_index": 0,
                        "explanation": "i takes values 0, 1, 2, 3, 4. Sum = 0 + 1 + 2 + 3 + 4 = 10."
                    },
                    {
                        "question_text": "What does a for loop without condition 'for(;;)' represent in Java?",
                        "description": "Identify standard infinite loop idioms.",
                        "options": [
                            "An infinite loop identical to while(true)",
                            "A compilation error: empty loop header",
                            "A loop that terminates after 1 cycle",
                            "A loop that executes zero times"
                        ],
                        "answer_index": 0,
                        "explanation": "In Java, an omitted condition in a for(;;) statement defaults to true, creating an infinite loop that continues until a break or return statement is encountered."
                    }
                ]
            },
            {
                "lesson_number": 6,
                "title": "Methods, Parameters & Method Overloading",
                "description": "Understand Java's strictly pass-by-value model, return types, and compile-time polymorphism.",
                "questions": [
                    {
                        "question_text": "Is Java pass-by-value or pass-by-reference when passing object references to methods?",
                        "description": "Clarify parameter passing semantics in Java.",
                        "options": [
                            "Strictly pass-by-value: the reference address itself is copied by value",
                            "Pass-by-reference for objects, pass-by-value for primitives",
                            "Pass-by-reference for both",
                            "Pass-by-name"
                        ],
                        "answer_index": 0,
                        "explanation": "Java is strictly pass-by-value. When an object is passed, the value of the reference (memory address) is passed by value. Reassigning the parameter inside the method has no effect on the caller's reference."
                    },
                    {
                        "question_text": "Which pair of methods demonstrates VALID method overloading in Java?",
                        "description": "Identify legal method signatures for overloading.",
                        "options": [
                            "int add(int a, int b) AND double add(int a, double b)",
                            "int calculate(int x) AND double calculate(int x)",
                            "void show(int a) AND public void show(int a)",
                            "static void run() AND void run()"
                        ],
                        "answer_index": 0,
                        "explanation": "Overloading requires distinct parameter lists (different number or types of parameters). Changing only the return type or access modifier is invalid and causes a compiler error."
                    },
                    {
                        "question_text": "What happens when you invoke test(10) with these two overloaded methods?\n\nvoid test(long x) { System.out.print(\"L\"); }\nvoid test(Integer x) { System.out.print(\"I\"); }",
                        "description": "Understand widening vs boxing preference in method resolution.",
                        "options": [
                            "Prints 'L' because primitive widening takes precedence over auto-boxing",
                            "Prints 'I' because Integer matches the exact 32-bit type",
                            "Compilation error: ambiguous method call",
                            "Runtime exception"
                        ],
                        "answer_index": 0,
                        "explanation": "Java's method resolution rules prioritize primitive widening (int -> long) over auto-boxing (int -> Integer). Thus test(long) is selected."
                    },
                    {
                        "question_text": "What is the varargs syntax in Java and where must it be placed in a method signature?",
                        "description": "Verify variable-length arguments specification.",
                        "options": [
                            "Type... varName and it must be the last parameter in the method signature",
                            "...Type varName and it must be the first parameter",
                            "Type[]... varName anywhere in the parameter list",
                            "*Type varName"
                        ],
                        "answer_index": 0,
                        "explanation": "Varargs uses the ellipsis 'Type... name' and must always be the final parameter in the method parameter list."
                    },
                    {
                        "question_text": "What does a method declared with return type 'void' return?",
                        "description": "Inspect void return semantics.",
                        "options": [
                            "It returns no value to the caller",
                            "It returns null",
                            "It returns 0",
                            "It returns an empty Object"
                        ],
                        "answer_index": 0,
                        "explanation": "The 'void' keyword denotes that the method completes execution without returning any value."
                    }
                ]
            },
            {
                "lesson_number": 7,
                "title": "Classes, Objects, Constructors & 'this'",
                "description": "Design object blueprints, constructor chaining with this(), and static vs instance members.",
                "questions": [
                    {
                        "question_text": "What is constructor chaining using 'this(...)' and what rule governs its location?",
                        "description": "Examine constructor invocation rules.",
                        "options": [
                            "It calls an overloaded constructor in the same class, and must be the first statement",
                            "It calls the parent class constructor and can appear anywhere",
                            "It creates a recursive loop of objects",
                            "It is only allowed in static methods"
                        ],
                        "answer_index": 0,
                        "explanation": "Calling another constructor in the same class uses this(args) and must strictly be the first statement in the constructor body."
                    },
                    {
                        "question_text": "What happens if a developer defines a parameterized constructor in a Java class but no default constructor?",
                        "description": "Understand default constructor suppression.",
                        "options": [
                            "The compiler does NOT provide an automatic default no-arg constructor",
                            "The compiler automatically generates a blank no-arg constructor anyway",
                            "Compilation error: default constructor is mandatory",
                            "The class becomes abstract automatically"
                        ],
                        "answer_index": 0,
                        "explanation": "If a class contains no constructors, Java supplies a default no-argument constructor. If any constructor is explicitly declared, the compiler suppresses the automatic default constructor."
                    },
                    {
                        "question_text": "Can a static method in a class access an instance variable directly via 'this.variable'?",
                        "description": "Distinguish class-level state from object-level state.",
                        "options": [
                            "No, because static methods exist without an instance context ('this' cannot be referenced)",
                            "Yes, as long as the variable is public",
                            "Yes, but only if marked final",
                            "Only if invoked from inside the constructor"
                        ],
                        "answer_index": 0,
                        "explanation": "Static methods belong to the class itself, not to any particular instance. Hence 'this' is undefined in static context and causes a compile error: non-static variable cannot be referenced from a static context."
                    },
                    {
                        "question_text": "What is the primary role of a constructor in Java?",
                        "description": "Clarify object initialization lifecycle.",
                        "options": [
                            "To initialize the newly created object's state and allocate instance members",
                            "To free memory when an object is destroyed",
                            "To compile bytecode at runtime",
                            "To create static copies of methods"
                        ],
                        "answer_index": 0,
                        "explanation": "Constructors are invoked when an object is instantiated with 'new' to initialize instance fields and prepare the object for use."
                    },
                    {
                        "question_text": "What happens if you mark an instance variable with the 'final' keyword?",
                        "description": "Inspect final field immutability constraints.",
                        "options": [
                            "It can only be assigned once, either at declaration or inside the constructor",
                            "It becomes static and shared across all classes",
                            "It can be modified only by subclass methods",
                            "It must be initialized to 0"
                        ],
                        "answer_index": 0,
                        "explanation": "A 'final' instance variable is a constant for that object; it must be explicitly initialized exactly once (at declaration or in all constructors), and cannot be reassigned thereafter."
                    }
                ]
            },
            {
                "lesson_number": 8,
                "title": "OOP: Encapsulation, Inheritance & Polymorphism",
                "description": "Master access modifiers, method overriding, dynamic dispatch, and abstract classes vs interfaces.",
                "questions": [
                    {
                        "question_text": "What will be printed by this polymorphic code?\n\nclass Animal { void sound() { System.out.print(\"Generic \"); } }\nclass Dog extends Animal { void sound() { System.out.print(\"Bark \"); } }\n\nAnimal a = new Dog();\na.sound();",
                        "description": "Analyze dynamic method dispatch (runtime polymorphism).",
                        "options": ["Bark ", "Generic ", "Generic Bark ", "Compilation error"],
                        "answer_index": 0,
                        "explanation": "In Java, instance method calls are resolved at runtime based on the actual object instance (Dog), not the reference type (Animal). This is dynamic method dispatch."
                    },
                    {
                        "question_text": "Which access modifier restricts field visibility strictly to the declaring class itself?",
                        "description": "Identify encapsulation access modifiers.",
                        "options": ["private", "protected", "public", "default (package-private)"],
                        "answer_index": 0,
                        "explanation": "'private' restricts visibility strictly to the declaring class. 'default' allows package access. 'protected' allows package and subclass access. 'public' allows universal access."
                    },
                    {
                        "question_text": "Which keyword prevents a Java class from being subclassed / extended?\n\npublic ______ class SecureSystem { }",
                        "description": "Apply the final modifier to class definitions.",
                        "options": ["final", "sealed", "abstract", "static"],
                        "answer_index": 0,
                        "explanation": "Applying 'final' to a class declaration prevents any other class from extending it (e.g., java.lang.String is a final class)."
                    },
                    {
                        "question_text": "What is the crucial difference between an abstract class and an interface in Java 8+?",
                        "description": "Compare abstract classes and interfaces.",
                        "options": [
                            "A class can implement multiple interfaces but extend only one abstract class; abstract classes can hold mutable state",
                            "Interfaces can hold non-static instance variables while abstract classes cannot",
                            "Abstract classes cannot declare concrete methods with bodies",
                            "There is no difference in Java 8+"
                        ],
                        "answer_index": 0,
                        "explanation": "Java supports single class inheritance (one abstract class) but multiple interface implementation. Abstract classes can maintain instance state (fields), while interface fields are always public static final."
                    },
                    {
                        "question_text": "What does the @Override annotation guarantee at compile time?",
                        "description": "Verify annotation compile-time enforcement.",
                        "options": [
                            "The compiler verifies that the annotated method actually overrides a method from a superclass or interface",
                            "It forces the JVM to execute the method synchronously",
                            "It marks the method as deprecated",
                            "It hides the method from package reflection"
                        ],
                        "answer_index": 0,
                        "explanation": "The @Override annotation causes the compiler to generate an error if the method does not correctly override a method in a superclass or interface (e.g., catching typo errors in method signatures)."
                    }
                ]
            }
        ]
    },

    "C++": {
        "icon": "⚙️",
        "description": "Master high-performance C++ systems programming, memory management, pointers, and object architectures.",
        "lessons": [
            {
                "lesson_number": 1,
                "title": "C++ Syntax, Output (cout) & Input (cin)",
                "description": "Master streams, std::cout, std::endl vs newline, and namespace scope resolution.",
                "questions": [
                    {
                        "question_text": "What is the technical difference between using std::endl and '\\n' in C++ output streams?",
                        "description": "Examine I/O buffering and performance.",
                        "options": [
                            "std::endl inserts a newline character AND explicitly flushes the stream buffer; '\\n' only inserts a newline",
                            "std::endl is for strings, '\\n' is only for characters",
                            "There is no difference; the compiler optimizes them identically",
                            "'\\n' flushes the buffer while std::endl does not"
                        ],
                        "answer_index": 0,
                        "explanation": "std::endl outputs '\\n' and calls std::flush on the stream buffer. In high-frequency logging or loops, frequent buffer flushing with std::endl creates severe I/O overhead."
                    },
                    {
                        "question_text": "What will std::cin >> str extract when the user types \"Forest Academy\"?",
                        "description": "Understand whitespace tokenization in standard input streams.",
                        "options": [
                            "\"Forest\" only, because operator>> stops at the first whitespace",
                            "\"Forest Academy\" entirely",
                            "\"Forest\\nAcademy\"",
                            "Input error"
                        ],
                        "answer_index": 0,
                        "explanation": "The stream extraction operator >> skips leading whitespace and stops at the next whitespace character. To read an entire line with spaces, std::getline(std::cin, str) is required."
                    },
                    {
                        "question_text": "Why is 'using namespace std;' considered bad practice in header files (.h/.hpp)?",
                        "description": "Analyze namespace pollution and symbol collisions.",
                        "options": [
                            "It pollutes the global namespace of any source file that includes the header, leading to naming collisions",
                            "It increases compiled binary size by 50%",
                            "It prevents the compiler from optimizing loops",
                            "It is prohibited by the C++20 standard"
                        ],
                        "answer_index": 0,
                        "explanation": "In header files, 'using namespace std;' leaks all standard identifiers into the global namespace of every translation unit including that header, causing ambiguity and collisions."
                    },
                    {
                        "question_text": "What does the scope resolution operator '::' do when written with no left-hand operand, e.g. ::count?",
                        "description": "Identify global namespace qualification.",
                        "options": [
                            "It explicitly references the symbol in the global namespace",
                            "It is a syntax error",
                            "It creates an anonymous namespace variable",
                            "It accesses the nearest local variable"
                        ],
                        "answer_index": 0,
                        "explanation": "The unary scope resolution operator (::identifier) explicitly targets an identifier in the global namespace, bypassing any shadowing local variable of the same name."
                    },
                    {
                        "question_text": "What does main() return by default in C++ if no return statement is specified?",
                        "description": "Understand main function standards in ISO C++.",
                        "options": [
                            "0 (representing successful termination)",
                            "Undefined behavior",
                            "1 (representing error)",
                            "-1"
                        ],
                        "answer_index": 0,
                        "explanation": "According to the ISO C++ standard, reaching the end of the main() function without a return statement implicitly performs 'return 0;'."
                    }
                ]
            },
            {
                "lesson_number": 2,
                "title": "Variables, Data Types, Constants & auto",
                "description": "Explore static typing, sizeof evaluations, const vs constexpr, and auto type deduction.",
                "questions": [
                    {
                        "question_text": "What is the difference between 'const' and 'constexpr' in modern C++?",
                        "description": "Distinguish compile-time evaluation from runtime immutability.",
                        "options": [
                            "constexpr guarantees evaluation at compile-time; const merely guarantees that an object cannot be mutated after initialization",
                            "const variables are compile-time only; constexpr variables are runtime only",
                            "constexpr is only for floating-point numbers",
                            "There is no difference in C++11 and beyond"
                        ],
                        "answer_index": 0,
                        "explanation": "constexpr enforces that the value is known and computed at compile-time, allowing it to be used in template parameters or array bounds. const can be initialized with runtime values."
                    },
                    {
                        "question_text": "What does the 'auto' keyword deduce for variable 'x' in:\n\nint n = 10;\nconst int& ref = n;\nauto x = ref;",
                        "description": "Examine auto type deduction rules with references and const qualifiers.",
                        "options": [
                            "int (top-level const and reference are dropped)",
                            "const int&",
                            "const int",
                            "int&"
                        ],
                        "answer_index": 0,
                        "explanation": "By default, 'auto' strips top-level const and references during type deduction, resulting in plain 'int'. To preserve them, you must write 'const auto& x = ref;'."
                    },
                    {
                        "question_text": "What happens when you use uniform initialization to narrow types?\n\nint x{3.14};",
                        "description": "Identify compiler behavior with uniform brace initialization.",
                        "options": [
                            "Compilation error: narrowing conversion from double to int inside braces is prohibited",
                            "Compiles and silently truncates x to 3",
                            "x becomes 4 due to rounding",
                            "Runtime warning"
                        ],
                        "answer_index": 0,
                        "explanation": "In modern C++, brace initialization ({}) explicitly prohibits narrowing conversions (e.g. converting floating-point to integer or larger integer to smaller integer), raising a compiler error."
                    },
                    {
                        "question_text": "What does sizeof(char) evaluate to in C++ on any compliant platform?",
                        "description": "Verify the fundamental unit of storage in C++.",
                        "options": ["Always exactly 1", "2 bytes", "4 bytes", "Varies depending on whether system is 32-bit or 64-bit"],
                        "answer_index": 0,
                        "explanation": "By C++ standard definition, sizeof(char) is always guaranteed to be exactly 1 byte."
                    },
                    {
                        "question_text": "What is the value of 'a' after: unsigned int a = -1;?",
                        "description": "Understand unsigned integer underflow semantics.",
                        "options": [
                            "UINT_MAX (the maximum representable unsigned integer value)",
                            "-1",
                            "0",
                            "Compilation error"
                        ],
                        "answer_index": 0,
                        "explanation": "Assigning a negative value to an unsigned integer converts it modulo 2^N, resulting in UINT_MAX (all bits set to 1 in two's complement)."
                    }
                ]
            },
            {
                "lesson_number": 3,
                "title": "Operators & Expressions",
                "description": "Analyze integer division truncation, pre vs post increment, precedence, and bitwise logic.",
                "questions": [
                    {
                        "question_text": "What is the output of the following C++ code?\n\nint a = 5, b = 2;\ndouble result = a / b;\nstd::cout << result;",
                        "description": "Trace integer division truncation before floating-point assignment.",
                        "options": ["2", "2.5", "2.0", "3"],
                        "answer_index": 0,
                        "explanation": "Because both 'a' and 'b' are integers, integer division is performed first, yielding 2. That integer is then implicitly converted to double 2.0. Standard cout prints '2'."
                    },
                    {
                        "question_text": "What is the difference between ++i and i++ in terms of performance and temporary objects?",
                        "description": "Compare prefix vs postfix increment.",
                        "options": [
                            "++i increments in place and returns by reference; i++ creates a temporary copy of the old value before incrementing",
                            "i++ is faster because modern CPUs optimize it",
                            "There is no difference for non-primitive iterators",
                            "++i allocates heap memory"
                        ],
                        "answer_index": 0,
                        "explanation": "Prefix (++i) increments and returns the reference to the updated object directly. Postfix (i++) must make a copy of the previous state, increment, and return the copy."
                    },
                    {
                        "question_text": "What does the expression (true || ++x) do if x = 10?",
                        "description": "Understand short-circuit evaluation in logical operators.",
                        "options": [
                            "Returns true and leaves x as 10 (short-circuits)",
                            "Returns true and increments x to 11",
                            "Compilation error",
                            "Returns 11"
                        ],
                        "answer_index": 0,
                        "explanation": "The logical OR (||) operator short-circuits: since the left operand is true, the right operand (++x) is never evaluated, so x remains 10."
                    },
                    {
                        "question_text": "What is the result of the bitwise operation 6 & 3 in C++?",
                        "description": "Compute binary bitwise AND.",
                        "options": ["2", "7", "3", "4"],
                        "answer_index": 0,
                        "explanation": "In binary: 6 is 110, 3 is 011. Bitwise AND: 110 & 011 = 010, which is decimal 2."
                    },
                    {
                        "question_text": "What is the associativity of the assignment operator (=) in C++?",
                        "description": "Inspect operator associativity.",
                        "options": ["Right-to-left (e.g. a = b = c assigns c to b first, then to a)", "Left-to-right", "Non-associative", "Varies by compiler"],
                        "answer_index": 0,
                        "explanation": "Assignment operators in C++ associate from right to left, allowing chained assignments such as a = (b = (c = 10))."
                    }
                ]
            },
            {
                "lesson_number": 4,
                "title": "Conditions & Switch Statements",
                "description": "Evaluate branching constraints, switch type requirements, and init-statement conditionals.",
                "questions": [
                    {
                        "question_text": "Which of the following types CANNOT be used as the condition in a C++ switch statement?",
                        "description": "Identify switch statement type restrictions.",
                        "options": ["std::string", "int", "char", "enum class"],
                        "answer_index": 0,
                        "explanation": "In C++, switch statements only accept integral or enumeration types. std::string is a class and cannot be switched on directly without hashing or if-else ladders."
                    },
                    {
                        "question_text": "In C++17, what does this new conditional syntax accomplish?\n\nif (auto it = map.find(key); it != map.end()) {\n    use(it->second);\n}",
                        "description": "Examine C++17 if-statements with initializers.",
                        "options": [
                            "Initializes 'it' with scope restricted strictly to the if-else blocks",
                            "Creates a global iterator",
                            "Runs the condition asynchronously",
                            "Syntax error in C++"
                        ],
                        "answer_index": 0,
                        "explanation": "C++17 introduced 'if with initializer', allowing a variable to be initialized and its scope strictly confined to the if and associated else blocks."
                    },
                    {
                        "question_text": "What does the [[fallthrough]] attribute signal to the C++ compiler in a switch case?",
                        "description": "Utilize standard C++ compiler attributes.",
                        "options": [
                            "It explicitly indicates intentional fallthrough to suppress compiler warnings about missing break",
                            "It forces the switch to break immediately",
                            "It restarts the switch statement from case 1",
                            "It throws an exception if the case matches"
                        ],
                        "answer_index": 0,
                        "explanation": "The [[fallthrough]] attribute documents that a fallthrough to the next case label is intentional, silencing compiler warnings about missing break statements."
                    },
                    {
                        "question_text": "What is the output of evaluating: int x = 0; if (x = 5) { std::cout << \"T\"; } else { std::cout << \"F\"; }?",
                        "description": "Spot assignment inside conditional expressions in C++.",
                        "options": ["T", "F", "Compilation error", "Undefined behavior"],
                        "answer_index": 0,
                        "explanation": "The assignment expression (x = 5) assigns 5 to x and evaluates to 5. Any non-zero integer converts to true in a boolean context, printing 'T'."
                    },
                    {
                        "question_text": "What is the return type of the ternary operator in: (true ? 10 : 3.5)?",
                        "description": "Understand common type promotion in ternary expressions.",
                        "options": ["double (promoted to common type)", "int", "variant", "Compilation error"],
                        "answer_index": 0,
                        "explanation": "The ternary operator's second and third expressions must resolve to a common type. 10 (int) is promoted to double to match 3.5, returning double 10.0."
                    }
                ]
            },
            {
                "lesson_number": 5,
                "title": "Loops & Iteration (Range-based for)",
                "description": "Trace while, do-while, standard for, and modern range-based for loops with references.",
                "questions": [
                    {
                        "question_text": "What is the performance advantage of using 'for (const auto& item : collection)' over 'for (auto item : collection)'?",
                        "description": "Analyze reference vs copy semantics in range-based for loops.",
                        "options": [
                            "It accesses elements by const reference, avoiding costly object copies during each iteration",
                            "It parallelizes the loop across CPU cores",
                            "It enables the loop to modify collection elements",
                            "It prevents index bounds checking"
                        ],
                        "answer_index": 0,
                        "explanation": "'auto item' creates a copy of each element in the collection on every iteration. 'const auto& item' binds by const reference, avoiding any copying while preventing accidental mutation."
                    },
                    {
                        "question_text": "What happens if you modify a std::vector's size (e.g. push_back) while iterating over it with a range-based for loop?",
                        "description": "Recognize iterator invalidation traps in C++.",
                        "options": [
                            "Undefined behavior due to iterator invalidation caused by vector reallocation",
                            "The vector throws a ConcurrentModificationException",
                            "The loop automatically resizes its boundary",
                            "The loop terminates safely"
                        ],
                        "answer_index": 0,
                        "explanation": "Adding elements to a std::vector can trigger memory reallocation, invalidating existing iterators and references. Continuing iteration yields undefined behavior."
                    },
                    {
                        "question_text": "What is the output of this loop?\n\nint count = 0;\nfor (int i = 0; i < 5; ++i) {\n    if (i % 2 != 0) continue;\n    count += i;\n}\nstd::cout << count;",
                        "description": "Trace continue statements and loop accumulators.",
                        "options": ["6", "10", "4", "0"],
                        "answer_index": 0,
                        "explanation": "When i is odd (1, 3), 'continue' skips to the next iteration. For even i (0, 2, 4): count += 0, count += 2, count += 4 -> total is 6."
                    },
                    {
                        "question_text": "How many times does the loop body execute in:\n\nint x = 10;\ndo {\n    x++;\n} while (x < 5);",
                        "description": "Test do-while post-test evaluation.",
                        "options": ["Exactly 1 time", "0 times", "5 times", "Infinite loop"],
                        "answer_index": 0,
                        "explanation": "In a do-while loop, the body executes before the condition is checked. x becomes 11, then the condition (11 < 5) evaluates to false, terminating the loop after 1 execution."
                    },
                    {
                        "question_text": "What does a range-based for loop expand to internally in C++?",
                        "description": "Understand the compiler mechanics behind range-for.",
                        "options": [
                            "A standard for loop utilizing std::begin() and std::end() iterators",
                            "An operating system thread pool",
                            "A while loop using index access [i]",
                            "A recursive function call"
                        ],
                        "answer_index": 0,
                        "explanation": "A range-based for loop expands into an iterator loop: for (auto __begin = std::begin(range), __end = std::end(range); __begin != __end; ++__begin)."
                    }
                ]
            },
            {
                "lesson_number": 6,
                "title": "Functions, Parameters & Pass-by-Reference",
                "description": "Master pass-by-value vs reference, inline functions, default arguments, and recursion.",
                "questions": [
                    {
                        "question_text": "What will be printed by the following code?\n\nvoid swapValues(int& a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\nint x = 10, y = 20;\nswapValues(x, y);\nstd::cout << x << \" \" << y;",
                        "description": "Analyze mixed reference and value parameters.",
                        "options": ["20 20", "20 10", "10 20", "10 10"],
                        "answer_index": 0,
                        "explanation": "'a' is passed by reference (modifying 'x' to 20). 'b' is passed by value (a copy of 'y', so 'y' remains unchanged at 20). Output is '20 20'."
                    },
                    {
                        "question_text": "What is the purpose of declaring a function 'inline' in C++?",
                        "description": "Examine the inline keyword and linker behavior.",
                        "options": [
                            "It suggests to the compiler to substitute the function body at the call site to eliminate call overhead, and allows definition in headers without ODR violations",
                            "It forces the function to execute on a separate GPU thread",
                            "It prevents the function from being overloaded",
                            "It restricts function visibility to the local file"
                        ],
                        "answer_index": 0,
                        "explanation": "'inline' hints to the compiler to expand the function code directly where called to reduce function call overhead, and permits defining the function in header files without violating the One Definition Rule (ODR)."
                    },
                    {
                        "question_text": "Where must default arguments be placed in a C++ function parameter list?",
                        "description": "Identify syntactic constraints on default arguments.",
                        "options": [
                            "Trailing at the end of the parameter list (right-most parameters)",
                            "At the beginning (left-most parameters)",
                            "Anywhere, as long as named",
                            "In a separate header only"
                        ],
                        "answer_index": 0,
                        "explanation": "Default arguments must be specified from right to left; once a parameter has a default value, all subsequent parameters to its right must also have default values."
                    },
                    {
                        "question_text": "Why should large structures or objects be passed as 'const Type&' instead of 'Type'?",
                        "description": "Optimize parameter passing efficiency.",
                        "options": [
                            "It prevents expensive deep copies while ensuring the function cannot inadvertently mutate the caller's data",
                            "It allows the function to reallocate the caller's memory",
                            "It converts the struct into a pointer automatically",
                            "It makes the object thread-safe"
                        ],
                        "answer_index": 0,
                        "explanation": "Passing by value copies the entire object (invoking copy constructors). Passing by 'const Type&' passes only a memory address (fast) while compiler-enforcing read-only access."
                    },
                    {
                        "question_text": "What happens if a recursive function does not define a valid base case?",
                        "description": "Identify call stack memory limits.",
                        "options": [
                            "Stack overflow error due to exhausting the program's call stack memory",
                            "Heap corruption",
                            "The compiler catches it at compile time and errors",
                            "It returns 0 automatically"
                        ],
                        "answer_index": 0,
                        "explanation": "Infinite recursion continuously pushes stack frames until the thread's call stack memory is exhausted, resulting in a segmentation fault or stack overflow crash."
                    }
                ]
            },
            {
                "lesson_number": 7,
                "title": "Pointers, References & Memory Addresses",
                "description": "Deep dive into address-of (&), dereferencing (*), nullptr, pointer arithmetic, and references.",
                "questions": [
                    {
                        "question_text": "What is the output of the following pointer code?\n\nint arr[] = {10, 20, 30, 40};\nint* ptr = arr;\nptr += 2;\nstd::cout << *ptr;",
                        "description": "Trace pointer arithmetic across array elements.",
                        "options": ["30", "20", "40", "Memory address of arr"],
                        "answer_index": 0,
                        "explanation": "'ptr' points to arr[0] (10). 'ptr += 2' advances the pointer by 2 * sizeof(int) bytes to arr[2] (30). Dereferencing (*ptr) yields 30."
                    },
                    {
                        "question_text": "What is the crucial difference between a pointer and a reference in C++?",
                        "description": "Compare pointers and references.",
                        "options": [
                            "A reference cannot be null, must be initialized at declaration, and cannot be reseated to point to another object",
                            "A pointer is always safer than a reference",
                            "A reference uses more memory than a pointer",
                            "A pointer cannot point to primitive types"
                        ],
                        "answer_index": 0,
                        "explanation": "References act as an alias for an existing object; they must be bound upon creation, cannot be reassigned to bind to another object, and cannot legally be null."
                    },
                    {
                        "question_text": "What is the danger of returning a pointer or reference to a local stack variable from a function?\n\nint* getVal() { int x = 42; return &x; }",
                        "description": "Recognize dangling pointers and undefined behavior.",
                        "options": [
                            "Dangling pointer: 'x' is destroyed when the function exits, leaving a pointer to invalid stack memory",
                            "Memory leak: x remains permanently allocated on the heap",
                            "Double free error",
                            "Compile error: cannot return addresses"
                        ],
                        "answer_index": 0,
                        "explanation": "Local variables have automatic storage duration and are deallocated when their enclosing scope ends. Returning a pointer to 'x' creates a dangling pointer, resulting in undefined behavior when dereferenced."
                    },
                    {
                        "question_text": "Why is 'nullptr' preferred over 'NULL' or '0' in modern C++?",
                        "description": "Clarify type safety of nullptr.",
                        "options": [
                            "nullptr has type std::nullptr_t, eliminating ambiguities in overloaded functions accepting int vs pointer",
                            "NULL is deprecated and removed in C++11",
                            "nullptr automatically frees memory",
                            "nullptr is 128-bit on 64-bit platforms"
                        ],
                        "answer_index": 0,
                        "explanation": "NULL is typically defined as 0 or (void*)0. In function overloading (e.g. f(int) vs f(char*)), passing NULL ambiguously binds to int. 'nullptr' is strongly typed as std::nullptr_t."
                    },
                    {
                        "question_text": "What does (*ptr)++ do versus *ptr++?",
                        "description": "Analyze operator precedence between dereference and postfix increment.",
                        "options": [
                            "(*ptr)++ increments the value pointed to; *ptr++ dereferences the current pointer and then advances the pointer to the next address",
                            "Both do the exact same thing",
                            "(*ptr)++ advances the pointer; *ptr++ increments the value",
                            "Syntax error in (*ptr)++"
                        ],
                        "answer_index": 0,
                        "explanation": "Postfix ++ has higher precedence than *. (*ptr)++ forces dereferencing first and increments the value pointed to. *ptr++ dereferences the current address, but increments the pointer itself."
                    }
                ]
            },
            {
                "lesson_number": 8,
                "title": "Classes, Objects, Constructors & Destructors",
                "description": "Master access specifiers, constructor initializer lists, destructors, and RAII principles.",
                "questions": [
                    {
                        "question_text": "What is the primary purpose of a destructor (~ClassName()) in C++?",
                        "description": "Understand RAII and resource cleanup.",
                        "options": [
                            "To release resources (heap memory, file handles, sockets) acquired during the object's lifetime",
                            "To reset all member variables to zero",
                            "To recompile the class at runtime",
                            "To delete the class definition from the executable"
                        ],
                        "answer_index": 0,
                        "explanation": "Destructors are automatically invoked when an object goes out of scope or is deleted, ensuring deterministic cleanup of managed resources under RAII (Resource Acquisition Is Initialization)."
                    },
                    {
                        "question_text": "Why should constructors prefer member initializer lists over assignment in the constructor body?\n\nPoint(int a, int b) : x(a), y(b) { }",
                        "description": "Analyze initialization vs assignment efficiency.",
                        "options": [
                            "Initializer lists initialize members directly upon creation, avoiding redundant default construction followed by copy assignment",
                            "It is the only way to initialize static members",
                            "It runs after the constructor body completes",
                            "It allocates members on the heap"
                        ],
                        "answer_index": 0,
                        "explanation": "In the constructor body, members have already been default-constructed, so writing 'x = a' executes an extra assignment. For const members and references, initializer lists are mandatory."
                    },
                    {
                        "question_text": "What is the default access specifier for members in a 'class' versus a 'struct' in C++?",
                        "description": "Distinguish C++ struct from class.",
                        "options": [
                            "Class members default to 'private'; struct members default to 'public'",
                            "Class members default to 'public'; struct members default to 'private'",
                            "Both default to 'public'",
                            "Both default to 'private'"
                        ],
                        "answer_index": 0,
                        "explanation": "In C++, the only difference between a class and a struct is default visibility: class members and inheritance default to 'private', while struct members and inheritance default to 'public'."
                    },
                    {
                        "question_text": "Why should a base class intended for polymorphic deletion always declare a virtual destructor?\n\nclass Base { virtual ~Base() = default; };",
                        "description": "Prevent memory leaks and undefined behavior in polymorphism.",
                        "options": [
                            "To ensure that deleting a derived object through a Base pointer calls the derived destructor first, preventing memory leaks",
                            "To make the class abstract",
                            "To allow the constructor to be virtual",
                            "To prevent derived classes from having destructors"
                        ],
                        "answer_index": 0,
                        "explanation": "If Base has a non-virtual destructor and you execute 'Base* b = new Derived(); delete b;', only Base::~Base() is called, leaving Derived resources leaked. A virtual destructor ensures the derived destructor runs first."
                    },
                    {
                        "question_text": "What does the 'this' pointer represent inside a non-static C++ member function?",
                        "description": "Understand the implicit 'this' pointer.",
                        "options": [
                            "A pointer to the specific object instance on which the member function was invoked",
                            "A reference to the class metadata",
                            "A copy of the object's memory",
                            "A global pointer to the main function"
                        ],
                        "answer_index": 0,
                        "explanation": "'this' is an implicit rvalue pointer passed to all non-static member functions, storing the memory address of the object on which the function is operating."
                    }
                ]
            }
        ]
    },
    "English": {
        "icon": "🇬🇧",
        "description": "Master professional English communication, precise syntax, engineering metrics, and technical synthesis.",
        "lessons": [
            {
                "lesson_number": 1,
                "title": "Basic Vocabulary & Syntax",
                "description": "Fundamental parts of speech, vocabulary building, and sentence structuring.",
                "questions": [
                    {
                        "question_text": "Which sentence demonstrates correct subject-verb agreement?",
                        "description": "Identify third-person singular verb forms.",
                        "options": [
                            "The list of scholars is updated daily.",
                            "The list of scholars are updated daily.",
                            "The list of scholars have been update daily.",
                            "The list of scholars were update daily."
                        ],
                        "answer_index": 0,
                        "explanation": "The subject is 'The list' (singular), not 'scholars'. Therefore, the singular verb 'is' is grammatically correct."
                    },
                    {
                        "question_text": "Which word functions as an adverb in: 'The engineer quickly debugged the code'?",
                        "description": "Identify parts of speech modifying actions.",
                        "options": [
                            "quickly",
                            "engineer",
                            "debugged",
                            "code"
                        ],
                        "answer_index": 0,
                        "explanation": "'Quickly' is an adverb modifying the action verb 'debugged'."
                    },
                    {
                        "question_text": "Select the sentence with the correct usage of 'fewer' versus 'less'.",
                        "description": "Distinguish countable vs uncountable quantifiers.",
                        "options": [
                            "The optimized algorithm uses fewer memory allocations and less runtime.",
                            "The optimized algorithm uses less memory allocations and fewer runtime.",
                            "The algorithm uses fewer runtime and fewer memory.",
                            "The algorithm uses less allocations."
                        ],
                        "answer_index": 0,
                        "explanation": "'Fewer' is used for countable nouns (allocations), while 'less' is used for uncountable quantities (runtime)."
                    },
                    {
                        "question_text": "Which sentence correctly places the modifier to avoid ambiguity?",
                        "description": "Identify proper participial modifier placement.",
                        "options": [
                            "Having compiled the binary without warnings, the release team deployed the microservice.",
                            "Having compiled the binary without warnings, the microservice was deployed by the release team.",
                            "The release team deployed having compiled the binary without warnings the microservice.",
                            "Having compiled the binary without warnings, deployment was initiated."
                        ],
                        "answer_index": 0,
                        "explanation": "In participial phrases like 'Having compiled...', the introductory modifier must logically describe the immediate subject of the main clause ('the release team')."
                    },
                    {
                        "question_text": "Select the sentence with the correct contextual usage of technical terminology:",
                        "description": "Distinguish between homophones and technical terms.",
                        "options": [
                            "The asynchronous queue complements the database by buffering burst ingestion traffic.",
                            "The asynchronous queue compliments the database by buffering burst ingestion traffic.",
                            "The asynchronous queue implements to the database by buffering burst traffic.",
                            "The asynchronous queue complements for the database with buffering traffic."
                        ],
                        "answer_index": 0,
                        "explanation": "'Complement' (with an 'e') means to enhance or complete something harmoniously, whereas 'compliment' (with an 'i') denotes praise."
                    }
                ]
            },
            {
                "lesson_number": 2,
                "title": "Greetings & Professional Introductions",
                "description": "Professional communication, meeting openings, stakeholder updates, and executive presence.",
                "questions": [
                    {
                        "question_text": "In a formal engineering email to cross-functional stakeholders, which opening conveys the highest level of professional clarity and respect?",
                        "description": "Select appropriate formal correspondence openings.",
                        "options": [
                            "I hope this email finds you well. I am writing to provide an update on the Q3 payment gateway migration.",
                            "Hey folks, check this out regarding the gateway stuff.",
                            "To whom it might concern, I am updating on things.",
                            "What's up team, here is the code news you wanted."
                        ],
                        "answer_index": 0,
                        "explanation": "'I hope this email finds you well. I am writing to provide an update...' establishes professional courtesy, immediately declares the email's objective, and adheres to standard enterprise communication etiquette."
                    },
                    {
                        "question_text": "During an asynchronous Agile daily standup, which structure most effectively summarizes engineering progress?",
                        "description": "Evaluate concise sprint status reporting.",
                        "options": [
                            "Yesterday I resolved the JWT token expiration bug; today I am authoring integration tests for user registration; I have no blockers.",
                            "I was working on some bugs all yesterday, and today I think I will do some testing if nothing crashes.",
                            "My tasks were hard yesterday because of the server, but today is hopefully better.",
                            "I worked on code yesterday and will write more code today."
                        ],
                        "answer_index": 0,
                        "explanation": "High-performing Agile standup updates follow the three standard anchors: what was completed, what is scheduled next, and explicit declaration of impediments (blockers)."
                    },
                    {
                        "question_text": "When introducing a critical system outage to executive leadership, which phrasing maintains executive presence and accountability?",
                        "description": "Determine crisis management communication tone.",
                        "options": [
                            "At 14:15 UTC, Service A encountered elevated latency. We have activated our incident response protocol and routed traffic to our secondary cluster while investigating the root cause.",
                            "Everything broke suddenly at 14:15 and we don't know who did it, but we are looking into it.",
                            "The system crashed because the database team messed up their deployment.",
                            "Don't panic, but Service A is completely broken right now."
                        ],
                        "answer_index": 0,
                        "explanation": "Executive incident communication should be timestamped, objective, action-oriented, and focused on containment and mitigation rather than speculation or blame."
                    },
                    {
                        "question_text": "Which sign-off is most appropriate for a formal design proposal sent to external client architects?",
                        "description": "Identify professional correspondence closings.",
                        "options": [
                            "Sincerely, / Best regards,",
                            "Cheers,",
                            "Later,",
                            "Thanks a bunch,"
                        ],
                        "answer_index": 0,
                        "explanation": "'Sincerely' and 'Best regards' are standard, internationally recognized formal closings suitable for external clients and formal technical proposals."
                    },
                    {
                        "question_text": "How should a software engineer introduce a constructive disagreement during a technical architectural review?",
                        "description": "Navigate collaborative technical disagreement with diplomacy.",
                        "options": [
                            "I understand the benefits of the proposed caching layer; however, could we evaluate the potential cache invalidation overhead under high write contention?",
                            "That design is wrong and will fail under high write load.",
                            "You clearly haven't considered cache invalidation problems.",
                            "I don't like this approach at all."
                        ],
                        "answer_index": 0,
                        "explanation": "Phrasing constructive feedback by acknowledging the rationale ('I understand the benefits...') followed by a collaborative inquiry ('however, could we evaluate...') fosters rigorous technical review without provoking defensiveness."
                    }
                ]
            },
            {
                "lesson_number": 3,
                "title": "Numbers, Quantifiers & Data Metrics",
                "description": "Quantifying metrics, percentiles, throughput, and numerical precision in engineering.",
                "questions": [
                    {
                        "question_text": "Which sentence accurately articulates service latency metrics using standard quantitative terminology?",
                        "description": "Express statistical percentiles and metric thresholds.",
                        "options": [
                            "The p99 latency decreased by 45 milliseconds, ensuring that 99% of user requests complete within 120ms.",
                            "The p99 latency decreased at 45 milliseconds, ensuring that 99% of user requests are under 120ms faster.",
                            "The p99 latency decreased to 45 milliseconds from 99% users.",
                            "The p99 latency grew smaller by 45 milliseconds for almost all requests."
                        ],
                        "answer_index": 0,
                        "explanation": "'The p99 latency decreased by 45 milliseconds, ensuring that 99% of user requests complete within 120ms' correctly pairs prepositional change ('by 45ms') with the formal statistical definition of the 99th percentile (p99)."
                    },
                    {
                        "question_text": "Choose the grammatically and quantitatively correct statement regarding server capacity:",
                        "description": "Apply quantifiers to countable compute nodes versus continuous load.",
                        "options": [
                            "Our cluster handles a greater number of requests while utilizing fewer compute instances.",
                            "Our cluster handles a greater amount of requests while utilizing fewer compute instances.",
                            "Our cluster handles a greater number of requests while utilizing less compute instances.",
                            "Our cluster handles greater requests while utilizing less instances."
                        ],
                        "answer_index": 0,
                        "explanation": "'Number of' is required for plural countable nouns ('requests'), and 'fewer' is required for plural countable nouns ('instances'). 'Amount of' and 'less' apply to uncountable mass nouns."
                    },
                    {
                        "question_text": "When describing exponential algorithmic complexity, what is the most precise formulation?",
                        "description": "Communicate mathematical orders of magnitude.",
                        "options": [
                            "The execution time scales exponentially as the input size increases by a factor of ten.",
                            "The execution time scales exponential when input grows ten times larger.",
                            "The execution time multiplies exponential with ten inputs.",
                            "The execution time goes up high exponentially by factor ten."
                        ],
                        "answer_index": 0,
                        "explanation": "'Scales exponentially' correctly uses the adverb 'exponentially' to modify the verb 'scales', and 'by a factor of ten' is the standard mathematical idiom for proportional scaling."
                    },
                    {
                        "question_text": "Which option correctly uses commas and formatting for large numbers in English technical writing?",
                        "description": "Format numerical data and throughput quantities.",
                        "options": [
                            "The event stream ingested 1,250,000 events per second during peak load.",
                            "The event stream ingested 1.250.000 events per second during peak load.",
                            "The event stream ingested 1250,000 events per second during peak load.",
                            "The event stream ingested 1 250 000,00 events per second during peak load."
                        ],
                        "answer_index": 0,
                        "explanation": "Standard English formatting uses commas (',') as thousands separators to group digits in triplets (1,250,000) and a period ('.') for decimal fractions."
                    },
                    {
                        "question_text": "Identify the sentence that correctly distinguishes between 'percentage' and 'percentage points':",
                        "description": "Differentiate relative change from absolute metric point shifts.",
                        "options": [
                            "Cache hit rates improved from 80% to 85%, representing an absolute increase of 5 percentage points.",
                            "Cache hit rates improved from 80% to 85%, representing an absolute increase of 5 percent.",
                            "Cache hit rates improved from 80% to 85%, representing a percentage increase of 5 percent.",
                            "Cache hit rates improved from 80% to 85%, representing an increase of 5 percentage."
                        ],
                        "answer_index": 0,
                        "explanation": "Moving from 80% to 85% is an absolute gain of 5 'percentage points' (whereas the relative percentage increase is (85-80)/80 = 6.25%). Conflating 'percent' and 'percentage points' creates severe metric ambiguity."
                    }
                ]
            },
            {
                "lesson_number": 4,
                "title": "Everyday Conversations & Collocations",
                "description": "Technical collocations, collaborative code review phrasing, and workplace idioms.",
                "questions": [
                    {
                        "question_text": "Which phrase is a natural English collocation frequently used in software engineering discussions?",
                        "description": "Identify idiomatic technical collocations.",
                        "options": [
                            "Technical debt",
                            "Technical loan",
                            "Technical deficit",
                            "Technical liability"
                        ],
                        "answer_index": 0,
                        "explanation": "'Technical debt' (coined by Ward Cunningham) is the universally established industry collocation referring to the implied cost of future refactoring incurred by choosing an expedient solution now."
                    },
                    {
                        "question_text": "In a code review comment, which collocation provides the most natural and polite phrasing?",
                        "description": "Use professional collocations in collaborative code reviews.",
                        "options": [
                            "Could we take into consideration extracting this loop into a helper function?",
                            "Could we take into notice extracting this loop into a helper function?",
                            "Could we make into consideration extracting this loop into a helper function?",
                            "Could we do consideration of extracting this loop into a helper function?"
                        ],
                        "answer_index": 0,
                        "explanation": "'Take into consideration' (or 'take into account') is the correct standard idiomatic collocation. 'Take into notice' and 'make into consideration' are non-idiomatic."
                    },
                    {
                        "question_text": "Select the sentence with the correct prepositional collocation:",
                        "description": "Match verbs with their mandatory dependent prepositions.",
                        "options": [
                            "This microservice adheres to open telemetry standards.",
                            "This microservice adheres with open telemetry standards.",
                            "This microservice adheres in open telemetry standards.",
                            "This microservice adheres towards open telemetry standards."
                        ],
                        "answer_index": 0,
                        "explanation": "The verb 'adhere' collocates strictly with the preposition 'to' (e.g. 'adhere to standards', 'adhere to guidelines')."
                    },
                    {
                        "question_text": "Which conversational idiom accurately describes resolving a problem early before it compounds?",
                        "description": "Recognize workplace idioms in technical contexts.",
                        "options": [
                            "Nip the issue in the bud",
                            "Cut the issue in the flower",
                            "Bite the issue in the root",
                            "Stop the issue in the branch"
                        ],
                        "answer_index": 0,
                        "explanation": "'Nip it in the bud' is a well-established English idiom meaning to suppress or resolve a problem at an early stage before it grows uncontrollable."
                    },
                    {
                        "question_text": "Choose the correct collocation for expressing that a feature is no longer supported and slated for removal:",
                        "description": "Identify software deprecation terminology.",
                        "options": [
                            "The legacy authentication endpoint has been deprecated.",
                            "The legacy authentication endpoint has been depreciated.",
                            "The legacy authentication endpoint has been degraded.",
                            "The legacy authentication endpoint has been dispensed."
                        ],
                        "answer_index": 0,
                        "explanation": "In software engineering, 'deprecate' means to declare a software feature obsolete and advise against its use. 'Depreciate' refers to the decline in financial asset value over time."
                    }
                ]
            },
            {
                "lesson_number": 5,
                "title": "Grammar Basics: Parts of Speech & Prepositions",
                "description": "Dependent prepositions, possessives vs contractions, and syntactic grammatical accuracy.",
                "questions": [
                    {
                        "question_text": "Which preposition correctly completes the sentence: 'The newly deployed proxy is fully compatible _____ our legacy TLS cipher suites'?",
                        "description": "Select the correct dependent preposition for adjectives.",
                        "options": [
                            "with",
                            "to",
                            "for",
                            "at"
                        ],
                        "answer_index": 0,
                        "explanation": "The adjective 'compatible' governs the dependent preposition 'with' ('compatible with')."
                    },
                    {
                        "question_text": "Identify the sentence that correctly distinguishes between 'its' and 'it's':",
                        "description": "Assess possessive determiner vs contracted pronoun + verb.",
                        "options": [
                            "The background worker lost its database connection because it's configured with a short timeout.",
                            "The background worker lost it's database connection because its configured with a short timeout.",
                            "The background worker lost its database connection because its configured with a short timeout.",
                            "The background worker lost it's database connection because it's configured with a short timeout."
                        ],
                        "answer_index": 0,
                        "explanation": "'Its' without an apostrophe is the possessive pronoun ('its database connection'). 'It's' with an apostrophe is the contraction for 'it is' ('it is configured...')."
                    },
                    {
                        "question_text": "Which word functions as a conjunction in the following sentence?\n\n'The microservice throttles incoming requests unless the client supplies a valid API key.'",
                        "description": "Identify syntactic function of subordinating conjunctions.",
                        "options": [
                            "unless",
                            "throttles",
                            "incoming",
                            "valid"
                        ],
                        "answer_index": 0,
                        "explanation": "'Unless' is a subordinating conjunction connecting the main clause ('The microservice throttles incoming requests') with the dependent conditional clause ('the client supplies a valid API key')."
                    },
                    {
                        "question_text": "Select the sentence with correct adverbial modification:",
                        "description": "Distinguish adjective vs adverb placement.",
                        "options": [
                            "The data pipeline processes concurrent streams efficiently.",
                            "The data pipeline processes concurrent streams efficient.",
                            "The data pipeline processes concurrent efficiently streams.",
                            "The efficient data pipeline processes stream efficiently fast."
                        ],
                        "answer_index": 0,
                        "explanation": "'Efficiently' is an adverb correctly modifying the action verb 'processes'. Using the adjective 'efficient' to modify an action verb is grammatically incorrect."
                    },
                    {
                        "question_text": "Which sentence features correct pronoun-antecedent agreement?",
                        "description": "Ensure gender-neutral and singular/plural pronoun agreement.",
                        "options": [
                            "Each software engineer must submit their pull request before the code freeze.",
                            "Each software engineer must submit their pull requests before they're code freeze.",
                            "All software engineers must submit his pull request before the code freeze.",
                            "Every engineer must submit its pull request before the code freeze."
                        ],
                        "answer_index": 0,
                        "explanation": "In modern professional English, the singular 'their' is standard and recognized for indefinite singular antecedents like 'Each software engineer'."
                    }
                ]
            },
            {
                "lesson_number": 6,
                "title": "Sentence Building & Syntactic Connectors",
                "description": "Conjunctions, relative clauses, avoiding comma splices, and parallel sentence structure.",
                "questions": [
                    {
                        "question_text": "Which sentence correctly repairs the comma splice error below?\n\n'The database migration finished successfully, the web application resumed traffic.'",
                        "description": "Identify correct coordination and subordination techniques.",
                        "options": [
                            "The database migration finished successfully; subsequently, the web application resumed traffic.",
                            "The database migration finished successfully, however the web application resumed traffic.",
                            "The database migration finished successfully, so then the web application resumed traffic.",
                            "The database migration finished successfully the web application resumed traffic."
                        ],
                        "answer_index": 0,
                        "explanation": "Two independent clauses cannot be joined solely by a comma (a comma splice). Using a semicolon followed by a conjunctive adverb ('subsequently') and a comma creates a grammatically sound compound sentence."
                    },
                    {
                        "question_text": "Which sentence correctly uses a restrictive relative clause with 'that' versus a non-restrictive clause with 'which'?",
                        "description": "Distinguish restrictive and non-restrictive relative clauses.",
                        "options": [
                            "The authentication service that handles biometric tokens was updated yesterday, whereas the legacy service, which will be decommissioned next month, was untouched.",
                            "The authentication service which handles biometric tokens was updated yesterday, whereas the legacy service that will be decommissioned next month, was untouched.",
                            "The authentication service, that handles biometric tokens, was updated yesterday.",
                            "The legacy service which, will be decommissioned, was untouched."
                        ],
                        "answer_index": 0,
                        "explanation": "'That' introduces restrictive clauses essential to identifying the subject (no commas). 'Which' introduces non-restrictive clauses that provide supplementary non-essential details (set off by commas)."
                    },
                    {
                        "question_text": "Identify the sentence that contains a dangling modifier:",
                        "description": "Detect dangling participial phrases in technical descriptions.",
                        "options": [
                            "While refactoring the payment module, an unhandled NullPointerException was discovered by Sarah.",
                            "While refactoring the payment module, Sarah discovered an unhandled NullPointerException.",
                            "While Sarah was refactoring the payment module, she discovered an unhandled NullPointerException.",
                            "Sarah discovered an unhandled NullPointerException while refactoring the payment module."
                        ],
                        "answer_index": 0,
                        "explanation": "In option A, 'While refactoring the payment module' precedes 'an unhandled NullPointerException', implying grammatically that the exception was refactoring the module. Options B, C, and D correctly bind the action to Sarah."
                    },
                    {
                        "question_text": "What is the function of the transition word 'consequently' in technical discourse?",
                        "description": "Analyze logical connectors and cause-and-effect transitions.",
                        "options": [
                            "It introduces a direct causal result or effect of the preceding statement.",
                            "It introduces a contrasting viewpoint.",
                            "It enumerates a chronological sequence of unrelated steps.",
                            "It emphasizes a concession."
                        ],
                        "answer_index": 0,
                        "explanation": "'Consequently' is a conjunctive adverb indicating that the upcoming clause is a direct consequence or outcome of what was previously stated."
                    },
                    {
                        "question_text": "Choose the sentence that maintains parallel grammatical structure in technical documentation:",
                        "description": "Enforce parallel structure in bulleted or coordinated technical lists.",
                        "options": [
                            "The automated pipeline builds the source code, executes unit tests, and deploys the container artifact.",
                            "The automated pipeline builds the source code, executing unit tests, and deploys the container artifact.",
                            "The automated pipeline builds the source code, executes unit tests, and deployment of container artifacts.",
                            "The automated pipeline building source code, executes unit tests, and to deploy artifacts."
                        ],
                        "answer_index": 0,
                        "explanation": "Parallel structure requires all items in a coordinate series to share the same grammatical form (third-person singular verbs: 'builds', 'executes', 'deploys')."
                    }
                ]
            },
            {
                "lesson_number": 7,
                "title": "Tenses Mastery & Temporal Precision",
                "description": "Past perfect sequences in incident reports, conditionals in post-mortems, and roadmap milestones.",
                "questions": [
                    {
                        "question_text": "Select the sentence that correctly employs the past perfect tense to describe an incident sequence:",
                        "description": "Demonstrate temporal precedence in system post-mortems.",
                        "options": [
                            "By the time the site reliability engineer logged into the cluster, the automated watchdog had already terminated the hung process.",
                            "By the time the site reliability engineer had logged into the cluster, the automated watchdog terminated the hung process.",
                            "By the time the site reliability engineer logs into the cluster, the automated watchdog has already terminated the hung process.",
                            "By the time the site reliability engineer logged into the cluster, the automated watchdog terminates the hung process."
                        ],
                        "answer_index": 0,
                        "explanation": "The past perfect ('had already terminated') indicates an action that was finished prior to another past action ('logged into'). The watchdog's termination occurred before the engineer logged in."
                    },
                    {
                        "question_text": "Which sentence correctly demonstrates the third conditional for root cause analysis in a post-mortem?",
                        "description": "Construct unreal past conditional statements.",
                        "options": [
                            "If the load balancer had validated the payload size, the buffer overflow would not have occurred.",
                            "If the load balancer validated the payload size, the buffer overflow will not occur.",
                            "If the load balancer would have validated the payload size, the buffer overflow had not occurred.",
                            "If the load balancer had validated the payload size, the buffer overflow did not occur."
                        ],
                        "answer_index": 0,
                        "explanation": "The third conditional (unreal past) follows the pattern: 'If + past perfect, would have + past participle'. It evaluates what would have happened if past circumstances had been different."
                    },
                    {
                        "question_text": "Choose the sentence that properly distinguishes between the simple past and present perfect:",
                        "description": "Differentiate completed historical events from ongoing states.",
                        "options": [
                            "We released version 2.4 last Tuesday, and our uptime has remained at 99.99% since that deployment.",
                            "We have released version 2.4 last Tuesday, and our uptime remained at 99.99% since that deployment.",
                            "We released version 2.4 last Tuesday, and our uptime remained at 99.99% since that deployment.",
                            "We had released version 2.4 last Tuesday, and our uptime has remained at 99.99% since that deployment."
                        ],
                        "answer_index": 0,
                        "explanation": "A specific past timestamp ('last Tuesday') requires the simple past ('released'). An ongoing condition starting in the past and continuing to the present ('since that deployment') requires the present perfect ('has remained')."
                    },
                    {
                        "question_text": "Which sentence accurately uses the future perfect tense to project roadmap completion?",
                        "description": "Express milestones completed before a specific future deadline.",
                        "options": [
                            "By the end of the fourth quarter, our DevOps team will have migrated all monolithic services to containerized pods.",
                            "By the end of the fourth quarter, our DevOps team will migrate all monolithic services to containerized pods.",
                            "By the end of the fourth quarter, our DevOps team will have been migrating all monolithic services to containerized pods.",
                            "By the end of the fourth quarter, our DevOps team has migrated all monolithic services to containerized pods."
                        ],
                        "answer_index": 0,
                        "explanation": "The future perfect ('will have migrated') expresses that an action will be completed prior to a designated future time ('By the end of the fourth quarter')."
                    },
                    {
                        "question_text": "Identify the sentence that correctly expresses habitual technical actions using the simple present:",
                        "description": "State invariant technical truths and algorithmic facts.",
                        "options": [
                            "When a node fails health checks, the orchestrator redistributes active worker pods to healthy nodes.",
                            "When a node is failing health checks, the orchestrator had redistributed active worker pods.",
                            "When a node will fail health checks, the orchestrator redistributes active worker pods.",
                            "When a node failed health checks, the orchestrator will redistribute active worker pods."
                        ],
                        "answer_index": 0,
                        "explanation": "Standard technical specifications and automated state transitions use the zero conditional with simple present verbs in both clauses to declare invariant rules."
                    }
                ]
            },
            {
                "lesson_number": 8,
                "title": "Technical Reading Comprehension & Synthesis",
                "description": "Analyzing RFC specifications, architectural decision trade-offs, and failure-isolation patterns.",
                "questions": [
                    {
                        "question_text": "Read the architectural excerpt below:\n\n'In an event-driven microservices architecture, eventual consistency ensures that all storage replicas converge to identical state given sufficient time, trading immediate linearizability for low-latency writes and high partition tolerance.'\n\nAccording to this passage, what fundamental trade-off does eventual consistency accept?",
                        "description": "Synthesize distributed systems architectural trade-offs.",
                        "options": [
                            "It sacrifices immediate linearizability (instantaneous global consistency) to achieve low-latency writes and partition tolerance.",
                            "It sacrifices network partition tolerance to guarantee instantaneous ACID transactions across all nodes.",
                            "It eliminates network latency completely by avoiding data replication.",
                            "It guarantees that all read requests reflect the latest write immediately without delay."
                        ],
                        "answer_index": 0,
                        "explanation": "The passage explicitly states that eventual consistency trades 'immediate linearizability' in exchange for 'low-latency writes and high partition tolerance' under the CAP theorem."
                    },
                    {
                        "question_text": "Read the excerpt regarding the Circuit Breaker pattern:\n\n'When downstream remote procedure call (RPC) failure rates exceed a preconfigured threshold, the circuit breaker transitions from CLOSED to OPEN. In the OPEN state, inbound calls fail immediately without attempting network transport, protecting downstream resources from cascade failure.'\n\nWhat is the primary benefit of the OPEN state?",
                        "description": "Analyze failure-isolation patterns from technical documentation.",
                        "options": [
                            "Failing fast to prevent resource exhaustion and stop cascading failures while the downstream service recovers.",
                            "Retrying failed network requests indefinitely until the downstream server responds.",
                            "Increasing network bandwidth by batching concurrent requests together.",
                            "Encrypting payload contents before sending across untrusted boundaries."
                        ],
                        "answer_index": 0,
                        "explanation": "The circuit breaker's OPEN state prevents thread pool and connection starvation by failing fast immediately, protecting both upstream callers and downstream recovering services."
                    },
                    {
                        "question_text": "In technical RFC specifications, what does the key requirement word 'MUST NOT' denote according to RFC 2119?",
                        "description": "Interpret standards track specification terminology (RFC 2119).",
                        "options": [
                            "An absolute, inviolable prohibition of the specification.",
                            "A suggested practice that may be ignored if convenient.",
                            "A deprecated legacy behavior that is optional.",
                            "A recommendation subject to individual developer preference."
                        ],
                        "answer_index": 0,
                        "explanation": "Per RFC 2119, 'MUST NOT' or 'SHALL NOT' means that the definition is an absolute prohibition of the specification for interoperability and compliance."
                    },
                    {
                        "question_text": "Read the following API documentation snippet:\n\n'An idempotent HTTP method is one where the side-effects of N identical requests are the same as for a single request. PUT and DELETE are idempotent; POST is inherently non-idempotent.'\n\nBased on this definition, what occurs if an identical PUT request is executed five times in sequence?",
                        "description": "Deduce side-effects from technical protocol definitions.",
                        "options": [
                            "The server-side system state remains identical to the state resulting from a single successful request.",
                            "Five distinct resource entities are created in the database.",
                            "The server returns an HTTP 500 error on the second invocation.",
                            "The network connection is permanently closed by the gateway."
                        ],
                        "answer_index": 0,
                        "explanation": "Idempotence guarantees that repeated identical requests produce the exact same server-side outcome as a single request."
                    },
                    {
                        "question_text": "Read the database indexing documentation:\n\n'B-Tree indexes maintain sorted key-value pointers, providing O(log N) lookup time for equality and range queries. However, each supplementary secondary index incurs a write penalty on INSERT, UPDATE, and DELETE operations as index pages must be updated and rebalanced.'\n\nWhat synthesis accurately captures the operational trade-off of secondary indexes?",
                        "description": "Evaluate operational compromises between query and ingestion velocity.",
                        "options": [
                            "Secondary indexes accelerate read and range queries at the cost of diminished write and ingestion throughput.",
                            "Secondary indexes improve write throughput while slowing down read queries.",
                            "Secondary indexes eliminate the need for primary keys on large tables.",
                            "Secondary indexes guarantee O(1) constant-time writes for all transactions."
                        ],
                        "answer_index": 0,
                        "explanation": "The documentation clearly explains that while reads become faster (O(log N)), every write incurs an overhead because the database must update and rebalance the index structures."
                    }
                ]
            }
        ]
    }
}
