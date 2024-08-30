console.log("background script loaded");

let pageContent = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAnswer") {
    getAnswer(request.question, request.context || pageContent)
      .then(answer => sendResponse({answer: answer}))
      .catch(error => sendResponse({error: error.toString()}));
    return true;  // Will respond asynchronously
  } else if (request.action === "getPageContent") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(document.documentElement.outerHTML, 'text/html');
            return doc.body.textContent.replace(/\s+/g, ' ').trim();
          }
        },
        (results) => {
          if (results && results[0]) {
            pageContent = results[0].result;
            sendResponse({content: pageContent});
          }
        }
      );
    });
    return true;  // Will respond asynchronously
  }
});

async function getAnswer(question, context) {
  // Retrieve the API key from storage
  const { openaiApiKey } = await chrome.storage.sync.get('openaiApiKey');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not set. Please set it in the extension options.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {"role": "system", "content": "You are a helpful assistant. Use the provided context to answer the user's question."},
        {"role": "user", "content": `Context: ${context}\n\nQuestion: ${question}`}
      ],
      max_tokens: 150
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
