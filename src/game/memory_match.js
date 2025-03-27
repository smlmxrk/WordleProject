document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".memory-card");
  cards.forEach(card => card.addEventListener("click", flipCard));

  (function shuffle() {
    console.log("Shuffled");
    document.querySelectorAll(".memory-card").forEach(card => {
      let randomPos = Math.floor(Math.random() * 12);
      card.style.order = randomPos;
    });
  })();
});

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchCount = 0;
const totalPairs = 6;

function flipCard() {
  console.log("Card flipped!")
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  matchCount++;
  console.log("matched");

  if (matchCount === totalPairs) {
    setTimeout(() => {
      console.log("go win");
      alert("You win!"); // placeholder win-screen
    }, 500);
  }

  resetBoard(); // reset the board after disabling cards
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

