# 17. Automatic Reasoning and Tool-Use (ART)

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

**When AI doesn't act automatically — simulate the loop manually:**
Sometimes the AI needs YOU to drive the Thought → Act → Observe loop via Prompt Chaining:
- Prompt 1: *"What do you need to know to answer this?"*
- Prompt 2: *"Here is the data / search for X"*
- Prompt 3: *"Based on these results, what's your conclusion?"*
- 🔄 Repeat until answered!

This is **Prompt Chaining + ART combined** — you manually drive the reasoning loop when AI needs guidance! 🔗

💡 **ReAct note:** ReAct is the academic name for this Thought → Act → Observe loop. In modern LLMs it happens automatically when tools are enabled — or manually via Prompt Chaining when it needs your guidance!
