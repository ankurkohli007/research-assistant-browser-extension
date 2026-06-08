# 🔬 Research Assistant Pro: AI-Powered Browser Extension with Spring Boot & Gemini AI

> **Summarise. Cite. Bookmark. Organise.** A production grade, fullstack AI research tool built as a Chrome Extension with a reactive Spring Boot backend powered by Google Gemini, designed to supercharge how developers, researchers, and knowledge workers consume information on the web.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

**Research Assistant Pro** is a fullstack AI-powered Chrome Extension that transforms how you research on the web. Highlight any text on any webpage, and instantly get an AI generated summary, ask contextual follow up questions, generate formatted academic citations, bookmark sections with deep link anchors, and export your entire research workspace, all without leaving your browser.

The backend is a reactive REST API built with **Spring Boot + WebFlux**, integrating **Google Gemini AI** for natural language understanding. The frontend is a polished Chrome Side Panel Extension built in JavaScript with a premium SaaS grade UI.

This project demonstrates end-to-end ownership: UI/UX design, Chrome Extension APIs, reactive backend architecture, AI integration, and production quality code organisation.

---

## Live Demo
 
> 📹 Demo video attached — see in action: text summarisation, multi-turn follow-up chat, citation builder, section deep-linking, and workspace export.

<p align="center">
  <img width="900" height="600" src="https://github.com/ankurkohli007/research-assistant-browser-extension/blob/f3ae6242e1b5b15563f9cf61ba00bacb200218d1/final_outcome.gif">
</p>

<p align="center">
    <em>Final Output</em>
</p> 
 
---

## Key Features

### 🤖 AI Summarisation Engine
- **Selected Text Summarisation:** highlight any text on any webpage and get an instant AI summary
- **Full Page Summarisation:** extracts main content intelligently (prefers `<article>` / `<main>`), trims to 15,000 chars at sentence boundaries
- **Natural Language Word Limit:** type *"Summarise in 75 words"* and the backend regex parser extracts the number automatically
- **Multi turn Follow up Chat:** ask contextual follow-up questions with full conversation history passed to the AI on every turn
- Conversation history is cleared automatically when a new summarisation session starts

### 📚 Advanced Citation Builder
- 4 step guided wizard UI (Source Type → Metadata → Style → Output)
- 7 source types: Journal, Book, Website, Thesis, Conference, Report, Preprint
- 5 citation styles: **APA 7th**, **IEEE**, **Chicago/Turabian**, **MLA 9th**, **Harvard**
- Export as `.bib` (BibTeX), `.txt`
- Copy to clipboard in one click

### 🔖 Smart Bookmarking System
- **Page Bookmarks:** save full page URLs with visit count tracking
- **Section Bookmarks with Deep Link Anchors:** selects the nearest heading element with an `id` from your cursor position and appends `#fragment` to the URL, so the link jumps directly to that section
- Persistent storage via Chrome Storage API

### 🗒️ Research Workspace
- Quick scratchpad for manual notes
- Saved knowledge cards with pin, expand/collapse, edit title, delete
- Pinned notes always float to top
- Per note export as `.html` or `.txt`
- Full workspace export as formatted `.html` report or plain `.txt` archive

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | JavaScript (ES2022), Chrome Extensions Manifest V3, Chrome Side Panel API |
| **Styling** | Custom CSS Design System with CSS Variables, responsive layout |
| **Backend** | Java 26, Spring Boot 4.0, Spring WebFlux (Reactive) |
| **AI Model** | Google Gemini API (`gemini-flash-latest`) |
| **HTTP Client** | Spring WebClient (non-blocking) |
| **JSON** | Jackson ObjectMapper |
| **Build** | Maven |
| **Config** | Spring application.properties + environment variable injection |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Chrome Extension (Frontend)                 │
│                                                              │
│  Side Panel UI  ──►  chrome.scripting  ──►  Active Tab DOM  │
│       │                                                      │
│  Chrome Storage API  (notes, bookmarks, sectionBookmarks)   │
│       │                                                      │
│  fetch() POST  ──►  http://localhost:8080/api/research/     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP (JSON)
┌────────────────────────────▼────────────────────────────────┐
│              Spring Boot Backend (Reactive)                  │
│                                                              │
│  ResearchController  ──►  extractWordLimit (Regex Parser)   │
│       │                                                      │
│  ResearchService                                             │
│    ├── handleSummarization()  ──►  buildSummarizationPrompt │
│    ├── handleFollowUpQuestion() ──► buildFollowUpPrompt     │
│    └── handleWebSearch()  (extensible)                       │
│       │                                                      │
│  WebClient (non-blocking)  ──►  Google Gemini API           │
│       │                                                      │
│  GeminiResponse (Jackson deserialization)                    │
│       │                                                      │
│  Plain text response  ──►  Chrome Extension                 │
└─────────────────────────────────────────────────────────────┘
```

**Why Reactive (WebFlux)?**
The backend uses Spring WebFlux and `Mono<String>` so the server never blocks a thread while waiting for Gemini's response. This keeps the extension fast and the server scalable without thread-per-request overhead.

---

## Getting Started

### Prerequisites

- Java 26
- Maven 3.8+
- Google Chrome
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/research-assistant-pro.git
cd research-assistant-pro
```

