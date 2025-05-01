const hardcodedWhitelist = ["chrome://newtab/", "chrome://extensions/"];

function checkAndBlockTab(tab) {
  chrome.storage.sync.get(["blockedKeywords", "blockedRegex"], function (data) {
    const blockedKeywords = data.blockedKeywords || [];
    const blockedRegex = data.blockedRegex || [];
    const url = tab.url.toLowerCase();

    // Whitelist Check
    for (const whitelistUrl of hardcodedWhitelist) {
      if (url.startsWith(whitelistUrl.toLowerCase())) {
        console.log(`Tab ${tab.id} is whitelisted: ${url}`);
        return;
      }
    }

    // Blocked Keywords Check
    for (let keyword of blockedKeywords) {
      keyword = keyword.startsWith("xl8m2j:") ? keyword.slice(7) : keyword;

      if (url.includes(keyword.toLowerCase())) {
        console.log(`Blocking tab ${tab.id} with URL: ${url}`);
        chrome.tabs.remove(tab.id);
        return;
      }
    }

    for (let pattern of blockedRegex) {
      pattern = pattern.startsWith("xl8m2j:") ? pattern.slice(7) : pattern;

      try {
        const regex = new RegExp(pattern, "i");
        if (regex.test(url)) {
          console.log(
            `Blocking tab ${tab.id} with URL: ${url} (regex: ${pattern})`
          );
          chrome.tabs.remove(tab.id);
          return;
        }
      } catch (e) {
        console.warn(`Invalid regex pattern: ${pattern}`, e);
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
  if (request.action === "checkTab") {
    checkAllTabs();
  }
});

// When the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  checkAllTabs();
});

function checkAllTabs() {
  chrome.tabs.query({}, function (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      checkAndBlockTab(tabs[i]);
    }
  });
}
