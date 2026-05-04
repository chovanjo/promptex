# 26. Contrastive Prompting

Instead of only showing good examples like Few-Shot, you show the AI **both a bad AND a good example side by side** — so it learns by seeing the difference! Like teaching a junior developer by showing wrong code next to right code! 👨‍💻

**How it's different from Few-Shot:**
- 🖼️ Few-Shot → shows only good examples
- 🔀 Contrastive → shows BAD and GOOD together — AI learns the DIFFERENCE!

**The magic formula:**
> ❌ *"Don't write like this: [bad example]"*
> ✅ *"Do write like this: [good example]"*

**Example — C# code comments:**
> ❌ *Don't write comments like this:*
> `// Loop through items`
>
> ✅ *Do write comments like this:*
> `// Filters active users older than 18 for GDPR compliance`

**Example — Bug reports:**
> ❌ *Don't report like this:*
> *"App doesn't work sometimes."*
>
> ✅ *Do report like this:*
> *"Login fails with 401 error when username contains special characters. Reproducible 100% on Chrome 121, Windows 11."*

💡 **Best used for:**
- ✍️ Writing style and tone
- 📋 Document and report formatting
- 🐛 Bug report standards
- 📧 Email communication style
- 🎯 Any output where "almost right" keeps happening!

⭐ **Power combo:** Few-Shot + Contrastive = show good examples THEN show bad vs good contrast = the AI understands your standard perfectly! 🔥

⚠️ **When AI keeps getting it almost right** — that's your signal to add a contrastive example showing exactly what's wrong vs what's right!
