// 1️⃣ Quiz data (questions, options, correct answer)
const quizData = [
  {
    question: "What is your Name ?",
    a: "Inba",
    b: "Suji",
    c: "Jega",
    d: "Selva",
    correct: "b"
  },
  {
    question: "What is Your favourite Sports",
    a: "Tennis",
    b: "Kabaddi",
    c: "Cricket",
    d: "Football",
    correct: "c"
  },
  {
    question: "What is Your favourite dish",
    a: "Briyani",
    b: "Egg rice",
    c: "Chekken rice",
    d: "Sambar",
    correct: "c"
  },
  {
    question: "Who is Best batsman in world Cricket",
    a: "Virat Kohli",
    b: "ABD",
    c: "Smith",
    d: "Rohit Sharma",
    correct: "b"
  }
];

// 2️⃣ Get HTML elements
const quiz = document.getElementById("quiz");
const submitBtn = document.getElementById("submit");

// 3️⃣ Track current question and score
let currentQuestion = 0;
let score = 0;

// 4️⃣ Load current question into quiz container
function loadQuiz() {
  const currentData = quizData[currentQuestion];
  
  quiz.innerHTML = `
    <h2>${currentData.question}</h2>
    <ul>
      <li><input type="radio" name="answer" value="a"> ${currentData.a}</li>
      <li><input type="radio" name="answer" value="b"> ${currentData.b}</li>
      <li><input type="radio" name="answer" value="c"> ${currentData.c}</li>
      <li><input type="radio" name="answer" value="d"> ${currentData.d}</li>
    </ul>
  `;
}

// 5️⃣ Get selected answer
function getSelected() {
  const answerEls = document.querySelectorAll('input[name="answer"]');
  let selectedAnswer = null;
  answerEls.forEach(answerEl => {
    if(answerEl.checked) selectedAnswer = answerEl.value;
  });
  return selectedAnswer;
}

// 6️⃣ Handle submit button click
submitBtn.addEventListener("click", () => {
  const answer = getSelected();
  
  if(answer) {
    // ✅ Check if correct
    if(answer === quizData[currentQuestion].correct) score++;
    
    // 🔹 Move to next question
    currentQuestion++;
    
    // 🔹 If more questions, load next
    if(currentQuestion < quizData.length) {
      loadQuiz();
    } else {
      // 🎯 Show final score
      quiz.innerHTML = `<h2>You scored ${score} / ${quizData.length}</h2>`;
      submitBtn.style.display = "none";
    }
  } else {
    alert("Please select an answer!");
  }
});

// 7️⃣ Initial load
loadQuiz();
