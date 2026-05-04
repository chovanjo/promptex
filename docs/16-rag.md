# 16. Retrieval Augmented Generation (RAG)

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
