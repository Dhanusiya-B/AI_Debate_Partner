const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();
app.use(cors({ origin: /^http:\/\/localhost:\d+$/, methods: ["GET", "POST"] }));
app.use(express.json());

console.log("🔑 GROQ_API_KEY:", process.env.GROQ_API_KEY
  ? process.env.GROQ_API_KEY.slice(0, 12) + "..."
  : "❌ NOT FOUND - add GROQ_API_KEY to .env");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
console.log("✅ Groq client ready");

const sessions = {};

app.get("/", (req, res) => res.json({ status: "🎤 Debate server running!" }));

// POST /api/debate/start
app.post("/api/debate/start", async (req, res) => {
  const { topic, userStance } = req.body;
  if (!topic || !userStance)
    return res.status(400).json({ error: "topic and userStance required" });

  const aiStance = userStance === "for" ? "against" : "for";
  const sessionId = Date.now().toString();

  const systemPrompt = `You are an expert debater arguing ${aiStance} the following topic: "${topic}".
The human is arguing ${userStance} the topic.
Rules:
- Stay strictly in your assigned stance (${aiStance}) no matter what.
- Use logic, evidence, and rhetorical skill.
- Be concise (2-4 sentences per response), sharp, and persuasive.
- Directly counter the human's last argument when possible.
- Never agree with the opposing side or switch stances.`;

  sessions[sessionId] = {
    topic,
    userStance,
    aiStance,
    systemPrompt,
    messages: [{ role: "system", content: systemPrompt }],
  };

  try {
    const openingPrompt = `Begin the debate on "${topic}". Make your opening argument arguing ${aiStance} the topic. Keep it to 2-4 sentences.`;
    
    sessions[sessionId].messages.push({ role: "user", content: openingPrompt });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: sessions[sessionId].messages,
      max_tokens: 300,
    });

    const aiMessage = completion.choices[0].message.content;
    sessions[sessionId].messages.push({ role: "assistant", content: aiMessage });

    console.log("✅ Debate started:", sessionId);
    res.json({ sessionId, aiMessage, aiStance });
  } catch (err) {
    console.error("❌ Groq Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/debate/respond
app.post("/api/debate/respond", async (req, res) => {
  const { sessionId, userMessage } = req.body;
  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (!userMessage) return res.status(400).json({ error: "userMessage required" });

  session.messages.push({ role: "user", content: userMessage });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: session.messages,
      max_tokens: 300,
    });

    const aiMessage = completion.choices[0].message.content;
    session.messages.push({ role: "assistant", content: aiMessage });

    console.log("✅ AI responded");
    res.json({ aiMessage });
  } catch (err) {
    console.error("❌ Groq Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/debate/evaluate
app.post("/api/debate/evaluate", async (req, res) => {
  const { sessionId } = req.body;
  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });

  const transcript = session.messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "assistant" ? "AI" : "Human"}: ${m.content}`)
    .join("\n\n");

  const evalPrompt = `You are an impartial debate judge. Respond ONLY with a valid JSON object. No markdown, no backticks, no extra text before or after the JSON.

Topic: "${session.topic}"
Human argued: ${session.userStance}
AI argued: ${session.aiStance}

Transcript:
${transcript}

Respond with exactly this JSON:
{"winner":"Human or AI","reason":"one sentence reason","scores":{"human":{"logic":7,"evidence":6,"persuasion":7,"rebuttal":6},"ai":{"logic":8,"evidence":7,"persuasion":8,"rebuttal":7}},"strengths":{"human":"human strength","ai":"ai strength"},"weaknesses":{"human":"human weakness","ai":"ai weakness"},"summary":"2-3 sentence summary"}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: evalPrompt }],
      max_tokens: 600,
    });

    const raw = completion.choices[0].message.content;
    console.log("✅ Verdict generated");
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error("❌ Verdict Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎤 Debate server running on port ${PORT}`))
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} busy. Run: npx kill-port ${PORT}`);
      process.exit(1);
    }
  });