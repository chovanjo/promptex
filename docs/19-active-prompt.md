# 19. Active-Prompt

Instead of choosing examples upfront and never changing them, Active-Prompt **learns from real failures** and improves over time. Like a GPS that updates itself based on wrong turns — getting smarter with every mistake! 🗺️

**The core idea:**
> AI gets uncertain or wrong → YOU add that specific example → prompt gets smarter → repeat! 🔄

**The Active-Prompt cycle:**
1. 🚀 Use your prompt
2. 👀 Notice where AI gets uncertain or wrong
3. ✍️ Add those specific cases as new examples
4. 💪 Prompt gets smarter over time!

**Example — evolving a C# code review prompt:**

*Starting prompt:*
> *"Classify this code review comment as: Security / Performance / Readability / Design"*

*After 2 weeks — updated with real failures:*
> *"Classify this code review comment as: Security / Performance / Readability / Design*
> - *"This method is too long"* → Design
> - *"Missing using statement"* → Readability
> - *"Hardcoded connection string"* → Security
>
> *Now classify: [paste comment here]"* 🎯

💡 **Key insight:**
Every time AI gets something wrong in your C# work → add that specific case as a new example → your prompt library grows smarter with every project! 🌱

**Active-Prompt vs Few-Shot:**
- 🖼️ Few-Shot = you add examples **upfront** from guessing
- 🎯 Active-Prompt = you add examples **based on real failures**

⭐ **Power combo:**
APE to write the best initial prompt ⚙️
\+ Generate Knowledge to build context 💡
\+ Active-Prompt to improve from real failures 🎯
= A prompt that starts strong AND gets better forever! 🌱

⚠️ **When classifying:** Always write examples as *"X"* → ✅ Category *(not other category)* for maximum clarity!

💡 **Reflexion tip:** Want the AI to self-improve without you spotting mistakes? Add this to ANY prompt:
> *"Now critique your own answer and rewrite it fixing all issues you found."*
> The AI becomes its own reviewer — no human needed! 🔄
