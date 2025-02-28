import { wordList } from "./words.js";

let container = document.querySelector(".container");
let winScreen = document.querySelector(".win-screen");
let submitButton = document.querySelector(".submit");
let inputCount, tryCount, successCount, successLetters, inputRow, inputBox;
let backSpaceCount = 0;
let randomWord, finalWord;

const isTouchDevice = () => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
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
  for (let i = 0; i < 6; i++) {
    let inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");
    for (let j = 0; j < 5; j++) {
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
  element.disabled = disabledStatus;
  if (!disabledStatus) {
    element.focus();
  }
}

// writing in input logic
const checker = async (e) => {
  let value = e.target.value.toUpperCase();
  updateDivConfig(e.target, true);
  if (value.length === 1) {
    if (inputCount <= 4 && e.key !== "Backspace") {
      finalWord += value;
      if (inputCount < 4) {
        updateDivConfig(e.target.nextSibling, false);
      }
    }
    inputCount += 1;
  } else if (value.length === 0 && e.key === "Backspace") {
    finalWord = finalWord.substring(0, finalWord.length - 1);
    if (inputCount === 0) {
      updateDivConfig(e.target, false);
      return false;
    }
    updateDivConfig(e.target, true);
    e.target.previousSibling.value = "";
    updateDivConfig(e.target.previousSibling, false);
    inputCount = -1;
  }
};

// case where user presses backspace and all inputs are filled
window.addEventListener("keyup", (e) => {
  if (inputCount > 4) {
    if (isTouchDevice()) {
      submitButton.classList.remove("hide");
    }
    if (e.key === "Enter") {
      validateWord();
    } else if (e.key === "Backspace") {
      inputRow[tryCount].lastChild.value = "";
      finalWord = finalWord.substring(0, finalWord.length - 1);
      updateDivConfig(inputRow[tryCount].lastChild, false);
      inputCount -= 1;
    }
  }
});

// word validation
const validateWord = async () => {
  if (isTouchDevice()) {
    submitButton.classList.add("hide");
  }

  let failed = false;
  let currentInputs = inputRow[tryCount].querySelectorAll(".input-box");

  // check if it's a valid word
  await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${finalWord}`)
    .then((response) => {
      if (response.status == "404") {
        console.clear();
        alert("Please Enter Valid Word");
        failed = true;
      }
    });

  if (failed) {
    return false;
  }

  successCount = 0;  // reset success count
  successLetters = "";  // reset success letters for each validation

  for (let i in randomWord) {
    if (finalWord[i] === randomWord[i]) {
      currentInputs[i].classList.add("correct");
      successCount += 1;
      successLetters += randomWord[i];
    } else if (randomWord.includes(finalWord[i]) && !successLetters.includes(finalWord[i])) {
      currentInputs[i].classList.add("exists");
    } else {
      currentInputs[i].classList.add("incorrect");
    }
  }

  // increment tryCount
  tryCount += 1;

  // if all letters are correct
  if (successCount === 5) {
    setTimeout(() => {
      winScreen.classList.remove("hide");
      winScreen.innerHTML = `
        <span> Total guesses: ${tryCount}</span>
        <button onclick="startGame()">New Game</button>
      `;
    }, 1000);
  } else {
    inputCount = 0;
    finalWord = "";

    if (tryCount === 6) {
      tryCount = 0;
      winScreen.classList.remove("hide");
      winScreen.innerHTML = ` <span>You lose!</>
         <button onclick="startGame()">New Game</button>`;
      return false;
    }

    updateDivConfig(inputRow[tryCount].firstChild, false);
  }
  inputCount = 0;
};

// Trigger the game on window load
window.addEventListener('load', startGame);
