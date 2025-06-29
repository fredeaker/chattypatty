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

		this.prompt = document.getElementById("prompt");
		this.prompt_value = DOMPurify.sanitize(this.prompt.value);
		
        //console.log("prompt_value: " + this.prompt_value); // debug

		// get other DOM elements in the page for updating 
		
		this.submit = document.getElementById("submit");
		this.progress_bar = document.getElementById('progress-bar');
		this.copy = document.getElementById("copy");
		this.response = document.getElementById("response");

		// since user is entering a new prompt:
        // hide the copy button
		
		this.copy.style.display = 'none';
		
		// form_ok supports form error checking
		
		this.form_ok = true;
        this.form_errors = [];
		
		DOMPurify.sanitize();
		
		if (!this.apikey) { // no api key
			this.form_errors.push("Form error: API key is missing!\n");
			this.form_ok = false;
		}
		
		if (!this.model) { // no model
			this.form_errors.push("Form error: No model selected!\n");
			this.form_ok = false;
		}
		
		if (!this.prompt_value) { // no prompt
			this.form_errors.push("Form error: No prompt!\n");
			this.form_ok = false;
		}
	}
}

class Controller {
	constructor(view) {
		this.view = view;
        this.endpoint="https://api.openai.com/v1/responses";
		if (this.view.form_ok) {this.getResponse();}
        else {this.view.response.innerHTML = this.view.form_errors}
	}
	
	async getResponse() {
		this.view.progress_bar.style.display = "block";
		this.view.submit.style.display = "none";
		this.view.submit.disabled = true;
        this.view.prompt.disabled = true;
		this.view.response.innerHTML = "";
		
		this.response =
			await fetch(this.endpoint, { // begin fetch
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': "Bearer " + this.view.apikey
				},
				body: JSON.stringify({
					'model': this.view.model,
                    "input": this.view.prompt_value
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
		
		this.view.progress_bar.style.display = 'none';
		this.view.submit.style.display = 'block';
		this.view.copy.style.display = 'block';
		this.view.submit.disabled = false;
        this.view.prompt.disabled = false;
		
		this.response = await this.response.json();

		console.log("response:"); // debug
        console.log(this.response); // debug
        console.log(this.response.output[0].content[0].text); // debug
        
        this.content = this.response.output[0].content[0].text;
		this.view.response.insertAdjacentHTML("afterbegin", marked.parse(this.content));

        // parse Markdown response to HTML
		//this.view.response.insertAdjacentHTML("afterbegin", marked.parse(this.content));
        //this.view.response.innerHTML("afterbegin", marked.parse(this.content));

		// parse Markdown response to HTML
		//this.view.response.insertAdjacentHTML("afterbegin", marked.parse(this.oai_content));
		
		//console.log("this.response:\n" + JSON.stringify(this.response)); // debug
		//console.log("this.oai_content:\n" + this.oai_content); // debug
	}
}

function copyResponse() {
	// Get the text field
	this.response = document.getElementById("response");
    this.copy = document.getElementById("copy");

	navigator.clipboard.writeText(this.response.innerText);
    this.copy.innerHTML = "Copied!"
	this.copy.disabled = true;
    const fiveSecondTimer = setTimeout(function() {
		this.copy.innerHTML = "Copy";
		this.copy.disabled = false;
	}, 2000);
}