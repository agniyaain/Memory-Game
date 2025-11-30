// ELEMENTS
const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalReplay = document.getElementById('modal-replay');
const modalClose = document.getElementById('modal-close');

// START modal elements
const startModal = document.getElementById("startModal");
const startButton = document.getElementById("startButton");

// CUSTOM DROPDOWN ELEMENTS
const dropdownStart = document.getElementById("dropdownStart");
const dropdownMain = document.getElementById("dropdownMain");

// Start dropdown parts
const sd_selected = dropdownStart.querySelector(".dropdown-selected");
const sd_menu = dropdownStart.querySelector(".dropdown-menu");

// Main dropdown parts
const md_selected = dropdownMain.querySelector(".dropdown-selected");
const md_menu = dropdownMain.querySelector(".dropdown-menu");

// DEFAULT DIFFICULTY
let currentDifficulty = "medium";

// GAME VARIABLES
let timerInterval = null;
let timeLeft = 90;
let lives = 3;
let score = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCount = 0;
let totalPairs = 0;

// SHOW START MODAL ON LOAD
startModal.classList.remove("hidden");


// ---------------------
// CUSTOM DROPDOWN LOGIC
// ---------------------

// START modal dropdown
dropdownStart.addEventListener("click", (e) => {
    e.stopPropagation();
    sd_menu.style.display = sd_menu.style.display === "block" ? "none" : "block";
});

sd_menu.querySelectorAll("div").forEach(item => {
    item.addEventListener("click", () => {
        currentDifficulty = item.dataset.value;
        sd_selected.textContent = item.textContent;
        sd_menu.style.display = "none";
    });
});

// MAIN topbar dropdown
dropdownMain.addEventListener("click", (e) => {
    e.stopPropagation();
    md_menu.style.display = md_menu.style.display === "block" ? "none" : "block";
});

md_menu.querySelectorAll("div").forEach(item => {
    item.addEventListener("click", () => {
        currentDifficulty = item.dataset.value;
        md_selected.textContent = item.textContent;
        md_menu.style.display = "none";
        init(); // restart game with new difficulty
    });
});

// CLOSE DROPDOWN WHEN CLICK OUTSIDE
document.addEventListener("click", () => {
    sd_menu.style.display = "none";
    md_menu.style.display = "none";
});


// ---------------------
// START BUTTON
// ---------------------
startButton.addEventListener("click", () => {
    startModal.classList.add("hidden");

    // sync main dropdown text
    md_selected.textContent = sd_selected.textContent;

    init();
});


// ---------------------
// DIFFICULTY SETTINGS
// ---------------------
const difficultySettings = {
    easy: { pairs: 6, time: 180, lives: 10 },
    medium: { pairs: 8, time: 240, lives: 10 },
    hard: { pairs: 10, time: 300, lives: 10}
};


// ---------------------
// GAME INIT
// ---------------------
function init() {
    const cfg = difficultySettings[currentDifficulty];

    totalPairs = cfg.pairs;
    timeLeft = cfg.time;
    lives = cfg.lives;
    score = 0;
    matchedCount = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    livesEl.textContent = lives;
    scoreEl.textContent = score;
    timerEl.textContent = formatTime(timeLeft);

    buildBoard(totalPairs);

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver(false, "Time’s up!");
        }
    }, 1000);
}


// ---------------------
// CARD GENERATOR
// ---------------------
function pickCats(n) {
    const base = [
        "1.png", "2.png", "3.png", "4.png", "5.png",
        "6.png", "7.png", "8.png", "9.png", "10.png"
    ];
    return base.slice(0, n);
}

function buildBoard(pairs) {
    const cats = pickCats(pairs);
    const items = [...cats, ...cats];
    shuffle(items);

    boardEl.className = "board " + currentDifficulty;
    boardEl.innerHTML = "";

    items.forEach((url) => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.value = url;

        const inner = document.createElement("div");
        inner.className = "card-inner";

        const front = document.createElement("div");
        front.className = "card-front";

        const back = document.createElement("div");
        back.className = "card-back";
        back.innerHTML = `<img src="${url}" />`;

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        card.addEventListener("click", onCardClick);

        boardEl.appendChild(card);
    });
}


// ---------------------
// CARD CLICK LOGIC
// ---------------------
function onCardClick(e) {
    const card = e.currentTarget;

    if (lockBoard) return;
    if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

    card.classList.add("flipped");

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        // MATCH SUCCESS
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        score += 10;
        scoreEl.textContent = score;
        matchedCount++;

        resetFlip();

        if (matchedCount === totalPairs) {
            clearInterval(timerInterval);
            gameOver(true, "All cats matched! 🎉");
        } else {
            lockBoard = false;
        }

    } else {
        // WRONG MATCH
        lives--;
        livesEl.textContent = lives;

        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            resetFlip();
            lockBoard = false;

            if (lives <= 0) {
                clearInterval(timerInterval);
                gameOver(false, "You ran out of lives 😿");
            }
        }, 900);
    }
}

function resetFlip() {
    firstCard = null;
    secondCard = null;
}


// ---------------------
// GAME OVER MODAL
// ---------------------
function gameOver(win, msg) {
    modalTitle.textContent = win ? "You Win! 🎉" : "Game Over 😿";
    modalBody.textContent = msg;
    modal.classList.remove("hidden");
}

function restart() {
    modal.classList.add("hidden");
    init();
}

restartBtn.addEventListener("click", init);
modalReplay.addEventListener("click", restart);
modalClose.addEventListener("click", () => modal.classList.add("hidden"));


// ---------------------
// TOOLS
// ---------------------
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
}
