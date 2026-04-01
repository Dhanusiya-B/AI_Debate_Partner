import React, { useState } from "react";
import "./TopicSelector.css";

const CATEGORIES = {
  Technology: [
    "AI will eliminate more jobs than it creates",
    "Social media does more harm than good",
    "Cryptocurrency is the future of finance",
    "Big Tech companies should be broken up",
  ],
  Society: [
    "Remote work is better than office work",
    "Universal Basic Income should be implemented",
    "Veganism should be mandatory to fight climate change",
    "Standardized testing should be abolished",
  ],
  Science: [
    "Space exploration should be a global priority",
    "Gene editing in humans should be allowed",
    "Nuclear energy is essential for a clean future",
    "Animal testing for medicine is justified",
  ],
  Politics: [
    "Voting should be made mandatory",
    "Open borders would benefit the global economy",
    "Surveillance cameras improve public safety",
    "Wealth taxes are fair and effective",
  ],
};

export default function TopicSelector({ value, onChange }) {
  const [activeCategory, setActiveCategory] = useState("Technology");
  const [customMode, setCustomMode] = useState(false);

  const handleChipClick = (topic) => {
    onChange(topic);
    setCustomMode(false);
  };

  const handleCustomChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="topic-selector">
      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${!customMode ? "active" : ""}`}
          onClick={() => setCustomMode(false)}
        >
          Browse Topics
        </button>
        <button
          className={`mode-btn ${customMode ? "active" : ""}`}
          onClick={() => { setCustomMode(true); onChange(""); }}
        >
          Custom Topic
        </button>
      </div>

      {customMode ? (
        <div className="custom-input-wrap">
          <input
            className="custom-input"
            type="text"
            value={value}
            onChange={handleCustomChange}
            placeholder="Type your own debate topic…"
            autoFocus
          />
          {value && (
            <div className="custom-preview">
              <span className="preview-label">Your topic:</span>
              <span className="preview-text">"{value}"</span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="category-tabs">
            {Object.keys(CATEGORIES).map((cat) => (
              <button
                key={cat}
                className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Topic chips */}
          <div className="topic-chips">
            {CATEGORIES[activeCategory].map((topic) => (
              <button
                key={topic}
                className={`topic-chip ${value === topic ? "selected" : ""}`}
                onClick={() => handleChipClick(topic)}
              >
                {value === topic && <span className="check">✓</span>}
                {topic}
              </button>
            ))}
          </div>

          {value && CATEGORIES[activeCategory].includes(value) && (
            <div className="selected-preview">
              <span className="preview-label">Selected:</span>
              <span className="preview-text">"{value}"</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}