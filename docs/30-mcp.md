# 30. MCP — Model Context Protocol

A universal standard that lets AI connect to **any external tool or service** — like a USB-C adapter 🔌 that works with everything instead of needing a different cable for every device!

**The problem it solves:**
> Before MCP — every tool needed its own custom connection 😬
> Like having a different charger for every device!
> After MCP — one standard works with Gmail, GitHub, Jira, Slack, databases — all of them! ✅

**How it works — simple version:**
> You ask Claude: *"Find our latest sales report and email it to my manager"*
>
> Behind the scenes Claude:
> 1. 🔌 Connects to your tools via MCP
> 2. 🗄️ Asks the database tool: *"Give me the latest report"*
> 3. 📧 Asks the email tool: *"Send this to the manager"*
> 4. ✅ Reports back: *"Done — email sent!"*
>
> You see none of this — it just works! 🎯

**The messages underneath are JSON — like this:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "send_email",
    "arguments": {
      "to": "manager@company.com",
      "subject": "Sales Report"
    }
  }
}
```
Think of it as Claude filling in a form for each tool it uses! 📋

**Popular tools you can connect via MCP:**
- 📧 Gmail — read and send emails
- 📅 Google Calendar — check and create meetings
- 🐙 GitHub — read and write code, PRs, issues
- 💬 Slack — read and send messages
- 🗄️ Your database — query data directly
- 📁 Your files — read and write local files

**3 important things about context and MCP:**
1. 🪟 Every tool result gets added to context — many tool calls = context fills up faster!
2. 🔍 Claude only sees what the tool sends back — good tools send only what's needed, not everything!
3. 🔧 MCP is just standardised tool calling — build one MCP server and it works with Claude, ChatGPT, Gemini — all of them!

**3 important security things:**
1. ⚠️ MCP tools have real access — a GitHub MCP with write permission can delete your repos! Always use minimum permissions!
2. 🎯 Not all MCP servers are safe — treat them like npm packages — malicious ones exist! Only use trusted sources!
3. 💉 Attackers can hide instructions inside emails or documents your MCP reads — like a trojan horse! Always be careful what your MCP connects to!

**MCP Security Checklist:**
```
✅ Read-only permissions unless write is absolutely needed
✅ Only install MCP servers from trusted sources
✅ Never connect MCP to production systems without human approval
✅ Monitor what your MCP servers are doing
```

💡 **MCP vs RAG:**
- 🔍 RAG → retrieves from YOUR uploaded documents (passive)
- 🔌 MCP → connects to LIVE services and takes ACTIONS (active)!

⚡ **C# developer tip:** There's an official C# SDK for MCP — you can build your own MCP server to connect your internal tools to any AI assistant! 🔧
