"""
Rich, structured theory and tutorial content for all 24 chapters of Python, Java, and C++.
"""

THEORIES = {
    "Python": {
        1: """
<h3>Chapter Overview: Python Syntax, Indentation & Variable Scope</h3>
<p>Python was designed with an emphasis on code readability. Unlike languages such as C++ or Java that rely on curly braces <code>{}</code> to delimit code blocks, Python uses whitespace <strong>indentation</strong> to enforce clean, readable nesting.</p>

<div class="theory-callout">
  <strong>Key Rule (PEP 8):</strong> Always use 4 consecutive spaces per indentation level. Never mix hard tabs and spaces in Python 3, as doing so raises an <code>IndentationError: unexpected indent</code> or <code>TabError</code>.
</div>

<h4>1. Dynamic Typing & Variable Assignment</h4>
<p>In Python, you do not declare variable types explicitly. The interpreter infers the data type dynamically at runtime based on the value assigned:</p>
<pre><code class="language-python"># Dynamic typing example
x = 10           # x is an integer
x = "Bhasha AI"  # x is now re-bound to a string

# Multiple assignment & unpacking
a, b, c = 1, 2, 3
first, *middle, last = [10, 20, 30, 40, 50]
print(middle) # Output: [20, 30, 40]</code></pre>

<h4>2. Variable Scope: Local vs Global & The <code>global</code> Keyword</h4>
<p>Variables declared inside a function have local scope. If you assign to a variable inside a function without declaring it <code>global</code>, Python assumes it is a new local variable, shadowing any outer variable of the same name:</p>
<pre><code class="language-python">count = 0

def increment():
    global count  # Binds 'count' to the global scope
    count += 1

increment()
print(count) # Output: 1</code></pre>

<h4>3. Object References vs Copies</h4>
<p>When you assign one variable to another (e.g. <code>b = a</code>), Python creates a new reference pointing to the exact same object in memory. For mutable objects like lists or dictionaries, mutating <code>b</code> also mutates <code>a</code>:</p>
<pre><code class="language-python">list1 = [1, 2, 3]
list2 = list1         # Points to the same list in memory
list2.append(4)
print(list1)          # Output: [1, 2, 3, 4] (Both changed!)</code></pre>
""",

        2: """
<h3>Chapter Overview: Data Types, Numbers & Type Casting</h3>
<p>Python has several built-in numeric data types: integers (<code>int</code>), floating-point numbers (<code>float</code>), and complex numbers (<code>complex</code>). Understanding how Python manages numeric precision and casting is crucial for bug-free algorithms.</p>

<h4>1. Numeric Types & Operators</h4>
<ul>
  <li><code>int</code>: Arbitrary-precision integers (no 32-bit or 64-bit overflow limit in Python 3).</li>
  <li><code>float</code>: 64-bit IEEE 754 floating-point values.</li>
  <li><code>complex</code>: Numbers with real and imaginary parts denoted by <code>j</code>, e.g. <code>z = 3 + 4j</code>.</li>
</ul>

<h4>2. Division: True Division (/) vs Floor Division (//)</h4>
<pre><code class="language-python"># True division always returns a float
print(7 / 2)   # 3.5

# Floor division truncates towards negative infinity, returning an int
print(7 // 2)  # 3
print(-7 // 2) # -4 (rounded down away from zero)

# Modulo operator computes remainder
print(7 % 2)   # 1</code></pre>

<h4>3. Explicit Type Casting & Radix Parsing</h4>
<p>You can cast data types explicitly using constructor functions like <code>int()</code>, <code>float()</code>, and <code>str()</code>. The <code>int()</code> function also accepts a base argument to convert binary, octal, or hex strings:</p>
<pre><code class="language-python"># Radix casting
binary_num = int("1010", 2) # Parsed as base-2 binary: yields 10
hex_num = int("1A", 16)     # Parsed as base-16 hex: yields 26

# Float casting with infinity
inf_val = float("inf")
print(inf_val > 1e308) # True (inf exceeds all finite numbers)</code></pre>

<div class="theory-callout">
  <strong>Truthy vs Falsy Values:</strong> In Python, empty collections (<code>[]</code>, <code>()</code>, <code>{}</code>, <code>""</code>), numeric zero (<code>0</code>, <code>0.0</code>), and <code>None</code> evaluate to <code>False</code> in boolean contexts. Everything else evaluates to <code>True</code>!
</div>
""",

        3: """
<h3>Chapter Overview: Operators, Booleans & Advanced String Slicing</h3>
<p>Strings in Python are ordered sequences of Unicode characters. They are strictly <strong>immutable</strong>—once created, their individual characters cannot be modified in place.</p>

<h4>1. Extended String Slicing (<code>[start:stop:step]</code>)</h4>
<p>Python slicing syntax allows you to extract sub-sequences using a start index (inclusive), stop index (exclusive), and an optional step (stride):</p>
<pre><code class="language-python">text = "BhashaAcademy"

# [start:stop:step]
print(text[1:8:2])  # Indices 1, 3, 5, 7 -> "hshA"

# Reversing a string with negative step
reversed_str = text[::-1]
print(reversed_str) # "ymedacAahsahB"</code></pre>

<h4>2. Identity (<code>is</code>) vs Equality (<code>==</code>)</h4>
<ul>
  <li><code>==</code> compares <strong>values</strong> (whether two objects contain the same data).</li>
  <li><code>is</code> compares <strong>memory identity</strong> (whether both variables point to the exact same memory address via <code>id()</code>).</li>
</ul>
<pre><code class="language-python">a = [1, 2, 3]
b = [1, 2, 3]
print(a == b) # True (same contents)
print(a is b) # False (distinct list instances in memory)</code></pre>

<h4>3. Modern f-Strings & Formatting</h4>
<pre><code class="language-python">pi = 3.14159265
# Format float to 2 decimal places
print(f"Approximation: {pi:.2f}") # Output: "Approximation: 3.14"

# Short-circuit logical operators
# 'or' returns the first truthy operand; 'and' returns the first falsy operand
res = (0 or "fallback") and ("active" or "backup")
print(res) # Output: "active"</code></pre>
""",

        4: """
<h3>Chapter Overview: Conditionals & Structural Pattern Matching</h3>
<p>Decision making in Python is controlled by <code>if</code>, <code>elif</code>, and <code>else</code> statements, complemented by concise conditional expressions (ternary operators) and modern <code>match...case</code> structural pattern matching.</p>

<h4>1. Short-Hand Conditional Expressions (Ternary Operator)</h4>
<p>Syntax: <code>value_if_true if condition else value_if_false</code></p>
<pre><code class="language-python">age = 17
status = "Adult" if age >= 18 else "Minor" if age >= 13 else "Child"
print(status) # Output: "Minor"</code></pre>

<h4>2. Structural Pattern Matching (Python 3.10+)</h4>
<p>Python's <code>match...case</code> statement matches values against structured patterns with optional guards:</p>
<pre><code class="language-python">command = "start"

match command:
    case "start":
        print("System initialized")
    case "stop" | "halt":
        print("System shutting down")
    case _:
        # Underscore '_' is the wildcard default case
        print("Unknown command")</code></pre>

<h4>3. Chained Comparisons</h4>
<p>Python evaluates chained relational operators seamlessly without requiring explicit <code>and</code> operators:</p>
<pre><code class="language-python">x = 5
# Evaluates as: (1 < x) and (x < 10) and (10 == 10)
print(1 < x < 10 == 10) # True</code></pre>
""",

        5: """
<h3>Chapter Overview: Loops, Iterators & Comprehensions</h3>
<p>Python provides two fundamental loop constructs: <code>for</code> loops (used for iterating over iterables and sequences) and <code>while</code> loops (used for condition-driven iteration).</p>

<h4>1. The <code>for...else</code> and <code>while...else</code> Construct</h4>
<p>A unique feature in Python is the loop <code>else</code> clause. The <code>else</code> block executes <strong>only if the loop finishes naturally</strong> without hitting a <code>break</code> statement:</p>
<pre><code class="language-python"># Search with loop-else
for item in [1, 3, 5]:
    if item == 4:
        print("Found 4!")
        break
else:
    print("4 was not found in the list.") # Executes!</code></pre>

<h4>2. List Comprehensions & Generator Expressions</h4>
<p>List comprehensions provide an elegant syntax to transform and filter collections into new lists in a single line:</p>
<pre><code class="language-python"># List comprehension: constructed immediately in memory
squares = [x**2 for x in range(10) if x % 2 == 0]
print(squares) # [0, 4, 16, 36, 64]

# Generator expression: evaluated lazily on demand
gen = (x**2 for x in range(1000000))
print(next(gen)) # 0 (uses negligible memory!)</code></pre>

<div class="theory-callout">
  <strong>Pitfall: Modifying a List During Iteration:</strong> Never remove or insert items into a list while iterating over it directly with <code>for item in my_list</code>. Removing shifts indices and causes elements to be skipped. Iterate over a slice copy <code>my_list[:]</code> instead.
</div>
""",

        6: """
<h3>Chapter Overview: Functions, *args, **kwargs & Scope</h3>
<p>Functions are first-class citizens in Python—they can be passed as arguments, assigned to variables, and returned from other functions.</p>

<h4>1. The Mutable Default Argument Trap</h4>
<p>Default parameter values are evaluated <strong>once</strong> when the function is defined, not on every call. If you use a mutable default like a list or dictionary, changes persist across calls:</p>
<pre><code class="language-python"># BAD PRACTICE:
def add_item(val, target=[]):
    target.append(val)
    return target

# CORRECT IDIOM:
def add_item_safe(val, target=None):
    if target is None:
        target = []
    target.append(val)
    return target</code></pre>

<h4>2. Variable Arguments: <code>*args</code> and <code>**kwargs</code></h4>
<ul>
  <li><code>*args</code> packs arbitrary positional arguments into a <strong>tuple</strong>.</li>
  <li><code>**kwargs</code> packs arbitrary keyword arguments into a <strong>dictionary</strong>.</li>
</ul>
<pre><code class="language-python">def report(title, *scores, **metadata):
    print("Title:", title)
    print("Scores tuple:", scores)
    print("Metadata dict:", metadata)

report("Math", 95, 88, 92, scholar="Harshit", level=4)</code></pre>

<h4>3. Lambda Expressions & Higher-Order Functions</h4>
<p>Anonymous one-line functions defined with <code>lambda</code> are often used with <code>map()</code>, <code>filter()</code>, and sorting:</p>
<pre><code class="language-python">nums = [1, 2, 3, 4]
doubled = list(map(lambda x: x * 2, nums)) # [2, 4, 6, 8]</code></pre>
""",

        7: """
<h3>Chapter Overview: Collections: Lists, Tuples, Sets & Dictionaries</h3>
<p>Python offers four primary built-in collection data types, each with distinct performance characteristics, mutability rules, and indexing guarantees.</p>

<table>
  <thead>
    <tr><th>Collection</th><th>Ordered?</th><th>Mutable?</th><th>Duplicates?</th><th>Lookup Time</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>List</strong> <code>[]</code></td><td>Yes</td><td>Yes</td><td>Allowed</td><td>O(n) search</td></tr>
    <tr><td><strong>Tuple</strong> <code>()</code></td><td>Yes</td><td>No (Immutable)</td><td>Allowed</td><td>O(n) search</td></tr>
    <tr><td><strong>Set</strong> <code>{}</code></td><td>No</td><td>Yes</td><td>Unique only</td><td>O(1) average hash lookup</td></tr>
    <tr><td><strong>Dictionary</strong> <code>{k: v}</code></td><td>Yes (3.7+)</td><td>Yes (Keys immutable)</td><td>Keys unique</td><td>O(1) average hash lookup</td></tr>
  </tbody>
</table>

<h4>1. Safe Dictionary Access with <code>.get()</code></h4>
<pre><code class="language-python">scores = {"Alice": 90, "Bob": 85}
# Using [] raises KeyError if key is missing:
# print(scores["Charlie"]) -> KeyError!

# .get() safely returns a default fallback:
print(scores.get("Charlie", 0)) # Output: 0</code></pre>

<h4>2. Set Algebraic Operations</h4>
<pre><code class="language-python">a = {1, 2, 3}
b = {3, 4, 5}
print(a | b) # Union: {1, 2, 3, 4, 5}
print(a & b) # Intersection: {3}
print(a - b) # Difference: {1, 2}
print(a ^ b) # Symmetric Difference: {1, 2, 4, 5}</code></pre>
""",

        8: """
<h3>Chapter Overview: OOP: Classes, Inheritance & Dunder Methods</h3>
<p>Object-Oriented Programming in Python centers on classes that bundle state (attributes) and behavior (methods) together into reusable blueprints.</p>

<h4>1. The <code>__init__</code> Constructor & The <code>self</code> Parameter</h4>
<p><code>self</code> represents the specific instance of the class being created or called:</p>
<pre><code class="language-python">class Scholar:
    # Class attribute (shared by all instances)
    academy = "Royal Academy of Code"

    def __init__(self, name, track):
        # Instance attributes (unique to each instance)
        self.name = name
        self.track = track

    def __str__(self):
        # Dunder method invoked by print() and str()
        return f"{self.name} mastering {self.track}"</code></pre>

<h4>2. Inheritance & The <code>super()</code> Method</h4>
<pre><code class="language-python">class Person:
    def __init__(self, name):
        self.name = name

    def get_role(self):
        return "Member"

class Student(Person):
    def __init__(self, name, grade):
        super().__init__(name) # Delegate to parent constructor
        self.grade = grade

    def get_role(self):
        return super().get_role() + " -> Student"</code></pre>

<div class="theory-callout">
  <strong>Name Mangling:</strong> Prefixing an attribute with two leading underscores (e.g. <code>self.__secret</code>) causes Python to internally rename it as <code>_ClassName__secret</code> to prevent accidental overrides in derived subclasses.
</div>
"""
    },

    "Java": {
        1: """
<h3>Chapter Overview: Java Syntax, Output & JVM Entrypoint</h3>
<p>Java is a statically typed, class-based, object-oriented language. Source code (<code>.java</code>) is compiled by <code>javac</code> into platform-independent bytecode (<code>.class</code>), which is executed by the <strong>Java Virtual Machine (JVM)</strong>.</p>

<h4>1. Anatomy of the Main Method</h4>
<pre><code class="language-java">public class Main {
    // JVM entrypoint
    public static void main(String[] args) {
        System.out.println("Hello, Royal Academy!");
    }
}</code></pre>
<ul>
  <li><code>public</code>: Access modifier allowing the JVM to invoke the method from outside the package.</li>
  <li><code>static</code>: Allows the JVM to call the method without instantiating an object of the class.</li>
  <li><code>void</code>: The method returns no value upon completion.</li>
  <li><code>String[] args</code>: Array of command-line arguments passed to the program.</li>
</ul>

<h4>2. Output Streams: <code>print</code> vs <code>println</code></h4>
<pre><code class="language-java">System.out.print("A");   // Outputs 'A' without adding a newline
System.out.println("B"); // Outputs 'B' and advances cursor to next line
System.out.print("C");   // Printed on the next line! Output: AB then C</code></pre>
""",

        2: """
<h3>Chapter Overview: Variables, Data Types & Type Casting</h3>
<p>Java enforces strict static typing. Every variable must have a declared type before it can be used. Java features two data type categories: <strong>8 Primitive Types</strong> and <strong>Reference Types</strong>.</p>

<h4>1. The 8 Primitive Types</h4>
<ul>
  <li><code>byte</code> (8 bits, -128 to 127)</li>
  <li><code>short</code> (16 bits, -32,768 to 32,767)</li>
  <li><code>int</code> (32 bits, -2^31 to 2^31-1) — standard integer type</li>
  <li><code>long</code> (64 bits, suffix with <code>L</code>)</li>
  <li><code>float</code> (32-bit floating point, suffix with <code>f</code>)</li>
  <li><code>double</code> (64-bit floating point) — standard decimal type</li>
  <li><code>boolean</code> (true or false, defaults to false for instance fields)</li>
  <li><code>char</code> (16-bit Unicode character, e.g. <code>'A'</code>)</li>
</ul>

<h4>2. Widening vs Narrowing Casting</h4>
<pre><code class="language-java">// Widening (Implicit / Automatic): smaller type to larger type
int myInt = 9;
double myDouble = myInt; // Automatic casting to 9.0

// Narrowing (Explicit / Manual): larger type to smaller type
double d = 9.99;
int truncated = (int) d; // Truncates decimal part -> 9

// Integer Overflow Wraparound:
byte b = 127;
b++; // Overflows in two's complement -> -128!</code></pre>
""",

        3: """
<h3>Chapter Overview: Operators & Strings (Immutability & String Pool)</h3>
<p>In Java, <code>String</code> is a reference object representing an immutable sequence of characters. Once created, a String cannot be altered in memory.</p>

<h4>1. String Constant Pool vs The Heap</h4>
<pre><code class="language-java">String s1 = "Bhasha";               // Stored in String Constant Pool
String s2 = "Bhasha";               // Reuses cached reference in pool
String s3 = new String("Bhasha");   // Force-allocates a new object on the heap

System.out.println(s1 == s2);       // true (same memory address)
System.out.println(s1 == s3);       // false (different heap instances!)
System.out.println(s1.equals(s3));  // true (compares actual character content)</code></pre>

<h4>2. Operator Precedence in String Concatenation</h4>
<p>The <code>+</code> operator evaluates left-to-right. If one operand is a String, numeric addition transitions into string concatenation:</p>
<pre><code class="language-java">System.out.println(10 + 20 + "Java"); // "30Java" (10+20=30, then string concat)
System.out.println("Java" + 10 + 20); // "Java1020" ("Java"+10="Java10", then +20)</code></pre>

<div class="theory-callout">
  <strong>Performance Tip:</strong> For high-frequency string concatenation inside loops, avoid <code>String +</code>. Use <code>StringBuilder</code> (fast, non-thread-safe) or <code>StringBuffer</code> (synchronized, thread-safe).
</div>
""",

        4: """
<h3>Chapter Overview: Decision Making: if...else & Switch Statements</h3>
<p>Decision making enables programs to execute distinct code paths depending on boolean conditions or evaluated integral expressions.</p>

<h4>1. The <code>switch</code> Statement & Fallthrough</h4>
<p>If a <code>case</code> block does not end with a <code>break</code> statement, execution continues seamlessly into the next case regardless of the condition—this is known as <strong>fallthrough</strong>:</p>
<pre><code class="language-java">int level = 2;
switch (level) {
    case 1: System.out.print("Bronze ");
    case 2: System.out.print("Silver "); // Matches
    case 3: System.out.print("Gold ");   // Falls through!
    default: System.out.print("Member"); // Falls through!
}
// Output: "Silver Gold Member"</code></pre>

<h4>2. Supported Types in Java Switch</h4>
<p>You can switch on: <code>byte</code>, <code>short</code>, <code>char</code>, <code>int</code>, <code>enum</code> types, and <code>String</code>. You <strong>cannot</strong> switch on floating-point numbers (<code>float</code>, <code>double</code>) or <code>boolean</code>.</p>
""",

        5: """
<h3>Chapter Overview: Loops: while, do...while, for & for-each</h3>
<p>Loops repeat a block of code as long as a specified condition remains true.</p>

<h4>1. Pre-test vs Post-test Loops</h4>
<ul>
  <li><code>while</code>: Evaluates condition before executing the loop body. If false initially, it executes 0 times.</li>
  <li><code>do...while</code>: Evaluates condition at the bottom. <strong>Guaranteed to execute at least once!</strong></li>
</ul>

<h4>2. Enhanced for-each Loop & Fail-Fast Iterators</h4>
<pre><code class="language-java">int[] scores = {90, 85, 78};
for (int s : scores) {
    System.out.println(s);
}

// Labeled Break for nested loops:
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) break outer; // Breaks out of outer loop entirely
    }
}</code></pre>
""",

        6: """
<h3>Chapter Overview: Methods, Parameters & Method Overloading</h3>
<p>A method is a block of code that only runs when called. In Java, methods must be declared within a class.</p>

<h4>1. Java is Strictly Pass-by-Value</h4>
<p>When an argument is passed to a method, Java creates a copy of the value. For object references, a copy of the reference pointer is passed. Reassigning the parameter variable inside the method does not change the caller's reference:</p>
<pre><code class="language-java">void modify(int x) { x = 50; }
int n = 10;
modify(n);
System.out.println(n); // Output: 10 (unchanged!)</code></pre>

<h4>2. Method Overloading Rules</h4>
<p>Two methods can share the same name if their parameter lists differ in count or types. Changing only the return type is <strong>not</strong> valid overloading:</p>
<pre><code class="language-java">int add(int a, int b) { return a + b; }
double add(double a, double b) { return a + b; } // VALID
// double add(int a, int b) -> COMPILATION ERROR!</code></pre>
""",

        7: """
<h3>Chapter Overview: Classes, Objects, Constructors & 'this'</h3>
<p>A class is a blueprint for objects. Constructors are special methods called automatically when an object is instantiated using the <code>new</code> operator.</p>

<h4>1. Constructor Chaining with <code>this()</code></h4>
<pre><code class="language-java">public class Scholar {
    private String name;
    private int xp;

    public Scholar() {
        this("Guest", 100); // Must be the FIRST statement in constructor!
    }

    public Scholar(String name, int xp) {
        this.name = name;
        this.xp = xp;
    }
}</code></pre>

<h4>2. Static vs Instance Members</h4>
<p><code>static</code> variables and methods belong to the class itself and are shared across all instances. Static methods cannot reference <code>this</code> or call instance methods directly without an object reference.</p>
""",

        8: """
<h3>Chapter Overview: OOP: Encapsulation, Inheritance & Polymorphism</h3>
<p>The four core pillars of Object-Oriented Programming form the foundation of Java system architecture.</p>

<h4>1. Dynamic Method Dispatch (Runtime Polymorphism)</h4>
<pre><code class="language-java">class Animal {
    void sound() { System.out.println("Generic Sound"); }
}
class Dog extends Animal {
    @Override
    void sound() { System.out.println("Bark!"); }
}

Animal pet = new Dog();
pet.sound(); // Output: "Bark!" (Resolved at runtime based on actual object)</code></pre>

<h4>2. Abstract Classes vs Interfaces</h4>
<ul>
  <li>An <code>abstract class</code> can declare instance variables and concrete methods with state. A class can extend only one class.</li>
  <li>An <code>interface</code> defines a behavioral contract. A class can implement multiple interfaces.</li>
</ul>
"""
    },

    "C++": {
        1: """
<h3>Chapter Overview: C++ Syntax, Output (cout) & Input (cin)</h3>
<p>C++ is a compiled, general-purpose programming language developed by Bjarne Stroustrup as an extension of the C language. It provides direct memory manipulation, performance efficiency, and high-level object-oriented abstractions.</p>

<h4>1. Standard Streams: <code>std::cout</code> and <code>std::cin</code></h4>
<pre><code class="language-cpp">#include &lt;iostream&gt;

int main() {
    // '<<' is the stream insertion operator
    std::cout &lt;&lt; "Bhasha Academy" &lt;&lt; "\n";

    int score;
    // '>>' is the stream extraction operator
    std::cin &gt;&gt; score; 
    return 0; // 0 indicates successful execution
}</code></pre>

<h4>2. <code>std::endl</code> vs <code>'\\n'</code></h4>
<p><code>std::endl</code> outputs a newline AND flushes the internal output stream buffer. Using <code>std::endl</code> repeatedly in high-performance loops causes severe performance penalties due to frequent OS flush calls. Use <code>'\\n'</code> instead for fast output.</p>

<h4>3. Namespace Management</h4>
<p>Avoid putting <code>using namespace std;</code> in header files (<code>.h</code> / <code>.hpp</code>), because it pollutes the global namespace of every file that includes that header, causing naming collisions.</p>
""",

        2: """
<h3>Chapter Overview: Variables, Data Types, Constants & auto</h3>
<p>C++ is statically typed. In modern C++ (C++11 and beyond), the <code>auto</code> keyword enables compile-time type deduction based on the initializer expression.</p>

<h4>1. <code>const</code> vs <code>constexpr</code></h4>
<ul>
  <li><code>const</code> promises that an object's value will not be modified after initialization, but the value can be computed at runtime.</li>
  <li><code>constexpr</code> strictly guarantees that the value is evaluated at <strong>compile time</strong>, allowing it to be used in template parameters or fixed-size array dimensions.</li>
</ul>

<h4>2. Type Deduction with <code>auto</code></h4>
<pre><code class="language-cpp">int n = 42;
const int& ref = n;

auto a = ref;       // 'a' is deduced as 'int' (const and reference dropped!)
const auto& b = ref;// 'b' is deduced as 'const int&' (preserves reference)</code></pre>

<h4>3. Uniform Brace Initialization</h4>
<pre><code class="language-cpp">// Brace initialization prevents accidental narrowing conversions:
int x = 3.14;   // Compiles with warning, silently truncates to 3
// int y{3.14}; // COMPILATION ERROR! Narrowing from double to int prohibited</code></pre>
""",

        3: """
<h3>Chapter Overview: Operators & Expressions</h3>
<p>Operators in C++ operate directly on memory representations. Understanding evaluation rules and operator precedence prevents subtle logical bugs.</p>

<h4>1. Integer Division Truncation</h4>
<pre><code class="language-cpp">int a = 5, b = 2;
double res = a / b; // Both operands are int: integer division yields 2!
// res becomes 2.0, NOT 2.5!

// Fix: cast at least one operand to double
double fixed = static_cast&lt;double&gt;(a) / b; // Yields 2.5</code></pre>

<h4>2. Prefix (<code>++x</code>) vs Postfix (<code>x++</code>)</h4>
<ul>
  <li><code>++x</code> (Prefix): Increments the value and returns a reference to the updated object directly. (Faster for complex iterators).</li>
  <li><code>x++</code> (Postfix): Makes a copy of the old value, increments the original, and returns the copy.</li>
</ul>
""",

        4: """
<h3>Chapter Overview: Conditions & Switch Statements</h3>
<p>Conditionals direct the execution flow based on logical expressions.</p>

<h4>1. C++ Switch Statement Constraints</h4>
<p>In C++, a <code>switch</code> statement can ONLY evaluate integral or enumeration types (<code>int</code>, <code>char</code>, <code>enum</code>). You <strong>cannot</strong> switch directly on <code>std::string</code> or floating-point numbers.</p>

<h4>2. C++17 'if' with Initializer</h4>
<p>Modern C++ allows declaring a scoped variable directly within the if condition:</p>
<pre><code class="language-cpp">if (auto val = calculate(); val &gt; 100) {
    std::cout &lt;&lt; "High: " &lt;&lt; val;
} // 'val' goes out of scope and memory is cleaned up immediately!</code></pre>
""",

        5: """
<h3>Chapter Overview: Loops & Iteration (Range-based for)</h3>
<p>Loops repeat code blocks efficiently. Modern C++ heavily favors <strong>range-based for loops</strong> for safety and readability.</p>

<h4>1. Efficient Range-based For Loops</h4>
<pre><code class="language-cpp">std::vector&lt;std::string&gt; names = {"Aarav", "Priya", "Rohan"};

// POOR: creates a full copy of each string on every iteration
for (auto name : names) { ... }

// BEST PRACTICE: const reference prevents copying, guarantees read-only access
for (const auto& name : names) {
    std::cout &lt;&lt; name &lt;&lt; "\n";
}</code></pre>

<div class="theory-callout">
  <strong>Iterator Invalidation:</strong> Never add elements (e.g. <code>vec.push_back()</code>) to a <code>std::vector</code> while iterating over it with a range-for loop. Memory reallocation invalidates iterators, leading to undefined behavior or segmentation faults.
</div>
""",

        6: """
<h3>Chapter Overview: Functions, Parameters & Pass-by-Reference</h3>
<p>C++ allows fine-grained control over how function arguments are passed in memory.</p>

<h4>1. Pass-by-Value vs Pass-by-Reference</h4>
<pre><code class="language-cpp">// Pass-by-value: copies the argument; caller variable remains untouched
void increment(int x) { x++; }

// Pass-by-reference: binds directly to caller's memory address
void incrementReal(int& x) { x++; }

int val = 10;
increment(val);     // val is still 10
incrementReal(val); // val is now 11!</code></pre>

<h4>2. Pass-by-Const-Reference (<code>const Type&</code>)</h4>
<p>For large objects, structures, or strings, passing by <code>const Type&</code> avoids deep memory copying while ensuring the function cannot inadvertently mutate the caller's data.</p>
""",

        7: """
<h3>Chapter Overview: Pointers, References & Memory Addresses</h3>
<p>Pointers are variables that store the memory address of another variable. References serve as aliases for existing objects.</p>

<h4>1. Pointers vs References</h4>
<pre><code class="language-cpp">int val = 42;
int* ptr = &val;  // 'ptr' stores the memory address of 'val'
int& ref = val;   // 'ref' is an alias for 'val'

std::cout &lt;&lt; *ptr; // Dereference operator '*' yields 42
std::cout &lt;&lt; ref;  // Yields 42

// Difference:
// 1. References cannot be null; pointers can be nullptr
// 2. References cannot be reseated to point to another object</code></pre>

<h4>2. Pointer Arithmetic</h4>
<p>Adding an integer <code>n</code> to a pointer advances it by <code>n * sizeof(Type)</code> bytes:</p>
<pre><code class="language-cpp">int arr[] = {10, 20, 30, 40};
int* p = arr;   // Points to arr[0] (10)
p += 2;         // Advances 2 integers: points to arr[2]
std::cout &lt;&lt; *p; // Output: 30</code></pre>

<div class="theory-callout">
  <strong>Dangling Pointer Danger:</strong> Never return a pointer or reference to a local stack variable from a function. When the function returns, its stack frame is destroyed, leaving a dangling pointer pointing to invalid memory!
</div>
""",

        8: """
<h3>Chapter Overview: Classes, Objects, Constructors & Destructors</h3>
<p>C++ classes embody <strong>RAII (Resource Acquisition Is Initialization)</strong>—managing resources safely through constructor acquisition and automatic destructor cleanup.</p>

<h4>1. Access Specifiers: <code>class</code> vs <code>struct</code></h4>
<ul>
  <li>In a <code>class</code>, members and base classes default to <code>private</code>.</li>
  <li>In a <code>struct</code>, members and base classes default to <code>public</code>.</li>
</ul>

<h4>2. Member Initializer Lists & Destructors</h4>
<pre><code class="language-cpp">class FileBuffer {
private:
    char* buffer;
    size_t size;

public:
    // Member initializer list initializes fields upon creation
    FileBuffer(size_t s) : size(s), buffer(new char[s]) {
        std::cout &lt;&lt; "Memory allocated\n";
    }

    // Destructor '~' runs automatically when object is destroyed
    ~FileBuffer() {
        delete[] buffer; // Frees heap memory safely!
        std::cout &lt;&lt; "Memory freed\n";
    }
};</code></pre>

<h4>3. Virtual Destructors in Polymorphic Base Classes</h4>
<p>If a class has virtual functions and will be deleted through a base class pointer (<code>Base* b = new Derived(); delete b;</code>), the base class <strong>must</strong> have a virtual destructor (<code>virtual ~Base() = default;</code>) to prevent memory leaks from derived class members.</p>
"""
    },

    "English": {
        1: """
<h3>Chapter Overview: Basic Vocabulary & Syntax</h3>
<p>Clear communication is foundational for software engineering, documentation, code reviews, and international collaboration. Mastering parts of speech and basic sentence order enables developers to write unambiguous specifications and pull request descriptions.</p>

<div class="theory-callout">
  <strong>Core Principle:</strong> Standard English declarative sentences adhere to the <strong>Subject - Verb - Object (SVO)</strong> word order. Modifiers such as adverbs and adjectives must link clearly to the words they modify.
</div>

<h4>1. Subject-Verb Agreement</h4>
<p>Singular subjects take singular verbs; plural subjects take plural verbs. When prepositional phrases separate the subject and verb, the verb agrees with the true subject, not the object of the preposition:</p>
<pre><code class="language-text"># Correct: The list (singular) is ready
The list of microservice configurations is updated daily.

# Incorrect:
The list of microservice configurations are updated daily.</code></pre>

<h4>2. Countable vs Uncountable Quantifiers</h4>
<p>Use <strong>fewer</strong> with discrete countable nouns (e.g. <em>fewer allocations, fewer bugs, fewer servers</em>) and <strong>less</strong> with uncountable mass quantities (e.g. <em>less latency, less memory, less downtime</em>).</p>

<h4>3. Parts of Speech in Technical Contexts</h4>
<ul>
  <li><strong>Noun:</strong> Entity or state (e.g. <em>thread, cluster, database, parameter</em>).</li>
  <li><strong>Verb:</strong> Action or state of being (e.g. <em>compile, serialize, authenticate, benchmark</em>).</li>
  <li><strong>Adjective:</strong> Quality or attribute (e.g. <em>asynchronous, immutable, idempotent, recursive</em>).</li>
  <li><strong>Adverb:</strong> Modifies verbs, adjectives, or other adverbs (e.g. <em>concurrently, efficiently, dynamically</em>).</li>
</ul>
""",

        2: """
<h3>Chapter Overview: Greetings & Professional Introductions</h3>
<p>Professional communication in technology organizations requires navigating formal stakeholder relationships, cross-functional team meetings, and asynchronous remote collaboration with clarity and cultural awareness.</p>

<div class="theory-callout">
  <strong>Key Etiquette:</strong> Avoid 'hello-only' messages in remote chats like Slack or Teams. Provide the greeting, complete context, links, and specific question in your initial message.
</div>

<h4>1. Formal vs Semi-Formal Salutations</h4>
<ul>
  <li><strong>Formal (Executive / External Clients):</strong> <em>"Dear Dr. Watson," "Dear Mr. Vance," "Good morning, Board Members."</em></li>
  <li><strong>Semi-Formal (Internal Cross-Functional Teams):</strong> <em>"Hello Team," "Good morning everyone," "Hi Sarah."</em></li>
  <li><strong>Sign-offs:</strong> Use <em>"Best regards," "Kind regards,"</em> or <em>"Sincerely,"</em>. Avoid slang or abbreviations like <em>"Thx"</em> in formal documentation.</li>
</ul>

<h4>2. The 30-Second Technical Elevator Pitch</h4>
<p>When introducing yourself in standups or architectural reviews, structure your summary using the <strong>Role + Core Competency + Current Impact</strong> framework:</p>
<pre><code class="language-text">"Hello everyone, I am Priya, a backend software engineer specializing in 
distributed data streaming and low-latency cache synchronization. 
I am currently optimizing our payment settlement pipeline."</code></pre>

<h4>3. Setting Professional Boundaries & Polite Declines</h4>
<p>When declining non-urgent requests during critical incidents, acknowledge the request, state the constraint clearly, and provide an actionable next step:</p>
<pre><code class="language-text">"I am currently mitigating a production incident, but I would be glad to 
review the architecture proposal asynchronously or sync tomorrow at 10:00 AM."</code></pre>
""",

        3: """
<h3>Chapter Overview: Numbers, Quantifiers & Data Metrics</h3>
<p>Software performance benchmarks, SLAs, error budgets, and financial reporting depend on exact mathematical and linguistic precision. Ambiguity in expressing data metrics can misrepresent system health to leadership.</p>

<div class="theory-callout">
  <strong>Metric Rule:</strong> Use <em>fewer</em> and <em>number of</em> for countable items; use <em>less</em> and <em>amount of</em> for continuous quantities.
</div>

<h4>1. Quantifiers: Number vs Amount</h4>
<ul>
  <li><strong>Number of:</strong> Countable entities (e.g. <em>a high number of HTTP requests, a large number of nodes</em>).</li>
  <li><strong>Amount of:</strong> Uncountable measures (e.g. <em>a significant amount of network traffic, a minimal amount of jitter</em>).</li>
</ul>

<h4>2. Percentages & Prepositions: 'By' vs 'To'</h4>
<pre><code class="language-text"># Initial latency: 200ms -> Final latency: 50ms
Latency decreased BY 150ms (or BY 75%). # The difference / delta
Latency decreased TO 50ms (or TO 25% of baseline). # The ending point</code></pre>

<h4>3. Compound Numerical Adjectives</h4>
<p>When a number and a unit form a compound modifier before a noun, hyphenate the modifier and keep the unit in the singular form:</p>
<ul>
  <li><em>A thirty-second timeout</em> (NOT <em>thirty-seconds timeout</em>)</li>
  <li><em>A four-core processor</em> (NOT <em>four-cores processor</em>)</li>
  <li><em>A twenty-gigabyte heap allocation</em></li>
</ul>
""",

        4: """
<h3>Chapter Overview: Everyday Conversations & Collocations</h3>
<p>Collocations are natural pairings of words that native speakers instinctively use together. Using established technical collocations makes engineering discussions, documentation, and pull request reviews sound fluent and authoritative.</p>

<div class="theory-callout">
  <strong>Collocation Distinction:</strong> We <em>throw</em> or <em>raise</em> an exception (never <em>make</em> an exception in code). We <em>meet</em> or <em>miss</em> a deadline (never <em>catch</em> a deadline).
</div>

<h4>1. Essential Engineering Collocations</h4>
<ul>
  <li><strong>Exceptions:</strong> <em>throw an exception, catch an exception, raise an error</em>.</li>
  <li><strong>System State:</strong> <em>address a bottleneck, mitigate a vulnerability, reproduce a bug, spin up a container</em>.</li>
  <li><strong>Project Management:</strong> <em>meet a deadline, scope a feature, manage trade-offs, conduct an audit</em>.</li>
</ul>

<h4>2. Empathy and Constructive Peer Review</h4>
<p>Code reviews should critique the code, not the author. Frame suggestions collaboratively using open questions:</p>
<pre><code class="language-text"># Collaborative & Constructive:
"Could we consider extracting this nested loop into a helper method to simplify unit testing?"
"What do you think about memoizing this calculation to prevent redundant database round-trips?"

# Unproductive & Accusatory:
"Your code is messy and breaks production."</code></pre>

<h4>3. Idiomatic Engineering Terms: Technical Debt</h4>
<p><strong>Technical debt</strong> refers to the future cost of rework caused by choosing an expedited, suboptimal solution now over a better architectural approach. Teams <em>incur</em> technical debt, <em>manage</em> it, and eventually <em>pay it down</em> through systematic refactoring.</p>
""",

        5: """
<h3>Chapter Overview: Grammar Basics: Parts of Speech & Prepositions</h3>
<p>Prepositions define temporal, spatial, and logical relationships between system components. Modal auxiliary verbs establish the degree of certainty, obligation, or permission in architectural specifications.</p>

<div class="theory-callout">
  <strong>Preposition Precision:</strong> Systems are dependent <em>on</em>, compatible <em>with</em>, compliant <em>with</em>, and adhere <em>to</em> standards.
</div>

<h4>1. Prepositions of Time & Location</h4>
<ul>
  <li><strong>At:</strong> Exact times and specific endpoints (<em>at 03:00 UTC, at the root endpoint</em>).</li>
  <li><strong>On:</strong> Specific days and host systems (<em>on Sunday, deployed on bare-metal servers</em>).</li>
  <li><strong>In:</strong> Regions, containers, and memory (<em>in the EU-West datacenter, in memory, in SQLite</em>).</li>
</ul>

<h4>2. Modal Auxiliary Verbs in Standards (IETF RFC 2119)</h4>
<ul>
  <li><strong>MUST / REQUIRED:</strong> An absolute mandate for conformance.</li>
  <li><strong>SHOULD / RECOMMENDED:</strong> A strong recommendation; deviations require documented justification.</li>
  <li><strong>MAY / OPTIONAL:</strong> A permissible option with no penalty for omission.</li>
</ul>

<h4>3. Objective vs Subjective Pronouns</h4>
<p>Ensure correct pronoun cases in compound phrases by testing each pronoun independently:</p>
<pre><code class="language-text"># Correct: The architect invited Sarah and me (invite me, not invite I)
The architect invited Sarah and me to evaluate the GraphQL schema.

# Incorrect:
The architect invited Sarah and I to evaluate the GraphQL schema.</code></pre>
""",

        6: """
<h3>Chapter Overview: Sentence Building & Syntactic Connectors</h3>
<p>Complex engineering proposals and technical documentation require syntactic variety. Connecting clauses logically without falling into comma splices, run-ons, or dangling modifiers ensures effortless readability for reviewers.</p>

<div class="theory-callout">
  <strong>Fixing Comma Splices:</strong> Never join two independent clauses with only a comma. Use a semicolon (<code>;</code>), a period (<code>.</code>), or a comma followed by a coordinating conjunction (<em>and, but, so, yet</em>).
</div>

<h4>1. Coordinating Conjunctions (FANBOYS)</h4>
<p>Join independent clauses of equal grammatical rank: <strong>F</strong>or, <strong>A</strong>nd, <strong>N</strong>or, <strong>B</strong>ut, <strong>O</strong>r, <strong>Y</strong>et, <strong>S</strong>o.</p>
<pre><code class="language-text">The unit test suite completed in 400ms, BUT the staging database rejected the migration.</code></pre>

<h4>2. Subordinating Conjunctions</h4>
<p>Subordinating conjunctions introduce condition, contrast, or causality: <em>although, because, whereas, unless, while, since</em>.</p>
<pre><code class="language-text">The API gateway will drop incoming payloads UNLESS the client includes a valid bearer token.</code></pre>

<h4>3. Restrictive vs Non-Restrictive Relative Clauses</h4>
<ul>
  <li><strong>Restrictive (That, no commas):</strong> Essential to identifying the subject: <em>"The service that processes billing must be PCI-DSS compliant."</em></li>
  <li><strong>Non-Restrictive (Which, with commas):</strong> Adds optional supplementary information: <em>"The billing service, which was refactored last month, passed the penetration audit."</em></li>
</ul>
""",

        7: """
<h3>Chapter Overview: Tenses Mastery & Temporal Precision</h3>
<p>Software incident reports and release summaries communicate timeline sequences. Selecting the appropriate grammatical aspect (simple, continuous, perfect, or conditional) clarifies cause and effect across asynchronous events.</p>

<div class="theory-callout">
  <strong>Sequence Rule:</strong> Use the <strong>Past Perfect</strong> (<em>had + past participle</em>) to describe an event that concluded before another past event began.
</div>

<h4>1. Present Perfect vs Simple Past</h4>
<ul>
  <li><strong>Simple Past:</strong> Completed at a specific historical point (<em>"We patched the server yesterday at 22:00."</em>).</li>
  <li><strong>Present Perfect:</strong> Completed at an unspecified time with current relevance or spanning to now (<em>"We have observed zero connection timeouts this week."</em>).</li>
</ul>

<h4>2. Past Perfect in Incident Timelines</h4>
<pre><code class="language-text">By the time the site reliability engineer logged into the cluster, 
the automated watchdog HAD ALREADY TERMINATED the unresponsive container.</code></pre>

<h4>3. The Third Conditional (Unreal Past / Post-Mortems)</h4>
<p>When analyzing root causes in blameless post-mortems, use the third conditional to evaluate counterfactual scenarios:</p>
<pre><code class="language-text">Structure: If + [Past Perfect], [would have + Past Participle]

"If the application had validated the content-length header, 
the denial-of-service attack would not have overwhelmed the worker threads."</code></pre>

<h4>4. Future Perfect: Projecting Completion</h4>
<p>Use the future perfect to declare milestones that will be completed prior to a designated future date:</p>
<pre><code class="language-text">"By Q3, our cloud engineering team will have migrated all monolithic services to Kubernetes."</code></pre>
""",

        8: """
<h3>Chapter Overview: Technical Reading Comprehension & Synthesis</h3>
<p>Engineering mastery requires rapidly comprehending API specifications, RFC protocols, architectural decision records (ADRs), and research papers. Synthesizing trade-offs and discerning critical constraints is a hallmark of senior technical leadership.</p>

<div class="theory-callout">
  <strong>Reading Strategy:</strong> Distinguish foundational architectural guarantees (e.g. idempotency, linearizability) from auxiliary implementation optimizations.
</div>

<h4>1. Decoding Technical Jargon from Context</h4>
<ul>
  <li><strong>Idempotent:</strong> An operation that produces the exact same system side-effect whether executed once or multiple consecutive times (e.g. HTTP PUT vs non-idempotent POST).</li>
  <li><strong>Ephemeral:</strong> Temporary, short-lived resources (e.g. serverless execution workers that retain no local state across request invocations).</li>
  <li><strong>Eventual Consistency:</strong> Replicas in a distributed database will converge to the same state given sufficient time, trading immediate consistency for high availability.</li>
</ul>

<h4>2. Synthesizing Architectural Trade-offs</h4>
<p>Technical reading requires evaluating trade-offs under theorem constraints (like the CAP theorem). When analyzing architecture documents, extract:</p>
<ol>
  <li>The primary problem being resolved.</li>
  <li>The proposed structural pattern (e.g. circuit breaker, CQRS, event sourcing).</li>
  <li>The operational trade-offs accepted (e.g. higher latency, increased infrastructure cost, eventual consistency).</li>
</ol>

<h4>3. The Circuit Breaker Pattern in Action</h4>
<p>Circuit breakers monitor downstream RPC failures. When error rates exceed a defined threshold, the circuit 'trips' open to fail fast, preserving upstream thread pools while the downstream dependency recovers.</p>
"""
    }
}
