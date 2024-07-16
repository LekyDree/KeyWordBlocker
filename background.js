const hardcodedWhitelist = ['chrome://newtab/', 'chrome://extensions/'];

function checkAndBlockTab(tab) {
    chrome.storage.sync.get(['blockedKeywords', 'whitelistedUrls'], function(data) {
      const blockedKeywords = data.blockedKeywords || [];
      const url = tab.url.toLowerCase();
      
      // Whitelist Check
      for (const whitelistUrl of hardcodedWhitelist) {
        if (url.startsWith(whitelistUrl.toLowerCase())) {
          console.log(`Tab ${tab.id} is whitelisted: ${url}`);
          return;
        }
      }
  
      // Blocked Keywords Check
      for (const keyword of blockedKeywords) {
        if (url.includes(keyword.toLowerCase())) {
          console.log(`Blocking tab ${tab.id} with URL: ${url}`);
          chrome.tabs.remove(tab.id);
          return;
        }
      }
    });
  }
  
  
  // When a tab is updated (e.g., URL change, reloaded)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      checkAndBlockTab(tab);
    }
  });
  
  // When a tab is created
  chrome.tabs.onCreated.addListener((tab) => {
    checkAndBlockTab(tab);
  });
  
  // When a new keyword is added
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Here');
    if (request.action === 'checkTab') {
      checkAllTabs();
    }
  });

  // When the extension is installed or updated
  chrome.runtime.onInstalled.addListener(() => {
    checkAllTabs();
  });

  function checkAllTabs() {
    chrome.tabs.query({}, function(tabs) {
      for (let i = 0; i < tabs.length; i++) {
        checkAndBlockTab(tabs[i]);
      }
    });
  }
  