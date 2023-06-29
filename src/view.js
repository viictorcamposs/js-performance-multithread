export default class View {
  #file = document.querySelector("#csv-file");
  #fileSize = document.querySelector("#file-size");
  #form = document.querySelector("#form");
  #progress = document.querySelector("#progress");
  #debug = document.querySelector("#debug");
  #worker = document.querySelector("#worker");

  setFileSize(size) {
    this.#fileSize.innerText = `File size: ${size}\n`;
  }

  configureOnFileChange(fn) {
    this.#file.addEventListener("change", (event) => {
      fn(event.target.files[0]);
    });
  }

  configureOnFormSubmit(fn) {
    this.#form.reset();

    this.#form.addEventListener("submit", (event) => {
      event.preventDefault();

      const file = this.#file.files[0];

      if (!file) {
        alert("Please select a file in order for this to work.");
        return;
      }

      this.updateDebugLog("");

      const form = new FormData(event.currentTarget);
      const description = form.get("description");

      fn({ description, file });
    });
  }

  updateDebugLog(text, reset = true) {
    if (reset) {
      this.#debug.innerText = text;
      return;
    }

    this.#debug.innerText += text;
  }

  updateProgress(value) {
    this.#progress.value = value;
  }

  isWorkerThreadEnabled() {
    return this.#worker.checked;
  }
}
