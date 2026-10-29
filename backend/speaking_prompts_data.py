"""
Bhasa_AI English Speaking Assessment Prompt Bank
48+ progressive prompts across Beginner, Intermediate, and Advanced tiers,
supporting multiple pedagogical task types:
1. Sentence Reading (phonetic clarity, stress, consonant clusters, connected speech)
2. Everyday Conversation (workplace, social, academic dialogues)
3. Topic Description (structured 30-60 second conceptual explanations)
4. Short Spoken Response (expressive opinions and agile responses)
"""

SPEAKING_PROMPTS = [
    # =========================================================================
    # BEGINNER PROMPTS (16 Prompts)
    # Target Pace: 90 - 120 WPM | Focus: Enunciation, basic syntax, everyday vocabulary
    # =========================================================================
    {
        "id": "beg_sr_01",
        "difficulty": "Beginner",
        "task_type": "sentence_reading",
        "category": "Foundations",
        "prompt_text": "Good morning. My name is Alex, and I am learning software engineering.",
        "target_pace_wpm_guide": "90-110 WPM",
        "guidance": "Speak slowly and clearly. Pause naturally after 'Good morning' and 'Alex'."
    },
    {
        "id": "beg_sr_02",
        "difficulty": "Beginner",
        "task_type": "sentence_reading",
        "category": "Daily Routine",
        "prompt_text": "I wake up early every day, drink a glass of water, and read a book.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Pay attention to the clean pronunciation of 'early', 'water', and 'book'."
    },
    {
        "id": "beg_sr_03",
        "difficulty": "Beginner",
        "task_type": "sentence_reading",
        "category": "Study Habits",
        "prompt_text": "Practice makes a person confident when speaking a new language.",
        "target_pace_wpm_guide": "90-110 WPM",
        "guidance": "Pronounce the 'k' and 's' sounds cleanly in 'practice' and 'makes'."
    },
    {
        "id": "beg_sr_04",
        "difficulty": "Beginner",
        "task_type": "sentence_reading",
        "category": "Technology Basics",
        "prompt_text": "Computers help us solve problems and connect with friends across the world.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Emphasize 'problems' and 'connect'. Avoid rushing through 'across the world'."
    },
    {
        "id": "beg_conv_01",
        "difficulty": "Beginner",
        "task_type": "conversation",
        "category": "Greetings & Introductions",
        "prompt_text": "Hello! It is a pleasure to meet you. Could you please tell me where the library is?",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Use a friendly, rising intonation at the end of the polite question."
    },
    {
        "id": "beg_conv_02",
        "difficulty": "Beginner",
        "task_type": "conversation",
        "category": "Shopping & Ordering",
        "prompt_text": "Excuse me, I would like to order a warm cup of green tea with honey, please.",
        "target_pace_wpm_guide": "90-110 WPM",
        "guidance": "Keep your tone polite and enunciate 'warm cup' and 'green tea'."
    },
    {
        "id": "beg_conv_03",
        "difficulty": "Beginner",
        "task_type": "conversation",
        "category": "Classroom Exchange",
        "prompt_text": "Professor, could you please repeat the last sentence? I missed the assignment date.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Pause briefly after 'Professor' and articulate 'assignment date' clearly."
    },
    {
        "id": "beg_conv_04",
        "difficulty": "Beginner",
        "task_type": "conversation",
        "category": "Directions",
        "prompt_text": "Turn left at the traffic light, then walk two blocks until you see the post office.",
        "target_pace_wpm_guide": "90-110 WPM",
        "guidance": "Emphasize directional cues: 'left', 'two blocks', and 'post office'."
    },
    {
        "id": "beg_desc_01",
        "difficulty": "Beginner",
        "task_type": "topic_description",
        "category": "Hobbies",
        "prompt_text": "In my free time, I enjoy listening to music and riding my bicycle in the park.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Maintain a smooth, relaxed rhythm. Pronounce 'bicycle' accurately."
    },
    {
        "id": "beg_desc_02",
        "difficulty": "Beginner",
        "task_type": "topic_description",
        "category": "My Hometown",
        "prompt_text": "My hometown is quiet and peaceful, surrounded by green hills and friendly neighbors.",
        "target_pace_wpm_guide": "90-110 WPM",
        "guidance": "Breathe steadily. Articulate 'peaceful', 'surrounded', and 'neighbors'."
    },
    {
        "id": "beg_desc_03",
        "difficulty": "Beginner",
        "task_type": "topic_description",
        "category": "Favorite Food",
        "prompt_text": "My favorite meal is home-cooked rice with fresh vegetables and seasoned curry.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Deliver the sentence with natural warmth and clear vowel articulation."
    },
    {
        "id": "beg_desc_04",
        "difficulty": "Beginner",
        "task_type": "topic_description",
        "category": "Daily Weather",
        "prompt_text": "Today the weather is sunny and bright, with a gentle breeze coming from the east.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Keep your voice audible and avoid dropping the final consonants in 'bright' and 'east'."
    },
    {
        "id": "beg_srsp_01",
        "difficulty": "Beginner",
        "task_type": "short_response",
        "category": "Personal Preferences",
        "prompt_text": "I prefer working in the morning because my mind feels fresh and energetic.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Highlight the contrast: 'morning' and 'energetic'."
    },
    {
        "id": "beg_srsp_02",
        "difficulty": "Beginner",
        "task_type": "short_response",
        "category": "Problem Solving",
        "prompt_text": "When I face a difficult challenge, I ask my teacher or a classmate for help.",
        "target_pace_wpm_guide": "90-110 WPM",
        "guidance": "Deliver with an open, constructive tone. Pause slightly before 'I ask'."
    },
    {
        "id": "beg_srsp_03",
        "difficulty": "Beginner",
        "task_type": "short_response",
        "category": "Goal Setting",
        "prompt_text": "My goal this semester is to speak English with confidence and build useful projects.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Express enthusiasm. Clearly pronounce 'semester', 'confidence', and 'projects'."
    },
    {
        "id": "beg_srsp_04",
        "difficulty": "Beginner",
        "task_type": "short_response",
        "category": "Gratitude & Teamwork",
        "prompt_text": "Thank you for collaborating with me today. Working together made the task much easier.",
        "target_pace_wpm_guide": "95-115 WPM",
        "guidance": "Enunciate the 'th' in 'Thank you' and the ending 'er' in 'easier'."
    },

    # =========================================================================
    # INTERMEDIATE PROMPTS (16 Prompts)
    # Target Pace: 110 - 140 WPM | Focus: Professional phrasing, compound sentences, fluency
    # =========================================================================
    {
        "id": "int_sr_01",
        "difficulty": "Intermediate",
        "task_type": "sentence_reading",
        "category": "Communication Skills",
        "prompt_text": "Effective communication requires active listening, clear articulation, and thoughtful expression.",
        "target_pace_wpm_guide": "110-130 WPM",
        "guidance": "Deliver each three-part item with balanced pacing and clear syllable separation."
    },
    {
        "id": "int_sr_02",
        "difficulty": "Intermediate",
        "task_type": "sentence_reading",
        "category": "Digital Transformation",
        "prompt_text": "Artificial intelligence and cloud computing are transforming global industries at an unprecedented speed.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Maintain a confident rhythm through technical terminology like 'unprecedented'."
    },
    {
        "id": "int_sr_03",
        "difficulty": "Intermediate",
        "task_type": "sentence_reading",
        "category": "Academic Discipline",
        "prompt_text": "Consistent habit building and reflective problem solving are the true foundations of mastery.",
        "target_pace_wpm_guide": "110-130 WPM",
        "guidance": "Stress the key concepts: 'Consistent', 'reflective', and 'foundations'."
    },
    {
        "id": "int_sr_04",
        "difficulty": "Intermediate",
        "task_type": "sentence_reading",
        "category": "Collaboration",
        "prompt_text": "Diverse perspectives within an engineering team foster innovation and lead to more resilient software.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Pay close attention to consonant endings in 'perspectives', 'foster', and 'resilient'."
    },
    {
        "id": "int_conv_01",
        "difficulty": "Intermediate",
        "task_type": "conversation",
        "category": "Project Coordination",
        "prompt_text": "I reviewed the initial sprint backlog and believe we should prioritize API performance before the release.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Speak naturally as if addressing colleagues in a technical standup meeting."
    },
    {
        "id": "int_conv_02",
        "difficulty": "Intermediate",
        "task_type": "conversation",
        "category": "Client Presentation",
        "prompt_text": "Thank you for joining our demonstration. Today we will walk through the core features of the platform.",
        "target_pace_wpm_guide": "110-130 WPM",
        "guidance": "Use a warm, welcoming executive tone. Pause briefly after 'demonstration'."
    },
    {
        "id": "int_conv_03",
        "difficulty": "Intermediate",
        "task_type": "conversation",
        "category": "Technical Assistance",
        "prompt_text": "If you encounter an unexpected error during installation, please verify your environment configuration first.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Maintain an instructive, reassuring cadence. Emphasize 'verify' and 'configuration'."
    },
    {
        "id": "int_conv_04",
        "difficulty": "Intermediate",
        "task_type": "conversation",
        "category": "Debating Ideas",
        "prompt_text": "While I appreciate your point, I think conducting user testing will give us more objective empirical data.",
        "target_pace_wpm_guide": "110-130 WPM",
        "guidance": "Balance diplomatic disagreement with constructive reasoning. Emphasize 'objective empirical data'."
    },
    {
        "id": "int_desc_01",
        "difficulty": "Intermediate",
        "task_type": "topic_description",
        "category": "Software Architecture",
        "prompt_text": "A microservices architecture separates business capabilities into small, independently deployable services.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Pronounce 'microservices', 'independently deployable', and 'capabilities' clearly."
    },
    {
        "id": "int_desc_02",
        "difficulty": "Intermediate",
        "task_type": "topic_description",
        "category": "Environmental Science",
        "prompt_text": "Renewable energy adoption has accelerated significantly due to declining costs in solar and wind technology.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Ensure clean articulation of multisyllabic words: 'accelerated significantly'."
    },
    {
        "id": "int_desc_03",
        "difficulty": "Intermediate",
        "task_type": "topic_description",
        "category": "Language Acquisition",
        "prompt_text": "Learning an additional language enhances cognitive flexibility and broadens cultural appreciation.",
        "target_pace_wpm_guide": "110-130 WPM",
        "guidance": "Articulate 'cognitive flexibility' and 'cultural appreciation' without slurring."
    },
    {
        "id": "int_desc_04",
        "difficulty": "Intermediate",
        "task_type": "topic_description",
        "category": "Remote Work",
        "prompt_text": "Distributed teams rely on asynchronous communication and clear written documentation to stay aligned.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Emphasize 'asynchronous communication' and 'written documentation'."
    },
    {
        "id": "int_srsp_01",
        "difficulty": "Intermediate",
        "task_type": "short_response",
        "category": "Analytical Opinion",
        "prompt_text": "In my opinion, writing clean and readable code is just as important as writing efficient code.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "State your conviction clearly with balanced stress on 'clean' and 'efficient'."
    },
    {
        "id": "int_srsp_02",
        "difficulty": "Intermediate",
        "task_type": "short_response",
        "category": "Overcoming Obstacles",
        "prompt_text": "When debugging a complex issue, isolating the smallest reproducible example saves considerable time.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Keep an informative, practical tone. Clearly articulate 'reproducible example'."
    },
    {
        "id": "int_srsp_03",
        "difficulty": "Intermediate",
        "task_type": "short_response",
        "category": "Career Aspirations",
        "prompt_text": "I aspire to lead impactful engineering projects that solve meaningful problems for global communities.",
        "target_pace_wpm_guide": "110-130 WPM",
        "guidance": "Project confidence and purpose. Articulate 'impactful', 'meaningful', and 'communities'."
    },
    {
        "id": "int_srsp_04",
        "difficulty": "Intermediate",
        "task_type": "short_response",
        "category": "Time Management",
        "prompt_text": "Balancing rigorous university coursework with hands-on coding practice requires deliberate scheduling.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Speak with steady composure. Enunciate 'rigorous', 'coursework', and 'deliberate scheduling'."
    },

    # =========================================================================
    # ADVANCED PROMPTS (16 Prompts)
    # Target Pace: 120 - 150 WPM | Focus: Sophisticated discourse, nuanced rhetoric, complex grammar
    # =========================================================================
    {
        "id": "adv_sr_01",
        "difficulty": "Advanced",
        "task_type": "sentence_reading",
        "category": "Computational Philosophy",
        "prompt_text": "Algorithmic governance must balance technological optimization with rigorous ethical oversight to protect human dignity.",
        "target_pace_wpm_guide": "120-145 WPM",
        "guidance": "Deliver with scholarly authority. Maintain natural rhythm across dense philosophical concepts."
    },
    {
        "id": "adv_sr_02",
        "difficulty": "Advanced",
        "task_type": "sentence_reading",
        "category": "Systems Resilience",
        "prompt_text": "Architecting distributed systems necessitates mitigating catastrophic failure cascades through defensive decoupling.",
        "target_pace_wpm_guide": "120-140 WPM",
        "guidance": "Articulate challenging phonetic transitions: 'necessitates mitigating' and 'defensive decoupling'."
    },
    {
        "id": "adv_sr_03",
        "difficulty": "Advanced",
        "task_type": "sentence_reading",
        "category": "Macroeconomics & Tech",
        "prompt_text": "Macroeconomic volatility continually influences capital allocation towards breakthrough computational paradigms.",
        "target_pace_wpm_guide": "125-145 WPM",
        "guidance": "Keep breathing measured. Do not drop terminal plosives on 'breakthrough' or 'paradigms'."
    },
    {
        "id": "adv_sr_04",
        "difficulty": "Advanced",
        "task_type": "sentence_reading",
        "category": "Epistemology",
        "prompt_text": "Empirical scrutiny and peer validation remain the quintessential pillars of authentic scientific advancement.",
        "target_pace_wpm_guide": "120-140 WPM",
        "guidance": "Articulate 'quintessential pillars' and 'authentic scientific advancement' with crisp diction."
    },
    {
        "id": "adv_conv_01",
        "difficulty": "Advanced",
        "task_type": "conversation",
        "category": "Executive Strategy",
        "prompt_text": "While immediate revenue targets are vital, compromising architectural integrity will inevitably inflate our long-term technical debt.",
        "target_pace_wpm_guide": "125-145 WPM",
        "guidance": "Adopt an executive consultative tone. Emphasize the strategic trade-off persuasively."
    },
    {
        "id": "adv_conv_02",
        "difficulty": "Advanced",
        "task_type": "conversation",
        "category": "Academic Defense",
        "prompt_text": "Our methodology accounts for stochastic variance by running ten thousand Monte Carlo simulation iterations.",
        "target_pace_wpm_guide": "120-145 WPM",
        "guidance": "Deliver with academic precision. Smoothly articulate 'stochastic variance' and 'Monte Carlo'."
    },
    {
        "id": "adv_conv_03",
        "difficulty": "Advanced",
        "task_type": "conversation",
        "category": "Negotiation & Ethics",
        "prompt_text": "We cannot ratify this data agreement unless unambiguous consumer privacy guarantees are enshrined in the contractual terms.",
        "target_pace_wpm_guide": "120-140 WPM",
        "guidance": "Sound firm, principled, and measured. Clearly enunciate 'unambiguous' and 'contractual'."
    },
    {
        "id": "adv_conv_04",
        "difficulty": "Advanced",
        "task_type": "conversation",
        "category": "Keynote Opening",
        "prompt_text": "Distinguished colleagues, today we inaugurate a dialogue on reconciling artificial intelligence autonomy with human values.",
        "target_pace_wpm_guide": "115-135 WPM",
        "guidance": "Deliver with formal oratorical resonance. Pause strategically after 'Distinguished colleagues'."
    },
    {
        "id": "adv_desc_01",
        "difficulty": "Advanced",
        "task_type": "topic_description",
        "category": "Cybersecurity & Cryptography",
        "prompt_text": "Zero-trust network architecture operates under the principle that every request must be authenticated, authorized, and continuously validated.",
        "target_pace_wpm_guide": "125-145 WPM",
        "guidance": "Maintain a methodical cadence when enunciating the three security criteria."
    },
    {
        "id": "adv_desc_02",
        "difficulty": "Advanced",
        "task_type": "topic_description",
        "category": "Cognitive Science",
        "prompt_text": "Neuroplasticity demonstrates that deliberate immersion and focused cognitive rehearsal continually reshape synaptic pathways throughout life.",
        "target_pace_wpm_guide": "120-145 WPM",
        "guidance": "Ensure clean syllable transitions: 'deliberate immersion' and 'synaptic pathways'."
    },
    {
        "id": "adv_desc_03",
        "difficulty": "Advanced",
        "task_type": "topic_description",
        "category": "Quantum Computing",
        "prompt_text": "Quantum superposition and entanglement enable quantum processors to evaluate exponential solution spaces simultaneously.",
        "target_pace_wpm_guide": "120-140 WPM",
        "guidance": "Pronounce 'superposition', 'entanglement', and 'exponential solution spaces' with scientific clarity."
    },
    {
        "id": "adv_desc_04",
        "difficulty": "Advanced",
        "task_type": "topic_description",
        "category": "Global Ecology",
        "prompt_text": "Restoring biodiversity across degraded marine sanctuaries requires international policy harmonization and community-led stewardship.",
        "target_pace_wpm_guide": "120-145 WPM",
        "guidance": "Breathe smoothly through 'biodiversity', 'sanctuaries', and 'policy harmonization'."
    },
    {
        "id": "adv_srsp_01",
        "difficulty": "Advanced",
        "task_type": "short_response",
        "category": "Ethical Deliberation",
        "prompt_text": "Technological ubiquity places an unprecedented responsibility on developers to anticipate unintended socio-economic externalities.",
        "target_pace_wpm_guide": "120-145 WPM",
        "guidance": "Deliver with solemn intellectual weight. Articulate 'socio-economic externalities' cleanly."
    },
    {
        "id": "adv_srsp_02",
        "difficulty": "Advanced",
        "task_type": "short_response",
        "category": "Leadership Philosophy",
        "prompt_text": "True leadership is not about consolidating authority, but rather empowering multidisciplinary teams to innovate autonomously.",
        "target_pace_wpm_guide": "120-140 WPM",
        "guidance": "Highlight the contrast between 'consolidating authority' and 'empowering teams'."
    },
    {
        "id": "adv_srsp_03",
        "difficulty": "Advanced",
        "task_type": "short_response",
        "category": "Intellectual Resilience",
        "prompt_text": "Embracing constructive critique with intellectual humility accelerates personal refinement far more than unexamined self-assurance.",
        "target_pace_wpm_guide": "120-145 WPM",
        "guidance": "Pace each clause deliberately. Emphasize 'intellectual humility' and 'unexamined self-assurance'."
    },
    {
        "id": "adv_srsp_04",
        "difficulty": "Advanced",
        "task_type": "short_response",
        "category": "Future of Education",
        "prompt_text": "Adaptive pedagogies leveraging artificial intelligence will democratize high-caliber personalized mentorship across historically underserved demographics.",
        "target_pace_wpm_guide": "125-145 WPM",
        "guidance": "Speak with visionary conviction. Ensure crisp articulation of 'democratize' and 'demographics'."
    }
]
