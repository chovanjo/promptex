# Promptex
A beginner-friendly cheat sheet for prompt engineering techniques.

## 📚 Prompt Engineering Techniques — Master Summary

| # | Technique | Description |
|---|-----------|-------------|
| 1 | 🎯 **Zero-Shot** | Asking AI to complete a task without giving any examples first. The AI uses its existing training to figure it out. Your go-to everyday technique.<br><br>*Example: "Write a short funny out-of-office email reply for my colleagues."* |
| 2 | 🎨 **CRAFT Framework** | A 5-ingredient formula for building perfect prompts. Combine all five for maximum results. |
| 2.1 | ↳ **C — Context** | Your background situation — gives the AI the info it needs about YOU.<br><br>*Example: "I'm a complete beginner, I'm tired, I only have 30 minutes in the morning."* |
| 2.2 | ↳ **R — Role** | Who the AI should be — sets expertise and perspective.<br><br>*Example: "You are a professional fitness trainer."* |
| 2.3 | ↳ **A — Action** | What you want done — always starts with an imperative verb.<br><br>*Example: "Create a 7-day workout plan."* |
| 2.4 | ↳ **F — Format** | How the response should look — structure, length, layout.<br><br>*Example: "Format as a markdown table, max 100 words per day."* |
| 2.5 | ↳ **T — Tone** | How the response should sound — the voice and style.<br><br>*Example: "Keep it simple, concise, and friendly for beginners."* |
| 3 | 🚂 **Prefixing** | You start the sentence, the AI completes it. Instantly steers the direction and format of the response.<br><br>*Example: "The three biggest reasons people fail at dieting are: 1."* |
| 4 | ❓ **Questions** | Using H-questions — Who, What, When, Where, Why, How — as natural zero-shot prompts. Simple, clean, and effective.<br><br>*Example: "How does blockchain work?"* |
| 5 | 💪 **Commands** | Starting prompts with strong action verbs. Direct, clear, and powerful — no fluff needed.<br><br>*Example: "List 5 ways to save money. / Explain how vaccines work. / Compare iPhone vs Android."* |
| 6 | 🧠 **Chain of Thought (CoT)** | Instructing the AI to reason step by step before answering. Produces deeper, more accurate, well-structured responses.<br><br>*Example: "What's the best business to start with $1000? Think through this step by step, considering budget, time, and market demand."* |
| 7 | 🎤 **Clarifying Questions** | You instruct the AI to interview YOU before starting the task. The AI gathers missing information first, then produces a perfectly tailored response.<br><br>*Example: "You are a professional party planner. Before creating my party plan, ask me all the questions you need to create the perfect result."* |
| 8 | 🖼️ **Few-Shot** | Giving the AI 2–3 examples of what you want BEFORE asking it to do the task. Like showing someone how to draw a cat before asking them to draw one. The AI learns your pattern and copies it.<br><br>**Example 1 — Formal to Casual Translator:**<br>- "I require assistance." → "I need help."<br>- "Please be advised that the meeting has been postponed." → "Heads up — the meeting got pushed back."<br><br>Now translate: *"I would like to inquire about the status of my application."*<br><br>**Example 2 — Email Tone Detector:**<br>- "Per my last email..." → 😤 Passive-aggressive<br>- "Hope this helps!" → 😊 Friendly<br><br>Now classify: *"As previously stated, the deadline was last Friday."*<br><br>**Example 3 — Bug Report Formatter:**<br>- "App crashes when I click save" → 🐛 **Bug:** App crashes \| **Trigger:** Clicking save<br>- "Dark mode breaks after update" → 🐛 **Bug:** Dark mode broken \| **Trigger:** After update<br><br>Now format: *"The search bar returns no results when I type too fast."*<br><br>💡 **Pro tip:** Combine Few-Shot + CRAFT for maximum power! |

---
