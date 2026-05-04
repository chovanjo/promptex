# 25. Context Window Management

The AI can only "see" a limited amount of text at once — like a colleague with short-term memory who forgets what was said at the start of a 3-hour meeting! 🧠

**What is the context window?**
Think of it as the AI's **working desk** 🗂️:
- Everything on the desk = what AI can currently see
- Desk has limited space = context window limit
- Old papers fall off the edge = AI forgets earlier content!

**Where the problem comes from:**
- Long coding sessions → AI forgets your Session Priming 😬
- Large codebases → AI can't see everything at once
- Multi-day projects → context resets every new session
- Early 2022-2023 models had only 4,000-8,000 tokens — roughly 3,000-6,000 words!

**Old manual solutions (2022-2023):**
- ✂️ Manually compressing prompts to save tokens
- 📋 Obsessively summarising every few messages
- 🔄 Carefully re-pasting context in every message
- 📏 Counting tokens before sending anything

**How modern AI handles it in 2026:**
- 🪟 Massive context windows — Claude has ~200,000 tokens (~150,000 words) ✅
- 🗜️ Auto-compression of older messages internally ✅
- 🧲 Automatic prioritisation of recent messages ✅
- 🔍 RAG via Claude Projects — persistent context across ALL sessions ✅

**What still makes sense today:**
- 🔄 Re-prime with Session Priming if AI drifts in very long sessions
- 📋 Ask for a summary after 50+ messages: *"Summarise what we've built and decided so far."*
- 📁 Use Claude Projects for serious multi-day work — RAG handles the rest!

💡 **The 2026 golden rule:**
> Short sessions → don't worry at all! ✅
> Long sessions → re-prime if AI drifts 🔄
> Multi-day projects → Claude Projects = persistent context forever! 🔍

⚠️ **Context Window Management is largely automated in 2026 — but understanding WHY it exists makes you a better prompt engineer!**
