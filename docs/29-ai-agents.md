# 29. AI Agents

Instead of just answering questions, an AI Agent **takes autonomous actions** to complete goals — like the difference between a calculator and a personal assistant! 🧑‍💼

**Agent vs Regular AI:**
- 💬 Regular AI → you ask → AI answers → done
- 🤖 Agent → you give a goal → agent plans + acts + verifies + repeats until done!

**What makes something an Agent:**
- 🧠 Reasoning — plans how to achieve the goal
- 🔧 Tools — uses web search, code execution, file reading, APIs
- 💾 Memory — remembers context across steps
- 🔄 Loop — acts, observes results, adjusts, acts again
- 🎯 Goal-oriented — keeps going until goal is achieved!

**The Agentic Loop:**
```
You give a GOAL 🎯
        ↓
Agent PLANS the steps 🧠
        ↓
Agent takes ACTION ⚡
        ↓
Agent OBSERVES result 👀
        ↓
Was it correct? ── YES ──→ Next ACTION
        ↓ NO
Agent REFLECTS and ADJUSTS 🤔
        ↓
Repeat until GOAL achieved ✅
        ↓
Reports back to YOU 📋
```

**How Claude Code's loop works:**
The loop is **Hybrid** — model reasons, CLI executes:
- 🧠 Claude (model) → reasons and decides what to do next
- ⚡ Claude Code CLI → external harness that executes tools and feeds results back
- 🔄 Loop → runs in the CLI, NOT inside the model itself!

The loop pattern: `while(tool_call) → execute tool → feed results → repeat`
Loop ends when Claude produces a text response with no tool calls! ✅

**Can it run indefinitely?**
Technically yes — people have run Claude Code non-stop for days! But practical limits exist:
- 💰 Cost/budget limit you can set
- 🔢 Max turn limit you can set
- 🪟 Context window — at 90%+ responses become erratic
- ✅ Task completion — loop ends naturally when done

**3 critical rules for using Agents:**

1. ⚠️ **Agents can make mistakes autonomously at scale** — always build human checkpoints for critical actions (sending emails, committing code, deleting data, making payments)

2. 🚧 **Give clear boundaries, not just goals** — *"Fix failing unit tests in /tests folder only. Don't modify production code. Stop and ask if unsure."*

3. 🔄 **The agentic loop is what separates agents from scripts** — a script executes blindly, an agent observes, reasons, and adapts!

**The golden agent workflow:**
```
✅ Start from clean git state — always!
✅ Commit checkpoints regularly
✅ Set budget/turn limits for long tasks
✅ Define clear success and failure conditions
✅ Review before merging any agent-generated code
```

💡 **Real world C# examples:**
- *"Fix all failing unit tests in /tests"* → reads, runs, fixes, verifies 🧪
- *"Review this PR and suggest improvements"* → reads code, analyses, reports 📋
- *"Find all security vulnerabilities in our API"* → scans, analyses, reports 🔒
