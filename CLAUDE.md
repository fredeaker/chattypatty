# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chattypatty is a static, single-page web app that calls the OpenAI Responses API (`https://api.openai.com/v1/responses`) directly from the browser. No build step, no server, no package manager — open `index.html` in a browser or serve it with any static file server.

## Architecture

- **`index.html`** — Single HTML page with Bootstrap 5 UI. Loads DOMPurify from `js/purify.min.js` (vendored) and marked.js from CDN.
- **`js/app.js`** — All application logic:
  - `Form` class (view): reads and sanitizes DOM inputs (API key, model, prompt, instructions, temperature, top_p, max_output_tokens), validates required fields.
  - `Controller` class: takes a `Form` instance, calls the OpenAI Responses API via streaming `fetch` (SSE), renders streamed text into a bubble then replaces with `marked.parse()` on completion.
  - Module-level `conversationId` variable tracks multi-turn conversation state via the `previous_response_id` field.
  - `submitPrompt()` — entry point called by the Submit button's `onclick`.
  - `appendMessage(role, content, isHtml)` / `appendStreamingMessage()` — build chat bubbles for `user`, `assistant`, and `error` roles.
  - `addCopyButton(bubble)` — copies rendered HTML + plain text to clipboard via `ClipboardItem`.
- **`js/purify.min.js`** — Vendored DOMPurify for XSS sanitization of user inputs.

## Key Behaviors

- **Streaming**: The API is called with `"stream": true`. Responses arrive as SSE events; `response.output_text.delta` events stream text into the bubble, and `response.completed` captures the `response.id` for conversation continuity.
- **Conversation mode**: Enabled by default. When active, `previous_response_id` is sent on each turn so the API maintains context. `newConversation()` resets `conversationId` to `null`.
- **API key persistence**: Stored in `localStorage` under `chattypatty_apikey`. On load, if present, the key is restored and the settings panel stays collapsed.
- **Error handling**: Network errors and HTTP errors (with JSON body from the API) are both caught and displayed as `message-error` bubbles.
- The commented-out `messages` block in `Controller.getResponse()` shows a previous Chat Completions-style payload; keep it for reference.
- All user-supplied values are sanitized with `DOMPurify.sanitize()` before use.
- The model selector in `index.html` currently has `gpt-5.4` as an option; new models are added as `<option>` elements there.

## Roadmap (from README)

- Add cookies to store parameters between sessions.
