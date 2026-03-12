let conversationId = null;

function saveApiKey() {
	const key = document.getElementById('apikey').value.trim();
	if (!key) return;
	localStorage.setItem('chattypatty_apikey', key);
	document.getElementById('apikey-entry').style.display = 'none';
	document.getElementById('apikey-set').style.display = 'block';
	bootstrap.Collapse.getOrCreateInstance(document.getElementById('settings-panel')).hide();
}

function changeApiKey(e) {
	e.preventDefault();
	document.getElementById('apikey-set').style.display = 'none';
	document.getElementById('apikey-entry').style.display = 'block';
	document.getElementById('apikey').focus();
}

document.addEventListener('DOMContentLoaded', () => {
	const savedKey = localStorage.getItem('chattypatty_apikey');
	if (savedKey) {
		document.getElementById('apikey').value = savedKey;
		document.getElementById('apikey-entry').style.display = 'none';
		document.getElementById('apikey-set').style.display = 'block';
	} else {
		document.getElementById('settings-panel').classList.add('show');
	}
	appendMessage('assistant', "Let's talk!");
});

function appendMessage(role, content, isHtml = false) {
	const responseDiv = document.getElementById('response');
	const msg = document.createElement('div');
	msg.className = `message message-${role} mb-3`;
	const label = document.createElement('div');
	label.className = 'message-label';
	label.textContent = role === 'user' ? 'You' : role === 'assistant' ? 'chattypatty' : '';
	const bubble = document.createElement('div');
	bubble.className = 'bubble';
	if (isHtml) {
		bubble.innerHTML = content;
	} else {
		bubble.textContent = content;
	}
	msg.appendChild(label);
	msg.appendChild(bubble);
	responseDiv.appendChild(msg);
	if (role === 'assistant') addCopyButton(bubble);
	scrollChatToBottom();
}

function addCopyButton(bubble) {
	const btn = document.createElement('button');
	btn.className = 'btn btn-link btn-sm text-muted p-0 mt-1';
	btn.textContent = 'Copy';
	btn.onclick = () => {
		const item = new ClipboardItem({
			"text/html": new Blob([bubble.innerHTML], { type: "text/html" }),
			"text/plain": new Blob([bubble.innerText], { type: "text/plain" })
		});
		navigator.clipboard.write([item])
			.then(() => {
				btn.textContent = 'Copied!';
				setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
			})
			.catch(() => {
				btn.textContent = 'Failed';
				setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
			});
	};
	bubble.parentElement.appendChild(btn);
}

function scrollChatToBottom() {
	const chatArea = document.getElementById('chat-area');
	chatArea.scrollTop = chatArea.scrollHeight;
}

function appendStreamingMessage() {
	const responseDiv = document.getElementById('response');
	const msg = document.createElement('div');
	msg.className = 'message message-assistant mb-3';
	const label = document.createElement('div');
	label.className = 'message-label';
	label.textContent = 'chattypatty';
	const bubble = document.createElement('div');
	bubble.className = 'bubble streaming-cursor';
	msg.appendChild(label);
	msg.appendChild(bubble);
	responseDiv.appendChild(msg);
	scrollChatToBottom();
	return bubble;
}

function toggleConversationMode(checkbox) {
	if (checkbox.checked) {
		document.getElementById('response').innerHTML = '';
		appendMessage('assistant', "Let's talk!");
		document.getElementById('copy').style.display = 'none';
	} else {
		conversationId = null;
		document.getElementById('response').innerHTML = '';
		document.getElementById('new-conversation').style.display = 'none';
		document.getElementById('copy').style.display = 'none';
	}
}

function newConversation() {
	conversationId = null;
	document.getElementById('response').innerHTML = '';
	appendMessage('assistant', "Let's talk!");
	document.getElementById('copy').style.display = 'none';
	document.getElementById('new-conversation').style.display = 'none';
}

function submitPrompt() {
	//console.log("submitPrompt()"); // debug
	const v = new Form(); // i.e., view
	const c = new Controller(v);
}

