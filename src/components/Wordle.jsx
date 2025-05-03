import React, { useState, useEffect, useCallback, useRef } from 'react';
import { wordList } from 'utils/words.js';
import 'styles/wordle.css';
import { ReactComponent as RulesSVG } from "../assets/rules.svg";

const WordleGame = () => {
  const [showHelp, setShowHelp] = useState(false);

  const [winScreen, setWinScreen] = useState({
    show: false,
    message: '',
    totalGuesses: 0,
    isWin: false
  });
  const [gameState, setGameState] = useState({
    inputCount: 0,
    successCount: 0,
    successLetters: '',
    tryCount: 0,
    finalWord: '',
    randomWord: ''
  });
  const [inputRows, setInputRows] = useState(
    Array(6).fill().map(() => Array(5).fill(''))
  );
  const [inputStatuses, setInputStatuses] = useState(
    Array(6).fill().map(() => Array(5).fill(''))
  );

  const inputRefs = useRef(Array(6).fill().map(() => Array(5).fill(null)));

  const getRandom = useCallback(() => {
    return wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
  }, []);

  useEffect(() => {
    if (!gameState.randomWord) return; // avoid dupes in console (for testing purposes)
    console.log("Random word:", gameState.randomWord);
  }, [gameState.randomWord]);

  const startGame = useCallback(() => {
    setWinScreen({show: false, message: '', totalGuesses: 0, isWin: false});
    const newRandomWord = getRandom();
    setGameState({
      inputCount: 0,
      successCount: 0,
      successLetters: '',
      tryCount: 0,
      finalWord: '',
      randomWord: newRandomWord
    });
    setInputRows(Array(6).fill().map(() => Array(5).fill('')));
    setInputStatuses(Array(6).fill().map(() => Array(5).fill('')));

    setTimeout(() => {
      if (inputRefs.current[0] && inputRefs.current[0][0]) {
        inputRefs.current[0][0].focus();
      }
    }, 0);
  }, [getRandom]);

  // validation logic
  const validateWord = useCallback(async () => {
    const {randomWord, tryCount, finalWord} = gameState;

    if (finalWord.length !== 5) {
      alert("Please enter a 5-letter word");
      return;
    }

    // call API
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${finalWord}`);
      if (!response.ok) {
        alert("Please enter a valid word");
        return;
      }
    } catch (error) {
      console.error("API Error:", error);
      return;
    }

    const newInputStatuses = [...inputStatuses];
    let successCount = 0;

    for (let i = 0; i < randomWord.length; i++) {
      if (finalWord[i] === randomWord[i]) {
        newInputStatuses[tryCount][i] = 'correct';
        successCount++;
      } else if (randomWord.includes(finalWord[i])) {
        newInputStatuses[tryCount][i] = 'exists';
      } else {
        newInputStatuses[tryCount][i] = 'incorrect';
      }
    }

    setInputStatuses(newInputStatuses);

    if (successCount === 5) {
      setWinScreen({
        show: true,
        message: 'You win!',
        totalGuesses: tryCount + 1,
        isWin: true
      });
    } else if (tryCount + 1 === 6) {
      setWinScreen({
        show: true,
        message: `You lose! The word was ${randomWord}.`,
        totalGuesses: 6,
        isWin: false
      });
    } else {
      setGameState(prev => ({
        ...prev,
        inputCount: 0,
        finalWord: '',
        tryCount: prev.tryCount + 1
      }));
    }
  }, [gameState, inputStatuses]);

  const handleInputChange = useCallback((rowIndex, colIndex, value) => {
    const {tryCount} = gameState;

    if (rowIndex !== tryCount) return;

    const newInputRows = [...inputRows];
    const newValue = value.toUpperCase();
    newInputRows[rowIndex][colIndex] = newValue;
    setInputRows(newInputRows);

    const newFinalWord = newInputRows[rowIndex].join('');
    setGameState(prev => ({
      ...prev,
      inputCount: newFinalWord.length,
      finalWord: newFinalWord
    }));

    if (newValue && colIndex < 4) {
      setTimeout(() => {
        if (inputRefs.current[rowIndex][colIndex + 1]) {
          inputRefs.current[rowIndex][colIndex + 1].focus();
        }
      }, 0);
    }
  }, [gameState, inputRows]);

  const handleKeyDown = useCallback((e, rowIndex, colIndex) => {
    const {tryCount, inputCount} = gameState;

    if (rowIndex !== tryCount) return;

    if (e.key === 'Enter' && inputCount === 5) {
      validateWord();
      e.preventDefault();
    } else if (e.key === 'Backspace' && !inputRows[rowIndex][colIndex]) {
      if (colIndex > 0) {
        const newInputRows = [...inputRows];
        newInputRows[rowIndex][colIndex - 1] = '';
        setInputRows(newInputRows);
        setGameState(prev => ({
          ...prev,
          inputCount: prev.inputCount - 1,
          finalWord: prev.finalWord.slice(0, -1)
        }));
        setTimeout(() => {
          if (inputRefs.current[rowIndex][colIndex - 1]) {
            inputRefs.current[rowIndex][colIndex - 1].focus();
          }
        }, 0);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && colIndex > 0) {
      inputRefs.current[rowIndex][colIndex - 1].focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && colIndex < 4) {
      inputRefs.current[rowIndex][colIndex + 1].focus();
      e.preventDefault();
    }
  }, [gameState, inputRows, validateWord]);

  useEffect(() => {
    // focus first box of next row
    if (inputRefs.current[gameState.tryCount] && inputRefs.current[gameState.tryCount][0]) {
      inputRefs.current[gameState.tryCount][0].focus();
    }
  }, [gameState.tryCount]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const renderInputRows = () => {
    return inputRows.map((row, rowIndex) => (
      <div key={rowIndex} className="input-group">
        {row.map((value, colIndex) => (
          <input
            key={colIndex}
            ref={el => inputRefs.current[rowIndex][colIndex] = el}
            type="text"
            maxLength={1}
            value={value}
            disabled={rowIndex !== gameState.tryCount}
            className={`input-box ${inputStatuses[rowIndex][colIndex]}`}
            onChange={e => handleInputChange(rowIndex, colIndex, e.target.value)}
            onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
          />
        ))}
      </div>
    ));
  };

  const handleBackToGames = () => {
    window.location.href = '/';
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowHelp(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="wrapper">
      {!winScreen.show && (
        <div className="header-buttons">
          <button
            className="help-button"
            onClick={() => setShowHelp(true)}>
            Need Help?
          </button>
          <button
            className="back-button"
            onClick={handleBackToGames}>
            Back to Games
          </button>
        </div>
      )}

      {showHelp && (
        <div
          className="modal-overlay"
          onClick={() => setShowHelp(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}>
            <RulesSVG className="rules-image"/>
            <button
              className="close-button"
              onClick={() => setShowHelp(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="container">
        {renderInputRows()}
      </div>

      {winScreen.show && (
        <div className="win-screen">
        <span style={{fontSize: '250%'}}>
          {winScreen.message}
        </span>
          {winScreen.totalGuesses && (
            <span>Total guesses: {winScreen.totalGuesses}</span>
          )}
          <button onClick={startGame}>New Game</button>
          <button onClick={handleBackToGames}>
            Back to Games
          </button>
        </div>
      )}
    </div>
  );
};
  export default WordleGame;
