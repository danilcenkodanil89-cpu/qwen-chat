# Qwen Chat

> *Your AI conversations, beautifully crafted and endlessly productive.*

![JSON](https://img.shields.io/badge/JSON-000000.svg?style=flat-square&logo=JSON&logoColor=white)  ![electronbuilder](https://img.shields.io/badge/electronbuilder-000000.svg?style=flat-square&logo=electron-builder&logoColor=white)  ![npm](https://img.shields.io/badge/npm-CB3837.svg?style=flat-square&logo=npm&logoColor=white)  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat-square&logo=JavaScript&logoColor=black)  ![Electron](https://img.shields.io/badge/Electron-47848F.svg?style=flat-square&logo=Electron&logoColor=white)  ![GitHub%20Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=flat-square&logo=GitHub-Actions&logoColor=white)  ![CSS](https://img.shields.io/badge/CSS-663399.svg?style=flat-square&logo=CSS&logoColor=white)

## Overview

Qwen Chat is an Electron-based desktop AI chat client. It brings AI-powered conversations directly to the desktop environment and pairs chat functionality with a built-in code editor for seamless technical discussions.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Features

|      | Component        | Details |
| :--- | :--------------- | :------ |
| ⚙️  | **Architecture** | Electron desktop application with AI inference routed through the Qwen API |
| 💬  | **Chat**         | Conversational AI interface with persistent session history and streaming responses |
| 🖥️  | **Editor**       | Built-in code editor for technical discussions alongside the chat interface |
| 📦  | **Distribution** | Packaged via `electron-builder` with GitHub Actions CI |

---

## Project Structure

```
└── Qwen Chat/
    ├── .github
    │   └── workflows
    ├── build
    │   ├── icon.ico
    │   └── installer-sidebar.bmp
    ├── dist
    │   ├── builder-debug.yml
    │   ├── builder-effective-config.yaml
    │   ├── Qwen Chat Setup 1.0.0.exe
    │   ├── Qwen Chat Setup 1.0.0.exe.blockmap
    │   └── win-unpacked
    ├── index.html
    ├── LICENSE
    ├── main.css
    ├── main.js
    ├── package-lock.json
    ├── package.json
    ├── preload.js
    ├── README.md
    ├── renderer.js
    └── Wallpaper.mp4
```

---

## Getting Started

### Prerequisites

- Python 3.10+ / Node.js 18+ *(depending on the stack above)*

### Installation

```sh
git clone "https://github.com/danilcenkodanil89-cpu/qwen-chat"
cd "qwen-chat"
npm install
```

### Usage

```sh
npm start
```

---

## Contributing

- [Report Issues](https://github.com/danilcenkodanil89-cpu/qwen-chat/issues)
- [Submit Pull Requests](https://github.com/danilcenkodanil89-cpu/qwen-chat/pulls)
- [Discussions](https://github.com/danilcenkodanil89-cpu/qwen-chat/discussions)

---

## License

Distributed under the [AGPL-3.0](LICENSE) license.
