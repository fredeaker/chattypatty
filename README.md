# chattpatty

Basic vanilla HTML and JavaScript implementation of the ChatGPT API.

Production implementation here: [fredeaker.com/chattypatty/](https://fredeaker.com/chattypatty/)

# Dependencies

- [marked](https://github.com/markedjs/marked)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [bootswatch](https://github.com/thomaspark/bootswatch) / [bootstrap](https://github.com/twbs/bootstrap)

# Roadmap

- [ ] Add support for POST error message such as 429 (Too Many Requests).
- [ ] Include an option to select output type: plaintext or Markdown. See `Formatting re-enabled` mentioned [here](https://platform.openai.com/docs/guides/reasoning-best-practices#how-to-prompt-reasoning-models-effectively) and see [this guidance](https://community.openai.com/t/how-to-prevent-gpt-from-outputting-responses-in-markdown-format/961314/2) on how to add additional instructions to the prompt.
- [ ] Change debug section to a Boostrap [Modal](https://getbootstrap.com/docs/5.3/components/modal/), [Toast](https://getbootstrap.com/docs/5.3/components/toasts/), or [Tooltip](https://getbootstrap.com/docs/5.3/components/tooltips/)
