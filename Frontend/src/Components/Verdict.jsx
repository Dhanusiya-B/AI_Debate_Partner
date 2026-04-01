import React from "react";
import "./Verdict.css";

const SCORE_CATEGORIES = ["logic", "evidence", "persuasion", "rebuttal"];

function ScoreBar({ label, value }) {
  return (
    <div className="score-row">
      <span className="score-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${value * 10}%` }} />
      </div>
      <span className="score-value">{value}/10</span>
    </div>
  );
}

export default function Verdict({ verdict, debate, onRestart }) {
  if (!verdict) return null;

  const winner = verdict.winner?.toLowerCase();
  const isHumanWinner = winner === "human";

  return (
    <div className="verdict">
      <div className={`verdict-banner ${isHumanWinner ? "win" : "lose"}`}>
        <div className="verdict-icon">{isHumanWinner ? "🏆" : "🤖"}</div>
        <div className="verdict-headline">
          <h1>{isHumanWinner ? "You Won!" : "AI Wins"}</h1>
          <p className="verdict-reason">{verdict.reason}</p>
        </div>
      </div>

      <div className="verdict-topic">
        <span className="vt-label">Debated:</span>
        <span className="vt-text">"{debate?.topic}"</span>
      </div>

      {verdict.summary && (
        <div className="verdict-summary">
          <h3>Judge's Summary</h3>
          <p>{verdict.summary}</p>
        </div>
      )}

      {verdict.scores && (
        <div className="scores-section">
          <div className="scores-col">
            <h3 className="scores-title human-color">🧑 Your Scores</h3>
            {SCORE_CATEGORIES.map((cat) => (
              <ScoreBar
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                value={verdict.scores.human?.[cat] ?? 0}
              />
            ))}
          </div>
          <div className="scores-col">
            <h3 className="scores-title ai-color">🤖 AI Scores</h3>
            {SCORE_CATEGORIES.map((cat) => (
              <ScoreBar
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                value={verdict.scores.ai?.[cat] ?? 0}
              />
            ))}
          </div>
        </div>
      )}

      {(verdict.strengths || verdict.weaknesses) && (
        <div className="feedback-section">
          <div className="feedback-col">
            <h4>✅ Your Strengths</h4>
            <p>{verdict.strengths?.human || "—"}</p>
            <h4 style={{ marginTop: "1rem" }}>⚠ Your Weaknesses</h4>
            <p>{verdict.weaknesses?.human || "—"}</p>
          </div>
          <div className="feedback-col">
            <h4>✅ AI Strengths</h4>
            <p>{verdict.strengths?.ai || "—"}</p>
            <h4 style={{ marginTop: "1rem" }}>⚠ AI Weaknesses</h4>
            <p>{verdict.weaknesses?.ai || "—"}</p>
          </div>
        </div>
      )}

      <button className="restart-btn" onClick={onRestart}>
        ← Start a New Debate
      </button>
    </div>
  );
}