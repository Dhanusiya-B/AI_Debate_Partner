import React, { useState } from "react";
import "./App.css";
import Setup from "./Components/Setup";
import DebateArena from "./Components/DebateArena";
import Verdict from "./Components/Verdict";

const SCREENS = { SETUP: "setup", DEBATE: "debate", VERDICT: "verdict" };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SETUP);
  const [debate, setDebate] = useState(null); // { sessionId, topic, userStance, aiStance, messages }
  const [verdict, setVerdict] = useState(null);

  const handleDebateStart = (debateData) => {
    setDebate(debateData);
    setScreen(SCREENS.DEBATE);
  };

  const handleVerdictReady = (verdictData) => {
    setVerdict(verdictData);
    setScreen(SCREENS.VERDICT);
  };

  const handleRestart = () => {
    setDebate(null);
    setVerdict(null);
    setScreen(SCREENS.SETUP);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">⚖</span>
          <span className="logo-text">Debate<em>AI</em></span>
        </div>
        <p className="tagline">Sharpen your arguments against an AI opponent</p>
      </header>

      <main className="app-main">
        {screen === SCREENS.SETUP && (
          <Setup onStart={handleDebateStart} />
        )}
        {screen === SCREENS.DEBATE && (
          <DebateArena
            debate={debate}
            onVerdict={handleVerdictReady}
            onRestart={handleRestart}
          />
        )}
        {screen === SCREENS.VERDICT && (
          <Verdict verdict={verdict} debate={debate} onRestart={handleRestart} />
        )}
      </main>
    </div>
  );
}