# Keyword Blocker

**Keyword Blocker** is a Chrome extension that automatically closes websites whose URLs contain one or more keywords you have blocked. It provides a simple, effective way to limit access to distracting, harmful, or unwanted content.

## Features

- Instantly closes tabs that contain blocked keywords in the URL
- Simple popup UI for entering new keywords
- Keywords persist across sessions
- One-way blocking: keywords cannot be removed once added
- Designed to discourage circumvention

## How It Works

Once installed, clicking the extension icon opens a popup:
- Enter a keyword into the textbox
- Press **Enter** or click the **Add** button
- All open tabs containing that keyword will be immediately closed
- Any new tabs opened with that keyword will auto-close

> **Note:** There is no way to remove a keyword once it’s added. This is an intentional design choice to reinforce commitment to self-blocking.

## Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/LekyDree/KeyWordBlocker.git
   cd KeyWordBlocker

2. Open Chrome and navigate to chrome://extensions

3. Enable Developer Mode (top-right)

4. Click Load unpacked, and select the folder containing this extension

## Contributing

Pull requests are welcome! Here’s how you can contribute:

1. Fork the repository  
2. Create a new branch: `git checkout -b feature-name`  
3. Make your changes  
4. Push to your fork: `git push origin feature-name`  
5. Open a pull request  

Please keep code clean and include clear comments where needed.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
