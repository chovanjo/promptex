# 15. Generate Knowledge Prompting

Ask the AI to generate relevant knowledge FIRST, then use that knowledge to answer the actual question. Like writing study notes before an exam — the AI becomes its own teacher before answering! 🎓

**The magic formula:**
- *"First, generate everything important to know about X..."*
- *"Then, using that knowledge, recommend/explain/decide..."*

**Example:**
*"First, generate everything important to know about REST and GraphQL — key concepts, pros, cons, and use cases. Then, using that knowledge, recommend which is better for a small C# e-shop API."* 💡

**Key signal words:**
- *"First generate everything about..."* 🧠
- *"Using that knowledge..."* 🎯

**Power combos:**
- Simple decision → Generate Knowledge alone
- Complex comparison → Generate Knowledge + Prompt Chaining 🔗
- High stakes decision → Generate Knowledge + Tree of Thought 🌳

⚠️ **Difference from CoT:** CoT reasons through a problem — Generate Knowledge builds a knowledge base BEFORE tackling it!

💡 **Step-Back Prompting tip:** A variation of Generate Knowledge — instead of *"generate everything about X"* use *"step back and think about the broader principles of X first, then apply them to my specific problem."* Useful when you need higher level abstraction rather than detailed knowledge!
