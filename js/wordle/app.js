/* TODO:
-expand word list
-switch themes (dark/light mode functionality)
-better win screen (confetti, "you won", etc.)
 */

import { wordList } from "./words.js";

console.log("JavaScript is loaded!");

let container = document.querySelector(".container");
let winScreen = document.querySelector(".win-screen");
let submitButton = document.querySelector(".submit");
let inputCount, tryCount, successCount, successLetters, inputRow, inputBox;
let randomWord, finalWord;

const isTouchDevice = () => {
  return "ontouchstart" in document.documentElement;
};

// define the startGame function as async
const startGame = async () => {
  winScreen.classList.add("hide");
  container.innerHTML = "";
  inputCount = 0;
  successCount = 0;
  successLetters = "";
  tryCount = 0;
  finalWord = "";

  // create the input groups
  for (let i = 0; i < 6; i++) { // rows
    let inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");
    for (let j = 0; j < 5; j++) { // columns
      let inputBox = document.createElement("input");
      inputBox.type = "text";
      inputBox.classList.add("input-box");
      inputBox.maxLength = 1;
      inputBox.disabled = true;
      inputBox.addEventListener("keyup", checker);
      inputGroup.appendChild(inputBox);
    }
    container.appendChild(inputGroup);
  }

  // select the input groups and boxes
  inputRow = document.querySelectorAll(".input-group");
  inputBox = document.querySelectorAll(".input-box");

  // Update configuration (assuming updateDivConfig is defined)
  updateDivConfig(inputRow[tryCount].firstChild, false);

  // get random word from list
  randomWord = getRandom();
  console.log(randomWord);
};

// fetch random word
function getRandom() {
  return wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
}

function updateDivConfig(element, disabledStatus) {
  if (element) {
    element.disabled = disabledStatus;
    if (!disabledStatus) {
      element.focus();
    }
  }
}

// writing in input logic
const checker = async (e) => {
  let value = e.target.value.toUpperCase();
  if (value && inputCount < 5) {
    finalWord += value;
    inputCount++;
    if (inputCount < 5) {
      updateDivConfig(e.target.nextElementSibling, false)
    }
  } else if (!value) {
    if (inputCount > 0) {
      finalWord = finalWord.slice(0, -1);
      inputCount--;
      updateDivConfig(e.target.previousElementSibling, false);
    }
  }
};

// case where user presses backspace and all inputs are filled
window.addEventListener("keyup", (e) => {
  if (inputCount >= 5) {
    if (e.key === "Enter") {
      validateWord();
    } else if (e.key === "Backspace") {
      inputRow[tryCount].lastChild.value = "";
      finalWord = finalWord.slice(0, -1);
      updateDivConfig(inputRow[tryCount].lastChild, false);
      inputCount--;
    }
  }
});

// word validation
const validateWord = async () => {
  if (isTouchDevice()) {
    submitButton.classList.add("hide");
  }
  let currentInputs = inputRow[tryCount].querySelectorAll(".input-box");
  try {
    let response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${finalWord}`);
    if (!response.ok) {
      alert("Please enter a valid word");
      return;
    }
  } catch (error) {
    console.error("API Error:", error);
    return;
  }

  successCount = 0;  // reset success count
  successLetters = "";  // reset success letters for each validation
  for (let i = 0; i < randomWord.length; i++) {
    if (finalWord[i] === randomWord[i]) {
      currentInputs[i].classList.add("correct");
      successCount++;
    } else if (randomWord.includes(finalWord[i])) {
      currentInputs[i].classList.add("exists");
    } else {
      currentInputs[i].classList.add("incorrect");
    }
  }

  // if all letters are correct
  if (successCount === 5) {
      winScreen.classList.remove("hide");
      winScreen.innerHTML = `
        <span style="font-size:250%"> You win! </span>
        <span> Total guesses: ${tryCount}</span>
        <button id = "newGameButton">New Game</button>
        <button id = "backToSelection">Back to Games</button>
      `; } else if (++tryCount === 6) {
        winScreen.classList.remove("hide");
    winScreen.innerHTML = `
        <span style="font-size:250%"> You lose! </span>
        <span style = "font size:150%"> The word was ${randomWord}. </span>
        <button id = "newGameButton">New Game</button>
        <button id = "backToSelection">Back to Games</button>
      `;
    } else {
    inputCount = 0;
    finalWord = "";
    updateDivConfig(inputRow[tryCount].firstChild, false);
  }
};

document.addEventListener("click", (e) => {
  if (e.target.id === "newGameButton") {
    startGame();
  } else if (e.target.id === "backToSelection") {
    window.location.href = "../index.html";
  }
});

// Trigger the game on window load
window.addEventListener('load', startGame);
