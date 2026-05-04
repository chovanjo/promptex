# 22. Graph Prompting

Instead of describing relationships in plain text, represent knowledge as a **network of connected nodes** that the AI can reason across! Like drawing a road map instead of describing the route in words! 🗺️

**What a graph consists of:**
- 🔵 Node = a thing *(class, service, concept)*
- ➡️ Edge = a relationship *(calls, depends on, inherits from)*

**The golden arrow rule:**
> ➡️ Always points FROM the dependent TO what it depends on
> *"A → B"* means *"A depends on / inherits from B"* 🎯

**The magic formula:**
```
NodeA → NodeB → NodeC
NodeA → NodeD
NodeE → NodeB
```
*"Based on this graph, [your question about relationships, impact, or order]"*

**Example:**
```
Animal → FoodService
Dog → Animal
Cat → Animal
GuideDog → Dog
GuideDog → TrainingService
```
*"Based on this class dependency graph, if we change the Animal class, which classes need updating and in what order?"* 🕸️

**What graphs reveal that text hides:**
- 🔗 Direction — who calls who, not just who exists
- 📍 Distance — how many hops between nodes
- 💥 Cascade — which failures trigger other failures

**Best use cases:**
- 🏗️ Microservices dependency maps
- 🔄 Class inheritance diagrams
- 📦 Package dependencies
- 🗄️ Database relationship schemas
- 🏢 Organisation charts

💡 **Graph Prompting vs Multimodal CoT:**
- 🕸️ Graph Prompting → you BUILD relationships as text arrows
- 🖼️ Multimodal CoT → you PROVIDE an actual diagram image

⚡ **Power combo:** Graph Prompting + Multimodal CoT + Tree of Thought = the ultimate architecture analysis prompt! 🔥
