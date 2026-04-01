import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ message, isTyping }) {
  const isAI = message?.role === "ai";

  if (isTyping) {
    return (
      <div className="bubble-wrap ai">
        <div className="bubble-avatar ai-avatar">🤖</div>
        <div className="bubble-body">
          <span className="bubble-sender">AI Opponent</span>
          <div className="bubble ai thinking">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bubble-wrap ${isAI ? "ai" : "user"}`}>
      {isAI && <div className="bubble-avatar ai-avatar">🤖</div>}

      <div className="bubble-body">
        <span className="bubble-sender">{isAI ? "AI Opponent" : "You"}</span>
        <div className={`bubble ${isAI ? "ai" : "user"}`}>
          <p>{message.content}</p>
        </div>
        <span className="bubble-time">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {!isAI && <div className="bubble-avatar user-avatar">🧑</div>}
    </div>
  );
}