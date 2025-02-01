const api_url = "https://opentdb.com/api.php?amount=10&type=multiple";

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
// Store incorrect answers
let incorrectAnswers = [];
let incorrectIndex = 0; // Track which incorrect answer is being shown
let timer;
let timeLeft = 30;

// Elements
const welcomeScreen = document.getElementById("welcomeScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("optionsContainer");
const nextBtn = document.getElementById("nextBtn");
const scoreText = document.getElementById("scoreText");
const timerElement = document.getElementById("timer");
const startQuizBtn = document.getElementById("startQuizBtn");
const toggleMusicBtn = document.getElementById("toggleMusicBtn");
const backgroundMusic = document.getElementById("backgroundMusic");
const restartBtn = document.getElementById("restartBtn");
const questionCounter = document.getElementById("questionCounter");

// Start Quiz Button
document.getElementById("startQuizBtn").addEventListener("click", async () => {
    welcomeScreen.style.display = "none";
    quizScreen.style.display = "block";
    await getAPI();
    loadQuestion();

    // Try playing music with autoplay error handling
    backgroundMusic.play().catch(err => console.log("Music autoplay blocked"));

});

//Background Music
document.getElementById("toggleMusicBtn").addEventListener("click", () => {
    const backgroundMusic = document.getElementById("backgroundMusic");
    const toggleButton = document.getElementById("toggleMusicBtn");

    if (backgroundMusic.paused) {
        backgroundMusic.play();
        toggleButton.textContent = "🔊 Music On"; // Change text when music starts
    } else {
        backgroundMusic.pause();
        toggleButton.textContent = "🔇 Music Off"; // Change text when music stops
    }

});

// Fetch Questions from API
async function getAPI() {
    try {
        const response = await fetch(api_url);
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            alert("Failed to load questions. Please try again later.");
            return;
        }

        questions = data.results.map(q => ({
            question: q.question,
            options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
            correctAnswer: q.correct_answer
        }));
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        alert("Error fetching quiz data. Please check your internet connection.");
    }
}

// Load Question
function loadQuestion() {
    clearInterval(timer);
    timeLeft = 30;
    timerElement.textContent = timeLeft;
    startTimer();

    nextBtn.style.display = "none";
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = currentQuestion.question;
    optionsContainer.innerHTML = "";

    document.getElementById("questionCounter").textContent =
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.onclick = () => checkAnswer(button, option);
        optionsContainer.appendChild(button);
    });
}

// Timer Function
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            disableOptions();
            setTimeout(nextQuestion, 1000)
        }
    }, 1000);
}

// Disable options when time runs out
function disableOptions() {
    document.querySelectorAll("#optionsContainer button").forEach(btn => {
        btn.disabled = true;
    });
}

//Check Answer with Effects
function checkAnswer(button, selectedOption) {
    clearInterval(timer);
    const correct = questions[currentQuestionIndex].correctAnswer;

    if (selectedOption === correct) {
        score++;
        button.classList.add("correct");
        navigator.vibrate(100);
    } else {
        button.classList.add("wrong");
        navigator.vibrate([200, 100, 200]);
    }

    // Store incorrect answer details
    incorrectAnswers.push({
        question: questions[currentQuestionIndex].question,
        selected: selectedOption,
        correct: correct
    });

    setTimeout(() => {
        nextQuestion();
    }, 1000);
}

//Next Question
function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// Show Results
function showResults() {
    quizScreen.style.display = "none";
    resultScreen.style.display = "block";
    scoreText.innerHTML = `<h2>Your Score: ${score} / ${questions.length}</h2>`;

    if (incorrectAnswers.length > 0) {
        incorrectIndex = 0;
        showIncorrectAnswer();
    } else {
        scoreText.innerHTML += `<h3>No incorrect answers! 🎉</h3>`;
    }

    // Pause music when quiz ends
    const backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset to the start of the music
}

// Display single incorrect answer with a Next button
function showIncorrectAnswer() {
    const incorrectContainer = document.createElement("div");
    incorrectContainer.id = "incorrectAnswerContainer";
    incorrectContainer.innerHTML = `
        <h3>Incorrect Answer:</h3>
        <p><strong>Q:</strong> ${incorrectAnswers[incorrectIndex].question}</p>
        <p class='incorrect-answer'>Your Answer: ${incorrectAnswers[incorrectIndex].selected}</p>
        <p class='correct-answer'>Correct Answer: ${incorrectAnswers[incorrectIndex].correct}</p>
        <button id="nextIncorrectBtn">Next</button>
    `;

    scoreText.appendChild(incorrectContainer);

    document.getElementById("nextIncorrectBtn").addEventListener("click", () => {
        incorrectIndex++;
        if (incorrectIndex < incorrectAnswers.length) {
            document.getElementById("incorrectAnswerContainer").remove();
            showIncorrectAnswer();
        } else {
            document.getElementById("incorrectAnswerContainer").remove();
            scoreText.innerHTML += `<h3>End of Incorrect Answers</h3>`;
        }
    });
}

// Restart Quiz
document.getElementById("restartBtn").addEventListener("click", () => {
    resultScreen.style.display = "none";
    welcomeScreen.style.display = "block";
    currentQuestionIndex = 0;
    score = 0;
    incorrectAnswers = []; // Reset incorrect answers
    incorrectIndex = 0;
    clearInterval(timer);
    timeLeft = 30; // Reset timer
});
