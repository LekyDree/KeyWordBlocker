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
        try {
          // Create regex pattern (case-insensitive)
          const regex = new RegExp(keyword, 'i');
          if (regex.test(url)) {
            console.log(`Blocking tab ${tab.id} with URL: ${url}`);
            chrome.tabs.remove(tab.id);
            return;
          }
        } catch (error) {
          console.error(`Invalid regex pattern: ${keyword}`, error);
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
  
