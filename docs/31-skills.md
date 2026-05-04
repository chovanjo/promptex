# 31. Skills

A **pre-built package of instructions stored as a file** that the AI reads automatically BEFORE starting a task — teaching it exactly how to perform specific tasks to YOUR standard, every time! Like handing a new employee a training manual before they start work! 📋

**Skills vs Prompts — the crucial difference:**
> 📝 Prompt = what YOU type in the chat — works once, for one session
> 📋 Skill = a separate file stored on disk — loads automatically, works forever, for everyone!

**How a skill works:**
```
You say: "Create a presentation"
              ↓
AI reads: /skills/pptx/SKILL.md 📋
              ↓
AI follows exact instructions
              ↓
Perfect result every time! ✅
```

**Real skill examples:**

*PPTX Skill — stored at `/skills/pptx/SKILL.md`:*
```
When creating PowerPoint files:
- Always use 16:9 format
- Max 5 bullet points per slide
- Always use Calibri font size 24
- Always end with a summary slide
```

*C# Code Review Skill — stored at `/skills/csharp-review/SKILL.md`:*
```
When reviewing C# code:
- Always check null reference handling
- Always verify SOLID principles
- Format output as: Issue → Severity → Fix
```

**6 important things to know:**

1. ♻️ **Reusable across sessions and users** — one skill file = consistent quality for your whole team!
2. 🔥 **Skills can be combined** — load multiple skills for one task — they stack on top of each other!
3. 🎬 **Skills = Session Priming stored permanently** — instead of typing rules every session, write them once in a file!
4. 🎯 **Skills can trigger automatically** — smart systems detect what you need and load the right skill without being told!
5. 📐 **More specific beats more general** — like CSS specificity — the more targeted skill wins!
6. 🔧 **You can write your own skills** — just create a markdown SKILL.md file with your team's standards!

**Context impact:**
> Every skill loaded takes tokens from your context window BEFORE your conversation starts!
> - ✂️ Keep skill files concise
> - 🎯 Load only skills you actually need
> - 📏 Large skill + large codebase = context overflow risk!

**Security:**
> Skill files can be tampered with or malicious ones exist in the wild — treat them like code!
```
✅ Store in version-controlled repository
✅ Always read community skill files before using
✅ Never put secrets or credentials inside skill files
✅ Monitor skill files for unexpected changes
✅ Keep skill files minimal — less surface area = less risk
```

**Skills vs System Prompts:**
- 📜 System Prompt → always active, global, invisible to users
- 🎓 Skill → loaded when needed, specialised, transparent

💡 **The big picture:** Skills turn your team's best practices into permanent AI behaviour — written once, followed by AI forever! 🎯
