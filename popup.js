document.addEventListener('DOMContentLoaded', function () {
  const keywordInput = document.getElementById('keywordInput');
  const addButton = document.getElementById('addButton');
  const blockList = document.getElementById('blockList');

  addButton.addEventListener('click', addKeyword);

  function loadKeywords() {
    chrome.storage.sync.get('blockedKeywords', function(data) {
      const blockedKeywords = data.blockedKeywords || [];
      blockList.innerHTML = '';
      blockedKeywords.forEach(keyword => addKeywordToList(keyword));
    });
  }

  function addKeywordToList(keyword) {
    const li = document.createElement('li');
    li.textContent = keyword;
    blockList.appendChild(li);
  }

  function addKeyword() {
    const keyword = keywordInput.value.trim();
    keywordInput.value = '';
    if (keyword) {
      chrome.storage.sync.get('blockedKeywords', function(data) {
        const blockedKeywords = data.blockedKeywords || [];
        if (!blockedKeywords.includes(keyword)) {
          blockedKeywords.push(keyword);
          chrome.storage.sync.set({ blockedKeywords }, () => {
            loadKeywords();
            chrome.runtime.sendMessage({ action: 'checkTab' });
          });
          console.log(`Added keyword: ${keyword}`);
        }
      });
    }
  }

  keywordInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      addKeyword();
    }
  });  

  loadKeywords();
});
