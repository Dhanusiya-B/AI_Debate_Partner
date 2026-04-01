import React, { useState, useRef, useEffect } from "react";
import "./DebateArena.css";
import MessageBubble from "./MessageBubble";

const API = "http://localhost:5000";

export default function DebateArena({ debate, onVerdict, onRestart }) {
  const [messages, setMessages] = useState(debate.messages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [turns, setTurns] = useState(0);
  const chatEndRef = useRef(null);

  const MAX_TURNS = 5;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);

    try {
      const res = await fetch(`${API}/api/debate/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: debate.sessionId, userMessage: userMsg }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([...newMessages, { role: "ai", content: data.aiMessage }]);
      setTurns((t) => t + 1);
    } catch {
      setMessages([...newMessages, { role: "ai", content: "⚠ Error getting response. Check backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const requestVerdict = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`${API}/api/debate/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: debate.sessionId }),
      });
      const data = await res.json();
      onVerdict(data);
    } catch {
      alert("Failed to get verdict. Check backend.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="arena">
      {/* Topic banner */}
      <div className="arena-topic">
        <div className="topic-meta">
          <span className="topic-label">Topic</span>
          <span className="topic-divider">·</span>
          <span className="stance-tag user-stance">You: {debate.userStance.toUpperCase()}</span>
          <span className="topic-divider">·</span>
          <span className="stance-tag ai-stance">AI: {debate.aiStance.toUpperCase()}</span>
        </div>
        <h2 className="topic-text">"{debate.topic}"</h2>
        <div className="turn-counter">
          <span className={`turn-pill ${turns >= MAX_TURNS ? "turn-max" : ""}`}>
            {turns}/{MAX_TURNS} turns
          </span>
        </div>
      </div>

      {/* Chat log — uses MessageBubble */}
      <div className="chat-log">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && <MessageBubble isTyping />}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="arena-input-area">
        {turns >= MAX_TURNS ? (
          <div className="max-turns-notice">
            <p>Maximum turns reached. Ready for the judge's verdict?</p>
          </div>
        ) : (
          <div className="input-row">
            <textarea
              className="debate-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Make your argument…"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? <span className="spinner" /> : "→"}
            </button>
          </div>
        )}

        <div className="arena-actions">
          <button className="action-btn secondary" onClick={onRestart}>
            ← New Debate
          </button>
          <button
            className="action-btn primary"
            onClick={requestVerdict}
            disabled={evaluating || messages.length < 3}
          >
            {evaluating ? (
              <><span className="spinner dark" /> Judging…</>
            ) : (
              "⚖ Get Verdict"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}