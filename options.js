document.addEventListener('DOMContentLoaded', function() {
  // Load saved API key
  chrome.storage.sync.get('openaiApiKey', function(data) {
    document.getElementById('apiKey').value = data.openaiApiKey || '';
  });

  // Save API key
  document.getElementById('save').addEventListener('click', function() {
    var apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({openaiApiKey: apiKey}, function() {
      console.log('API key saved');
    });
  });
});