### 2. Configure the Backend

Set your Gemini API key as an environment variable:

```bash
# Linux / macOS
export GEMINI_KEY=your_api_key_here

# Windows (PowerShell)
$env:GEMINI_KEY="your_api_key_here"
```

### 3. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The server starts on `http://localhost:8080`.

### 4. Load the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository

### 5. Use It

1. Click the extension icon in Chrome toolbar — the Side Panel opens
2. Navigate to any webpage
3. Highlight text → click **Summarise Selection**
4. Or click **Summarise Full Page** for the entire article
5. Ask follow-up questions in the chat panel below
6. Use **Open Advanced Citation Builder** to generate formatted references

---

## API Reference

### `POST /api/research/process`

Single unified endpoint that routes by `operation` field.

**Request Body:**

```json
{
  "operation": "summarize | followup | search",
  "content": "Text to summarise or current summary (for followup)",
  "question": "Follow-up question (for followup only)",
  "originalSelectedText": "Full original content for context",
  "wordLimit": 100,
  "conversationHistory": [
    { "role": "user", "content": "What are the key findings?" },
    { "role": "assistant", "content": "The key findings are..." }
  ]
}
```

**Response:** `text/plain` — the AI-generated answer.

**Natural Language Word Limit:**
The controller automatically parses phrases like *"Summarise in 75 words"* from the `content` field using regex, extracts the number into `wordLimit`, and strips the phrase from the content before forwarding to the service.

---

## Project Structure

```
research-assistant-pro/
│
├── backend/
│   └── src/main/java/com/research/assistant/
│       ├── ResearchAssistantApplication.java   # Spring Boot entry point
│       ├── ResearchController.java             # REST controller + word limit parser
│       ├── ResearchService.java                # Business logic + prompt engineering
│       ├── ResearchRequest.java                # Request DTO with conversation model
│       ├── GeminiResponse.java                 # Gemini API response deserializer
│       └── WebClientConfig.java                # WebClient bean configuration
│   └── src/main/resources/
│       └── application.properties              # API URL + key config
│
└── extension/
    ├── manifest.json                           # MV3 manifest
    ├── background.js                           # Service worker (download handler)
    ├── side_panel.html                         # Extension UI shell
    ├── side_panel.css                          # Full design system
    └── side_panel.js                           # All frontend logic (~900 lines)
```

---

## Design Decisions

**Why a single `/process` endpoint?**
Rather than separate `/summarize`, `/followup`, `/search` endpoints, a single endpoint with an `operation` discriminator keeps the API surface minimal, easier to extend, and simpler for the frontend to consume.

**Why vanilla JS (no React/Vue)?**
Chrome Extensions have strict CSP rules. JS avoids build tooling complexity, keeps the extension lightweight, and demonstrates deep DOM/browser API knowledge without framework abstractions.

**Why WebFlux over Spring MVC?**
Gemini API calls are I/O bound and can take 1 to 3 seconds. WebFlux handles these with non-blocking `Mono` pipelines, keeping the server thread efficient, important if this scales to multiple users.

**Why CSS Variables design system?**
All colours, radii, shadows, and typography are tokenised in `:root`. The entire visual theme can be swapped by changing ~20 variables, production ready for white labelling or dark mode.

**Section bookmarks with `#fragment` deep-linking:**
Instead of saving just `tab.url`, the extension injects a script into the page that walks the DOM from the user's cursor (`selection.anchorNode`) upward, finds the nearest `<h1>`–`<h6>` with an `id` attribute, and appends it as a URL fragment. This creates a direct deep link to that exact section.

---

## Roadmap

- [ ] Dark mode toggle
- [ ] Real web search integration (Google Search API / Serper)
- [ ] PDF upload and summarisation
- [ ] Export citations directly to Zotero / Mendeley
- [ ] Cloud sync for notes across devices
- [ ] Highlight and annotate text directly on the page
- [ ] Support for Claude / OpenAI as alternative AI backends

---

## Author

Built with 💻 by **ANKUR KOHLI** <br>
Software Engineer | AI-Integrated Systems

---

> *If this project was useful or interesting to you, a ⭐ on GitHub goes a long way!*
