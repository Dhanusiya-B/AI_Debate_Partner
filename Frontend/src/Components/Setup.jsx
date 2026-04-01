import React, { useState } from "react";
import "./Setup.css";
import TopicSelector from "./TopicSelector";

const API = "http://localhost:5000";

export default function Setup({ onStart }) {
  const [topic, setTopic] = useState("");
  const [stance, setStance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (!topic.trim()) return setError("Please select or enter a debate topic.");
    if (!stance) return setError("Please choose your stance.");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/debate/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), userStance: stance }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onStart({
        sessionId: data.sessionId,
        topic: topic.trim(),
        userStance: stance,
        aiStance: data.aiStance,
        messages: [{ role: "ai", content: data.aiMessage }],
      });
    } catch (err) {
      setError("Failed to start debate. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup">
      <div className="setup-hero">
        <h1 className="setup-title">
          Choose your <em>battleground</em>
        </h1>
        <p className="setup-subtitle">
          Pick a topic, take a side, and go head-to-head with an AI that will
          argue the opposite position relentlessly.
        </p>
      </div>

      <div className="setup-card">
        <div className="field-group">
          <label className="field-label">Debate Topic</label>
          <TopicSelector value={topic} onChange={setTopic} />
        </div>

        <div className="field-group">
          <label className="field-label">Your Stance</label>
          <div className="stance-buttons">
            <button
              className={`stance-btn for ${stance === "for" ? "active" : ""}`}
              onClick={() => setStance("for")}
            >
              <span className="stance-icon">👍</span>
              <span>FOR</span>
              <small>I support this</small>
            </button>
            <button
              className={`stance-btn against ${stance === "against" ? "active" : ""}`}
              onClick={() => setStance("against")}
            >
              <span className="stance-icon">👎</span>
              <span>AGAINST</span>
              <small>I oppose this</small>
            </button>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="start-btn" onClick={handleStart} disabled={loading}>
          {loading ? (
            <span className="spinner-wrap">
              <span className="spinner" /> Preparing AI opponent…
            </span>
          ) : (
            "Start Debate →"
          )}
        </button>
      </div>
    </div>
  );
}