function submitPrompt() {
	const v = new Form(); // view
	const c = new Controller(v);
}

class Form { // view
	constructor() {
		this.oai_api_key = document.getElementById('oai_api_key');
		this.oai_api_key_value = DOMPurify.sanitize(this.oai_api_key.value);
		
		this.oai_api_model = document.getElementById('oai_api_model');
		this.oai_api_model_value = DOMPurify.sanitize(this.oai_api_model.value);
		
		this.oai_api_prompt = document.getElementById('oai_api_prompt');
		this.oai_api_prompt_value = this.oai_api_prompt.value;
		
		this.submit_button = document.getElementById('submit_button');
		this.progress_bar = document.getElementById('progress-bar');
		this.oai_api_response = document.getElementById('oai_api_response');
		this.debug = document.getElementById('debug');		
		this.clearDebug();
		this.form_ok = true;
		
		DOMPurify.sanitize();
		
		if (!this.oai_api_key_value) { // no api key
			this.addDebug("ERROR: No API Key.");
			this.form_ok = false;
		}
		
		if (!this.oai_api_model_value) { // no model
			this.addDebug("ERROR: No Model.");
			this.form_ok = false;
		}
		
		if (!this.oai_api_prompt_value) { // no prompt
			this.addDebug("ERROR: No prompt.");
			this.form_ok = false;
		}
	}
	
	addDebug(debugMessage) {
		const pre = document.createElement("pre");
		pre.innerHTML = debugMessage;
		this.debug.appendChild(pre);
	}

	clearDebug() {this.debug.innerHTML = "";}
}

class Controller {
	constructor(view) {
		this.view = view;
		this.oai_endpoint_url = "https://api.openai.com/v1/chat/completions";
		if (this.view.form_ok) {this.getResponse();}
	}
		
	async getResponse() {
		this.view.progress_bar.style.visibility = "visible";
		this.view.submit_button.disabled = true;
		this.oai_response =
			await fetch(this.oai_endpoint_url, { // begin fetch
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': "Bearer " + this.view.oai_api_key_value
				},
				body: JSON.stringify({
					'model': this.view.oai_api_model.value,
					'messages': [
						//{"role":"system", "content": "You are a helpful assistant."},
						{"role":"user", "content": this.view.oai_api_prompt_value}
					]
				})
			}); // end fetch
		
		this.view.progress_bar.style.visibility = "hidden";
		this.view.submit_button.disabled = false;
		
		this.oai_response = await this.oai_response.json();
		this.oai_content = this.oai_response.choices[0].message.content;
		
		this.view.oai_api_response.value = this.oai_content;
		
		console.log("this.response:\n" + JSON.stringify(this.oai_response)); // debug
	}
}