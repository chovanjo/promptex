# 9. Prompt Chaining

Breaking a big task into smaller connected prompts — where each prompt builds on the output of the previous one. Like a relay race 🏃‍♂️ where each runner receives the baton and carries it forward.

**The magic formula:**
- Prompt 1: *"Do X"*
- Prompt 2: *"Based on that, do Y"*
- Prompt 3: *"Using that result, do Z"*

**Connector words:** *"Based on that / Using that result / Now take that and / Building on that"*

💡 **Least-to-Most Prompting tip:** A variation of Prompt Chaining combined with Generate Knowledge — deliberately escalate complexity from simple to complex:
- Step 1: *"Explain what a C# interface is."*
- Step 2: *"Now explain why interfaces are useful for dependency injection."*
- Step 3: *"Now implement a full dependency injection pattern using interfaces."*
Use when AI needs the foundation before tackling the complex version! 🎓

💡 **Skeleton of Thought tip:** Plan the WHOLE structure first, then fill in each section — every part gets equal attention:
- Step 1: *"Create a complete outline for [task] with all sections and key points."*
- Step 2: *"Now fill in each section fully."*
Results in faster, better structured responses — especially for long documents or guides! ⚡

**Example:**
- *"List the steps to build a C# REST API for a blog."*
- *"Using that plan, write the C# code."*
- *"Review the code you just wrote and fix all errors."*
- *"Write e2e tests for the final code."*
