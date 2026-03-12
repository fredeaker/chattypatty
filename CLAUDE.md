# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chattypatty is a static, single-page web app that calls the OpenAI Responses API (`https://api.openai.com/v1/responses`) directly from the browser. No build step, no server, no package manager — open `index.html` in a browser or serve it with any static file server.

## Architecture

- **`index.html`** — Single HTML page with Bootstrap 5 UI. Loads DOMPurify from `js/purify.min.js` (vendored) and marked.js from CDN.
- **`js/app.js`** — All application logic. Uses a simple MVC-like pattern:
  - `Form` class (view): reads and sanitizes DOM inputs (API key, model, prompt), validates presence of all fields.
  - `Controller` class: takes a `Form` instance, calls the OpenAI Responses API via `fetch`, renders the markdown response using `marked.parse()` into the `#response` div.
  - `submitPrompt()` — entry point called by the Submit button's `onclick`.
  - `copyResponse()` — copies rendered HTML + plain text to clipboard.
- **`js/purify.min.js`** — Vendored DOMPurify for XSS sanitization of user inputs.

## Key Behaviors

- API responses are parsed via `response.output[0].content[0].text` — this path is specific to the OpenAI Responses API format (not the Chat Completions format).
- The commented-out `messages` block in `Controller.getResponse()` shows a previous Chat Completions-style payload; keep it for reference.
- All user-supplied values are sanitized with `DOMPurify.sanitize()` before use.
- The model selector in `index.html` currently has only `gpt-5.2` as an option; new models are added as `<option>` elements there.

## Roadmap (from README)

- Add support for POST error messages such as 429 (Too Many Requests).
- Add cookies to store parameters between sessions.
