// Card deck initialization
const suits = ['♠', '♣', '♥', '♦'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];
let playerHand = [];
let dealerHand = [];
let playerMoney = 100;
let currentBet = 0;

// DOM elements
const dealButton = document.getElementById('deal-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const placeBetButton = document.getElementById('place-bet');
const betInput = document.getElementById('bet-amount');
const messageEl = document.getElementById('message');
const playerMoneyEl = document.getElementById('player-money');
const playerScoreEl = document.getElementById('player-score');
const dealerScoreEl = document.getElementById('dealer-score');
const playerCardsEl = document.getElementById('player-cards');
const dealerCardsEl = document.getElementById('dealer-cards');

// Event listeners
dealButton.addEventListener('click', startNewGame);
hitButton.addEventListener('click', handleHit);
standButton.addEventListener('click', handleStand);
placeBetButton.addEventListener('click', placeBet);

// Game functions
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function placeBet() {
    const bet = parseInt(betInput.value);
    if (bet <= playerMoney && bet > 0) {
        currentBet = bet;
        playerMoney -= bet;
        playerMoneyEl.textContent = playerMoney;
        dealButton.disabled = false;
        placeBetButton.disabled = true;
        betInput.disabled = true;
        messageEl.textContent = `Bet placed: $${bet}`;
    } else {
        messageEl.textContent = 'Invalid bet amount!';
    }
}

function startNewGame() {
    createDeck();
    playerHand = [];
    dealerHand = [];
    
    // Deal initial cards
    playerHand.push(deck.pop(), deck.pop());
    dealerHand.push(deck.pop(), deck.pop());
    
    updateDisplay();
    
    dealButton.disabled = true;
    hitButton.disabled = false;
    standButton.disabled = false;
    
    // Check for natural blackjack
    if (calculateScore(playerHand) === 21) {
        handlePlayerWin(1.5);
    }
}

function handleHit() {
    playerHand.push(deck.pop());
    updateDisplay();
    
    const playerScore = calculateScore(playerHand);
    if (playerScore > 21) {
        handlePlayerBust();
    }
}

function handleStand() {
    hitButton.disabled = true;
    standButton.disabled = true;
    
    // Dealer must hit on 16 and stand on 17
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    
    updateDisplay(true);
    determineWinner();
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'A') {
            aces += 1;
            score += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    
    return score;
}

function updateDisplay(showDealerCards = false) {
    playerCardsEl.innerHTML = '';
    dealerCardsEl.innerHTML = '';
    
    playerHand.forEach(card => {
        playerCardsEl.innerHTML += `<div class="card">${card.value}${card.suit}</div>`;
    });
    
    dealerHand.forEach((card, index) => {
        if (index === 0 || showDealerCards) {
            dealerCardsEl.innerHTML += `<div class="card">${card.value}${card.suit}</div>`;
        } else {
            dealerCardsEl.innerHTML += `<div class="card back">?</div>`;
        }
    });
    
    playerScoreEl.textContent = calculateScore(playerHand);
    dealerScoreEl.textContent = showDealerCards ? calculateScore(dealerHand) : calculateScore([dealerHand[0]]);
}

function handlePlayerBust() {
    messageEl.textContent = 'Bust! You lose!';
    endRound();
}

function handlePlayerWin(multiplier = 1) {
    const winnings = currentBet * (1 + multiplier);
    playerMoney += winnings;
    playerMoneyEl.textContent = playerMoney;
    messageEl.textContent = `You win $${winnings}!`;
    endRound();
}

function handlePush() {
    playerMoney += currentBet;
    playerMoneyEl.textContent = playerMoney;
    messageEl.textContent = 'Push! Bet returned.';
    endRound();
}

function determineWinner() {
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    
    if (dealerScore > 21) {
        handlePlayerWin(1);
    } else if (playerScore > dealerScore) {
        handlePlayerWin(1);
    } else if (playerScore < dealerScore) {
        messageEl.textContent = 'Dealer wins!';
        endRound();
    } else {
        handlePush();
    }
}

function endRound() {
    hitButton.disabled = true;
    standButton.disabled = true;
    placeBetButton.disabled = false;
    betInput.disabled = false;
    currentBet = 0;
    
    if (playerMoney <= 0) {
        messageEl.textContent = 'Game Over! You\'re out of money!';
        placeBetButton.disabled = true;
        betInput.disabled = true;
    }
}

// Initialize the game
createDeck();
playerMoneyEl.textContent = playerMoney;
dealButton.disabled = true;
hitButton.disabled = true;
standButton.disabled = true;
