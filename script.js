const boardEl= document.getElementById('board');
const timerEl= document.getElementById('timer');
const livesEl= document.getElementById('lives');
const scoreEl= document.getElementById('score');
const restartBtn = document.getElementById('restart');
const difficultySel= document.getElementById('difficulty');

const modal= document.getElementById('modal');
const modalTitle= document.getElementById('modal-tittle');
const modalBody= document.getElementById('modal-body');
const modalReplay= document.getElementById('modal-replay');
const modalClose= document.getElementById('modal-close');

let timerInterval = null;
let timeLeft = 90;
let lives = 3;
let score = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCount = 0;
let totalPairs = 0;

const catSet = ['😺','😸','😻','😽','🐱','😿','😹','😼','😿','🙀','😾','😺']; // will slice as needed

//difficulty settings
const difficultySettings = {
    easy: {pairs:6, time:120, lives:5},
    medium: {pairs:8, time:90, lives:3},
    hard: {pairs:10, time:60, lives:1},
};

function pickCats(n){
    const base = ['😺','😸','😻','😽','🐱','😿','😹','😼','🙀','😾','😻','😺','😸','🐈‍⬛','🐈'];
    return base.slice(0,n);
}

function init(){
    const diff = difficultySel.value;
    const cfg = difficultySettings[diff];
    totalPairs = cfg.pairs;
    timeLeft = cfg.timer;
    lives = cfg.lives;

    score =0;
    matchedCount= 0;
    firstCard = null;
    secondCard= null;
    lockBoard = false;

    scoreEl.textContent = score;
    livesEl.textContent = lives;
    timerEl.textContent = formatTime(timeLeft);
 
    //build board
    buildBoard(totalPairs);

    clearInterval(timerInterval);
    timerInterval = setInterval(()=> {
        timeLeft--;
        timerEl.textContent = formatTime(timeLeft);
        if(timeLeft <= 0){
            clearInterval(timerInterval);
            gameOver(false, 'Time Up! Try Again.')
        }
    }, 1000);
}

function buildBoard(pairs){

    //generate pair array dan acak
    const cats = pickCats(pairs);
    const items = [...cats, ...cats];
    shuffle(items);

    //setup class grid
    boardEl.className = 'board ' + difficultySel.value;

    //clear
    boardEl.innerHTML = '';

    //buat card
    items.forEach((emoji, idx)=> {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.value = emoji;
        card.dataset.index = idx;

        const inner = document.createElement('div');
        inner.className = 'card-inner';

        const front = document.createElement('div');
        front.className ='card-front';
        front.innerHTML='<div class="pair-label">?</div>';

        //pilih warna pastel daari index
        const variants = ['pink', 'lilac', 'mint', 'cream'];
        const varian = variants[idx % variants.length];

        const back = document.createElement('div');
        back.className = 'card-back ${varian}';
        back.innerHTML = '<div class="emojo">${emoji}</div>';

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        card.addEventListener('click', onCardClick);
        boardEl.appendChild(card);
    });

    function onCardClick(e){
        const card = e.currentTarget;
        if(lockBoard) return;
        if(card.classList.contains('flipped') || card.classList.contains('matched')) 
            return;

        card.classList.add('flipped');
    }

}