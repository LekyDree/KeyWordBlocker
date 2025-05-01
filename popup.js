document.addEventListener("DOMContentLoaded", function () {
  const keywordInput = document.getElementById("keywordInput");
  const addButton = document.getElementById("addButton");
  const keywordList = document.getElementById("keywordList");
  const regexList = document.getElementById("regexList");
  const regexCheckbox = document.getElementById("regexCheckbox");
  const lockTag = "xl8m2j:";

  addButton.addEventListener("click", addKeyword);

  function loadKeywords() {
    chrome.storage.sync.get(
      ["blockedKeywords", "blockedRegex"],
      function (data) {
        const blockedKeywords = data.blockedKeywords || [];
        const blockedRegex = data.blockedRegex || [];

        const blockedKeywordTitle = document.getElementById(
          "blockedKeywordTitle"
        );
        const blockedRegexTitle = document.getElementById("blockedRegexTitle");

        keywordList.innerHTML = "";
        regexList.innerHTML = "";

        blockedKeywordTitle.style.display =
          blockedKeywords.length > 0 ? "block" : "none";
        blockedRegexTitle.style.display =
          blockedRegex.length > 0 ? "block" : "none";

        blockedKeywords.forEach((k) => addItemToList(k, false));
        blockedRegex.forEach((r) => addItemToList(r, true));
      }
    );
  }

  function addItemToList(value, isRegex) {
    const li = document.createElement("li");
    li.textContent = value.startsWith(lockTag) ? value.slice(7) : value;

    if (value.startsWith(lockTag)) {
      const buttonContainer = document.createElement("span");
      buttonContainer.style.marginLeft = "8px";

      const lockButton = document.createElement("button");
      lockButton.textContent = "Confirm";
      lockButton.classList.add("block-button", "lock-button");

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.classList.add("block-button", "remove-button");

      const storageKey = isRegex ? "blockedRegex" : "blockedKeywords";

      lockButton.onclick = () => {
        buttonContainer.remove();
        chrome.storage.sync.get(storageKey, function (data) {
          const blockList = data[storageKey] || [];
          const updatedList = blockList.map((v) =>
            v === value ? `${value.slice(7)}` : v
          );
          chrome.storage.sync.set({ [storageKey]: updatedList });
          chrome.runtime.sendMessage({ action: "checkTab" });
        });
      };

      removeButton.onclick = () => {
        chrome.storage.sync.get(storageKey, function (data) {
          const blockList = data[storageKey] || [];
          const updatedList = blockList.filter((v) => v !== value);
          chrome.storage.sync.set({ [storageKey]: updatedList }, loadKeywords);
          chrome.runtime.sendMessage({ action: "checkTab" });
        });
      };

      buttonContainer.appendChild(lockButton);
      buttonContainer.appendChild(removeButton);
      li.appendChild(buttonContainer);
    }

    if (isRegex) {
      regexList.appendChild(li);
    } else {
      keywordList.appendChild(li);
    }
  }

  function addKeyword() {
    const keyword = keywordInput.value.trim();
    const useRegex = regexCheckbox.checked;

    if (!keyword) return;

    const regexError = document.getElementById("regexError");

    if (useRegex) {
      try {
        new RegExp(keyword);
        regexError.style.display = "none";
      } catch (e) {
        regexError.style.display = "block";
        return;
      }
    } else {
      regexError.style.display = "none";
    }

    const storageKey = useRegex ? "blockedRegex" : "blockedKeywords";

    keywordInput.value = "";

    chrome.storage.sync.get(storageKey, function (data) {
      const blockedList = data[storageKey] || [];
      if (
        !blockedList.includes(keyword) &&
        !blockedList.includes(lockTag + keyword)
      ) {
        blockedList.push(lockTag + keyword);
        chrome.storage.sync.set({ [storageKey]: blockedList }, () => {
          loadKeywords();
          chrome.runtime.sendMessage({ action: "checkTab" });
        });
        console.log(`Added regex: ${keyword}`);
      }
    });
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
