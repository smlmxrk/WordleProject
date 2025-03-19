document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".memory-card");
  cards.forEach(card => card.addEventListener("click", flipCard));
});


function flipCard() {
  console.log("Card flipped!")
  this.classList.toggle('flip');
}
