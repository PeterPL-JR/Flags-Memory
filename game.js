const modeSelect = document.getElementById("mode-select");
const boardSizes = [4, 6, 8];
const cardsSizes = [96, 70, 54];

const joinContainer = document.getElementById("join-container");
const gameContainer = document.getElementById("game-container");

const style = document.querySelector(":root").style;
const div = document.getElementById("memory-div");

const FLAGS_AMOUNT = 32;
let memoryCards = [];
let clicks = [];
const images = [];

const CLASS_MEMORY_CARD = "memory-card";
const CLASS_SHOWN = "memory-card shown";
const CLASS_HIDDEN = "memory-card hidden";

const SHOWN = 0;
const HIDDEN = 1;
const VICTORY = 3;

const ANIMATION_NAME = "card-anim";
const ANIMATION_TIME = 400;
const IMAGE_CHANGE_TIME = ANIMATION_TIME / 4;

class MemoryCard {
    constructor(x, y, div) {
        this.x = x;
        this.y = y;
        this.div = div;
        this.mode = HIDDEN;
        this.init();
    }
    init() {
        this.div = document.createElement("div");
        this.div.className = CLASS_HIDDEN;

        this.div.innerHTML = "M";
        this.div.setAttribute("onmousedown", `clickCard(${this.x}, ${this.y})`);
        div.appendChild(this.div);
    }
    show() {
        this.startAnimate("showImage");
    }
    hide() {
        this.startAnimate("hideImage");
    }

    win() {
        this.div.style.visibility = "hidden";
        this.mode = VICTORY;
    }
    showImage() {
        this.div.className = CLASS_SHOWN;
        this.div.innerHTML = "";
        this.div.appendChild(this.image);
    }
    hideImage() {
        this.div.className = CLASS_HIDDEN;
        this.div.innerHTML = "M";
    }
    startAnimate(methodName) {
        const method = this[methodName].bind(this);
        const stopAnimate = this.stopAnimate.bind(this);
        this.div.style.animation = `${ANIMATION_NAME} ${ANIMATION_TIME / 1000}s`;

        setTimeout(function() {
            method();
        }, IMAGE_CHANGE_TIME);
        setTimeout(function() {
            stopAnimate(methodName);
        }, ANIMATION_TIME);
    }
    stopAnimate() {
        this.div.style.removeProperty("animation");
        if(this.mode == HIDDEN) this.mode = SHOWN;
        else if(this.mode == SHOWN) this.mode = HIDDEN;
    }
}

function init() {
    for(let size of boardSizes) {
        modeSelect.innerHTML += "<option>" + (size + "x" + size) + "</option>"
    }
    loadImages();
}

function loadImages() {
    for(let i = 0; i < FLAGS_AMOUNT; i++) {
        const image = document.createElement("img");
        image.src = "flags/flag_" + (i + 1) + ".png";
        images.push(image);
    }
}

function startGame() {
    const index = modeSelect.selectedIndex;
    const size = boardSizes[index];

    const cardSize = cardsSizes[index];
    const SCALE = 4/7;

    style.setProperty("--size", cardSize + "px");
    style.setProperty("--font-size", (cardSize * SCALE) + "px");
    
    joinContainer.style.display = "none";
    gameContainer.style.display = "block";
    
    // MEMORY CARDS DIVS
    for(let x = 0; x < size; x++) {
        for(let y = 0; y < size; y++) {
            memoryCards.push(new MemoryCard(x, y));
        }
        clearBoth(div);
    }

    // FLAGS
    const CARDS_FLAGS_AMOUNT = size * size / 2;
    const bufferFlagsIndexes = getRandomArray(FLAGS_AMOUNT, CARDS_FLAGS_AMOUNT);
    let flagsIndexes = [];

    for(let flag of bufferFlagsIndexes) {
        flagsIndexes.push(flag);
        flagsIndexes.push(flag);
    }
    flagsIndexes = shuffleArray(flagsIndexes);
   
    for(let i = 0; i < flagsIndexes.length; i++) {
        const index = flagsIndexes[i];
        memoryCards[i].imageIndex = index;
        memoryCards[i].image = images[index].cloneNode();
    }
}

function clearBoth(div) {
    const clearBothDiv = document.createElement("div");
    clearBothDiv.style.clear = "both";
    div.appendChild(clearBothDiv);
}

function clickCard(x, y) {
    const card = findCard(x, y);
    if(card.mode != HIDDEN) return;
    if(clicks.length >= 2) return;
    
    clicks.push({x, y});
    if(clicks.length >= 2) {
        checkCards();
    }
    card.show();
}

function checkCards() {
    const CARD_DISAPPEAR_TIME = 1000;

    const card1 = findCard(clicks[0].x, clicks[0].y);
    const card2 = findCard(clicks[1].x, clicks[1].y);

    if(card1.imageIndex == card2.imageIndex) {
        setTimeout(function() {
            card1.win();
            card2.win();
            continueGame();
            checkVictory();
        }, CARD_DISAPPEAR_TIME);
    } else {
        setTimeout(function() {
            card1.hide();
            card2.hide();
            continueGame();
        }, CARD_DISAPPEAR_TIME);
    }
}
function continueGame() {
    clicks = [];
}

function getRandomArray(beginLength, length) {
    const bufferArray = [];
    for(let i = 1; i <= beginLength; i++) {
        bufferArray.push(i);
    }
    const array = [];

    while(array.length < length) {
        const randIndex = getRandom(0, bufferArray.length);
        array.push(bufferArray[randIndex]);
        bufferArray.splice(randIndex, 1);
    }
    return array;
}

function shuffleArray(array) {
    const oldArray = Array.from(array);
    const newArray = [];

    while(oldArray.length != 0) {
        const randIndex = getRandom(0, oldArray.length);
        newArray.push(oldArray[randIndex]);
        oldArray.splice(randIndex, 1);
    }
    return newArray;
}

function findCard(x, y) {
    return memoryCards.find(function(card) {
        return card.x == x && card.y == y;
    });
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function checkVictory() {
    for(let card of memoryCards) {
        if(card.mode != VICTORY) {
            return;
        }
    }
    setTimeout(victory, 500);
}
function victory() {
    gameContainer.style.display = "none";
    joinContainer.style.display = "block";

    div.innerHTML = "";
    memoryCards = [];
}