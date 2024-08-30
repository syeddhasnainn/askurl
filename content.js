console.log("content script loaded");

let popup = null;

document.addEventListener('mouseup', function(event) {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    showPopup(event.pageX, event.pageY, selectedText);
  } else if (popup && !popup.contains(event.target)) {
    removePopup();
  }
});

function showPopup(x, y, selectedText) {
  removePopup();
  
  popup = document.createElement('div');
  popup.id = 'askurl-popup';
  popup.innerHTML = `
    <input type="text" id="askurl-question" placeholder="Ask a question about the selected text">
    <button id="askurl-submit">Ask</button>
    <div id="askurl-answer"></div>
  `;
  
  // Adjust position to ensure popup stays within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popupWidth = 350; // Max width of popup
  const popupHeight = 200; // Estimated height, adjust as needed

  let left = x + 10; // Add a small offset
  let top = y + 10;

  if (left + popupWidth > viewportWidth) {
    left = viewportWidth - popupWidth - 10;
  }

  if (top + popupHeight > viewportHeight) {
    top = viewportHeight - popupHeight - 10;
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  
  document.body.appendChild(popup);
  
  document.getElementById('askurl-submit').addEventListener('click', function() {
    const question = document.getElementById('askurl-question').value;
    if (question) {
      askQuestion(question, selectedText);
    }
  });

  // Add enter key listener
  document.getElementById('askurl-question').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const question = this.value;
      if (question) {
        askQuestion(question, selectedText);
      }
    }
  });
}

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }
}

function askQuestion(question, context) {
  const answerDiv = document.getElementById('askurl-answer');
  answerDiv.innerHTML = '<div class="askurl-loading"></div>';
  
  chrome.runtime.sendMessage({
    action: "getAnswer",
    question: question,
    context: context
  }, function(response) {
    if (chrome.runtime.lastError) {
      answerDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
    } else if (response.error) {
      answerDiv.textContent = 'Error: ' + response.error;
    } else {
      answerDiv.textContent = response.answer;
    }
  });
}