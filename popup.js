document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({action: "getPageContent"}, function(response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log("Page content loaded");
    }
  });

  document.getElementById('askButton').addEventListener('click', function() {
    const question = document.getElementById('question').value;
    const answerDiv = document.getElementById('answer');
    answerDiv.textContent = 'Loading...';

    chrome.runtime.sendMessage({action: "getAnswer", question: question}, function(response) {
      if (chrome.runtime.lastError) {
        answerDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
      } else if (response.error) {
        answerDiv.textContent = 'Error: ' + response.error;
      } else {
        answerDiv.textContent = response.answer;
      }
    });
  });
});