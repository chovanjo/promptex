# Promptex

A beginner-friendly cheat sheet for prompt engineering techniques.

---

## 1. 🎯 Zero-Shot

Asking the AI to complete a task without giving any examples first. The AI uses its existing training to figure it out — your go-to everyday technique.

*Example: "Write a short funny out-of-office email reply for my colleagues."*

---

## 2. 🎨 CRAFT Framework

A 5-ingredient formula for building perfect prompts. Combine all five for maximum results.

### 2.1 C — Context

Your background situation — gives the AI the information it needs about you.

*Example: "I'm a complete beginner, I'm tired, I only have 30 minutes in the morning."*

### 2.2 R — Role

Who the AI should be — sets expertise and perspective.

*Example: "You are a professional fitness trainer."*

### 2.3 A — Action

What you want done — always starts with an imperative verb.

*Example: "Create a 7-day workout plan."*

### 2.4 F — Format

How the response should look — structure, length, and layout.

*Example: "Format as a markdown table, max 100 words per day."*

### 2.5 T — Tone

How the response should sound — the voice and style.

*Example: "Keep it simple, concise, and friendly for beginners."*

---

## 3. 🚂 Prefixing

You start the sentence and the AI completes it. This instantly steers the direction and format of the response.

*Example: "The three biggest reasons people fail at dieting are: 1."*

---

## 4. ❓ Questions

Using H-questions — Who, What, When, Where, Why, How — as natural zero-shot prompts. Simple, clean, and effective.

*Example: "How does blockchain work?"*

---

## 5. 💪 Commands

Starting prompts with strong action verbs. Direct, clear, and powerful — no fluff needed.

*Example: "List 5 ways to save money. / Explain how vaccines work. / Compare iPhone vs Android."*

---

## 6. 🧠 Chain of Thought (CoT)

Instructing the AI to reason step by step before answering. This produces deeper, more accurate, and well-structured responses.

*Example: "What's the best business to start with $1,000? Think through this step by step, considering budget, time, and market demand."*

---

## 7. 🎤 Clarifying Questions

You instruct the AI to interview you before starting the task. The AI gathers all missing information first, then produces a perfectly tailored response.

*Example: "You are a professional party planner. Before creating my party plan, ask me all the questions you need to create the perfect result."*

---

## 8. 🖼️ Few-Shot

Giving the AI 2–3 examples of what you want before asking it to do the task. Like showing someone how to draw a cat before asking them to draw one — the AI learns your pattern and copies it.

**Example 1 — Formal to Casual Translator:**
- "I require assistance." → "I need help."
- "Please be advised that the meeting has been postponed." → "Heads up — the meeting got pushed back."

Now translate: *"I would like to inquire about the status of my application."*

**Example 2 — Email Tone Detector:**
- "Per my last email..." → 😤 Passive-aggressive
- "Hope this helps!" → 😊 Friendly

Now classify: *"As previously stated, the deadline was last Friday."*

**Example 3 — Bug Report Formatter:**
- "App crashes when I click save" → 🐛 **Bug:** App crashes | **Trigger:** Clicking save
- "Dark mode breaks after update" → 🐛 **Bug:** Dark mode broken | **Trigger:** After update

Now format: *"The search bar returns no results when I type too fast."*

💡 **Pro tip:** Combine Few-Shot + CRAFT for maximum power!

---

## 9. 🔗 Prompt Chaining

Breaking a big task into smaller connected prompts — where each prompt builds on the output of the previous one. Like a relay race 🏃‍♂️ where each runner receives the baton and carries it forward.

**The magic formula:**
- Prompt 1: *"Do X"*
- Prompt 2: *"Based on that, do Y"*
- Prompt 3: *"Using that result, do Z"*

**Connector words:** *"Based on that / Using that result / Now take that and / Building on that"*

**Example:**
- *"List the steps to build a C# REST API for a blog."*
- *"Using that plan, write the C# code."*
- *"Review the code you just wrote and fix all errors."*
- *"Write e2e tests for the final code."*

---

## 10. 🎬 Session Priming