class Form { // view
	constructor() {
		///console.log("Form.constructor()"); // debug

		// for each DOM element that will contain user input,
		// get the element and then get the user input value

		this.apikey = DOMPurify.sanitize(document.getElementById("apikey").value);

		//console.log("apikey: " + this.apikey); // debug

		this.model = DOMPurify.sanitize(document.getElementById("model").value);

		//console.log("model: " + this.model); // debug

		this.conversation_mode = document.getElementById("conversation-mode").checked;
		this.instructions = DOMPurify.sanitize(document.getElementById("instructions").value);
		this.temperature = parseFloat(document.getElementById("temperature").value);
		this.top_p = parseFloat(document.getElementById("top_p").value);
		const max_tokens_raw = document.getElementById("max_output_tokens").value;
		this.max_output_tokens = max_tokens_raw ? parseInt(max_tokens_raw) : null;

		this.prompt = document.getElementById("prompt");
		this.prompt_value = DOMPurify.sanitize(this.prompt.value);

		//console.log("prompt_value: " + this.prompt_value); // debug

		// get other DOM elements in the page for updating

		this.submit = document.getElementById("submit");
		this.progress_bar = document.getElementById('progress-bar');
		this.response = document.getElementById("response");

		// form_ok supports form error checking

		this.form_ok = true;
		this.form_errors = [];

		DOMPurify.sanitize();

		if (!this.apikey) { // no api key
			this.form_errors.push("Form error: API key is missing!");
			this.form_ok = false;
		}

		if (!this.model) { // no model
			this.form_errors.push("Form error: No model selected!");
			this.form_ok = false;
		}

		if (!this.prompt_value) { // no prompt
			this.form_errors.push("Form error: No prompt!");
			this.form_ok = false;
		}
	}
}

class Controller {
	constructor(view) {
		this.view = view;
		this.endpoint = "https://api.openai.com/v1/responses";
		if (this.view.form_ok) { this.getResponse(); }
		else { appendMessage('error', this.view.form_errors.join(' ')); }
	}

	async getResponse() {
		this.view.progress_bar.style.display = "block";
		this.view.submit.style.display = "none";
		this.view.submit.disabled = true;
		this.view.prompt.disabled = true;

		if (!this.view.conversation_mode) {
			this.view.response.innerHTML = "";
		}

		// show user message immediately and clear the input
		appendMessage('user', this.view.prompt_value);
		this.view.prompt.value = '';

		let httpResponse;
		try {
			httpResponse =
				await fetch(this.endpoint, { // begin fetch
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': "Bearer " + this.view.apikey
					},
					body: JSON.stringify({
						'model': this.view.model,
						"input": this.view.prompt_value,
						"stream": true,
						...(this.view.instructions && { "instructions": this.view.instructions }),
						"temperature": this.view.temperature,
						"top_p": this.view.top_p,
						...(this.view.max_output_tokens && { "max_output_tokens": this.view.max_output_tokens }),
						...(this.view.conversation_mode && conversationId && { "previous_response_id": conversationId })
						/*
						'messages': [
							{
								"role":"developer",
								"content": [
									{
										"type": "text",
										"text": this.view.persona_select_value
									}]
							},
							{
								"role": "user",
								"content": [
									{
										"type": "text",
										"text": this.view.oai_api_prompt_value
									}
								]
							}
						]
						*/
					})
				}); // end fetch
		} catch (err) {
			this.view.progress_bar.style.display = 'none';
			this.view.submit.style.display = 'block';
			this.view.submit.disabled = false;
			this.view.prompt.disabled = false;
			appendMessage('error', "Network error: " + err.message);
			return;
		}

		// HTTP errors return a JSON body, not a stream
		if (!httpResponse.ok) {
			this.view.progress_bar.style.display = 'none';
			this.view.submit.style.display = 'block';
			this.view.submit.disabled = false;
			this.view.prompt.disabled = false;
			const data = await httpResponse.json();
			const errorMsg = (data.error && data.error.message) ? data.error.message : "HTTP " + httpResponse.status;
			appendMessage('error', "Error " + httpResponse.status + ": " + errorMsg);
			return;
		}

		// Create the assistant bubble and start streaming into it
		const bubble = appendStreamingMessage();
		this.view.progress_bar.style.display = 'none';

		const reader = httpResponse.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		let fullText = '';

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				// process all complete SSE lines
				const lines = buffer.split('\n');
				buffer = lines.pop(); // retain any incomplete trailing line

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;
					const jsonStr = line.slice(6).trim();
					if (!jsonStr || jsonStr === '[DONE]') continue;
					let event;
					try { event = JSON.parse(jsonStr); } catch (e) { continue; }

					if (event.type === 'response.output_text.delta') {
						fullText += event.delta;
						bubble.appendChild(document.createTextNode(event.delta));
						scrollChatToBottom();
					} else if (event.type === 'response.completed') {
						if (this.view.conversation_mode) {
							conversationId = event.response.id;
							document.getElementById('new-conversation').style.display = 'block';
						}
					}
				}
			}
		} finally {
			this.view.submit.style.display = 'block';
			this.view.submit.disabled = false;
			this.view.prompt.disabled = false;
		}

		// Replace streamed plain text with rendered markdown
		bubble.classList.remove('streaming-cursor');
		bubble.innerHTML = marked.parse(fullText);
		addCopyButton(bubble);
		scrollChatToBottom();
	}
}

