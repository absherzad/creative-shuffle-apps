// Fisher-Yates Shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Quiz Questions
const questions = [
    {
        question: "CPU stands for?",
        options: ["Central Processing Unit", "Computer Personal Unit", "Core Processing Unit", "Central Program Unit"],
        answer: 0
    },
    {
        question: "Mother of all languages?",
        options: ["Python", "C", "Java", "Assembly"],
        answer: 1
    },
    {
        question: "Purpose of variable?",
        options: ["Store data", "Compile code", "Display output", "Debug errors"],
        answer: 0
    },
    {
        question: "HTML stands for?",
        options: ["HyperText Markup Language", "HighText Machine Language", "HyperTool Multi Language", "HomeText Markup Language"],
        answer: 0
    },
    {
        question: "Which uses LIFO?",
        options: ["Queue", "Stack", "Array", "List"],
        answer: 1
    },
    {
        question: "Algorithm means?",
        options: ["Language", "Step process", "Database", "Hardware"],
        answer: 1
    },
    {
        question: "Use of loop?",
        options: ["Store data", "Repeat code", "Compile code", "Define func"],
        answer: 1
    },
    {
        question: "Array index starts at?",
        options: ["0", "1", "-1", "Depends"],
        answer: 0
    },
    {
        question: "Binary of 5?",
        options: ["101", "110", "100", "111"],
        answer: 0
    },
    {
        question: "CSS stands for?",
        options: ["Creative Style Sys", "Cascading Style Sheets", "Comp Style Syntax", "Code Style Struct"],
        answer: 1
    }
];


// Quiz State
let currentQuestionIndex = 0;
let score = 0;
let quizQuestions = [];
let randomizeOptions = false;
let answered = false;
let incorrectAnswers = [];
let originalQuizQuestions = [];

// DOM Elements
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const questionList = document.getElementById('questionList');
const sidebarEl = document.getElementById('sidebar');
const shuffleControlsEl = document.getElementById('shuffleControls');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const questionCounter = document.getElementById('questionCounter');
const progressBar = document.getElementById('progress');
const resultEl = document.getElementById('result');
const scoreEl = document.getElementById('score');
const feedbackEl = document.getElementById('feedback');
const reviewBtn = document.getElementById('reviewBtn');
const incorrectAnswersEl = document.getElementById('incorrectAnswers');
const randomizeQuestionsBtn = document.getElementById('randomizeQuestions');
const randomizeBothBtn = document.getElementById('randomizeBoth');
const resetBtn = document.getElementById('resetBtn');
const resetBtnResult = document.getElementById('resetBtnResult');
const quizEl = document.getElementById('quiz');
const mainContentEl = document.querySelector('.main-content');

// Helper: Render options list for sidebar
function renderSidebarOptions(options) {
    return options.map(opt => `<li class="option">${opt}</li>`).join('');
}

// Helper: Render a sidebar question item
function renderSidebarQuestion(q, index, isActive, isAnswered) {
    return `
        <li class="${isActive ? 'active' : ''} ${isAnswered ? 'answered' : ''}">
            <div class="question-header" tabindex="0">
                <span class="expand-icon">&#9654;</span>
                <span class="question-text">${q.question}</span>
            </div>
            <ul class="options">${renderSidebarOptions(q.displayOptions)}</ul>
        </li>
    `;
}

// Sidebar rendering and expand/collapse logic
function updateSidebar() {
    questionList.innerHTML = quizQuestions.map((q, i) =>
        renderSidebarQuestion(q, i, i === currentQuestionIndex, q.answered)
    ).join('');
    // Add expand/collapse and keyboard accessibility
    questionList.querySelectorAll('.question-header').forEach((header, idx) => {
        const expandIcon = header.querySelector('.expand-icon');
        const optionsUl = header.parentElement.querySelector('.options');
        function toggle() {
            const isShown = optionsUl.classList.toggle('show');
            expandIcon.innerHTML = isShown ? '&#9660;' : '&#9654;';
        }
        expandIcon.addEventListener('click', e => { e.stopPropagation(); toggle(); });
        header.addEventListener('click', e => { e.stopPropagation(); toggle(); });
        header.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    });
}

// Render quiz question and options
function renderQuestion(q) {
    questionEl.textContent = q.question;
    optionsEl.innerHTML = q.options.map((opt, i) => `
        <label class="option">
            <input type="radio" name="answer" value="${i}">
            ${opt}
        </label>
    `).join('');
}