Setting the AI's rules, role, and behavior once at the beginning of a session — so every response that follows is perfectly aligned. Like briefing a personal assistant before their first day! 🧑‍💼

**The CRAFT + Chaining combo:**
- Prompt 1 — Role: *"You are a master C# developer working for me. Agreed?"*
- Prompt 2 — Context: *"I am an intermediate developer building an e-commerce API. Got it?"*
- Prompt 3 — Format: *"Always write clean, well-commented code. Clear?"*
- Prompt 4 — Tone: *"Keep explanations concise, no jargon, and ask clarifying questions before coding. Understood?"*
- Prompt 5 — Action: *"Now build me a login endpoint."* 🚀

**Key rules:**
- Role = who the AI is 🤖
- Context = who YOU are 🧑‍💻
- Always confirm with *"Agreed / Got it / Clear?"*
- Action always comes LAST!

---

## 11. 🪞 Self-Consistency

Asking the same prompt in multiple fresh sessions and picking the most common answer. Like asking 5 different people for directions and going with the majority! 🗺️

Think of it as the "refresh button" for prompts — not happy with an answer? Open a fresh session and try again! 🔄

**Key rules:**
- Always use fresh sessions — not multiple answers in one prompt 🆕
- Ask the exact same prompt each time 📋
- Pick the most common answer ✅
- Best for high-stakes decisions — architecture, patterns, libraries 🏗️

**Example:** "What is the best database for a C# e-commerce app?" → Open 3 fresh sessions, ask the same question, compare results, pick the most common answer! 🏆

⚠️ *Modern LLM reality: Asking for multiple answers in ONE prompt won't work — AI deliberately varies them. Always use fresh sessions for true independence!*

---

## 12. ✂️ Negative Prompting

Telling the AI what NOT to do — just as important as telling it what to do! Like ordering a pizza and saying "no olives, no anchovies, no thick crust!" 🍕

**Your negative keywords:** Don't / Avoid / Never / Without / Exclude

**Key rules:**
- Always pair with a positive anchor — tell the AI where to go AND where not to go 🧭
- Be specific — "max 500 words" beats "not too long" 🎯
- Watch for positives in disguise — "don't forget to..." is actually a command! ⚠️
- Combine with Session Priming for maximum control 🎬

**Example:**
"Help me design a simple, scalable C# microservices architecture.
- Don't suggest overcomplicated solutions.
- Don't use .NET features my team hasn't adopted.
- Don't write explanations before code — always after.
- Don't recommend libraries without explaining why.
- Don't assume I work alone — we're a team of 5." 🎯

---

## 13. 🌳 Tree of Thought

Instead of thinking in a straight line, the AI explores multiple solution branches simultaneously, evaluates each one, and picks the best! Like a chess player ♟️ thinking through all possible moves before deciding.

**The magic 3-step formula:**
- 🌿 Explore: *"Explore X options..."*
- ⚖️ Evaluate: *"For each, list pros and cons..."*
- 🏆 Recommend: *"Then recommend the best one..."*

**Example:** *"Explore the 5 most popular e-commerce platforms for .NET, evaluate each step by step by price, quality, documentation and support, list pros and cons for each, then recommend the best one with an explanation why."* 🌳

**Key differences:**
- vs 🧠 CoT: CoT follows ONE path, ToT explores MANY 🌳
- vs 🪞 Self-Consistency: ToT works in ONE session, Self-Consistency needs multiple 🆕

⚡ **Power combo:** Session Priming + Negative Prompting + Tree of Thought + CoT guidance = the ultimate high-stakes decision prompt! 🏆

---

## 14. 🧬 Meta Prompting

Instead of giving specific examples like Few-Shot, you give the AI an abstract template — teaching it the shape of the solution rather than the solution itself! Like teaching someone how to paint instead of showing them 3 paintings. 🎨

**The magic formula:**
- *"Do [task] using this structure:"*
- *[Element 1]: [placeholder]*
- *[Element 2]: [placeholder]*
- *[Element 3]: [placeholder]*
- *"Now apply this to: [your input]"*

