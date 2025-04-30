document.addEventListener("DOMContentLoaded", function () {
  const keywordInput = document.getElementById("keywordInput");
  const addButton = document.getElementById("addButton");
  const blockList = document.getElementById("blockList");
  const regexCheckbox = document.getElementById("regexCheckbox"); //Checked if user wants to use regex.

  addButton.addEventListener("click", addKeyword);

  function loadKeywords() {
    chrome.storage.sync.get(
      ["blockedKeywords", "blockedRegex"],
      function (data) {
        const blockedKeywords = data.blockedKeywords || [];
        const blockedRegex = data.blockedRegex || [];

        const keywordList = document.getElementById("keywordList");
        const regexList = document.getElementById("regexList");
        const blockedKeywordTitle = document.getElementById(
          "blockedKeywordTitle"
        );
        const blockedRegexTitle = document.getElementById("blockedRegexTitle");

        keywordList.innerHTML = "";
        regexList.innerHTML = "";

        blockedKeywordTitle.style.display =
          blockedKeywords.length > 0 ? "block" : "none";
        blockedKeywords.forEach((keyword) => {
          const li = document.createElement("li");
          li.textContent = keyword;
          keywordList.appendChild(li);
        });

        blockedRegexTitle.style.display =
          blockedRegex.length > 0 ? "block" : "none";
        blockedRegex.forEach((regex) => {
          if (regex.startsWith("locked:")) {
            addRegexToList(regex.slice(7), true);
          } else {
            addRegexToList(regex, false);
          }
        });
      }
    );
  }

  function addRegexToList(regex, locked = false) {
    const li = document.createElement("li");
    li.textContent = regex;

    if (!locked) {
      const buttonContainer = document.createElement("span");
      buttonContainer.style.marginLeft = "10px";

      const lockButton = document.createElement("button");
      lockButton.textContent = "Confirm";
      lockButton.style.marginRight = "5px";
      lockButton.onclick = () => {
        buttonContainer.remove();
        chrome.storage.sync.get("blockedRegex", function (data) {
          const regexList = data.blockedRegex || [];
          const updatedList = regexList.map((r) =>
            r === regex ? `locked:${regex}` : r
          );
          chrome.storage.sync.set({ blockedRegex: updatedList });
        });
      };

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.onclick = () => {
        chrome.storage.sync.get("blockedRegex", function (data) {
          const regexList = data.blockedRegex || [];
          const updatedList = regexList.filter((r) => r !== regex);
          chrome.storage.sync.set({ blockedRegex: updatedList }, loadKeywords);
        });
      };

      buttonContainer.appendChild(lockButton);
      buttonContainer.appendChild(removeButton);
      li.appendChild(buttonContainer);
    }

    regexList.appendChild(li);
  }

  function addKeyword() {
    const keyword = keywordInput.value.trim();
    const useRegex = regexCheckbox.checked;
    keywordInput.value = "";

    if (!keyword) return;

    if (useRegex) {
      try {
        new RegExp(keyword);
      } catch (e) {
        alert("Invalid regex pattern!"); //Replace with something else
        return;
      }

      chrome.storage.sync.get("blockedRegex", function (data) {
        const blockedRegex = data.blockedRegex || [];
        if (!blockedRegex.includes(keyword)) {
          blockedRegex.push(keyword);
          chrome.storage.sync.set({ blockedRegex }, () => {
            loadKeywords();
            chrome.runtime.sendMessage({ action: "checkTab" });
          });
          console.log(`Added regex: ${keyword}`);
        }
      });
    } else {
      chrome.storage.sync.get("blockedKeywords", function (data) {
        const blockedKeywords = data.blockedKeywords || [];
        if (!blockedKeywords.includes(keyword)) {
          blockedKeywords.push(keyword);
          chrome.storage.sync.set({ blockedKeywords }, () => {
            loadKeywords();
            chrome.runtime.sendMessage({ action: "checkTab" });
          });
          console.log(`Added keyword: ${keyword}`);
        }
      });
    }
  }

  keywordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      addKeyword();
    }
  });

  regexCheckbox.addEventListener("change", function () {
    keywordInput.setAttribute(
      "placeholder",
      regexCheckbox.checked ? "Enter regex" : "Enter keyword"
    );
    addButton.textContent = regexCheckbox.checked ? "Add Regex" : "Add Keyword";
  });

  loadKeywords();
});