// Handle option selection
function handleOptionSelection(q) {
    optionsEl.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            if (!answered) {
                answered = true;
                const selected = parseInt(input.value);
                const correct = q.answer;
                optionsEl.querySelectorAll('.option').forEach(label => {
                    const val = parseInt(label.querySelector('input').value);
                    if (val === selected) {
                        label.classList.add(selected === correct ? 'correct' : 'incorrect', 'selected');
                        if (selected !== correct) {
                            incorrectAnswers.push({
                                question: q.question,
                                yourAnswer: q.options[selected],
                                correctAnswer: q.options[correct]
                            });
                        } else {
                            score++;
                        }
                    } else if (val === correct) {
                        label.classList.add('correct');
                    }
                    label.querySelector('input').disabled = true;
                });
                quizQuestions[currentQuestionIndex].answered = true;
                nextBtn.disabled = false;
                updateSidebar();
            }
        });
    });
}

// Show a question
function showQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    renderQuestion(q);
    handleOptionSelection(q);
    questionCounter.textContent = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    const percent = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);
    progressBar.style.width = `${percent}%`;
    progressBar.parentElement.setAttribute('data-progress', percent + '%');
    prevBtn.disabled = true;
    nextBtn.disabled = !answered;
    updateSidebar();
    setTimeout(() => {
        questionEl.focus && questionEl.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

// Show result
function showResult() {
    quizEl.classList.add('fade', 'hidden');
    sidebarEl.classList.add('fade', 'hidden');
    shuffleControlsEl.classList.add('fade', 'hidden');
    setTimeout(() => {
        quizEl.classList.add('hidden');
        sidebarEl.classList.add('hidden');
        shuffleControlsEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        resultEl.classList.add('fade');
        mainContentEl.classList.add('hidden');
        setTimeout(() => {
            resultEl.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 10);
        const resultHeading = resultEl.querySelector('h2');
        if (resultHeading) resultHeading.setAttribute('tabindex', '-1');
        if (resultHeading) resultHeading.focus();
    }, 400);

    const percentage = ((score / quizQuestions.length) * 100).toFixed(1);
    let feedbackMsg = percentage >= 80 ? "Great job! You're mastering CS basics!"
        : percentage >= 50 ? "Good effort! Keep practicing to improve!"
            : "Don't worry, review and try again to boost your score!";
    feedbackEl.textContent = feedbackMsg;
    scoreEl.textContent = `You scored ${score} out of ${quizQuestions.length} (${percentage}%)!`;
    incorrectAnswersEl.innerHTML = incorrectAnswers.length > 0 ?
        `<p>Questions you got wrong:</p>` +
        incorrectAnswers.map(item => `
            <div class="result-question">${item.question}</div>
            <div class="result-your-answer">Your Answer: <span class="result-incorrect">${item.yourAnswer}</span></div>
            <div class="result-correct-answer">Correct Answer: <span class="result-correct">${item.correctAnswer}</span></div>
        `).join('') : `<p>You got all questions correct! Amazing!</p>`;
}

// Quiz start/reset
function startQuiz(randomizeOpts = false, reuseQuestions = false) {
    quizQuestions = reuseQuestions ? [...originalQuizQuestions] : questions.map(q => ({
        ...q,
        displayOptions: [...q.options]
    }));
    shuffle(quizQuestions);
    if (randomizeOpts) {
        quizQuestions.forEach(q => { q.displayOptions = shuffle([...q.options]); });
    }
    originalQuizQuestions = [...quizQuestions];
    randomizeOptions = randomizeOpts;
    currentQuestionIndex = 0;
    score = 0;
    answered = false;
    incorrectAnswers = [];
    resultEl.classList.add('hidden');
    mainContentEl.classList.remove('hidden');
    quizEl.classList.remove('hidden');
    sidebarEl.classList.remove('hidden');
    shuffleControlsEl.classList.remove('hidden');
    showQuestion();
}

// Event listeners
reviewBtn.addEventListener('click', () => {
    incorrectAnswersEl.classList.toggle('hidden');
    reviewBtn.textContent = incorrectAnswersEl.classList.contains('hidden') ?
        'Review Incorrect Answers' : 'Hide Incorrect Answers';
});
randomizeQuestionsBtn.addEventListener('click', () => startQuiz(false));
randomizeBothBtn.addEventListener('click', () => startQuiz(true));
resetBtnResult.addEventListener('click', () => startQuiz(randomizeOptions));
nextBtn.addEventListener('click', () => {
    if (!nextBtn.disabled) {
        currentQuestionIndex++;
        answered = false;
        if (currentQuestionIndex < quizQuestions.length) {
            setTimeout(showQuestion, 200);
        } else {
            showResult();
        }
    }
});
prevBtn.addEventListener('click', () => { /* Not used */ });

// Initialize
startQuiz();