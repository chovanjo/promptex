# 23. Structured Output Prompting

Instead of getting free-form text, you force the AI to respond in a **specific, predictable format** — JSON, XML, CSV, YAML, or any custom structure. Like handing a waiter a form to fill in instead of letting them talk freely! 🍽️

**The golden rule:**
> If a **human** reads the output → free text or Meta Prompting is fine 📖
> If **code** reads the output → always use Structured Output! 💻

**Available formats:**
- 🔧 JSON → APIs, apps, data processing
- 📄 XML → Enterprise systems, .NET configs
- 📊 CSV → Spreadsheets, test data, Excel exports
- 📝 YAML → Docker, GitHub Actions, CI/CD pipelines
- 🔢 SQL → Database queries and migrations
- 📋 Markdown → Documents, reports, cheat sheets
- 🌐 HTML → Web pages, email templates

**The magic formula:**
*"Respond ONLY in this JSON structure — no extra text:"*
```json
[
  {
    "fieldName": "",
    "numericField": 0,
    "enumField": "Option1/Option2/Option3"
  }
]
```

**Example — C# sprint planning tool:**
```json
[
  {
    "userStory": "",
    "estimatedTimeInHours": 0,
    "developerLevel": "Junior/Medior/Senior",
    "priority": "High/Medium/Low",
    "readiness": "Unclear/Clear"
  }
]
```
*"Analyse these user stories. Return JSON only — no extra text."* 📐

**C# deserialisation rules:**
- Always use **camelCase** field names 🐫
- Numbers must be `0` not `""` — so C# knows the type!
- Wrap in `[]` array for multiple items
- Typos in field names = deserialisation failures! ⚠️

💡 **Structured Output vs Meta Prompting:**
- 🧬 Meta Prompting → human readable, AI may add extra text
- 📐 Structured Output → machine readable, strict JSON only

⚠️ **Always add:** *"No extra text — JSON only"* — otherwise AI adds explanations that break your parser! 💥
