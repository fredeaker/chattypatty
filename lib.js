function submitPrompt() {
	const v = new Form(); // i.e., view
	const c = new Controller(v);
}

class Form { // view
	constructor() {
		
		// for each DOM element that will contain user input,
		// get the element and then get the user input value
		
		this.oai_api_key = document.getElementById('oai_api_key');
		this.oai_api_key_value = DOMPurify.sanitize(this.oai_api_key.value);
		
		this.oai_api_model = document.getElementById('oai_api_model');
		this.oai_api_model_value = DOMPurify.sanitize(this.oai_api_model.value);
		
		this.oai_api_prompt = document.getElementById('oai_api_prompt');
		this.oai_api_prompt_value = DOMPurify.sanitize(this.oai_api_prompt.value);
		
		this.toastContainer = document.getElementById('toast-container');
		
		this.persona_select = document.getElementById('persona_select');
		this.persona_select_value = this.persona_select.value;

		// get other DOM elements in the page for updating 
		
		this.submit_button = document.getElementById('submit_button');
		this.progress_bar = document.getElementById('progress-bar');
		this.copy_button = document.getElementById('copy_button');
		this.oai_api_response = document.getElementById('oai_api_response');
		this.debug = document.getElementById('debug');
		
		// hide the copy_response button and clear the debug element
		// since user is entering a new prompt
		
		//clearDebug();
		this.copy_button.style.display = 'none';
		
		// form_ok supports error checking
		
		this.form_ok = true;
		
		DOMPurify.sanitize();
		
		if (!this.oai_api_key_value) { // no api key
			/*this.*/ addDebug(this.toastContainer, "ERROR: No API Key.");
			this.form_ok = false;
		}
		
		if (!this.oai_api_model_value) { // no model
			/*this.*/ addDebug(this.toastContainer, "ERROR: No Model.");
			this.form_ok = false;
		}
		
		if (!this.oai_api_prompt_value) { // no prompt
			/*this.*/ addDebug(this.toastContainer, "ERROR: No prompt.");
			this.form_ok = false;
		}
	}
	
	//addDebug(debugMessage) {
	//	const pre = document.createElement("pre");
	//	pre.innerHTML = debugMessage;
	//	this.debug.appendChild(pre);
	//}

	//clearDebug() {this.debug.innerHTML = "";}
}

class Controller {
	constructor(view) {
		this.view = view;
		this.oai_endpoint_url = "https://api.openai.com/v1/chat/completions";
		if (this.view.form_ok) {this.getResponse();}
	}
	
	async getResponse() {
		this.view.progress_bar.style.display = "block";
		this.view.submit_button.style.display = "none";
		this.view.submit_button.disabled = true;
		this.view.oai_api_response.innerHTML = "";
		
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
				})
			}); // end fetch
		
		this.view.progress_bar.style.display = 'none';
		this.view.submit_button.style.display = 'block';
		this.view.copy_button.style.display = 'block';
		this.view.submit_button.disabled = false;
		
		this.oai_response = await this.oai_response.json();
		this.oai_content = this.oai_response.choices[0].message.content;
		
		// parse Markdown response to HTML
		this.view.oai_api_response.insertAdjacentHTML("afterbegin", marked.parse(this.oai_content));
		
		console.log("this.response:\n" + JSON.stringify(this.oai_response)); // debug
		console.log("this.oai_content:\n" + this.oai_content); // debug
	}
}

function copyResponse() {
	// Get the text field
	this.oai_api_response = document.getElementById("oai_api_response");

	// Select the text field
	// this.oai_api_response.select();
	// this.oai_api_response.setSelectionRange(0, 99999); // For mobile devices

	// Copy the text inside the text field
	// navigator.clipboard.writeText(this.oai_api_response.value);
	navigator.clipboard.writeText(this.oai_api_response.innerText);
	addDebug(document.getElementById('toast-container'), "Response copied.");
}

function addDebug(toastContainer, debugMessage) {
	/*
	this.debug = document.getElementById('debug');
	const pre = document.createElement("pre");
	now = new Date(Date.now()).toISOString();
	//timestamp = now.getMonth() + '/' + now.getDate() + '/' + now.getYear + ' ' + now.getHours + ':' + now.getMinutes + ':' + now.getSeconds();
	pre.innerHTML = now + ' - ' + debugMessage;
	this.debug.appendChild(pre);
	*/
	
	// create and add toast to DOM
	/* sample THML from https://getbootstrap.com/docs/5.3/components/toasts/
	<div id="tbd" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
		<div class="toast-header">
			<img src="..." class="rounded me-2" alt="...">
			<strong class="me-auto">chattypatty</strong>
			<small class="text-body-secondary">just now</small>
			<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
		</div>
		<div class="toast-body">See? Just like this.</div>
	</div>
	*/
	
	const idTimestamp = new Date(Date.now()).toISOString();
	
	// <div id="tbd" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
	
	const divToast = document.createElement("div");
	divToast.setAttribute("id", idTimestamp);
	divToast.setAttribute("class", "toast");
	divToast.setAttribute("role", "alert");
	divToast.setAttribute("aria-live", "assertive");
	divToast.setAttribute("aria-atomic", "true");
	
	// <div class="toast-header">
	
	const divToastHeader = document.createElement("div");
	divToastHeader.classList.add("toast-header");
	
	// <img src="..." class="rounded me-2" alt="...">
	// skip for now
	
	// <strong class="me-auto">chattypatty</strong>
	
	const strongToastHeader = document.createElement("strong");
	strongToastHeader.classList.add("me-auto");
	
	const nodechattypatty = document.createTextNode("chattpatty");
	strongToastHeader.appendChild(nodechattypatty);
	
	divToastHeader.appendChild(strongToastHeader);
	
	// <small class="text-body-secondary">just now</small>
	
	const smallTimestamp = document.createElement("small");
	smallTimestamp.classList.add("text-body-secondary");
	
	const nodeTimestamp = document.createTextNode(idTimestamp);
	smallTimestamp.appendChild(nodeTimestamp);	
	
	divToastHeader.appendChild(smallTimestamp);
	
	// <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
	
	const buttonToast = document.createElement("button");
	buttonToast.classList.add("btn-close");
	buttonToast.setAttribute("type", "button");
	buttonToast.setAttribute("data-bs-dismiss", "toast");
	buttonToast.setAttribute("aria-label", "Close");	
	
	divToastHeader.appendChild(buttonToast);
	
	// <div class="toast-body">See? Just like this.</div>
	
	const divToastBody = document.createElement("div");
	divToastBody.classList.add("toast-body");
	const txtDebugMsg = document.createTextNode(debugMessage);
	divToastBody.appendChild(txtDebugMsg);	
	
	// add toast to toast-container
	
	toastContainer.appendChild(divToast);
	divToast.appendChild(divToastHeader);
	divToast.appendChild(divToastBody);
	
	// trigger display via bootstrap
	
	const toastLiveExample = document.getElementById(idTimestamp);
	
	//if (toastTrigger) {
		const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
		//toastTrigger.addEventListener('click', () => {toastBootstrap.show()})
		toastBootstrap.show();
	//}
}

function clearDebug() {
	this.debug = document.getElementById('debug');
	this.debug.innerHTML = "";
}
