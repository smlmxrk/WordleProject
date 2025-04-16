import React from "react";
import "./styles/styles.css";
import Wordle from "./components/Wordle";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import MemoryMatch from "./components/Memory-Match";
import gitHubIcon from "./assets/github_icon.png";

// TODO: add header/buttons to github, etc

const App = () => {
  return (
    <Router>
      <div className="wrapper">
        <header className="app-header">
          <a
            href="https://github.com/smlmxrk"
            target="_blank"
            rel="noopener noreferrer"
            className="github-button"
            >
            <img src={gitHubIcon} alt="Github Icon" className="github-icon"/>
            <span>Visit my GitHub</span>
          </a>
        </header>
        <h1>Choose Your Game</h1>
        <div className="game-container">
          {/* Link to Wordle game */}
          <Link to="/wordle" className="game-card">
            <h2>Wordle</h2>
            <p>Guess the 5-letter word in 6 tries!</p>
          </Link>

          {/* Memory Match (Coming Soon) */}
          <Link to="/memorymatch" className="game-card">
            <h2>Memory Match</h2>
            <p>Test your memory and match cards together!</p>
          </Link>
        </div>

        {/* game routes */}
        <Routes>
          {/* home/default route */}
          <Route path="/" element={<h2>Welcome to the Game Hub!</h2>} />

          {/* Wordle game route */}
          <Route path="/wordle" element={<Wordle />} />
          {/* memory match route goes here */}
          <Route path="/memorymatch" element={<MemoryMatch />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
