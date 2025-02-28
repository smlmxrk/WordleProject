/* TODO:
Start working on the actual game logic
Style the page as you go
Reverse-engineer the game based on available resources
 */

//temporary bank of words to pull from (later will be from an actual file)

let words = [
  "Zebra",
  "Sling",
  "Crate",
  "Brick",
  "press",
  "truth",
  "sweet",
  "salty",
  "alert",
  "check",
  "roast",
  "toast",
  "shred",
  "cheek",
  "shock",
  "czech",
  "woman",
  "wreck",
  "court",
  "coast",
  "flake",
  "think",
  "smoke",
  "unrig",
  "slant",
  "ultra",
  "vague",
  "pouch",
  "radix",
  "yeast",
  "zoned",
  "cause",
  "quick",
  "bloat",
  "level",
  "civil",
  "civic",
  "madam",
  "house",
  "delay",
];

//general fields
let container = document.querySelector(".container");
let winScreen = document.querySelector(".win-screen");
let submitButton = document.querySelector(".submit");
let inputCount, tryCount, inputRow;
let backSpaceCount = 0;
let randomWord, finalWord;
