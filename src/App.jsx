import React from "react";
import "./styles/styles.css";
import Wordle from "./components/Wordle";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div className="wrapper">
        <h1>Choose Your Game</h1>
        <div className="game-container">
          {/* Link to Wordle game */}
          <Link to="/wordle" className="game-card">
            <h2>Wordle</h2>
            <p>Guess the 5-letter word in 6 tries!</p>
          </Link>

          {/* Memory Match (Coming Soon) */}
          <div className="game-card">
            <h2>Memory Match</h2>
            <p>Coming soon!</p>
          </div>
        </div>

        {/* game routes */}
        <Routes>
          {/* home/default route */}
          <Route path="/" element={<h2>Welcome to the Game Hub!</h2>} />

          {/* Wordle game route */}
          <Route path="/wordle" element={<Wordle />} />

          {/* memory match route goes here */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
