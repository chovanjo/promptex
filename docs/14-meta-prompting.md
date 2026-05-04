# 14. Meta Prompting

Instead of giving specific examples like Few-Shot, you give the AI an abstract template — teaching it the shape of the solution rather than the solution itself! Like teaching someone how to paint instead of showing them 3 paintings. 🎨

**The magic formula:**
- *"Do [task] using this structure:"*
- *[Element 1]: [placeholder]*
- *[Element 2]: [placeholder]*
- *[Element 3]: [placeholder]*
- *"Now apply this to: [your input]"*

**Example:**
*"Review any C# code using this structure:*
- *Code Quality: [what's good, what's bad]*
- *Performance: [bottlenecks and suggestions]*
- *Security: [vulnerabilities found]*
- *Improvements: [specific actionable fixes]*

*Now review this code: ..."* 🧬

**Key advantages over Few-Shot:**
- Uses fewer tokens — no need for full examples 📉
- Works for ANY input — fully reusable ♻️
- More flexible — not tied to specific cases 🔄

⚠️ **When NOT to use it:** For novel or unique tasks where the AI needs concrete examples to understand what you want — use Few-Shot instead!
