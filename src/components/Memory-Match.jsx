import React, {useState, useEffect} from "react";
import "styles/memorymatch.css";
import cplusLogo from "assets/cplus_logo.svg";
import javaLogo from "assets/java_logo.svg";
import goLogo from "assets/go_logo.svg";
import jsLogo from "assets/js_logo.png";
import pythonLogo from "assets/python_logo.svg";
import rustLogo from "assets/rust_logo.png";
import reactLogo from "assets/react_logo.png";

// TODO: fix JS logo facing wrong way (CSS)
// TODO: eventually fix weird scaling issues on different resolutions

const cardImages = [
  { id: 1, src: reactLogo, framework: "react"},
  { id: 1, src: javaLogo, framework: "java"},
  { id: 1, src: cplusLogo, framework: "cplus"},
  { id: 1, src: goLogo, framework: "go"},
  { id: 1, src: pythonLogo, framework: "python"},
  { id: 1, src: rustLogo, framework: "rust"},
];

const shuffleCards = () => {
  const shuffled = [...cardImages, ...cardImages]
    .sort(() => Math.random() - 0.5)
    .map ((card, index) => ({...card, id: index, flipped: false, matched: false}));
  return shuffled;
};

const MemoryMatch = () => {
  const [cards, setCards] = useState(shuffleCards());
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (first.framework === second.framework) {
        setCards(prev =>
          prev.map(card =>
            card.framework === first.framework ? {...card, matched: true} : card
          )
        );
        setMatchedPairs(prev => prev + 1);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first.id || card.id === second.id ? {...card, flipped: false} : card
            )
          );
        }, 1000);
      }
      setFlippedCards([]);
    }
}, [flippedCards]);

  const handleCardClick = (card) => {
    if (card.flipped || card.matched || flippedCards.length === 2) return;

    const updatedCards = cards.map(c =>
      c.id === card.id ? { ...c, flipped: true } : c
    );

    setCards(updatedCards);
    setFlippedCards([...flippedCards, card]);
  };

  const handleBackToGames = () => {
    window.location.href = '/';
  };

  const resetGame = () => {
    setCards(shuffleCards());
    setFlippedCards([]);
    setMatchedPairs(0)
  };

  return (
    <div className="wrapper">
      <h1>Memory Match</h1>
      <button className="memory-match-back-button" onClick={handleBackToGames}>
        Back to Games
      </button>
      <section className="memory-game">
        {cards.map(card => (
          <div
            key={card.id}
            className={`memory-card ${card.flipped ? "flip" : ""} ${card.matched ? "matched" : ""}`}
            onClick={() => handleCardClick(card)}
          >
            <img className="front-face" src={card.flipped || card.matched ? card.src : jsLogo} alt={card.framework}/>
          </div>
        ))}
      </section>
      {matchedPairs === cardImages.length && (
        <div className="win-screen">
          <h2>You Win!</h2>
          <button onClick={resetGame}>Play Again</button>
          <button onClick={handleBackToGames}>Back to Games</button>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
