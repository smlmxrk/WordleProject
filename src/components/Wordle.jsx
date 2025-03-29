import React, { useState, useEffect, useCallback, useRef } from 'react';

import { wordList } from 'utils/words.js';
// Import if using React Router
// import { useNavigate } from 'react-router-dom';
import 'styles/wordle.css'; // Ensure you have a corresponding CSS file

const WordleGame = () => {
  // const navigate = useNavigate(); // Uncomment if using React Router
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

  // Create refs for input elements
  const inputRefs = useRef(Array(6).fill().map(() => Array(5).fill(null)));

  // Get random word
  const getRandom = useCallback(() => {
    return wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
  }, []);

  // Debug random word
  useEffect(() => {
    console.log("Random word:", gameState.randomWord);
  }, [gameState.randomWord]);

  // Focus the first input of the active row
  const focusActiveInput = useCallback(() => {
    const { tryCount, inputCount } = gameState;
    if (inputRefs.current[tryCount] && inputRefs.current[tryCount][inputCount]) {
      setTimeout(() => {
        inputRefs.current[tryCount][inputCount].focus();
      }, 0);
    }
  }, [gameState]);

  // Start game function
  const startGame = useCallback(() => {
    setWinScreen({ show: false, message: '', totalGuesses: 0, isWin: false });
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

    // Focus first input after state update
    setTimeout(() => {
      if (inputRefs.current[0] && inputRefs.current[0][0]) {
        inputRefs.current[0][0].focus();
      }
    }, 0);
  }, [getRandom]);

  // Validate word
  const validateWord = useCallback(async () => {
    const { randomWord, tryCount, finalWord } = gameState;

    if (finalWord.length !== 5) {
      alert("Please enter a 5-letter word");
      return;
    }

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

      // Focus first input of next row
      setTimeout(() => {
        if (inputRefs.current[tryCount + 1] && inputRefs.current[tryCount + 1][0]) {
          inputRefs.current[tryCount + 1][0].focus();
        }
      }, 0);
    }
  }, [gameState, inputStatuses]);

  // Handle input change
  const handleInputChange = useCallback((rowIndex, colIndex, value) => {
    const { tryCount } = gameState;

    // Ignore inputs for inactive rows
    if (rowIndex !== tryCount) return;

    const newInputRows = [...inputRows];
    const newValue = value.toUpperCase();
    newInputRows[rowIndex][colIndex] = newValue;
    setInputRows(newInputRows);

    // Build the final word from the current row
    const newFinalWord = newInputRows[rowIndex].join('');
    setGameState(prev => ({
      ...prev,
      inputCount: newFinalWord.length,
      finalWord: newFinalWord
    }));

    // Auto-advance to next input if value is entered
    if (newValue && colIndex < 4) {
      setTimeout(() => {
        if (inputRefs.current[rowIndex][colIndex + 1]) {
          inputRefs.current[rowIndex][colIndex + 1].focus();
        }
      }, 0);
    }
  }, [gameState, inputRows]);

  // Handle keyboard input for navigation and submission
  const handleKeyDown = useCallback((e, rowIndex, colIndex) => {
    const { tryCount, inputCount } = gameState;

    // Ignore keyboard events for inactive rows
    if (rowIndex !== tryCount) return;

    if (e.key === 'Enter' && inputCount === 5) {
      validateWord();
      e.preventDefault();
    } else if (e.key === 'Backspace' && !inputRows[rowIndex][colIndex]) {
      // Move to previous input on backspace if current input is empty
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

  // Global keyboard event listener
  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      const { tryCount, inputCount } = gameState;

      if (e.key === 'Enter' && inputCount === 5) {
        validateWord();
      }
    };

    window.addEventListener('keyup', handleGlobalKeyPress);
    return () => {
      window.removeEventListener('keyup', handleGlobalKeyPress);
    };
  }, [gameState, validateWord]);

  // Initialize game on mount
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Render input rows
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

  // Return to game selection handler
  const handleBackToGames = () => {
    // Using React Router (preferred):
    // navigate('/');

    // Using direct navigation (fallback):
    window.location.href = '/';
  };

  return (
    <div className="wrapper">
      <div className="container">
        {renderInputRows()}
      </div>
      <div className="rules">
        {/* Updated path to rules SVG */}
        <img src="assets/rules.svg" alt="Game Rules"/>
      </div>
      {winScreen.show && (
        <div className="win-screen">
          <span style={{ fontSize: '250%' }}>{winScreen.message}</span>
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
