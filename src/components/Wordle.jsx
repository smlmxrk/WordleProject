// TODO: fix page rendering for wordle
// TODO: continue refactor (wordle --> memory match)


import React, { useState, useEffect, useCallback } from 'react';
import { wordList } from 'utils/words.js';

const WordleGame = () => {
  const [container, setContainer] = useState([]);
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

  // fetch random word
  const getRandom = useCallback(() => {
    return wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
  }, []);

  // start game function
  const startGame = useCallback(() => {
    setWinScreen({ show: false, message: '', totalGuesses: 0, isWin: false });
    setGameState({
      inputCount: 0,
      successCount: 0,
      successLetters: '',
      tryCount: 0,
      finalWord: '',
      randomWord: getRandom()
    });
    setInputRows(Array(6).fill().map(() => Array(5).fill('')));
    setInputStatuses(Array(6).fill().map(() => Array(5).fill('')));
  }, [getRandom]);

  // validate word
  const validateWord = useCallback(async () => {
    const { randomWord, tryCount, finalWord } = gameState;

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

  // handle input change
  const handleInputChange = useCallback((rowIndex, colIndex, value) => {
    const newInputRows = [...inputRows];
    newInputRows[rowIndex][colIndex] = value.toUpperCase();
    setInputRows(newInputRows);

    const newFinalWord = newInputRows[rowIndex].join('');
    setGameState(prev => ({
      ...prev,
      inputCount: newFinalWord.length,
      finalWord: newFinalWord
    }));
  }, [inputRows]);

  const handleKeyPress = useCallback((e) => {
    const { inputCount, tryCount } = gameState;

    if (inputCount === 5) {
      if (e.key === 'Enter') {
        validateWord();
      } else if (e.key === 'Backspace') {
        const newInputRows = [...inputRows];
        newInputRows[tryCount][inputCount - 1] = '';
        setInputRows(newInputRows);
        setGameState(prev => ({
          ...prev,
          inputCount: inputCount - 1,
          finalWord: prev.finalWord.slice(0, -1)
        }));
      }
    }
  }, [gameState, inputRows, validateWord]);


  useEffect(() => {
    startGame();
    window.addEventListener('keyup', handleKeyPress);
    return () => {
      window.removeEventListener('keyup', handleKeyPress);
    };
  }, [startGame, handleKeyPress]);

  // render input rows
  const renderInputRows = () => {
    return inputRows.map((row, rowIndex) => (
      <div key={rowIndex} className="input-group">
        {row.map((value, colIndex) => (
          <input
            key={colIndex}
            type="text"
            maxLength={1}
            value={value}
            disabled={rowIndex !== gameState.tryCount}
            className={`input-box ${inputStatuses[rowIndex][colIndex]}`}
            onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="wrapper">
      <div className="container">
        {renderInputRows()}
      </div>
      <div className="rules">
        <object type="image/svg+xml" data="../src/assets/rules.svg"></object>
      </div>
      {winScreen.show && (
        <div className="win-screen">
          <span style={{ fontSize: '250%' }}>{winScreen.message}</span>
          {winScreen.totalGuesses && (
            <span>Total guesses: {winScreen.totalGuesses}</span>
          )}
          <button onClick={startGame}>New Game</button>
          <button onClick={() => window.location.href = '../../public/index.html'}>
            Back to Games
          </button>
        </div>
      )}
    </div>
  );
};

export default WordleGame;
