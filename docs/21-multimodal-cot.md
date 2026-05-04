# 21. Multimodal Chain of Thought (Multimodal CoT)

Instead of reasoning with text only, the AI reasons using **multiple types of input** — text, images, diagrams, charts — all together! Like a doctor who doesn't just read the patient's description but also studies the X-ray, scans, and charts! 🏥

**What "multimodal" means:**
- 📝 Text → code, descriptions, instructions
- 🖼️ Images → screenshots, diagrams, photos
- 📊 Charts → graphs, data visualisations
- 📄 Documents → PDFs, architecture diagrams

**The golden rule:**
> Text = your **interpretation** of the problem
> Image = the **raw reality** of the problem 🎯

**The magic formula:**
- *"Here is [image/graph/diagram]..."*
- *"And here is [text/logs/description]..."*
- *"Think step by step about [problem] using all of these."*

**Example:**
*"Here are: a graph showing API response times over 3 days, a screenshot of error logs, and our microservices architecture diagram. Think step by step about why our system degraded after Tuesday's deployment. Give me 3 possible causes with pros and cons, then recommend the best fix."* 🖼️

**Best use cases:**
- 📊 Performance issues → response time graphs
- 🐛 Mysterious bugs → error log screenshots
- 🏗️ Architecture problems → system diagrams
- 🖥️ UI bugs → interface screenshots

💡 **Key insight:**
Every time you paste a screenshot into Claude and ask it to reason about it — that's Multimodal CoT in action! You're already using it! 😄

⚡ **Power combo:** Session Priming + Multimodal CoT + Tree of Thought = the ultimate debugging prompt! 🔥
