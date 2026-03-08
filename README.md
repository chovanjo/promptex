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
