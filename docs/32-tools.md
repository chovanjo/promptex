# 32. Tools

**Built-in capabilities** that give AI the ability to actually DO things in the world — not just talk about them! Like giving a brilliant chef actual kitchen equipment instead of just knowing recipes! 🍳

**The key difference tools make:**
- Without tools → AI describes what COULD be done 💬
- With tools → AI actually DOES it! ✅

**Tools vs Skills vs MCP — the clear picture:**
```
🛠️ Tools  = WHAT you can do (built-in abilities)
🎓 Skills = HOW you do it (your standard and style)
🔌 MCP    = WHO you can call (external connections)
```

**Surgeon analogy 🏥**

🛠️ **Tools = your built-in medical abilities**
Things you can DO naturally as a surgeon:
- 👀 Examine a patient (image analysis)
- 🔬 Run lab tests (code execution)
- 📖 Read medical records (file reading)
- 📡 Check latest research (web search)

These come WITH you — built into Claude by Anthropic. You don't install them — they're already there! ✅

🎓 **Skills = your medical specialisation training**
Your training manual that says HOW to do things:
- 📋 *"When performing heart surgery — always follow these 12 steps"*
- 📋 *"When writing a patient report — always use this template"*

Skills don't give you NEW abilities — they teach you HOW to use existing abilities to a specific standard!

🔌 **MCP = your hospital's external connections**
Things OUTSIDE the hospital you can call:
- 📧 Call the pharmacy (Gmail)
- 🏦 Bill the insurance company (payment system)
- 📋 Update records in external system (database)
- 🚑 Coordinate with other hospitals (Slack)

MCP connects you to LIVE external services that can take REAL actions in the world! 🌍

**C# developer analogy 💻**

| | Tools 🛠️ | Skills 🎓 | MCP 🔌 |
|---|---|---|---|
| **Analogy** | Your IDE features | Your team's coding standards doc | External APIs you call |
| **Example** | IntelliSense, debugger, compiler | *"Always use SOLID, always write tests"* | GitHub API, Jira API, Slack API |
| **Who provides** | Anthropic | You or your team | Third parties |
| **Where it lives** | Built into Claude | SKILL.md file on disk | External server |
| **What it enables** | Doing things | Consistent quality | Real world actions |

**Built-in Tools in Claude:**

| Tool | What it does |
|---|---|
| 🌐 Web Search | Searches internet for current info |
| 💻 Code Execution | Runs Python and JavaScript directly |
| 📄 File Reading | Reads uploaded documents |
| 🖼️ Image Analysis | Understands screenshots and diagrams |
| 🔌 MCP Tools | Connects to external services |
| 💾 Memory | Remembers info across sessions |

**5 important things to know:**
1. 🎯 Tools transform AI from a talker to a DOER — without tools there are no agents, just chatbots!
2. 🔧 You control which tools are available — always give AI only the tools it actually needs!
3. 🪟 Every tool call uses context window tokens — minimise unnecessary tool calls!
4. ⚠️ Tools can fail — always test what your AI does when tools fail, not just when they succeed!
5. 🌉 Tools are the bridge between AI and the real world — they turn a knowledgeable AI into a useful AI!

💡 **The golden one-liners:**
> 🛠️ *"I CAN search the web"* — Tools
> 🎓 *"When I search, I always structure results like THIS"* — Skills
> 🔌 *"I'm calling the actual Gmail server to send a real email"* — MCP

⚠️ **Security:** Always give AI the minimum tools needed for the task — more tools = more potential attack surface!
