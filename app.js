document.addEventListener('DOMContentLoaded', function() {
  // Hide the loading screen and show the main content after 3 seconds
  setTimeout(function() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
  }, 3000);
  
  document.getElementById('quizForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var userName = document.getElementById('userName').value;
    var quizType = document.getElementById('quizType').value;
    
    // Hide the form card
    document.querySelector('.card').style.display = 'none';
    
    fetchQuizQuestions(userName, quizType);
  });
});

function fetchQuizQuestions(userName, quizType) {
  var apiUrl = `https://opentdb.com/api.php?amount=10&category=${quizType}&type=multiple`;

  fetch(apiUrl)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      if (data.results) {
        displayQuiz(userName, data.results);
      } else {
        throw new Error('Failed to fetch quiz questions');
      }
    })
    .catch(function(error) {
      console.error('Error fetching quiz questions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to fetch quiz questions. Please try again later.'
      });
    });
}

function displayQuiz(userName, quizData) {
  var quizContainer = document.getElementById('quizContainer');
  quizContainer.innerHTML = ''; // Clear previous quiz content

  quizData.forEach(function(question, index) {
    var questionHtml = `
      <div class="card mt-3">
        <div class="card-body">
          <h5 class="card-title">Question ${index + 1}</h5>
          <p class="card-text">${question.question}</p>
          <ul class="list-group">
            ${shuffle([...question.incorrect_answers, question.correct_answer]).map(function(answer) {
              return `
                <li class="list-group-item">
                  <input type="radio" id="answer${index}-${answer}" name="answer${index}" class="answer" value="${answer}">
                  <label for="answer${index}-${answer}">${answer}</label>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      </div>
    `;
    quizContainer.innerHTML += questionHtml;
  });

  quizContainer.innerHTML += `
    <button id="submit" class="btn btn-primary mt-3">Submit Quiz</button>
  `;

  // Add event listener for quiz submission
  document.getElementById('submit').addEventListener('click', function() {
    var selectedAnswers = document.querySelectorAll('input[type=radio]:checked');

    // Calculate score even if not all questions are answered
    var score = calculateScore(selectedAnswers, quizData);
    var message = score > 7
      ? `Hurray, you are a genius!`
      : `So sad, your score is ${score}. Better luck next time.`;

    Swal.fire({
      title: `Quiz Result`,
      html: `Name: ${userName}<br>Your score is ${score} out of ${quizData.length}.<br>${message}`,
      icon: 'info',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Would you like to try again?',
          showDenyButton: true,
          confirmButtonText: `Try Again`,
          denyButtonText: `Cancel`,
        }).then((result) => {
          if (result.isConfirmed) {
            fetchQuizQuestions(userName, document.getElementById('quizType').value);
          } else if (result.isDenied) {
            Swal.fire({
              title: 'Please close the window manually.',
              icon: 'info',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  });
}

function calculateScore(selectedAnswers, quizData) {
  var score = 0;
  selectedAnswers.forEach(function(answerInput) {
    var questionIndex = answerInput.name.replace('answer', '');
    var selectedAnswer = answerInput.value;
    if (selectedAnswer === quizData[questionIndex].correct_answer) {
      score++;
    }
  });
  return score;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
