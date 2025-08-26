// --- Utility: Fisher-Yates Shuffle ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Flashcards Data ---
const flashcards = [
    { question: "What does CPU stand for?", answer: "Central Processing Unit" },
    { question: "What is the role of a variable in programming?", answer: "Stores and manages data" },
    { question: "What is the purpose of HTML?", answer: "Defines the structure of web content" },
    { question: "What is the function of a loop in programming?", answer: "Executes code repeatedly" },
    { question: "What defines an algorithm?", answer: "A sequence of steps to solve a problem" },
    { question: "What is the role of CSS in web development?", answer: "Controls the visual style of web pages" },
    { question: "What is a Boolean value?", answer: "Represents true or false" },
    { question: "What is the purpose of an if statement?", answer: "Evaluates conditions for decision-making" },
    { question: "What is a function in programming?", answer: "A reusable block of code for specific tasks" },
    { question: "What is the goal of debugging?", answer: "Identifies and corrects code errors" }
];

// --- App State ---
let currentCardIndex = 0;
let shuffledCards = [...flashcards];

// --- DOM Elements ---
const flashcardEl = document.getElementById('flashcard');
const frontEl = flashcardEl.querySelector('.front');
const backEl = flashcardEl.querySelector('.back');
const flashcardList = document.getElementById('flashcardList');
const shuffleBtn = document.getElementById('shuffleBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const cardCounter = document.getElementById('cardCounter');

// --- Accessibility: ARIA live region for screen readers ---
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('role', 'status');
liveRegion.style.position = 'absolute';
liveRegion.style.left = '-9999px';
document.body.appendChild(liveRegion);

// --- UI Update Functions ---

function updateFlashcardContent(card) {
    frontEl.textContent = card.question;
    backEl.textContent = card.answer;
}

function updateSidebar() {
    flashcardList.innerHTML = '';
    shuffledCards.forEach((card, index) => {
        const li = document.createElement('li');
        li.textContent = card.question;
        li.tabIndex = 0;
        if (index === currentCardIndex) li.classList.add('active');
        li.addEventListener('click', () => selectCard(index));
        li.addEventListener('keydown', (e) => handleSidebarKeydown(e, li, index));
        flashcardList.appendChild(li);
    });
}

function updateNavigation() {
    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = currentCardIndex === shuffledCards.length - 1;
}

function showCard() {
    const card = shuffledCards[currentCardIndex];
    updateFlashcardContent(card);
    cardCounter.textContent = `${currentCardIndex + 1} / ${shuffledCards.length}`;
    flashcardEl.classList.remove('flipped');
    flashcardEl.setAttribute('aria-pressed', 'false');
    updateNavigation();
    updateSidebar();
    setTimeout(() => flashcardEl.focus(), 50);
    liveRegion.textContent = `Card ${currentCardIndex + 1} of ${shuffledCards.length}: ${card.question}`;

    // Progress bar update
    const progressBar = document.getElementById('progressBarInner');
    if (progressBar) {
        progressBar.style.width = `${((currentCardIndex + 1) / shuffledCards.length) * 100}%`;
    }
}

// --- Event Handlers ---

function selectCard(index) {
    currentCardIndex = index;
    showCard();
}

function handleSidebarKeydown(e, li, index) {
    if (e.key === 'Enter' || e.key === ' ') {
        selectCard(index);
    } else if (e.key === 'ArrowDown' && li.nextSibling) {
        li.nextSibling.focus();
    } else if (e.key === 'ArrowUp' && li.previousSibling) {
        li.previousSibling.focus();
    }
}

// Prevent rapid double flipping
let flipping = false;
function flipFlashcard() {
    if (flipping) return;
    flipping = true;
    flashcardEl.classList.toggle('flipped');
    const flipped = flashcardEl.classList.contains('flipped');
    flashcardEl.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    setTimeout(() => { flipping = false; }, 400); // match CSS transition
}

// --- Navigation Functions ---

function goToPrevCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        showCard();
    }
}

function goToNextCard() {
    if (currentCardIndex < shuffledCards.length - 1) {
        currentCardIndex++;
        showCard();
    }
}

function shuffleFlashcards() {
    shuffledCards = [...flashcards];
    shuffle(shuffledCards);
    currentCardIndex = 0;
    showCard();
}

// --- Event Listeners ---

shuffleBtn.addEventListener('click', shuffleFlashcards);
flashcardEl.addEventListener('click', flipFlashcard);

flashcardEl.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipFlashcard();
    } else if (e.key === 'ArrowRight') {
        goToNextCard();
    } else if (e.key === 'ArrowLeft') {
        goToPrevCard();
    }
});

prevBtn.addEventListener('click', goToPrevCard);
nextBtn.addEventListener('click', goToNextCard);

document.addEventListener('keydown', (e) => {
    if (document.activeElement === flashcardEl) return; // Already handled
    if (e.key === 'ArrowRight') {
        goToNextCard();
    } else if (e.key === 'ArrowLeft') {
        goToPrevCard();
    }
});

// --- Initialize App ---
showCard();