**Example:**
*"Review any C# code using this structure:*
- *Code Quality: [what's good, what's bad]*
- *Performance: [bottlenecks and suggestions]*
- *Security: [vulnerabilities found]*
- *Improvements: [specific actionable fixes]*

*Now review this code: ..."* 🧬

**Key advantages over Few-Shot:**
- Uses fewer tokens — no need for full examples 📉
- Works for ANY input — fully reusable ♻️
- More flexible — not tied to specific cases 🔄

⚠️ **When NOT to use it:** For novel or unique tasks where the AI needs concrete examples to understand what you want — use Few-Shot instead!

---

## 15. 💡 Generate Knowledge Prompting

Ask the AI to generate relevant knowledge FIRST, then use that knowledge to answer the actual question. Like writing study notes before an exam — the AI becomes its own teacher before answering! 🎓

**The magic formula:**
- *"First, generate everything important to know about X..."*
- *"Then, using that knowledge, recommend/explain/decide..."*

**Example:**
*"First, generate everything important to know about REST and GraphQL — key concepts, pros, cons, and use cases. Then, using that knowledge, recommend which is better for a small C# e-shop API."* 💡

**Key signal words:**
- *"First generate everything about..."* 🧠
- *"Using that knowledge..."* 🎯

**Power combos:**
- Simple decision → Generate Knowledge alone
- Complex comparison → Generate Knowledge + Prompt Chaining 🔗
- High stakes decision → Generate Knowledge + Tree of Thought 🌳

⚠️ **Difference from CoT:** CoT reasons through a problem — Generate Knowledge builds a knowledge base BEFORE tackling it!

---

## 16. 🔍 Retrieval Augmented Generation (RAG)

Instead of answering from training alone, the AI first **retrieves real, current information** from an external source, then generates an answer based on that! Like a detective 🕵️ who goes to the evidence room first, pulls the relevant files, THEN solves the case!

**The magic pattern:**
- 🔍 Retrieve → Find relevant information from external source
- 🧠 Augment → Combine retrieved info with AI training
- ✍️ Generate → Answer based on real retrieved content

**RAG sources:**
- 🌐 Internet search — latest news, docs, Stack Overflow
- 📄 Your own documents — company wiki, PDF manuals
- 🗄️ Live database — customer records, product catalog
- 💻 Your codebase — your actual project files
- 📝 Meeting notes — decisions made by your team

**How Claude Projects uses RAG:**
- Small docs → included directly in context window ✅
- Large docs → RAG kicks in, only relevant chunks retrieved 🎯

**How documents are preprocessed internally:**
1. 📄 Document uploaded
2. ✂️ Cut into small chunks
3. 🔢 Each chunk converted into vectors (numbers representing meaning)
4. 🗄️ Vectors stored in a database
5. 🔍 Your question also becomes a vector
6. 🧲 System finds chunks with similar vectors
7. ✍️ Claude answers using only relevant chunks

*Example:*
- Upload your codebase + enable internet search
- *"Based on our codebase, describe the architecture, evaluate pros/cons, then suggest improvements using .NET 10 best practices."* 🔍

**Power combo:**
Session Priming + RAG + Prompt Chaining + Tree of Thought = AI that knows your codebase AND the latest tech! 🔥

⚠️ **Difference from Generate Knowledge:** Generate Knowledge creates knowledge from training — RAG retrieves from YOUR external sources!

---

## 17. 🤖 Automatic Reasoning and Tool-Use (ART)

The AI **automatically decides** how to reason through a problem AND which tools to use to solve it — like a smart intern who figures out WHICH tools to use and in WHAT order, all by themselves! 🧑‍💻

**ART has two equal halves:**
- 🧠 Automatic Reasoning → AI breaks the problem into steps BY ITSELF
- 🔧 Tool-use → AI decides WHICH tools to call and WHEN

**How it works:**
1. 🎯 You give a goal
2. 🧠 AI automatically decomposes it into subtasks
3. 📚 AI finds similar past examples
4. 🔧 AI selects the right tools for each subtask
5. 🔄 AI reasons about results and decides next steps
6. ✅ AI delivers final answer

**Your impact on ART:**
- 🎯 Goal clarity — the clearer your goal, the better ART reasons
- 🔧 Tools you enable — web search, code execution, document retrieval
- 🎬 Session Priming — constraints that guide HOW it reasons

**Available tools:**
- 🌐 Web search, 💻 Code execution, 🧮 Calculator, 📄 Document retrieval, 🗄️ Database queries

⭐ **Most important insight:**
ART is more about **UNDERSTANDING than DOING** — knowing it exists helps you trust the AI to figure out steps automatically, stop over-engineering prompts, and focus on GOALS not PROCEDURES! 🎯

⚠️ **ART vs CoT:** CoT = YOU design the steps. ART = AI designs its own steps automatically!

---

## 18. ⚙️ Automatic Prompt Engineer (APE)

Instead of writing prompts yourself, you ask the **AI to write better prompts for you!** Like asking a professional chef to write you the perfect recipe instead of writing it yourself! 🍳

**How it works:**
1. 🎯 Describe what you want to achieve
2. 🤖 AI generates multiple prompt candidates
3. ⚖️ AI evaluates which prompt works best
4. ✅ You use the winning prompt!

**The magic formula:**
- *"Generate X different prompts for [task]"*
- *"Evaluate each for [criteria 1], [criteria 2], [criteria 3]"*
- *"Recommend the best one with an explanation why"*

**Example:**
*"Generate 5 different prompts my C# team could use to document any C# class. Evaluate each for consistency, language style, structure, pros and cons, and reusability. Then recommend the best one with an explanation why."* ⚙️

**Evaluation criteria examples:**
- Clarity, reusability, completeness 📊
- Consistency, language style, structure 📋
- Thoroughness, actionability, simplicity 🎯

💡 **Key insight:**
APE turns the AI into a **meta-tool** — you're not using AI to solve a problem, you're using AI to **build better tools** to solve problems! 🔧

⭐ **Power combo:**
APE → generates the best prompt 🤖
Generated prompt uses Meta Prompting structure 🗺️
With Few-Shot examples baked in 📸
= The ultimate self-improving prompt system! 🚀

⚠️ **Always specify:** A real number instead of X, clear evaluation criteria, and whether the prompt must be reusable!

---
 
## 19. 🎯 Active-Prompt
 
Instead of choosing examples upfront and never changing them, Active-Prompt **learns from real failures** and improves over time. Like a GPS that updates itself based on wrong turns — getting smarter with every mistake! 🗺️
 
**The core idea:**
> AI gets uncertain or wrong → YOU add that specific example → prompt gets smarter → repeat! 🔄
 
**The Active-Prompt cycle:**
1. 🚀 Use your prompt
2. 👀 Notice where AI gets uncertain or wrong
3. ✍️ Add those specific cases as new examples
4. 💪 Prompt gets smarter over time!
 
**Example — evolving a C# code review prompt:**
 
*Starting prompt:*
> *"Classify this code review comment as: Security / Performance / Readability / Design"*
 
*After 2 weeks — updated with real failures:*
> *"Classify this code review comment as: Security / Performance / Readability / Design*
> - *"This method is too long"* → Design
> - *"Missing using statement"* → Readability
> - *"Hardcoded connection string"* → Security
>
> *Now classify: [paste comment here]"* 🎯
 
💡 **Key insight:**
Every time AI gets something wrong in your C# work → add that specific case as a new example → your prompt library grows smarter with every project! 🌱
 
**Active-Prompt vs Few-Shot:**
- 🖼️ Few-Shot = you add examples **upfront** from guessing
- 🎯 Active-Prompt = you add examples **based on real failures**
 
⭐ **Power combo:**
APE to write the best initial prompt ⚙️
\+ Generate Knowledge to build context 💡
\+ Active-Prompt to improve from real failures 🎯
= A prompt that starts strong AND gets better forever! 🌱
 
⚠️ **When classifying:** Always write examples as *"X"* → ✅ Category *(not other category)* for maximum clarity!
